import { Link, useRouterState } from "@tanstack/react-router";
import { Home, LayoutDashboard, Menu, Plus, User, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { UserButton } from "@/lib/auth/gates";
import { useAgentStore } from "@/lib/agent-store";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Leads", icon: LayoutDashboard },
  { to: "/dashboard/listings", label: "Listings", icon: Home },
  { to: "/dashboard/listings/new", label: "Add listing", icon: Plus },
  { to: "/dashboard/profile", label: "Profile", icon: User },
] as const;

/** Avatar circle: shows photo if available, else initials. */
function AgentAvatar({
  displayName,
  avatarUrl,
  size = "md",
}: {
  displayName: string;
  avatarUrl?: string | null;
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? "size-7" : "size-9";
  const text = size === "sm" ? "text-xs" : "text-sm";

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={displayName}
        className={cn(dim, "rounded-full object-cover ring-1 ring-border shrink-0")}
      />
    );
  }

  return (
    <div
      className={cn(
        dim,
        "rounded-full bg-primary-soft flex items-center justify-center shrink-0 ring-1 ring-border",
      )}
    >
      <span className={cn(text, "font-semibold text-primary leading-none select-none")}>
        {displayName ? displayName.charAt(0).toUpperCase() : "A"}
      </span>
    </div>
  );
}

export function AgentShell({ children }: { children: ReactNode }) {
  // Read agent directly from the store so any write (profile update) instantly
  // propagates to this component without prop drilling or re-fetching.
  const agent = useAgentStore((s) => s.agent);
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const nav = (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active =
          item.to === "/dashboard"
            ? pathname === "/dashboard"
            : item.to === "/dashboard/listings"
              ? pathname === "/dashboard/listings"
              : item.to === "/dashboard/profile"
                ? pathname === "/dashboard/profile"
                : pathname === item.to;
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => setOpen(false)}
            className={cn(
              "flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors duration-150",
              active ? "bg-primary-soft text-primary" : "text-muted hover:bg-surface-2 hover:text-fg",
            )}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-dvh bg-bg">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-surface p-4 md:flex">
        <BrandMark />
        <div className="mt-8 flex-1">{nav}</div>

        {/* Agent card at bottom of sidebar — live-updates from store */}
        {agent ? (
          <Link
            to="/dashboard/profile"
            className="flex items-center gap-3 rounded-lg bg-bg p-3 transition-colors hover:bg-surface-2"
          >
            <AgentAvatar
              displayName={agent.displayName}
              avatarUrl={agent.avatarUrl}
              size="md"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium leading-tight">{agent.displayName}</p>
              <p className="truncate text-xs text-muted">/{agent.slug}</p>
            </div>
          </Link>
        ) : null}
      </aside>

      <div className="md:pl-64">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-border bg-bg/90 px-4 backdrop-blur-md md:h-16">
          <button
            type="button"
            className="grid size-11 place-items-center rounded-md md:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>
          <p className="font-display text-sm font-semibold md:hidden">TrustHouse</p>
          <div className="ml-auto flex items-center gap-2">
            {agent ? (
              <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
                <Link to="/$slug" params={{ slug: agent.slug }}>
                  View public page
                </Link>
              </Button>
            ) : null}
            {/* Agent avatar shown in the top-right on mobile */}
            {agent ? (
              <Link to="/dashboard/profile" className="md:hidden">
                <AgentAvatar
                  displayName={agent.displayName}
                  avatarUrl={agent.avatarUrl}
                  size="sm"
                />
              </Link>
            ) : null}
            <UserButton displayName={agent?.displayName} avatarUrl={agent?.avatarUrl} />
          </div>
        </header>
        <div className="px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </div>

      {/* Mobile drawer */}
      {open ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-fg/40"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-surface p-4 shadow-card">
            <div className="mb-6 flex items-center justify-between">
              <BrandMark />
              <button
                type="button"
                className="grid size-11 place-items-center"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>
            {nav}

            {/* Also show agent card in mobile drawer */}
            {agent ? (
              <Link
                to="/dashboard/profile"
                onClick={() => setOpen(false)}
                className="mt-auto flex items-center gap-3 rounded-lg bg-bg p-3 transition-colors hover:bg-surface-2"
              >
                <AgentAvatar
                  displayName={agent.displayName}
                  avatarUrl={agent.avatarUrl}
                  size="md"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium leading-tight">{agent.displayName}</p>
                  <p className="truncate text-xs text-muted">/{agent.slug}</p>
                </div>
              </Link>
            ) : null}
          </aside>
        </div>
      ) : null}
    </div>
  );
}
