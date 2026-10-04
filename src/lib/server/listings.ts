import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { checkOnsite } from "@/lib/areas";
import type { Listing } from "@/lib/types";
import { mapListing, type ListingRow } from "./mappers";

const captureInput = z.object({
  photoUrl: z.string().trim().min(1).max(500),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  accuracyM: z.number().min(0).max(100000),
  capturedAt: z.string().min(1).max(50),
});

const listingInput = z.object({
  title: z.string().trim().min(4).max(120),
  area: z.string().trim().min(2).max(60),
  yearlyRent: z.coerce.number().int().positive().max(1_000_000_000),
  agencyFee: z.coerce.number().nonnegative().optional().default(0),
  legalFee: z.coerce.number().nonnegative().optional().default(0),
  cautionFee: z.coerce.number().nonnegative().optional().default(0),
  serviceCharge: z.coerce.number().nonnegative().optional().default(0),
  bedrooms: z.coerce.number().int().min(1).max(12),
  bathrooms: z.coerce.number().int().min(1).max(12),
  description: z.string().trim().max(2000).optional().default(""),
  photoUrls: z.array(z.string().trim().min(1)).min(1).max(6),
  verificationVideoUrl: z.string().trim().max(500).optional().nullable().default(null),
  proofIdChecked: z.boolean(),
  proofOwnershipSeen: z.boolean(),
  proofOwnerPhone: z.boolean(),
  onsiteCapture: captureInput.nullable().optional().default(null),
});

const publicQuery = z.object({
  slug: z.string().trim().min(1),
  hideUnverified: z.boolean().optional().default(false),
});

export const listPublicListings = createServerFn({ method: "GET" })
  .validator((input: unknown) => publicQuery.parse(input))
  .handler(async ({ data }): Promise<Listing[]> => {
    const sql = await getSql();
    const rows = await sql<ListingRow>`
      select l.id, l.user_id, l.title, l.area, l.yearly_rent, l.agency_fee, l.legal_fee, l.caution_fee, l.service_charge,
             l.bedrooms, l.bathrooms, l.description, l.photo_url, l.photo_urls, l.verification_video_url, l.onsite_captured_at,
             l.proof_id_checked, l.proof_ownership_seen, l.proof_onsite_visit, l.proof_owner_phone, l.created_at
      from listings l
      join agents a on a.user_id = l.user_id
      where a.slug = ${data.slug}
      order by l.created_at desc
    `;
    const listings = rows.map(mapListing);
    return data.hideUnverified ? listings.filter((l) => l.trust !== "unverified") : listings;
  });

export const getPublicListing = createServerFn({ method: "GET" })
  .validator((input: unknown) =>
    z.object({ slug: z.string().trim().min(1), listingId: z.coerce.number().int().positive() }).parse(input),
  )
  .handler(async ({ data }): Promise<Listing | null> => {
    const sql = await getSql();
    const rows = await sql<ListingRow>`
      select l.id, l.user_id, l.title, l.area, l.yearly_rent, l.agency_fee, l.legal_fee, l.caution_fee, l.service_charge,
             l.bedrooms, l.bathrooms, l.description, l.photo_url, l.photo_urls, l.verification_video_url, l.onsite_captured_at,
             l.proof_id_checked, l.proof_ownership_seen, l.proof_onsite_visit, l.proof_owner_phone, l.created_at
      from listings l
      join agents a on a.user_id = l.user_id
      where a.slug = ${data.slug} and l.id = ${data.listingId}
      limit 1
    `;
    return rows[0] ? mapListing(rows[0]) : null;
  });

export const listMyListings = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<Listing[]> => {
    const sql = await getSql();
    const rows = await sql<ListingRow>`
      select id, user_id, title, area, yearly_rent, agency_fee, legal_fee, caution_fee, service_charge,
             bedrooms, bathrooms, description, photo_url, photo_urls, verification_video_url, onsite_captured_at,
             proof_id_checked, proof_ownership_seen, proof_onsite_visit, proof_owner_phone, created_at
      from listings
      where user_id = ${context.userId}
      order by created_at desc
    `;
    return rows.map(mapListing);
  });

export const getMyListing = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((id: number) => id)
  .handler(async ({ context, data: id }): Promise<Listing | null> => {
    const sql = await getSql();
    const rows = await sql<ListingRow>`
      select id, user_id, title, area, yearly_rent, agency_fee, legal_fee, caution_fee, service_charge,
             bedrooms, bathrooms, description, photo_url, photo_urls, verification_video_url, onsite_captured_at,
             proof_id_checked, proof_ownership_seen, proof_onsite_visit, proof_owner_phone, created_at
      from listings
      where id = ${id} and user_id = ${context.userId}
      limit 1
    `;
    return rows[0] ? mapListing(rows[0]) : null;
  });

export const createListing = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => listingInput.parse(input))
  .handler(async ({ context, data }): Promise<Listing> => {
    const sql = await getSql();
    const cap = data.onsiteCapture;
    const onsiteOk = cap ? checkOnsite(data.area, cap).ok : false;
    const rows = await sql<ListingRow>`
      insert into listings (
        user_id, title, area, yearly_rent, agency_fee, legal_fee, caution_fee, service_charge,
        bedrooms, bathrooms, description, photo_url, photo_urls,
        verification_video_url, proof_id_checked, proof_ownership_seen, proof_onsite_visit, proof_owner_phone,
        onsite_photo_url, onsite_lat, onsite_lng, onsite_accuracy_m, onsite_captured_at
      ) values (
        ${context.userId}, ${data.title}, ${data.area}, ${data.yearlyRent},
        ${data.agencyFee ?? 0}, ${data.legalFee ?? 0}, ${data.cautionFee ?? 0}, ${data.serviceCharge ?? 0},
        ${data.bedrooms}, ${data.bathrooms}, ${data.description}, ${data.photoUrls[0]}, ${data.photoUrls},
        ${data.verificationVideoUrl}, ${data.proofIdChecked}, ${data.proofOwnershipSeen}, ${onsiteOk}, ${data.proofOwnerPhone},
        ${cap?.photoUrl ?? null}, ${cap?.lat ?? null}, ${cap?.lng ?? null}, ${cap?.accuracyM ?? null}, ${cap?.capturedAt ?? null}
      )
      returning
        id, user_id, title, area, yearly_rent, agency_fee, legal_fee, caution_fee, service_charge,
        bedrooms, bathrooms, description, photo_url, photo_urls, verification_video_url, onsite_captured_at,
        proof_id_checked, proof_ownership_seen, proof_onsite_visit, proof_owner_phone, created_at
    `;
    return mapListing(rows[0]);
  });

export const updateListing = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => listingInput.extend({ id: z.coerce.number().int().positive() }).parse(input))
  .handler(async ({ context, data }): Promise<Listing | null> => {
    const sql = await getSql();

    let cap = data.onsiteCapture;
    if (!cap) {
      const prev = await sql<{
        onsite_photo_url: string | null;
        onsite_lat: number | null;
        onsite_lng: number | null;
        onsite_accuracy_m: number | null;
        onsite_captured_at: string | Date | null;
      }>`
        select onsite_photo_url, onsite_lat, onsite_lng, onsite_accuracy_m, onsite_captured_at
        from listings where id = ${data.id} and user_id = ${context.userId} limit 1
      `;
      const p = prev[0];
      if (p && p.onsite_lat != null && p.onsite_lng != null && p.onsite_captured_at) {
        cap = {
          photoUrl: p.onsite_photo_url ?? "",
          lat: Number(p.onsite_lat),
          lng: Number(p.onsite_lng),
          accuracyM: Number(p.onsite_accuracy_m ?? 0),
          capturedAt: new Date(p.onsite_captured_at).toISOString(),
        };
      }
    }
    const onsiteOk = cap
      ? checkOnsite(data.area, { ...cap, capturedAt: data.onsiteCapture ? cap.capturedAt : new Date().toISOString() }).ok
      : false;

    const rows = await sql<ListingRow>`
      update listings set
        title = ${data.title},
        area = ${data.area},
        yearly_rent = ${data.yearlyRent},
        agency_fee = ${data.agencyFee ?? 0},
        legal_fee = ${data.legalFee ?? 0},
        caution_fee = ${data.cautionFee ?? 0},
        service_charge = ${data.serviceCharge ?? 0},
        bedrooms = ${data.bedrooms},
        bathrooms = ${data.bathrooms},
        description = ${data.description},
        photo_url = ${data.photoUrls[0]},
        photo_urls = ${data.photoUrls},
        verification_video_url = ${data.verificationVideoUrl},
        proof_id_checked = ${data.proofIdChecked},
        proof_ownership_seen = ${data.proofOwnershipSeen},
        proof_onsite_visit = ${onsiteOk},
        proof_owner_phone = ${data.proofOwnerPhone},
        onsite_photo_url = ${cap?.photoUrl ?? null},
        onsite_lat = ${cap?.lat ?? null},
        onsite_lng = ${cap?.lng ?? null},
        onsite_accuracy_m = ${cap?.accuracyM ?? null},
        onsite_captured_at = ${cap?.capturedAt ?? null}
      where id = ${data.id} and user_id = ${context.userId}
      returning
        id, user_id, title, area, yearly_rent, agency_fee, legal_fee, caution_fee, service_charge,
        bedrooms, bathrooms, description, photo_url, photo_urls, verification_video_url, onsite_captured_at,
        proof_id_checked, proof_ownership_seen, proof_onsite_visit, proof_owner_phone, created_at
    `;
    return rows[0] ? mapListing(rows[0]) : null;
  });

export const deleteListing = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: number) => id)
  .handler(async ({ context, data: id }): Promise<{ ok: boolean }> => {
    const sql = await getSql();
    await sql`delete from listings where id = ${id} and user_id = ${context.userId}`;
    return { ok: true };
  });
