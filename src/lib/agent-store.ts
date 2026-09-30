import { create } from "zustand";
import type { Agent } from "@/lib/types";

/**
 * Global agent store — single source of truth for the current user's
 * agent profile across the entire dashboard. The layout populates it on
 * mount; the profile page writes to it after every update so every consumer
 * (sidebar name, avatar, etc.) reflects the change immediately without a
 * full page reload.
 */
type AgentStore = {
  agent: Agent | null;
  /** Replace the whole agent record (e.g. after a profile update). */
  setAgent: (agent: Agent | null) => void;
  /** Merge partial fields into the existing record. */
  patchAgent: (patch: Partial<Agent>) => void;
};

export const useAgentStore = create<AgentStore>((set) => ({
  agent: null,
  setAgent: (agent) => set({ agent }),
  patchAgent: (patch) =>
    set((state) => ({
      agent: state.agent ? { ...state.agent, ...patch } : null,
    })),
}));
