import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { ABDMService } from '../services/abdmService';
import { validateBody } from '../middleware/validate';

export const abdmRouter = Router();

const verifyDoctorSchema = z.object({
  registrationNumber: z.string().min(3),
  stateCouncil: z.string().default('MMC')
});

const verifyAbhaSchema = z.object({
  abhaInput: z.string().min(5)
});

const consentRequestSchema = z.object({
  abhaAddress: z.string(),
  purpose: z.string().default('MEDICINE_COMPARISON_AND_DISPENSATION'),
  facilityId: z.string().default('HFR-MH-4201')
});

// GET /api/v1/abdm/facility/:id - HFR Facility Lookup
abdmRouter.get('/facility/:id', (req: Request, res: Response) => {
  const facility = ABDMService.verifyFacility(req.params.id);
  res.status(200).json(facility);
});

// POST /api/v1/abdm/verify-doctor - HPR / NMR Doctor Verification
abdmRouter.post('/verify-doctor', validateBody(verifyDoctorSchema), (req: Request, res: Response) => {
  const { registrationNumber, stateCouncil } = req.body;
  const result = ABDMService.verifyDoctorLicense(registrationNumber, stateCouncil);
  res.status(200).json(result);
});

// POST /api/v1/abdm/verify-abha - ABHA Address & 14-digit Number Validation
abdmRouter.post('/verify-abha', validateBody(verifyAbhaSchema), (req: Request, res: Response) => {
  const { abhaInput } = req.body;
  const result = ABDMService.validateAbha(abhaInput);
  if (!result.isValid) {
    res.status(400).json({ error: 'Invalid ABHA address or 14-digit number' });
    return;
  }
  res.status(200).json(result);
});

// POST /api/v1/abdm/consent/request - Consent Request Artefact
abdmRouter.post('/consent/request', validateBody(consentRequestSchema), (req: Request, res: Response) => {
  const { abhaAddress, purpose, facilityId } = req.body;
  const consentId = `consent-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  res.status(201).json({
    consentRequestId: consentId,
    status: 'REQUESTED',
    abhaAddress,
    purpose,
    facilityId,
    validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    hiTypes: ['Prescription', 'DiagnosticReport']
  });
});
