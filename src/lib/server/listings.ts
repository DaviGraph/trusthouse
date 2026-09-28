import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import type { Listing } from "@/lib/types";
import { mapListing, type ListingRow } from "./mappers";

const listingInput = z.object({
  title: z.string().trim().min(4).max(120),
  area: z.string().trim().min(2).max(60),
  yearlyRent: z.coerce.number().int().positive().max(1_000_000_000),
  bedrooms: z.coerce.number().int().min(1).max(12),
  bathrooms: z.coerce.number().int().min(1).max(12),
  description: z.string().trim().max(2000).optional().default(""),
  photoUrl: z.string().trim().min(1).max(2_800_000),
  proofIdChecked: z.boolean(),
  proofOwnershipSeen: z.boolean(),
  proofOnsiteVisit: z.boolean(),
  proofOwnerPhone: z.boolean(),
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
      select l.id, l.user_id, l.title, l.area, l.yearly_rent, l.bedrooms, l.bathrooms,
             l.description, l.photo_url, l.proof_id_checked, l.proof_ownership_seen,
             l.proof_onsite_visit, l.proof_owner_phone, l.created_at
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
      select l.id, l.user_id, l.title, l.area, l.yearly_rent, l.bedrooms, l.bathrooms,
             l.description, l.photo_url, l.proof_id_checked, l.proof_ownership_seen,
             l.proof_onsite_visit, l.proof_owner_phone, l.created_at
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
      select id, user_id, title, area, yearly_rent, bedrooms, bathrooms, description,
             photo_url, proof_id_checked, proof_ownership_seen, proof_onsite_visit,
             proof_owner_phone, created_at
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
      select id, user_id, title, area, yearly_rent, bedrooms, bathrooms, description,
             photo_url, proof_id_checked, proof_ownership_seen, proof_onsite_visit,
             proof_owner_phone, created_at
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
    const rows = await sql<ListingRow>`
      insert into listings (
        user_id, title, area, yearly_rent, bedrooms, bathrooms, description, photo_url,
        proof_id_checked, proof_ownership_seen, proof_onsite_visit, proof_owner_phone
      ) values (
        ${context.userId}, ${data.title}, ${data.area}, ${data.yearlyRent}, ${data.bedrooms},
        ${data.bathrooms}, ${data.description}, ${data.photoUrl},
        ${data.proofIdChecked}, ${data.proofOwnershipSeen}, ${data.proofOnsiteVisit}, ${data.proofOwnerPhone}
      )
      returning id, user_id, title, area, yearly_rent, bedrooms, bathrooms, description,
                photo_url, proof_id_checked, proof_ownership_seen, proof_onsite_visit,
                proof_owner_phone, created_at
    `;
    return mapListing(rows[0]);
  });

export const updateListing = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => listingInput.extend({ id: z.coerce.number().int().positive() }).parse(input))
  .handler(async ({ context, data }): Promise<Listing | null> => {
    const sql = await getSql();
    const rows = await sql<ListingRow>`
      update listings set
        title = ${data.title},
        area = ${data.area},
        yearly_rent = ${data.yearlyRent},
        bedrooms = ${data.bedrooms},
        bathrooms = ${data.bathrooms},
        description = ${data.description},
        photo_url = ${data.photoUrl},
        proof_id_checked = ${data.proofIdChecked},
        proof_ownership_seen = ${data.proofOwnershipSeen},
        proof_onsite_visit = ${data.proofOnsiteVisit},
        proof_owner_phone = ${data.proofOwnerPhone}
      where id = ${data.id} and user_id = ${context.userId}
      returning id, user_id, title, area, yearly_rent, bedrooms, bathrooms, description,
                photo_url, proof_id_checked, proof_ownership_seen, proof_onsite_visit,
                proof_owner_phone, created_at
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
