import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { l as Plus, r as Trash2 } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { c as deleteListing, u as listMyListings } from "./router-X-dUolla.mjs";
import { t as Button } from "./button-DiGjLxb5.mjs";
import { n as formatNairaYear } from "./format-B_1iMEnz.mjs";
import { t as TrustBadge } from "./trust-badge-BOk_MVZm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dashboard.listings-CkW3SYKJ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AgentListings() {
	const [listings, setListings] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	async function refresh() {
		setListings(await listMyListings());
	}
	(0, import_react.useEffect)(() => {
		refresh().catch(() => toast.error("Could not load listings.")).finally(() => setLoading(false));
	}, []);
	async function onDelete(id) {
		if (!confirm("Remove this listing?")) return;
		await deleteListing({ data: id });
		await refresh();
		toast.success("Listing removed.");
	}
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-48 animate-pulse rounded-xl bg-surface-2" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-5xl",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl font-semibold",
				children: "Listings"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "Homes on your public page."
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/dashboard/listings/new",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "Add listing"]
				})
			})]
		}), listings.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-10 rounded-xl bg-surface px-6 py-14 text-center shadow-card",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-lg font-semibold",
					children: "No listings yet"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: "Add a home and tick the proofs you have actually completed."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					className: "mt-5",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/dashboard/listings/new",
						children: "Add your first listing"
					})
				})
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-8 grid gap-3",
			children: listings.map((listing) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex flex-col gap-3 rounded-xl bg-surface p-3 shadow-card sm:flex-row sm:items-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: listing.photoUrl,
						alt: "",
						className: "h-28 w-full rounded-lg object-cover sm:h-20 sm:w-28"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-medium",
								children: listing.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrustBadge, { level: listing.trust })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-sm text-muted",
							children: [
								listing.area,
								" · ",
								formatNairaYear(listing.yearlyRent)
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "secondary",
							size: "sm",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/dashboard/listings/$listingId",
								params: { listingId: String(listing.id) },
								children: "Edit"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							variant: "ghost",
							size: "sm",
							onClick: () => void onDelete(listing.id),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" }), "Remove"]
						})]
					})
				]
			}, listing.id))
		})]
	});
}
//#endregion
export { AgentListings as component };
