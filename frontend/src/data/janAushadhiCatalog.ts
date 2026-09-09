import { JanAushadhiItem } from '../types';

export const JAN_AUSHADHI_CATALOG: JanAushadhiItem[] = [
  {
    id: 'pmbjp-001',
    genericName: 'Amoxicillin and Potassium Clavulanate Tablets IP 625mg',
    dosageForm: 'Tablet',
    strength: '500mg + 125mg',
    packSize: '10 tablets',
    pmbjpPriceInr: 61.20,
    equivalentBrandMrpInr: 204.50, // Augmentin 625 Duo
    savingsPercentage: 70.07,
    pmbjpCode: 'PMBJP-TAB-0142',
    isBplSubsidyEligible: true,
    availableNearNashik: true,
    nearestStoreArea: 'Shalimar Chowk, Nashik'
  },
  {
    id: 'pmbjp-002',
    genericName: 'Cefuroxime Axetil Tablets IP 500mg',
    dosageForm: 'Tablet',
    strength: '500mg',
    packSize: '10 tablets',
    pmbjpPriceInr: 120.00,
    equivalentBrandMrpInr: 485.00, // Cetil 500
    savingsPercentage: 75.26,
    pmbjpCode: 'PMBJP-TAB-0205',
    isBplSubsidyEligible: true,
    availableNearNashik: true,
    nearestStoreArea: 'Nashik Road Railway Station Gate'
  },
  {
    id: 'pmbjp-003',
    genericName: 'Azithromycin Tablets IP 500mg',
    dosageForm: 'Tablet',
    strength: '500mg',
    packSize: '3 tablets',
    pmbjpPriceInr: 27.50,
    equivalentBrandMrpInr: 71.00, // Azithral 500
    savingsPercentage: 61.27,
    pmbjpCode: 'PMBJP-TAB-0089',
    isBplSubsidyEligible: true,
    availableNearNashik: true,
    nearestStoreArea: 'Panchavati Karanja, Nashik'
  },
  {
    id: 'pmbjp-004',
    genericName: 'Pantoprazole Gastro-resistant and Domperidone Prolonged-release Capsules IP',
    dosageForm: 'Capsule',
    strength: '40mg + 30mg',
    packSize: '10 capsules',
    pmbjpPriceInr: 28.00,
    equivalentBrandMrpInr: 215.00, // Pan-D
    savingsPercentage: 86.98,
    pmbjpCode: 'PMBJP-CAP-0054',
    isBplSubsidyEligible: true,
    availableNearNashik: true,
    nearestStoreArea: 'Canada Corner, College Road, Nashik'
  },
  {
    id: 'pmbjp-005',
    genericName: 'Paracetamol Tablets IP 650mg',
    dosageForm: 'Tablet',
    strength: '650mg',
    packSize: '15 tablets',
    pmbjpPriceInr: 12.50,
    equivalentBrandMrpInr: 33.60, // Calpol 650
    savingsPercentage: 62.80,
    pmbjpCode: 'PMBJP-TAB-0012',
    isBplSubsidyEligible: true,
    availableNearNashik: true,
    nearestStoreArea: 'Shalimar Chowk, Nashik'
  },
  {
    id: 'pmbjp-006',
    genericName: 'Telmisartan Tablets IP 40mg',
    dosageForm: 'Tablet',
    strength: '40mg',
    packSize: '10 tablets',
    pmbjpPriceInr: 14.00,
    equivalentBrandMrpInr: 145.00, // Telma 40
    savingsPercentage: 90.34,
    pmbjpCode: 'PMBJP-TAB-0310',
    isBplSubsidyEligible: true,
    availableNearNashik: true,
    nearestStoreArea: 'Indira Nagar, Nashik'
  },
  {
    id: 'pmbjp-007',
    genericName: 'Metformin Hydrochloride Prolonged-release Tablets IP 500mg',
    dosageForm: 'Tablet',
    strength: '500mg',
    packSize: '10 tablets',
    pmbjpPriceInr: 7.20,
    equivalentBrandMrpInr: 42.00, // Glycomet 500
    savingsPercentage: 82.86,
    pmbjpCode: 'PMBJP-TAB-0044',
    isBplSubsidyEligible: true,
    availableNearNashik: true,
    nearestStoreArea: 'Panchavati Karanja, Nashik'
  },
  {
    id: 'pmbjp-008',
    genericName: 'Atorvastatin Tablets IP 10mg',
    dosageForm: 'Tablet',
    strength: '10mg',
    packSize: '10 tablets',
    pmbjpPriceInr: 9.50,
    equivalentBrandMrpInr: 68.00, // Atorva 10
    savingsPercentage: 86.03,
    pmbjpCode: 'PMBJP-TAB-0029',
    isBplSubsidyEligible: true,
    availableNearNashik: true,
    nearestStoreArea: 'Shalimar Chowk, Nashik'
  }
];

export function findJanAushadhiEquivalent(genericName: string): JanAushadhiItem | undefined {
  const norm = genericName.toLowerCase();
  return JAN_AUSHADHI_CATALOG.find((item) => {
    const itemNorm = item.genericName.toLowerCase();
    return (
      norm.includes('amoxicillin') && itemNorm.includes('amoxicillin') ||
      norm.includes('cefuroxime') && itemNorm.includes('cefuroxime') ||
      norm.includes('azithromycin') && itemNorm.includes('azithromycin') ||
      norm.includes('pantoprazole') && itemNorm.includes('pantoprazole') ||
      norm.includes('paracetamol') && itemNorm.includes('paracetamol') ||
      norm.includes('telmisartan') && itemNorm.includes('telmisartan') ||
      norm.includes('metformin') && itemNorm.includes('metformin') ||
      norm.includes('atorvastatin') && itemNorm.includes('atorvastatin')
    );
  });
}
