import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { C as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { s as createListing } from "./router-X-dUolla.mjs";
import { n as toListingPayload, t as ListingForm } from "./listing-form-DlO7zuE0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dashboard.listings_.new-BDrq_imX.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function NewListing() {
	const navigate = useNavigate();
	const [pending, setPending] = (0, import_react.useState)(false);
	async function onSubmit(draft) {
		setPending(true);
		try {
			await createListing({ data: toListingPayload(draft) });
			toast.success("Listing published.");
			await navigate({ to: "/dashboard/listings" });
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not save listing.");
		} finally {
			setPending(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-2xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl font-semibold",
				children: "Add a listing"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "Only tick proofs you have personally completed. The public badge is computed from this."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-8 rounded-xl bg-surface p-5 shadow-card sm:p-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListingForm, {
					pending,
					submitLabel: "Publish listing",
					onSubmit: (d) => void onSubmit(d)
				})
			})
		]
	});
}
//#endregion
export { NewListing as component };
