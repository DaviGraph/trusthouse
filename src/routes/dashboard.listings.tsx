import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { TrustBadge } from "@/components/trust-badge";
import { Button } from "@/components/ui/button";
import { formatNairaYear } from "@/lib/format";
import { deleteListing, listMyListings } from "@/lib/server/listings";
import type { Listing } from "@/lib/types";

export const Route = createFileRoute("/dashboard/listings")({
  component: AgentListings,
});

function AgentListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setListings(await listMyListings());
  }

  useEffect(() => {
    refresh()
      .catch(() => toast.error("Could not load listings."))
      .finally(() => setLoading(false));
  }, []);

  async function onDelete(id: number) {
    if (!confirm("Remove this listing?")) return;
    await deleteListing({ data: id });
    await refresh();
    toast.success("Listing removed.");
  }

  if (loading) return <div className="h-48 animate-pulse rounded-xl bg-surface-2" />;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold">Listings</h1>
          <p className="mt-1 text-sm text-muted">Homes on your public page.</p>
        </div>
        <Button asChild>
          <Link to="/dashboard/listings/new">
            <Plus className="size-4" />
            Add listing
          </Link>
        </Button>
      </div>

      {listings.length === 0 ? (
        <div className="mt-10 rounded-xl bg-surface px-6 py-14 text-center shadow-card">
          <p className="font-display text-lg font-semibold">No listings yet</p>
          <p className="mt-2 text-sm text-muted">
            Add a home and tick the proofs you have actually completed.
          </p>
          <Button asChild className="mt-5">
            <Link to="/dashboard/listings/new">Add your first listing</Link>
          </Button>
        </div>
      ) : (
        <ul className="mt-8 grid gap-3">
          {listings.map((listing) => (
            <li
              key={listing.id}
              className="flex flex-col gap-3 rounded-xl bg-surface p-3 shadow-card sm:flex-row sm:items-center"
            >
              <img
                src={listing.photoUrl}
                alt=""
                className="h-28 w-full rounded-lg object-cover sm:h-20 sm:w-28"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{listing.title}</p>
                  <TrustBadge level={listing.trust} />
                </div>
                <p className="mt-1 text-sm text-muted">
                  {listing.area} · {formatNairaYear(listing.yearlyRent)}
                </p>
              </div>
              <div className="flex gap-2">
                <Button asChild variant="secondary" size="sm">
                  <Link
                    to="/dashboard/listings/$listingId"
                    params={{ listingId: String(listing.id) }}
                  >
                    Edit
                  </Link>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => void onDelete(listing.id)}
                >
                  <Trash2 className="size-4" />
                  Remove
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
