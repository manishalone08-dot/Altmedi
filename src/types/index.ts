export type UserRole =
  | 'patient'
  | 'doctor'
  | 'pharmacist'
  | 'vendor'
  | 'organization'
  | 'tenant_admin'
  | 'platform_admin';

export type AlternativeClassification =
  | 'same_active_ingredient'
  | 'therapeutic_alternative'
  | 'not_comparable';

export type MappingStatus = 'draft' | 'approved' | 'quarantined' | 'deprecated';

export type ReviewStatus = 'requested' | 'in_review' | 'confirmed' | 'rejected' | 'closed';

export type OfferFreshness = 'fresh' | 'stale' | 'expired';

export interface Ingredient {
  id: string;
  name: string;
  strength: string;
  unit: string;
}

export interface SafetyContent {
  id: string;
  medicineEntityId: string;
  source: string;
  sourceUrl?: string;
  lastReviewed: string;
  reviewer: string;
  commonSideEffects: string[];
  seriousWarnings: string[];
  allergyWarnings: string[];
  escalationAdvice: string;
  pregnancyCategory?: string;
  drivingWarning?: string;
}

export interface VendorOffer {
  id: string;
  vendorId: string;
  vendorName: string;
  vendorArea: string; // e.g., 'Nashik Road', 'College Road', 'Panchavati'
  medicineEntityId: string;
  priceInr: number;
  mrpInr: number;
  packSize: string; // e.g. '10 tablets', '15 capsules'
  unitPriceInr: number;
  inStock: boolean;
  stockCount?: number;
  updatedAt: string;
  freshness: OfferFreshness;
  isStale: boolean;
}

export interface MedicineEntity {
  id: string;
  brandName: string;
  genericName: string;
  dosageForm: string; // Tablet, Capsule, Syrup, Injection
  strength: string;
  manufacturer: string;
  routeOfAdministration: string; // Oral, Topical, IV
  packSize: string;
  standardMrpInr: number;
  ingredients: Ingredient[];
  mappingStatus: MappingStatus;
  isPrescriptionRequired: boolean;
  category: string;
}

export interface MedicineMapping {
  id: string;
  sourceMedicineId: string;
  targetMedicineId: string;
  classification: AlternativeClassification;
  confidenceScore: number;
  clinicalRationale: string;
  status: MappingStatus;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface PharmacistReview {
  id: string;
  sessionId: string;
  patientName: string;
  patientPhoneMasked: string;
  originalMedicine: MedicineEntity;
  proposedAlternative: MedicineEntity;
  classification: AlternativeClassification;
  requestedAt: string;
  status: ReviewStatus;
  decisionReason?: string;
  assignedPharmacist?: string;
  decidedAt?: string;
  urgency: 'routine' | 'urgent';
  pharmacyName: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: UserRole;
  tenantId: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue?: string;
  newValue?: string;
  reason?: string;
  sourceIp?: string;
}

export interface TenantContext {
  tenantId: string;
  organizationName: string;
  region: string;
  tier: 'pilot' | 'standard' | 'enterprise';
  verifiedAt: string;
}

export interface ExtractedPrescriptionItem {
  id: string;
  rawText: string;
  normalizedEntity?: MedicineEntity;
  confidence: number;
  isAmbiguous: boolean;
  ambiguousCandidates?: MedicineEntity[];
  dosageInstructions?: string;
  confirmed: boolean;
}
