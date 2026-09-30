import { createFileRoute, Link, Outlet, notFound } from "@tanstack/react-router";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { Badge } from "@/components/ui/badge";
import { getPublicAgent } from "@/lib/server/agents";

export const Route = createFileRoute("/$slug")({
  loader: async ({ params }) => {
    const agent = await getPublicAgent({ data: params.slug });
    if (!agent) throw notFound();
    return { agent };
  },
  component: PublicAgentLayout,
  notFoundComponent: AgentNotFound,
});

function PublicAgentLayout() {
  const { agent } = Route.useLoaderData();
  const isVerified = agent.idVerificationStatus === "verified";

  return (
    <div className="min-h-dvh bg-bg">
      <header className="sticky top-0 z-30 border-b border-border/80 bg-bg/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
          <BrandMark />
          <div className="min-w-0 text-right flex items-center gap-2">
            <div>
              <div className="flex items-center justify-end gap-1.5">
                <p className="truncate text-sm font-medium">{agent.displayName}</p>
                {isVerified ? (
                  <Badge className="border border-emerald-500/30 bg-emerald-500/15 text-emerald-800 text-[10px] font-semibold py-0 px-1.5">
                    <CheckCircle2 className="mr-1 size-3 text-emerald-700" />
                    Verified Agent
                  </Badge>
                ) : null}
              </div>
              <p className="truncate text-xs text-muted">Independent agent · Lagos</p>
            </div>
          </div>
        </div>
      </header>
      <Outlet />
    </div>
  );
}

function AgentNotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="max-w-md text-center">
        <BrandMark className="justify-center" />
        <h1 className="mt-6 font-display text-2xl font-semibold">This agent page does not exist</h1>
        <p className="mt-2 text-sm text-muted">
          The link may be mistyped, or the agent has not published a TrustHouse page yet.
        </p>
        <p className="mt-6">
          <Link to="/" className="font-medium text-primary hover:underline">
            Back to TrustHouse
          </Link>
        </p>
      </div>
    </main>
  );
}
