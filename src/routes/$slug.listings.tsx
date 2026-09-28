import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ListingCard } from "@/components/listing-card";
import { listPublicListings } from "@/lib/server/listings";
import { Route as SlugRoute } from "./$slug";

export const Route = createFileRoute("/$slug/listings")({
  loader: async ({ params }) => {
    const listings = await listPublicListings({ data: { slug: params.slug } });
    return { listings };
  },
  component: PublicListings,
});

function PublicListings() {
  const { agent } = SlugRoute.useLoaderData();
  const { listings } = Route.useLoaderData();
  const [hideUnverified, setHideUnverified] = useState(false);

  const visible = useMemo(
    () => (hideUnverified ? listings.filter((l) => l.trust !== "unverified") : listings),
    [hideUnverified, listings],
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted">
            <Link to="/$slug" params={{ slug: agent.slug }} className="hover:text-fg">
              {agent.displayName}
            </Link>
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold">Homes for rent</h1>
          <p className="mt-1 text-sm text-muted">
            Yearly rent in naira. Badge shows how much of the home has been checked.
          </p>
        </div>
        <label className="flex h-11 cursor-pointer items-center gap-2 rounded-full bg-surface px-4 text-sm shadow-[0_0_0_1px_rgba(28,25,23,0.06)]">
          <input
            type="checkbox"
            className="size-4 accent-primary"
            checked={hideUnverified}
            onChange={(e) => setHideUnverified(e.target.checked)}
          />
          Hide unverified
        </label>
      </div>

      {visible.length === 0 ? (
        <div className="mt-12 rounded-xl bg-surface px-6 py-16 text-center shadow-card">
          <p className="font-display text-lg font-semibold">No listings to show</p>
          <p className="mt-2 text-sm text-muted">
            {hideUnverified
              ? "Turn off the filter to see unverified homes."
              : "This agent has not published homes yet."}
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((listing) => (
            <ListingCard key={listing.id} listing={listing} slug={agent.slug} />
          ))}
        </div>
      )}
    </main>
  );
}
