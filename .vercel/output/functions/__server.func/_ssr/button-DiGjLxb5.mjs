import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { t as Slot } from "../_libs/radix-ui__react-slot.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/button-DiGjLxb5.js
var import_jsx_runtime = require_jsx_runtime();
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-[color,background-color,box-shadow,transform,opacity] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-50 active:not-disabled:scale-[0.96] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
	variants: {
		variant: {
			primary: "bg-primary text-primary-fg hover:bg-primary-hover shadow-sm",
			secondary: "bg-surface text-fg shadow-[0_0_0_1px_rgba(28,25,23,0.08)] hover:bg-surface-2",
			ghost: "text-fg hover:bg-surface-2",
			outline: "bg-transparent text-fg shadow-[0_0_0_1px_rgba(28,25,23,0.12)] hover:bg-surface",
			danger: "bg-danger text-primary-fg hover:opacity-90",
			whatsapp: "bg-whatsapp text-whatsapp-fg hover:bg-whatsapp-hover"
		},
		size: {
			sm: "h-9 px-3 text-sm",
			md: "h-11 px-4 text-sm",
			lg: "h-12 px-5 text-base",
			icon: "size-11"
		}
	},
	defaultVariants: {
		variant: "primary",
		size: "md"
	}
});
function Button({ className, variant, size, asChild = false, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		...props
	});
}
//#endregion
export { Button as t };
