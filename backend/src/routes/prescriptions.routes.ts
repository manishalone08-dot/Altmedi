import { Router, Request, Response } from 'express';
import { geminiService } from '../services/geminiService';

export const prescriptionsRouter = Router();

// POST /api/v1/prescriptions/extract
prescriptionsRouter.post('/extract', async (req: Request, res: Response): Promise<void> => {
  try {
    const imageDataUrl = req.body?.imageDataUrl || '';
    const extracted = await geminiService.extractPrescription(imageDataUrl);
    res.status(200).json(extracted);
  } catch (error) {
    console.error('Error parsing prescription image:', error);
    res.status(500).json({ error: 'Failed to extract prescription items' });
  }
});
