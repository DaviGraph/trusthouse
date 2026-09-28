import { _ as Outlet } from "./_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "./_libs/react+tanstack__react-query.mjs";
import { a as Route$11 } from "./_ssr/router-X-dUolla.mjs";
import { t as BrandMark } from "./_ssr/brand-mark-DKxeE2Hw.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_slug-CI3KYP1U.js
var import_jsx_runtime = require_jsx_runtime();
function PublicAgentLayout() {
	const { agent } = Route$11.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-bg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
			className: "sticky top-0 z-30 border-b border-border/80 bg-bg/90 backdrop-blur-md",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandMark, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 text-right",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate text-sm font-medium",
						children: agent.displayName
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate text-xs text-muted",
						children: "Independent agent · Lagos"
					})]
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})]
	});
}
//#endregion
export { PublicAgentLayout as component };
