import { useState, type FormEvent } from "react";
import { MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createInquiry } from "@/lib/server/inquiries";
import { cn } from "@/lib/utils";

export function InquireDialog({
  listingId,
  listingTitle,
  triggerClassName,
}: {
  listingId: number;
  listingTitle: string;
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      await createInquiry({
        data: { listingId, buyerName: name, buyerPhone: phone, message },
      });
      toast.success("Inquiry sent. The agent will reach you on WhatsApp or phone.");
      setOpen(false);
      setName("");
      setPhone("");
      setMessage("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send inquiry.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        className={triggerClassName}
        onClick={() => setOpen(true)}
      >
        <MessageSquare />
        Inquire
      </Button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
          <button
            type="button"
            className="absolute inset-0 bg-fg/40"
            aria-label="Close"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-labelledby="inquire-title"
            className={cn(
              "relative z-10 w-full rounded-t-xl bg-surface p-5 shadow-card sm:max-w-md sm:rounded-xl",
            )}
          >
            <h2 id="inquire-title" className="font-display text-xl font-semibold">
              Inquire about this home
            </h2>
            <p className="mt-1 text-sm text-muted">{listingTitle}</p>
            <form className="mt-5 grid gap-4" onSubmit={onSubmit}>
              <div className="grid gap-1.5">
                <Label htmlFor="buyer-name">Your name</Label>
                <Input
                  id="buyer-name"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="buyer-phone">Phone number</Label>
                <Input
                  id="buyer-phone"
                  required
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="0803 000 0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="buyer-message">Message</Label>
                <Textarea
                  id="buyer-message"
                  placeholder="When can I view, and is the rent still this amount?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
              <div className="flex gap-2 pt-1">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={pending}>
                  {pending ? "Sending…" : "Send inquiry"}
                </Button>
              </div>
              <p className="text-xs text-muted">No account needed. The agent sees this as a lead.</p>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
