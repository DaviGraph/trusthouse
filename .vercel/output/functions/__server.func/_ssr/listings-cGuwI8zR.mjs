import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { I as object, j as boolean, z as string } from "../_libs/@better-auth/core+[...].mjs";
import { r as getSql } from "./db-C2uVnzdZ.mjs";
import { n as number } from "../_libs/zod.mjs";
import { t as authMiddleware } from "./middleware-Btosgm1p.mjs";
import { n as mapListing } from "./mappers-CX-watFr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/listings-cGuwI8zR.js
var listingInput = object({
	title: string().trim().min(4).max(120),
	area: string().trim().min(2).max(60),
	yearlyRent: number().int().positive().max(1e9),
	bedrooms: number().int().min(1).max(12),
	bathrooms: number().int().min(1).max(12),
	description: string().trim().max(2e3).optional().default(""),
	photoUrl: string().trim().min(1).max(500),
	proofIdChecked: boolean(),
	proofOwnershipSeen: boolean(),
	proofOnsiteVisit: boolean(),
	proofOwnerPhone: boolean()
});
var publicQuery = object({
	slug: string().trim().min(1),
	hideUnverified: boolean().optional().default(false)
});
var listPublicListings_createServerFn_handler = createServerRpc({
	id: "45d71b645aaeaea2e7743e02a6b7028f3b5cf78b6c88387506d0fdb24dc61ae9",
	name: "listPublicListings",
	filename: "src/lib/server/listings.ts"
}, (opts) => listPublicListings.__executeServer(opts));
var listPublicListings = createServerFn({ method: "GET" }).validator((input) => publicQuery.parse(input)).handler(listPublicListings_createServerFn_handler, async ({ data }) => {
	const listings = (await (await getSql())`
      select l.id, l.user_id, l.title, l.area, l.yearly_rent, l.bedrooms, l.bathrooms,
             l.description, l.photo_url, l.proof_id_checked, l.proof_ownership_seen,
             l.proof_onsite_visit, l.proof_owner_phone, l.created_at
      from listings l
      join agents a on a.user_id = l.user_id
      where a.slug = ${data.slug}
      order by l.created_at desc
    `).map(mapListing);
	return data.hideUnverified ? listings.filter((l) => l.trust !== "unverified") : listings;
});
var getPublicListing_createServerFn_handler = createServerRpc({
	id: "7b65b9b48ba6787d71c4662677771cc5e671cceb6b6c84f676fc0b0d7e9cf0f9",
	name: "getPublicListing",
	filename: "src/lib/server/listings.ts"
}, (opts) => getPublicListing.__executeServer(opts));
var getPublicListing = createServerFn({ method: "GET" }).validator((input) => object({
	slug: string().trim().min(1),
	listingId: number().int().positive()
}).parse(input)).handler(getPublicListing_createServerFn_handler, async ({ data }) => {
	const rows = await (await getSql())`
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
var listMyListings_createServerFn_handler = createServerRpc({
	id: "e246e159109a5c74b7b116149b4c3806a16791bc302cf946243e072cf385ddb3",
	name: "listMyListings",
	filename: "src/lib/server/listings.ts"
}, (opts) => listMyListings.__executeServer(opts));
var listMyListings = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listMyListings_createServerFn_handler, async ({ context }) => {
	return (await (await getSql())`
      select id, user_id, title, area, yearly_rent, bedrooms, bathrooms, description,
             photo_url, proof_id_checked, proof_ownership_seen, proof_onsite_visit,
             proof_owner_phone, created_at
      from listings
      where user_id = ${context.userId}
      order by created_at desc
    `).map(mapListing);
});
var getMyListing_createServerFn_handler = createServerRpc({
	id: "4f216f5567c8c40a621fdd06dced70d0e82f983a4614ee19fa039cac0f3270c0",
	name: "getMyListing",
	filename: "src/lib/server/listings.ts"
}, (opts) => getMyListing.__executeServer(opts));
var getMyListing = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((id) => id).handler(getMyListing_createServerFn_handler, async ({ context, data: id }) => {
	const rows = await (await getSql())`
      select id, user_id, title, area, yearly_rent, bedrooms, bathrooms, description,
             photo_url, proof_id_checked, proof_ownership_seen, proof_onsite_visit,
             proof_owner_phone, created_at
      from listings
      where id = ${id} and user_id = ${context.userId}
      limit 1
    `;
	return rows[0] ? mapListing(rows[0]) : null;
});
var createListing_createServerFn_handler = createServerRpc({
	id: "1fa2943115c55ff395df64520f1446dbadda4b72d54f04fc662c06edafe9b236",
	name: "createListing",
	filename: "src/lib/server/listings.ts"
}, (opts) => createListing.__executeServer(opts));
var createListing = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => listingInput.parse(input)).handler(createListing_createServerFn_handler, async ({ context, data }) => {
	const rows = await (await getSql())`
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
var updateListing_createServerFn_handler = createServerRpc({
	id: "1db83385b6b9f26f38a43a5ac1f95eb31d893aa0085f3ae8b8f454c0ccd32e5f",
	name: "updateListing",
	filename: "src/lib/server/listings.ts"
}, (opts) => updateListing.__executeServer(opts));
var updateListing = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => listingInput.extend({ id: number().int().positive() }).parse(input)).handler(updateListing_createServerFn_handler, async ({ context, data }) => {
	const rows = await (await getSql())`
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
var deleteListing_createServerFn_handler = createServerRpc({
	id: "fcdd81d9702d6c7c79d556ef84932531b6f590f1a523d3d92338c1ce93c90874",
	name: "deleteListing",
	filename: "src/lib/server/listings.ts"
}, (opts) => deleteListing.__executeServer(opts));
var deleteListing = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((id) => id).handler(deleteListing_createServerFn_handler, async ({ context, data: id }) => {
	await (await getSql())`delete from listings where id = ${id} and user_id = ${context.userId}`;
	return { ok: true };
});
//#endregion
export { createListing_createServerFn_handler, deleteListing_createServerFn_handler, getMyListing_createServerFn_handler, getPublicListing_createServerFn_handler, listMyListings_createServerFn_handler, listPublicListings_createServerFn_handler, updateListing_createServerFn_handler };
