import { x as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "./_libs/react+tanstack__react-query.mjs";
import { C as Building2, D as ArrowRight, s as Search } from "./_libs/lucide-react.mjs";
import { a as Route$11 } from "./_ssr/router-X-dUolla.mjs";
import { t as Button } from "./_ssr/button-DiGjLxb5.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_slug.index-B66Vhl9b.js
var import_jsx_runtime = require_jsx_runtime();
function AgentEntry() {
	const { agent } = Route$11.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex min-h-[calc(100dvh-4rem)] max-w-lg flex-col justify-center px-4 py-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-medium text-primary",
				children: "Welcome"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
				className: "mt-2 font-display text-3xl font-semibold sm:text-4xl",
				children: [
					"You are on ",
					agent.displayName,
					"'s TrustHouse."
				]
			}),
			agent.bio ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-muted",
				children: agent.bio
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-8 text-sm font-medium text-fg",
				children: "Who are you?"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/$slug/listings",
					params: { slug: agent.slug },
					className: "group flex items-start gap-4 rounded-xl bg-surface p-5 text-fg no-underline shadow-card transition-[transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-11 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center justify-between gap-2 font-display text-lg font-semibold",
							children: ["I am a buyer, looking for a property", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4 text-muted transition-transform duration-200 group-hover:translate-x-0.5" })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "mt-1 block text-sm text-muted",
							children: [
								"See ",
								agent.displayName.split(" ")[0],
								"'s verified Lagos listings. No account needed."
							]
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/login",
					className: "flex items-start gap-4 rounded-xl bg-surface p-5 text-fg no-underline shadow-[0_0_0_1px_rgba(28,25,23,0.06)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-11 shrink-0 place-items-center rounded-lg bg-surface-2 text-muted",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "size-5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block font-display text-lg font-semibold",
						children: "I list properties"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-1 block text-sm text-muted",
						children: "Sign in to your agent dashboard."
					})] })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-8",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "ghost",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						children: "Not looking for this agent"
					})
				})
			})
		]
	});
}
//#endregion
export { AgentEntry as component };
