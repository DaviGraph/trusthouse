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
  idRejectionReason?: string | null;
  idReviewedAt?: string | null;
  isSuspended?: boolean;
  adminRole?: string;
  createdAt?: string;
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
  isFeatured?: boolean;
  moderationStatus?: "approved" | "pending" | "flagged";
  agentName?: string;
  agentSlug?: string;
  agentPhone?: string;
  agentAvatarUrl?: string | null;
  agentVerified?: boolean;
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
  agentName?: string;
  agentSlug?: string;
};

export type ReviewStatus = "published" | "pending" | "flagged";

export type ClientReview = {
  id: number;
  agentUserId: string;
  agentName?: string;
  agentSlug?: string;
  agentAvatarUrl?: string | null;
  listingId?: number | null;
  listingTitle?: string | null;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientRole: string; // Tenant, Buyer, Landlord, Visitor
  rating: number; // 1-5
  title: string;
  comment: string;
  status: ReviewStatus;
  isVerifiedClient: boolean;
  adminNotes?: string;
  createdAt: string;
};

export type AdminAgentItem = Agent & {
  listingsCount: number;
  leadsCount: number;
  reviewsCount: number;
  avgRating: number;
  createdAt: string;
};

export type AdminOverviewStats = {
  totalAgents: number;
  verifiedAgents: number;
  pendingIdReviews: number;
  totalListings: number;
  totalInquiries: number;
  totalReviews: number;
  avgRating: number;
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

