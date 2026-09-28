import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ListingForm, toListingPayload, type ListingDraft } from "@/components/listing-form";
import { createListing } from "@/lib/server/listings";

export const Route = createFileRoute("/dashboard/listings_/new")({
  component: NewListing,
});

function NewListing() {
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);

  async function onSubmit(draft: ListingDraft) {
    setPending(true);
    try {
      await createListing({ data: toListingPayload(draft) });
      toast.success("Listing published.");
      await navigate({ to: "/dashboard/listings" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save listing.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-3xl font-semibold">Add a listing</h1>
      <p className="mt-1 text-sm text-muted">
        Only tick proofs you have personally completed. The public badge is computed from this.
      </p>
      <div className="mt-8 rounded-xl bg-surface p-5 shadow-card sm:p-6">
        <ListingForm pending={pending} submitLabel="Publish listing" onSubmit={(d) => void onSubmit(d)} />
      </div>
    </div>
  );
}
