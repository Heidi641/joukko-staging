export type Role = "consumer" | "company" | "admin";
export type GroupStatus = "draft" | "pending" | "active" | "hidden" | "paused";
export type GroupType = "open" | "exact";
export type ContractStatus = "can_switch_now" | "fixed_term" | "open_ended" | "unknown";
export type EngagementLevel = "following" | "joined" | "conditional_commitment";
export type MatchStatus = "conditional_match" | "threshold_reached" | "confirmed" | "completed" | "expired" | "cancelled" | "failed_threshold";
export type CompanyVerificationStatus = "unverified" | "pending_verification" | "verified" | "suspended";
export type SellerTermsType = "text" | "url" | "document";
export type OfferAcceptanceStatus = "accepted" | "auto_improved" | "new_acceptance_required" | "confirmed" | "completed" | "expired" | "cancelled";

export type Category = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  icon: string;
  country_code: "FI";
  active: boolean;
  regulated: boolean;
  sort_order: number;
  participation_count: number;
};

export type Group = {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  category_name: string;
  category_slug: string;
  category_icon: string;
  description: string;
  group_type?: GroupType;
  want_summary?: string | null;
  detail_note?: string | null;
  brand?: string | null;
  model?: string | null;
  model_code?: string | null;
  terms: string[];
  area: string | null;
  target_count: number | null;
  follower_count: number;
  member_count: number;
  committed_count: number;
  ready_now_count: number;
  offer_count: number;
  new_members_24h?: number;
  new_members_7d?: number;
  status: GroupStatus;
  featured: boolean;
  country_code: "FI";
  currency_code: "EUR";
  locale: "fi-FI";
  timezone: "Europe/Helsinki";
  next_tier_label?: string;
  created_at: string;
};

export type OfferTier = {
  min_acceptances: number;
  price: number;
  label: string;
};

export type Offer = {
  id: string;
  group_id: string;
  company_id?: string;
  offer_version_id?: string;
  version: number;
  company_name: string;
  company_verification_status: CompanyVerificationStatus;
  company_business_id: string;
  company_contact: string;
  company_country: string;
  title: string;
  product_or_service: string;
  brand?: string | null;
  model?: string | null;
  model_code?: string | null;
  product_image_url?: string | null;
  availability?: string | null;
  requirement_match?: string;
  category_match?: string;
  comparison_fields?: Record<string, string | number | boolean | null>;
  description: string;
  price: number;
  mandatory_fees: number;
  normal_price: number | null;
  estimated_saving: number | null;
  delivery_price: number | null;
  delivery_method: string | null;
  total_price: number;
  minimum_participants: number;
  contract_length: string | null;
  vat_status: string;
  delivery_time: string | null;
  terms: string;
  terms_type: SellerTermsType;
  terms_text: string | null;
  terms_url: string | null;
  terms_document_reference: string | null;
  terms_version: string;
  accepted_by_company_at: string | null;
  starts_at: string | null;
  valid_until: string;
  tiers: OfferTier[];
  accepted_count?: number;
  locked_at: string | null;
  published_at: string | null;
  response_status?: "pending" | "accepted" | "rejected";
};

export type OfferAcceptance = {
  id: string;
  offer_id: string;
  offer_version: number;
  company_id: string;
  user_id: string;
  accepted_at: string;
  accepted_price: number;
  current_price: number;
  maximum_accepted_price: number | null;
  terms_version: string;
  allow_improved_offer_auto_apply: boolean;
  status: OfferAcceptanceStatus;
};

export type CompletedTrade = {
  id: string;
  offer_id: string;
  consumer_id: string;
  company_id: string;
  final_price: number;
  completed_at: string;
  seller_confirmation: boolean;
  consumer_confirmation: boolean | null;
  commission_amount: number;
  commission_status: "not_invoiced" | "invoiced" | "paid" | "cancelled";
};

export type AiRiskLevel = "low_risk" | "needs_review" | "high_risk";

export type AiAnalysisResult = {
  actionType: string;
  riskLevel: AiRiskLevel;
  missingFields: string[];
  detectedFees: string[];
  inconsistencies: string[];
  summary: string;
  confidence: number;
  fallbackUsed: boolean;
};

export type ConditionalCommitment = {
  id: string;
  group_id: string;
  offer_id: string | null;
  offer_version: number | null;
  max_total_price: number | null;
  max_monthly_price: number | null;
  max_contract_months: number | null;
  delivery_required: boolean;
  minimum_saving: number | null;
  accepted_terms_snapshot: string;
  accepted_at: string;
  status: MatchStatus;
};

export type LegalDocument = {
  slug: "kayttoehdot" | "yritysehdot" | "tietosuoja" | "tekoaly" | "evasteet";
  title: string;
  version: string;
  effectiveDate: string;
  updatedAt: string;
  sections: { title: string; body: string }[];
};

export type Metrics = {
  uniqueUsers: number;
  activeParticipations: number;
};
