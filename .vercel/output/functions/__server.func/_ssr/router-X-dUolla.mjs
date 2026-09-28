import { o as __toESM } from "../_runtime.mjs";
import { t as __exportAll } from "./rolldown-runtime-D7D4PA-g.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { Z as notFound, _ as Outlet, b as createRootRoute, f as Scripts, g as createRouter, p as HeadContent, v as lazyRouteComponent, w as useRouter, y as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime, t as QueryClientProvider } from "../_libs/react+tanstack__react-query.mjs";
import { r as createServerFn } from "./ssr.mjs";
import { B as union, F as number, I as object, N as literal, j as boolean, z as string } from "../_libs/@better-auth/core+[...].mjs";
import { n as number$1 } from "../_libs/zod.mjs";
import { n as auth } from "./server-CGNwIry2.mjs";
import { t as createSsrRpc } from "./createSsrRpc-B2Izd0c7.mjs";
import { t as authMiddleware } from "./middleware-Btosgm1p.mjs";
import { n as TriangleAlert } from "../_libs/lucide-react.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/agents-Cybd9CcH.js
var agents_exports = /* @__PURE__ */ __exportAll({
	ensureAgentProfile: () => ensureAgentProfile,
	getMyAgent: () => getMyAgent,
	getPublicAgent: () => getPublicAgent
});
var getPublicAgent = createServerFn({ method: "GET" }).validator((slug) => slug.trim().toLowerCase()).handler(createSsrRpc("4b7784e2f52727d8ec5a13fc6acbc0cff0e1f49c231efdbe0c434821f101c0f9"));
var getMyAgent = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("160a26ea5b75c557db90be6c6bbb3f99eed9ae7d1c79aaaf25e44faff23650a3"));
var upsertSchema = object({
	displayName: string().trim().min(2).max(80),
	phone: string().trim().max(20).optional().default(""),
	bio: string().trim().max(400).optional().default("")
});
var ensureAgentProfile = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => upsertSchema.parse(input)).handler(createSsrRpc("b16432e0e81aea567cb3e48ba4197377ac07ecde34889d4598fece6f5f3f65a7"));
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/constants-CezaE_pK.js
var LAGOS_AREAS = [
	"Lekki Phase 1",
	"Lekki Phase 2",
	"Ikoyi",
	"Victoria Island",
	"Oniru",
	"Banana Island",
	"Ikeja GRA",
	"Ikeja",
	"Maryland",
	"Magodo",
	"Gbagada",
	"Yaba",
	"Surulere",
	"Ajah",
	"Sangotedo",
	"Chevron",
	"Ilupeju",
	"Ogudu"
];
var STOCK_PHOTOS = [
	{
		src: "/listings/lekki-duplex.jpg",
		label: "Lekki duplex"
	},
	{
		src: "/listings/ikoyi-apartment.jpg",
		label: "Ikoyi apartment"
	},
	{
		src: "/listings/vi-penthouse.jpg",
		label: "Victoria Island terrace"
	},
	{
		src: "/listings/yaba-studio.jpg",
		label: "Yaba studio"
	},
	{
		src: "/listings/ikeja-bungalow.jpg",
		label: "Ikeja bungalow"
	},
	{
		src: "/listings/surulere-apartment.jpg",
		label: "Surulere apartment"
	},
	{
		src: "/listings/ajah-miniflat.jpg",
		label: "Ajah mini-flat"
	},
	{
		src: "/listings/magodo-duplex.jpg",
		label: "Magodo duplex"
	}
];
var SHOWCASE_SLUG = "adeola";
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/listings-9zQ3A4os.js
var listingInput = object({
	title: string().trim().min(4).max(120),
	area: string().trim().min(2).max(60),
	yearlyRent: number$1().int().positive().max(1e9),
	bedrooms: number$1().int().min(1).max(12),
	bathrooms: number$1().int().min(1).max(12),
	description: string().trim().max(2e3).optional().default(""),
	photoUrl: string().trim().min(1).max(500),
	proofIdChecked: boolean(),
	proofOwnershipSeen: boolean(),
	proofOnsiteVisit: boolean(),
	proofOwnerPhone: boolean()
});
var publicQuery = object({
	slug: string().trim().min(1),
	hideUnverified: boolean().optional().default(false)
});
var listPublicListings = createServerFn({ method: "GET" }).validator((input) => publicQuery.parse(input)).handler(createSsrRpc("45d71b645aaeaea2e7743e02a6b7028f3b5cf78b6c88387506d0fdb24dc61ae9"));
var getPublicListing = createServerFn({ method: "GET" }).validator((input) => object({
	slug: string().trim().min(1),
	listingId: number$1().int().positive()
}).parse(input)).handler(createSsrRpc("7b65b9b48ba6787d71c4662677771cc5e671cceb6b6c84f676fc0b0d7e9cf0f9"));
var listMyListings = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("e246e159109a5c74b7b116149b4c3806a16791bc302cf946243e072cf385ddb3"));
var getMyListing = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((id) => id).handler(createSsrRpc("4f216f5567c8c40a621fdd06dced70d0e82f983a4614ee19fa039cac0f3270c0"));
var createListing = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => listingInput.parse(input)).handler(createSsrRpc("1fa2943115c55ff395df64520f1446dbadda4b72d54f04fc662c06edafe9b236"));
var updateListing = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => listingInput.extend({ id: number$1().int().positive() }).parse(input)).handler(createSsrRpc("1db83385b6b9f26f38a43a5ac1f95eb31d893aa0085f3ae8b8f454c0ccd32e5f"));
var deleteListing = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((id) => id).handler(createSsrRpc("fcdd81d9702d6c7c79d556ef84932531b6f590f1a523d3d92338c1ce93c90874"));
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/router-X-dUolla.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";
function errorMessage(error) {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "string" && error) return error;
	return FALLBACK_MESSAGE;
}
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: errorMessage(error)
			})
		]
	});
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
var CONNECTOR_TOKEN_READY_EVENT = "grok:connector-token-ready";
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
var ConnectorTokenReadySchema = EnvelopeSchema.extend({ type: literal("connector-token-ready") });
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Origin of the Grok embedder framing this page, or null when the page runs
* top-level (download/export, local `npm run dev`, deployed sites) or under a
* non-Grok parent. Client-only; null during SSR.
*/
function resolveCurrentEmbedderOrigin() {
	if (typeof window === "undefined") return null;
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	return resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	const parentOrigin = resolveCurrentEmbedderOrigin();
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onHello = (data) => {
		if (!HelloSchema.safeParse(data).success) return;
		announce();
	};
	const onNavigate = (data) => {
		const parsed = NavigateSchema.safeParse(data);
		if (!parsed.success) return;
		navigate(parsed.data.path);
		queueMicrotask(reportLocation);
	};
	const onHistory = (data) => {
		const parsed = HistorySchema.safeParse(data);
		if (!parsed.success) return;
		if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
		window.history.go(parsed.data.delta);
	};
	const onConnectorTokenReady = (data) => {
		if (!ConnectorTokenReadySchema.safeParse(data).success) return;
		window.dispatchEvent(new Event(CONNECTOR_TOKEN_READY_EVENT));
	};
	const hostMessageHandlers = /* @__PURE__ */ new Map([
		["hello", onHello],
		["navigate", onNavigate],
		["history", onHistory],
		["connector-token-ready", onConnectorTokenReady]
	]);
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		hostMessageHandlers.get(envelope.data.type)?.(event.data);
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
var styles_default = "/assets/styles-CjO8NzFl.css";
var APP_NAME = "TrustHouse";
var fetchSessionUser = createServerFn({ method: "GET" }).handler(createSsrRpc("2c4985e96c199268f7f639534cb5e8e31d6b19d43286bf77416413db60ffde26"));
var Route$13 = createRootRoute({
	beforeLoad: async () => ({ sessionUser: await fetchSessionUser() }),
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: APP_NAME },
			{
				name: "description",
				content: "Verified real estate listings in Lagos, Nigeria. Trust the home before you pay."
			},
			{
				name: "theme-color",
				content: "#0F5C45"
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			}
		]
	}),
	component: RootDocument
});
function RootDocument() {
	const [queryClient] = (0, import_react.useState)(() => new QueryClient({ defaultOptions: { queries: {
		staleTime: 15e3,
		retry: 1
	} } }));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		className: "antialiased",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(QueryClientProvider, {
				client: queryClient,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
					richColors: true,
					position: "top-center"
				})]
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
		] })]
	});
}
var $$splitComponentImporter$11 = () => import("./routes-KI_apgS_.mjs");
var Route$12 = createFileRoute("/")({
	loader: async () => {
		try {
			const [agent, listings] = await Promise.all([getPublicAgent({ data: SHOWCASE_SLUG }), listPublicListings({ data: { slug: SHOWCASE_SLUG } })]);
			return {
				agent,
				listings: listings.slice(0, 6)
			};
		} catch {
			return {
				agent: null,
				listings: []
			};
		}
	},
	component: lazyRouteComponent($$splitComponentImporter$11, "component")
});
var $$splitNotFoundComponentImporter$1 = () => import("../_slug-CnXZ51CU.mjs");
var $$splitComponentImporter$10 = () => import("../_slug-CI3KYP1U.mjs");
var Route$11 = createFileRoute("/$slug")({
	loader: async ({ params }) => {
		const agent = await getPublicAgent({ data: params.slug });
		if (!agent) throw notFound();
		return { agent };
	},
	component: lazyRouteComponent($$splitComponentImporter$10, "component"),
	notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter$1, "notFoundComponent")
});
var $$splitComponentImporter$9 = () => import("./dashboard-C9ljYPTl.mjs");
var Route$10 = createFileRoute("/dashboard")({ component: lazyRouteComponent($$splitComponentImporter$9, "component") });
var $$splitComponentImporter$8 = () => import("./login-BrRvR-dc.mjs");
var Route$9 = createFileRoute("/login")({ component: lazyRouteComponent($$splitComponentImporter$8, "component") });
var $$splitComponentImporter$7 = () => import("./signup-DZ8RWpyR.mjs");
var Route$8 = createFileRoute("/signup")({ component: lazyRouteComponent($$splitComponentImporter$7, "component") });
var $$splitComponentImporter$6 = () => import("../_slug.index-B66Vhl9b.mjs");
var Route$7 = createFileRoute("/$slug/")({ component: lazyRouteComponent($$splitComponentImporter$6, "component") });
var $$splitComponentImporter$5 = () => import("../_slug.listings-DA8uOKQs.mjs");
var Route$6 = createFileRoute("/$slug/listings")({
	loader: async ({ params }) => {
		return { listings: await listPublicListings({ data: { slug: params.slug } }) };
	},
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./dashboard.index-7R8WElik.mjs");
var Route$5 = createFileRoute("/dashboard/")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import("./dashboard.listings-CkW3SYKJ.mjs");
var Route$4 = createFileRoute("/dashboard/listings")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitNotFoundComponentImporter = () => import("../_slug.listings_._listingId-BE9ufuVO.mjs");
var $$splitComponentImporter$2 = () => import("../_slug.listings_._listingId-BeQ__BgK.mjs");
var Route$3 = createFileRoute("/$slug/listings_/$listingId")({
	loader: async ({ params }) => {
		const listing = await getPublicListing({ data: {
			slug: params.slug,
			listingId: Number(params.listingId)
		} });
		if (!listing) throw notFound();
		return { listing };
	},
	component: lazyRouteComponent($$splitComponentImporter$2, "component"),
	notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter, "notFoundComponent")
});
var Route$2 = createFileRoute("/api/auth/$")({ server: { handlers: {
	GET: ({ request }) => auth.handler(request),
	POST: ({ request }) => auth.handler(request)
} } });
var $$splitComponentImporter$1 = () => import("./dashboard.listings_._listingId-Y2sOQhsl.mjs");
var Route$1 = createFileRoute("/dashboard/listings_/$listingId")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("./dashboard.listings_.new-BDrq_imX.mjs");
var Route = createFileRoute("/dashboard/listings_/new")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var IndexRoute = Route$12.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$13
});
var SlugRoute = Route$11.update({
	id: "/$slug",
	path: "/$slug",
	getParentRoute: () => Route$13
});
var DashboardRoute = Route$10.update({
	id: "/dashboard",
	path: "/dashboard",
	getParentRoute: () => Route$13
});
var LoginRoute = Route$9.update({
	id: "/login",
	path: "/login",
	getParentRoute: () => Route$13
});
var SignupRoute = Route$8.update({
	id: "/signup",
	path: "/signup",
	getParentRoute: () => Route$13
});
var SlugIndexRoute = Route$7.update({
	id: "/",
	path: "/",
	getParentRoute: () => SlugRoute
});
var SlugListingsRoute = Route$6.update({
	id: "/listings",
	path: "/listings",
	getParentRoute: () => SlugRoute
});
var DashboardIndexRoute = Route$5.update({
	id: "/",
	path: "/",
	getParentRoute: () => DashboardRoute
});
var DashboardListingsRoute = Route$4.update({
	id: "/listings",
	path: "/listings",
	getParentRoute: () => DashboardRoute
});
var SlugListingsListingIdRoute = Route$3.update({
	id: "/listings_/$listingId",
	path: "/listings/$listingId",
	getParentRoute: () => SlugRoute
});
var ApiAuthSplatRoute = Route$2.update({
	id: "/api/auth/$",
	path: "/api/auth/$",
	getParentRoute: () => Route$13
});
var DashboardListingsListingIdRoute = Route$1.update({
	id: "/listings_/$listingId",
	path: "/listings/$listingId",
	getParentRoute: () => DashboardRoute
});
var DashboardListingsNewRoute = Route.update({
	id: "/listings_/new",
	path: "/listings/new",
	getParentRoute: () => DashboardRoute
});
var SlugRouteChildren = {
	SlugListingsRoute,
	SlugIndexRoute,
	SlugListingsListingIdRoute
};
var SlugRouteWithChildren = SlugRoute._addFileChildren(SlugRouteChildren);
var DashboardRouteChildren = {
	DashboardListingsRoute,
	DashboardIndexRoute,
	DashboardListingsListingIdRoute,
	DashboardListingsNewRoute
};
var rootRouteChildren = {
	IndexRoute,
	SlugRoute: SlugRouteWithChildren,
	DashboardRoute: DashboardRoute._addFileChildren(DashboardRouteChildren),
	LoginRoute,
	SignupRoute,
	ApiAuthSplatRoute
};
var routeTree = Route$13._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { getMyAgent as _, Route$11 as a, deleteListing as c, updateListing as d, LAGOS_AREAS as f, ensureAgentProfile as g, agents_exports as h, Route$6 as i, getMyListing as l, STOCK_PHOTOS as m, Route$1 as n, Route$12 as o, SHOWCASE_SLUG as p, Route$3 as r, createListing as s, router_exports as t, listMyListings as u, getPublicAgent as v };
