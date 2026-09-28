import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function BrandMark({
  className,
  to = "/",
  muted = false,
}: {
  className?: string;
  to?: string;
  muted?: boolean;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "inline-flex items-center gap-2 text-fg no-underline",
        className,
      )}
    >
      <span
        className={cn(
          "grid size-8 place-items-center rounded-[10px] bg-primary text-primary-fg",
          muted && "opacity-90",
        )}
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" className="size-5" fill="none">
          <path
            d="M4.5 10.5 12 4.5l7.5 6V19a1.5 1.5 0 0 1-1.5 1.5h-4.2v-5.1h-3.6V20.5H6A1.5 1.5 0 0 1 4.5 19v-8.5Z"
            fill="currentColor"
            opacity="0.95"
          />
          <path
            d="M10.2 12.4h3.6v1.7h-3.6z"
            fill="var(--color-primary)"
          />
        </svg>
      </span>
      <span className="font-display text-[1.05rem] font-semibold tracking-tight">
        TrustHouse
      </span>
    </Link>
  );
}
