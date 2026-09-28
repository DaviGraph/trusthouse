import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, FileSearch, PhoneCall, ScanEye } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { ListingCard } from "@/components/listing-card";
import { Button } from "@/components/ui/button";
import { SHOWCASE_SLUG } from "@/lib/constants";
import { getPublicAgent } from "@/lib/server/agents";
import { listPublicListings } from "@/lib/server/listings";

export const Route = createFileRoute("/")({
  loader: async () => {
    try {
      const [agent, listings] = await Promise.all([
        getPublicAgent({ data: SHOWCASE_SLUG }),
        listPublicListings({ data: { slug: SHOWCASE_SLUG } }),
      ]);
      return { agent, listings: listings.slice(0, 6) };
    } catch {
      return { agent: null, listings: [] };
    }
  },
  component: Home,
});

const STEPS = [
  {
    icon: BadgeCheck,
    title: "ID checked",
    body: "The agent reviewed a valid government ID of the person claiming to own the home.",
  },
  {
    icon: FileSearch,
    title: "Ownership document seen",
    body: "Deed of assignment, C of O, or consent was sighted — not just promised.",
  },
  {
    icon: ScanEye,
    title: "On-site visit and photos",
    body: "Someone walked the rooms and took current photos, not a recycled brochure.",
  },
  {
    icon: PhoneCall,
    title: "Owner phone confirmed",
    body: "The listed owner answered a live call. No silent middlemen.",
  },
];

function Home() {
  const { agent, listings } = Route.useLoaderData();

  return (
    <div className="min-h-dvh bg-bg">
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="/hero-lagos.jpg"
              alt="Lagos waterfront at golden hour"
              className="size-full object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,28,22,0.35)_0%,rgba(15,28,22,0.55)_45%,rgba(15,28,22,0.78)_100%)]" />
          </div>
          <div className="relative mx-auto flex min-h-[78vh] max-w-6xl flex-col justify-end px-4 pb-16 pt-28 sm:pb-20">
            <p className="text-sm font-medium tracking-wide text-primary-fg/80">
              Lagos · Independent agents · Proof before payment
            </p>
            <h1 className="mt-3 max-w-2xl font-display text-4xl font-semibold text-primary-fg sm:text-5xl lg:text-6xl">
              Find a home in Lagos you can actually trust.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-primary-fg/85 sm:text-lg">
              TrustHouse is a listings page for serious agents. Every home carries a
              verification badge so you know what has been checked — and what has not.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="bg-primary-fg text-primary hover:bg-primary-fg/90">
                <Link to="/$slug" params={{ slug: SHOWCASE_SLUG }}>
                  Browse homes
                  <ArrowRight />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-0 bg-transparent text-primary-fg shadow-[0_0_0_1px_rgba(244,240,232,0.35)] hover:bg-primary-fg/10"
              >
                <Link to="/signup">I am an agent</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <p className="text-sm font-medium text-primary">How trust is earned</p>
          <h2 className="mt-2 max-w-xl font-display text-3xl font-semibold">
            Four proofs. One honest badge.
          </h2>
          <p className="mt-3 max-w-2xl text-muted">
            Green means all four checks are done. Yellow means some. Red means none yet —
            still listed, never dressed up as verified.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step) => (
              <article
                key={step.title}
                className="rounded-xl bg-surface p-5 shadow-card"
              >
                <step.icon className="size-5 text-primary" />
                <h3 className="mt-4 font-display text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{step.body}</p>
              </article>
            ))}
          </div>
        </section>

        {listings.length > 0 ? (
          <section className="mx-auto max-w-6xl px-4 pb-16 sm:pb-20">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-primary">
                  {agent ? `${agent.displayName}'s listings` : "Featured"}
                </p>
                <h2 className="mt-1 font-display text-3xl font-semibold">Homes on the market</h2>
              </div>
              <Button asChild variant="ghost">
                <Link to="/$slug/listings" params={{ slug: SHOWCASE_SLUG }}>
                  See all
                  <ArrowRight />
                </Link>
              </Button>
            </div>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} slug={SHOWCASE_SLUG} />
              ))}
            </div>
          </section>
        ) : null}

        <section className="border-t border-border bg-surface">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-14 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-2xl font-semibold">Agents: publish a page buyers can trust.</h2>
              <p className="mt-2 max-w-xl text-sm text-muted">
                Sign up, add listings with the four proofs, and share your unique link.
                Inquiries land in your dashboard with WhatsApp follow-up.
              </p>
            </div>
            <Button asChild size="lg">
              <Link to="/signup">
                Create your page
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
