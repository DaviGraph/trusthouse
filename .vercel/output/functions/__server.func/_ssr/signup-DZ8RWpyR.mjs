import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { S as Navigate, x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { g as ensureAgentProfile } from "./router-X-dUolla.mjs";
import { t as BrandMark } from "./brand-mark-DKxeE2Hw.mjs";
import { t as Button } from "./button-DiGjLxb5.mjs";
import { n as Label, t as Input } from "./label-BJs53ltp.mjs";
import { t as authClient } from "./client-IWHfIGH2.mjs";
import { n as useCurrentUserState } from "./use-current-user-BZLqO7zE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/signup-DZ8RWpyR.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Signup() {
	const { user, isPending } = useCurrentUserState();
	const [name, setName] = (0, import_react.useState)("");
	const [phone, setPhone] = (0, import_react.useState)("");
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
			const { error: err } = await authClient.signUp.email({
				email,
				password,
				name,
				callbackURL: "/dashboard"
			});
			if (err) {
				setError(err.message ?? "Could not create account.");
				return;
			}
			try {
				await ensureAgentProfile({ data: {
					displayName: name,
					phone
				} });
			} catch {}
			window.location.href = "/dashboard";
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not create account.");
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
					children: "Create your agent account"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "You get a dashboard and a public page at trusthouse.com/your-name."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "mt-6 grid gap-4",
					onSubmit,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "name",
								children: "Full name"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "name",
								required: true,
								autoComplete: "name",
								placeholder: "Adeola Okonkwo",
								value: name,
								onChange: (e) => setName(e.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "phone",
								children: "Phone number"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "phone",
								required: true,
								type: "tel",
								inputMode: "tel",
								autoComplete: "tel",
								placeholder: "0803 000 0000",
								value: phone,
								onChange: (e) => setPhone(e.target.value)
							})]
						}),
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
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "password",
									children: "Password"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "password",
									type: "password",
									autoComplete: "new-password",
									required: true,
									minLength: 8,
									value: password,
									onChange: (e) => setPassword(e.target.value)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted",
									children: "At least 8 characters."
								})
							]
						}),
						error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-danger",
							children: error
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							disabled: busy,
							size: "lg",
							children: busy ? "Creating account…" : "Create account"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-6 text-sm text-muted",
					children: [
						"Already registered?",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/login",
							className: "font-medium text-primary hover:underline",
							children: "Sign in"
						})
					]
				})
			]
		})
	});
}
//#endregion
export { Signup as component };
