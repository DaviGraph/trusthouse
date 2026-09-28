import { n as trustLevel } from "./trust-BL5lrEZ6.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/mappers-CX-watFr.js
function iso(value) {
	if (!value) return null;
	const d = value instanceof Date ? value : new Date(value);
	if (Number.isNaN(d.getTime())) return null;
	return d.toISOString();
}
function mapListing(row) {
	const proofs = {
		proofIdChecked: Boolean(row.proof_id_checked),
		proofOwnershipSeen: Boolean(row.proof_ownership_seen),
		proofOnsiteVisit: Boolean(row.proof_onsite_visit),
		proofOwnerPhone: Boolean(row.proof_owner_phone)
	};
	return {
		id: Number(row.id),
		userId: row.user_id,
		title: row.title,
		area: row.area,
		yearlyRent: Number(row.yearly_rent),
		bedrooms: Number(row.bedrooms),
		bathrooms: Number(row.bathrooms),
		description: row.description,
		photoUrl: row.photo_url,
		createdAt: iso(row.created_at) ?? (/* @__PURE__ */ new Date()).toISOString(),
		trust: trustLevel(proofs),
		...proofs
	};
}
function mapInquiry(row) {
	const followUpDue = iso(row.follow_up_due);
	const overdue = Boolean(followUpDue && row.status !== "closed" && new Date(followUpDue).getTime() < Date.now());
	return {
		id: Number(row.id),
		listingId: Number(row.listing_id),
		listingTitle: row.listing_title,
		listingArea: row.listing_area,
		agentUserId: row.agent_user_id,
		buyerName: row.buyer_name,
		buyerPhone: row.buyer_phone,
		message: row.message,
		status: row.status ?? "new",
		followUpDue,
		createdAt: iso(row.created_at) ?? (/* @__PURE__ */ new Date()).toISOString(),
		overdue
	};
}
//#endregion
export { mapListing as n, mapInquiry as t };
