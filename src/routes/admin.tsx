import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowRight,
  ArrowUpRight,
  Ban,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  FileCheck,
  FileText,
  Filter,
  Flame,
  LayoutDashboard,
  LogOut,
  Mail,
  MessageCircle,
  MessageSquare,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Star,
  Trash2,
  UserCheck,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { clearAdminToken, getAdminToken } from "@/lib/admin-session";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BrandMark } from "@/components/brand-mark";
import { formatNairaYear, toWhatsAppDigits, whatsappUrl } from "@/lib/format";
import {
  createClientReview,
  deleteListingAdmin,
  deleteReviewAdmin,
  getAdminAgents,
  getAdminClientReviews,
  getAdminIdReviews,
  getAdminInquiries,
  getAdminListings,
  getAdminOverview,
  toggleAgentSuspension,
  updateAgentIdVerification,
  updateListingAdmin,
  updateReviewStatus,
} from "@/lib/server/admin";
import type {
  AdminAgentItem,
  AdminOverviewStats,
  ClientReview,
  IdVerificationStatus,
  Inquiry,
  Listing,
  ReviewStatus,
  TrustLevel,
} from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  component: AdminDashboardPage,
});

type AdminTab = "overview" | "agent-review-id" | "agent-list" | "listing-overview" | "client-review" | "inquiries";

function TrustBadge({ trust }: { trust: TrustLevel }) {
  if (trust === "verified") {
    return (
      <Badge className="border border-emerald-500/30 bg-emerald-500/15 text-emerald-800 text-xs font-semibold">
        <CheckCircle2 className="mr-1 size-3 text-emerald-700" />
        Verified
      </Badge>
    );
  }
  if (trust === "partial") {
    return (
      <Badge className="border border-amber-500/30 bg-amber-500/15 text-amber-900 text-xs font-medium">
        <Clock className="mr-1 size-3 text-amber-700" />
        Partial proof
      </Badge>
    );
  }
  return (
    <Badge className="border border-border bg-surface-2 text-muted text-xs font-normal">
      <ShieldAlert className="mr-1 size-3 text-faint" />
      Unverified
    </Badge>
  );
}

function IdStatusBadge({ status }: { status: IdVerificationStatus }) {
  if (status === "verified") {
    return (
      <Badge className="border border-emerald-500/30 bg-emerald-500/15 text-emerald-800 font-semibold text-xs">
        <ShieldCheck className="mr-1 size-3 text-emerald-700" />
        Verified ID
      </Badge>
    );
  }
  if (status === "pending_review") {
    return (
      <Badge className="border border-amber-500/40 bg-amber-500/15 text-amber-900 font-medium text-xs">
        <Clock className="mr-1 size-3 text-amber-700" />
        Pending Review
      </Badge>
    );
  }
  return (
    <Badge className="border border-border bg-surface-2 text-muted font-normal text-xs">
      Not Submitted
    </Badge>
  );
}

function ReviewStatusBadge({ status }: { status: ReviewStatus }) {
  if (status === "published") {
    return (
      <Badge className="border border-emerald-500/30 bg-emerald-500/15 text-emerald-800 text-xs font-medium">
        Published
      </Badge>
    );
  }
  if (status === "pending") {
    return (
      <Badge className="border border-amber-500/30 bg-amber-500/15 text-amber-900 text-xs font-medium">
        Pending
      </Badge>
    );
  }
  return (
    <Badge className="border border-danger/30 bg-danger/10 text-danger text-xs font-medium">
      Flagged
    </Badge>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            "size-3.5",
            i <= rating ? "fill-amber-400 text-amber-400" : "fill-border text-border",
          )}
        />
      ))}
    </div>
  );
}

function AdminDashboardPage() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [currentTab, setCurrentTab] = useState<AdminTab>("overview");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Auth guard: check token on mount
  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      void navigate({ to: "/login" });
    } else {
      setAuthed(true);
    }
  }, [navigate]);

  // Overview data
  const [stats, setStats] = useState<AdminOverviewStats>({
    totalAgents: 0,
    verifiedAgents: 0,
    pendingIdReviews: 0,
    totalListings: 0,
    totalInquiries: 0,
    totalReviews: 0,
    avgRating: 5.0,
  });
  const [recentIdQueue, setRecentIdQueue] = useState<AdminAgentItem[]>([]);
  const [recentListings, setRecentListings] = useState<Listing[]>([]);
  const [recentReviews, setRecentReviews] = useState<ClientReview[]>([]);

  // Agent Review ID data
  const [idReviews, setIdReviews] = useState<AdminAgentItem[]>([]);
  const [idFilter, setIdFilter] = useState<string>("all");
  const [inspectingAgent, setInspectingAgent] = useState<AdminAgentItem | null>(null);
  const [rejectingAgent, setRejectingAgent] = useState<AdminAgentItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processingId, setProcessingId] = useState(false);

  // Agent List data
  const [agents, setAgents] = useState<AdminAgentItem[]>([]);
  const [agentSearch, setAgentSearch] = useState("");
  const [agentStatusFilter, setAgentStatusFilter] = useState("all");

  // Listing Overview data
  const [listings, setListings] = useState<Listing[]>([]);
  const [listingSearch, setListingSearch] = useState("");
  const [listingAreaFilter, setListingAreaFilter] = useState("all");
  const [listingTrustFilter, setListingTrustFilter] = useState("all");
  const [deletingListingId, setDeletingListingId] = useState<number | null>(null);

  // Client Review data
  const [clientReviews, setClientReviews] = useState<ClientReview[]>([]);
  const [reviewSearch, setReviewSearch] = useState("");
  const [reviewStatusFilter, setReviewStatusFilter] = useState("all");
  const [reviewRatingFilter, setReviewRatingFilter] = useState<number>(0);
  const [showAddReviewModal, setShowAddReviewModal] = useState(false);
  const [newReviewForm, setNewReviewForm] = useState({
    agentUserId: "",
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    clientRole: "Tenant",
    rating: 5,
    title: "",
    comment: "",
  });

  // Inquiries data
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);

  async function loadOverview() {
    const res = await getAdminOverview();
    setStats(res.stats);
    setRecentIdQueue(res.recentIdQueue);
    setRecentListings(res.recentListings);
    setRecentReviews(res.recentReviews);
  }

  async function loadIdReviews() {
    const res = await getAdminIdReviews({ data: idFilter });
    setIdReviews(res);
  }

  async function loadAgents() {
    const res = await getAdminAgents({
      data: { query: agentSearch, status: agentStatusFilter },
    });
    setAgents(res);
  }

  async function loadListings() {
    const res = await getAdminListings({
      data: {
        query: listingSearch,
        area: listingAreaFilter,
        trust: listingTrustFilter,
      },
    });
    setListings(res);
  }

  async function loadClientReviews() {
    const res = await getAdminClientReviews({
      data: {
        query: reviewSearch,
        status: reviewStatusFilter,
        rating: reviewRatingFilter,
      },
    });
    setClientReviews(res);
  }

  async function loadInquiries() {
    const res = await getAdminInquiries();
    setInquiries(res);
  }

  async function refreshAll() {
    setRefreshing(true);
    try {
      await Promise.all([
        loadOverview(),
        loadIdReviews(),
        loadAgents(),
        loadListings(),
        loadClientReviews(),
        loadInquiries(),
      ]);
    } catch (err) {
      toast.error("Could not refresh admin data.");
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }

  useEffect(() => {
    void refreshAll();
  }, []);

  // When tab changes, load specific tab data if needed
  useEffect(() => {
    if (currentTab === "agent-review-id") void loadIdReviews();
    if (currentTab === "agent-list") void loadAgents();
    if (currentTab === "listing-overview") void loadListings();
    if (currentTab === "client-review") void loadClientReviews();
    if (currentTab === "inquiries") void loadInquiries();
  }, [currentTab, idFilter, agentStatusFilter, listingAreaFilter, listingTrustFilter, reviewStatusFilter, reviewRatingFilter]);

  // Handle agent ID review approve
  async function handleApproveId(agentUserId: string) {
    setProcessingId(true);
    try {
      await updateAgentIdVerification({
        data: { agentUserId, status: "verified" },
      });
      toast.success("Agent ID approved! Verified badge activated.");
      setInspectingAgent(null);
      void refreshAll();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to approve ID.");
    } finally {
      setProcessingId(false);
    }
  }

  // Handle agent ID review reject
  async function handleRejectId() {
    if (!rejectingAgent) return;
    setProcessingId(true);
    try {
      await updateAgentIdVerification({
        data: {
          agentUserId: rejectingAgent.userId,
          status: "not_submitted",
          rejectionReason: rejectionReason.trim() || "ID document unclear or unreadable.",
        },
      });
      toast.success("ID rejected with notification recorded.");
      setRejectingAgent(null);
      setRejectionReason("");
      setInspectingAgent(null);
      void refreshAll();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reject ID.");
    } finally {
      setProcessingId(false);
    }
  }

  // Toggle suspension
  async function handleToggleSuspend(agentUserId: string, currentSuspended: boolean) {
    try {
      await toggleAgentSuspension({
        data: { agentUserId, isSuspended: !currentSuspended },
      });
      toast.success(currentSuspended ? "Agent reactivated." : "Agent account suspended.");
      void loadAgents();
    } catch (err) {
      toast.error("Action failed.");
    }
  }

  // Toggle featured listing
  async function handleToggleFeatured(listingId: number, currentFeatured: boolean) {
    try {
      await updateListingAdmin({
        data: { id: listingId, isFeatured: !currentFeatured },
      });
      toast.success(!currentFeatured ? "Listing featured on marketplace." : "Listing unfeatured.");
      void loadListings();
    } catch (err) {
      toast.error("Failed to update listing.");
    }
  }

  // Toggle listing proof
  async function handleToggleProof(listingId: number, proofKey: "proofIdChecked" | "proofOwnershipSeen" | "proofOnsiteVisit" | "proofOwnerPhone", val: boolean) {
    try {
      await updateListingAdmin({
        data: { id: listingId, [proofKey]: !val },
      });
      toast.success("Verification proof updated.");
      void loadListings();
    } catch (err) {
      toast.error("Failed to update proof.");
    }
  }

  // Delete listing
  async function handleDeleteListing(id: number) {
    try {
      await deleteListingAdmin({ data: { id } });
      toast.success("Listing removed from TrustHouse.");
      setDeletingListingId(null);
      void loadListings();
      void loadOverview();
    } catch (err) {
      toast.error("Could not delete listing.");
    }
  }

  // Update review status
  async function handleReviewStatus(id: number, status: ReviewStatus) {
    try {
      await updateReviewStatus({ data: { id, status } });
      toast.success(`Review ${status}.`);
      void loadClientReviews();
      void loadOverview();
    } catch (err) {
      toast.error("Failed to update review.");
    }
  }

  // Delete review
  async function handleDeleteReview(id: number) {
    try {
      await deleteReviewAdmin({ data: { id } });
      toast.success("Review deleted.");
      void loadClientReviews();
      void loadOverview();
    } catch (err) {
      toast.error("Failed to delete review.");
    }
  }

  // Create review
  async function handleCreateReview(e: React.FormEvent) {
    e.preventDefault();
    if (!newReviewForm.agentUserId) {
      toast.error("Please select an agent.");
      return;
    }
    if (!newReviewForm.clientName || !newReviewForm.title || !newReviewForm.comment) {
      toast.error("Please fill in all required review fields.");
      return;
    }
    try {
      await createClientReview({
        data: {
          agentUserId: newReviewForm.agentUserId,
          clientName: newReviewForm.clientName.trim(),
          clientEmail: newReviewForm.clientEmail.trim(),
          clientPhone: newReviewForm.clientPhone.trim(),
          clientRole: newReviewForm.clientRole,
          rating: newReviewForm.rating,
          title: newReviewForm.title.trim(),
          comment: newReviewForm.comment.trim(),
          status: "published",
          isVerifiedClient: true,
        },
      });
      toast.success("Client review added successfully.");
      setShowAddReviewModal(false);
      setNewReviewForm({
        agentUserId: "",
        clientName: "",
        clientEmail: "",
        clientPhone: "",
        clientRole: "Tenant",
        rating: 5,
        title: "",
        comment: "",
      });
      void loadClientReviews();
      void loadOverview();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create review.");
    }
  }

  // Unique areas from listings for filter
  const areas = useMemo(() => {
    const set = new Set<string>();
    listings.forEach((l) => set.add(l.area));
    return Array.from(set);
  }, [listings]);

  function handleLogout() {
    clearAdminToken();
    void navigate({ to: "/login" });
  }

  // Not yet checked auth
  if (authed === null) {
    return (
      <div className="min-h-dvh bg-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted">Verifying admin access…</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-dvh bg-bg p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="h-14 animate-pulse rounded-xl bg-surface-2" />
          <div className="grid gap-4 sm:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-xl bg-surface" />
            ))}
          </div>
          <div className="h-96 animate-pulse rounded-xl bg-surface" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-bg text-fg">
      {/* Top Admin Navigation Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <BrandMark />
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
              <ShieldCheck className="size-3.5" />
              <span>Admin Operations</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void refreshAll()}
              disabled={refreshing}
              className="text-xs"
            >
              <RefreshCw className={cn("mr-1.5 size-3.5", refreshing && "animate-spin")} />
              Refresh
            </Button>
            <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex text-xs">
              <Link to="/" target="_blank">
                <ExternalLink className="mr-1.5 size-3.5" />
                Live Site
              </Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-xs text-danger border-danger/30 hover:bg-danger/10"
            >
              <LogOut className="mr-1.5 size-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <nav className="flex space-x-1 overflow-x-auto pb-2 scrollbar-none sm:space-x-2">
            {[
              { id: "overview", label: "Overview", icon: LayoutDashboard },
              {
                id: "agent-review-id",
                label: "Agent Review ID",
                icon: FileCheck,
                badge: stats.pendingIdReviews > 0 ? stats.pendingIdReviews : undefined,
                badgeVariant: "amber",
              },
              {
                id: "agent-list",
                label: "Agent List",
                icon: Users,
                badge: stats.totalAgents,
              },
              {
                id: "listing-overview",
                label: "Listing Overview",
                icon: Building2,
                badge: stats.totalListings,
              },
              {
                id: "client-review",
                label: "Client Review",
                icon: Star,
                badge: stats.totalReviews,
              },
              {
                id: "inquiries",
                label: "Inquiries Stream",
                icon: MessageCircle,
                badge: stats.totalInquiries,
              },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setCurrentTab(tab.id as AdminTab)}
                  className={cn(
                    "flex h-9 shrink-0 items-center gap-2 rounded-md px-3 text-xs font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-fg shadow-sm"
                      : "text-muted hover:bg-surface-2 hover:text-fg",
                  )}
                >
                  <Icon className="size-3.5" />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined ? (
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.2 text-[10px] font-semibold leading-none",
                        isActive
                          ? "bg-white/20 text-white"
                          : tab.badgeVariant === "amber"
                            ? "bg-amber-500/20 text-amber-800"
                            : "bg-surface-2 text-muted",
                      )}
                    >
                      {tab.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* TAB 1: OVERVIEW */}
        {currentTab === "overview" && (
          <div className="space-y-8">
            {/* Alert banner if there are IDs to review */}
            {stats.pendingIdReviews > 0 ? (
              <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 sm:flex-row sm:items-center sm:p-5">
                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 size-5 shrink-0 text-amber-700" />
                  <div>
                    <h3 className="font-display font-semibold text-amber-950">
                      {stats.pendingIdReviews} Government ID{stats.pendingIdReviews > 1 ? "s" : ""} awaiting review
                    </h3>
                    <p className="mt-0.5 text-xs text-amber-900">
                      Agents have uploaded proof of identity. Review their documents to enable the verified badge on their listings.
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => setCurrentTab("agent-review-id")}
                  className="bg-amber-600 text-white hover:bg-amber-700 shrink-0 text-xs"
                >
                  Open Review Queue
                  <ArrowRight className="ml-1.5 size-3.5" />
                </Button>
              </div>
            ) : null}

            {/* KPI Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl bg-surface p-5 shadow-card">
                <div className="flex items-center justify-between text-muted">
                  <span className="text-xs font-medium uppercase tracking-wider">Agents</span>
                  <Users className="size-4 text-primary" />
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <span className="font-display text-3xl font-semibold">{stats.totalAgents}</span>
                  <span className="text-xs font-medium text-emerald-800">
                    {stats.verifiedAgents} verified
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted">
                  {Math.round((stats.verifiedAgents / Math.max(stats.totalAgents, 1)) * 100)}% verified rate
                </p>
              </div>

              <div className="rounded-xl bg-surface p-5 shadow-card">
                <div className="flex items-center justify-between text-muted">
                  <span className="text-xs font-medium uppercase tracking-wider">ID Review Queue</span>
                  <FileCheck className="size-4 text-amber-600" />
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <span className="font-display text-3xl font-semibold text-amber-900">
                    {stats.pendingIdReviews}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentTab("agent-review-id")}
                    className="h-7 text-xs text-primary"
                  >
                    View queue
                  </Button>
                </div>
                <p className="mt-1 text-xs text-muted">Requires compliance decision</p>
              </div>

              <div className="rounded-xl bg-surface p-5 shadow-card">
                <div className="flex items-center justify-between text-muted">
                  <span className="text-xs font-medium uppercase tracking-wider">Total Listings</span>
                  <Building2 className="size-4 text-primary" />
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <span className="font-display text-3xl font-semibold">{stats.totalListings}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentTab("listing-overview")}
                    className="h-7 text-xs text-primary"
                  >
                    Browse
                  </Button>
                </div>
                <p className="mt-1 text-xs text-muted">Active homes in Lagos</p>
              </div>

              <div className="rounded-xl bg-surface p-5 shadow-card">
                <div className="flex items-center justify-between text-muted">
                  <span className="text-xs font-medium uppercase tracking-wider">Client Reviews</span>
                  <Star className="size-4 text-amber-500 fill-amber-500" />
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <span className="font-display text-3xl font-semibold">{stats.totalReviews}</span>
                  <div className="flex items-center gap-1 font-semibold text-amber-700 text-sm">
                    <span>{stats.avgRating}</span>
                    <Star className="size-3.5 fill-amber-400 text-amber-400" />
                  </div>
                </div>
                <p className="mt-1 text-xs text-muted">Average platform client rating</p>
              </div>
            </div>

            {/* Quick Overview Grids */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* ID Queue Snapshot */}
              <div className="rounded-xl bg-surface p-5 shadow-card sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-base font-semibold">Agent ID Review Queue</h2>
                    <p className="text-xs text-muted">Pending identity verification submissions</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentTab("agent-review-id")}
                    className="text-xs"
                  >
                    View all
                    <ArrowRight className="ml-1 size-3" />
                  </Button>
                </div>

                <div className="mt-4 divide-y divide-border">
                  {recentIdQueue.length === 0 ? (
                    <div className="py-8 text-center text-xs text-muted">
                      No documents currently in queue.
                    </div>
                  ) : (
                    recentIdQueue.map((agent) => (
                      <div key={agent.userId} className="flex items-center justify-between py-3.5">
                        <div className="flex items-center gap-3">
                          {agent.avatarUrl ? (
                            <img
                              src={agent.avatarUrl}
                              alt=""
                              className="size-9 rounded-full object-cover ring-1 ring-border"
                            />
                          ) : (
                            <div className="grid size-9 place-items-center rounded-full bg-primary-soft text-xs font-semibold text-primary">
                              {agent.displayName.slice(0, 1).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium leading-tight">{agent.displayName}</p>
                            <p className="text-xs text-muted font-mono">/{agent.slug}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <IdStatusBadge status={agent.idVerificationStatus ?? "not_submitted"} />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setInspectingAgent(agent);
                              setCurrentTab("agent-review-id");
                            }}
                            className="h-8 text-xs"
                          >
                            Inspect
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Recent Client Reviews Snapshot */}
              <div className="rounded-xl bg-surface p-5 shadow-card sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-base font-semibold">Recent Client Reviews</h2>
                    <p className="text-xs text-muted">Direct feedback from buyers and tenants</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentTab("client-review")}
                    className="text-xs"
                  >
                    View all
                    <ArrowRight className="ml-1 size-3" />
                  </Button>
                </div>

                <div className="mt-4 divide-y divide-border">
                  {recentReviews.length === 0 ? (
                    <div className="py-8 text-center text-xs text-muted">No reviews recorded yet.</div>
                  ) : (
                    recentReviews.map((rev) => (
                      <div key={rev.id} className="py-3.5 space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-fg">{rev.clientName}</span>
                            <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[10px] text-muted">
                              {rev.clientRole}
                            </span>
                          </div>
                          <StarRating rating={rev.rating} />
                        </div>
                        <p className="text-xs font-medium text-fg line-clamp-1">"{rev.title}"</p>
                        <div className="flex items-center justify-between text-[11px] text-muted">
                          <span>For agent: {rev.agentName}</span>
                          <ReviewStatusBadge status={rev.status} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AGENT REVIEW ID */}
        {currentTab === "agent-review-id" && (
          <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h1 className="font-display text-2xl font-semibold">Agent Review ID</h1>
                <p className="mt-0.5 text-xs text-muted">
                  Verify government credentials submitted by Lagos real estate agents before issuing verified badges.
                </p>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 rounded-lg border border-border bg-surface p-1">
                {[
                  { id: "all", label: "All submissions" },
                  { id: "pending_review", label: "Pending review" },
                  { id: "verified", label: "Verified" },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setIdFilter(f.id)}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-xs font-medium transition",
                      idFilter === f.id
                        ? "bg-primary text-primary-fg"
                        : "text-muted hover:text-fg",
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Submissions List */}
            <div className="grid gap-4">
              {idReviews.length === 0 ? (
                <div className="rounded-xl bg-surface p-12 text-center shadow-card">
                  <ShieldCheck className="mx-auto size-10 text-muted" />
                  <h3 className="mt-3 font-display text-base font-semibold">No submissions found</h3>
                  <p className="mt-1 text-xs text-muted">
                    No agent documents currently match the "{idFilter}" filter.
                  </p>
                </div>
              ) : (
                idReviews.map((agent) => (
                  <div
                    key={agent.userId}
                    className="flex flex-col justify-between gap-4 rounded-xl bg-surface p-5 shadow-card sm:flex-row sm:items-center"
                  >
                    <div className="flex items-start gap-4">
                      {agent.avatarUrl ? (
                        <img
                          src={agent.avatarUrl}
                          alt=""
                          className="size-12 rounded-full object-cover ring-1 ring-border shrink-0"
                        />
                      ) : (
                        <div className="grid size-12 place-items-center rounded-full bg-primary-soft text-base font-bold text-primary shrink-0">
                          {agent.displayName.slice(0, 1).toUpperCase()}
                        </div>
                      )}
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-display text-base font-semibold">{agent.displayName}</span>
                          <IdStatusBadge status={agent.idVerificationStatus ?? "not_submitted"} />
                          {agent.isSuspended ? (
                            <Badge className="bg-danger/10 text-danger border-danger/20 text-[10px]">Suspended</Badge>
                          ) : null}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
                          <span>Phone: {agent.phone || "Not set"}</span>
                          <span>•</span>
                          <span>Public URL: /{agent.slug}</span>
                          <span>•</span>
                          <span>Listings: {agent.listingsCount}</span>
                        </div>
                        {agent.idRejectionReason ? (
                          <p className="text-xs text-danger">Rejection reason: {agent.idRejectionReason}</p>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:self-center">
                      {agent.idDocumentUrl ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setInspectingAgent(agent)}
                          className="text-xs"
                        >
                          <FileText className="mr-1.5 size-3.5" />
                          View Document
                        </Button>
                      ) : (
                        <span className="text-xs text-muted italic">No file attached</span>
                      )}

                      {agent.idVerificationStatus !== "verified" ? (
                        <Button
                          size="sm"
                          onClick={() => void handleApproveId(agent.userId)}
                          disabled={processingId}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                        >
                          <CheckCircle2 className="mr-1.5 size-3.5" />
                          Approve ID
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setRejectingAgent(agent)}
                          className="text-xs text-danger hover:bg-danger/10"
                        >
                          Revoke / Reject
                        </Button>
                      )}

                      {agent.idVerificationStatus === "pending_review" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setRejectingAgent(agent)}
                          className="text-xs text-danger hover:bg-danger/10"
                        >
                          Reject with Note
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: AGENT LIST */}
        {currentTab === "agent-list" && (
          <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h1 className="font-display text-2xl font-semibold">Agent Directory</h1>
                <p className="mt-0.5 text-xs text-muted">
                  All registered agents on TrustHouse, their verification status, and portfolio metrics.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted" />
                  <Input
                    placeholder="Search agents by name, phone, slug..."
                    value={agentSearch}
                    onChange={(e) => setAgentSearch(e.target.value)}
                    className="h-9 w-64 pl-8 text-xs"
                  />
                </div>
                <select
                  value={agentStatusFilter}
                  onChange={(e) => setAgentStatusFilter(e.target.value)}
                  className="h-9 rounded-md border border-input bg-surface px-3 text-xs"
                >
                  <option value="all">All statuses</option>
                  <option value="verified">Verified only</option>
                  <option value="pending_review">Pending review</option>
                  <option value="not_submitted">Not submitted</option>
                  <option value="suspended">Suspended accounts</option>
                </select>
              </div>
            </div>

            {/* Agents Table */}
            <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-card">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border bg-surface-2 text-muted font-medium">
                    <tr>
                      <th className="p-3.5 pl-4">Agent</th>
                      <th className="p-3.5">Contact</th>
                      <th className="p-3.5">Verification</th>
                      <th className="p-3.5 text-center">Listings</th>
                      <th className="p-3.5 text-center">Leads</th>
                      <th className="p-3.5 text-center">Rating</th>
                      <th className="p-3.5 pr-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {agents.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-muted">
                          No agents found matching search criteria.
                        </td>
                      </tr>
                    ) : (
                      agents.map((agent) => (
                        <tr key={agent.userId} className="hover:bg-surface-2/40 transition">
                          <td className="p-3.5 pl-4">
                            <div className="flex items-center gap-3">
                              {agent.avatarUrl ? (
                                <img
                                  src={agent.avatarUrl}
                                  alt=""
                                  className="size-9 rounded-full object-cover ring-1 ring-border shrink-0"
                                />
                              ) : (
                                <div className="grid size-9 place-items-center rounded-full bg-primary-soft text-xs font-bold text-primary shrink-0">
                                  {agent.displayName.slice(0, 1).toUpperCase()}
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="font-semibold text-fg leading-tight truncate">
                                  {agent.displayName}
                                </p>
                                <a
                                  href={`/${agent.slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] text-primary hover:underline font-mono"
                                >
                                  /{agent.slug}
                                </a>
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5">
                            {agent.phone ? (
                              <div className="space-y-0.5">
                                <p className="font-mono text-fg">{agent.phone}</p>
                                <a
                                  href={whatsappUrl(agent.phone, "Hello, TrustHouse admin checking in.")}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[10px] text-emerald-800 hover:underline"
                                >
                                  WhatsApp
                                  <ArrowUpRight className="size-2.5" />
                                </a>
                              </div>
                            ) : (
                              <span className="text-muted">No phone</span>
                            )}
                          </td>
                          <td className="p-3.5">
                            <IdStatusBadge status={agent.idVerificationStatus ?? "not_submitted"} />
                          </td>
                          <td className="p-3.5 text-center font-medium">{agent.listingsCount}</td>
                          <td className="p-3.5 text-center font-medium">{agent.leadsCount}</td>
                          <td className="p-3.5 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Star className="size-3 fill-amber-400 text-amber-400" />
                              <span className="font-semibold">{agent.avgRating}</span>
                              <span className="text-[10px] text-muted">({agent.reviewsCount})</span>
                            </div>
                          </td>
                          <td className="p-3.5 pr-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {agent.idDocumentUrl ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setInspectingAgent(agent)}
                                  className="h-7 text-xs"
                                >
                                  Review ID
                                </Button>
                              ) : null}
                              <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs"
                              >
                                <Link to="/$slug" params={{ slug: agent.slug }} target="_blank">
                                  Profile
                                </Link>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => void handleToggleSuspend(agent.userId, agent.isSuspended ?? false)}
                                className={cn(
                                  "h-7 text-xs",
                                  agent.isSuspended ? "text-emerald-800" : "text-danger hover:bg-danger/10",
                                )}
                              >
                                {agent.isSuspended ? "Reactivate" : "Suspend"}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: LISTING OVERVIEW */}
        {currentTab === "listing-overview" && (
          <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h1 className="font-display text-2xl font-semibold">Listing Overview</h1>
                <p className="mt-0.5 text-xs text-muted">
                  Inspect and moderate all active properties, proof checkpoints, and landlord details.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted" />
                  <Input
                    placeholder="Search by title, area, agent..."
                    value={listingSearch}
                    onChange={(e) => setListingSearch(e.target.value)}
                    className="h-9 w-60 pl-8 text-xs"
                  />
                </div>
                <select
                  value={listingAreaFilter}
                  onChange={(e) => setListingAreaFilter(e.target.value)}
                  className="h-9 rounded-md border border-input bg-surface px-3 text-xs"
                >
                  <option value="all">All Lagos areas</option>
                  {areas.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
                <select
                  value={listingTrustFilter}
                  onChange={(e) => setListingTrustFilter(e.target.value)}
                  className="h-9 rounded-md border border-input bg-surface px-3 text-xs"
                >
                  <option value="all">All trust tiers</option>
                  <option value="verified">Verified only</option>
                  <option value="partial">Partial proof</option>
                  <option value="unverified">Unverified</option>
                </select>
              </div>
            </div>

            {/* Listings Grid / Table */}
            <div className="grid gap-4">
              {listings.length === 0 ? (
                <div className="rounded-xl bg-surface p-12 text-center shadow-card">
                  <Building2 className="mx-auto size-10 text-muted" />
                  <h3 className="mt-3 font-display text-base font-semibold">No listings found</h3>
                  <p className="mt-1 text-xs text-muted">Try adjusting your area or trust level filter.</p>
                </div>
              ) : (
                listings.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col justify-between gap-4 rounded-xl bg-surface p-5 shadow-card sm:flex-row sm:items-center"
                  >
                    <div className="flex items-start gap-4">
                      <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-surface-2 ring-1 ring-border">
                        <img
                          src={item.photoUrl}
                          alt=""
                          className="size-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/listings/lekki-duplex.jpg";
                          }}
                        />
                        {item.isFeatured ? (
                          <div className="absolute left-1 top-1 rounded bg-amber-500 px-1 py-0.5 text-[9px] font-bold text-white shadow">
                            FEATURED
                          </div>
                        ) : null}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-display text-base font-semibold text-fg">
                            {item.title}
                          </span>
                          <TrustBadge trust={item.trust} />
                        </div>
                        <p className="font-mono text-sm font-semibold text-primary">
                          {formatNairaYear(item.yearlyRent)}
                        </p>
                        <p className="text-xs text-muted">
                          {item.area} • {item.bedrooms} bed • {item.bathrooms} bath • Listed by:{" "}
                          <span className="font-medium text-fg">{item.agentName}</span> (/{item.agentSlug})
                        </p>

                        {/* Interactive Proof Checkpoint Badges */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={() => void handleToggleProof(item.id, "proofIdChecked", item.proofIdChecked)}
                            title="Click to toggle proof check"
                            className={cn(
                              "rounded px-2 py-0.5 text-[10px] font-medium transition cursor-pointer",
                              item.proofIdChecked
                                ? "bg-emerald-500/15 text-emerald-800"
                                : "bg-surface-2 text-muted hover:bg-surface-2/80",
                            )}
                          >
                            ✓ Owner ID
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleToggleProof(item.id, "proofOwnershipSeen", item.proofOwnershipSeen)}
                            title="Click to toggle proof check"
                            className={cn(
                              "rounded px-2 py-0.5 text-[10px] font-medium transition cursor-pointer",
                              item.proofOwnershipSeen
                                ? "bg-emerald-500/15 text-emerald-800"
                                : "bg-surface-2 text-muted hover:bg-surface-2/80",
                            )}
                          >
                            ✓ Deed of Assignment
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleToggleProof(item.id, "proofOnsiteVisit", item.proofOnsiteVisit)}
                            title="Click to toggle proof check"
                            className={cn(
                              "rounded px-2 py-0.5 text-[10px] font-medium transition cursor-pointer",
                              item.proofOnsiteVisit
                                ? "bg-emerald-500/15 text-emerald-800"
                                : "bg-surface-2 text-muted hover:bg-surface-2/80",
                            )}
                          >
                            ✓ Site Walk-through
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleToggleProof(item.id, "proofOwnerPhone", item.proofOwnerPhone)}
                            title="Click to toggle proof check"
                            className={cn(
                              "rounded px-2 py-0.5 text-[10px] font-medium transition cursor-pointer",
                              item.proofOwnerPhone
                                ? "bg-emerald-500/15 text-emerald-800"
                                : "bg-surface-2 text-muted hover:bg-surface-2/80",
                            )}
                          >
                            ✓ Owner Phone Call
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:self-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void handleToggleFeatured(item.id, item.isFeatured ?? false)}
                        className={cn("text-xs", item.isFeatured && "border-amber-500/40 text-amber-800")}
                      >
                        <Flame className="mr-1 size-3" />
                        {item.isFeatured ? "Unfeature" : "Feature"}
                      </Button>

                      {item.agentSlug ? (
                        <Button asChild variant="outline" size="sm" className="text-xs">
                          <Link
                            to="/$slug/listings/$listingId"
                            params={{ slug: item.agentSlug, listingId: String(item.id) }}
                            target="_blank"
                          >
                            <ExternalLink className="mr-1 size-3" />
                            Live Link
                          </Link>
                        </Button>
                      ) : null}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingListingId(item.id)}
                        className="text-xs text-danger hover:bg-danger/10"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 5: CLIENT REVIEW */}
        {currentTab === "client-review" && (
          <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h1 className="font-display text-2xl font-semibold">Client Review Desk</h1>
                <p className="mt-0.5 text-xs text-muted">
                  Moderate tenant and buyer feedback, maintain authenticity, and feature client testimonials.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => setShowAddReviewModal(true)}
                  className="bg-primary text-primary-fg text-xs"
                >
                  <Plus className="mr-1.5 size-3.5" />
                  Add Client Review
                </Button>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted" />
                  <Input
                    placeholder="Search reviews..."
                    value={reviewSearch}
                    onChange={(e) => setReviewSearch(e.target.value)}
                    className="h-9 w-52 pl-8 text-xs"
                  />
                </div>
                <select
                  value={reviewStatusFilter}
                  onChange={(e) => setReviewStatusFilter(e.target.value)}
                  className="h-9 rounded-md border border-input bg-surface px-3 text-xs"
                >
                  <option value="all">All statuses</option>
                  <option value="published">Published</option>
                  <option value="pending">Pending</option>
                  <option value="flagged">Flagged</option>
                </select>
                <select
                  value={reviewRatingFilter}
                  onChange={(e) => setReviewRatingFilter(Number(e.target.value))}
                  className="h-9 rounded-md border border-input bg-surface px-3 text-xs"
                >
                  <option value={0}>All star ratings</option>
                  <option value={5}>5 Stars only</option>
                  <option value={4}>4 Stars</option>
                  <option value={3}>3 Stars</option>
                  <option value={2}>2 Stars</option>
                  <option value={1}>1 Star</option>
                </select>
              </div>
            </div>

            {/* Client Reviews Cards */}
            <div className="grid gap-4 sm:grid-cols-2">
              {clientReviews.length === 0 ? (
                <div className="col-span-2 rounded-xl bg-surface p-12 text-center shadow-card">
                  <Star className="mx-auto size-10 text-muted" />
                  <h3 className="mt-3 font-display text-base font-semibold">No reviews found</h3>
                  <p className="mt-1 text-xs text-muted">
                    No client reviews match the current filters. Click "Add Client Review" to log one.
                  </p>
                </div>
              ) : (
                clientReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="flex flex-col justify-between rounded-xl bg-surface p-5 shadow-card space-y-4"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-display font-semibold text-fg">{rev.clientName}</span>
                            <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[10px] text-muted">
                              {rev.clientRole}
                            </span>
                            {rev.isVerifiedClient ? (
                              <Badge className="bg-emerald-500/10 text-emerald-800 text-[9px] border-0">
                                Verified Renter
                              </Badge>
                            ) : null}
                          </div>
                          <p className="text-xs text-muted">
                            For Agent: <span className="font-medium text-fg">{rev.agentName}</span>
                            {rev.clientPhone ? ` • ${rev.clientPhone}` : null}
                          </p>
                        </div>
                        <ReviewStatusBadge status={rev.status} />
                      </div>

                      <div className="mt-3">
                        <StarRating rating={rev.rating} />
                        <h4 className="mt-1.5 font-semibold text-sm text-fg">"{rev.title}"</h4>
                        <p className="mt-1 text-xs text-muted leading-relaxed">{rev.comment}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-border pt-3 text-xs">
                      <span className="text-muted">
                        {formatDistanceToNow(new Date(rev.createdAt), { addSuffix: true })}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {rev.status !== "published" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => void handleReviewStatus(rev.id, "published")}
                            className="h-7 text-xs text-emerald-800 hover:bg-emerald-50"
                          >
                            Approve
                          </Button>
                        ) : null}
                        {rev.status !== "flagged" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => void handleReviewStatus(rev.id, "flagged")}
                            className="h-7 text-xs text-amber-800 hover:bg-amber-50"
                          >
                            Flag
                          </Button>
                        ) : null}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => void handleDeleteReview(rev.id)}
                          className="h-7 text-xs text-danger hover:bg-danger/10"
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 6: INQUIRIES STREAM */}
        {currentTab === "inquiries" && (
          <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h1 className="font-display text-2xl font-semibold">Inquiries Stream</h1>
                <p className="mt-0.5 text-xs text-muted">
                  Live buyer inquiries sent to agents across Lagos properties.
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-card">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-surface-2 text-muted font-medium">
                  <tr>
                    <th className="p-3.5 pl-4">Buyer</th>
                    <th className="p-3.5">Property</th>
                    <th className="p-3.5">Assigned Agent</th>
                    <th className="p-3.5">Message</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 pr-4 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {inquiries.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-muted">
                        No inquiries recorded yet.
                      </td>
                    </tr>
                  ) : (
                    inquiries.map((inq) => (
                      <tr key={inq.id} className="hover:bg-surface-2/40 transition">
                        <td className="p-3.5 pl-4">
                          <p className="font-semibold text-fg">{inq.buyerName}</p>
                          <a
                            href={whatsappUrl(inq.buyerPhone, "Hello, regarding your TrustHouse inquiry...")}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-[11px] text-primary hover:underline"
                          >
                            {inq.buyerPhone}
                          </a>
                        </td>
                        <td className="p-3.5">
                          <p className="font-medium text-fg">{inq.listingTitle}</p>
                          <p className="text-[11px] text-muted">{inq.listingArea}</p>
                        </td>
                        <td className="p-3.5">
                          <span className="font-medium text-fg">{inq.agentName}</span>
                          <span className="text-muted block text-[11px]">/{inq.agentSlug}</span>
                        </td>
                        <td className="p-3.5 max-w-xs truncate text-muted">"{inq.message}"</td>
                        <td className="p-3.5">
                          <Badge className="bg-surface-2 text-fg border-border text-[10px]">
                            {inq.status.replace("_", " ")}
                          </Badge>
                        </td>
                        <td className="p-3.5 pr-4 text-right text-muted whitespace-nowrap">
                          {formatDistanceToNow(new Date(inq.createdAt), { addSuffix: true })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* INSPECT ID DOCUMENT MODAL */}
      {inspectingAgent ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-2xl rounded-2xl bg-surface p-6 shadow-2xl ring-1 ring-border max-h-[90vh] flex flex-col">
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="size-6 text-primary" />
                <div>
                  <h3 className="font-display text-lg font-semibold">
                    Government ID: {inspectingAgent.displayName}
                  </h3>
                  <p className="text-xs text-muted">
                    Phone: {inspectingAgent.phone || "Unset"} • Slug: /{inspectingAgent.slug}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectingAgent(null)}
                className="grid size-8 place-items-center rounded-lg hover:bg-surface-2 text-muted hover:text-fg"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Document Preview Box */}
            <div className="my-4 flex-1 overflow-auto rounded-xl bg-surface-2/60 p-4 border border-border min-h-[280px] flex items-center justify-center">
              {inspectingAgent.idDocumentUrl ? (
                inspectingAgent.idDocumentUrl.toLowerCase().endsWith(".pdf") ? (
                  <iframe
                    src={inspectingAgent.idDocumentUrl}
                    title="ID Document Scan"
                    className="size-full min-h-[360px] rounded-lg"
                  />
                ) : (
                  <img
                    src={inspectingAgent.idDocumentUrl}
                    alt="Agent ID Scan"
                    className="max-h-[380px] max-w-full rounded-lg object-contain shadow"
                  />
                )
              ) : (
                <p className="text-xs text-muted">No document file on record.</p>
              )}
            </div>

            {/* Rejection notice if previously rejected */}
            {inspectingAgent.idRejectionReason ? (
              <div className="mb-4 rounded-lg bg-danger/10 p-3 text-xs text-danger">
                <strong>Previous rejection note:</strong> {inspectingAgent.idRejectionReason}
              </div>
            ) : null}

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
              {inspectingAgent.idDocumentUrl ? (
                <a
                  href={inspectingAgent.idDocumentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
                >
                  <ExternalLink className="size-3.5" />
                  Open in high resolution
                </a>
              ) : <div />}

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setRejectingAgent(inspectingAgent)}
                  className="text-xs text-danger hover:bg-danger/10"
                >
                  <XCircle className="mr-1.5 size-3.5" />
                  Reject ID
                </Button>
                <Button
                  onClick={() => void handleApproveId(inspectingAgent.userId)}
                  disabled={processingId}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                >
                  <CheckCircle2 className="mr-1.5 size-3.5" />
                  Verify & Approve
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* REJECT ID MODAL */}
      {rejectingAgent ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-2xl ring-1 ring-border">
            <h3 className="font-display text-lg font-semibold text-danger">
              Reject Verification ID
            </h3>
            <p className="mt-1 text-xs text-muted">
              Specify the reason why {rejectingAgent.displayName}'s document cannot be verified. This will be visible on their dashboard profile.
            </p>

            <div className="mt-4 space-y-2">
              <Label htmlFor="rejection-reason" className="text-xs">
                Rejection Note / Feedback
              </Label>
              <Textarea
                id="rejection-reason"
                rows={3}
                placeholder="e.g. Document image is too blurry to read the NIN number, or name on document does not match profile name."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRejectingAgent(null)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => void handleRejectId()}
                disabled={processingId}
                className="bg-danger text-white hover:bg-danger/90 text-xs"
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* ADD CLIENT REVIEW MODAL */}
      {showAddReviewModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl bg-surface p-6 shadow-2xl ring-1 ring-border max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-display text-lg font-semibold">Add Client Review</h3>
              <button
                type="button"
                onClick={() => setShowAddReviewModal(false)}
                className="grid size-8 place-items-center rounded-lg hover:bg-surface-2 text-muted"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleCreateReview} className="mt-4 space-y-4 text-xs">
              <div className="space-y-1.5">
                <Label htmlFor="rev-agent">Agent being reviewed *</Label>
                <select
                  id="rev-agent"
                  required
                  value={newReviewForm.agentUserId}
                  onChange={(e) =>
                    setNewReviewForm((prev) => ({ ...prev, agentUserId: e.target.value }))
                  }
                  className="w-full h-9 rounded-md border border-input bg-surface px-3 text-xs"
                >
                  <option value="">Select agent...</option>
                  {agents.map((a) => (
                    <option key={a.userId} value={a.userId}>
                      {a.displayName} (/{a.slug})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="rev-client">Client full name *</Label>
                  <Input
                    id="rev-client"
                    required
                    placeholder="e.g. Chinedu Eze"
                    value={newReviewForm.clientName}
                    onChange={(e) =>
                      setNewReviewForm((prev) => ({ ...prev, clientName: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rev-role">Client role</Label>
                  <select
                    id="rev-role"
                    value={newReviewForm.clientRole}
                    onChange={(e) =>
                      setNewReviewForm((prev) => ({ ...prev, clientRole: e.target.value }))
                    }
                    className="w-full h-9 rounded-md border border-input bg-surface px-3 text-xs"
                  >
                    <option value="Tenant">Tenant</option>
                    <option value="Buyer">Buyer</option>
                    <option value="Landlord">Landlord</option>
                    <option value="Visitor">Visitor</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="rev-email">Client email</Label>
                  <Input
                    id="rev-email"
                    type="email"
                    placeholder="chinedu@example.com"
                    value={newReviewForm.clientEmail}
                    onChange={(e) =>
                      setNewReviewForm((prev) => ({ ...prev, clientEmail: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rev-phone">Client phone</Label>
                  <Input
                    id="rev-phone"
                    placeholder="0803 123 4567"
                    value={newReviewForm.clientPhone}
                    onChange={(e) =>
                      setNewReviewForm((prev) => ({ ...prev, clientPhone: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="rev-rating">Star Rating (1 - 5) *</Label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReviewForm((prev) => ({ ...prev, rating: star }))}
                      className="p-1 cursor-pointer"
                    >
                      <Star
                        className={cn(
                          "size-6",
                          star <= newReviewForm.rating
                            ? "fill-amber-400 text-amber-400"
                            : "fill-border text-border",
                        )}
                      />
                    </button>
                  ))}
                  <span className="font-semibold text-fg ml-2">{newReviewForm.rating} Stars</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="rev-title">Review title *</Label>
                <Input
                  id="rev-title"
                  required
                  placeholder="e.g. Smooth transaction and honest inspection"
                  value={newReviewForm.title}
                  onChange={(e) =>
                    setNewReviewForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="rev-comment">Review details / Feedback *</Label>
                <Textarea
                  id="rev-comment"
                  required
                  rows={4}
                  placeholder="Describe the client's experience with this agent in Lagos..."
                  value={newReviewForm.comment}
                  onChange={(e) =>
                    setNewReviewForm((prev) => ({ ...prev, comment: e.target.value }))
                  }
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddReviewModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Submit Review</Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* DELETE LISTING CONFIRMATION MODAL */}
      {deletingListingId !== null ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-surface p-6 shadow-2xl ring-1 ring-border">
            <h3 className="font-display text-lg font-semibold text-danger">Delete Listing</h3>
            <p className="mt-2 text-xs text-muted">
              Are you sure you want to permanently delete listing #{deletingListingId}? This will remove it from all public search results.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeletingListingId(null)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => void handleDeleteListing(deletingListingId)}
                className="bg-danger text-white hover:bg-danger/90 text-xs"
              >
                Delete permanently
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
