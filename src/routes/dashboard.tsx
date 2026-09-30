import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AgentShell } from "@/components/agent-shell";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { ensureAgentProfile, getMyAgent } from "@/lib/server/agents";
import { useAgentStore } from "@/lib/agent-store";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
});

function DashboardLayout() {
  const { user, isPending } = useCurrentUserState();
  const setAgent = useAgentStore((s) => s.setAgent);
  const [ready, setReady] = useState(false);

  /**
   * Guard against re-fetching on every render: the layout only populates the
   * store on first mount. After that, the profile page owns all writes via
   * applyAgent() — a re-fetch here would stomp the fresh data the user just saved.
   */
  const initialLoadDone = useRef(false);

  useEffect(() => {
    if (isPending || !user) return;

    // If we already loaded once this session AND the store already has data,
    // just mark ready and don't overwrite whatever the profile page wrote.
    if (initialLoadDone.current) {
      setReady(true);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        let profile = await getMyAgent();
        if (!profile) {
          profile = await ensureAgentProfile({
            data: {
              displayName: user.displayName || user.primaryEmail || "Agent",
              phone: "",
            },
          });
        }
        if (!cancelled) {
          setAgent(profile);
          initialLoadDone.current = true;
        }
      } catch {
        if (!cancelled) setAgent(null);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isPending, user, setAgent]);

  if (isPending) {
    return <div className="min-h-dvh bg-bg" />;
  }
  if (!user) return <RedirectToSignIn />;

  return (
    <AgentShell>
      {ready ? <Outlet /> : <div className="h-40 animate-pulse rounded-xl bg-surface-2" />}
    </AgentShell>
  );
}
