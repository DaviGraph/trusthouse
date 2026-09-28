import { createFileRoute, Link, Outlet, notFound } from "@tanstack/react-router";
import { BrandMark } from "@/components/brand-mark";
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
  return (
    <div className="min-h-dvh bg-bg">
      <header className="sticky top-0 z-30 border-b border-border/80 bg-bg/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
          <BrandMark />
          <div className="min-w-0 text-right">
            <p className="truncate text-sm font-medium">{agent.displayName}</p>
            <p className="truncate text-xs text-muted">Independent agent · Lagos</p>
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
