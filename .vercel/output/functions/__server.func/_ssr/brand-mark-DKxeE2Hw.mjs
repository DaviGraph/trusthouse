import { x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/brand-mark-DKxeE2Hw.js
var import_jsx_runtime = require_jsx_runtime();
function BrandMark({ className, to = "/", muted = false }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to,
		className: cn("inline-flex items-center gap-2 text-fg no-underline", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: cn("grid size-8 place-items-center rounded-[10px] bg-primary text-primary-fg", muted && "opacity-90"),
			"aria-hidden": "true",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
				viewBox: "0 0 24 24",
				className: "size-5",
				fill: "none",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M4.5 10.5 12 4.5l7.5 6V19a1.5 1.5 0 0 1-1.5 1.5h-4.2v-5.1h-3.6V20.5H6A1.5 1.5 0 0 1 4.5 19v-8.5Z",
					fill: "currentColor",
					opacity: "0.95"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					d: "M10.2 12.4h3.6v1.7h-3.6z",
					fill: "var(--color-primary)"
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-display text-[1.05rem] font-semibold tracking-tight",
			children: "TrustHouse"
		})]
	});
}
//#endregion
export { BrandMark as t };
