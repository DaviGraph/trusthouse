import { useState, type FormEvent } from "react";
import { CheckCircle2, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createBuyerRequirement } from "@/lib/server/requirements";
import { cn } from "@/lib/utils";

const PROPERTY_TYPES = [
  "Apartment",
  "Duplex",
  "Terrace",
  "Fully Detached",
  "Land",
  "Commercial",
] as const;

const TIMELINES = [
  "Immediate",
  "Within 1 Month",
  "Just Browsing",
] as const;

export function BuyerRequirementDialog({
  agentSlug,
  agentName: propAgentName,
  listingId,
  listingTitle,
  triggerClassName,
  triggerLabel,
}: {
  agentSlug?: string;
  agentName?: string;
  listingId?: number;
  listingTitle?: string;
  triggerClassName?: string;
  triggerLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [submittedAgentName, setSubmittedAgentName] = useState<string | null>(null);

  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [propertyType, setPropertyType] = useState<(typeof PROPERTY_TYPES)[number]>("Apartment");
  const [preferredLocation, setPreferredLocation] = useState("Lekki Phase 1");
  const [budgetMin, setBudgetMin] = useState<string>("");
  const [budgetMax, setBudgetMax] = useState<string>("");
  const [bedrooms, setBedrooms] = useState<number>(2);
  const [timeline, setTimeline] = useState<(typeof TIMELINES)[number]>("Immediate");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);

    const maxBudgetVal = parseFloat(budgetMax.replace(/,/g, ""));
    const minBudgetVal = budgetMin ? parseFloat(budgetMin.replace(/,/g, "")) : 0;

    if (isNaN(maxBudgetVal) || maxBudgetVal <= 0) {
      toast.error("Please enter a valid maximum budget.");
      setPending(false);
      return;
    }

    try {
      const res = await createBuyerRequirement({
        data: {
          agentSlug,
          listingId,
          buyerName,
          buyerPhone,
          buyerEmail: buyerEmail || undefined,
          propertyType,
          preferredLocation,
          budgetMin: isNaN(minBudgetVal) ? 0 : minBudgetVal,
          budgetMax: maxBudgetVal,
          bedrooms,
          timeline,
        },
      });

      setSubmittedAgentName(res.agentName || propAgentName || "The agent");
      toast.success("Requirements submitted successfully!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit requirements.");
    } finally {
      setPending(false);
    }
  }

  function resetForm() {
    setOpen(false);
    setSubmittedAgentName(null);
    setBuyerName("");
    setBuyerPhone("");
    setBuyerEmail("");
    setPropertyType("Apartment");
    setPreferredLocation("Lekki Phase 1");
    setBudgetMin("");
    setBudgetMax("");
    setBedrooms(2);
    setTimeline("Immediate");
  }

  return (
    <>
      <Button
        type="button"
        className={triggerClassName}
        onClick={() => setOpen(true)}
      >
        <MessageSquare className="mr-2 size-4" />
        {triggerLabel || (listingId ? "Request / Inquire" : "Send Your Property Requirements")}
      </Button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
          <button
            type="button"
            className="absolute inset-0 bg-fg/40 backdrop-blur-xs"
            aria-label="Close"
            onClick={resetForm}
          />
          <div
            role="dialog"
            aria-labelledby="requirement-title"
            className={cn(
              "relative z-10 max-h-[90vh] w-full overflow-y-auto rounded-t-xl bg-surface p-5 shadow-card sm:max-w-lg sm:rounded-xl sm:p-6",
            )}
          >
            {submittedAgentName ? (
              <div className="py-6 text-center">
                <CheckCircle2 className="mx-auto size-12 text-emerald-600" />
                <h3 className="mt-4 font-display text-xl font-semibold">Requirement Received!</h3>
                <p className="mt-2 text-sm text-muted">
                  Thank you! <strong>{submittedAgentName}</strong> has received your requirements and will reach out on WhatsApp shortly.
                </p>
                <Button type="button" className="mt-6 w-full" onClick={resetForm}>
                  Close
                </Button>
              </div>
            ) : (
              <>
                <h2 id="requirement-title" className="font-display text-xl font-semibold">
                  {listingTitle ? `Inquire about ${listingTitle}` : "Tell Us Your Property Needs"}
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Share your budget & location preferences to get matched with verified properties.
                </p>

                <form className="mt-5 grid gap-4" onSubmit={onSubmit}>
                  <div className="grid gap-1.5">
                    <Label htmlFor="buyerName">Full Name *</Label>
                    <Input
                      id="buyerName"
                      required
                      placeholder="e.g. Chinedu Eze"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-1.5">
                      <Label htmlFor="buyerPhone">WhatsApp Phone Number *</Label>
                      <Input
                        id="buyerPhone"
                        required
                        type="tel"
                        inputMode="tel"
                        placeholder="0803 000 0000"
                        value={buyerPhone}
                        onChange={(e) => setBuyerPhone(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="buyerEmail">Email (Optional)</Label>
                      <Input
                        id="buyerEmail"
                        type="email"
                        placeholder="chinedu@example.com"
                        value={buyerEmail}
                        onChange={(e) => setBuyerEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-1.5">
                      <Label htmlFor="propertyType">Property Type *</Label>
                      <select
                        id="propertyType"
                        className="h-10 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus:ring-1 focus:ring-ring"
                        value={propertyType}
                        onChange={(e) => setPropertyType(e.target.value as any)}
                      >
                        {PROPERTY_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid gap-1.5">
                      <Label htmlFor="preferredLocation">Preferred Location *</Label>
                      <Input
                        id="preferredLocation"
                        required
                        placeholder="e.g. Lekki Phase 1, Chevron, Ikoyi"
                        value={preferredLocation}
                        onChange={(e) => setPreferredLocation(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-1.5">
                      <Label htmlFor="budgetMin">Min Budget (₦)</Label>
                      <Input
                        id="budgetMin"
                        type="number"
                        placeholder="e.g. 3,000,000"
                        value={budgetMin}
                        onChange={(e) => setBudgetMin(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="budgetMax">Max Budget (₦) *</Label>
                      <Input
                        id="budgetMax"
                        required
                        type="number"
                        placeholder="e.g. 8,000,000"
                        value={budgetMax}
                        onChange={(e) => setBudgetMax(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-1.5">
                      <Label>Bedrooms Needed *</Label>
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5].map((num) => (
                          <button
                            key={num}
                            type="button"
                            className={cn(
                              "flex-1 rounded-md border py-2 text-xs font-medium transition-colors",
                              bedrooms === num
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-input bg-surface text-fg hover:bg-surface-2",
                            )}
                            onClick={() => setBedrooms(num)}
                          >
                            {num === 5 ? "5+" : `${num} Bed`}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-1.5">
                      <Label htmlFor="timeline">Move-in Timeline *</Label>
                      <select
                        id="timeline"
                        className="h-10 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus:ring-1 focus:ring-ring"
                        value={timeline}
                        onChange={(e) => setTimeline(e.target.value as any)}
                      >
                        {TIMELINES.map((tl) => (
                          <option key={tl} value={tl}>
                            {tl}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3">
                    <Button
                      type="button"
                      variant="secondary"
                      className="flex-1"
                      onClick={resetForm}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1" disabled={pending}>
                      {pending ? "Submitting…" : "Submit Requirements"}
                    </Button>
                  </div>
                  <p className="text-center text-xs text-muted">
                    Your request will be sent directly to the agent's intake dashboard.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
