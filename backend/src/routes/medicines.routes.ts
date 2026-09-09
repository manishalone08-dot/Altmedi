import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const medicinesRouter = Router();

// Helper to format medicine response matching frontend types
const formatMedicine = (m: any) => ({
  id: m.id,
  brandName: m.brandName,
  genericName: m.genericName,
  dosageForm: m.dosageForm,
  strength: m.strength,
  manufacturer: m.manufacturer,
  routeOfAdministration: m.routeOfAdministration,
  packSize: m.packSize,
  standardMrpInr: Number(m.standardMrpInr),
  mappingStatus: m.mappingStatus,
  isPrescriptionRequired: m.isPrescriptionRequired,
  category: m.category,
  ingredients: (m.ingredients || []).map((ing: any) => ({
    id: ing.id,
    name: ing.name,
    strength: ing.strength,
    unit: ing.unit
  }))
});

// GET /api/v1/medicines/search?q={query}
medicinesRouter.get('/search', async (req: Request, res: Response): Promise<void> => {
  try {
    const q = (req.query.q as string | undefined)?.trim();
    if (!q) {
      res.status(200).json([]);
      return;
    }

    const medicines = await prisma.medicineEntity.findMany({
      where: {
        OR: [
          { brandName: { contains: q, mode: 'insensitive' } },
          { genericName: { contains: q, mode: 'insensitive' } },
          { ingredients: { some: { name: { contains: q, mode: 'insensitive' } } } }
        ]
      },
      include: {
        ingredients: true
      }
    });

    res.status(200).json(medicines.map(formatMedicine));
  } catch (error) {
    console.error('Error in searchMedicines:', error);
    res.status(500).json({ error: 'Failed to search medicines' });
  }
});

// GET /api/v1/medicines/:id
medicinesRouter.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const medicine = await prisma.medicineEntity.findUnique({
      where: { id: req.params.id },
      include: {
        ingredients: true,
        safetyContent: true
      }
    });

    if (!medicine) {
      res.status(404).json({ error: 'Medicine not found' });
      return;
    }

    res.status(200).json(formatMedicine(medicine));
  } catch (error) {
    console.error('Error fetching medicine:', error);
    res.status(500).json({ error: 'Failed to fetch medicine' });
  }
});

// GET /api/v1/medicines/:id/safety
medicinesRouter.get('/:id/safety', async (req: Request, res: Response): Promise<void> => {
  try {
    const safety = await prisma.safetyContent.findUnique({
      where: { medicineEntityId: req.params.id }
    });

    if (!safety) {
      res.status(404).json({ error: 'Safety content not found for this medicine' });
      return;
    }

    res.status(200).json({
      id: safety.id,
      medicineEntityId: safety.medicineEntityId,
      source: safety.source,
      sourceUrl: safety.sourceUrl,
      lastReviewed: safety.lastReviewed.toISOString().split('T')[0],
      reviewer: safety.reviewer,
      commonSideEffects: safety.commonSideEffects,
      seriousWarnings: safety.seriousWarnings,
      allergyWarnings: safety.allergyWarnings,
      escalationAdvice: safety.escalationAdvice,
      pregnancyCategory: safety.pregnancyCategory,
      drivingWarning: safety.drivingWarning
    });
  } catch (error) {
    console.error('Error fetching safety content:', error);
    res.status(500).json({ error: 'Failed to fetch safety content' });
  }
});

// GET /api/v1/medicines/:id/alternatives
medicinesRouter.get('/:id/alternatives', async (req: Request, res: Response): Promise<void> => {
  try {
    const medicineId = req.params.id;

    // Fetch approved mappings where medicineId is either source or target
    const mappings = await prisma.medicineMapping.findMany({
      where: {
        AND: [
          { status: 'approved' },
          {
            OR: [
              { sourceMedicineId: medicineId },
              { targetMedicineId: medicineId }
            ]
          }
        ]
      },
      include: {
        sourceMedicine: { include: { ingredients: true } },
        targetMedicine: { include: { ingredients: true } }
      }
    });

    // Fetch in-stock vendor offers for all involved medicines
    const relatedIds = mappings.map((m) =>
      m.sourceMedicineId === medicineId ? m.targetMedicineId : m.sourceMedicineId
    );

    const offers = await prisma.vendorOffer.findMany({
      where: {
        medicineEntityId: { in: relatedIds },
        inStock: true
      },
      orderBy: { priceInr: 'asc' }
    });

    const sameActive: Array<{
      medicine: any;
      mapping: any;
      bestOffer?: any;
    }> = [];

    const therapeutic: Array<{
      medicine: any;
      mapping: any;
      bestOffer?: any;
    }> = [];

    for (const map of mappings) {
      const isSource = map.sourceMedicineId === medicineId;
      const targetMed = isSource ? map.targetMedicine : map.sourceMedicine;
      const targetId = isSource ? map.targetMedicineId : map.sourceMedicineId;

      const bestOffer = offers.find((o) => o.medicineEntityId === targetId);

      const mappingData = {
        id: map.id,
        sourceMedicineId: map.sourceMedicineId,
        targetMedicineId: map.targetMedicineId,
        classification: map.classification,
        confidenceScore: Number(map.confidenceScore),
        clinicalRationale: map.clinicalRationale,
        status: map.status,
        reviewedBy: map.reviewedBy,
        reviewedAt: map.reviewedAt?.toISOString().split('T')[0]
      };

      const offerData = bestOffer
        ? {
            id: bestOffer.id,
            vendorId: bestOffer.vendorId,
            vendorName: bestOffer.vendorName,
            vendorArea: bestOffer.vendorArea,
            medicineEntityId: bestOffer.medicineEntityId,
            priceInr: Number(bestOffer.priceInr),
            mrpInr: Number(bestOffer.mrpInr),
            packSize: bestOffer.packSize,
            unitPriceInr: Number(bestOffer.unitPriceInr),
            inStock: bestOffer.inStock,
            stockCount: bestOffer.stockCount,
            updatedAt: 'Just now',
            freshness: bestOffer.freshness,
            isStale: bestOffer.isStale
          }
        : undefined;

      const item = {
        medicine: formatMedicine(targetMed),
        mapping: mappingData,
        bestOffer: offerData
      };

      if (map.classification === 'same_active_ingredient') {
        sameActive.push(item);
      } else if (map.classification === 'therapeutic_alternative') {
        therapeutic.push(item);
      }
    }

    res.status(200).json({
      sameActiveIngredients: sameActive,
      therapeuticAlternatives: therapeutic
    });
  } catch (error) {
    console.error('Error fetching alternatives:', error);
    res.status(500).json({ error: 'Failed to fetch alternatives' });
  }
});
