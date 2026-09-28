import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ListingForm, toListingPayload, type ListingDraft } from "@/components/listing-form";
import { getMyListing, updateListing } from "@/lib/server/listings";
import type { Listing } from "@/lib/types";

export const Route = createFileRoute("/dashboard/listings_/$listingId")({
  component: EditListing,
});

function EditListing() {
  const { listingId } = Route.useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyListing({ data: Number(listingId) })
      .then(setListing)
      .catch(() => toast.error("Could not load listing."))
      .finally(() => setLoading(false));
  }, [listingId]);

  async function onSubmit(draft: ListingDraft) {
    if (!listing) return;
    setPending(true);
    try {
      await updateListing({ data: { id: listing.id, ...toListingPayload(draft) } });
      toast.success("Listing updated.");
      await navigate({ to: "/dashboard/listings" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save listing.");
    } finally {
      setPending(false);
    }
  }

  if (loading) return <div className="h-48 animate-pulse rounded-xl bg-surface-2" />;
  if (!listing) {
    return <p className="text-sm text-muted">That listing was not found.</p>;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-3xl font-semibold">Edit listing</h1>
      <p className="mt-1 text-sm text-muted">Update details or the four proofs as you complete them.</p>
      <div className="mt-8 rounded-xl bg-surface p-5 shadow-card sm:p-6">
        <ListingForm
          initial={listing}
          pending={pending}
          submitLabel="Save changes"
          onSubmit={(d) => void onSubmit(d)}
        />
      </div>
    </div>
  );
}
