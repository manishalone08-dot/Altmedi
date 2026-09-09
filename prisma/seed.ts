import { PrismaClient, MappingStatus, AlternativeClassification, OfferFreshness, ReviewStatus, UserRole } from '@prisma/client';
import {
  INITIAL_MEDICINES,
  INITIAL_MAPPINGS,
  INITIAL_SAFETY,
  INITIAL_VENDOR_OFFERS,
  INITIAL_PHARMACIST_REVIEWS,
  INITIAL_AUDIT_LOGS
} from '../src/services/catalogData';
import { DEMO_USERS } from '../src/services/authService';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting AltMedi database seeding...');

  // 1. Tenants
  const tenantNashik = await prisma.tenant.upsert({
    where: { id: 'pilot-nashik-01' },
    update: {
      name: 'Nashik Central Healthcare Network',
      region: 'Nashik, Maharashtra',
      tier: 'pilot'
    },
    create: {
      id: 'pilot-nashik-01',
      name: 'Nashik Central Healthcare Network',
      region: 'Nashik, Maharashtra',
      tier: 'pilot',
      verifiedAt: new Date('2026-08-01T00:00:00.000Z')
    }
  });

  const tenantPlatform = await prisma.tenant.upsert({
    where: { id: 'platform-root' },
    update: {
      name: 'AltMedi Platform Operations',
      region: 'Central Operations Hub',
      tier: 'enterprise'
    },
    create: {
      id: 'platform-root',
      name: 'AltMedi Platform Operations',
      region: 'Central Operations Hub',
      tier: 'enterprise',
      verifiedAt: new Date('2026-01-01T00:00:00.000Z')
    }
  });

  console.log(`✅ Upserted tenants: ${tenantNashik.id}, ${tenantPlatform.id}`);

  // 2. Users
  for (const user of Object.values(DEMO_USERS)) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        phone: user.phone ?? null,
        role: user.role as UserRole,
        tenantId: user.tenantId,
        area: user.area ?? null,
        abhaId: user.abhaId ?? null,
        knownAllergies: user.knownAllergies ?? [],
        licenseNumber: user.licenseNumber ?? null,
        organization: user.organization ?? null,
        speciality: user.speciality ?? null,
        isVerified: user.isVerified ?? true
      },
      create: {
        id: user.id,
        tenantId: user.tenantId,
        name: user.name,
        email: user.email,
        phone: user.phone ?? null,
        passwordHash: 'pbkdf2:demo:password123',
        role: user.role as UserRole,
        licenseNumber: user.licenseNumber ?? null,
        organization: user.organization ?? null,
        speciality: user.speciality ?? null,
        abhaId: user.abhaId ?? null,
        knownAllergies: user.knownAllergies ?? [],
        area: user.area ?? null,
        isVerified: user.isVerified ?? true
      }
    });
  }
  console.log(`✅ Upserted ${Object.keys(DEMO_USERS).length} demo users`);

  // 3. Medicine Entities & Ingredients
  for (const med of INITIAL_MEDICINES) {
    await prisma.medicineEntity.upsert({
      where: { id: med.id },
      update: {
        brandName: med.brandName,
        genericName: med.genericName,
        dosageForm: med.dosageForm,
        strength: med.strength,
        manufacturer: med.manufacturer,
        routeOfAdministration: med.routeOfAdministration,
        packSize: med.packSize,
        standardMrpInr: med.standardMrpInr,
        mappingStatus: (med.mappingStatus as MappingStatus) || 'approved',
        isPrescriptionRequired: med.isPrescriptionRequired,
        category: med.category
      },
      create: {
        id: med.id,
        brandName: med.brandName,
        genericName: med.genericName,
        dosageForm: med.dosageForm,
        strength: med.strength,
        manufacturer: med.manufacturer,
        routeOfAdministration: med.routeOfAdministration,
        packSize: med.packSize,
        standardMrpInr: med.standardMrpInr,
        mappingStatus: (med.mappingStatus as MappingStatus) || 'approved',
        isPrescriptionRequired: med.isPrescriptionRequired,
        category: med.category
      }
    });

    // Clean and insert ingredients
    await prisma.medicineIngredient.deleteMany({ where: { medicineId: med.id } });
    if (med.ingredients && med.ingredients.length > 0) {
      await prisma.medicineIngredient.createMany({
        data: med.ingredients.map((ing) => ({
          medicineId: med.id,
          name: ing.name,
          strength: ing.strength,
          unit: ing.unit
        }))
      });
    }
  }
  console.log(`✅ Upserted ${INITIAL_MEDICINES.length} medicines and ingredients`);

  // 4. Safety Content
  for (const [medId, safety] of Object.entries(INITIAL_SAFETY)) {
    await prisma.safetyContent.upsert({
      where: { id: safety.id },
      update: {
        medicineEntityId: medId,
        source: safety.source,
        sourceUrl: safety.sourceUrl ?? null,
        lastReviewed: new Date(safety.lastReviewed),
        reviewer: safety.reviewer,
        commonSideEffects: safety.commonSideEffects,
        seriousWarnings: safety.seriousWarnings,
        allergyWarnings: safety.allergyWarnings,
        escalationAdvice: safety.escalationAdvice,
        pregnancyCategory: safety.pregnancyCategory ?? null,
        drivingWarning: safety.drivingWarning ?? null
      },
      create: {
        id: safety.id,
        medicineEntityId: medId,
        source: safety.source,
        sourceUrl: safety.sourceUrl ?? null,
        lastReviewed: new Date(safety.lastReviewed),
        reviewer: safety.reviewer,
        commonSideEffects: safety.commonSideEffects,
        seriousWarnings: safety.seriousWarnings,
        allergyWarnings: safety.allergyWarnings,
        escalationAdvice: safety.escalationAdvice,
        pregnancyCategory: safety.pregnancyCategory ?? null,
        drivingWarning: safety.drivingWarning ?? null
      }
    });
  }
  console.log(`✅ Upserted ${Object.keys(INITIAL_SAFETY).length} safety content records`);

  // 5. Medicine Mappings
  for (const map of INITIAL_MAPPINGS) {
    await prisma.medicineMapping.upsert({
      where: { id: map.id },
      update: {
        sourceMedicineId: map.sourceMedicineId,
        targetMedicineId: map.targetMedicineId,
        classification: map.classification as AlternativeClassification,
        confidenceScore: map.confidenceScore,
        clinicalRationale: map.clinicalRationale,
        status: map.status as MappingStatus,
        reviewedBy: map.reviewedBy ?? null,
        reviewedAt: map.reviewedAt ? new Date(map.reviewedAt) : null
      },
      create: {
        id: map.id,
        sourceMedicineId: map.sourceMedicineId,
        targetMedicineId: map.targetMedicineId,
        classification: map.classification as AlternativeClassification,
        confidenceScore: map.confidenceScore,
        clinicalRationale: map.clinicalRationale,
        status: map.status as MappingStatus,
        reviewedBy: map.reviewedBy ?? null,
        reviewedAt: map.reviewedAt ? new Date(map.reviewedAt) : null
      }
    });
  }
  console.log(`✅ Upserted ${INITIAL_MAPPINGS.length} mappings`);

  // 6. Vendor Offers
  for (const offer of INITIAL_VENDOR_OFFERS) {
    await prisma.vendorOffer.upsert({
      where: { id: offer.id },
      update: {
        tenantId: 'pilot-nashik-01',
        vendorId: 'usr-vend-01',
        vendorName: offer.vendorName,
        vendorArea: offer.vendorArea,
        medicineEntityId: offer.medicineEntityId,
        priceInr: offer.priceInr,
        mrpInr: offer.mrpInr,
        packSize: offer.packSize,
        unitPriceInr: offer.unitPriceInr,
        inStock: offer.inStock,
        stockCount: offer.stockCount ?? 0,
        freshness: (offer.freshness as OfferFreshness) || 'fresh',
        isStale: offer.isStale ?? false
      },
      create: {
        id: offer.id,
        tenantId: 'pilot-nashik-01',
        vendorId: 'usr-vend-01',
        vendorName: offer.vendorName,
        vendorArea: offer.vendorArea,
        medicineEntityId: offer.medicineEntityId,
        priceInr: offer.priceInr,
        mrpInr: offer.mrpInr,
        packSize: offer.packSize,
        unitPriceInr: offer.unitPriceInr,
        inStock: offer.inStock,
        stockCount: offer.stockCount ?? 0,
        freshness: (offer.freshness as OfferFreshness) || 'fresh',
        isStale: offer.isStale ?? false
      }
    });
  }
  console.log(`✅ Upserted ${INITIAL_VENDOR_OFFERS.length} vendor offers`);

  // 7. Pharmacist Reviews
  for (const rev of INITIAL_PHARMACIST_REVIEWS) {
    let statusEnum: ReviewStatus = 'requested';
    if (rev.status === 'in_review') statusEnum = 'in_review';
    else if (rev.status === 'confirmed') statusEnum = 'confirmed';
    else if (rev.status === 'rejected') statusEnum = 'rejected';

    await prisma.pharmacistReview.upsert({
      where: { id: rev.id },
      update: {
        tenantId: 'pilot-nashik-01',
        sessionId: rev.sessionId,
        patientName: rev.patientName,
        patientPhoneMasked: rev.patientPhoneMasked,
        originalMedicineId: rev.originalMedicine.id,
        proposedAlternativeId: rev.proposedAlternative.id,
        classification: rev.classification as AlternativeClassification,
        status: statusEnum,
        decisionReason: rev.decisionReason ?? null,
        assignedPharmacistId: 'usr-pharm-01',
        decidedAt: rev.decidedAt ? new Date(rev.decidedAt) : null,
        urgency: rev.urgency,
        pharmacyName: rev.pharmacyName
      },
      create: {
        id: rev.id,
        tenantId: 'pilot-nashik-01',
        sessionId: rev.sessionId,
        patientName: rev.patientName,
        patientPhoneMasked: rev.patientPhoneMasked,
        originalMedicineId: rev.originalMedicine.id,
        proposedAlternativeId: rev.proposedAlternative.id,
        classification: rev.classification as AlternativeClassification,
        status: statusEnum,
        decisionReason: rev.decisionReason ?? null,
        assignedPharmacistId: 'usr-pharm-01',
        decidedAt: rev.decidedAt ? new Date(rev.decidedAt) : null,
        urgency: rev.urgency,
        pharmacyName: rev.pharmacyName
      }
    });
  }
  console.log(`✅ Upserted ${INITIAL_PHARMACIST_REVIEWS.length} pharmacist reviews`);

  // 8. Audit Events
  for (const aud of INITIAL_AUDIT_LOGS) {
    await prisma.auditEvent.upsert({
      where: { id: aud.id },
      update: {
        tenantId: aud.tenantId,
        actor: aud.actor,
        actorRole: aud.actorRole as UserRole,
        action: aud.action,
        entityType: aud.entityType,
        entityId: aud.entityId,
        oldValue: aud.oldValue ?? null,
        newValue: aud.newValue ?? null,
        reason: aud.reason ?? null
      },
      create: {
        id: aud.id,
        timestamp: new Date(aud.timestamp),
        tenantId: aud.tenantId,
        actor: aud.actor,
        actorRole: aud.actorRole as UserRole,
        action: aud.action,
        entityType: aud.entityType,
        entityId: aud.entityId,
        oldValue: aud.oldValue ?? null,
        newValue: aud.newValue ?? null,
        reason: aud.reason ?? null
      }
    });
  }
  console.log(`✅ Upserted ${INITIAL_AUDIT_LOGS.length} audit logs`);

  console.log('🎉 AltMedi database seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
