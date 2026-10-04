import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Bath, BedDouble, CheckCircle2, Copy, FileText, MapPin, Share2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { InquireDialog } from "@/components/inquire-dialog";
import { ProofChecklist } from "@/components/proof-checklist";
import { TrustBadge } from "@/components/trust-badge";
import { Button } from "@/components/ui/button";
import { formatNairaYear } from "@/lib/format";
import { downloadMoveInInvoicePDF } from "@/lib/pdf-generator";
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
  const photos = listing.photoUrls.length > 0 ? listing.photoUrls : [listing.photoUrl];
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const agencyFee = listing.agencyFee ?? 0;
  const legalFee = listing.legalFee ?? 0;
  const cautionFee = listing.cautionFee ?? 0;
  const serviceCharge = listing.serviceCharge ?? 0;
  const totalMoveInCost = listing.yearlyRent + agencyFee + legalFee + cautionFee + serviceCharge;

  function copyShareLink() {
    const url = window.location.href;
    void navigator.clipboard.writeText(url);
    toast.success("Listing link copied to clipboard!");
  }

  async function handleDownloadPDF() {
    setDownloadingPdf(true);
    try {
      await downloadMoveInInvoicePDF({
        agentName: agent.displayName,
        agentPhone: agent.phone,
        listing,
        publicUrl: window.location.href,
      });
      toast.success("PDF invoice downloaded successfully!");
    } catch {
      toast.error("Could not generate PDF invoice.");
    } finally {
      setDownloadingPdf(false);
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 sm:py-10">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          to="/$slug/listings"
          params={{ slug: agent.slug }}
          className="inline-flex h-11 items-center gap-2 text-sm text-muted hover:text-fg"
        >
          <ArrowLeft className="size-4" />
          All listings
        </Link>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => void handleDownloadPDF()} disabled={downloadingPdf}>
            <FileText className="mr-1.5 size-3.5 text-primary" />
            {downloadingPdf ? "Generating PDF…" : "Download PDF Invoice Summary"}
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={copyShareLink}>
            <Share2 className="mr-1.5 size-3.5" />
            Share Listing
          </Button>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl bg-surface shadow-card">
        {/* Photo Gallery & Carousel */}
        <div className="relative aspect-[16/10] bg-surface-2 sm:aspect-[2/1]">
          <img
            src={photos[selectedPhotoIndex] ?? photos[0]}
            alt={listing.title}
            className="size-full object-cover transition-all duration-300"
          />
          <div className="absolute top-4 left-4">
            <TrustBadge level={listing.trust} />
          </div>
        </div>

        {photos.length > 1 ? (
          <div className="flex gap-2 overflow-x-auto p-3 bg-surface-2/50 border-b border-border/60">
            {photos.map((url, idx) => (
              <button
                key={url}
                type="button"
                onClick={() => setSelectedPhotoIndex(idx)}
                className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-md border-2 transition-all ${
                  selectedPhotoIndex === idx ? "border-primary ring-2 ring-primary/20" : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <img src={url} alt={`Photo ${idx + 1}`} className="size-full object-cover" />
              </button>
            ))}
          </div>
        ) : null}

        <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h1 className="font-display text-3xl font-semibold">{listing.title}</h1>
            <p className="mt-2 flex items-center gap-1.5 text-muted">
              <MapPin className="size-4" />
              {listing.area}, Lagos
            </p>
            <p className="mt-4 font-display text-3xl font-bold text-primary tabular-nums">
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

            {/* Itemized Fee Breakdown Section */}
            <div className="mt-6 rounded-xl border border-border bg-surface-2/60 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-semibold text-lg text-fg">Itemized Move-In Fee Breakdown</h3>
                <Button type="button" variant="ghost" size="sm" className="text-xs text-primary" onClick={() => void handleDownloadPDF()}>
                  <FileText className="mr-1 size-3.5" /> PDF
                </Button>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted">Annual Rent</span>
                  <span className="font-semibold text-fg">₦{listing.yearlyRent.toLocaleString()}</span>
                </div>
                {agencyFee > 0 ? (
                  <div className="flex justify-between py-1 border-b border-border/40">
                    <span className="text-muted">Agency Fee</span>
                    <span className="font-semibold text-fg">₦{agencyFee.toLocaleString()}</span>
                  </div>
                ) : null}
                {legalFee > 0 ? (
                  <div className="flex justify-between py-1 border-b border-border/40">
                    <span className="text-muted">Legal / Agreement Fee</span>
                    <span className="font-semibold text-fg">₦{legalFee.toLocaleString()}</span>
                  </div>
                ) : null}
                {cautionFee > 0 ? (
                  <div className="flex justify-between py-1 border-b border-border/40">
                    <span className="text-muted">Refundable Caution Deposit</span>
                    <span className="font-semibold text-fg">₦{cautionFee.toLocaleString()}</span>
                  </div>
                ) : null}
                {serviceCharge > 0 ? (
                  <div className="flex justify-between py-1 border-b border-border/40">
                    <span className="text-muted">Service Charge</span>
                    <span className="font-semibold text-fg">₦{serviceCharge.toLocaleString()}</span>
                  </div>
                ) : null}
                <div className="flex justify-between pt-2 text-base font-bold text-primary">
                  <span>Total Estimated Move-In Cost</span>
                  <span>₦{totalMoveInCost.toLocaleString()}</span>
                </div>
              </div>
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
