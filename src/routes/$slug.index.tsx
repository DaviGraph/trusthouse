import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Building2, CheckCircle2, Search } from "lucide-react";
import { BuyerRequirementDialog } from "@/components/buyer-requirement-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Route as SlugRoute } from "./$slug";

export const Route = createFileRoute("/$slug/")({
  component: AgentEntry,
});

function AgentEntry() {
  const { agent } = SlugRoute.useLoaderData();
  const isVerified = agent.idVerificationStatus === "verified";

  return (
    <main className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-lg flex-col justify-center px-4 py-12">
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium text-primary">Welcome</p>
        {isVerified ? (
          <Badge className="border border-emerald-500/30 bg-emerald-500/15 text-emerald-800 text-xs font-semibold">
            <CheckCircle2 className="mr-1 size-3.5 text-emerald-700" />
            Verified Agent
          </Badge>
        ) : null}
      </div>
      <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
        You are on {agent.displayName}'s TrustHouse.
      </h1>
      {agent.bio ? <p className="mt-3 text-muted">{agent.bio}</p> : null}
      <p className="mt-8 text-sm font-medium text-fg">Who are you?</p>
      <div className="mt-3 grid gap-3">
        <Link
          to="/$slug/listings"
          params={{ slug: agent.slug }}
          className="group flex items-start gap-4 rounded-xl bg-surface p-5 text-fg no-underline shadow-card transition-[transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5"
        >
          <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
            <Search className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center justify-between gap-2 font-display text-lg font-semibold">
              Browse {agent.displayName.split(" ")[0]}'s verified listings
              <ArrowRight className="size-4 text-muted transition-transform duration-200 group-hover:translate-x-0.5" />
            </span>
            <span className="mt-1 block text-sm text-muted">
              See active Lagos properties with verified documentation.
            </span>
          </span>
        </Link>

        <BuyerRequirementDialog
          agentSlug={agent.slug}
          agentName={agent.displayName}
          triggerClassName="w-full justify-between h-auto p-5 text-left bg-surface hover:bg-surface-2 text-fg border border-border shadow-card rounded-xl font-normal"
          triggerLabel={`Submit Property Requirements to ${agent.displayName.split(" ")[0]}`}
        />

        <Link
          to="/login"
          className="flex items-start gap-4 rounded-xl bg-surface p-5 text-fg no-underline shadow-[0_0_0_1px_rgba(28,25,23,0.06)]"
        >
          <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-surface-2 text-muted">
            <Building2 className="size-5" />
          </span>
          <span>
            <span className="block font-display text-lg font-semibold">I list properties</span>
            <span className="mt-1 block text-sm text-muted">Sign in to your agent dashboard.</span>
          </span>
        </Link>
      </div>
      <div className="mt-8">
        <Button asChild variant="ghost">
          <Link to="/">Not looking for this agent</Link>
        </Button>
      </div>
    </main>
  );
}
