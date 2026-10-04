import { BuyerRequirementDialog } from "@/components/buyer-requirement-dialog";

export function InquireDialog({
  listingId,
  listingTitle,
  triggerClassName,
  triggerLabel,
}: {
  listingId: number;
  listingTitle: string;
  triggerClassName?: string;
  triggerLabel?: string;
}) {
  return (
    <BuyerRequirementDialog
      listingId={listingId}
      listingTitle={listingTitle}
      triggerClassName={triggerClassName}
      triggerLabel={triggerLabel}
    />
  );
}
