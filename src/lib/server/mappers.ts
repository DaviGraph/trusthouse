import { trustLevel } from "@/lib/trust";
import type { BuyerRequirement, Inquiry, LeadStatus, Listing } from "@/lib/types";

export type ListingRow = {
  id: number;
  user_id: string;
  title: string;
  area: string;
  yearly_rent: number;
  agency_fee?: number | null;
  legal_fee?: number | null;
  caution_fee?: number | null;
  service_charge?: number | null;
  bedrooms: number;
  bathrooms: number;
  description: string;
  photo_url: string;
  photo_urls: string[] | null;
  verification_video_url: string | null;
  onsite_captured_at: string | Date | null;
  proof_id_checked: boolean;
  proof_ownership_seen: boolean;
  proof_onsite_visit: boolean;
  proof_owner_phone: boolean;
  created_at: string | Date;
};

export type BuyerRequirementRow = {
  id: string;
  agent_id?: string | null;
  buyer_name: string;
  buyer_phone: string;
  buyer_email?: string | null;
  property_type: string;
  preferred_location: string;
  budget_min: number;
  budget_max: number;
  bedrooms: number;
  timeline: string;
  status: string;
  followup_due_date?: string | Date | null;
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
  const photoUrls = row.photo_urls && row.photo_urls.length > 0 ? row.photo_urls : [row.photo_url].filter(Boolean);
  return {
    id: Number(row.id),
    userId: row.user_id,
    title: row.title,
    area: row.area,
    yearlyRent: Number(row.yearly_rent),
    agencyFee: Number(row.agency_fee ?? 0),
    legalFee: Number(row.legal_fee ?? 0),
    cautionFee: Number(row.caution_fee ?? 0),
    serviceCharge: Number(row.service_charge ?? 0),
    bedrooms: Number(row.bedrooms),
    bathrooms: Number(row.bathrooms),
    description: row.description,
    photoUrl: photoUrls[0] ?? row.photo_url,
    photoUrls,
    verificationVideoUrl: row.verification_video_url,
    onsiteCapturedAt: iso(row.onsite_captured_at),
    createdAt: iso(row.created_at) ?? new Date().toISOString(),
    trust: trustLevel(proofs),
    ...proofs,
  };
}

export function mapBuyerRequirement(row: BuyerRequirementRow): BuyerRequirement {
  return {
    id: String(row.id),
    agentId: row.agent_id ? String(row.agent_id) : null,
    buyerName: row.buyer_name,
    buyerPhone: row.buyer_phone,
    buyerEmail: row.buyer_email ?? null,
    propertyType: row.property_type,
    preferredLocation: row.preferred_location,
    budgetMin: Number(row.budget_min ?? 0),
    budgetMax: Number(row.budget_max ?? 0),
    bedrooms: Number(row.bedrooms ?? 1),
    timeline: row.timeline ?? "Immediate",
    status: row.status ?? "New",
    followupDueDate: iso(row.followup_due_date),
    createdAt: iso(row.created_at) ?? new Date().toISOString(),
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
