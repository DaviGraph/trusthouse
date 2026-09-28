import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { f as LAGOS_AREAS, m as STOCK_PHOTOS } from "./router-X-dUolla.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { t as Button } from "./button-DiGjLxb5.mjs";
import { n as Label, t as Input } from "./label-BJs53ltp.mjs";
import { n as ProofToggles, r as Textarea } from "./proof-checklist-CnDwW5JY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/listing-form-DlO7zuE0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function listingToDraft(listing) {
	return {
		title: listing?.title ?? "",
		area: listing?.area ?? "Lekki Phase 1",
		yearlyRent: listing ? String(listing.yearlyRent) : "",
		bedrooms: listing ? String(listing.bedrooms) : "2",
		bathrooms: listing ? String(listing.bathrooms) : "2",
		description: listing?.description ?? "",
		photoUrl: listing?.photoUrl ?? STOCK_PHOTOS[0].src,
		proofIdChecked: listing?.proofIdChecked ?? false,
		proofOwnershipSeen: listing?.proofOwnershipSeen ?? false,
		proofOnsiteVisit: listing?.proofOnsiteVisit ?? false,
		proofOwnerPhone: listing?.proofOwnerPhone ?? false
	};
}
function toListingPayload(draft) {
	return {
		title: draft.title,
		area: draft.area,
		yearlyRent: Number(String(draft.yearlyRent).replace(/[^\d]/g, "")),
		bedrooms: Number(draft.bedrooms),
		bathrooms: Number(draft.bathrooms),
		description: draft.description,
		photoUrl: draft.photoUrl,
		proofIdChecked: draft.proofIdChecked,
		proofOwnershipSeen: draft.proofOwnershipSeen,
		proofOnsiteVisit: draft.proofOnsiteVisit,
		proofOwnerPhone: draft.proofOwnerPhone
	};
}
function ListingForm({ initial, pending, submitLabel, onSubmit }) {
	const [draft, setDraft] = (0, import_react.useState)(() => listingToDraft(initial));
	function handle(e) {
		e.preventDefault();
		onSubmit(draft);
	}
	const proofs = {
		proofIdChecked: draft.proofIdChecked,
		proofOwnershipSeen: draft.proofOwnershipSeen,
		proofOnsiteVisit: draft.proofOnsiteVisit,
		proofOwnerPhone: draft.proofOwnerPhone
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "grid gap-5",
		onSubmit: handle,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "title",
					children: "Title"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "title",
					required: true,
					placeholder: "Serviced 3-bed duplex, Lekki Phase 1",
					value: draft.title,
					onChange: (e) => setDraft({
						...draft,
						title: e.target.value
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "area",
						children: "Area in Lagos"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						id: "area",
						className: "h-11 rounded-md bg-surface px-3 text-sm shadow-[0_0_0_1px_rgba(28,25,23,0.12)] outline-none focus-visible:shadow-[0_0_0_2px_rgba(15,92,69,0.35)]",
						value: draft.area,
						onChange: (e) => setDraft({
							...draft,
							area: e.target.value
						}),
						children: LAGOS_AREAS.map((area) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: area,
							children: area
						}, area))
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "rent",
						children: "Yearly rent (naira)"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "rent",
						required: true,
						inputMode: "numeric",
						placeholder: "8000000",
						value: draft.yearlyRent,
						onChange: (e) => setDraft({
							...draft,
							yearlyRent: e.target.value
						})
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "beds",
						children: "Bedrooms"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "beds",
						type: "number",
						min: 1,
						max: 12,
						value: draft.bedrooms,
						onChange: (e) => setDraft({
							...draft,
							bedrooms: e.target.value
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "baths",
						children: "Bathrooms"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "baths",
						type: "number",
						min: 1,
						max: 12,
						value: draft.bathrooms,
						onChange: (e) => setDraft({
							...draft,
							bathrooms: e.target.value
						})
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "desc",
					children: "Description"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					id: "desc",
					placeholder: "Estate, power, water, what you verified…",
					value: draft.description,
					onChange: (e) => setDraft({
						...draft,
						description: e.target.value
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
				className: "grid gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
						className: "mb-1 text-sm font-medium",
						children: "Property photo"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-2 gap-2 sm:grid-cols-4",
						children: STOCK_PHOTOS.map((photo) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setDraft({
								...draft,
								photoUrl: photo.src
							}),
							className: cn("overflow-hidden rounded-md transition-[box-shadow] duration-150", draft.photoUrl === photo.src ? "shadow-[0_0_0_2px_var(--color-primary)]" : "shadow-[0_0_0_1px_rgba(28,25,23,0.08)]"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: photo.src,
								alt: photo.label,
								className: "aspect-[4/3] w-full object-cover"
							})
						}, photo.src))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "photo-url",
						className: "mt-2 text-muted",
						children: "Or paste a photo URL"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "photo-url",
						value: draft.photoUrl,
						onChange: (e) => setDraft({
							...draft,
							photoUrl: e.target.value
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProofToggles, {
				proofs,
				onChange: (next) => setDraft({
					...draft,
					...next
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "submit",
				disabled: pending,
				size: "lg",
				children: pending ? "Saving…" : submitLabel
			})
		]
	});
}
//#endregion
export { toListingPayload as n, ListingForm as t };
