import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const prescriptionsRouter = Router();

// POST /api/v1/prescriptions/extract
prescriptionsRouter.post('/extract', async (_req: Request, res: Response): Promise<void> => {
  try {
    // Fetch canonical medicines to normalize against
    const [augmentin, panD, calpol, dolo] = await Promise.all([
      prisma.medicineEntity.findUnique({ where: { id: 'med-001' }, include: { ingredients: true } }),
      prisma.medicineEntity.findUnique({ where: { id: 'med-005' }, include: { ingredients: true } }),
      prisma.medicineEntity.findUnique({ where: { id: 'med-007' }, include: { ingredients: true } }),
      prisma.medicineEntity.findUnique({ where: { id: 'med-008' }, include: { ingredients: true } })
    ]);

    const formatMed = (m: any) =>
      m
        ? {
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
          }
        : undefined;

    const extracted = [
      {
        id: 'item-1',
        rawText: 'Tab. Augmentin 625mg 1 tab BD x 5 days',
        normalizedEntity: formatMed(augmentin),
        confidence: 0.96,
        isAmbiguous: false,
        dosageInstructions: '1 tablet twice daily after food for 5 days',
        confirmed: true
      },
      {
        id: 'item-2',
        rawText: 'Cap. Pan D 1 cap OD before breakfast',
        normalizedEntity: formatMed(panD),
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
        ambiguousCandidates: [formatMed(calpol), formatMed(dolo)].filter(Boolean),
        dosageInstructions: 'As needed for body ache/fever',
        confirmed: false
      }
    ];

    res.status(200).json(extracted);
  } catch (error) {
    console.error('Error parsing prescription image:', error);
    res.status(500).json({ error: 'Failed to extract prescription items' });
  }
});
