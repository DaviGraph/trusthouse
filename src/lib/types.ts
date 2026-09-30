export type LeadStatus = "new" | "contacted" | "viewing_booked" | "closed";

export type TrustLevel = "verified" | "partial" | "unverified";

export type Proofs = {
  proofIdChecked: boolean;
  proofOwnershipSeen: boolean;
  proofOnsiteVisit: boolean;
  proofOwnerPhone: boolean;
};

export type IdVerificationStatus = "not_submitted" | "pending_review" | "verified";

export const ID_VERIFICATION_STATUS_LABEL: Record<IdVerificationStatus, string> = {
  not_submitted: "Not submitted",
  pending_review: "Pending review",
  verified: "Verified",
};

export type Agent = {
  userId: string;
  slug: string;
  displayName: string;
  phone: string;
  bio: string;
  avatarUrl?: string | null;
  idDocumentUrl?: string | null;
  idVerificationStatus?: IdVerificationStatus;
};

export type Listing = Proofs & {
  id: number;
  userId: string;
  title: string;
  area: string;
  yearlyRent: number;
  bedrooms: number;
  bathrooms: number;
  description: string;
  photoUrl: string;
  photoUrls: string[];
  verificationVideoUrl: string | null;
  onsiteCapturedAt: string | null;
  createdAt: string;
  trust: TrustLevel;
};

export type Inquiry = {
  id: number;
  listingId: number;
  listingTitle: string;
  listingArea: string;
  agentUserId: string;
  buyerName: string;
  buyerPhone: string;
  message: string;
  status: LeadStatus;
  followUpDue: string | null;
  createdAt: string;
  overdue: boolean;
};

export const LEAD_STATUS_LABEL: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  viewing_booked: "Viewing Booked",
  closed: "Closed",
};

export const LEAD_STATUSES: LeadStatus[] = [
  "new",
  "contacted",
  "viewing_booked",
  "closed",
];
