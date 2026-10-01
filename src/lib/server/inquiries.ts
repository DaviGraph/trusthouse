import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import type { Inquiry } from "@/lib/types";
import { sendInquiryNotificationEmail } from "@/lib/server/email";
import { mapInquiry, type InquiryRow } from "./mappers";

const inquireSchema = z.object({
  listingId: z.coerce.number().int().positive(),
  buyerName: z.string().trim().min(2).max(80),
  buyerPhone: z.string().trim().min(8).max(24),
  message: z.string().trim().max(1000).optional().default(""),
});

export const createInquiry = createServerFn({ method: "POST" })
  .validator((input: unknown) => inquireSchema.parse(input))
  .handler(async ({ data }): Promise<{ ok: true }> => {
    const sql = await getSql();
    const listing = await sql<{ id: number; user_id: string }>`
      select id, user_id from listings where id = ${data.listingId} limit 1
    `;
    if (!listing[0]) throw new Error("That listing is no longer available.");
    await sql`
      insert into inquiries (listing_id, agent_user_id, buyer_name, buyer_phone, message, status, follow_up_due)
      values (
        ${listing[0].id},
        ${listing[0].user_id},
        ${data.buyerName},
        ${data.buyerPhone},
        ${data.message},
        'new',
        now() + interval '24 hours'
      )
    `;

    // Fetch agent email and listing title for inquiry email notification
    try {
      const agentDetails = await sql<{ display_name: string; title: string; email?: string }>`
        select a.display_name, l.title, u.email
        from agents a
        join listings l on l.id = ${data.listingId}
        left join "user" u on u.id = a.user_id
        where a.user_id = ${listing[0].user_id}
        limit 1
      `;
      if (agentDetails[0] && agentDetails[0].email) {
        void sendInquiryNotificationEmail(
          agentDetails[0].email,
          agentDetails[0].display_name,
          data.buyerName,
          data.buyerPhone,
          agentDetails[0].title,
          data.message,
        );
      }
    } catch {
      /* non-blocking email trigger */
    }

    return { ok: true };
  });

export const listMyInquiries = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<Inquiry[]> => {
    const sql = await getSql();
    const rows = await sql<InquiryRow>`
      select
        i.id, i.listing_id, l.title as listing_title, l.area as listing_area,
        i.agent_user_id, i.buyer_name, i.buyer_phone, i.message, i.status,
        i.follow_up_due, i.created_at
      from inquiries i
      join listings l on l.id = i.listing_id
      where i.agent_user_id = ${context.userId}
      order by i.created_at desc
    `;
    return rows.map(mapInquiry);
  });

const statusSchema = z.object({
  id: z.coerce.number().int().positive(),
  status: z.enum(["new", "contacted", "viewing_booked", "closed"]),
});

export const updateInquiryStatus = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => statusSchema.parse(input))
  .handler(async ({ context, data }): Promise<{ ok: true }> => {
    const sql = await getSql();
    await sql`
      update inquiries
      set status = ${data.status}
      where id = ${data.id} and agent_user_id = ${context.userId}
    `;
    return { ok: true };
  });

const followUpSchema = z.object({
  id: z.coerce.number().int().positive(),
  followUpDue: z.string().min(1),
});

export const updateInquiryFollowUp = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => followUpSchema.parse(input))
  .handler(async ({ context, data }): Promise<{ ok: true }> => {
    const sql = await getSql();
    await sql`
      update inquiries
      set follow_up_due = ${data.followUpDue}
      where id = ${data.id} and agent_user_id = ${context.userId}
    `;
    return { ok: true };
  });

export const dashboardStats = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const open = await sql<{ n: number }>`
      select count(*)::int as n from inquiries
      where agent_user_id = ${context.userId} and status <> 'closed'
    `;
    const overdue = await sql<{ n: number }>`
      select count(*)::int as n from inquiries
      where agent_user_id = ${context.userId}
        and status <> 'closed'
        and follow_up_due is not null
        and follow_up_due < now()
    `;
    const listings = await sql<{ n: number }>`
      select count(*)::int as n from listings where user_id = ${context.userId}
    `;
    return {
      openInquiries: Number(open[0]?.n ?? 0),
      overdueFollowups: Number(overdue[0]?.n ?? 0),
      listingCount: Number(listings[0]?.n ?? 0),
    };
  });
