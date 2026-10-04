import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { mapBuyerRequirement, type BuyerRequirementRow } from "@/lib/server/mappers";
import { sendInquiryNotificationEmail } from "@/lib/server/email";
import type { BuyerRequirement } from "@/lib/types";

const requirementSchema = z.object({
  agentSlug: z.string().optional(),
  listingId: z.coerce.number().optional(),
  buyerName: z.string().trim().min(2, "Full name is required").max(80),
  buyerPhone: z.string().trim().min(8, "Valid phone number is required").max(24),
  buyerEmail: z.string().trim().email().optional().or(z.literal("")),
  propertyType: z.enum([
    "Apartment",
    "Duplex",
    "Terrace",
    "Fully Detached",
    "Land",
    "Commercial",
  ]),
  preferredLocation: z.string().trim().min(2, "Preferred location is required").max(100),
  budgetMin: z.coerce.number().nonnegative().optional().default(0),
  budgetMax: z.coerce.number().positive("Maximum budget is required"),
  bedrooms: z.coerce.number().int().min(1).optional().default(1),
  timeline: z.enum(["Immediate", "Within 1 Month", "Just Browsing"]).default("Immediate"),
});

export const createBuyerRequirement = createServerFn({ method: "POST" })
  .validator((input: unknown) => requirementSchema.parse(input))
  .handler(async ({ data }): Promise<{ ok: true; agentName: string }> => {
    const sql = await getSql();

    let agentId: string | null = null;
    let agentUserId: string | null = null;
    let agentName = "TrustHouse Agent";
    let agentEmail: string | undefined;

    // 1. Resolve agent by listingId or agentSlug
    if (data.listingId) {
      const listingRows = await sql<{ id: number; user_id: string; title: string }>`
        select id, user_id, title from listings where id = ${data.listingId} limit 1
      `;
      if (listingRows[0]) {
        agentUserId = listingRows[0].user_id;
      }
    }

    if (!agentUserId && data.agentSlug) {
      const agentRows = await sql<{ user_id: string; id: string; display_name: string }>`
        select user_id, id, display_name from agents where slug = ${data.agentSlug} limit 1
      `;
      if (agentRows[0]) {
        agentUserId = agentRows[0].user_id;
        agentId = agentRows[0].id;
        agentName = agentRows[0].display_name;
      }
    }

    if (agentUserId) {
      const agentDetails = await sql<{ id: string; display_name: string; email?: string }>`
        select a.id, a.display_name, u.email
        from agents a
        left join "user" u on u.id = a.user_id
        where a.user_id = ${agentUserId}
        limit 1
      `;
      if (agentDetails[0]) {
        agentId = agentDetails[0].id;
        agentName = agentDetails[0].display_name;
        agentEmail = agentDetails[0].email;
      }
    }

    // 2. Insert into buyer_requirements table with default followup_due_date = NOW() + INTERVAL '2 days'
    await sql`
      insert into buyer_requirements (
        agent_id, buyer_name, buyer_phone, buyer_email, property_type,
        preferred_location, budget_min, budget_max, bedrooms, timeline, status, followup_due_date
      )
      values (
        ${agentId ?? null},
        ${data.buyerName},
        ${data.buyerPhone},
        ${data.buyerEmail || null},
        ${data.propertyType},
        ${data.preferredLocation},
        ${data.budgetMin ?? 0},
        ${data.budgetMax},
        ${data.bedrooms ?? 1},
        ${data.timeline},
        'New',
        now() + interval '2 days'
      )
    `;

    // 3. Optional: Also record in inquiries for backwards compatibility
    if (data.listingId && agentUserId) {
      try {
        await sql`
          insert into inquiries (listing_id, agent_user_id, buyer_name, buyer_phone, message, status, follow_up_due)
          values (
            ${data.listingId},
            ${agentUserId},
            ${data.buyerName},
            ${data.buyerPhone},
            ${`Looking for ${data.propertyType} in ${data.preferredLocation} (Budget: ₦${data.budgetMin.toLocaleString()} - ₦${data.budgetMax.toLocaleString()})`},
            'new',
            now() + interval '2 days'
          )
        `;
      } catch {
        /* non-blocking */
      }
    }

    // 4. Send email notification to agent
    if (agentEmail) {
      try {
        void sendInquiryNotificationEmail(
          agentEmail,
          agentName,
          data.buyerName,
          data.buyerPhone,
          `${data.propertyType} in ${data.preferredLocation}`,
          `Budget: ₦${data.budgetMin.toLocaleString()} - ₦${data.budgetMax.toLocaleString()} | Bedrooms: ${data.bedrooms} | Timeline: ${data.timeline}`,
        );
      } catch {
        /* non-blocking email trigger */
      }
    }

    return { ok: true, agentName };
  });

// 5. CRM Pipeline: List Agent Buyer Requirements & Overview Metrics
export const listAgentRequirements = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<{
    requirements: BuyerRequirement[];
    stats: {
      totalActiveLeads: number;
      newInquiries: number;
      overdueFollowups: number;
    };
  }> => {
    const sql = await getSql();

    const agentRows = await sql<{ id: string }>`
      select id from agents where user_id = ${context.userId} limit 1
    `;
    const agentId = agentRows[0]?.id;

    if (!agentId) {
      return {
        requirements: [],
        stats: { totalActiveLeads: 0, newInquiries: 0, overdueFollowups: 0 },
      };
    }

    const rows = await sql<BuyerRequirementRow>`
      select
        id, agent_id, buyer_name, buyer_phone, buyer_email, property_type,
        preferred_location, budget_min, budget_max, bedrooms, timeline, status,
        followup_due_date, created_at
      from buyer_requirements
      where agent_id = ${agentId}
      order by created_at desc
    `;

    const requirements = rows.map(mapBuyerRequirement);

    // Compute metric cards
    const totalActiveLeads = requirements.filter((r) => r.status !== "Closed").length;
    const newInquiries = requirements.filter((r) => r.status === "New").length;
    const overdueFollowups = requirements.filter(
      (r) =>
        r.status !== "Closed" &&
        r.followupDueDate &&
        new Date(r.followupDueDate).getTime() < Date.now(),
    ).length;

    return {
      requirements,
      stats: {
        totalActiveLeads,
        newInquiries,
        overdueFollowups,
      },
    };
  });

// 6. Update Buyer Requirement Status
const updateReqStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["New", "Contacted", "Viewing Booked", "Closed"]),
});

export const updateBuyerRequirementStatus = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => updateReqStatusSchema.parse(input))
  .handler(async ({ context, data }): Promise<{ ok: true }> => {
    const sql = await getSql();
    await sql`
      update buyer_requirements
      set status = ${data.status}
      where id = ${data.id}
    `;
    return { ok: true };
  });

// 7. Update Lead Follow-up Reminder / Reschedule Action
const updateFollowupSchema = z.object({
  id: z.string().uuid(),
  followupDueDate: z.string(),
  status: z.enum(["New", "Contacted", "Viewing Booked", "Closed"]).optional(),
});

export const updateLeadFollowup = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => updateFollowupSchema.parse(input))
  .handler(async ({ context, data }): Promise<{ ok: true }> => {
    const sql = await getSql();
    if (data.status) {
      await sql`
        update buyer_requirements
        set followup_due_date = ${data.followupDueDate},
            status = ${data.status}
        where id = ${data.id}
      `;
    } else {
      await sql`
        update buyer_requirements
        set followup_due_date = ${data.followupDueDate}
        where id = ${data.id}
      `;
    }
    return { ok: true };
  });

// 8. Automated Inventory Matcher: Find matching pipeline buyers for a listing
export type MatchedBuyer = BuyerRequirement & {
  matchScore: number;
};

export const getMatchingBuyerRequirements = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((listingId: number) => listingId)
  .handler(async ({ context, data: listingId }): Promise<MatchedBuyer[]> => {
    const sql = await getSql();

    const listingRows = await sql<{
      id: number;
      user_id: string;
      title: string;
      area: string;
      yearly_rent: number;
      bedrooms: number;
    }>`
      select id, user_id, title, area, yearly_rent, bedrooms
      from listings
      where id = ${listingId} and user_id = ${context.userId}
      limit 1
    `;

    if (!listingRows[0]) return [];
    const listing = listingRows[0];

    const agentRows = await sql<{ id: string }>`
      select id from agents where user_id = ${context.userId} limit 1
    `;
    const agentId = agentRows[0]?.id;
    if (!agentId) return [];

    const rows = await sql<BuyerRequirementRow>`
      select
        id, agent_id, buyer_name, buyer_phone, buyer_email, property_type,
        preferred_location, budget_min, budget_max, bedrooms, timeline, status,
        followup_due_date, created_at
      from buyer_requirements
      where agent_id = ${agentId}
        and status != 'Closed'
        and budget_max >= ${listing.yearly_rent}
        and bedrooms <= ${listing.bedrooms + 1}
      order by budget_max desc
    `;

    const mapped = rows.map(mapBuyerRequirement);

    return mapped.map((req) => {
      let score = 80;
      const locMatch =
        req.preferredLocation.toLowerCase().includes(listing.area.toLowerCase()) ||
        listing.area.toLowerCase().includes(req.preferredLocation.toLowerCase());
      if (locMatch) score += 15;
      if (req.bedrooms === listing.bedrooms) score += 5;
      return {
        ...req,
        matchScore: Math.min(score, 100),
      };
    });
  });
