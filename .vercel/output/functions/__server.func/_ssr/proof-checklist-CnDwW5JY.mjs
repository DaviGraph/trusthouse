import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { S as Check, d as Minus } from "../_libs/lucide-react.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { t as PROOF_ITEMS } from "./trust-BL5lrEZ6.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/proof-checklist-CnDwW5JY.js
var import_jsx_runtime = require_jsx_runtime();
function Textarea({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("flex min-h-28 w-full rounded-md bg-surface px-3 py-2.5 text-sm text-fg shadow-[0_0_0_1px_rgba(28,25,23,0.12)] outline-none transition-[box-shadow] duration-150 placeholder:text-faint focus-visible:shadow-[0_0_0_2px_rgba(15,92,69,0.35)] disabled:opacity-50", className),
		...props
	});
}
function ProofChecklist({ proofs }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "grid gap-2",
		children: PROOF_ITEMS.map((item) => {
			const done = proofs[item.key];
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: cn("flex items-start gap-3 rounded-lg bg-surface p-3 shadow-[0_0_0_1px_rgba(28,25,23,0.06)]", done ? "text-fg" : "text-muted"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("mt-0.5 grid size-5 shrink-0 place-items-center rounded-full", done ? "bg-verified text-primary-fg" : "bg-surface-2 text-faint"),
					children: done ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
						className: "size-3",
						strokeWidth: 3
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { className: "size-3" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block text-sm font-medium text-fg",
					children: item.label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mt-0.5 block text-xs leading-5 text-muted",
					children: item.hint
				})] })]
			}, item.key);
		})
	});
}
function ProofToggles({ proofs, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
		className: "grid gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
			className: "mb-1 text-sm font-medium",
			children: "Proofs of trust"
		}), PROOF_ITEMS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
			className: "flex cursor-pointer items-start gap-3 rounded-lg bg-surface p-3 shadow-[0_0_0_1px_rgba(28,25,23,0.06)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				type: "checkbox",
				className: "mt-1 size-4 accent-primary",
				checked: proofs[item.key],
				onChange: (e) => onChange({
					...proofs,
					[item.key]: e.target.checked
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block text-sm font-medium",
				children: item.label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mt-0.5 block text-xs leading-5 text-muted",
				children: item.hint
			})] })]
		}, item.key))]
	});
}
//#endregion
export { ProofToggles as n, Textarea as r, ProofChecklist as t };
