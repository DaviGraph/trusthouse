import type { Proofs, TrustLevel } from "./types";

export function countProofs(p: Proofs): number {
  return [
    p.proofIdChecked,
    p.proofOwnershipSeen,
    p.proofOnsiteVisit,
    p.proofOwnerPhone,
  ].filter(Boolean).length;
}

export function trustLevel(p: Proofs): TrustLevel {
  const n = countProofs(p);
  if (n === 4) return "verified";
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
    key: "proofOwnershipSeen",
    label: "Ownership document seen",
    hint: "Deed of assignment, C of O, or governor’s consent was sighted.",
  },
  {
    key: "proofOnsiteVisit",
    label: "On-site visit and photos",
    hint: "The agent walked the property and took current photographs.",
  },
  {
    key: "proofOwnerPhone",
    label: "Owner phone confirmed",
    hint: "The agent reached the owner on a live call at the listed number.",
  },
];
