import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileCheck,
  Loader2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Upload,
  User,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAgentStore } from "@/lib/agent-store";
import { getAgentProfile, updateAgentProfile, uploadAgentIdDocument } from "@/lib/server/agents";
import type { Agent, IdVerificationStatus } from "@/lib/types";
import { uploadAgentAvatar, uploadVerificationDocument } from "@/lib/upload-client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/profile")({
  component: AgentProfilePage,
});

function StatusBadge({ status }: { status: IdVerificationStatus }) {
  if (status === "verified") {
    return (
      <Badge className="border border-emerald-500/30 bg-emerald-500/15 text-emerald-800 font-semibold">
        <CheckCircle2 className="mr-1.5 size-3.5 text-emerald-700" />
        Verified
      </Badge>
    );
  }
  if (status === "pending_review") {
    return (
      <Badge className="border border-amber-500/40 bg-amber-500/15 text-amber-900 font-medium">
        <Clock className="mr-1.5 size-3.5 text-amber-700" />
        Pending review
      </Badge>
    );
  }
  return (
    <Badge className="border border-border bg-surface-2 text-muted font-normal">
      <ShieldAlert className="mr-1.5 size-3.5 text-faint" />
      Not submitted
    </Badge>
  );
}

function AgentProfilePage() {
  // The store is the single source of truth shared with the shell/sidebar.
  const { agent: storeAgent, setAgent: setStoreAgent } = useAgentStore();

  // Local page state
  const [agent, setAgentLocal] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [idUploading, setIdUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [idError, setIdError] = useState<string | null>(null);

  // Editable form fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  /** Commit an updated agent to both local state and the global store. */
  function applyAgent(updated: Agent) {
    setAgentLocal(updated);
    setStoreAgent(updated); // <-- this makes sidebar/shell re-render immediately
    setFullName(updated.displayName);
    setPhone(updated.phone);
    setBio(updated.bio);
    setAvatarUrl(updated.avatarUrl ?? null);
  }

  async function loadProfile() {
    try {
      setLoading(true);
      // Prefer data already in the store so the page initialises instantly
      const cached = storeAgent;
      if (cached) {
        setAgentLocal(cached);
        setFullName(cached.displayName || "");
        setPhone(cached.phone || "");
        setBio(cached.bio || "");
        setAvatarUrl(cached.avatarUrl ?? null);
      }
      // Always refresh from the server so we get the latest status fields
      const profile = await getAgentProfile();
      if (profile) applyAgent(profile);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load profile.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleProfileSubmit(e: FormEvent) {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error("Please enter your full name.");
      return;
    }
    setSavingProfile(true);
    try {
      const updated = await updateAgentProfile({
        data: {
          fullName: fullName.trim(),
          phone: phone.trim(),
          bio: bio.trim(),
          avatarUrl,
        },
      });
      applyAgent(updated);
      toast.success("Profile updated successfully.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setAvatarError("Please select a valid image file (JPG, PNG, WebP).");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setAvatarError("Please choose a photo under 20MB.");
      return;
    }

    setAvatarError(null);
    setAvatarUploading(true);

    // Show a local preview immediately so the user sees feedback before upload finishes
    const localPreviewUrl = URL.createObjectURL(file);
    setAvatarUrl(localPreviewUrl);

    try {
      const uploadedUrl = await uploadAgentAvatar(file);
      // Auto-save the new avatar to the agent profile
      const updated = await updateAgentProfile({
        data: {
          fullName: fullName.trim() || agent?.displayName || "Agent",
          phone: phone.trim(),
          bio: bio.trim(),
          avatarUrl: uploadedUrl,
        },
      });
      URL.revokeObjectURL(localPreviewUrl);
      applyAgent(updated);
      toast.success("Profile photo updated.");
    } catch (err) {
      URL.revokeObjectURL(localPreviewUrl);
      setAvatarUrl(agent?.avatarUrl ?? null); // revert preview on error
      setAvatarError(err instanceof Error ? err.message : "Failed to upload profile photo.");
    } finally {
      setAvatarUploading(false);
      e.target.value = "";
    }
  }

  async function handleRemoveAvatar() {
    setAvatarUploading(true);
    try {
      const updated = await updateAgentProfile({
        data: {
          fullName: fullName.trim() || agent?.displayName || "Agent",
          phone: phone.trim(),
          bio: bio.trim(),
          avatarUrl: null,
        },
      });
      applyAgent(updated);
      toast.success("Profile photo removed.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove profile photo.");
    } finally {
      setAvatarUploading(false);
    }
  }

  async function handleIdDocumentChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setIdError("ID document scan must be under 10MB.");
      return;
    }

    setIdError(null);
    setIdUploading(true);
    try {
      // Upload to document storage (images are compressed by uploadVerificationDocument)
      const uploadedDocUrl = await uploadVerificationDocument(file);
      // Record the document and set status → pending_review on the server
      const updated = await uploadAgentIdDocument({
        data: { documentUrl: uploadedDocUrl },
      });
      applyAgent(updated);
      toast.success("Government ID submitted — pending review.");
    } catch (err) {
      setIdError(err instanceof Error ? err.message : "Failed to upload ID document.");
    } finally {
      setIdUploading(false);
      e.target.value = "";
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-surface-2" />
        <div className="h-64 animate-pulse rounded-xl bg-surface p-6" />
        <div className="h-48 animate-pulse rounded-xl bg-surface p-6" />
      </div>
    );
  }

  const idStatus: IdVerificationStatus = agent?.idVerificationStatus ?? "not_submitted";

  return (
    <div className="mx-auto max-w-3xl">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-3xl font-semibold">Agent Profile</h1>
          <p className="mt-1 text-sm text-muted">
            Manage your public credentials, contact information, and government ID verification.
          </p>
        </div>
        {agent ? (
          <Button asChild variant="outline" size="sm">
            <Link to="/$slug" params={{ slug: agent.slug }} target="_blank">
              <ExternalLink className="mr-1.5 size-3.5" />
              View public profile
            </Link>
          </Button>
        ) : null}
      </div>

      {/* Profile Details Form */}
      <form onSubmit={handleProfileSubmit} className="mt-8 space-y-6">
        <div className="rounded-xl bg-surface p-5 shadow-card sm:p-6">
          <h2 className="font-display text-lg font-semibold">Personal details</h2>
          <p className="mt-0.5 text-xs text-muted">
            This information appears on your listings and public agent card.
          </p>

          {/* Profile Photo Upload */}
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative size-20 shrink-0 overflow-hidden rounded-full bg-surface-2 shadow-inner ring-2 ring-border">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={fullName || "Agent avatar"}
                  className="size-full object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center font-display text-2xl font-bold text-muted">
                  {fullName ? fullName.slice(0, 1).toUpperCase() : <User className="size-8 text-faint" />}
                </div>
              )}
              {avatarUploading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <Loader2 className="size-5 animate-spin text-white" />
                </div>
              ) : null}
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <label
                  htmlFor="avatar-upload"
                  className={cn(
                    "inline-flex h-9 items-center gap-2 rounded-md bg-surface px-3 text-xs font-medium text-fg shadow-[0_0_0_1px_rgba(28,25,23,0.12)] transition hover:bg-surface-2 cursor-pointer",
                    avatarUploading && "pointer-events-none opacity-50",
                  )}
                >
                  <Camera className="size-3.5" />
                  {avatarUrl ? "Change photo" : "Upload photo"}
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={handleAvatarChange}
                  disabled={avatarUploading}
                />

                {avatarUrl ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs text-danger hover:bg-danger/10 hover:text-danger"
                    onClick={handleRemoveAvatar}
                    disabled={avatarUploading}
                  >
                    <Trash2 className="mr-1 size-3" />
                    Remove
                  </Button>
                ) : null}
              </div>
              <p className="text-xs text-muted">
                JPG, PNG, or WebP. Max 5MB. Stored in your agent-avatars folder.
              </p>
              {avatarError ? <p className="text-xs text-danger">{avatarError}</p> : null}
            </div>
          </div>

          <div className="mt-6 grid gap-4">
            {/* Full Name */}
            <div className="grid gap-1.5">
              <Label htmlFor="displayName">
                Full name <span className="text-danger">*</span>
              </Label>
              <Input
                id="displayName"
                required
                placeholder="e.g. Adeola Okonkwo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              <p className="text-xs text-muted">
                Your official or business name displayed on all published listings.
              </p>
            </div>

            {/* Phone Number */}
            <div className="grid gap-1.5">
              <Label htmlFor="phone">Phone number (calls & WhatsApp)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="0802 555 0148"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <p className="text-xs text-muted">
                Used by potential buyers and tenants to reach you directly via WhatsApp or phone call.
              </p>
            </div>

            {/* Bio */}
            <div className="grid gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="bio">Bio</Label>
                <span className="text-xs text-muted">{bio.length}/1000</span>
              </div>
              <Textarea
                id="bio"
                rows={4}
                maxLength={1000}
                placeholder="Describe your property focus, Lagos coverage areas (e.g. Lekki, Ikoyi, Ikeja), and your verification standards..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
              <p className="text-xs text-muted">
                Introduces you to prospective tenants and landlords on your public TrustHouse page.
              </p>
            </div>

            {/* Public Link slug */}
            {agent ? (
              <div className="rounded-lg bg-surface-2/60 p-3 text-xs text-muted">
                <span className="font-medium text-fg">Public profile URL: </span>
                <span className="font-mono text-primary">{window.location.origin}/{agent.slug}</span>
              </div>
            ) : null}
          </div>

          <div className="mt-6 flex justify-end">
            <Button type="submit" disabled={savingProfile} size="md">
              {savingProfile ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save profile changes"
              )}
            </Button>
          </div>
        </div>
      </form>

      {/* Government ID Verification Section */}
      <div className="mt-8 rounded-xl bg-surface p-5 shadow-card sm:p-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="size-5 text-primary" />
              <h2 className="font-display text-lg font-semibold">Government ID verification</h2>
            </div>
            <p className="mt-0.5 text-xs text-muted">
              Verify your agent identity to build trust and activate verified badges.
            </p>
          </div>
          <div>
            <StatusBadge status={idStatus} />
          </div>
        </div>

        {/* Status Callout Box */}
        <div className="mt-6">
          {idStatus === "verified" ? (
            <div className="flex items-start gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-900">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-emerald-700" />
              <div className="space-y-1">
                <p className="text-sm font-semibold">Your government ID is verified</p>
                <p className="text-xs text-emerald-800">
                  Your identity has been confirmed by TrustHouse administrators. Your listings now feature the verified agent badge.
                </p>
              </div>
            </div>
          ) : idStatus === "pending_review" ? (
            <div className="flex items-start gap-3 rounded-lg border border-amber-500/25 bg-amber-500/10 p-4 text-amber-950">
              <Clock className="mt-0.5 size-5 shrink-0 text-amber-700" />
              <div className="space-y-1">
                <p className="text-sm font-semibold">ID submitted — pending review</p>
                <p className="text-xs text-amber-900">
                  We have received your government ID. Our compliance team is verifying your document.
                  Your status will be updated once confirmed.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 rounded-lg border border-border bg-surface-2/60 p-4 text-fg">
              <AlertCircle className="mt-0.5 size-5 shrink-0 text-muted" />
              <div className="space-y-1">
                <p className="text-sm font-semibold">Verification document required</p>
                <p className="text-xs text-muted">
                  Please upload a clear scan or photo of your government-issued ID (NIN slip, Driver's License, International Passport, or Voter's Card).
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Existing Document Info */}
        {agent?.idDocumentUrl ? (
          <div className="mt-4 flex items-center justify-between rounded-lg border border-border bg-surface-2/40 px-3.5 py-2.5">
            <div className="flex items-center gap-2.5">
              <FileCheck className="size-4 text-primary" />
              <span className="text-xs font-medium text-fg">Submitted document on file</span>
            </div>
            <a
              href={agent.idDocumentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              View document
              <ExternalLink className="size-3" />
            </a>
          </div>
        ) : null}

        {/* Upload Field */}
        <div className="mt-5 space-y-3">
          <Label htmlFor="id-doc-upload" className="text-sm font-medium">
            {agent?.idDocumentUrl ? "Replace ID document scan" : "Upload government ID scan"}
          </Label>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label
              htmlFor="id-doc-upload"
              className={cn(
                "inline-flex h-11 items-center justify-center gap-2 rounded-md border border-dashed border-border bg-surface-2/30 px-4 text-sm font-medium text-fg transition hover:bg-surface-2 cursor-pointer",
                idUploading && "pointer-events-none opacity-50",
              )}
            >
              {idUploading ? (
                <>
                  <Loader2 className="size-4 animate-spin text-primary" />
                  Uploading & submitting document…
                </>
              ) : (
                <>
                  <Upload className="size-4 text-muted" />
                  <span>Choose ID file (JPG, PNG, PDF)</span>
                </>
              )}
            </label>
            <input
              id="id-doc-upload"
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="sr-only"
              onChange={handleIdDocumentChange}
              disabled={idUploading}
            />

            <span className="text-xs text-muted">
              PDF, JPG, PNG or WebP up to 10MB.
            </span>
          </div>

          {idError ? <p className="text-xs text-danger">{idError}</p> : null}

          <div className="rounded-lg bg-surface-2/40 p-3 text-xs text-muted">
            <p className="font-medium text-fg">Verification Notice:</p>
            <p className="mt-0.5">
              Submitting your ID automatically places your profile in <strong>Pending review</strong>.
              Approval is finalized after admin review; your public status will not display "Verified" until confirmed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
