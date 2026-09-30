import type { Proofs, TrustLevel } from "./types";

// Ownership document is intentionally not counted for now.
// It comes back once there is a real way to check documents.
export function countProofs(p: Proofs): number {
  return [p.proofIdChecked, p.proofOnsiteVisit, p.proofOwnerPhone].filter(Boolean).length;
}

export function trustLevel(p: Proofs): TrustLevel {
  const n = countProofs(p);
  if (n === 3) return "verified";
  if (n === 0) return "unverified";
  return "partial";
}

export const PROOF_ITEMS: {
  key: keyof Proofs;
  label: string;
  hint: string;
}[] = [
  {
    key: "proofIdChecked",
    label: "ID checked",
    hint: "A valid government ID of the owner was reviewed in person or on a video call.",
  },
  {
    key: "proofOnsiteVisit",
    label: "On-site visit and photos",
    hint: "A photo was taken live at the property, and the phone's location matched the listed area.",
  },
  {
    key: "proofOwnerPhone",
    label: "Owner phone confirmed",
    hint: "The agent reached the owner on a live call at the listed number.",
  },
];