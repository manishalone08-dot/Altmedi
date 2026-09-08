import {
  MedicineEntity,
  MedicineMapping,
  SafetyContent,
  VendorOffer,
  PharmacistReview,
  AuditEvent,
  ExtractedPrescriptionItem,
  TenantContext,
  UserRole
} from '../types';
import {
  INITIAL_MEDICINES,
  INITIAL_MAPPINGS,
  INITIAL_SAFETY,
  INITIAL_VENDOR_OFFERS,
  INITIAL_PHARMACIST_REVIEWS,
  INITIAL_AUDIT_LOGS
} from './catalogData';

// Simulates the backend API boundary
class AltMediService {
  private medicines: MedicineEntity[] = [...INITIAL_MEDICINES];
  private mappings: MedicineMapping[] = [...INITIAL_MAPPINGS];
  private safetyData: Record<string, SafetyContent> = { ...INITIAL_SAFETY };
  private vendorOffers: VendorOffer[] = [...INITIAL_VENDOR_OFFERS];
  private reviews: PharmacistReview[] = [...INITIAL_PHARMACIST_REVIEWS];
  private auditLogs: AuditEvent[] = [...INITIAL_AUDIT_LOGS];

  public tenantContext: TenantContext = {
    tenantId: 'pilot-nashik-01',
    organizationName: 'Nashik Health & Pharmacy Network',
    region: 'Nashik, Maharashtra',
    tier: 'pilot',
    verifiedAt: '2026-08-01'
  };

  // Medicine search & matching
  public async searchMedicines(query: string): Promise<MedicineEntity[]> {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return this.medicines.filter(
      (m) =>
        m.brandName.toLowerCase().includes(q) ||
        m.genericName.toLowerCase().includes(q) ||
        m.ingredients.some((ing) => ing.name.toLowerCase().includes(q))
    );
  }

  public async getMedicineById(id: string): Promise<MedicineEntity | undefined> {
    return this.medicines.find((m) => m.id === id);
  }

  public async getSafetyContent(medicineId: string): Promise<SafetyContent | undefined> {
    return this.safetyData[medicineId];
  }

  public async getAlternatives(medicineId: string): Promise<{
    sameActiveIngredients: { medicine: MedicineEntity; mapping: MedicineMapping; bestOffer?: VendorOffer }[];
    therapeuticAlternatives: { medicine: MedicineEntity; mapping: MedicineMapping; bestOffer?: VendorOffer }[];
  }> {
    const activeMappings = this.mappings.filter(
      (map) =>
        (map.sourceMedicineId === medicineId || map.targetMedicineId === medicineId) &&
        map.status === 'approved'
    );

    const sameActive: { medicine: MedicineEntity; mapping: MedicineMapping; bestOffer?: VendorOffer }[] = [];
    const therapeutic: { medicine: MedicineEntity; mapping: MedicineMapping; bestOffer?: VendorOffer }[] = [];

    for (const map of activeMappings) {
      const targetId = map.sourceMedicineId === medicineId ? map.targetMedicineId : map.sourceMedicineId;
      const targetMed = this.medicines.find((m) => m.id === targetId);
      if (!targetMed) continue;

      const offers = this.vendorOffers
        .filter((o) => o.medicineEntityId === targetId && o.inStock)
        .sort((a, b) => a.priceInr - b.priceInr);
      const bestOffer = offers[0];

      if (map.classification === 'same_active_ingredient') {
        sameActive.push({ medicine: targetMed, mapping: map, bestOffer });
      } else if (map.classification === 'therapeutic_alternative') {
        therapeutic.push({ medicine: targetMed, mapping: map, bestOffer });
      }
    }

    return { sameActiveIngredients: sameActive, therapeuticAlternatives: therapeutic };
  }

  public async getVendorOffers(medicineId: string): Promise<VendorOffer[]> {
    return this.vendorOffers.filter((o) => o.medicineEntityId === medicineId);
  }

  // Simulated OCR & Identity Resolution for Prescriptions
  public async parsePrescriptionImage(
    imageDataUrl: string
  ): Promise<ExtractedPrescriptionItem[]> {
    // Simulates an edge OCR pipeline with confidence scores and ambiguity handling
    await new Promise((resolve) => setTimeout(resolve, 800));

    return [
      {
        id: 'item-1',
        rawText: 'Tab. Augmentin 625mg 1 tab BD x 5 days',
        normalizedEntity: this.medicines[0], // Augmentin 625 Duo
        confidence: 0.96,
        isAmbiguous: false,
        dosageInstructions: '1 tablet twice daily after food for 5 days',
        confirmed: true
      },
      {
        id: 'item-2',
        rawText: 'Cap. Pan D 1 cap OD before breakfast',
        normalizedEntity: this.medicines[4], // Pan-D
        confidence: 0.94,
        isAmbiguous: false,
        dosageInstructions: '1 capsule once daily before breakfast',
        confirmed: true
      },
      {
        id: 'item-3',
        rawText: 'Tab. Paracetamol 650mg SOS for fever',
        confidence: 0.78,
        isAmbiguous: true,
        ambiguousCandidates: [this.medicines[6], this.medicines[7]], // Calpol 650 vs Dolo 650
        dosageInstructions: 'As needed for body ache/fever',
        confirmed: false
      }
    ];
  }

  // Pharmacist review management
  public async getReviewQueue(): Promise<PharmacistReview[]> {
    return [...this.reviews];
  }

  public async submitPharmacistDecision(
    reviewId: string,
    decision: 'confirmed' | 'rejected',
    reason: string,
    pharmacistName: string
  ): Promise<PharmacistReview> {
    const review = this.reviews.find((r) => r.id === reviewId);
    if (!review) throw new Error('Review item not found');

    review.status = decision;
    review.decisionReason = reason;
    review.assignedPharmacist = pharmacistName;
    review.decidedAt = new Date().toISOString().replace('T', ' ').slice(0, 16);

    this.logAudit({
      actor: pharmacistName,
      actorRole: 'pharmacist',
      action: decision === 'confirmed' ? 'SUBSTITUTION_CONFIRMED' : 'SUBSTITUTION_REJECTED',
      entityType: 'PharmacistReview',
      entityId: reviewId,
      newValue: decision,
      reason
    });

    return review;
  }

  public async requestPharmacistReview(
    originalMedId: string,
    alternativeMedId: string,
    patientName: string,
    patientPhone: string,
    urgency: 'routine' | 'urgent' = 'routine'
  ): Promise<PharmacistReview> {
    const original = this.medicines.find((m) => m.id === originalMedId);
    const alternative = this.medicines.find((m) => m.id === alternativeMedId);
    if (!original || !alternative) throw new Error('Medicine entity not found');

    const mapping = this.mappings.find(
      (m) =>
        (m.sourceMedicineId === originalMedId && m.targetMedicineId === alternativeMedId) ||
        (m.sourceMedicineId === alternativeMedId && m.targetMedicineId === originalMedId)
    );

    const newReview: PharmacistReview = {
      id: `rev-${Math.floor(100 + Math.random() * 900)}`,
      sessionId: `sess-${Math.floor(1000 + Math.random() * 9000)}`,
      patientName: patientName || 'Walk-in Patient',
      patientPhoneMasked: patientPhone ? patientPhone.replace(/(\d{2})\d{4}(\d{4})/, '$1****$2') : '+91 98****0000',
      originalMedicine: original,
      proposedAlternative: alternative,
      classification: mapping ? mapping.classification : 'therapeutic_alternative',
      requestedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'in_review',
      urgency,
      pharmacyName: 'Lifeline Pharmacy Hub (Nashik)'
    };

    this.reviews.unshift(newReview);
    return newReview;
  }

  // Vendor updates
  public async updateVendorOffer(
    offerId: string,
    newPrice: number,
    newStockCount: number,
    actor: string
  ): Promise<VendorOffer> {
    const offer = this.vendorOffers.find((o) => o.id === offerId);
    if (!offer) throw new Error('Offer not found');

    const oldVal = `Price: ₹${offer.priceInr}, Stock: ${offer.stockCount}`;
    offer.priceInr = newPrice;
    offer.stockCount = newStockCount;
    offer.updatedAt = 'Just now';
    offer.freshness = 'fresh';
    offer.isStale = false;

    this.logAudit({
      actor,
      actorRole: 'vendor',
      action: 'OFFER_UPDATED',
      entityType: 'VendorOffer',
      entityId: offerId,
      oldValue: oldVal,
      newValue: `Price: ₹${newPrice}, Stock: ${newStockCount}`,
      reason: 'Vendor inventory update'
    });

    return offer;
  }

  // Admin mapping governance
  public async getMappings(): Promise<MedicineMapping[]> {
    return [...this.mappings];
  }

  public async updateMappingStatus(
    mappingId: string,
    newStatus: 'approved' | 'quarantined' | 'deprecated',
    reason: string,
    actor: string
  ): Promise<void> {
    const map = this.mappings.find((m) => m.id === mappingId);
    if (!map) return;
    const oldStatus = map.status;
    map.status = newStatus;

    this.logAudit({
      actor,
      actorRole: 'platform_admin',
      action: `MAPPING_${newStatus.toUpperCase()}`,
      entityType: 'MedicineMapping',
      entityId: mappingId,
      oldValue: oldStatus,
      newValue: newStatus,
      reason
    });
  }

  // Audit logs
  public async getAuditLogs(): Promise<AuditEvent[]> {
    return [...this.auditLogs];
  }

  private logAudit(
    event: Omit<AuditEvent, 'id' | 'timestamp' | 'tenantId'> & { tenantId?: string }
  ) {
    const newEntry: AuditEvent = {
      id: `aud-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      tenantId: event.tenantId || this.tenantContext.tenantId,
      ...event
    };
    this.auditLogs.unshift(newEntry);
  }
}

export const altMediApi = new AltMediService();
