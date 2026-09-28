import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { TrustBadge } from "@/components/trust-badge";
import { formatNairaYear } from "@/lib/format";
import type { Listing } from "@/lib/types";

export function ListingCard({
  listing,
  slug,
}: {
  listing: Listing;
  slug: string;
}) {
  return (
    <Link
      to="/$slug/listings/$listingId"
      params={{ slug, listingId: String(listing.id) }}
      className="group flex flex-col overflow-hidden rounded-xl bg-surface text-fg no-underline shadow-card transition-[transform,box-shadow] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-2">
        <img
          src={listing.photoUrl}
          alt={listing.title}
          className="size-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
        />
        <div className="absolute top-3 left-3">
          <TrustBadge level={listing.trust} />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-display text-base font-semibold leading-snug text-fg">
          {listing.title}
        </h3>
        <p className="flex items-center gap-1.5 text-sm text-muted">
          <MapPin className="size-3.5 shrink-0" />
          {listing.area}, Lagos
        </p>
        <p className="mt-auto pt-2 font-display text-lg font-semibold tabular-nums tracking-tight">
          {formatNairaYear(listing.yearlyRent)}
        </p>
      </div>
    </Link>
  );
}
