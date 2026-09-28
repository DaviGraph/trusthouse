import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Bath, BedDouble, MapPin } from "lucide-react";
import { InquireDialog } from "@/components/inquire-dialog";
import { ProofChecklist } from "@/components/proof-checklist";
import { TrustBadge } from "@/components/trust-badge";
import { formatNairaYear } from "@/lib/format";
import { getPublicListing } from "@/lib/server/listings";
import { Route as SlugRoute } from "./$slug";

export const Route = createFileRoute("/$slug/listings_/$listingId")({
  loader: async ({ params }) => {
    const listing = await getPublicListing({
      data: { slug: params.slug, listingId: Number(params.listingId) },
    });
    if (!listing) throw notFound();
    return { listing };
  },
  component: ListingDetail,
  notFoundComponent: () => (
    <main className="px-4 py-16 text-center">
      <p className="font-display text-xl font-semibold">Listing not found</p>
    </main>
  ),
});

function ListingDetail() {
  const { agent } = SlugRoute.useLoaderData();
  const { listing } = Route.useLoaderData();

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 sm:py-10">
      <Link
        to="/$slug/listings"
        params={{ slug: agent.slug }}
        className="inline-flex h-11 items-center gap-2 text-sm text-muted hover:text-fg"
      >
        <ArrowLeft className="size-4" />
        All listings
      </Link>

      <div className="mt-4 overflow-hidden rounded-xl bg-surface shadow-card">
        <div className="relative aspect-[16/10] bg-surface-2 sm:aspect-[2/1]">
          <img src={listing.photoUrl} alt={listing.title} className="size-full object-cover" />
          <div className="absolute top-4 left-4">
            <TrustBadge level={listing.trust} />
          </div>
        </div>
        <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h1 className="font-display text-3xl font-semibold">{listing.title}</h1>
            <p className="mt-2 flex items-center gap-1.5 text-muted">
              <MapPin className="size-4" />
              {listing.area}, Lagos
            </p>
            <p className="mt-4 font-display text-2xl font-semibold tabular-nums">
              {formatNairaYear(listing.yearlyRent)}
            </p>
            <div className="mt-4 flex gap-4 text-sm text-muted">
              <span className="inline-flex items-center gap-1.5">
                <BedDouble className="size-4" />
                {listing.bedrooms} bed
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Bath className="size-4" />
                {listing.bathrooms} bath
              </span>
            </div>
            <p className="mt-6 text-[0.95rem] leading-7 text-fg/90">{listing.description}</p>
            <div className="mt-6 lg:hidden">
              <InquireDialog listingId={listing.id} listingTitle={listing.title} triggerClassName="w-full" />
            </div>
          </div>
          <aside>
            <h2 className="font-display text-lg font-semibold">Proof checklist</h2>
            <p className="mt-1 mb-4 text-sm text-muted">
              What {agent.displayName.split(" ")[0]} has personally confirmed.
            </p>
            <ProofChecklist proofs={listing} />
            <div className="mt-6 hidden lg:block">
              <InquireDialog listingId={listing.id} listingTitle={listing.title} triggerClassName="w-full" />
            </div>
            <p className="mt-4 text-xs text-muted">
              Listed by {agent.displayName}. Inquiries go straight to this agent.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
