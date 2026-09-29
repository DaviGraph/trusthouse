import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ProofToggles } from "@/components/proof-checklist";
import { LAGOS_AREAS } from "@/lib/constants";
import { uploadListingPhoto, uploadVerificationVideo } from "@/lib/upload-client";
import type { Listing, Proofs } from "@/lib/types";

const MAX_PHOTOS = 6;

export type ListingDraft = {
  title: string;
  area: string;
  yearlyRent: string;
  bedrooms: string;
  bathrooms: string;
  description: string;
  photoUrls: string[];
  verificationVideoUrl: string | null;
} & Proofs;

export function listingToDraft(listing?: Listing): ListingDraft {
  return {
    title: listing?.title ?? "",
    area: listing?.area ?? "Lekki Phase 1",
    yearlyRent: listing ? String(listing.yearlyRent) : "",
    bedrooms: listing ? String(listing.bedrooms) : "2",
    bathrooms: listing ? String(listing.bathrooms) : "2",
    description: listing?.description ?? "",
    photoUrls: listing?.photoUrls ?? [],
    verificationVideoUrl: listing?.verificationVideoUrl ?? null,
    proofIdChecked: listing?.proofIdChecked ?? false,
    proofOwnershipSeen: listing?.proofOwnershipSeen ?? false,
    proofOnsiteVisit: listing?.proofOnsiteVisit ?? false,
    proofOwnerPhone: listing?.proofOwnerPhone ?? false,
  };
}

export function toListingPayload(draft: ListingDraft) {
  return {
    title: draft.title,
    area: draft.area,
    yearlyRent: Number(String(draft.yearlyRent).replace(/[^\d]/g, "")),
    bedrooms: Number(draft.bedrooms),
    bathrooms: Number(draft.bathrooms),
    description: draft.description,
    photoUrls: draft.photoUrls,
    verificationVideoUrl: draft.verificationVideoUrl,
    proofIdChecked: draft.proofIdChecked,
    proofOwnershipSeen: draft.proofOwnershipSeen,
    proofOnsiteVisit: draft.proofOnsiteVisit,
    proofOwnerPhone: draft.proofOwnerPhone,
  };
}

export function ListingForm({
  initial,
  pending,
  submitLabel,
  onSubmit,
}: {
  initial?: Listing;
  pending?: boolean;
  submitLabel: string;
  onSubmit: (draft: ListingDraft) => void;
}) {
  const [draft, setDraft] = useState<ListingDraft>(() => listingToDraft(initial));
  const [photoUploading, setPhotoUploading] = useState(false);
  const [videoUploading, setVideoUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  function handle(e: FormEvent) {
    e.preventDefault();
    if (draft.photoUrls.length === 0) {
      setUploadError("Add at least one photo before saving.");
      return;
    }
    onSubmit(draft);
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    const room = MAX_PHOTOS - draft.photoUrls.length;
    if (room <= 0) {
      setUploadError(`You can only add up to ${MAX_PHOTOS} photos.`);
      return;
    }
    const toUpload = files.slice(0, room);
    setUploadError(null);
    setPhotoUploading(true);
    try {
      const urls = await Promise.all(toUpload.map(uploadListingPhoto));
      setDraft((d) => ({ ...d, photoUrls: [...d.photoUrls, ...urls] }));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Photo upload failed.");
    } finally {
      setPhotoUploading(false);
      e.target.value = "";
    }
  }

  function removePhoto(url: string) {
    setDraft((d) => ({ ...d, photoUrls: d.photoUrls.filter((p) => p !== url) }));
  }

  async function handleVideoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setVideoUploading(true);
    try {
      const url = await uploadVerificationVideo(initial?.id ?? 0, file);
      setDraft((d) => ({ ...d, verificationVideoUrl: url }));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Video upload failed.");
    } finally {
      setVideoUploading(false);
    }
  }

  const proofs: Proofs = {
    proofIdChecked: draft.proofIdChecked,
    proofOwnershipSeen: draft.proofOwnershipSeen,
    proofOnsiteVisit: draft.proofOnsiteVisit,
    proofOwnerPhone: draft.proofOwnerPhone,
  };

  return (
    <form className="grid gap-5" onSubmit={handle}>
      <div className="grid gap-1.5">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          required
          placeholder="Serviced 3-bed duplex, Lekki Phase 1"
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="area">Area in Lagos</Label>
          <select
            id="area"
            className="h-11 rounded-md bg-surface px-3 text-sm shadow-[0_0_0_1px_rgba(28,25,23,0.12)] outline-none focus-visible:shadow-[0_0_0_2px_rgba(15,92,69,0.35)]"
            value={draft.area}
            onChange={(e) => setDraft({ ...draft, area: e.target.value })}
          >
            {LAGOS_AREAS.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="rent">Yearly rent (naira)</Label>
          <Input
            id="rent"
            required
            inputMode="numeric"
            placeholder="8000000"
            value={draft.yearlyRent}
            onChange={(e) => setDraft({ ...draft, yearlyRent: e.target.value })}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-1.5">
          <Label htmlFor="beds">Bedrooms</Label>
          <Input
            id="beds"
            type="number"
            min={1}
            max={12}
            value={draft.bedrooms}
            onChange={(e) => setDraft({ ...draft, bedrooms: e.target.value })}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="baths">Bathrooms</Label>
          <Input
            id="baths"
            type="number"
            min={1}
            max={12}
            value={draft.bathrooms}
            onChange={(e) => setDraft({ ...draft, bathrooms: e.target.value })}
          />
        </div>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="desc">Description</Label>
        <Textarea
          id="desc"
          placeholder="Estate, power, water, what you verified…"
          value={draft.description}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
        />
      </div>

      <fieldset className="grid gap-2">
        <legend className="mb-1 text-sm font-medium">
          Property photos ({draft.photoUrls.length}/{MAX_PHOTOS})
        </legend>
        {draft.photoUrls.length > 0 ? (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {draft.photoUrls.map((url) => (
              <div key={url} className="group relative aspect-[4/3] overflow-hidden rounded-md">
                <img src={url} alt="Listing" className="size-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(url)}
                  className="absolute top-1 right-1 rounded-full bg-black/60 px-1.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        ) : null}
        {draft.photoUrls.length < MAX_PHOTOS ? (
          <Input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handlePhotoChange} disabled={photoUploading} />
        ) : (
          <p className="text-xs text-muted">Maximum {MAX_PHOTOS} photos reached.</p>
        )}
        {photoUploading ? <p className="text-xs text-muted">Uploading…</p> : null}
      </fieldset>

      <fieldset className="grid gap-2">
        <legend className="mb-1 text-sm font-medium">Verification video</legend>
        <p className="text-xs text-muted">
          A short walkthrough proving you visited the property. Buyers see this on the listing page.
        </p>
        {draft.verificationVideoUrl ? (
          <video src={draft.verificationVideoUrl} controls className="w-48 rounded-md" />
        ) : null}
        <Input type="file" accept="video/mp4,video/quicktime,video/webm" onChange={handleVideoChange} disabled={videoUploading} />
        {videoUploading ? <p className="text-xs text-muted">Uploading video…</p> : null}
      </fieldset>

      {uploadError ? <p className="text-sm text-danger">{uploadError}</p> : null}

      <ProofToggles proofs={proofs} onChange={(next) => setDraft({ ...draft, ...next })} />
      <Button type="submit" disabled={pending || photoUploading || videoUploading} size="lg">
        {pending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}