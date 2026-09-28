import { r as createServerFn } from "./ssr.mjs";
import { I as object, O as _enum, z as string } from "../_libs/@better-auth/core+[...].mjs";
import { n as number } from "../_libs/zod.mjs";
import { t as createSsrRpc } from "./createSsrRpc-B2Izd0c7.mjs";
import { t as authMiddleware } from "./middleware-Btosgm1p.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/inquiries-DP6HxWwZ.js
var inquireSchema = object({
	listingId: number().int().positive(),
	buyerName: string().trim().min(2).max(80),
	buyerPhone: string().trim().min(8).max(24),
	message: string().trim().max(1e3).optional().default("")
});
var createInquiry = createServerFn({ method: "POST" }).validator((input) => inquireSchema.parse(input)).handler(createSsrRpc("b157888fd65e821c9c8a5f57d8e181bd19eed73083bfadf68b16f4befe886c98"));
var listMyInquiries = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("71f6cfde15baa6e94ff609494c70f45b09413741eaf05867deb4e135ad8db563"));
var statusSchema = object({
	id: number().int().positive(),
	status: _enum([
		"new",
		"contacted",
		"viewing_booked",
		"closed"
	])
});
var updateInquiryStatus = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => statusSchema.parse(input)).handler(createSsrRpc("dc0b29b1100b943d34d5a586bd4c8885104a9fcefab299c6e3b4dcbab3897cfb"));
var followUpSchema = object({
	id: number().int().positive(),
	followUpDue: string().min(1)
});
var updateInquiryFollowUp = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => followUpSchema.parse(input)).handler(createSsrRpc("fa5acc5483dd07b60573a272e059327bf980842b3593a7495418dd94140b154a"));
var dashboardStats = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("a4f334344a16367f28105a25f06e239d38879a73e6d3c3b13017863a868b3f1b"));
//#endregion
export { updateInquiryStatus as a, updateInquiryFollowUp as i, dashboardStats as n, listMyInquiries as r, createInquiry as t };
