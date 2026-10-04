import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertCircle, BedDouble, Calendar, Clock, Copy, Home, Inbox, MapPin, MessageCircle, MoreVertical, RefreshCw, UserCheck } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getMyAgent } from "@/lib/server/agents";
import {
  listAgentRequirements,
  updateBuyerRequirementStatus,
  updateLeadFollowup,
} from "@/lib/server/requirements";
import type { Agent, BuyerRequirement } from "@/lib/types";
import { whatsappUrl } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardHome,
});

type TabStatus = "All" | "New" | "Contacted" | "Viewing Booked" | "Closed";

const STATUS_TABS: TabStatus[] = ["All", "New", "Contacted", "Viewing Booked", "Closed"];

export function DashboardHome() {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [stats, setStats] = useState({
    totalActiveLeads: 0,
    newInquiries: 0,
    overdueFollowups: 0,
  });
  const [requirements, setRequirements] = useState<BuyerRequirement[]>([]);
  const [activeTab, setActiveTab] = useState<TabStatus>("All");
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState("");
  const [savingPhone, setSavingPhone] = useState(false);

  async function refresh() {
    const [a, reqRes] = await Promise.all([
      getMyAgent(),
      listAgentRequirements(),
    ]);
    setAgent(a);
    setStats(reqRes.stats);
    setRequirements(reqRes.requirements);
    setPhone(a?.phone ?? "");
  }

  useEffect(() => {
    refresh()
      .catch(() => toast.error("Could not load CRM pipeline."))
      .finally(() => setLoading(false));
  }, []);

  async function onStatusChange(id: string, status: "New" | "Contacted" | "Viewing Booked" | "Closed") {
    try {
      await updateBuyerRequirementStatus({ data: { id, status } });
      toast.success(`Status updated to ${status}`);
      await refresh();
    } catch {
      toast.error("Could not update status.");
    }
  }

  async function onRescheduleFollowup(id: string, days: number, markContacted = false) {
    try {
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + days);
      await updateLeadFollowup({
        data: {
          id,
          followupDueDate: nextDate.toISOString(),
          status: markContacted ? "Contacted" : undefined,
        },
      });
      toast.success(markContacted ? "Marked as Contacted & reminder reset!" : `Follow-up postponed by ${days} days.`);
      await refresh();
    } catch {
      toast.error("Could not update follow-up date.");
    }
  }

  async function savePhone() {
    if (!agent) return;
    setSavingPhone(true);
    try {
      const { ensureAgentProfile } = await import("@/lib/server/agents");
      const next = await ensureAgentProfile({
        data: { displayName: agent.displayName, phone },
      });
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
    void navigator.clipboard.writeText(url);
    toast.success("Public link copied.");
  }

  const filteredRequirements = requirements.filter((req) => {
    if (activeTab === "All") return true;
    return req.status === activeTab;
  });

  if (loading) {
    return <div className="h-48 animate-pulse rounded-xl bg-surface-2" />;
  }

  return (
    <div className="mx-auto max-w-5xl">
      {/* Top Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold">Agent CRM Pipeline</h1>
          <p className="mt-1 text-sm text-muted">
            Manage buyer requirements, automated matches, and follow-up reminders.
          </p>
        </div>
        {agent ? (
          <div className="flex items-center gap-2">
            <code className="rounded-md bg-surface px-2.5 py-1.5 text-xs text-muted shadow-[0_0_0_1px_rgba(28,25,23,0.06)]">
              /{agent.slug}
            </code>
            <Button type="button" variant="secondary" size="sm" onClick={copyLink}>
              <Copy className="size-3.5" />
              Copy link
            </Button>
          </div>
        ) : null}
      </div>

      {/* Phone prompt banner */}
      {agent && !agent.phone ? (
        <div className="mt-6 rounded-xl bg-partial-bg p-4 text-partial">
          <p className="text-sm font-medium">Add the phone buyers should reach you on via WhatsApp.</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              className="h-11 flex-1 rounded-md bg-surface px-3 text-sm text-fg shadow-[0_0_0_1px_rgba(28,25,23,0.12)] outline-none"
              placeholder="0803 000 0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Button type="button" onClick={() => void savePhone()} disabled={savingPhone}>
              {savingPhone ? "Saving…" : "Save phone"}
            </Button>
          </div>
        </div>
      ) : null}

      {/* Top Header Metric Cards */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Total Active Leads"
          value={stats.totalActiveLeads}
          icon={<UserCheck className="size-4 text-primary" />}
        />
        <StatCard
          label="New Inquiries"
          value={stats.newInquiries}
          icon={<Inbox className="size-4 text-emerald-600" />}
        />
        <StatCard
          label="Overdue Follow-ups"
          value={stats.overdueFollowups}
          warn={stats.overdueFollowups > 0}
          icon={<AlertCircle className="size-4 text-danger" />}
        />
      </div>

      {/* Status Filter Tabs */}
      <div className="mt-8 border-b border-border">
        <div className="flex gap-2 overflow-x-auto pb-px">
          {STATUS_TABS.map((tab) => {
            const count =
              tab === "All"
                ? requirements.length
                : requirements.filter((r) => r.status === tab).length;

            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap",
                  activeTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-muted hover:text-fg",
                )}
              >
                {tab}
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-semibold",
                    activeTab === tab
                      ? "bg-primary/10 text-primary"
                      : "bg-surface-2 text-muted",
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Leads Pipeline List */}
      {filteredRequirements.length === 0 ? (
        <div className="mt-8 rounded-xl bg-surface px-6 py-14 text-center shadow-card">
          <p className="font-display text-lg font-semibold">No buyer requirements found</p>
          <p className="mt-2 text-sm text-muted">
            {activeTab === "All"
              ? "Share your public link. When buyers submit their property needs, they appear here."
              : `No leads currently marked as "${activeTab}".`}
          </p>
          <Button asChild className="mt-5">
            <Link to="/dashboard/listings/new">Add a new listing</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-6 grid gap-4">
          {filteredRequirements.map((req) => (
            <LeadRequirementCard
              key={req.id}
              req={req}
              agentName={agent?.displayName ?? "TrustHouse Agent"}
              onStatusChange={onStatusChange}
              onRescheduleFollowup={onRescheduleFollowup}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  warn,
}: {
  label: string;
  value: number;
  icon: ReactNode;
  warn?: boolean;
}) {
  return (
    <div className="rounded-xl bg-surface p-4 shadow-card">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{label}</p>
        {icon}
      </div>
      <p
        className={cn(
          "mt-2 font-display text-3xl font-semibold tabular-nums",
          warn && "text-danger",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function LeadRequirementCard({
  req,
  agentName,
  onStatusChange,
  onRescheduleFollowup,
}: {
  req: BuyerRequirement;
  agentName: string;
  onStatusChange: (id: string, status: "New" | "Contacted" | "Viewing Booked" | "Closed") => void;
  onRescheduleFollowup: (id: string, days: number, markContacted?: boolean) => void;
}) {
  const isClosed = req.status === "Closed";
  const now = new Date();
  const followupDate = req.followupDueDate ? new Date(req.followupDueDate) : null;

  const isOverdue = Boolean(followupDate && followupDate.getTime() < now.getTime() && !isClosed);
  const isDueToday = Boolean(
    followupDate &&
      followupDate.toDateString() === now.toDateString() &&
      !isOverdue &&
      !isClosed,
  );

  const whatsappReplyMsg = `Hello ${req.buyerName}, this is ${agentName} from TrustHouse. I noticed your request for a ${req.propertyType} in ${req.preferredLocation} (Budget: ₦${req.budgetMin.toLocaleString()} - ₦${req.budgetMax.toLocaleString()}). I have properties that match your criteria!`;

  const whatsappFollowupMsg = `Hi ${req.buyerName}, following up on your request for a ${req.propertyType} in ${req.preferredLocation}. Have you had a chance to review the property details?`;

  const waReplyHref = whatsappUrl(req.buyerPhone, whatsappReplyMsg);
  const waFollowupHref = whatsappUrl(req.buyerPhone, whatsappFollowupMsg);

  return (
    <article
      className={cn(
        "rounded-xl bg-surface p-5 shadow-card border transition-shadow hover:shadow-md",
        isOverdue ? "border-red-500/50 bg-red-500/5" : "border-border/60",
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-lg font-semibold">{req.buyerName}</h3>
            <StatusBadge status={req.status} />

            {/* Follow-up Reminder Indicators */}
            {isOverdue ? (
              <Badge className="bg-red-500/20 text-red-800 border-red-500/40 text-xs font-semibold">
                <AlertCircle className="mr-1 size-3 text-red-600" /> Overdue
              </Badge>
            ) : isDueToday ? (
              <Badge className="bg-amber-500/20 text-amber-800 border-amber-500/40 text-xs font-semibold">
                <Clock className="mr-1 size-3 text-amber-600" /> Due Today
              </Badge>
            ) : null}
          </div>
          <p className="mt-0.5 text-xs text-muted">{req.buyerPhone} {req.buyerEmail ? `· ${req.buyerEmail}` : ""}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            className="h-9 rounded-md border border-input bg-background px-2.5 text-xs font-medium shadow-xs outline-none"
            value={req.status}
            onChange={(e) => onStatusChange(req.id, e.target.value as any)}
          >
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Viewing Booked">Viewing Booked</option>
            <option value="Closed">Closed</option>
          </select>

          {/* Overdue Specific Action: Send Follow-Up CTA */}
          {isOverdue ? (
            <Button asChild variant="whatsapp" size="sm" className="bg-red-600 hover:bg-red-700 text-white">
              <a href={waFollowupHref} target="_blank" rel="noreferrer">
                <MessageCircle className="mr-1.5 size-4" />
                Send Follow-Up
              </a>
            </Button>
          ) : (
            <Button asChild variant="whatsapp" size="sm">
              <a href={waReplyHref} target="_blank" rel="noreferrer">
                <MessageCircle className="mr-1.5 size-4" />
                Reply on WhatsApp
              </a>
            </Button>
          )}

          {/* Quick Reschedule Action Dropdown */}
          <select
            className="h-9 rounded-md border border-input bg-background px-2 text-xs text-muted shadow-xs outline-none cursor-pointer"
            defaultValue=""
            onChange={(e) => {
              const val = e.target.value;
              if (val === "2days") onRescheduleFollowup(req.id, 2);
              if (val === "1week") onRescheduleFollowup(req.id, 7);
              if (val === "contacted") onRescheduleFollowup(req.id, 2, true);
              e.target.value = "";
            }}
          >
            <option value="" disabled>
              ⏰ Reschedule…
            </option>
            <option value="2days">Snooze 2 Days</option>
            <option value="1week">Snooze 1 Week</option>
            <option value="contacted">Mark Contacted & Reset</option>
          </select>
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4 rounded-lg bg-surface-2 p-3 text-xs">
        <div>
          <span className="text-muted block">Budget Range:</span>
          <span className="font-semibold text-fg">
            ₦{req.budgetMin ? req.budgetMin.toLocaleString() : "0"} - ₦{req.budgetMax.toLocaleString()}
          </span>
        </div>

        <div>
          <span className="text-muted block">Preferred Location:</span>
          <span className="font-semibold text-fg flex items-center gap-1">
            <MapPin className="size-3 text-muted" />
            {req.preferredLocation}
          </span>
        </div>

        <div>
          <span className="text-muted block">Property & Bedrooms:</span>
          <span className="font-semibold text-fg flex items-center gap-1">
            <BedDouble className="size-3 text-muted" />
            {req.bedrooms} Bed · {req.propertyType}
          </span>
        </div>

        <div>
          <span className="text-muted block">Timeline / Follow-up:</span>
          <span className="font-semibold text-fg flex items-center gap-1">
            <Clock className="size-3 text-muted" />
            {req.timeline} {followupDate && !isClosed ? `(Due ${followupDate.toLocaleDateString()})` : ""}
          </span>
        </div>
      </div>
    </article>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "New":
      return <Badge className="bg-emerald-500/15 text-emerald-800 border-emerald-500/30">New</Badge>;
    case "Contacted":
      return <Badge className="bg-blue-500/15 text-blue-800 border-blue-500/30">Contacted</Badge>;
    case "Viewing Booked":
      return <Badge className="bg-purple-500/15 text-purple-800 border-purple-500/30">Viewing Booked</Badge>;
    case "Closed":
      return <Badge className="bg-neutral-500/15 text-neutral-800 border-neutral-500/30">Closed</Badge>;
    default:
      return <Badge className="bg-neutral-500/15 text-neutral-800 border-neutral-500/30">{status}</Badge>;
  }
}
