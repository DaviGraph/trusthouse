import { createFileRoute, Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import { AlertCircle, Copy, Home, Inbox, MessageCircle } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getMyAgent } from "@/lib/server/agents";
import {
  dashboardStats,
  listMyInquiries,
  updateInquiryFollowUp,
  updateInquiryStatus,
} from "@/lib/server/inquiries";
import { LEAD_STATUS_LABEL, LEAD_STATUSES, type Agent, type Inquiry, type LeadStatus } from "@/lib/types";
import { whatsappUrl } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardHome,
});

function DashboardHome() {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [stats, setStats] = useState({ openInquiries: 0, overdueFollowups: 0, listingCount: 0 });
  const [leads, setLeads] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState("");
  const [savingPhone, setSavingPhone] = useState(false);

  async function refresh() {
    const [a, s, l] = await Promise.all([getMyAgent(), dashboardStats(), listMyInquiries()]);
    setAgent(a);
    setStats(s);
    setLeads(l);
    setPhone(a?.phone ?? "");
  }

  useEffect(() => {
    refresh()
      .catch(() => toast.error("Could not load dashboard."))
      .finally(() => setLoading(false));
  }, []);

  async function onStatus(id: number, status: LeadStatus) {
    await updateInquiryStatus({ data: { id, status } });
    await refresh();
  }

  async function onFollowUp(id: number, value: string) {
    if (!value) return;
    await updateInquiryFollowUp({ data: { id, followUpDue: new Date(value).toISOString() } });
    await refresh();
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

  if (loading) {
    return <div className="h-48 animate-pulse rounded-xl bg-surface-2" />;
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold">Leads</h1>
          <p className="mt-1 text-sm text-muted">Every buyer inquiry on your listings.</p>
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

      {agent && !agent.phone ? (
        <div className="mt-6 rounded-xl bg-partial-bg p-4 text-partial">
          <p className="text-sm font-medium">Add the phone buyers should reach you on.</p>
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

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Open inquiries"
          value={stats.openInquiries}
          icon={<Inbox className="size-4 text-primary" />}
        />
        <StatCard
          label="Overdue follow-ups"
          value={stats.overdueFollowups}
          warn={stats.overdueFollowups > 0}
          icon={<AlertCircle className="size-4 text-danger" />}
        />
        <StatCard
          label="Listings"
          value={stats.listingCount}
          icon={<Home className="size-4 text-primary" />}
        />
      </div>

      {leads.length === 0 ? (
        <div className="mt-10 rounded-xl bg-surface px-6 py-14 text-center shadow-card">
          <p className="font-display text-lg font-semibold">No inquiries yet</p>
          <p className="mt-2 text-sm text-muted">
            Share your public link. When a buyer inquires, they appear here.
          </p>
          <Button asChild className="mt-5">
            <Link to="/dashboard/listings/new">Add a listing</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-3 md:hidden">
            {leads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                agentName={agent?.displayName ?? "TrustHouse agent"}
                onStatus={onStatus}
                onFollowUp={onFollowUp}
              />
            ))}
          </div>
          <div className="mt-8 hidden overflow-hidden rounded-xl bg-surface shadow-card md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-bg text-xs font-medium uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">Buyer</th>
                  <th className="px-4 py-3">Property</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Follow-up</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-t border-border">
                    <td className="px-4 py-3 align-top">
                      <p className="font-medium">{lead.buyerName}</p>
                      <p className="text-xs text-muted">{lead.buyerPhone}</p>
                      {lead.message ? (
                        <p className="mt-1 max-w-xs text-xs text-muted">{lead.message}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <p>{lead.listingTitle}</p>
                      <p className="text-xs text-muted">{lead.listingArea}</p>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <StatusSelect value={lead.status} onChange={(s) => void onStatus(lead.id, s)} />
                    </td>
                    <td className="px-4 py-3 align-top">
                      <FollowUpField lead={lead} onChange={(v) => void onFollowUp(lead.id, v)} />
                    </td>
                    <td className="px-4 py-3 align-top">
                      <WhatsAppButton lead={lead} agentName={agent?.displayName ?? "TrustHouse agent"} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
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

function StatusSelect({
  value,
  onChange,
}: {
  value: LeadStatus;
  onChange: (s: LeadStatus) => void;
}) {
  return (
    <select
      className="h-11 min-w-[10.5rem] rounded-md bg-bg px-2 text-sm shadow-[0_0_0_1px_rgba(28,25,23,0.1)] outline-none"
      value={value}
      onChange={(e) => onChange(e.target.value as LeadStatus)}
    >
      {LEAD_STATUSES.map((s) => (
        <option key={s} value={s}>
          {LEAD_STATUS_LABEL[s]}
        </option>
      ))}
    </select>
  );
}

function FollowUpField({
  lead,
  onChange,
}: {
  lead: Inquiry;
  onChange: (value: string) => void;
}) {
  const local = lead.followUpDue ? toLocalInput(lead.followUpDue) : "";
  return (
    <div>
      <input
        type="datetime-local"
        className={cn(
          "h-11 rounded-md bg-bg px-2 text-sm shadow-[0_0_0_1px_rgba(28,25,23,0.1)] outline-none",
          lead.overdue && "text-danger",
        )}
        value={local}
        onChange={(e) => onChange(e.target.value)}
      />
      {lead.followUpDue ? (
        <p className={cn("mt-1 text-xs", lead.overdue ? "font-medium text-danger" : "text-muted")}>
          {lead.overdue ? "Overdue · " : "Due "}
          {formatDistanceToNow(new Date(lead.followUpDue), { addSuffix: true })}
        </p>
      ) : null}
    </div>
  );
}

function WhatsAppButton({ lead, agentName }: { lead: Inquiry; agentName: string }) {
  const href = whatsappUrl(
    lead.buyerPhone,
    `Hello ${lead.buyerName}, this is ${agentName} from TrustHouse regarding ${lead.listingTitle}.`,
  );
  return (
    <Button asChild variant="whatsapp" size="sm">
      <a href={href} target="_blank" rel="noreferrer">
        <MessageCircle className="size-3.5" />
        Reply on WhatsApp
      </a>
    </Button>
  );
}

function LeadCard({
  lead,
  agentName,
  onStatus,
  onFollowUp,
}: {
  lead: Inquiry;
  agentName: string;
  onStatus: (id: number, status: LeadStatus) => void;
  onFollowUp: (id: number, value: string) => void;
}) {
  return (
    <article className="rounded-xl bg-surface p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium">{lead.buyerName}</p>
          <p className="text-xs text-muted">{lead.buyerPhone}</p>
        </div>
        {lead.overdue ? (
          <span className="text-xs font-medium text-danger">Overdue</span>
        ) : null}
      </div>
      <p className="mt-2 text-sm">{lead.listingTitle}</p>
      {lead.message ? <p className="mt-1 text-xs text-muted">{lead.message}</p> : null}
      <div className="mt-3 grid gap-2">
        <StatusSelect value={lead.status} onChange={(s) => onStatus(lead.id, s)} />
        <FollowUpField lead={lead} onChange={(v) => onFollowUp(lead.id, v)} />
        <WhatsAppButton lead={lead} agentName={agentName} />
      </div>
    </article>
  );
}

function toLocalInput(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
