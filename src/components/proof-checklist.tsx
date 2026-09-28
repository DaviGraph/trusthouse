import { Check, Minus } from "lucide-react";
import { PROOF_ITEMS } from "@/lib/trust";
import type { Proofs } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ProofChecklist({ proofs }: { proofs: Proofs }) {
  return (
    <ul className="grid gap-2">
      {PROOF_ITEMS.map((item) => {
        const done = proofs[item.key];
        return (
          <li
            key={item.key}
            className={cn(
              "flex items-start gap-3 rounded-lg bg-surface p-3 shadow-[0_0_0_1px_rgba(28,25,23,0.06)]",
              done ? "text-fg" : "text-muted",
            )}
          >
            <span
              className={cn(
                "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full",
                done ? "bg-verified text-primary-fg" : "bg-surface-2 text-faint",
              )}
            >
              {done ? <Check className="size-3" strokeWidth={3} /> : <Minus className="size-3" />}
            </span>
            <span>
              <span className="block text-sm font-medium text-fg">{item.label}</span>
              <span className="mt-0.5 block text-xs leading-5 text-muted">{item.hint}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export function ProofToggles({
  proofs,
  onChange,
}: {
  proofs: Proofs;
  onChange: (next: Proofs) => void;
}) {
  return (
    <fieldset className="grid gap-2">
      <legend className="mb-1 text-sm font-medium">Proofs of trust</legend>
      {PROOF_ITEMS.map((item) => (
        <label
          key={item.key}
          className="flex cursor-pointer items-start gap-3 rounded-lg bg-surface p-3 shadow-[0_0_0_1px_rgba(28,25,23,0.06)]"
        >
          <input
            type="checkbox"
            className="mt-1 size-4 accent-primary"
            checked={proofs[item.key]}
            onChange={(e) => onChange({ ...proofs, [item.key]: e.target.checked })}
          />
          <span>
            <span className="block text-sm font-medium">{item.label}</span>
            <span className="mt-0.5 block text-xs leading-5 text-muted">{item.hint}</span>
          </span>
        </label>
      ))}
    </fieldset>
  );
}
