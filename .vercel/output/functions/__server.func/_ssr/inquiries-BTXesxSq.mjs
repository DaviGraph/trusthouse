import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { I as object, O as _enum, z as string } from "../_libs/@better-auth/core+[...].mjs";
import { r as getSql } from "./db-C2uVnzdZ.mjs";
import { n as number } from "../_libs/zod.mjs";
import { t as authMiddleware } from "./middleware-Btosgm1p.mjs";
import { t as mapInquiry } from "./mappers-CX-watFr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/inquiries-BTXesxSq.js
var inquireSchema = object({
	listingId: number().int().positive(),
	buyerName: string().trim().min(2).max(80),
	buyerPhone: string().trim().min(8).max(24),
	message: string().trim().max(1e3).optional().default("")
});
var createInquiry_createServerFn_handler = createServerRpc({
	id: "b157888fd65e821c9c8a5f57d8e181bd19eed73083bfadf68b16f4befe886c98",
	name: "createInquiry",
	filename: "src/lib/server/inquiries.ts"
}, (opts) => createInquiry.__executeServer(opts));
var createInquiry = createServerFn({ method: "POST" }).validator((input) => inquireSchema.parse(input)).handler(createInquiry_createServerFn_handler, async ({ data }) => {
	const sql = await getSql();
	const listing = await sql`
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
	return { ok: true };
});
var listMyInquiries_createServerFn_handler = createServerRpc({
	id: "71f6cfde15baa6e94ff609494c70f45b09413741eaf05867deb4e135ad8db563",
	name: "listMyInquiries",
	filename: "src/lib/server/inquiries.ts"
}, (opts) => listMyInquiries.__executeServer(opts));
var listMyInquiries = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listMyInquiries_createServerFn_handler, async ({ context }) => {
	return (await (await getSql())`
      select
        i.id, i.listing_id, l.title as listing_title, l.area as listing_area,
        i.agent_user_id, i.buyer_name, i.buyer_phone, i.message, i.status,
        i.follow_up_due, i.created_at
      from inquiries i
      join listings l on l.id = i.listing_id
      where i.agent_user_id = ${context.userId}
      order by i.created_at desc
    `).map(mapInquiry);
});
var statusSchema = object({
	id: number().int().positive(),
	status: _enum([
		"new",
		"contacted",
		"viewing_booked",
		"closed"
	])
});
var updateInquiryStatus_createServerFn_handler = createServerRpc({
	id: "dc0b29b1100b943d34d5a586bd4c8885104a9fcefab299c6e3b4dcbab3897cfb",
	name: "updateInquiryStatus",
	filename: "src/lib/server/inquiries.ts"
}, (opts) => updateInquiryStatus.__executeServer(opts));
var updateInquiryStatus = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => statusSchema.parse(input)).handler(updateInquiryStatus_createServerFn_handler, async ({ context, data }) => {
	await (await getSql())`
      update inquiries
      set status = ${data.status}
      where id = ${data.id} and agent_user_id = ${context.userId}
    `;
	return { ok: true };
});
var followUpSchema = object({
	id: number().int().positive(),
	followUpDue: string().min(1)
});
var updateInquiryFollowUp_createServerFn_handler = createServerRpc({
	id: "fa5acc5483dd07b60573a272e059327bf980842b3593a7495418dd94140b154a",
	name: "updateInquiryFollowUp",
	filename: "src/lib/server/inquiries.ts"
}, (opts) => updateInquiryFollowUp.__executeServer(opts));
var updateInquiryFollowUp = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => followUpSchema.parse(input)).handler(updateInquiryFollowUp_createServerFn_handler, async ({ context, data }) => {
	await (await getSql())`
      update inquiries
      set follow_up_due = ${data.followUpDue}
      where id = ${data.id} and agent_user_id = ${context.userId}
    `;
	return { ok: true };
});
var dashboardStats_createServerFn_handler = createServerRpc({
	id: "a4f334344a16367f28105a25f06e239d38879a73e6d3c3b13017863a868b3f1b",
	name: "dashboardStats",
	filename: "src/lib/server/inquiries.ts"
}, (opts) => dashboardStats.__executeServer(opts));
var dashboardStats = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(dashboardStats_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	const open = await sql`
      select count(*)::int as n from inquiries
      where agent_user_id = ${context.userId} and status <> 'closed'
    `;
	const overdue = await sql`
      select count(*)::int as n from inquiries
      where agent_user_id = ${context.userId}
        and status <> 'closed'
        and follow_up_due is not null
        and follow_up_due < now()
    `;
	const listings = await sql`
      select count(*)::int as n from listings where user_id = ${context.userId}
    `;
	return {
		openInquiries: Number(open[0]?.n ?? 0),
		overdueFollowups: Number(overdue[0]?.n ?? 0),
		listingCount: Number(listings[0]?.n ?? 0)
	};
});
//#endregion
export { createInquiry_createServerFn_handler, dashboardStats_createServerFn_handler, listMyInquiries_createServerFn_handler, updateInquiryFollowUp_createServerFn_handler, updateInquiryStatus_createServerFn_handler };
