import { trustLevel } from "@/lib/trust";
import type { Inquiry, LeadStatus, Listing } from "@/lib/types";

export type ListingRow = {
  id: number;
  user_id: string;
  title: string;
  area: string;
  yearly_rent: number;
  bedrooms: number;
  bathrooms: number;
  description: string;
  photo_url: string;
  proof_id_checked: boolean;
  proof_ownership_seen: boolean;
  proof_onsite_visit: boolean;
  proof_owner_phone: boolean;
  created_at: string | Date;
};

export type InquiryRow = {
  id: number;
  listing_id: number;
  listing_title: string;
  listing_area: string;
  agent_user_id: string;
  buyer_name: string;
  buyer_phone: string;
  message: string;
  status: string;
  follow_up_due: string | Date | null;
  created_at: string | Date;
};

function iso(value: string | Date | null | undefined): string | null {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export function mapListing(row: ListingRow): Listing {
  const proofs = {
    proofIdChecked: Boolean(row.proof_id_checked),
    proofOwnershipSeen: Boolean(row.proof_ownership_seen),
    proofOnsiteVisit: Boolean(row.proof_onsite_visit),
    proofOwnerPhone: Boolean(row.proof_owner_phone),
  };
  return {
    id: Number(row.id),
    userId: row.user_id,
    title: row.title,
    area: row.area,
    yearlyRent: Number(row.yearly_rent),
    bedrooms: Number(row.bedrooms),
    bathrooms: Number(row.bathrooms),
    description: row.description,
    photoUrl: row.photo_url,
    createdAt: iso(row.created_at) ?? new Date().toISOString(),
    trust: trustLevel(proofs),
    ...proofs,
  };
}

export function mapInquiry(row: InquiryRow): Inquiry {
  const followUpDue = iso(row.follow_up_due);
  const overdue = Boolean(
    followUpDue &&
      row.status !== "closed" &&
      new Date(followUpDue).getTime() < Date.now(),
  );
  return {
    id: Number(row.id),
    listingId: Number(row.listing_id),
    listingTitle: row.listing_title,
    listingArea: row.listing_area,
    agentUserId: row.agent_user_id,
    buyerName: row.buyer_name,
    buyerPhone: row.buyer_phone,
    message: row.message,
    status: (row.status as LeadStatus) ?? "new",
    followUpDue,
    createdAt: iso(row.created_at) ?? new Date().toISOString(),
    overdue,
  };
}
