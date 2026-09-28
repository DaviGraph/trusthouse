import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AgentShell } from "@/components/agent-shell";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { ensureAgentProfile, getMyAgent } from "@/lib/server/agents";
import type { Agent } from "@/lib/types";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
});

function DashboardLayout() {
  const { user, isPending } = useCurrentUserState();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isPending || !user) return;
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
        if (!cancelled) setAgent(profile);
      } catch {
        if (!cancelled) setAgent(null);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isPending, user]);

  if (isPending) {
    return <div className="min-h-dvh bg-bg" />;
  }
  if (!user) return <RedirectToSignIn />;

  return (
    <AgentShell agent={agent}>
      {ready ? <Outlet /> : <div className="h-40 animate-pulse rounded-xl bg-surface-2" />}
    </AgentShell>
  );
}
