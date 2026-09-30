import { Link, useRouterState } from "@tanstack/react-router";
import { Home, LayoutDashboard, Menu, Plus, User, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { UserButton } from "@/lib/auth/gates";
import type { Agent } from "@/lib/types";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Leads", icon: LayoutDashboard },
  { to: "/dashboard/listings", label: "Listings", icon: Home },
  { to: "/dashboard/listings/new", label: "Add listing", icon: Plus },
  { to: "/dashboard/profile", label: "Profile", icon: User },
] as const;

export function AgentShell({
  agent,
  children,
}: {
  agent: Agent | null;
  children: ReactNode;
}) {
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
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-surface p-4 md:flex">
        <BrandMark />
        <div className="mt-8 flex-1">{nav}</div>
        {agent ? (
          <Link
            to="/dashboard/profile"
            className="block rounded-lg bg-bg p-3 transition-colors hover:bg-surface-2"
          >
            <p className="text-sm font-medium">{agent.displayName}</p>
            <p className="mt-0.5 truncate text-xs text-muted">/{agent.slug}</p>
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
            <UserButton />
          </div>
        </header>
        <div className="px-4 py-6 sm:px-6 lg:px-8">{children}</div>
      </div>

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
          </aside>
        </div>
      ) : null}
    </div>
  );
}
