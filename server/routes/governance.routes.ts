import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { validateBody } from '../middleware/validate';
import { optionalAuth, AuthenticatedRequest } from '../middleware/auth';
import { MappingStatus } from '@prisma/client';

export const governanceRouter = Router();

const updateMappingSchema = z.object({
  newStatus: z.enum(['approved', 'quarantined', 'deprecated']),
  reason: z.string().min(3, 'Audit reason is required'),
  actor: z.string().optional()
});

// GET /api/v1/governance/mappings
governanceRouter.get('/mappings', async (_req: Request, res: Response): Promise<void> => {
  try {
    const mappings = await prisma.medicineMapping.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(
      mappings.map((m) => ({
        id: m.id,
        sourceMedicineId: m.sourceMedicineId,
        targetMedicineId: m.targetMedicineId,
        classification: m.classification,
        confidenceScore: Number(m.confidenceScore),
        clinicalRationale: m.clinicalRationale,
        status: m.status,
        reviewedBy: m.reviewedBy,
        reviewedAt: m.reviewedAt ? m.reviewedAt.toISOString().split('T')[0] : undefined
      }))
    );
  } catch (error) {
    console.error('Error fetching mappings:', error);
    res.status(500).json({ error: 'Failed to fetch mappings' });
  }
});

// PATCH /api/v1/governance/mappings/:id
governanceRouter.patch(
  '/mappings/:id',
  optionalAuth,
  validateBody(updateMappingSchema),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const mappingId = req.params.id;
      const { newStatus, reason, actor } = req.body;

      const existing = await prisma.medicineMapping.findUnique({
        where: { id: mappingId }
      });

      if (!existing) {
        res.status(404).json({ error: 'Mapping not found' });
        return;
      }

      const oldStatus = existing.status;
      const actorName = actor || req.user?.name || 'Pooja Sharma';
      const actorRole = req.user?.role || 'platform_admin';

      const updated = await prisma.medicineMapping.update({
        where: { id: mappingId },
        data: {
          status: newStatus as MappingStatus,
          reviewedBy: actorName,
          reviewedAt: new Date()
        }
      });

      // Immutable audit log
      await prisma.auditEvent.create({
        data: {
          tenantId: 'pilot-nashik-01',
          actor: actorName,
          actorRole,
          actorId: req.user?.id || null,
          action: `MAPPING_${newStatus.toUpperCase()}`,
          entityType: 'MedicineMapping',
          entityId: mappingId,
          oldValue: oldStatus,
          newValue: newStatus,
          reason
        }
      });

      res.status(200).json({
        id: updated.id,
        sourceMedicineId: updated.sourceMedicineId,
        targetMedicineId: updated.targetMedicineId,
        classification: updated.classification,
        confidenceScore: Number(updated.confidenceScore),
        clinicalRationale: updated.clinicalRationale,
        status: updated.status,
        reviewedBy: updated.reviewedBy,
        reviewedAt: updated.reviewedAt ? updated.reviewedAt.toISOString().split('T')[0] : undefined
      });
    } catch (error) {
      console.error('Error updating mapping status:', error);
      res.status(500).json({ error: 'Failed to update mapping status' });
    }
  }
);

// GET /api/v1/governance/audit-logs
governanceRouter.get('/audit-logs', async (_req: Request, res: Response): Promise<void> => {
  try {
    const logs = await prisma.auditEvent.findMany({
      orderBy: { timestamp: 'desc' },
      take: 100
    });

    res.status(200).json(
      logs.map((l) => ({
        id: l.id,
        timestamp: l.timestamp.toISOString().replace('T', ' ').slice(0, 19),
        actor: l.actor,
        actorRole: l.actorRole,
        tenantId: l.tenantId,
        action: l.action,
        entityType: l.entityType,
        entityId: l.entityId,
        oldValue: l.oldValue || undefined,
        newValue: l.newValue || undefined,
        reason: l.reason || undefined
      }))
    );
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});
