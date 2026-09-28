import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { x as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { _ as Inbox, b as Copy, p as MessageCircle, v as House, x as CircleAlert } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { _ as getMyAgent } from "./router-X-dUolla.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { t as Button } from "./button-DiGjLxb5.mjs";
import { i as whatsappUrl } from "./format-B_1iMEnz.mjs";
import { a as updateInquiryStatus, i as updateInquiryFollowUp, n as dashboardStats, r as listMyInquiries } from "./inquiries-DP6HxWwZ.mjs";
import { t as formatDistanceToNow } from "../_libs/date-fns.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dashboard.index-7R8WElik.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var LEAD_STATUS_LABEL = {
	new: "New",
	contacted: "Contacted",
	viewing_booked: "Viewing Booked",
	closed: "Closed"
};
var LEAD_STATUSES = [
	"new",
	"contacted",
	"viewing_booked",
	"closed"
];
function DashboardHome() {
	const [agent, setAgent] = (0, import_react.useState)(null);
	const [stats, setStats] = (0, import_react.useState)({
		openInquiries: 0,
		overdueFollowups: 0,
		listingCount: 0
	});
	const [leads, setLeads] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [phone, setPhone] = (0, import_react.useState)("");
	const [savingPhone, setSavingPhone] = (0, import_react.useState)(false);
	async function refresh() {
		const [a, s, l] = await Promise.all([
			getMyAgent(),
			dashboardStats(),
			listMyInquiries()
		]);
		setAgent(a);
		setStats(s);
		setLeads(l);
		setPhone(a?.phone ?? "");
	}
	(0, import_react.useEffect)(() => {
		refresh().catch(() => toast.error("Could not load dashboard.")).finally(() => setLoading(false));
	}, []);
	async function onStatus(id, status) {
		await updateInquiryStatus({ data: {
			id,
			status
		} });
		await refresh();
	}
	async function onFollowUp(id, value) {
		if (!value) return;
		await updateInquiryFollowUp({ data: {
			id,
			followUpDue: new Date(value).toISOString()
		} });
		await refresh();
	}
	async function savePhone() {
		if (!agent) return;
		setSavingPhone(true);
		try {
			const { ensureAgentProfile } = await import("../_libs/_.mjs").then((n) => n.t);
			const next = await ensureAgentProfile({ data: {
				displayName: agent.displayName,
				phone
			} });
			setAgent(next);
			toast.success("Phone saved.");
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Could not save phone.");
		} finally {
			setSavingPhone(false);
		}
	}
	function copyLink() {
		if (!agent) return;
		const url = `${window.location.origin}/${agent.slug}`;
		navigator.clipboard.writeText(url);
		toast.success("Public link copied.");
	}
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-48 animate-pulse rounded-xl bg-surface-2" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-5xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl font-semibold",
					children: "Leads"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "Every buyer inquiry on your listings."
				})] }), agent ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("code", {
						className: "rounded-md bg-surface px-2.5 py-1.5 text-xs text-muted shadow-[0_0_0_1px_rgba(28,25,23,0.06)]",
						children: ["/", agent.slug]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: "secondary",
						size: "sm",
						onClick: copyLink,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-3.5" }), "Copy link"]
					})]
				}) : null]
			}),
			agent && !agent.phone ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 rounded-xl bg-partial-bg p-4 text-partial",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium",
					children: "Add the phone buyers should reach you on."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex flex-col gap-2 sm:flex-row",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "h-11 flex-1 rounded-md bg-surface px-3 text-sm text-fg shadow-[0_0_0_1px_rgba(28,25,23,0.12)] outline-none",
						placeholder: "0803 000 0000",
						value: phone,
						onChange: (e) => setPhone(e.target.value)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						onClick: () => void savePhone(),
						disabled: savingPhone,
						children: savingPhone ? "Saving…" : "Save phone"
					})]
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 grid gap-3 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Open inquiries",
						value: stats.openInquiries,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Inbox, { className: "size-4 text-primary" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Overdue follow-ups",
						value: stats.overdueFollowups,
						warn: stats.overdueFollowups > 0,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-4 text-danger" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Listings",
						value: stats.listingCount,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, { className: "size-4 text-primary" })
					})
				]
			}),
			leads.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-10 rounded-xl bg-surface px-6 py-14 text-center shadow-card",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-lg font-semibold",
						children: "No inquiries yet"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: "Share your public link. When a buyer inquires, they appear here."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						className: "mt-5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/dashboard/listings/new",
							children: "Add a listing"
						})
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-8 grid gap-3 md:hidden",
				children: leads.map((lead) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LeadCard, {
					lead,
					agentName: agent?.displayName ?? "TrustHouse agent",
					onStatus,
					onFollowUp
				}, lead.id))
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-8 hidden overflow-hidden rounded-xl bg-surface shadow-card md:block",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full text-left text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "bg-bg text-xs font-medium uppercase tracking-wide text-muted",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3",
								children: "Buyer"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3",
								children: "Property"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3",
								children: "Status"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3",
								children: "Follow-up"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "px-4 py-3" })
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: leads.map((lead) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-t border-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "px-4 py-3 align-top",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-medium",
										children: lead.buyerName
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted",
										children: lead.buyerPhone
									}),
									lead.message ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 max-w-xs text-xs text-muted",
										children: lead.message
									}) : null
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "px-4 py-3 align-top",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: lead.listingTitle }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted",
									children: lead.listingArea
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3 align-top",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusSelect, {
									value: lead.status,
									onChange: (s) => void onStatus(lead.id, s)
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3 align-top",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FollowUpField, {
									lead,
									onChange: (v) => void onFollowUp(lead.id, v)
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3 align-top",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WhatsAppButton, {
									lead,
									agentName: agent?.displayName ?? "TrustHouse agent"
								})
							})
						]
					}, lead.id)) })]
				})
			})] })
		]
	});
}
function StatCard({ label, value, icon, warn }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl bg-surface p-4 shadow-card",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: label
			}), icon]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: cn("mt-2 font-display text-3xl font-semibold tabular-nums", warn && "text-danger"),
			children: value
		})]
	});
}
function StatusSelect({ value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
		className: "h-11 min-w-[10.5rem] rounded-md bg-bg px-2 text-sm shadow-[0_0_0_1px_rgba(28,25,23,0.1)] outline-none",
		value,
		onChange: (e) => onChange(e.target.value),
		children: LEAD_STATUSES.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
			value: s,
			children: LEAD_STATUS_LABEL[s]
		}, s))
	});
}
function FollowUpField({ lead, onChange }) {
	const local = lead.followUpDue ? toLocalInput(lead.followUpDue) : "";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		type: "datetime-local",
		className: cn("h-11 rounded-md bg-bg px-2 text-sm shadow-[0_0_0_1px_rgba(28,25,23,0.1)] outline-none", lead.overdue && "text-danger"),
		value: local,
		onChange: (e) => onChange(e.target.value)
	}), lead.followUpDue ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: cn("mt-1 text-xs", lead.overdue ? "font-medium text-danger" : "text-muted"),
		children: [lead.overdue ? "Overdue · " : "Due ", formatDistanceToNow(new Date(lead.followUpDue), { addSuffix: true })]
	}) : null] });
}
function WhatsAppButton({ lead, agentName }) {
	const href = whatsappUrl(lead.buyerPhone, `Hello ${lead.buyerName}, this is ${agentName} from TrustHouse regarding ${lead.listingTitle}.`);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
		asChild: true,
		variant: "whatsapp",
		size: "sm",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
			href,
			target: "_blank",
			rel: "noreferrer",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-3.5" }), "Reply on WhatsApp"]
		})
	});
}
function LeadCard({ lead, agentName, onStatus, onFollowUp }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "rounded-xl bg-surface p-4 shadow-card",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-medium",
					children: lead.buyerName
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted",
					children: lead.buyerPhone
				})] }), lead.overdue ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs font-medium text-danger",
					children: "Overdue"
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm",
				children: lead.listingTitle
			}),
			lead.message ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-muted",
				children: lead.message
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 grid gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusSelect, {
						value: lead.status,
						onChange: (s) => onStatus(lead.id, s)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FollowUpField, {
						lead,
						onChange: (v) => onFollowUp(lead.id, v)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WhatsAppButton, {
						lead,
						agentName
					})
				]
			})
		]
	});
}
function toLocalInput(iso) {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return "";
	const pad = (n) => String(n).padStart(2, "0");
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
//#endregion
export { DashboardHome as component };
