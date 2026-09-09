import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { notificationService } from '../services/notificationService';
import { validateBody } from '../middleware/validate';

export const notificationsRouter = Router();

const reservationSchema = z.object({
  phone: z.string().min(10, 'Valid phone number is required'),
  reservationCode: z.string().min(1, 'Reservation code is required'),
  medicineName: z.string().min(1, 'Medicine name is required'),
  pharmacyName: z.string().min(1, 'Pharmacy name is required'),
  priceInr: z.number().nonnegative('Price must be non-negative')
});

const reviewStatusSchema = z.object({
  phone: z.string().min(10, 'Valid phone number is required'),
  patientName: z.string().min(1, 'Patient name is required'),
  originalMedicineName: z.string().min(1, 'Original medicine name is required'),
  proposedMedicineName: z.string().min(1, 'Proposed medicine name is required'),
  decision: z.enum(['confirmed', 'rejected']),
  reason: z.string().min(1, 'Reason is required'),
  pharmacistName: z.string().min(1, 'Pharmacist name is required')
});

// POST /api/v1/notifications/reservation
notificationsRouter.post(
  '/reservation',
  validateBody(reservationSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { phone, reservationCode, medicineName, pharmacyName, priceInr } = req.body;
      const result = await notificationService.sendReservationConfirmation(
        phone,
        reservationCode,
        medicineName,
        pharmacyName,
        priceInr
      );
      res.status(200).json(result);
    } catch (error) {
      console.error('Error dispatching reservation SMS:', error);
      res.status(500).json({ error: 'Failed to send reservation SMS' });
    }
  }
);

// POST /api/v1/notifications/review-status
notificationsRouter.post(
  '/review-status',
  validateBody(reviewStatusSchema),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        phone,
        patientName,
        originalMedicineName,
        proposedMedicineName,
        decision,
        reason,
        pharmacistName
      } = req.body;

      const result = await notificationService.sendReviewDecisionUpdate(
        phone,
        patientName,
        originalMedicineName,
        proposedMedicineName,
        decision,
        reason,
        pharmacistName
      );
      res.status(200).json(result);
    } catch (error) {
      console.error('Error dispatching review status notification:', error);
      res.status(500).json({ error: 'Failed to send WhatsApp status notification' });
    }
  }
);
