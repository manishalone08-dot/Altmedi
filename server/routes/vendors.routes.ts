import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { validateBody } from '../middleware/validate';
import { optionalAuth, AuthenticatedRequest } from '../middleware/auth';
import { sseService } from '../services/sseService';

export const vendorsRouter = Router();

const updateOfferSchema = z.object({
  newPrice: z.number().positive('Price must be greater than 0'),
  newStockCount: z.number().int().nonnegative('Stock count must be non-negative'),
  actor: z.string().optional()
});

// GET /api/v1/vendors/stream (SSE real-time updates)
vendorsRouter.get('/stream', (_req: Request, res: Response): void => {
  sseService.addClient(res);
});

// GET /api/v1/vendors/:medicineId/offers
vendorsRouter.get('/:medicineId/offers', async (req: Request, res: Response): Promise<void> => {
  try {
    const medicineId = req.params.medicineId;
    const offers = await prisma.vendorOffer.findMany({
      where: { medicineEntityId: medicineId },
      orderBy: { priceInr: 'asc' }
    });

    res.status(200).json(
      offers.map((o) => ({
        id: o.id,
        vendorId: o.vendorId,
        vendorName: o.vendorName,
        vendorArea: o.vendorArea,
        medicineEntityId: o.medicineEntityId,
        priceInr: Number(o.priceInr),
        mrpInr: Number(o.mrpInr),
        packSize: o.packSize,
        unitPriceInr: Number(o.unitPriceInr),
        inStock: o.inStock,
        stockCount: o.stockCount,
        updatedAt: 'Just now',
        freshness: o.freshness,
        isStale: o.isStale
      }))
    );
  } catch (error) {
    console.error('Error fetching vendor offers:', error);
    res.status(500).json({ error: 'Failed to fetch vendor offers' });
  }
});

// PUT /api/v1/vendors/offers/:offerId
vendorsRouter.put(
  '/offers/:offerId',
  optionalAuth,
  validateBody(updateOfferSchema),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const offerId = req.params.offerId;
      const { newPrice, newStockCount, actor } = req.body;

      const existing = await prisma.vendorOffer.findUnique({
        where: { id: offerId }
      });

      if (!existing) {
        res.status(404).json({ error: 'Vendor offer not found' });
        return;
      }

      const actorName = actor || req.user?.name || 'Vendor Partner';
      const actorRole = req.user?.role || 'vendor';
      const oldVal = `Price: ₹${Number(existing.priceInr).toFixed(2)}, Stock: ${existing.stockCount}`;
      const newVal = `Price: ₹${newPrice.toFixed(2)}, Stock: ${newStockCount}`;

      const updated = await prisma.vendorOffer.update({
        where: { id: offerId },
        data: {
          priceInr: newPrice,
          stockCount: newStockCount,
          inStock: newStockCount > 0,
          freshness: 'fresh',
          isStale: false
        }
      });

      // Audit log creation (immutable append-only)
      await prisma.auditEvent.create({
        data: {
          tenantId: existing.tenantId,
          actor: actorName,
          actorRole,
          actorId: req.user?.id || null,
          action: 'OFFER_UPDATED',
          entityType: 'VendorOffer',
          entityId: offerId,
          oldValue: oldVal,
          newValue: newVal,
          reason: 'Vendor inventory and pricing update'
        }
      });

      const formattedOffer = {
        id: updated.id,
        vendorId: updated.vendorId,
        vendorName: updated.vendorName,
        vendorArea: updated.vendorArea,
        medicineEntityId: updated.medicineEntityId,
        priceInr: Number(updated.priceInr),
        mrpInr: Number(updated.mrpInr),
        packSize: updated.packSize,
        unitPriceInr: Number(updated.unitPriceInr),
        inStock: updated.inStock,
        stockCount: updated.stockCount,
        updatedAt: 'Just now',
        freshness: updated.freshness,
        isStale: updated.isStale
      };

      // Broadcast live update over SSE to all connected clients
      sseService.broadcast('OFFER_UPDATED', formattedOffer);

      res.status(200).json(formattedOffer);
    } catch (error) {
      console.error('Error updating vendor offer:', error);
      res.status(500).json({ error: 'Failed to update vendor offer' });
    }
  }
);
