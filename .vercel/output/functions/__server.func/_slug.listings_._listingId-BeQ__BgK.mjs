import { o as __toESM } from "./_runtime.mjs";
import { n as require_react } from "./_libs/@radix-ui/react-compose-refs+[...].mjs";
import { x as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "./_libs/react+tanstack__react-query.mjs";
import { O as ArrowLeft, T as Bath, f as MessageSquare, h as MapPin, w as BedDouble } from "./_libs/lucide-react.mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { a as Route$11, r as Route$3 } from "./_ssr/router-X-dUolla.mjs";
import { t as cn } from "./_ssr/utils-C_uf36nf.mjs";
import { t as Button } from "./_ssr/button-DiGjLxb5.mjs";
import { n as formatNairaYear } from "./_ssr/format-B_1iMEnz.mjs";
import { t as TrustBadge } from "./_ssr/trust-badge-BOk_MVZm.mjs";
import { n as Label, t as Input } from "./_ssr/label-BJs53ltp.mjs";
import { r as Textarea, t as ProofChecklist } from "./_ssr/proof-checklist-CnDwW5JY.mjs";
import { t as createInquiry } from "./_ssr/inquiries-DP6HxWwZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_slug.listings_._listingId-BeQ__BgK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function InquireDialog({ listingId, listingTitle, triggerClassName }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [pending, setPending] = (0, import_react.useState)(false);
	const [name, setName] = (0, import_react.useState)("");
	const [phone, setPhone] = (0, import_react.useState)("");
	const [message, setMessage] = (0, import_react.useState)("");
	async function onSubmit(e) {
		e.preventDefault();
		setPending(true);
		try {
			await createInquiry({ data: {
				listingId,
				buyerName: name,
				buyerPhone: phone,
				message
			} });
			toast.success("Inquiry sent. The agent will reach you on WhatsApp or phone.");
			setOpen(false);
			setName("");
			setPhone("");
			setMessage("");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not send inquiry.");
		} finally {
			setPending(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
		type: "button",
		className: triggerClassName,
		onClick: () => setOpen(true),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, {}), "Inquire"]
	}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "absolute inset-0 bg-fg/40",
			"aria-label": "Close",
			onClick: () => setOpen(false)
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			role: "dialog",
			"aria-labelledby": "inquire-title",
			className: cn("relative z-10 w-full rounded-t-xl bg-surface p-5 shadow-card sm:max-w-md sm:rounded-xl"),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					id: "inquire-title",
					className: "font-display text-xl font-semibold",
					children: "Inquire about this home"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: listingTitle
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "mt-5 grid gap-4",
					onSubmit,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "buyer-name",
								children: "Your name"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "buyer-name",
								required: true,
								autoComplete: "name",
								value: name,
								onChange: (e) => setName(e.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "buyer-phone",
								children: "Phone number"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "buyer-phone",
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
								htmlFor: "buyer-message",
								children: "Message"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								id: "buyer-message",
								placeholder: "When can I view, and is the rent still this amount?",
								value: message,
								onChange: (e) => setMessage(e.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2 pt-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "secondary",
								className: "flex-1",
								onClick: () => setOpen(false),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								className: "flex-1",
								disabled: pending,
								children: pending ? "Sending…" : "Send inquiry"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted",
							children: "No account needed. The agent sees this as a lead."
						})
					]
				})
			]
		})]
	}) : null] });
}
function ListingDetail() {
	const { agent } = Route$11.useLoaderData();
	const { listing } = Route$3.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto max-w-5xl px-4 py-6 sm:py-10",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			to: "/$slug/listings",
			params: { slug: agent.slug },
			className: "inline-flex h-11 items-center gap-2 text-sm text-muted hover:text-fg",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), "All listings"]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 overflow-hidden rounded-xl bg-surface shadow-card",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative aspect-[16/10] bg-surface-2 sm:aspect-[2/1]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: listing.photoUrl,
					alt: listing.title,
					className: "size-full object-cover"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute top-4 left-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrustBadge, { level: listing.trust })
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-8 p-5 sm:p-8 lg:grid-cols-[1.2fr_0.8fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-3xl font-semibold",
						children: listing.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 flex items-center gap-1.5 text-muted",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-4" }),
							listing.area,
							", Lagos"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 font-display text-2xl font-semibold tabular-nums",
						children: formatNairaYear(listing.yearlyRent)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex gap-4 text-sm text-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BedDouble, { className: "size-4" }),
								listing.bedrooms,
								" bed"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bath, { className: "size-4" }),
								listing.bathrooms,
								" bath"
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-6 text-[0.95rem] leading-7 text-fg/90",
						children: listing.description
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-6 lg:hidden",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InquireDialog, {
							listingId: listing.id,
							listingTitle: listing.title,
							triggerClassName: "w-full"
						})
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-lg font-semibold",
						children: "Proof checklist"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 mb-4 text-sm text-muted",
						children: [
							"What ",
							agent.displayName.split(" ")[0],
							" has personally confirmed."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProofChecklist, { proofs: listing }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-6 hidden lg:block",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InquireDialog, {
							listingId: listing.id,
							listingTitle: listing.title,
							triggerClassName: "w-full"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-4 text-xs text-muted",
						children: [
							"Listed by ",
							agent.displayName,
							". Inquiries go straight to this agent."
						]
					})
				] })]
			})]
		})]
	});
}
//#endregion
export { ListingDetail as component };
