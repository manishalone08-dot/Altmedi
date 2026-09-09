export type UserRole =
  | 'patient'
  | 'doctor'
  | 'pharmacist'
  | 'vendor'
  | 'organization'
  | 'tenant_admin'
  | 'platform_admin';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  tenantId: string;
  tenantName: string;
  // Role-specific professional / medical profile details:
  licenseNumber?: string; // For Pharmacist / Doctor
  organization?: string; // Clinic, Pharmacy or Hospital name
  speciality?: string; // For Doctor
  abhaId?: string; // For Patient
  knownAllergies?: string[]; // For Patient
  area?: string; // Locality e.g. College Road, Nashik
  isVerified: boolean;
  createdAt: string;
}

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
  district?: string;
  state?: string;
  tier: 'pilot' | 'standard' | 'enterprise';
  verifiedAt: string;
  languageSupport?: string[];
  abdmFacilityId?: string;
}

export interface TenantEntity {
  id: string;
  name: string;
  region: string;
  district: string;
  state: string;
  tier: 'pilot' | 'standard' | 'enterprise';
  languageSupport: string[];
  abdmFacilityId?: string;
  hfrId?: string;
  verifiedAt: string;
  activeUsersCount?: number;
  activePharmaciesCount?: number;
}

export interface TenantInvitation {
  id: string;
  tenantId: string;
  email: string;
  role: UserRole;
  inviteCode: string;
  expiresAt: string;
  isAccepted: boolean;
  createdAt: string;
}

export interface JanAushadhiItem {
  id: string;
  genericName: string;
  dosageForm: string;
  strength: string;
  packSize: string;
  pmbjpPriceInr: number;
  equivalentBrandMrpInr: number;
  savingsPercentage: number;
  pmbjpCode: string;
  isBplSubsidyEligible: boolean;
  availableNearNashik: boolean;
  nearestStoreArea?: string;
}

export interface POSIntegration {
  id: string;
  tenantId: string;
  vendorId: string;
  vendorName?: string;
  posType: 'cims' | 'marg' | 'redbook' | 'csv';
  apiEndpoint?: string;
  apiKeyMask?: string;
  lastSyncAt?: string;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  itemsSynced: number;
  createdAt: string;
}

export interface ABDMFacilityRecord {
  hfrId: string;
  facilityName: string;
  facilityType: string;
  state: string;
  district: string;
  systemOfMedicine: string;
  status: 'active' | 'pending' | 'verified';
}

export interface ABDMDoctorRecord {
  hprId: string;
  practitionerName: string;
  registrationNumber: string;
  stateCouncil: string;
  speciality: string;
  nmrVerified: boolean;
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
