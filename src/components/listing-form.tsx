import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ProofToggles } from "@/components/proof-checklist";
import { LAGOS_AREAS, STOCK_PHOTOS } from "@/lib/constants";
import type { Listing, Proofs } from "@/lib/types";
import { cn } from "@/lib/utils";

export type ListingDraft = {
  title: string;
  area: string;
  yearlyRent: string;
  bedrooms: string;
  bathrooms: string;
  description: string;
  photoUrl: string;
} & Proofs;

export function listingToDraft(listing?: Listing): ListingDraft {
  return {
    title: listing?.title ?? "",
    area: listing?.area ?? "Lekki Phase 1",
    yearlyRent: listing ? String(listing.yearlyRent) : "",
    bedrooms: listing ? String(listing.bedrooms) : "2",
    bathrooms: listing ? String(listing.bathrooms) : "2",
    description: listing?.description ?? "",
    photoUrl: listing?.photoUrl ?? STOCK_PHOTOS[0].src,
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
    photoUrl: draft.photoUrl,
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

  function handle(e: FormEvent) {
    e.preventDefault();
    onSubmit(draft);
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
        <legend className="mb-1 text-sm font-medium">Property photo</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {STOCK_PHOTOS.map((photo) => (
            <button
              key={photo.src}
              type="button"
              onClick={() => setDraft({ ...draft, photoUrl: photo.src })}
              className={cn(
                "overflow-hidden rounded-md transition-[box-shadow] duration-150",
                draft.photoUrl === photo.src
                  ? "shadow-[0_0_0_2px_var(--color-primary)]"
                  : "shadow-[0_0_0_1px_rgba(28,25,23,0.08)]",
              )}
            >
              <img src={photo.src} alt={photo.label} className="aspect-[4/3] w-full object-cover" />
            </button>
          ))}
        </div>
        <Label htmlFor="photo-url" className="mt-2 text-muted">
          Or paste a photo URL
        </Label>
        <Input
          id="photo-url"
          value={draft.photoUrl}
          onChange={(e) => setDraft({ ...draft, photoUrl: e.target.value })}
        />
      </fieldset>
      <ProofToggles proofs={proofs} onChange={(next) => setDraft({ ...draft, ...next })} />
      <Button type="submit" disabled={pending} size="lg">
        {pending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
