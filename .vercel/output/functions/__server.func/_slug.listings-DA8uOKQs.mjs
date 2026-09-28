import { o as __toESM } from "./_runtime.mjs";
import { n as require_react } from "./_libs/@radix-ui/react-compose-refs+[...].mjs";
import { x as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "./_libs/react+tanstack__react-query.mjs";
import { a as Route$11, i as Route$6 } from "./_ssr/router-X-dUolla.mjs";
import { t as ListingCard } from "./_ssr/listing-card-Cdi_xzvE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_slug.listings-DA8uOKQs.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PublicListings() {
	const { agent } = Route$11.useLoaderData();
	const { listings } = Route$6.useLoaderData();
	const [hideUnverified, setHideUnverified] = (0, import_react.useState)(false);
	const visible = (0, import_react.useMemo)(() => hideUnverified ? listings.filter((l) => l.trust !== "unverified") : listings, [hideUnverified, listings]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto max-w-6xl px-4 py-8 sm:py-10",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/$slug",
						params: { slug: agent.slug },
						className: "hover:text-fg",
						children: agent.displayName
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 font-display text-3xl font-semibold",
					children: "Homes for rent"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "Yearly rent in naira. Badge shows how much of the home has been checked."
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex h-11 cursor-pointer items-center gap-2 rounded-full bg-surface px-4 text-sm shadow-[0_0_0_1px_rgba(28,25,23,0.06)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "checkbox",
					className: "size-4 accent-primary",
					checked: hideUnverified,
					onChange: (e) => setHideUnverified(e.target.checked)
				}), "Hide unverified"]
			})]
		}), visible.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-12 rounded-xl bg-surface px-6 py-16 text-center shadow-card",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-lg font-semibold",
				children: "No listings to show"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: hideUnverified ? "Turn off the filter to see unverified homes." : "This agent has not published homes yet."
			})]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3",
			children: visible.map((listing) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListingCard, {
				listing,
				slug: agent.slug
			}, listing.id))
		})]
	});
}
//#endregion
export { PublicListings as component };
