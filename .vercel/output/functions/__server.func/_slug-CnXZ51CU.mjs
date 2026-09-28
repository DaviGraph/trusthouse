import { x as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "./_libs/react+tanstack__react-query.mjs";
import { t as BrandMark } from "./_ssr/brand-mark-DKxeE2Hw.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_slug-CnXZ51CU.js
var import_jsx_runtime = require_jsx_runtime();
function AgentNotFound() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-dvh place-items-center px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandMark, { className: "justify-center" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-6 font-display text-2xl font-semibold",
					children: "This agent page does not exist"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: "The link may be mistyped, or the agent has not published a TrustHouse page yet."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "font-medium text-primary hover:underline",
						children: "Back to TrustHouse"
					})
				})
			]
		})
	});
}
//#endregion
export { AgentNotFound as notFoundComponent };
