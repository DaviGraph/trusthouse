import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as Navigate, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { t as GROK_PROVIDERS } from "./server-CGNwIry2.mjs";
import { t as BrandMark } from "./brand-mark-DKxeE2Hw.mjs";
import { t as Button } from "./button-DiGjLxb5.mjs";
import { n as Label, t as Input } from "./label-BJs53ltp.mjs";
import { r as signIn, t as authClient } from "./client-IWHfIGH2.mjs";
import { n as useCurrentUserState } from "./use-current-user-BZLqO7zE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-BrRvR-dc.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Login() {
	const { user, isPending } = useCurrentUserState();
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "min-h-dvh bg-bg" });
	if (user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/dashboard" });
	async function onSubmit(e) {
		e.preventDefault();
		setError(null);
		setBusy(true);
		try {
			const { error: err } = await authClient.signIn.email({
				email,
				password,
				callbackURL: "/dashboard"
			});
			if (err) {
				setError(err.message ?? "Could not sign in.");
				return;
			}
			window.location.href = "/dashboard";
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not sign in.");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-dvh place-items-center px-4 py-10",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-md rounded-xl bg-surface p-6 shadow-card sm:p-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandMark, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-6 font-display text-2xl font-semibold",
					children: "Agent sign in"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "Open your dashboard and public listings page."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mt-6 grid gap-4",
						onSubmit,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "email",
									children: "Email"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "email",
									type: "email",
									autoComplete: "email",
									required: true,
									value: email,
									onChange: (e) => setEmail(e.target.value)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "password",
									children: "Password"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "password",
									type: "password",
									autoComplete: "current-password",
									required: true,
									value: password,
									onChange: (e) => setPassword(e.target.value)
								})]
							}),
							error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-danger",
								children: error
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								disabled: busy,
								size: "lg",
								children: busy ? "Signing in…" : "Sign in"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative my-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-px bg-border" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface px-2 text-xs text-faint",
							children: "or"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-2",
						children: GROK_PROVIDERS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							variant: "secondary",
							onClick: () => signIn(p.providerId, { callbackURL: "/dashboard" }),
							children: ["Continue with ", p.label]
						}, p.providerId))
					})
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-6 text-sm text-muted",
					children: [
						"New agent?",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/signup",
							className: "font-medium text-primary hover:underline",
							children: "Create an account"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "text-muted hover:text-fg",
						children: "Back home"
					})
				})
			]
		})
	});
}
//#endregion
export { Login as component };
