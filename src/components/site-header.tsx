import { Link } from "@tanstack/react-router";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export function SiteHeader() {
  const { isPending } = useCurrentUserState();

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-bg/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <BrandMark />
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/$slug"
            params={{ slug: "adeola" }}
            className="hidden h-11 items-center rounded-md px-3 text-sm font-medium text-muted hover:text-fg sm:inline-flex"
          >
            Browse homes
          </Link>
          {isPending ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-surface-2" />
          ) : (
            <>
              <SignedIn>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
                <UserButton />
              </SignedIn>
              <SignedOut>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/login">Sign in</Link>
                </Button>
                <Button asChild size="sm">
                  <Link to="/signup">List with us</Link>
                </Button>
              </SignedOut>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
