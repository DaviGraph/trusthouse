import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { _ as Outlet, m as useRouterState, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { g as LayoutDashboard, l as Plus, m as Menu, t as X, v as House } from "../_libs/lucide-react.mjs";
import { _ as getMyAgent, g as ensureAgentProfile } from "./router-X-dUolla.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { t as BrandMark } from "./brand-mark-DKxeE2Hw.mjs";
import { t as Button } from "./button-DiGjLxb5.mjs";
import { n as useCurrentUserState } from "./use-current-user-BZLqO7zE.mjs";
import { i as UserButton, t as RedirectToSignIn } from "./gates-BubY_XKj.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dashboard-C9ljYPTl.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var NAV = [
	{
		to: "/dashboard",
		label: "Leads",
		icon: LayoutDashboard
	},
	{
		to: "/dashboard/listings",
		label: "Listings",
		icon: House
	},
	{
		to: "/dashboard/listings/new",
		label: "Add listing",
		icon: Plus
	}
];
function AgentShell({ agent, children }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const nav = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
		className: "flex flex-col gap-1",
		children: NAV.map((item) => {
			const active = item.to === "/dashboard" ? pathname === "/dashboard" : item.to === "/dashboard/listings" ? pathname === "/dashboard/listings" : pathname === item.to;
			const Icon = item.icon;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: item.to,
				onClick: () => setOpen(false),
				className: cn("flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors duration-150", active ? "bg-primary-soft text-primary" : "text-muted hover:bg-surface-2 hover:text-fg"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" }), item.label]
			}, item.to);
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-bg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-surface p-4 md:flex",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandMark, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-8 flex-1",
						children: nav
					}),
					agent ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg bg-bg p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium",
							children: agent.displayName
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-0.5 truncate text-xs text-muted",
							children: ["/", agent.slug]
						})]
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "md:pl-64",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-border bg-bg/90 px-4 backdrop-blur-md md:h-16",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "grid size-11 place-items-center rounded-md md:hidden",
							onClick: () => setOpen(true),
							"aria-label": "Open menu",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-5" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-sm font-semibold md:hidden",
							children: "TrustHouse"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "ml-auto flex items-center gap-2",
							children: [agent ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								variant: "outline",
								size: "sm",
								className: "hidden sm:inline-flex",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/$slug",
									params: { slug: agent.slug },
									children: "View public page"
								})
							}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "px-4 py-6 sm:px-6 lg:px-8",
					children
				})]
			}),
			open ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "fixed inset-0 z-50 md:hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "absolute inset-0 bg-fg/40",
					"aria-label": "Close menu",
					onClick: () => setOpen(false)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "absolute inset-y-0 left-0 flex w-72 flex-col bg-surface p-4 shadow-card",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-6 flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandMark, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "grid size-11 place-items-center",
							onClick: () => setOpen(false),
							"aria-label": "Close",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
						})]
					}), nav]
				})]
			}) : null
		]
	});
}
function DashboardLayout() {
	const { user, isPending } = useCurrentUserState();
	const [agent, setAgent] = (0, import_react.useState)(null);
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (isPending || !user) return;
		let cancelled = false;
		(async () => {
			try {
				let profile = await getMyAgent();
				if (!profile) profile = await ensureAgentProfile({ data: {
					displayName: user.displayName || user.primaryEmail || "Agent",
					phone: ""
				} });
				if (!cancelled) setAgent(profile);
			} catch {
				if (!cancelled) setAgent(null);
			} finally {
				if (!cancelled) setReady(true);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [isPending, user]);
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "min-h-dvh bg-bg" });
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AgentShell, {
		agent,
		children: ready ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-40 animate-pulse rounded-xl bg-surface-2" })
	});
}
//#endregion
export { DashboardLayout as component };
