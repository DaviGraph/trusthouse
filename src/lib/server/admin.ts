import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import {
  sendAgentSuspensionEmail,
  sendClientReviewEmail,
  sendIdVerificationEmail,
  sendListingFeaturedEmail,
  sendListingStatusEmail,
} from "@/lib/server/email";
import type {
  AdminAgentItem,
  AdminOverviewStats,
  ClientReview,
  IdVerificationStatus,
  Listing,
  Inquiry,
  ReviewStatus,
} from "@/lib/types";

// Helper to determine trust level
function getTrustLevel(proofs: {
  proof_id_checked: boolean;
  proof_ownership_seen: boolean;
  proof_onsite_visit: boolean;
  proof_owner_phone: boolean;
}): "verified" | "partial" | "unverified" {
  const count =
    (proofs.proof_id_checked ? 1 : 0) +
    (proofs.proof_ownership_seen ? 1 : 0) +
    (proofs.proof_onsite_visit ? 1 : 0) +
    (proofs.proof_owner_phone ? 1 : 0);
  if (count >= 3) return "verified";
  if (count >= 1) return "partial";
  return "unverified";
}

// 1. Overview metrics
export const getAdminOverview = createServerFn({ method: "GET" }).handler(
  async (): Promise<{
    stats: AdminOverviewStats;
    recentIdQueue: AdminAgentItem[];
    recentListings: Listing[];
    recentReviews: ClientReview[];
  }> => {
    const sql = await getSql();

    const [agentStats] = await sql<{
      total_agents: number;
      verified_agents: number;
      pending_id_reviews: number;
    }>`
      select
        count(*)::int as total_agents,
        count(*) filter (where id_verification_status = 'verified')::int as verified_agents,
        count(*) filter (where id_verification_status = 'pending_review')::int as pending_id_reviews
      from agents
    `;

    const [listingStats] = await sql<{ total_listings: number }>`
      select count(*)::int as total_listings from listings
    `;

    const [inquiryStats] = await sql<{ total_inquiries: number }>`
      select count(*)::int as total_inquiries from inquiries
    `;

    const [reviewStats] = await sql<{ total_reviews: number; avg_rating: number }>`
      select
        count(*)::int as total_reviews,
        coalesce(round(avg(rating)::numeric, 1), 5.0)::float as avg_rating
      from reviews
      where status = 'published'
    `;

    // Recent ID review queue
    const idQueueRows = await sql`
      select
        a.user_id, a.slug, a.display_name, a.phone, a.bio, a.avatar_url,
        a.id_document_url, a.id_verification_status, a.id_rejection_reason,
        a.id_reviewed_at, a.is_suspended, a.admin_role, a.created_at,
        coalesce(l.cnt, 0)::int as listings_count,
        coalesce(i.cnt, 0)::int as leads_count,
        coalesce(r.cnt, 0)::int as reviews_count,
        coalesce(r.avg_r, 5.0)::float as avg_rating
      from agents a
      left join (select user_id, count(*) as cnt from listings group by user_id) l on l.user_id = a.user_id
      left join (select agent_user_id, count(*) as cnt from inquiries group by agent_user_id) i on i.agent_user_id = a.user_id
      left join (select agent_user_id, count(*) as cnt, round(avg(rating)::numeric, 1) as avg_r from reviews where status = 'published' group by agent_user_id) r on r.agent_user_id = a.user_id
      where a.id_verification_status = 'pending_review' or a.id_document_url is not null
      order by (case when a.id_verification_status = 'pending_review' then 0 else 1 end), a.created_at desc
      limit 4
    `;

    const recentIdQueue: AdminAgentItem[] = idQueueRows.map((r: any) => ({
      userId: r.user_id,
      slug: r.slug,
      displayName: r.display_name,
      phone: r.phone ?? "",
      bio: r.bio ?? "",
      avatarUrl: r.avatar_url ?? null,
      idDocumentUrl: r.id_document_url ?? null,
      idVerificationStatus: (r.id_verification_status as IdVerificationStatus) ?? "not_submitted",
      idRejectionReason: r.id_rejection_reason ?? null,
      idReviewedAt: r.id_reviewed_at ? new Date(r.id_reviewed_at).toISOString() : null,
      isSuspended: Boolean(r.is_suspended),
      adminRole: r.admin_role ?? "agent",
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      listingsCount: Number(r.listings_count) || 0,
      leadsCount: Number(r.leads_count) || 0,
      reviewsCount: Number(r.reviews_count) || 0,
      avgRating: Number(r.avg_rating) || 5.0,
    }));

    // Recent listings
    const listingRows = await sql`
      select
        l.id, l.user_id, l.title, l.area, l.yearly_rent, l.bedrooms, l.bathrooms,
        l.description, l.photo_url, l.photo_urls, l.verification_video_url,
        l.onsite_captured_at, l.created_at, l.proof_id_checked, l.proof_ownership_seen,
        l.proof_onsite_visit, l.proof_owner_phone, l.is_featured, l.moderation_status,
        a.display_name as agent_name, a.slug as agent_slug, a.phone as agent_phone,
        a.avatar_url as agent_avatar_url, (a.id_verification_status = 'verified') as agent_verified
      from listings l
      left join agents a on a.user_id = l.user_id
      order by l.created_at desc
      limit 4
    `;

    const recentListings: Listing[] = listingRows.map((r: any) => ({
      id: r.id,
      userId: r.user_id,
      title: r.title,
      area: r.area,
      yearlyRent: Number(r.yearly_rent),
      bedrooms: Number(r.bedrooms),
      bathrooms: Number(r.bathrooms),
      description: r.description ?? "",
      photoUrl: r.photo_url,
      photoUrls: Array.isArray(r.photo_urls) ? r.photo_urls : [],
      verificationVideoUrl: r.verification_video_url ?? null,
      onsiteCapturedAt: r.onsite_captured_at ? new Date(r.onsite_captured_at).toISOString() : null,
      createdAt: new Date(r.created_at).toISOString(),
      proofIdChecked: Boolean(r.proof_id_checked),
      proofOwnershipSeen: Boolean(r.proof_ownership_seen),
      proofOnsiteVisit: Boolean(r.proof_onsite_visit),
      proofOwnerPhone: Boolean(r.proof_owner_phone),
      isFeatured: Boolean(r.is_featured),
      moderationStatus: r.moderation_status ?? "approved",
      trust: getTrustLevel(r),
      agentName: r.agent_name ?? "Agent",
      agentSlug: r.agent_slug ?? "",
      agentPhone: r.agent_phone ?? "",
      agentAvatarUrl: r.agent_avatar_url ?? null,
      agentVerified: Boolean(r.agent_verified),
    }));

    // Recent client reviews
    const reviewRows = await sql`
      select
        r.id, r.agent_user_id, r.listing_id, r.client_name, r.client_email,
        r.client_phone, r.client_role, r.rating, r.title, r.comment, r.status,
        r.is_verified_client, r.admin_notes, r.created_at,
        a.display_name as agent_name, a.slug as agent_slug, a.avatar_url as agent_avatar_url,
        l.title as listing_title
      from reviews r
      left join agents a on a.user_id = r.agent_user_id
      left join listings l on l.id = r.listing_id
      order by r.created_at desc
      limit 4
    `;

    const recentReviews: ClientReview[] = reviewRows.map((r: any) => ({
      id: r.id,
      agentUserId: r.agent_user_id,
      agentName: r.agent_name ?? "Agent",
      agentSlug: r.agent_slug ?? "",
      agentAvatarUrl: r.agent_avatar_url ?? null,
      listingId: r.listing_id ? Number(r.listing_id) : null,
      listingTitle: r.listing_title ?? null,
      clientName: r.client_name,
      clientEmail: r.client_email ?? "",
      clientPhone: r.client_phone ?? "",
      clientRole: r.client_role ?? "Tenant",
      rating: Number(r.rating) || 5,
      title: r.title,
      comment: r.comment,
      status: (r.status as ReviewStatus) ?? "published",
      isVerifiedClient: Boolean(r.is_verified_client),
      adminNotes: r.admin_notes ?? "",
      createdAt: new Date(r.created_at).toISOString(),
    }));

    return {
      stats: {
        totalAgents: Number(agentStats?.total_agents) || 0,
        verifiedAgents: Number(agentStats?.verified_agents) || 0,
        pendingIdReviews: Number(agentStats?.pending_id_reviews) || 0,
        totalListings: Number(listingStats?.total_listings) || 0,
        totalInquiries: Number(inquiryStats?.total_inquiries) || 0,
        totalReviews: Number(reviewStats?.total_reviews) || 0,
        avgRating: Number(reviewStats?.avg_rating) || 5.0,
      },
      recentIdQueue,
      recentListings,
      recentReviews,
    };
  },
);

// 2. Agent List
export const getAdminAgents = createServerFn({ method: "GET" })
  .validator((input: { query?: string; status?: string } | undefined) => input ?? {})
  .handler(async ({ data }): Promise<AdminAgentItem[]> => {
    const sql = await getSql();
    const query = data?.query?.trim().toLowerCase() ?? "";
    const status = data?.status?.trim() ?? "all";

    const rows = await sql`
      select
        a.user_id, a.slug, a.display_name, a.phone, a.bio, a.avatar_url,
        a.id_document_url, a.id_verification_status, a.id_rejection_reason,
        a.id_reviewed_at, a.is_suspended, a.admin_role, a.created_at,
        coalesce(l.cnt, 0)::int as listings_count,
        coalesce(i.cnt, 0)::int as leads_count,
        coalesce(r.cnt, 0)::int as reviews_count,
        coalesce(r.avg_r, 5.0)::float as avg_rating
      from agents a
      left join (select user_id, count(*) as cnt from listings group by user_id) l on l.user_id = a.user_id
      left join (select agent_user_id, count(*) as cnt from inquiries group by agent_user_id) i on i.agent_user_id = a.user_id
      left join (select agent_user_id, count(*) as cnt, round(avg(rating)::numeric, 1) as avg_r from reviews where status = 'published' group by agent_user_id) r on r.agent_user_id = a.user_id
      where
        (${query} = '' or lower(a.display_name) like ${`%${query}%`} or lower(a.slug) like ${`%${query}%`} or a.phone like ${`%${query}%`})
        and
        (${status} = 'all' or a.id_verification_status = ${status} or (${status} = 'suspended' and a.is_suspended = true))
      order by a.created_at desc
    `;

    return rows.map((r: any) => ({
      userId: r.user_id,
      slug: r.slug,
      displayName: r.display_name,
      phone: r.phone ?? "",
      bio: r.bio ?? "",
      avatarUrl: r.avatar_url ?? null,
      idDocumentUrl: r.id_document_url ?? null,
      idVerificationStatus: (r.id_verification_status as IdVerificationStatus) ?? "not_submitted",
      idRejectionReason: r.id_rejection_reason ?? null,
      idReviewedAt: r.id_reviewed_at ? new Date(r.id_reviewed_at).toISOString() : null,
      isSuspended: Boolean(r.is_suspended),
      adminRole: r.admin_role ?? "agent",
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      listingsCount: Number(r.listings_count) || 0,
      leadsCount: Number(r.leads_count) || 0,
      reviewsCount: Number(r.reviews_count) || 0,
      avgRating: Number(r.avg_rating) || 5.0,
    }));
  });

// 3. ID Review Queue
export const getAdminIdReviews = createServerFn({ method: "GET" })
  .validator((status?: string) => status ?? "all")
  .handler(async ({ data: status }): Promise<AdminAgentItem[]> => {
    const sql = await getSql();
    const rows = await sql`
      select
        a.user_id, a.slug, a.display_name, a.phone, a.bio, a.avatar_url,
        a.id_document_url, a.id_verification_status, a.id_rejection_reason,
        a.id_reviewed_at, a.is_suspended, a.admin_role, a.created_at,
        coalesce(l.cnt, 0)::int as listings_count,
        coalesce(i.cnt, 0)::int as leads_count,
        coalesce(r.cnt, 0)::int as reviews_count,
        coalesce(r.avg_r, 5.0)::float as avg_rating
      from agents a
      left join (select user_id, count(*) as cnt from listings group by user_id) l on l.user_id = a.user_id
      left join (select agent_user_id, count(*) as cnt from inquiries group by agent_user_id) i on i.agent_user_id = a.user_id
      left join (select agent_user_id, count(*) as cnt, round(avg(rating)::numeric, 1) as avg_r from reviews where status = 'published' group by agent_user_id) r on r.agent_user_id = a.user_id
      where
        (${status} = 'all' and (a.id_document_url is not null or a.id_verification_status != 'not_submitted'))
        or (${status} != 'all' and a.id_verification_status = ${status})
      order by
        (case
          when a.id_verification_status = 'pending_review' then 0
          when a.id_verification_status = 'not_submitted' then 1
          else 2
        end),
        a.created_at desc
    `;

    return rows.map((r: any) => ({
      userId: r.user_id,
      slug: r.slug,
      displayName: r.display_name,
      phone: r.phone ?? "",
      bio: r.bio ?? "",
      avatarUrl: r.avatar_url ?? null,
      idDocumentUrl: r.id_document_url ?? null,
      idVerificationStatus: (r.id_verification_status as IdVerificationStatus) ?? "not_submitted",
      idRejectionReason: r.id_rejection_reason ?? null,
      idReviewedAt: r.id_reviewed_at ? new Date(r.id_reviewed_at).toISOString() : null,
      isSuspended: Boolean(r.is_suspended),
      adminRole: r.admin_role ?? "agent",
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      listingsCount: Number(r.listings_count) || 0,
      leadsCount: Number(r.leads_count) || 0,
      reviewsCount: Number(r.reviews_count) || 0,
      avgRating: Number(r.avg_rating) || 5.0,
    }));
  });

// 4. Update Agent ID Verification Status (Approve / Reject with feedback)
const updateAgentIdSchema = z.object({
  agentUserId: z.string().min(1),
  status: z.enum(["verified", "pending_review", "not_submitted"]),
  rejectionReason: z.string().optional().default(""),
});

export const updateAgentIdVerification = createServerFn({ method: "POST" })
  .validator((input: unknown) => updateAgentIdSchema.parse(input))
  .handler(async ({ data }): Promise<{ success: boolean; status: IdVerificationStatus }> => {
    const sql = await getSql();
    await sql`
      update agents
      set id_verification_status = ${data.status},
          id_rejection_reason = ${data.rejectionReason ?? ""},
          id_reviewed_at = now()
      where user_id = ${data.agentUserId}
    `;

    // Trigger ID verification email to agent with admin feedback
    try {
      const agentInfo = await sql<{ display_name: string; email?: string }>`
        select a.display_name, u.email
        from agents a
        left join "user" u on u.id = a.user_id
        where a.user_id = ${data.agentUserId}
        limit 1
      `;
      if (agentInfo[0] && agentInfo[0].email) {
        void sendIdVerificationEmail(
          agentInfo[0].email,
          agentInfo[0].display_name,
          data.status,
          data.rejectionReason,
        );
      }
    } catch {
      /* non-blocking email trigger */
    }

    return { success: true, status: data.status };
  });

// 5. Toggle Agent Suspension
export const toggleAgentSuspension = createServerFn({ method: "POST" })
  .validator(z.object({ agentUserId: z.string().min(1), isSuspended: z.boolean() }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    await sql`
      update agents
      set is_suspended = ${data.isSuspended}
      where user_id = ${data.agentUserId}
    `;

    // Trigger suspension notification email
    try {
      const agentInfo = await sql<{ display_name: string; email?: string }>`
        select a.display_name, u.email
        from agents a
        left join "user" u on u.id = a.user_id
        where a.user_id = ${data.agentUserId}
        limit 1
      `;
      if (agentInfo[0] && agentInfo[0].email) {
        void sendAgentSuspensionEmail(
          agentInfo[0].email,
          agentInfo[0].display_name,
          data.isSuspended,
        );
      }
    } catch {
      /* non-blocking email trigger */
    }

    return { success: true, isSuspended: data.isSuspended };
  });

// 6. Listing Overview
export const getAdminListings = createServerFn({ method: "GET" })
  .validator(
    (
      input:
        | {
            query?: string;
            area?: string;
            trust?: string;
            moderation?: string;
          }
        | undefined,
    ) => input ?? {},
  )
  .handler(async ({ data }): Promise<Listing[]> => {
    const sql = await getSql();
    const query = data?.query?.trim().toLowerCase() ?? "";
    const area = data?.area?.trim() ?? "all";
    const trust = data?.trust?.trim() ?? "all";
    const moderation = data?.moderation?.trim() ?? "all";

    const rows = await sql`
      select
        l.id, l.user_id, l.title, l.area, l.yearly_rent, l.bedrooms, l.bathrooms,
        l.description, l.photo_url, l.photo_urls, l.verification_video_url,
        l.onsite_captured_at, l.created_at, l.proof_id_checked, l.proof_ownership_seen,
        l.proof_onsite_visit, l.proof_owner_phone, l.is_featured, l.moderation_status,
        a.display_name as agent_name, a.slug as agent_slug, a.phone as agent_phone,
        a.avatar_url as agent_avatar_url, (a.id_verification_status = 'verified') as agent_verified
      from listings l
      left join agents a on a.user_id = l.user_id
      where
        (${query} = '' or lower(l.title) like ${`%${query}%`} or lower(l.area) like ${`%${query}%`} or lower(coalesce(a.display_name, '')) like ${`%${query}%`})
        and (${area} = 'all' or lower(l.area) = lower(${area}))
        and (${moderation} = 'all' or l.moderation_status = ${moderation})
      order by l.created_at desc
    `;

    const mapped: Listing[] = rows.map((r: any) => ({
      id: r.id,
      userId: r.user_id,
      title: r.title,
      area: r.area,
      yearlyRent: Number(r.yearly_rent),
      bedrooms: Number(r.bedrooms),
      bathrooms: Number(r.bathrooms),
      description: r.description ?? "",
      photoUrl: r.photo_url,
      photoUrls: Array.isArray(r.photo_urls) ? r.photo_urls : [],
      verificationVideoUrl: r.verification_video_url ?? null,
      onsiteCapturedAt: r.onsite_captured_at ? new Date(r.onsite_captured_at).toISOString() : null,
      createdAt: new Date(r.created_at).toISOString(),
      proofIdChecked: Boolean(r.proof_id_checked),
      proofOwnershipSeen: Boolean(r.proof_ownership_seen),
      proofOnsiteVisit: Boolean(r.proof_onsite_visit),
      proofOwnerPhone: Boolean(r.proof_owner_phone),
      isFeatured: Boolean(r.is_featured),
      moderationStatus: r.moderation_status ?? "approved",
      trust: getTrustLevel(r),
      agentName: r.agent_name ?? "Agent",
      agentSlug: r.agent_slug ?? "",
      agentPhone: r.agent_phone ?? "",
      agentAvatarUrl: r.agent_avatar_url ?? null,
      agentVerified: Boolean(r.agent_verified),
    }));

    if (trust === "all") return mapped;
    return mapped.filter((item) => item.trust === trust);
  });

// 7. Update Listing Moderation / Proofs / Featured
const updateListingSchema = z.object({
  id: z.number().int(),
  moderationStatus: z.enum(["approved", "pending", "flagged"]).optional(),
  isFeatured: z.boolean().optional(),
  proofIdChecked: z.boolean().optional(),
  proofOwnershipSeen: z.boolean().optional(),
  proofOnsiteVisit: z.boolean().optional(),
  proofOwnerPhone: z.boolean().optional(),
});

export const updateListingAdmin = createServerFn({ method: "POST" })
  .validator((input: unknown) => updateListingSchema.parse(input))
  .handler(async ({ data }) => {
    const sql = await getSql();
    await sql`
      update listings
      set
        moderation_status = coalesce(${data.moderationStatus}, moderation_status),
        is_featured = coalesce(${data.isFeatured}, is_featured),
        proof_id_checked = coalesce(${data.proofIdChecked}, proof_id_checked),
        proof_ownership_seen = coalesce(${data.proofOwnershipSeen}, proof_ownership_seen),
        proof_onsite_visit = coalesce(${data.proofOnsiteVisit}, proof_onsite_visit),
        proof_owner_phone = coalesce(${data.proofOwnerPhone}, proof_owner_phone)
      where id = ${data.id}
    `;

    // Trigger listing status and featured notification emails
    try {
      const listingInfo = await sql<{ title: string; display_name: string; email?: string }>`
        select l.title, a.display_name, u.email
        from listings l
        join agents a on a.user_id = l.user_id
        left join "user" u on u.id = a.user_id
        where l.id = ${data.id}
        limit 1
      `;
      if (listingInfo[0] && listingInfo[0].email) {
        if (data.moderationStatus) {
          void sendListingStatusEmail(
            listingInfo[0].email,
            listingInfo[0].display_name,
            listingInfo[0].title,
            data.moderationStatus,
            data.isFeatured,
          );
        }
        if (data.isFeatured) {
          void sendListingFeaturedEmail(
            listingInfo[0].email,
            listingInfo[0].display_name,
            listingInfo[0].title,
            true,
          );
        }
      }
    } catch {
      /* non-blocking email trigger */
    }

    return { success: true, id: data.id };
  });

// 8. Delete Listing Admin
export const deleteListingAdmin = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.number().int() }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    await sql`delete from listings where id = ${data.id}`;
    return { success: true, id: data.id };
  });

// 9. Client Reviews
export const getAdminClientReviews = createServerFn({ method: "GET" })
  .validator(
    (
      input:
        | {
            query?: string;
            status?: string;
            rating?: number;
          }
        | undefined,
    ) => input ?? {},
  )
  .handler(async ({ data }): Promise<ClientReview[]> => {
    const sql = await getSql();
    const query = data?.query?.trim().toLowerCase() ?? "";
    const status = data?.status?.trim() ?? "all";
    const rating = data?.rating ?? 0;

    const rows = await sql`
      select
        r.id, r.agent_user_id, r.listing_id, r.client_name, r.client_email,
        r.client_phone, r.client_role, r.rating, r.title, r.comment, r.status,
        r.is_verified_client, r.admin_notes, r.created_at,
        a.display_name as agent_name, a.slug as agent_slug, a.avatar_url as agent_avatar_url,
        l.title as listing_title
      from reviews r
      left join agents a on a.user_id = r.agent_user_id
      left join listings l on l.id = r.listing_id
      where
        (${query} = '' or lower(r.client_name) like ${`%${query}%`} or lower(r.title) like ${`%${query}%`} or lower(r.comment) like ${`%${query}%`} or lower(coalesce(a.display_name, '')) like ${`%${query}%`})
        and (${status} = 'all' or r.status = ${status})
        and (${rating} = 0 or r.rating = ${rating})
      order by r.created_at desc
    `;

    return rows.map((r: any) => ({
      id: r.id,
      agentUserId: r.agent_user_id,
      agentName: r.agent_name ?? "Agent",
      agentSlug: r.agent_slug ?? "",
      agentAvatarUrl: r.agent_avatar_url ?? null,
      listingId: r.listing_id ? Number(r.listing_id) : null,
      listingTitle: r.listing_title ?? null,
      clientName: r.client_name,
      clientEmail: r.client_email ?? "",
      clientPhone: r.client_phone ?? "",
      clientRole: r.client_role ?? "Tenant",
      rating: Number(r.rating) || 5,
      title: r.title,
      comment: r.comment,
      status: (r.status as ReviewStatus) ?? "published",
      isVerifiedClient: Boolean(r.is_verified_client),
      adminNotes: r.admin_notes ?? "",
      createdAt: new Date(r.created_at).toISOString(),
    }));
  });

// 10. Update Review Moderation
const updateReviewSchema = z.object({
  id: z.number().int(),
  status: z.enum(["published", "pending", "flagged"]),
  adminNotes: z.string().optional(),
});

export const updateReviewStatus = createServerFn({ method: "POST" })
  .validator((input: unknown) => updateReviewSchema.parse(input))
  .handler(async ({ data }) => {
    const sql = await getSql();
    await sql`
      update reviews
      set status = ${data.status},
          admin_notes = coalesce(${data.adminNotes}, admin_notes)
      where id = ${data.id}
    `;
    return { success: true, id: data.id, status: data.status };
  });

// 11. Delete Review Admin
export const deleteReviewAdmin = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.number().int() }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    await sql`delete from reviews where id = ${data.id}`;
    return { success: true, id: data.id };
  });

// 12. Create Client Review (e.g. from Admin or public)
const createReviewSchema = z.object({
  agentUserId: z.string().min(1),
  listingId: z.number().int().optional(),
  clientName: z.string().min(2).max(80),
  clientEmail: z.string().email().optional().or(z.literal("")),
  clientPhone: z.string().max(20).optional().default(""),
  clientRole: z.string().default("Tenant"),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(2).max(120),
  comment: z.string().min(5).max(2000),
  status: z.enum(["published", "pending", "flagged"]).default("published"),
  isVerifiedClient: z.boolean().default(true),
});

export const createClientReview = createServerFn({ method: "POST" })
  .validator((input: unknown) => createReviewSchema.parse(input))
  .handler(async ({ data }): Promise<ClientReview> => {
    const sql = await getSql();
    const rows = await sql`
      insert into reviews (
        agent_user_id, listing_id, client_name, client_email, client_phone,
        client_role, rating, title, comment, status, is_verified_client
      )
      values (
        ${data.agentUserId}, ${data.listingId ?? null}, ${data.clientName},
        ${data.clientEmail ?? ""}, ${data.clientPhone ?? ""}, ${data.clientRole},
        ${data.rating}, ${data.title}, ${data.comment}, ${data.status},
        ${data.isVerifiedClient}
      )
      returning *
    `;
    const r: any = rows[0];

    // Trigger client review email notification to agent
    try {
      const agentInfo = await sql<{ display_name: string; email?: string }>`
        select a.display_name, u.email
        from agents a
        left join "user" u on u.id = a.user_id
        where a.user_id = ${data.agentUserId}
        limit 1
      `;
      if (agentInfo[0] && agentInfo[0].email) {
        void sendClientReviewEmail(
          agentInfo[0].email,
          agentInfo[0].display_name,
          data.clientName,
          data.rating,
          data.title,
          data.comment,
        );
      }
    } catch {
      /* non-blocking email trigger */
    }

    return {
      id: r.id,
      agentUserId: r.agent_user_id,
      clientName: r.client_name,
      clientEmail: r.client_email ?? "",
      clientPhone: r.client_phone ?? "",
      clientRole: r.client_role ?? "Tenant",
      rating: Number(r.rating) || 5,
      title: r.title,
      comment: r.comment,
      status: (r.status as ReviewStatus) ?? "published",
      isVerifiedClient: Boolean(r.is_verified_client),
      adminNotes: r.admin_notes ?? "",
      createdAt: new Date(r.created_at).toISOString(),
    };
  });

// 13. Platform Inquiries / Leads (Bonus Admin Feature)
export const getAdminInquiries = createServerFn({ method: "GET" }).handler(
  async (): Promise<Inquiry[]> => {
    const sql = await getSql();
    const rows = await sql`
      select
        i.id, i.listing_id, i.agent_user_id, i.buyer_name, i.buyer_phone,
        i.message, i.status, i.follow_up_due, i.created_at,
        l.title as listing_title, l.area as listing_area,
        a.display_name as agent_name, a.slug as agent_slug
      from inquiries i
      left join listings l on l.id = i.listing_id
      left join agents a on a.user_id = i.agent_user_id
      order by i.created_at desc
    `;

    return rows.map((r: any) => ({
      id: r.id,
      listingId: r.listing_id,
      listingTitle: r.listing_title ?? "Property listing",
      listingArea: r.listing_area ?? "Lagos",
      agentUserId: r.agent_user_id,
      agentName: r.agent_name ?? "Agent",
      agentSlug: r.agent_slug ?? "",
      buyerName: r.buyer_name,
      buyerPhone: r.buyer_phone,
      message: r.message ?? "",
      status: r.status,
      followUpDue: r.follow_up_due ? new Date(r.follow_up_due).toISOString() : null,
      createdAt: new Date(r.created_at).toISOString(),
      overdue: r.follow_up_due ? new Date(r.follow_up_due).getTime() < Date.now() : false,
    }));
  },
);
