import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { sendInquiryNotificationEmail } from "@/lib/server/email";

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

    // 2. Insert into buyer_requirements table
    await sql`
      insert into buyer_requirements (
        agent_id, buyer_name, buyer_phone, buyer_email, property_type,
        preferred_location, budget_min, budget_max, bedrooms, timeline, status
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
        'New'
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
            now() + interval '24 hours'
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
