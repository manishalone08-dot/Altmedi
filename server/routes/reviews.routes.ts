import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { validateBody } from '../middleware/validate';
import { optionalAuth, AuthenticatedRequest } from '../middleware/auth';
import { AlternativeClassification, ReviewStatus } from '@prisma/client';

export const reviewsRouter = Router();

const requestReviewSchema = z.object({
  originalMedId: z.string().min(1, 'Original medicine ID is required'),
  alternativeMedId: z.string().min(1, 'Alternative medicine ID is required'),
  patientName: z.string().optional(),
  patientPhone: z.string().optional(),
  urgency: z.enum(['routine', 'urgent']).optional()
});

const submitDecisionSchema = z.object({
  decision: z.enum(['confirmed', 'rejected']),
  reason: z.string().min(3, 'Clinical reason is required'),
  pharmacistName: z.string().optional()
});

const formatReview = (r: any) => ({
  id: r.id,
  sessionId: r.sessionId,
  patientName: r.patientName,
  patientPhoneMasked: r.patientPhoneMasked,
  originalMedicine: {
    id: r.originalMedicine.id,
    brandName: r.originalMedicine.brandName,
    genericName: r.originalMedicine.genericName,
    dosageForm: r.originalMedicine.dosageForm,
    strength: r.originalMedicine.strength,
    manufacturer: r.originalMedicine.manufacturer,
    routeOfAdministration: r.originalMedicine.routeOfAdministration,
    packSize: r.originalMedicine.packSize,
    standardMrpInr: Number(r.originalMedicine.standardMrpInr),
    mappingStatus: r.originalMedicine.mappingStatus,
    isPrescriptionRequired: r.originalMedicine.isPrescriptionRequired,
    category: r.originalMedicine.category,
    ingredients: (r.originalMedicine.ingredients || []).map((ing: any) => ({
      id: ing.id,
      name: ing.name,
      strength: ing.strength,
      unit: ing.unit
    }))
  },
  proposedAlternative: {
    id: r.proposedAlternative.id,
    brandName: r.proposedAlternative.brandName,
    genericName: r.proposedAlternative.genericName,
    dosageForm: r.proposedAlternative.dosageForm,
    strength: r.proposedAlternative.strength,
    manufacturer: r.proposedAlternative.manufacturer,
    routeOfAdministration: r.proposedAlternative.routeOfAdministration,
    packSize: r.proposedAlternative.packSize,
    standardMrpInr: Number(r.proposedAlternative.standardMrpInr),
    mappingStatus: r.proposedAlternative.mappingStatus,
    isPrescriptionRequired: r.proposedAlternative.isPrescriptionRequired,
    category: r.proposedAlternative.category,
    ingredients: (r.proposedAlternative.ingredients || []).map((ing: any) => ({
      id: ing.id,
      name: ing.name,
      strength: ing.strength,
      unit: ing.unit
    }))
  },
  classification: r.classification,
  requestedAt: r.requestedAt.toISOString().replace('T', ' ').slice(0, 16),
  status: r.status,
  decisionReason: r.decisionReason,
  assignedPharmacist: r.assignedPharmacist?.name || (r.decidedAt ? 'Verified Pharmacist' : undefined),
  decidedAt: r.decidedAt ? r.decidedAt.toISOString().replace('T', ' ').slice(0, 16) : undefined,
  urgency: r.urgency,
  pharmacyName: r.pharmacyName
});

// GET /api/v1/reviews/queue
reviewsRouter.get('/queue', async (_req: Request, res: Response): Promise<void> => {
  try {
    const reviews = await prisma.pharmacistReview.findMany({
      include: {
        originalMedicine: { include: { ingredients: true } },
        proposedAlternative: { include: { ingredients: true } },
        assignedPharmacist: true
      },
      orderBy: { requestedAt: 'desc' }
    });

    res.status(200).json(reviews.map(formatReview));
  } catch (error) {
    console.error('Error fetching review queue:', error);
    res.status(500).json({ error: 'Failed to fetch review queue' });
  }
});

// POST /api/v1/reviews/request
reviewsRouter.post(
  '/request',
  optionalAuth,
  validateBody(requestReviewSchema),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { originalMedId, alternativeMedId, patientName, patientPhone, urgency = 'routine' } = req.body;

      const [original, alternative] = await Promise.all([
        prisma.medicineEntity.findUnique({
          where: { id: originalMedId },
          include: { ingredients: true }
        }),
        prisma.medicineEntity.findUnique({
          where: { id: alternativeMedId },
          include: { ingredients: true }
        })
      ]);

      if (!original || !alternative) {
        res.status(404).json({ error: 'One or both medicine entities not found' });
        return;
      }

      // Check existing mapping
      const mapping = await prisma.medicineMapping.findFirst({
        where: {
          OR: [
            { sourceMedicineId: originalMedId, targetMedicineId: alternativeMedId },
            { sourceMedicineId: alternativeMedId, targetMedicineId: originalMedId }
          ]
        }
      });

      const classification: AlternativeClassification =
        mapping?.classification || 'therapeutic_alternative';

      const maskedPhone = patientPhone
        ? patientPhone.replace(/(\d{2})\d{4}(\d{4})/, '$1****$2')
        : '+91 98****0000';

      const newReview = await prisma.pharmacistReview.create({
        data: {
          id: `rev-${Math.floor(100 + Math.random() * 900)}`,
          tenantId: 'pilot-nashik-01',
          sessionId: `sess-${Math.floor(1000 + Math.random() * 9000)}`,
          patientName: patientName || req.user?.name || 'Walk-in Patient',
          patientPhoneMasked: maskedPhone,
          originalMedicineId: originalMedId,
          proposedAlternativeId: alternativeMedId,
          classification,
          status: 'in_review',
          urgency,
          pharmacyName: 'Lifeline Pharmacy Hub (Nashik)'
        },
        include: {
          originalMedicine: { include: { ingredients: true } },
          proposedAlternative: { include: { ingredients: true } },
          assignedPharmacist: true
        }
      });

      res.status(201).json(formatReview(newReview));
    } catch (error) {
      console.error('Error creating review request:', error);
      res.status(500).json({ error: 'Failed to request pharmacist review' });
    }
  }
);

// POST /api/v1/reviews/:id/decision
reviewsRouter.post(
  '/:id/decision',
  optionalAuth,
  validateBody(submitDecisionSchema),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const reviewId = req.params.id;
      const { decision, reason, pharmacistName } = req.body;

      const existing = await prisma.pharmacistReview.findUnique({
        where: { id: reviewId }
      });

      if (!existing) {
        res.status(404).json({ error: 'Review item not found' });
        return;
      }

      const deciderName = pharmacistName || req.user?.name || 'Pharm. Sunita Patil, M.Pharm';
      const deciderId = req.user?.id || 'usr-pharm-01';
      const statusValue: ReviewStatus = decision === 'confirmed' ? 'confirmed' : 'rejected';

      const updated = await prisma.pharmacistReview.update({
        where: { id: reviewId },
        data: {
          status: statusValue,
          decisionReason: reason,
          assignedPharmacistId: deciderId,
          decidedAt: new Date()
        },
        include: {
          originalMedicine: { include: { ingredients: true } },
          proposedAlternative: { include: { ingredients: true } },
          assignedPharmacist: true
        }
      });

      // Immutable clinical audit logging
      await prisma.auditEvent.create({
        data: {
          tenantId: existing.tenantId,
          actor: deciderName,
          actorRole: 'pharmacist',
          actorId: deciderId,
          action: decision === 'confirmed' ? 'SUBSTITUTION_CONFIRMED' : 'SUBSTITUTION_REJECTED',
          entityType: 'PharmacistReview',
          entityId: reviewId,
          newValue: decision,
          reason
        }
      });

      res.status(200).json(formatReview(updated));
    } catch (error) {
      console.error('Error submitting pharmacist decision:', error);
      res.status(500).json({ error: 'Failed to submit pharmacist decision' });
    }
  }
);
