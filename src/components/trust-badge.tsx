import { ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { TrustLevel } from "@/lib/types";
import { cn } from "@/lib/utils";

const COPY: Record<
  TrustLevel,
  { label: string; className: string; Icon: typeof ShieldCheck }
> = {
  verified: {
    label: "Verified",
    className: "bg-verified-bg text-verified",
    Icon: ShieldCheck,
  },
  partial: {
    label: "Partly Verified",
    className: "bg-partial-bg text-partial",
    Icon: ShieldQuestion,
  },
  unverified: {
    label: "Unverified",
    className: "bg-unverified-bg text-unverified",
    Icon: ShieldAlert,
  },
};

export function TrustBadge({
  level,
  className,
}: {
  level: TrustLevel;
  className?: string;
}) {
  const { label, className: tone, Icon } = COPY[level];
  return (
    <Badge className={cn("gap-1", tone, className)}>
      <Icon className="size-3.5" strokeWidth={2.2} />
      {label}
    </Badge>
  );
}
