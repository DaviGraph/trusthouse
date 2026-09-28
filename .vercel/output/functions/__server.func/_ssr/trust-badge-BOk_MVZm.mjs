import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { a as ShieldCheck, i as ShieldQuestion, o as ShieldAlert } from "../_libs/lucide-react.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/trust-badge-BOk_MVZm.js
var import_jsx_runtime = require_jsx_runtime();
function Badge({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", className),
		...props
	});
}
var COPY = {
	verified: {
		label: "Verified",
		className: "bg-verified-bg text-verified",
		Icon: ShieldCheck
	},
	partial: {
		label: "Partly Verified",
		className: "bg-partial-bg text-partial",
		Icon: ShieldQuestion
	},
	unverified: {
		label: "Unverified",
		className: "bg-unverified-bg text-unverified",
		Icon: ShieldAlert
	}
};
function TrustBadge({ level, className }) {
	const { label, className: tone, Icon } = COPY[level];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
		className: cn("gap-1", tone, className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
			className: "size-3.5",
			strokeWidth: 2.2
		}), label]
	});
}
//#endregion
export { TrustBadge as t };
