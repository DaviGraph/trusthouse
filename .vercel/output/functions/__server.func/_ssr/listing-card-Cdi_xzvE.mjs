import { x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { h as MapPin } from "../_libs/lucide-react.mjs";
import { n as formatNairaYear } from "./format-B_1iMEnz.mjs";
import { t as TrustBadge } from "./trust-badge-BOk_MVZm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/listing-card-Cdi_xzvE.js
var import_jsx_runtime = require_jsx_runtime();
function ListingCard({ listing, slug }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: "/$slug/listings/$listingId",
		params: {
			slug,
			listingId: String(listing.id)
		},
		className: "group flex flex-col overflow-hidden rounded-xl bg-surface text-fg no-underline shadow-card transition-[transform,box-shadow] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative aspect-[4/3] overflow-hidden bg-surface-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: listing.photoUrl,
				alt: listing.title,
				className: "size-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute top-3 left-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrustBadge, { level: listing.trust })
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-1 flex-col gap-2 p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-display text-base font-semibold leading-snug text-fg",
					children: listing.title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "flex items-center gap-1.5 text-sm text-muted",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-3.5 shrink-0" }),
						listing.area,
						", Lagos"
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-auto pt-2 font-display text-lg font-semibold tabular-nums tracking-tight",
					children: formatNairaYear(listing.yearlyRent)
				})
			]
		})]
	});
}
//#endregion
export { ListingCard as t };
