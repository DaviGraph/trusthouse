import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { I as object, z as string } from "../_libs/@better-auth/core+[...].mjs";
import { r as getSql } from "./db-C2uVnzdZ.mjs";
import { t as authMiddleware } from "./middleware-Btosgm1p.mjs";
import { r as slugifyName, t as RESERVED_SLUGS } from "./format-B_1iMEnz.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/agents-AAjGTF97.js
function mapAgent(row) {
	return {
		userId: row.user_id,
		slug: row.slug,
		displayName: row.display_name,
		phone: row.phone,
		bio: row.bio
	};
}
async function uniqueSlug(sql, base, userId) {
	let candidate = RESERVED_SLUGS.has(base) ? `${base}-agent` : base;
	for (let i = 0; i < 40; i += 1) {
		const existing = await sql`
      select user_id from agents where slug = ${candidate} limit 1
    `;
		if (existing.length === 0 || existing[0].user_id === userId) return candidate;
		candidate = `${base}-${i + 2}`;
	}
	return `${base}-${Date.now().toString(36)}`;
}
var getPublicAgent_createServerFn_handler = createServerRpc({
	id: "4b7784e2f52727d8ec5a13fc6acbc0cff0e1f49c231efdbe0c434821f101c0f9",
	name: "getPublicAgent",
	filename: "src/lib/server/agents.ts"
}, (opts) => getPublicAgent.__executeServer(opts));
var getPublicAgent = createServerFn({ method: "GET" }).validator((slug) => slug.trim().toLowerCase()).handler(getPublicAgent_createServerFn_handler, async ({ data: slug }) => {
	if (!slug || RESERVED_SLUGS.has(slug)) return null;
	const rows = await (await getSql())`
      select user_id, slug, display_name, phone, bio from agents where slug = ${slug} limit 1
    `;
	return rows[0] ? mapAgent(rows[0]) : null;
});
var getMyAgent_createServerFn_handler = createServerRpc({
	id: "160a26ea5b75c557db90be6c6bbb3f99eed9ae7d1c79aaaf25e44faff23650a3",
	name: "getMyAgent",
	filename: "src/lib/server/agents.ts"
}, (opts) => getMyAgent.__executeServer(opts));
var getMyAgent = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getMyAgent_createServerFn_handler, async ({ context }) => {
	const rows = await (await getSql())`
      select user_id, slug, display_name, phone, bio
      from agents where user_id = ${context.userId} limit 1
    `;
	return rows[0] ? mapAgent(rows[0]) : null;
});
var upsertSchema = object({
	displayName: string().trim().min(2).max(80),
	phone: string().trim().max(20).optional().default(""),
	bio: string().trim().max(400).optional().default("")
});
var ensureAgentProfile_createServerFn_handler = createServerRpc({
	id: "b16432e0e81aea567cb3e48ba4197377ac07ecde34889d4598fece6f5f3f65a7",
	name: "ensureAgentProfile",
	filename: "src/lib/server/agents.ts"
}, (opts) => ensureAgentProfile.__executeServer(opts));
var ensureAgentProfile = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => upsertSchema.parse(input)).handler(ensureAgentProfile_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const existing = await sql`
      select user_id, slug, display_name, phone, bio
      from agents where user_id = ${context.userId} limit 1
    `;
	if (existing[0]) {
		const phone = data.phone || existing[0].phone;
		const bio = data.bio || existing[0].bio;
		const name = data.displayName || existing[0].display_name;
		await sql`
        update agents
        set display_name = ${name}, phone = ${phone}, bio = ${bio}
        where user_id = ${context.userId}
      `;
		return {
			userId: context.userId,
			slug: existing[0].slug,
			displayName: name,
			phone,
			bio
		};
	}
	const slug = await uniqueSlug(sql, slugifyName(data.displayName), context.userId);
	await sql`
      insert into agents (user_id, slug, display_name, phone, bio)
      values (${context.userId}, ${slug}, ${data.displayName}, ${data.phone ?? ""}, ${data.bio ?? ""})
    `;
	return {
		userId: context.userId,
		slug,
		displayName: data.displayName,
		phone: data.phone ?? "",
		bio: data.bio ?? ""
	};
});
//#endregion
export { ensureAgentProfile_createServerFn_handler, getMyAgent_createServerFn_handler, getPublicAgent_createServerFn_handler };
