import { x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { D as ArrowRight, E as BadgeCheck, c as ScanEye, u as PhoneCall, y as FileSearch } from "../_libs/lucide-react.mjs";
import { o as Route$12, p as SHOWCASE_SLUG } from "./router-X-dUolla.mjs";
import { t as BrandMark } from "./brand-mark-DKxeE2Hw.mjs";
import { t as Button } from "./button-DiGjLxb5.mjs";
import { t as ListingCard } from "./listing-card-Cdi_xzvE.mjs";
import { n as useCurrentUserState } from "./use-current-user-BZLqO7zE.mjs";
import { i as UserButton, n as SignedIn, r as SignedOut } from "./gates-BubY_XKj.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-KI_apgS_.js
var import_jsx_runtime = require_jsx_runtime();
function SiteHeader() {
	const { isPending } = useCurrentUserState();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
		className: "sticky top-0 z-40 border-b border-border/80 bg-bg/90 backdrop-blur-md",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandMark, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
				className: "flex items-center gap-1 sm:gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/$slug",
					params: { slug: "adeola" },
					className: "hidden h-11 items-center rounded-md px-3 text-sm font-medium text-muted hover:text-fg sm:inline-flex",
					children: "Browse homes"
				}), isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-8 w-8 animate-pulse rounded-full bg-surface-2" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SignedIn, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "ghost",
					size: "sm",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/dashboard",
						children: "Dashboard"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SignedOut, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "ghost",
					size: "sm",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/login",
						children: "Sign in"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					size: "sm",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/signup",
						children: "List with us"
					})
				})] })] })]
			})]
		})
	});
}
var STEPS = [
	{
		icon: BadgeCheck,
		title: "ID checked",
		body: "The agent reviewed a valid government ID of the person claiming to own the home."
	},
	{
		icon: FileSearch,
		title: "Ownership document seen",
		body: "Deed of assignment, C of O, or consent was sighted — not just promised."
	},
	{
		icon: ScanEye,
		title: "On-site visit and photos",
		body: "Someone walked the rooms and took current photos, not a recycled brochure."
	},
	{
		icon: PhoneCall,
		title: "Owner phone confirmed",
		body: "The listed owner answered a live call. No silent middlemen."
	}
];
function Home() {
	const { agent, listings } = Route$12.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-bg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "relative overflow-hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "absolute inset-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: "/hero-lagos.jpg",
						alt: "Lagos waterfront at golden hour",
						className: "size-full object-cover"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-[linear-gradient(180deg,rgba(15,28,22,0.35)_0%,rgba(15,28,22,0.55)_45%,rgba(15,28,22,0.78)_100%)]" })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative mx-auto flex min-h-[78vh] max-w-6xl flex-col justify-end px-4 pb-16 pt-28 sm:pb-20",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium tracking-wide text-primary-fg/80",
							children: "Lagos · Independent agents · Proof before payment"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-3 max-w-2xl font-display text-4xl font-semibold text-primary-fg sm:text-5xl lg:text-6xl",
							children: "Find a home in Lagos you can actually trust."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 max-w-xl text-base leading-7 text-primary-fg/85 sm:text-lg",
							children: "TrustHouse is a listings page for serious agents. Every home carries a verification badge so you know what has been checked — and what has not."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-8 flex flex-col gap-3 sm:flex-row",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								size: "lg",
								className: "bg-primary-fg text-primary hover:bg-primary-fg/90",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/$slug",
									params: { slug: SHOWCASE_SLUG },
									children: ["Browse homes", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {})]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								size: "lg",
								variant: "outline",
								className: "border-0 bg-transparent text-primary-fg shadow-[0_0_0_1px_rgba(244,240,232,0.35)] hover:bg-primary-fg/10",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/signup",
									children: "I am an agent"
								})
							})]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mx-auto max-w-6xl px-4 py-16 sm:py-20",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium text-primary",
						children: "How trust is earned"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-2 max-w-xl font-display text-3xl font-semibold",
						children: "Four proofs. One honest badge."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 max-w-2xl text-muted",
						children: "Green means all four checks are done. Yellow means some. Red means none yet — still listed, never dressed up as verified."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
						children: STEPS.map((step) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: "rounded-xl bg-surface p-5 shadow-card",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(step.icon, { className: "size-5 text-primary" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "mt-4 font-display text-lg font-semibold",
									children: step.title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm leading-6 text-muted",
									children: step.body
								})
							]
						}, step.title))
					})
				]
			}),
			listings.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mx-auto max-w-6xl px-4 pb-16 sm:pb-20",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-end justify-between gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium text-primary",
						children: agent ? `${agent.displayName}'s listings` : "Featured"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-1 font-display text-3xl font-semibold",
						children: "Homes on the market"
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "ghost",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/$slug/listings",
							params: { slug: SHOWCASE_SLUG },
							children: ["See all", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {})]
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3",
					children: listings.map((listing) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListingCard, {
						listing,
						slug: SHOWCASE_SLUG
					}, listing.id))
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "border-t border-border bg-surface",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-6xl flex-col gap-6 px-4 py-14 sm:flex-row sm:items-center sm:justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl font-semibold",
						children: "Agents: publish a page buyers can trust."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 max-w-xl text-sm text-muted",
						children: "Sign up, add listings with the four proofs, and share your unique link. Inquiries land in your dashboard with WhatsApp follow-up."
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						size: "lg",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/signup",
							children: ["Create your page", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {})]
						})
					})]
				})
			})
		] })]
	});
}
//#endregion
export { Home as component };
