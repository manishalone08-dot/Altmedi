import { MedicineEntity, MedicineMapping, SafetyContent, VendorOffer, PharmacistReview, AuditEvent } from '../types';

export const INITIAL_MEDICINES: MedicineEntity[] = [
  {
    id: 'med-001',
    brandName: 'Augmentin 625 Duo',
    genericName: 'Amoxicillin and Potassium Clavulanate Tablets IP',
    dosageForm: 'Tablet',
    strength: '500mg + 125mg',
    manufacturer: 'GlaxoSmithKline Pharmaceuticals Ltd',
    routeOfAdministration: 'Oral',
    packSize: '10 tablets',
    standardMrpInr: 204.50,
    ingredients: [
      { id: 'ing-1', name: 'Amoxicillin Trihydrate', strength: '500mg', unit: 'mg' },
      { id: 'ing-2', name: 'Potassium Clavulanate', strength: '125mg', unit: 'mg' }
    ],
    mappingStatus: 'approved',
    isPrescriptionRequired: true,
    category: 'Antibiotics'
  },
  {
    id: 'med-002',
    brandName: 'Amoxyclav 625',
    genericName: 'Amoxicillin and Potassium Clavulanate Tablets IP',
    dosageForm: 'Tablet',
    strength: '500mg + 125mg',
    manufacturer: 'Abbott Healthcare Pvt Ltd',
    routeOfAdministration: 'Oral',
    packSize: '10 tablets',
    standardMrpInr: 172.00,
    ingredients: [
      { id: 'ing-1', name: 'Amoxicillin Trihydrate', strength: '500mg', unit: 'mg' },
      { id: 'ing-2', name: 'Potassium Clavulanate', strength: '125mg', unit: 'mg' }
    ],
    mappingStatus: 'approved',
    isPrescriptionRequired: true,
    category: 'Antibiotics'
  },
  {
    id: 'med-003',
    brandName: 'Moxikind-CV 625',
    genericName: 'Amoxicillin and Potassium Clavulanate Tablets IP',
    dosageForm: 'Tablet',
    strength: '500mg + 125mg',
    manufacturer: 'Mankind Pharma Ltd',
    routeOfAdministration: 'Oral',
    packSize: '10 tablets',
    standardMrpInr: 148.00,
    ingredients: [
      { id: 'ing-1', name: 'Amoxicillin Trihydrate', strength: '500mg', unit: 'mg' },
      { id: 'ing-2', name: 'Potassium Clavulanate', strength: '125mg', unit: 'mg' }
    ],
    mappingStatus: 'approved',
    isPrescriptionRequired: true,
    category: 'Antibiotics'
  },
  {
    id: 'med-004',
    brandName: 'Zifi 200',
    genericName: 'Cefixime Tablets IP',
    dosageForm: 'Tablet',
    strength: '200mg',
    manufacturer: 'FDC Ltd',
    routeOfAdministration: 'Oral',
    packSize: '10 tablets',
    standardMrpInr: 110.50,
    ingredients: [
      { id: 'ing-3', name: 'Cefixime', strength: '200mg', unit: 'mg' }
    ],
    mappingStatus: 'approved',
    isPrescriptionRequired: true,
    category: 'Antibiotics'
  },
  {
    id: 'med-005',
    brandName: 'Pan-D',
    genericName: 'Pantoprazole Gastro-resistant and Domperidone Prolonged Release Capsules',
    dosageForm: 'Capsule',
    strength: '40mg + 30mg',
    manufacturer: 'Alkem Laboratories Ltd',
    routeOfAdministration: 'Oral',
    packSize: '15 capsules',
    standardMrpInr: 215.00,
    ingredients: [
      { id: 'ing-4', name: 'Pantoprazole Sodium', strength: '40mg', unit: 'mg' },
      { id: 'ing-5', name: 'Domperidone', strength: '30mg', unit: 'mg' }
    ],
    mappingStatus: 'approved',
    isPrescriptionRequired: true,
    category: 'Gastroenterology'
  },
  {
    id: 'med-006',
    brandName: 'Pantocid DSR',
    genericName: 'Pantoprazole Gastro-resistant and Domperidone Prolonged Release Capsules',
    dosageForm: 'Capsule',
    strength: '40mg + 30mg',
    manufacturer: 'Sun Pharmaceutical Industries Ltd',
    routeOfAdministration: 'Oral',
    packSize: '10 capsules',
    standardMrpInr: 165.00,
    ingredients: [
      { id: 'ing-4', name: 'Pantoprazole Sodium', strength: '40mg', unit: 'mg' },
      { id: 'ing-5', name: 'Domperidone', strength: '30mg', unit: 'mg' }
    ],
    mappingStatus: 'approved',
    isPrescriptionRequired: true,
    category: 'Gastroenterology'
  },
  {
    id: 'med-007',
    brandName: 'Calpol 650',
    genericName: 'Paracetamol Tablets IP',
    dosageForm: 'Tablet',
    strength: '650mg',
    manufacturer: 'GlaxoSmithKline Pharmaceuticals Ltd',
    routeOfAdministration: 'Oral',
    packSize: '15 tablets',
    standardMrpInr: 33.60,
    ingredients: [
      { id: 'ing-6', name: 'Paracetamol (Acetaminophen)', strength: '650mg', unit: 'mg' }
    ],
    mappingStatus: 'approved',
    isPrescriptionRequired: false,
    category: 'Analgesic & Antipyretic'
  },
  {
    id: 'med-008',
    brandName: 'Dolo 650',
    genericName: 'Paracetamol Tablets IP',
    dosageForm: 'Tablet',
    strength: '650mg',
    manufacturer: 'Micro Labs Ltd',
    routeOfAdministration: 'Oral',
    packSize: '15 tablets',
    standardMrpInr: 33.50,
    ingredients: [
      { id: 'ing-6', name: 'Paracetamol (Acetaminophen)', strength: '650mg', unit: 'mg' }
    ],
    mappingStatus: 'approved',
    isPrescriptionRequired: false,
    category: 'Analgesic & Antipyretic'
  },
  {
    id: 'med-009',
    brandName: 'Telma 40',
    genericName: 'Telmisartan Tablets IP',
    dosageForm: 'Tablet',
    strength: '40mg',
    manufacturer: 'Glenmark Pharmaceuticals Ltd',
    routeOfAdministration: 'Oral',
    packSize: '30 tablets',
    standardMrpInr: 245.00,
    ingredients: [
      { id: 'ing-7', name: 'Telmisartan', strength: '40mg', unit: 'mg' }
    ],
    mappingStatus: 'approved',
    isPrescriptionRequired: true,
    category: 'Cardiovascular'
  },
  {
    id: 'med-010',
    brandName: 'Telmikind 40',
    genericName: 'Telmisartan Tablets IP',
    dosageForm: 'Tablet',
    strength: '40mg',
    manufacturer: 'Mankind Pharma Ltd',
    routeOfAdministration: 'Oral',
    packSize: '10 tablets',
    standardMrpInr: 48.00,
    ingredients: [
      { id: 'ing-7', name: 'Telmisartan', strength: '40mg', unit: 'mg' }
    ],
    mappingStatus: 'approved',
    isPrescriptionRequired: true,
    category: 'Cardiovascular'
  }
];

export const INITIAL_MAPPINGS: MedicineMapping[] = [
  {
    id: 'map-1',
    sourceMedicineId: 'med-001',
    targetMedicineId: 'med-002',
    classification: 'same_active_ingredient',
    confidenceScore: 0.98,
    clinicalRationale: 'Exact match of Amoxicillin 500mg + Clavulanate 125mg in oral tablet form. Bioequivalent pharmaceutical standard.',
    status: 'approved',
    reviewedBy: 'Dr. S. Patil (PharmD)',
    reviewedAt: '2026-08-15'
  },
  {
    id: 'map-2',
    sourceMedicineId: 'med-001',
    targetMedicineId: 'med-003',
    classification: 'same_active_ingredient',
    confidenceScore: 0.98,
    clinicalRationale: 'Identical active API combination and strength. High-volume Indian generic equivalent.',
    status: 'approved',
    reviewedBy: 'Dr. S. Patil (PharmD)',
    reviewedAt: '2026-08-15'
  },
  {
    id: 'map-3',
    sourceMedicineId: 'med-001',
    targetMedicineId: 'med-004',
    classification: 'therapeutic_alternative',
    confidenceScore: 0.85,
    clinicalRationale: 'Third-generation cephalosporin (Cefixime 200mg). Different chemical class. Requires prescribing doctor or clinical pharmacist evaluation.',
    status: 'approved',
    reviewedBy: 'Dr. V. Kulkarni (MD, Pharmacology)',
    reviewedAt: '2026-08-20'
  },
  {
    id: 'map-4',
    sourceMedicineId: 'med-005',
    targetMedicineId: 'med-006',
    classification: 'same_active_ingredient',
    confidenceScore: 0.99,
    clinicalRationale: 'Identical combination of Pantoprazole 40mg (Gastro-resistant) + Domperidone 30mg (Sustained Release).',
    status: 'approved',
    reviewedBy: 'Dr. S. Patil (PharmD)',
    reviewedAt: '2026-08-18'
  },
  {
    id: 'map-5',
    sourceMedicineId: 'med-007',
    targetMedicineId: 'med-008',
    classification: 'same_active_ingredient',
    confidenceScore: 1.0,
    clinicalRationale: 'Direct bioequivalent paracetamol 650mg standard tablet.',
    status: 'approved',
    reviewedBy: 'Dr. S. Patil (PharmD)',
    reviewedAt: '2026-08-01'
  },
  {
    id: 'map-6',
    sourceMedicineId: 'med-009',
    targetMedicineId: 'med-010',
    classification: 'same_active_ingredient',
    confidenceScore: 0.99,
    clinicalRationale: 'Identical active ingredient (Telmisartan 40mg) in oral tablet formulation.',
    status: 'approved',
    reviewedBy: 'Dr. V. Kulkarni (MD, Pharmacology)',
    reviewedAt: '2026-08-10'
  }
];

export const INITIAL_SAFETY: Record<string, SafetyContent> = {
  'med-001': {
    id: 'safe-001',
    medicineEntityId: 'med-001',
    source: 'Central Drugs Standard Control Organisation (CDSCO) & Indian Pharmacopoeia',
    lastReviewed: '2026-08-24',
    reviewer: 'Clinical Content Review Board - Nashik Cell',
    commonSideEffects: ['Mild nausea or upset stomach', 'Transient loose stools / diarrhea', 'Skin rash or itching'],
    seriousWarnings: [
      'Anaphylaxis alert: Immediately discontinue if wheezing, swelling of face/lips, or severe urticaria develops.',
      'Cholestatic jaundice / hepatic dysfunction has been reported rarely with Clavulanate.',
      'Superinfections with fungal or bacterial pathogens may occur during prolonged therapy.'
    ],
    allergyWarnings: [
      'Contraindicated in patients with known hypersensitivity to Penicillins or Cephalosporins.',
      'Patients with history of amoxicillin/clavulanate-associated jaundice should not take this drug.'
    ],
    escalationAdvice: 'If experiencing severe breathing difficulty, swelling of throat or tongue, or dark urine with yellowing eyes, seek immediate emergency medical care at the nearest hospital.',
    pregnancyCategory: 'Category B - Use only if clearly needed under medical supervision.',
    drivingWarning: 'Dizziness may occur; avoid operating heavy machinery if feeling dizzy.'
  },
  'med-005': {
    id: 'safe-005',
    medicineEntityId: 'med-005',
    source: 'National Formulary of India (NFI) & CDSCO Guidance',
    lastReviewed: '2026-08-22',
    reviewer: 'Clinical Content Review Board',
    commonSideEffects: ['Dry mouth', 'Headache', 'Mild abdominal cramps', 'Flatulence'],
    seriousWarnings: [
      'Cardiac risk warning: Domperidone can be associated with an increased risk of serious ventricular arrhythmias or sudden cardiac death, especially in patients over 60 years.',
      'Long-term use of proton pump inhibitors (Pantoprazole) may increase bone fracture risk.'
    ],
    allergyWarnings: ['Contraindicated in patients with prolactinoma or severe cardiac conduction issues.'],
    escalationAdvice: 'If palpitations, dizziness, or syncope occur, discontinue and consult a cardiologist immediately.',
    pregnancyCategory: 'Use strictly under prescription guidance.'
  },
  'med-007': {
    id: 'safe-007',
    medicineEntityId: 'med-007',
    source: 'Indian Pharmacopoeia Monograph (Paracetamol)',
    lastReviewed: '2026-08-10',
    reviewer: 'Clinical Reviewer #4',
    commonSideEffects: ['Generally well tolerated at recommended dosages.'],
    seriousWarnings: [
      'Maximum daily dose warning: Do not exceed 4000mg in 24 hours. Overdose causes severe liver damage.',
      'Do not take concomitantly with other paracetamol-containing cough/cold remedies.'
    ],
    allergyWarnings: ['Discontinue if cutaneous skin reactions or itching occur.'],
    escalationAdvice: 'Suspected paracetamol overdose requires immediate hospital emergency admission for N-acetylcysteine therapy within 8 hours.'
  },
  'med-009': {
    id: 'safe-009',
    medicineEntityId: 'med-009',
    source: 'CDSCO Hypertension Guidelines',
    lastReviewed: '2026-08-12',
    reviewer: 'Cardiology Review Panel',
    commonSideEffects: ['Sinus pain', 'Back pain', 'Diarrhea', 'Mild hypotension'],
    seriousWarnings: [
      'FETAL TOXICITY WARNING: When pregnancy is detected, discontinue Telmisartan as soon as possible.',
      'Monitor serum potassium and renal function regularly in patients with chronic kidney impairment.'
    ],
    allergyWarnings: ['Do not use in patients with biliary obstructive disorders or severe hepatic impairment.'],
    escalationAdvice: 'Severe dizziness, fainting, or swelling of hands/feet requires urgent medical evaluation.'
  }
};

export const INITIAL_VENDOR_OFFERS: VendorOffer[] = [
  {
    id: 'off-001',
    vendorId: 'vend-nashik-01',
    vendorName: 'Nashik Medicos & Surgicals',
    vendorArea: 'College Road, Nashik',
    medicineEntityId: 'med-001',
    priceInr: 184.00,
    mrpInr: 204.50,
    packSize: '10 tablets',
    unitPriceInr: 18.40,
    inStock: true,
    stockCount: 42,
    updatedAt: '2 hours ago',
    freshness: 'fresh',
    isStale: false
  },
  {
    id: 'off-002',
    vendorId: 'vend-nashik-02',
    vendorName: 'Shree Ganesh Chemist',
    vendorArea: 'Panchavati, Nashik',
    medicineEntityId: 'med-002',
    priceInr: 146.00,
    mrpInr: 172.00,
    packSize: '10 tablets',
    unitPriceInr: 14.60,
    inStock: true,
    stockCount: 18,
    updatedAt: '3 hours ago',
    freshness: 'fresh',
    isStale: false
  },
  {
    id: 'off-003',
    vendorId: 'vend-nashik-03',
    vendorName: 'Lifeline Pharmacy Hub',
    vendorArea: 'Canada Corner, Nashik',
    medicineEntityId: 'med-003',
    priceInr: 118.50,
    mrpInr: 148.00,
    packSize: '10 tablets',
    unitPriceInr: 11.85,
    inStock: true,
    stockCount: 85,
    updatedAt: '15 minutes ago',
    freshness: 'fresh',
    isStale: false
  },
  {
    id: 'off-004',
    vendorId: 'vend-nashik-04',
    vendorName: 'Apollo Pharmacy - Nashik Road',
    vendorArea: 'Nashik Road Railway Station',
    medicineEntityId: 'med-001',
    priceInr: 195.00,
    mrpInr: 204.50,
    packSize: '10 tablets',
    unitPriceInr: 19.50,
    inStock: true,
    stockCount: 12,
    updatedAt: 'Yesterday',
    freshness: 'fresh',
    isStale: false
  },
  {
    id: 'off-005',
    vendorId: 'vend-nashik-05',
    vendorName: 'Godavari Super Chemist',
    vendorArea: 'Indira Nagar, Nashik',
    medicineEntityId: 'med-003',
    priceInr: 122.00,
    mrpInr: 148.00,
    packSize: '10 tablets',
    unitPriceInr: 12.20,
    inStock: true,
    stockCount: 30,
    updatedAt: '9 days ago',
    freshness: 'stale',
    isStale: true
  },
  {
    id: 'off-006',
    vendorId: 'vend-nashik-01',
    vendorName: 'Nashik Medicos & Surgicals',
    vendorArea: 'College Road, Nashik',
    medicineEntityId: 'med-005',
    priceInr: 192.00,
    mrpInr: 215.00,
    packSize: '15 capsules',
    unitPriceInr: 12.80,
    inStock: true,
    stockCount: 25,
    updatedAt: '1 hour ago',
    freshness: 'fresh',
    isStale: false
  },
  {
    id: 'off-007',
    vendorId: 'vend-nashik-03',
    vendorName: 'Lifeline Pharmacy Hub',
    vendorArea: 'Canada Corner, Nashik',
    medicineEntityId: 'med-006',
    priceInr: 135.00,
    mrpInr: 165.00,
    packSize: '10 capsules',
    unitPriceInr: 13.50,
    inStock: true,
    stockCount: 60,
    updatedAt: '4 hours ago',
    freshness: 'fresh',
    isStale: false
  },
  {
    id: 'off-008',
    vendorId: 'vend-nashik-02',
    vendorName: 'Shree Ganesh Chemist',
    vendorArea: 'Panchavati, Nashik',
    medicineEntityId: 'med-007',
    priceInr: 29.00,
    mrpInr: 33.60,
    packSize: '15 tablets',
    unitPriceInr: 1.93,
    inStock: true,
    stockCount: 120,
    updatedAt: 'Today',
    freshness: 'fresh',
    isStale: false
  },
  {
    id: 'off-009',
    vendorId: 'vend-nashik-01',
    vendorName: 'Nashik Medicos & Surgicals',
    vendorArea: 'College Road, Nashik',
    medicineEntityId: 'med-008',
    priceInr: 28.50,
    mrpInr: 33.50,
    packSize: '15 tablets',
    unitPriceInr: 1.90,
    inStock: true,
    stockCount: 200,
    updatedAt: 'Today',
    freshness: 'fresh',
    isStale: false
  }
];

export const INITIAL_PHARMACIST_REVIEWS: PharmacistReview[] = [
  {
    id: 'rev-101',
    sessionId: 'sess-8491',
    patientName: 'Kishore Deshmukh',
    patientPhoneMasked: '+91 98****4102',
    originalMedicine: INITIAL_MEDICINES[0], // Augmentin 625
    proposedAlternative: INITIAL_MEDICINES[2], // Moxikind-CV 625
    classification: 'same_active_ingredient',
    requestedAt: '2026-09-08 09:15',
    status: 'in_review',
    urgency: 'routine',
    pharmacyName: 'Lifeline Pharmacy Hub (Nashik)'
  },
  {
    id: 'rev-102',
    sessionId: 'sess-8488',
    patientName: 'Sunita Patil',
    patientPhoneMasked: '+91 94****8921',
    originalMedicine: INITIAL_MEDICINES[4], // Pan-D
    proposedAlternative: INITIAL_MEDICINES[5], // Pantocid DSR
    classification: 'same_active_ingredient',
    requestedAt: '2026-09-08 08:30',
    status: 'confirmed',
    decisionReason: 'Bioequivalent generic with verified release profile. Dispensing approved under substitute consent.',
    assignedPharmacist: 'M. Shinde (Reg #MH-82194)',
    decidedAt: '2026-09-08 08:45',
    urgency: 'routine',
    pharmacyName: 'Nashik Medicos & Surgicals'
  },
  {
    id: 'rev-103',
    sessionId: 'sess-8472',
    patientName: 'Ramesh Jadhav',
    patientPhoneMasked: '+91 97****3310',
    originalMedicine: INITIAL_MEDICINES[0], // Augmentin 625
    proposedAlternative: INITIAL_MEDICINES[3], // Zifi 200 (Cephalosporin)
    classification: 'therapeutic_alternative',
    requestedAt: '2026-09-07 18:20',
    status: 'rejected',
    decisionReason: 'Therapeutic substitution requires direct prescribing doctor authorization. Not equivalent for high-tier respiratory protocol.',
    assignedPharmacist: 'M. Shinde (Reg #MH-82194)',
    decidedAt: '2026-09-07 18:40',
    urgency: 'urgent',
    pharmacyName: 'Nashik Medicos & Surgicals'
  }
];

export const INITIAL_AUDIT_LOGS: AuditEvent[] = [
  {
    id: 'aud-001',
    timestamp: '2026-09-08 06:15:22',
    actor: 'admin@altmedi.in',
    actorRole: 'platform_admin',
    tenantId: 'pilot-nashik-01',
    action: 'MAPPING_APPROVED',
    entityType: 'MedicineMapping',
    entityId: 'map-2',
    oldValue: 'draft',
    newValue: 'approved',
    reason: 'Clinical trial verification & bioequivalence documentation approved by CDSCO panel'
  },
  {
    id: 'aud-002',
    timestamp: '2026-09-08 08:45:10',
    actor: 'm.shinde@pharmacy.in',
    actorRole: 'pharmacist',
    tenantId: 'pilot-nashik-01',
    action: 'SUBSTITUTION_CONFIRMED',
    entityType: 'PharmacistReview',
    entityId: 'rev-102',
    oldValue: 'in_review',
    newValue: 'confirmed',
    reason: 'Verified bioequivalence with identical sustained-release kinetic parameters'
  },
  {
    id: 'aud-003',
    timestamp: '2026-09-08 08:50:30',
    actor: 'vendor-lifeline@nashik.in',
    actorRole: 'vendor',
    tenantId: 'pilot-nashik-01',
    action: 'OFFER_UPDATED',
    entityType: 'VendorOffer',
    entityId: 'off-003',
    oldValue: 'Price: ₹125.00, Stock: 40',
    newValue: 'Price: ₹118.50, Stock: 85',
    reason: 'Bulk stock arrival at Canada Corner branch'
  }
];
