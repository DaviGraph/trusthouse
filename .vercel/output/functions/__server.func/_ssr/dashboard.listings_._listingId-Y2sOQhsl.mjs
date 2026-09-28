import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { C as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { d as updateListing, l as getMyListing, n as Route$1 } from "./router-X-dUolla.mjs";
import { n as toListingPayload, t as ListingForm } from "./listing-form-DlO7zuE0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dashboard.listings_._listingId-Y2sOQhsl.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function EditListing() {
	const { listingId } = Route$1.useParams();
	const navigate = useNavigate();
	const [listing, setListing] = (0, import_react.useState)(null);
	const [pending, setPending] = (0, import_react.useState)(false);
	const [loading, setLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		getMyListing({ data: Number(listingId) }).then(setListing).catch(() => toast.error("Could not load listing.")).finally(() => setLoading(false));
	}, [listingId]);
	async function onSubmit(draft) {
		if (!listing) return;
		setPending(true);
		try {
			await updateListing({ data: {
				id: listing.id,
				...toListingPayload(draft)
			} });
			toast.success("Listing updated.");
			await navigate({ to: "/dashboard/listings" });
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not save listing.");
		} finally {
			setPending(false);
		}
	}
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-48 animate-pulse rounded-xl bg-surface-2" });
	if (!listing) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: "That listing was not found."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-2xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl font-semibold",
				children: "Edit listing"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "Update details or the four proofs as you complete them."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-8 rounded-xl bg-surface p-5 shadow-card sm:p-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListingForm, {
					initial: listing,
					pending,
					submitLabel: "Save changes",
					onSubmit: (d) => void onSubmit(d)
				})
			})
		]
	});
}
//#endregion
export { EditListing as component };
