import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronDown, ChevronUp, MessageCircle, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ListingForm, toListingPayload, type ListingDraft } from "@/components/listing-form";
import { Button } from "@/components/ui/button";
import { getMyListing, updateListing } from "@/lib/server/listings";
import { getMatchingBuyerRequirements, type MatchedBuyer } from "@/lib/server/requirements";
import type { Listing } from "@/lib/types";
import { whatsappUrl } from "@/lib/format";

export const Route = createFileRoute("/dashboard/listings_/$listingId")({
  component: EditListing,
});

function EditListing() {
  const { listingId } = Route.useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [matchedBuyers, setMatchedBuyers] = useState<MatchedBuyer[]>([]);
  const [showMatches, setShowMatches] = useState(true);
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = Number(listingId);
    Promise.all([
      getMyListing({ data: id }),
      getMatchingBuyerRequirements({ data: id }),
    ])
      .then(([l, matches]) => {
        setListing(l);
        setMatchedBuyers(matches);
      })
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

      {/* Automated Inventory Matcher Alert Banner */}
      {matchedBuyers.length > 0 ? (
        <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-950 dark:text-emerald-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="size-5 text-emerald-600 dark:text-emerald-400" />
              <p className="font-display font-semibold text-sm sm:text-base">
                🎯 {matchedBuyers.length} Matching Buyer(s) Found in Your Pipeline!
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-emerald-900 hover:bg-emerald-500/20 dark:text-emerald-200"
              onClick={() => setShowMatches(!showMatches)}
            >
              {showMatches ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            </Button>
          </div>

          {showMatches ? (
            <div className="mt-3 grid gap-3 border-t border-emerald-500/20 pt-3">
              {matchedBuyers.map((mb) => {
                const waMsg = `Hello ${mb.buyerName}, I have a new listing matching your requirements: "${listing.title}" in ${listing.area} for ₦${listing.yearlyRent.toLocaleString()}/year.`;
                return (
                  <div
                    key={mb.id}
                    className="flex flex-col gap-2 rounded-lg bg-surface p-3 text-fg shadow-xs sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{mb.buyerName}</span>
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                          {mb.matchScore}% Match
                        </span>
                      </div>
                      <p className="text-xs text-muted">
                        Max Budget: ₦{mb.budgetMax.toLocaleString()} · Location: {mb.preferredLocation} · {mb.bedrooms} Bed
                      </p>
                    </div>
                    <Button asChild variant="whatsapp" size="sm">
                      <a href={whatsappUrl(mb.buyerPhone, waMsg)} target="_blank" rel="noreferrer">
                        <MessageCircle className="mr-1 size-3.5" />
                        WhatsApp Lead
                      </a>
                    </Button>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      ) : null}

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
