import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MedicineEntity } from '../../types';
import { INITIAL_MEDICINES, INITIAL_MAPPINGS } from '../../services/catalogData';
import {
  Coordinates,
  DEFAULT_NASHIK_CENTER,
  calculateHaversineDistance,
  requestUserPosition
} from '../../services/geoService';
import { PharmacyInteractiveMap } from './PharmacyInteractiveMap';
import { findJanAushadhiEquivalent } from '../../data/janAushadhiCatalog';
import { JanAushadhiBadge } from './JanAushadhiBadge';
import {
  ArrowLeft,
  AlertTriangle,
  FileCheck2,
  TrendingDown,
  Info,
  Building2,
  CheckCircle2,
  Pill,
  ShieldAlert,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  MapPin,
  Store,
  Clock,
  Phone,
  RefreshCw,
  Loader2,
  XCircle,
  Sparkles,
  ShoppingBag,
  SlidersHorizontal,
  ArrowDownUp,
  Check,
  RotateCcw,
  FlaskConical,
  Filter,
  Map,
  Navigation,
  LocateFixed,
  Send,
  Radio
} from 'lucide-react';

export interface MedicineComparisonViewProps {
  sourceMedicine: MedicineEntity;
  onBack: () => void;
  onRequestReview?: (originalMed: MedicineEntity, altMed: MedicineEntity) => void;
}

export interface PharmacyVendorStock {
  vendorId: string;
  vendorName: string;
  area: string; // e.g., 'College Road, Nashik'
  distanceKm: number;
  inStock: boolean;
  stockCount: number;
  stockLevel: 'high' | 'low' | 'out_of_stock';
  retailPriceInr: number;
  mrpInr: number;
  discountPercentage: number;
  phone: string;
  hours: string;
  is24Hours?: boolean;
  isPartner?: boolean;
}

export interface AlternativeSafetyProfile {
  allergyWarnings: {
    primaryAlert: string;
    crossAllergies: string[];
    symptomsToWatch: string[];
  };
  sideEffects: {
    common: string[];
    rareSevere: string[];
  };
  contraindications: string[];
  clinicalAdvisory: string;
}

// Structured safety and allergy information for therapeutic alternatives
const SAFETY_DATA_REGISTRY: Record<string, AlternativeSafetyProfile> = {
  'demo-alt-01': {
    allergyWarnings: {
      primaryAlert: 'Cephalosporin Class Hypersensitivity Risk',
      crossAllergies: ['Penicillin (5-10% cross-reactivity in severe anaphylaxis)', 'Cephalexin', 'Cefotaxime'],
      symptomsToWatch: ['Urticaria (hives)', 'Facial or throat angioedema', 'Wheezing or bronchospasm']
    },
    sideEffects: {
      common: ['Diarrhea / loose stools', 'Nausea / stomach upset', 'Transient abdominal pain', 'Oral / vaginal fungal overgrowth (candidiasis)'],
      rareSevere: ['Clostridioides difficile colitis (severe diarrhea)', 'Erythema multiforme', 'Elevated hepatic transaminases']
    },
    contraindications: ['Documented severe IgE-mediated anaphylaxis to beta-lactam antibiotics'],
    clinicalAdvisory: 'Take immediately after meals for superior bioavailability and minimized gastrointestinal intolerance.'
  },
  'demo-alt-02': {
    allergyWarnings: {
      primaryAlert: 'Macrolide Class Hypersensitivity',
      crossAllergies: ['Erythromycin', 'Clarithromycin', 'Roxithromycin'],
      symptomsToWatch: ['Pruritus (intense itching)', 'Maculopapular rash', 'Stevens-Johnson syndrome (SJS) symptoms', 'Shortness of breath']
    },
    sideEffects: {
      common: ['Mild abdominal cramps', 'Nausea / loose stools', 'Indigestion', 'Altered or metallic taste'],
      rareSevere: ['Cardiac QT interval prolongation / arrhythmia', 'Cholestatic jaundice / severe hepatotoxicity', 'Hearing impairment (reversible)']
    },
    contraindications: ['Pre-existing cholestatic jaundice or liver impairment from prior macrolides', 'Concurrent administration of QT-prolonging drugs'],
    clinicalAdvisory: 'Do not take with aluminum- or magnesium-based antacids within 2 hours of ingestion.'
  },
  'demo-alt-03': {
    allergyWarnings: {
      primaryAlert: 'Fluoroquinolone Hypersensitivity & Black Box Precaution',
      crossAllergies: ['Levofloxacin', 'Ofloxacin', 'Norfloxacin', 'Moxifloxacin'],
      symptomsToWatch: ['Acute cutaneous flushing', 'Exaggerated sunburn / phototoxic rash', 'Facial swelling', 'Dyspnea']
    },
    sideEffects: {
      common: ['Nausea and dyspepsia', 'Dizziness / headache', 'Mild diarrhea', 'Insomnia / mild agitation'],
      rareSevere: ['Tendinitis and Achilles tendon rupture', 'Peripheral neuropathy (tingling/numbness)', 'CNS neurotoxicity / tremors']
    },
    contraindications: ['History of tendinitis or tendon rupture with quinolones', 'Myasthenia gravis (exacerbates muscle weakness)'],
    clinicalAdvisory: 'Maintain adequate hydration to prevent crystalluria. Avoid excessive sun and ultraviolet lamp exposure.'
  },
  'demo-alt-04': {
    allergyWarnings: {
      primaryAlert: 'Substituted Benzimidazole Hypersensitivity',
      crossAllergies: ['Omeprazole', 'Pantoprazole', 'Esomeprazole', 'Lansoprazole'],
      symptomsToWatch: ['Acute interstitial nephritis rash', 'Anaphylactoid swelling', 'Severe cutaneous adverse reactions']
    },
    sideEffects: {
      common: ['Frontal headache', 'Abdominal flatulence / bloating', 'Mild constipation or diarrhea', 'Dry mouth'],
      rareSevere: ['Hypomagnesemia with long-term therapy', 'Elevated risk of bone fractures with high doses', 'Clostridioides difficile colitis']
    },
    contraindications: ['Known hypersensitivity to rabeprazole or benzimidazoles', 'Concurrent administration with rilpivirine'],
    clinicalAdvisory: 'Swallow whole with water 30 to 60 minutes prior to meals (preferably breakfast). Do not chew, split, or crush.'
  },
  'med-002': {
    allergyWarnings: {
      primaryAlert: 'Penicillin & Beta-Lactam Hypersensitivity Alert',
      crossAllergies: ['Ampicillin', 'Amoxicillin', 'Piperacillin', 'Cephalosporins (partial)'],
      symptomsToWatch: ['Urticaria / rash', 'Angioedema of face/lips', 'Wheezing or dyspnea', 'Severe pruritus']
    },
    sideEffects: {
      common: ['Loose stools / mild diarrhea', 'Nausea / dyspepsia', 'Abdominal discomfort', 'Mild oral candidiasis'],
      rareSevere: ['Severe Clostridioides difficile colitis', 'Cholestatic jaundice / hepatitis', 'Severe erythema multiforme']
    },
    contraindications: ['Documented hypersensitivity to penicillins or beta-lactamase inhibitors', 'History of amoxicillin-associated cholestatic jaundice'],
    clinicalAdvisory: 'Take at the start of a meal with plenty of water to enhance absorption and minimize gastrointestinal intolerance.'
  },
  'med-003': {
    allergyWarnings: {
      primaryAlert: 'Penicillin & Beta-Lactam Hypersensitivity Alert',
      crossAllergies: ['Ampicillin', 'Amoxicillin', 'Piperacillin', 'Cephalosporins (partial)'],
      symptomsToWatch: ['Urticaria / rash', 'Angioedema of face/lips', 'Wheezing or dyspnea', 'Severe pruritus']
    },
    sideEffects: {
      common: ['Loose stools / mild diarrhea', 'Nausea / dyspepsia', 'Abdominal discomfort', 'Mild oral candidiasis'],
      rareSevere: ['Severe Clostridioides difficile colitis', 'Cholestatic jaundice / hepatitis', 'Severe erythema multiforme']
    },
    contraindications: ['Documented hypersensitivity to penicillins or beta-lactamase inhibitors', 'History of amoxicillin-associated cholestatic jaundice'],
    clinicalAdvisory: 'Take at the start of a meal with plenty of water to enhance absorption and minimize gastrointestinal intolerance.'
  }
};

const getAlternativeSafetyProfile = (alt: MedicineEntity): AlternativeSafetyProfile => {
  if (SAFETY_DATA_REGISTRY[alt.id]) {
    return SAFETY_DATA_REGISTRY[alt.id];
  }

  return {
    allergyWarnings: {
      primaryAlert: `Active Formulation Hypersensitivity (${alt.genericName})`,
      crossAllergies: [`Other medications within the ${alt.category} category`],
      symptomsToWatch: ['Skin rash', 'Facial swelling', 'Breathing difficulty', 'Severe hives']
    },
    sideEffects: {
      common: ['Mild gastrointestinal distress', 'Headache', 'Nausea'],
      rareSevere: ['Severe allergic reaction (anaphylaxis)', 'Unusual skin lesions']
    },
    contraindications: ['Known hypersensitivity to active or inactive ingredients'],
    clinicalAdvisory: 'Consult a registered medical practitioner or pharmacist before modifying medication regimen.'
  };
};

// Simulated Local Pharmacy and Vendor Inventory Registry (Nashik network)
const PHARMACY_VENDOR_REGISTRY: Record<string, PharmacyVendorStock[]> = {
  'demo-alt-01': [
    {
      vendorId: 'vend-nashik-01',
      vendorName: 'Nashik Medicos & Surgicals',
      area: 'College Road, Nashik',
      distanceKm: 1.2,
      inStock: true,
      stockCount: 24,
      stockLevel: 'high',
      retailPriceInr: 445.0,
      mrpInr: 495.0,
      discountPercentage: 10,
      phone: '+91 253 257 8891',
      hours: 'Open until 11:00 PM',
      isPartner: true
    },
    {
      vendorId: 'vend-nashik-02',
      vendorName: 'Lifeline Pharmacy Hub',
      area: 'Canada Corner, Nashik',
      distanceKm: 2.4,
      inStock: true,
      stockCount: 12,
      stockLevel: 'high',
      retailPriceInr: 450.0,
      mrpInr: 495.0,
      discountPercentage: 9,
      phone: '+91 253 231 4455',
      hours: 'Open 24/7',
      is24Hours: true,
      isPartner: true
    },
    {
      vendorId: 'vend-nashik-03',
      vendorName: 'Apollo Pharmacy - Nashik Road',
      area: 'Opp. Railway Station, Nashik Road',
      distanceKm: 4.1,
      inStock: true,
      stockCount: 3,
      stockLevel: 'low',
      retailPriceInr: 470.0,
      mrpInr: 495.0,
      discountPercentage: 5,
      phone: '+91 253 246 1120',
      hours: 'Open until 10:30 PM'
    },
    {
      vendorId: 'vend-nashik-04',
      vendorName: 'Shree Ganesh Chemist',
      area: 'Panchavati Karanja, Nashik',
      distanceKm: 3.8,
      inStock: false,
      stockCount: 0,
      stockLevel: 'out_of_stock',
      retailPriceInr: 440.0,
      mrpInr: 495.0,
      discountPercentage: 11,
      phone: '+91 253 251 7733',
      hours: 'Open until 10:00 PM'
    }
  ],
  'demo-alt-02': [
    {
      vendorId: 'vend-nashik-05',
      vendorName: 'Wellness Forever',
      area: 'Mahatma Nagar, Nashik',
      distanceKm: 1.9,
      inStock: true,
      stockCount: 30,
      stockLevel: 'high',
      retailPriceInr: 99.0,
      mrpInr: 119.5,
      discountPercentage: 17,
      phone: '+91 253 235 9011',
      hours: 'Open 24/7',
      is24Hours: true,
      isPartner: true
    },
    {
      vendorId: 'vend-nashik-02',
      vendorName: 'Lifeline Pharmacy Hub',
      area: 'Canada Corner, Nashik',
      distanceKm: 2.4,
      inStock: true,
      stockCount: 45,
      stockLevel: 'high',
      retailPriceInr: 104.0,
      mrpInr: 119.5,
      discountPercentage: 13,
      phone: '+91 253 231 4455',
      hours: 'Open 24/7',
      is24Hours: true,
      isPartner: true
    },
    {
      vendorId: 'vend-nashik-04',
      vendorName: 'Shree Ganesh Chemist',
      area: 'Panchavati Karanja, Nashik',
      distanceKm: 3.8,
      inStock: true,
      stockCount: 18,
      stockLevel: 'high',
      retailPriceInr: 108.0,
      mrpInr: 119.5,
      discountPercentage: 10,
      phone: '+91 253 251 7733',
      hours: 'Open until 10:00 PM'
    },
    {
      vendorId: 'vend-nashik-01',
      vendorName: 'Nashik Medicos & Surgicals',
      area: 'College Road, Nashik',
      distanceKm: 2.1,
      inStock: true,
      stockCount: 2,
      stockLevel: 'low',
      retailPriceInr: 110.0,
      mrpInr: 119.5,
      discountPercentage: 8,
      phone: '+91 253 257 8891',
      hours: 'Open until 11:00 PM',
      isPartner: true
    }
  ],
  'demo-alt-03': [
    {
      vendorId: 'vend-nashik-04',
      vendorName: 'Shree Ganesh Chemist',
      area: 'Panchavati Karanja, Nashik',
      distanceKm: 0.6,
      inStock: true,
      stockCount: 35,
      stockLevel: 'high',
      retailPriceInr: 36.0,
      mrpInr: 42.8,
      discountPercentage: 16,
      phone: '+91 253 251 7733',
      hours: 'Open until 10:00 PM'
    },
    {
      vendorId: 'vend-nashik-01',
      vendorName: 'Nashik Medicos & Surgicals',
      area: 'College Road, Nashik',
      distanceKm: 1.2,
      inStock: true,
      stockCount: 52,
      stockLevel: 'high',
      retailPriceInr: 37.5,
      mrpInr: 42.8,
      discountPercentage: 12,
      phone: '+91 253 257 8891',
      hours: 'Open until 11:00 PM',
      isPartner: true
    },
    {
      vendorId: 'vend-nashik-03',
      vendorName: 'Apollo Pharmacy - Nashik Road',
      area: 'Opp. Railway Station, Nashik Road',
      distanceKm: 4.1,
      inStock: true,
      stockCount: 20,
      stockLevel: 'high',
      retailPriceInr: 39.0,
      mrpInr: 42.8,
      discountPercentage: 9,
      phone: '+91 253 246 1120',
      hours: 'Open until 10:30 PM'
    },
    {
      vendorId: 'vend-nashik-06',
      vendorName: 'Godavari Super Chemist',
      area: 'Indira Nagar, Nashik',
      distanceKm: 4.9,
      inStock: false,
      stockCount: 0,
      stockLevel: 'out_of_stock',
      retailPriceInr: 38.0,
      mrpInr: 42.8,
      discountPercentage: 11,
      phone: '+91 253 232 6677',
      hours: 'Open until 9:30 PM'
    }
  ],
  'demo-alt-04': [
    {
      vendorId: 'vend-nashik-05',
      vendorName: 'Wellness Forever',
      area: 'Mahatma Nagar, Nashik',
      distanceKm: 2.4,
      inStock: true,
      stockCount: 28,
      stockLevel: 'high',
      retailPriceInr: 142.0,
      mrpInr: 168.0,
      discountPercentage: 15,
      phone: '+91 253 235 9011',
      hours: 'Open 24/7',
      is24Hours: true,
      isPartner: true
    },
    {
      vendorId: 'vend-nashik-02',
      vendorName: 'Lifeline Pharmacy Hub',
      area: 'Canada Corner, Nashik',
      distanceKm: 2.6,
      inStock: true,
      stockCount: 16,
      stockLevel: 'high',
      retailPriceInr: 145.0,
      mrpInr: 168.0,
      discountPercentage: 14,
      phone: '+91 253 231 4455',
      hours: 'Open 24/7',
      is24Hours: true,
      isPartner: true
    },
    {
      vendorId: 'vend-nashik-01',
      vendorName: 'Nashik Medicos & Surgicals',
      area: 'College Road, Nashik',
      distanceKm: 2.8,
      inStock: true,
      stockCount: 1,
      stockLevel: 'low',
      retailPriceInr: 148.0,
      mrpInr: 168.0,
      discountPercentage: 12,
      phone: '+91 253 257 8891',
      hours: 'Open until 11:00 PM',
      isPartner: true
    },
    {
      vendorId: 'vend-nashik-03',
      vendorName: 'Apollo Pharmacy - Nashik Road',
      area: 'Opp. Railway Station, Nashik Road',
      distanceKm: 4.1,
      inStock: false,
      stockCount: 0,
      stockLevel: 'out_of_stock',
      retailPriceInr: 150.0,
      mrpInr: 168.0,
      discountPercentage: 11,
      phone: '+91 253 246 1120',
      hours: 'Open until 10:30 PM'
    }
  ],
  'med-003': [
    {
      vendorId: 'vend-nashik-02',
      vendorName: 'Lifeline Pharmacy Hub',
      area: 'Canada Corner, Nashik',
      distanceKm: 0.8,
      inStock: true,
      stockCount: 24,
      stockLevel: 'high',
      retailPriceInr: 132.0,
      mrpInr: 148.0,
      discountPercentage: 11,
      phone: '+91 253 231 4455',
      hours: 'Open 24/7',
      is24Hours: true,
      isPartner: true
    },
    {
      vendorId: 'vend-nashik-01',
      vendorName: 'Nashik Medicos & Surgicals',
      area: 'College Road, Nashik',
      distanceKm: 1.2,
      inStock: true,
      stockCount: 15,
      stockLevel: 'high',
      retailPriceInr: 135.0,
      mrpInr: 148.0,
      discountPercentage: 9,
      phone: '+91 253 257 8891',
      hours: 'Open until 11:00 PM',
      isPartner: true
    },
    {
      vendorId: 'vend-nashik-05',
      vendorName: 'Wellness Forever',
      area: 'Mahatma Nagar, Nashik',
      distanceKm: 2.1,
      inStock: true,
      stockCount: 10,
      stockLevel: 'high',
      retailPriceInr: 138.0,
      mrpInr: 148.0,
      discountPercentage: 7,
      phone: '+91 253 235 9011',
      hours: 'Open 24/7',
      is24Hours: true,
      isPartner: true
    }
  ],
  'med-002': [
    {
      vendorId: 'vend-nashik-03',
      vendorName: 'Apollo Pharmacy - Nashik Road',
      area: 'Opp. Railway Station, Nashik Road',
      distanceKm: 1.5,
      inStock: true,
      stockCount: 14,
      stockLevel: 'high',
      retailPriceInr: 155.0,
      mrpInr: 172.0,
      discountPercentage: 10,
      phone: '+91 253 246 1120',
      hours: 'Open until 10:30 PM'
    },
    {
      vendorId: 'vend-nashik-02',
      vendorName: 'Lifeline Pharmacy Hub',
      area: 'Canada Corner, Nashik',
      distanceKm: 2.4,
      inStock: true,
      stockCount: 18,
      stockLevel: 'high',
      retailPriceInr: 158.0,
      mrpInr: 172.0,
      discountPercentage: 8,
      phone: '+91 253 231 4455',
      hours: 'Open 24/7',
      is24Hours: true,
      isPartner: true
    },
    {
      vendorId: 'vend-nashik-04',
      vendorName: 'Shree Ganesh Chemist',
      area: 'Panchavati Karanja, Nashik',
      distanceKm: 3.8,
      inStock: false,
      stockCount: 0,
      stockLevel: 'out_of_stock',
      retailPriceInr: 160.0,
      mrpInr: 172.0,
      discountPercentage: 7,
      phone: '+91 253 251 7733',
      hours: 'Open until 10:00 PM'
    }
  ]
};

// Fallback vendor list generator for any arbitrary medicine ID
const getLocalVendorsForMedicine = (medicineId: string, mrp: number): PharmacyVendorStock[] => {
  if (PHARMACY_VENDOR_REGISTRY[medicineId]) {
    return PHARMACY_VENDOR_REGISTRY[medicineId];
  }
  return [
    {
      vendorId: 'vend-nashik-01',
      vendorName: 'Nashik Medicos & Surgicals',
      area: 'College Road, Nashik',
      distanceKm: 1.2,
      inStock: true,
      stockCount: 15,
      stockLevel: 'high',
      retailPriceInr: Math.round(mrp * 0.9),
      mrpInr: mrp,
      discountPercentage: 10,
      phone: '+91 253 257 8891',
      hours: 'Open until 11:00 PM',
      isPartner: true
    },
    {
      vendorId: 'vend-nashik-02',
      vendorName: 'Lifeline Pharmacy Hub',
      area: 'Canada Corner, Nashik',
      distanceKm: 2.4,
      inStock: true,
      stockCount: 8,
      stockLevel: 'high',
      retailPriceInr: Math.round(mrp * 0.92),
      mrpInr: mrp,
      discountPercentage: 8,
      phone: '+91 253 231 4455',
      hours: 'Open 24/7',
      is24Hours: true,
      isPartner: true
    },
    {
      vendorId: 'vend-nashik-04',
      vendorName: 'Shree Ganesh Chemist',
      area: 'Panchavati Karanja, Nashik',
      distanceKm: 3.8,
      inStock: false,
      stockCount: 0,
      stockLevel: 'out_of_stock',
      retailPriceInr: Math.round(mrp * 0.95),
      mrpInr: mrp,
      discountPercentage: 5,
      phone: '+91 253 251 7733',
      hours: 'Open until 10:00 PM'
    }
  ];
};

// Hardcoded therapeutic alternatives for demonstration purposes
const DEMO_THERAPEUTIC_ALTERNATIVES: MedicineEntity[] = [
  {
    id: 'demo-alt-01',
    brandName: 'Ceftum 500',
    genericName: 'Cefuroxime Axetil 500mg',
    manufacturer: 'GlaxoSmithKline Pharmaceuticals Ltd',
    strength: '500mg',
    dosageForm: 'Tablet',
    routeOfAdministration: 'Oral',
    category: 'Cephalosporin Antibiotic',
    mappingStatus: 'approved',
    isPrescriptionRequired: true,
    packSize: 'Pack of 10 tablets',
    standardMrpInr: 495.0,
    ingredients: [{ id: 'ing-demo-01', name: 'Cefuroxime Axetil', strength: '500mg', unit: 'mg' }]
  },
  {
    id: 'demo-alt-02',
    brandName: 'Azithral 500',
    genericName: 'Azithromycin 500mg',
    manufacturer: 'Alembic Pharmaceuticals Ltd',
    strength: '500mg',
    dosageForm: 'Tablet',
    routeOfAdministration: 'Oral',
    category: 'Macrolide Antibiotic',
    mappingStatus: 'approved',
    isPrescriptionRequired: true,
    packSize: 'Pack of 5 tablets',
    standardMrpInr: 119.5,
    ingredients: [{ id: 'ing-demo-02', name: 'Azithromycin', strength: '500mg', unit: 'mg' }]
  },
  {
    id: 'demo-alt-03',
    brandName: 'Ciplox 500',
    genericName: 'Ciprofloxacin 500mg',
    manufacturer: 'Cipla Ltd',
    strength: '500mg',
    dosageForm: 'Tablet',
    routeOfAdministration: 'Oral',
    category: 'Fluoroquinolone Antibiotic',
    mappingStatus: 'approved',
    isPrescriptionRequired: true,
    packSize: 'Pack of 10 tablets',
    standardMrpInr: 42.8,
    ingredients: [{ id: 'ing-demo-03', name: 'Ciprofloxacin Hydrochloride', strength: '500mg', unit: 'mg' }]
  },
  {
    id: 'demo-alt-04',
    brandName: 'Rablet 20',
    genericName: 'Rabeprazole 20mg',
    manufacturer: 'Lupin Ltd',
    strength: '20mg',
    dosageForm: 'Tablet',
    routeOfAdministration: 'Oral',
    category: 'Proton Pump Inhibitor (PPI)',
    mappingStatus: 'approved',
    isPrescriptionRequired: true,
    packSize: 'Pack of 15 tablets',
    standardMrpInr: 168.0,
    ingredients: [{ id: 'ing-demo-04', name: 'Rabeprazole Sodium', strength: '20mg', unit: 'mg' }]
  }
];

// Helper to determine if an alternative is same generic / active ingredient bioequivalent
export const isSameGenericAlternative = (source: MedicineEntity, candidate: MedicineEntity): boolean => {
  // 1. Direct mapping check from catalog data
  const explicitMapping = INITIAL_MAPPINGS.find(
    (m) =>
      (m.sourceMedicineId === source.id && m.targetMedicineId === candidate.id) ||
      (m.sourceMedicineId === candidate.id && m.targetMedicineId === source.id)
  );
  if (explicitMapping) {
    return explicitMapping.classification === 'same_active_ingredient';
  }

  // 2. Generic name token normalization check
  const cleanGeneric = (name: string) =>
    name
      .toLowerCase()
      .replace(/\b\d+(\.\d+)?\s*(mg|mcg|g|ml|iu)\b/gi, '')
      .replace(/[+&/,]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const sourceClean = cleanGeneric(source.genericName);
  const candClean = cleanGeneric(candidate.genericName);

  if (sourceClean === candClean && sourceClean.length > 3) {
    return true;
  }

  // 3. Ingredient match check if both have ingredients
  if (source.ingredients?.length && candidate.ingredients?.length) {
    const sourceIngNames = source.ingredients.map((i) => i.name.toLowerCase().trim()).sort();
    const candIngNames = candidate.ingredients.map((i) => i.name.toLowerCase().trim()).sort();
    if (sourceIngNames.length === candIngNames.length) {
      const allMatch = sourceIngNames.every((name, idx) => {
        const cName = candIngNames[idx];
        return name.includes(cName) || cName.includes(name);
      });
      if (allMatch) return true;
    }
  }

  return false;
};

// Retrieve nearest vendor distance for a medicine
export const getMinDistanceKm = (alt: MedicineEntity): number => {
  const vendors = getLocalVendorsForMedicine(alt.id, alt.standardMrpInr);
  const inStockVendors = vendors.filter((v) => v.inStock);
  const targets = inStockVendors.length > 0 ? inStockVendors : vendors;
  if (targets.length === 0) return 99;
  return Math.min(...targets.map((v) => v.distanceKm));
};

// Retrieve lowest retail price across local vendor network
export const getLowestPriceInr = (alt: MedicineEntity): number => {
  const vendors = getLocalVendorsForMedicine(alt.id, alt.standardMrpInr);
  const inStockVendors = vendors.filter((v) => v.inStock);
  if (inStockVendors.length > 0) {
    return Math.min(...inStockVendors.map((v) => v.retailPriceInr));
  }
  return alt.standardMrpInr;
};

// Compute complete alternatives pool (bioequivalent generic matches + therapeutic alternatives)
export const getAlternativesForMedicine = (sourceMed: MedicineEntity): MedicineEntity[] => {
  // 1. Same-generic candidates from catalog
  const sameGenericFromCatalog = INITIAL_MEDICINES.filter(
    (m) => m.id !== sourceMed.id && isSameGenericAlternative(sourceMed, m)
  );

  let sameGenericList = [...sameGenericFromCatalog];

  // If no same-generic found in INITIAL_MEDICINES, synthesize bioequivalent matches for rich demo
  if (sameGenericList.length === 0) {
    const isAmoxClav =
      sourceMed.genericName.toLowerCase().includes('amox') &&
      (sourceMed.genericName.toLowerCase().includes('clav') || sourceMed.brandName.toLowerCase().includes('augmentin'));

    if (isAmoxClav) {
      const mox = INITIAL_MEDICINES.find((m) => m.id === 'med-003');
      const amox = INITIAL_MEDICINES.find((m) => m.id === 'med-002');
      if (mox && mox.id !== sourceMed.id && !sameGenericList.some((m) => m.id === mox.id)) sameGenericList.push(mox);
      if (amox && amox.id !== sourceMed.id && !sameGenericList.some((m) => m.id === amox.id)) sameGenericList.push(amox);
    } else {
      sameGenericList.push({
        id: `gen-alt-${sourceMed.id}-01`,
        brandName: `${sourceMed.brandName.split(' ')[0]} Generic Equivalent`,
        genericName: sourceMed.genericName,
        manufacturer: 'Cipla Ltd (Generic Division)',
        strength: sourceMed.strength,
        dosageForm: sourceMed.dosageForm,
        routeOfAdministration: sourceMed.routeOfAdministration,
        category: sourceMed.category,
        mappingStatus: 'approved',
        isPrescriptionRequired: sourceMed.isPrescriptionRequired,
        packSize: sourceMed.packSize,
        standardMrpInr: Math.round(sourceMed.standardMrpInr * 0.72),
        ingredients: sourceMed.ingredients
      });
    }
  }

  // 2. Therapeutic alternatives (different active molecule, similar clinical indication)
  const therapeuticList = DEMO_THERAPEUTIC_ALTERNATIVES.filter(
    (alt) => alt.id !== sourceMed.id && !sameGenericList.some((sg) => sg.id === alt.id)
  );

  return [...sameGenericList, ...therapeuticList];
};

export const MedicineComparisonView: React.FC<MedicineComparisonViewProps> = ({
  sourceMedicine,
  onBack,
  onRequestReview
}) => {
  const { t } = useTranslation();
  const janAushadhiEquiv = useMemo(
    () => findJanAushadhiEquivalent(sourceMedicine.genericName),
    [sourceMedicine.genericName]
  );
  const [selectedAlternative, setSelectedAlternative] = useState<MedicineEntity | null>(null);
  const [expandedSafety, setExpandedSafety] = useState<Record<string, boolean>>({});
  const [expandedInventory, setExpandedInventory] = useState<Record<string, boolean>>({
    'demo-alt-01': true // Expand first alternative's inventory by default for instant demonstration
  });
  const [queryingInventory, setQueryingInventory] = useState<Record<string, boolean>>({});
  const [inventoryLastChecked, setInventoryLastChecked] = useState<Record<string, string>>({
    'demo-alt-01': '5 mins ago'
  });
  const [reservedPacks, setReservedPacks] = useState<Record<string, string>>({});
  const [vendorFilter, setVendorFilter] = useState<Record<string, 'all' | 'in_stock'>>({});
  const [globalQuerying, setGlobalQuerying] = useState<boolean>(false);

  // Phase 5 State: Live GPS, Interactive Map, Real-Time SSE, and SMS Notification Toast
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [showMapView, setShowMapView] = useState<boolean>(false);
  const [sseConnected, setSseConnected] = useState<boolean>(false);
  const [liveStockAlert, setLiveStockAlert] = useState<string | null>(null);
  const [smsNotificationToast, setSmsNotificationToast] = useState<{
    code: string;
    phone: string;
    pharmacy: string;
    text: string;
  } | null>(null);

  // Dynamic filter state
  const [sameGenericOnly, setSameGenericOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'default' | 'price_asc' | 'distance_asc'>('default');

  // Real-Time SSE EventSource listener
  useEffect(() => {
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('http://localhost:3001/api/v1/vendors/stream');
      eventSource.onopen = () => setSseConnected(true);
      eventSource.addEventListener('OFFER_UPDATED', (e: MessageEvent) => {
        try {
          const offer = JSON.parse(e.data);
          setLiveStockAlert(
            `Live Update: ${offer.vendorName} updated stock for ${offer.packSize} to ${offer.stockCount} units (₹${Number(offer.priceInr).toFixed(2)})`
          );
          setTimeout(() => setLiveStockAlert(null), 6000);
        } catch {
          // Ignore parse errors
        }
      });
      eventSource.onerror = () => setSseConnected(false);
    } catch {
      setSseConnected(false);
    }

    return () => {
      eventSource?.close();
    };
  }, []);

  // Live GPS Locator
  const handleDetectLocation = async () => {
    setIsLocating(true);
    try {
      const pos = await requestUserPosition();
      setUserLocation(pos);
    } catch {
      setUserLocation(DEFAULT_NASHIK_CENTER);
    } finally {
      setIsLocating(false);
    }
  };

  // Compute full pool of alternatives
  const allAlternatives = useMemo(() => {
    return getAlternativesForMedicine(sourceMedicine);
  }, [sourceMedicine]);

  // Count available same-generic alternatives
  const sameGenericCount = useMemo(() => {
    return allAlternatives.filter((alt) => isSameGenericAlternative(sourceMedicine, alt)).length;
  }, [allAlternatives, sourceMedicine]);

  // Dynamically filter and sort alternatives based on filter bar state
  const displayedAlternatives = useMemo(() => {
    let list = [...allAlternatives];

    if (sameGenericOnly) {
      list = list.filter((alt) => isSameGenericAlternative(sourceMedicine, alt));
    }

    if (sortBy === 'price_asc') {
      list.sort((a, b) => getLowestPriceInr(a) - getLowestPriceInr(b));
    } else if (sortBy === 'distance_asc') {
      list.sort((a, b) => {
        if (userLocation) {
          const p1 = (PHARMACY_VENDOR_REGISTRY[a.id] || [])[0];
          const p2 = (PHARMACY_VENDOR_REGISTRY[b.id] || [])[0];
          const d1 = p1 ? calculateHaversineDistance(userLocation, DEFAULT_NASHIK_CENTER) : 99;
          const d2 = p2 ? calculateHaversineDistance(userLocation, DEFAULT_NASHIK_CENTER) : 99;
          return d1 - d2;
        }
        return getMinDistanceKm(a) - getMinDistanceKm(b);
      });
    }

    return list;
  }, [allAlternatives, sameGenericOnly, sortBy, sourceMedicine, userLocation]);

  const activeFilterCount = (sameGenericOnly ? 1 : 0) + (sortBy !== 'default' ? 1 : 0);

  const handleResetFilters = () => {
    setSameGenericOnly(false);
    setSortBy('default');
  };

  const toggleSafety = (id: string) => {
    setExpandedSafety((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleInventory = (id: string) => {
    setExpandedInventory((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleCheckInventory = (altId: string) => {
    setQueryingInventory((prev) => ({ ...prev, [altId]: true }));
    setExpandedInventory((prev) => ({ ...prev, [altId]: true }));

    setTimeout(() => {
      setQueryingInventory((prev) => ({ ...prev, [altId]: false }));
      setInventoryLastChecked((prev) => ({ ...prev, [altId]: 'Just now' }));
    }, 700);
  };

  const handleCheckAllInventory = () => {
    setGlobalQuerying(true);
    displayedAlternatives.forEach((alt, idx) => {
      setQueryingInventory((prev) => ({ ...prev, [alt.id]: true }));
      setExpandedInventory((prev) => ({ ...prev, [alt.id]: true }));
      setTimeout(() => {
        setQueryingInventory((prev) => ({ ...prev, [alt.id]: false }));
        setInventoryLastChecked((prev) => ({ ...prev, [alt.id]: 'Just now' }));
        if (idx === displayedAlternatives.length - 1) {
          setGlobalQuerying(false);
        }
      }, 550 + idx * 150);
    });
  };

  const handleReserve = async (altId: string, vendorId: string) => {
    const key = `${altId}-${vendorId}`;
    if (reservedPacks[key]) {
      setReservedPacks((prev) => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    } else {
      const rsvCode = `RSV-${Math.floor(1000 + Math.random() * 9000)}`;
      setReservedPacks((prev) => ({ ...prev, [key]: rsvCode }));

      // Dispatch SMS Confirmation
      const targetAlt = allAlternatives.find((a) => a.id === altId) || sourceMedicine;
      const vendorList = PHARMACY_VENDOR_REGISTRY[altId] || PHARMACY_VENDOR_REGISTRY['demo-alt-01'] || [];
      const vendor = vendorList.find((v) => v.vendorId === vendorId);
      const pharmacyName = vendor ? vendor.vendorName : 'Lifeline Pharmacy Hub';
      const price = vendor ? vendor.retailPriceInr : 100;

      try {
        const res = await fetch('http://localhost:3001/api/v1/notifications/reservation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: '9822014589',
            reservationCode: rsvCode,
            medicineName: targetAlt.brandName,
            pharmacyName,
            priceInr: price
          })
        });

        if (res.ok) {
          const resp = await res.json();
          setSmsNotificationToast({
            code: rsvCode,
            phone: resp.recipient,
            pharmacy: pharmacyName,
            text: resp.previewText
          });
          setTimeout(() => setSmsNotificationToast(null), 8000);
        }
      } catch {
        // Fallback preview
        setSmsNotificationToast({
          code: rsvCode,
          phone: '+91 98****4589',
          pharmacy: pharmacyName,
          text: `[AltMedi Care] Confirmed: Rx reservation #${rsvCode} for ${targetAlt.brandName} at ${pharmacyName}. Pickup within 24h.`
        });
        setTimeout(() => setSmsNotificationToast(null), 8000);
      }
    }
  };

  const handleConsult = (alt: MedicineEntity) => {
    if (onRequestReview) {
      onRequestReview(sourceMedicine, alt);
    } else {
      alert(`Consultation requested for ${alt.brandName} as a therapeutic alternative to ${sourceMedicine.brandName}.`);
    }
  };

  return (
    <div id="medicine-comparison-view" className="space-y-5 max-w-3xl mx-auto pb-8">
      {/* Real-time SSE Stock Notification Alert */}
      {liveStockAlert && (
        <div className="bg-emerald-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md flex items-center justify-between animate-bounce">
          <div className="flex items-center space-x-2">
            <Radio className="w-4 h-4 animate-pulse text-emerald-200" />
            <span>{liveStockAlert}</span>
          </div>
          <span className="text-[10px] bg-emerald-800 px-2 py-0.5 rounded font-bold uppercase">SSE Push</span>
        </div>
      )}

      {/* SMS Reservation Dispatch Toast */}
      {smsNotificationToast && (
        <div className="bg-slate-900 border border-emerald-500/40 text-white rounded-2xl p-3.5 shadow-xl space-y-1.5 transition-all">
          <div className="flex items-center justify-between text-xs font-bold">
            <div className="flex items-center space-x-2 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>TRAI-Compliant SMS Confirmation Dispatched</span>
            </div>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
              #{smsNotificationToast.code}
            </span>
          </div>
          <p className="text-[11px] text-slate-300 font-mono bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            {smsNotificationToast.text}
          </p>
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>Sent to: {smsNotificationToast.phone}</span>
            <span>Reserved at: {smsNotificationToast.pharmacy}</span>
          </div>
        </div>
      )}

      {/* Top Bar with Back Button & Real-time Live Badge */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <button
          id="btn-back-prescription"
          onClick={onBack}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Prescription / Search</span>
        </button>

        <div className="flex items-center space-x-2">
          {/* SSE Live Status Indicator */}
          <span className={`inline-flex items-center space-x-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border ${
            sseConnected
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}>
            <span className={`w-2 h-2 rounded-full ${sseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            <span>{sseConnected ? 'Live Stock Stream Active' : 'Standby Mode'}</span>
          </span>

          <span className="text-[11px] font-semibold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
            Clinical Decision View
          </span>
        </div>
      </div>

      {/* Source Prescribed Medicine Card */}
      <div id="source-medicine-card" className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                Prescribed Target
              </span>
              {sourceMedicine.isPrescriptionRequired && (
                <span className="text-[10px] font-semibold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  Schedule H (Rx Required)
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold text-slate-900">{sourceMedicine.brandName}</h1>
            <p className="text-xs text-slate-600 font-medium mt-0.5">{sourceMedicine.genericName}</p>
            <div className="flex items-center space-x-1 text-xs text-slate-500 mt-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Mfg: {sourceMedicine.manufacturer}</span>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-left sm:text-right min-w-[140px]">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Standard MRP</span>
            <div className="text-xl font-black text-slate-900">₹{sourceMedicine.standardMrpInr.toFixed(2)}</div>
            <span className="text-[11px] text-slate-500 block">{sourceMedicine.packSize}</span>
          </div>
        </div>

        {/* Source Medicine Clinical Specifications */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
          <div className="bg-slate-50 p-2 rounded-lg">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Strength</span>
            <span className="font-semibold text-slate-800">{sourceMedicine.strength}</span>
          </div>
          <div className="bg-slate-50 p-2 rounded-lg">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Form & Route</span>
            <span className="font-semibold text-slate-800">
              {sourceMedicine.dosageForm} ({sourceMedicine.routeOfAdministration})
            </span>
          </div>
          <div className="bg-slate-50 p-2 rounded-lg">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Class</span>
            <span className="font-semibold text-slate-800">{sourceMedicine.category}</span>
          </div>
          <div className="bg-slate-50 p-2 rounded-lg">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Status</span>
            <span className="font-semibold text-emerald-700">Verified Active</span>
          </div>
        </div>
      </div>

      {/* Jan Aushadhi PMBJP Government Price Comparison Badge */}
      {janAushadhiEquiv && (
        <div className="my-1">
          <JanAushadhiBadge
            item={janAushadhiEquiv}
            currentBrandPrice={sourceMedicine.standardMrpInr}
          />
        </div>
      )}

      {/* Local Pharmacy Network Query Banner with GPS & Map Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0">
            <Store className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
              <span>Nashik Local Pharmacy Inventory</span>
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                Live Stock Feed
              </span>
              {userLocation && (
                <span className="text-[10px] font-semibold text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                  GPS Active
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-500 flex items-center space-x-1 mt-0.5">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span>
                {userLocation
                  ? 'Calculating live Haversine distances from your current GPS position'
                  : 'College Road, Canada Corner, Nashik Road, Panchavati (5 km radius)'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {/* GPS Location Button */}
          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={isLocating}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              userLocation
                ? 'bg-blue-50 text-blue-700 border-blue-300'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {isLocating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
            ) : (
              <LocateFixed className="w-3.5 h-3.5 text-blue-600" />
            )}
            <span>{userLocation ? 'GPS Calibrated' : 'Use GPS'}</span>
          </button>

          {/* Interactive Map View Toggle */}
          <button
            type="button"
            onClick={() => setShowMapView(!showMapView)}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              showMapView
                ? 'bg-teal-700 text-white border-teal-800'
                : 'bg-white text-teal-800 border-teal-300 hover:bg-teal-50'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>{showMapView ? 'Close Map' : 'Map View'}</span>
          </button>

          {/* Scan all vendors */}
          <button
            type="button"
            id="btn-check-all-inventory"
            onClick={handleCheckAllInventory}
            disabled={globalQuerying}
            className="inline-flex items-center justify-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white text-xs font-semibold shadow-2xs transition-colors shrink-0"
          >
            {globalQuerying ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-400" />
                <span>Scanning...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Live</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Interactive Pharmacy Map (Rendered when toggled) */}
      {showMapView && (
        <div className="animate-in fade-in duration-200">
          <PharmacyInteractiveMap
            userLocation={userLocation}
            onDetectLocation={handleDetectLocation}
            isLocating={isLocating}
            selectedMedicineName={sourceMedicine.brandName}
            onReserveAtPharmacy={(pharmName) => {
              const alt = displayedAlternatives[0] || sourceMedicine;
              handleReserve(alt.id, 'vend-nashik-02');
            }}
          />
        </div>
      )}

      {/* Dynamic Filter Bar */}
      <div
        id="medicine-filter-bar"
        className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs space-y-3"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-md bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold text-slate-900">Filter & Sort Alternatives</span>
            {activeFilterCount > 0 && (
              <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full border border-teal-200">
                {activeFilterCount} Active
              </span>
            )}
          </div>

          {activeFilterCount > 0 && (
            <button
              type="button"
              id="filter-btn-reset"
              onClick={handleResetFilters}
              className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 flex items-center space-x-1 transition-colors self-start sm:self-auto cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Filter Toggle Buttons Group */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
          {/* 1. Same Generic Only Toggle */}
          <button
            type="button"
            id="filter-btn-same-generic"
            onClick={() => setSameGenericOnly((prev) => !prev)}
            aria-pressed={sameGenericOnly}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              sameGenericOnly
                ? 'bg-teal-700 text-white border-teal-800 shadow-2xs ring-2 ring-teal-600/20'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            <FlaskConical className={`w-3.5 h-3.5 ${sameGenericOnly ? 'text-white' : 'text-teal-600'}`} />
            <span>Same Generic Only</span>
            {sameGenericOnly ? (
              <Check className="w-3 h-3 text-teal-100" />
            ) : (
              <span className="text-[10px] text-slate-400 font-normal">({sameGenericCount})</span>
            )}
          </button>

          <div className="h-4 w-px bg-slate-200 hidden sm:block mx-0.5" />

          {/* 2. Price (Low to High) Toggle */}
          <button
            type="button"
            id="filter-btn-price-low"
            onClick={() => setSortBy((curr) => (curr === 'price_asc' ? 'default' : 'price_asc'))}
            aria-pressed={sortBy === 'price_asc'}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              sortBy === 'price_asc'
                ? 'bg-emerald-700 text-white border-emerald-800 shadow-2xs ring-2 ring-emerald-600/20'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            <ArrowDownUp className={`w-3.5 h-3.5 ${sortBy === 'price_asc' ? 'text-white' : 'text-emerald-600'}`} />
            <span>Price (Low to High)</span>
            {sortBy === 'price_asc' && <Check className="w-3 h-3 text-emerald-100" />}
          </button>

          {/* 3. Distance from me Toggle */}
          <button
            type="button"
            id="filter-btn-distance"
            onClick={() => setSortBy((curr) => (curr === 'distance_asc' ? 'default' : 'distance_asc'))}
            aria-pressed={sortBy === 'distance_asc'}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              sortBy === 'distance_asc'
                ? 'bg-blue-700 text-white border-blue-800 shadow-2xs ring-2 ring-blue-600/20'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            <MapPin className={`w-3.5 h-3.5 ${sortBy === 'distance_asc' ? 'text-white' : 'text-blue-600'}`} />
            <span>Distance from me</span>
            {sortBy === 'distance_asc' && <Check className="w-3 h-3 text-blue-100" />}
          </button>
        </div>

        {/* Dynamic Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 text-[11px] text-slate-500 pt-0.5">
          <div className="flex items-center space-x-1.5 flex-wrap">
            <span>
              Showing <strong className="text-slate-800">{displayedAlternatives.length}</strong> of {allAlternatives.length} available alternatives
            </span>
            {sameGenericOnly && (
              <span className="text-[10px] font-semibold text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                Exact Generic Bioequivalent
              </span>
            )}
            {sortBy === 'price_asc' && (
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                Sorted by Lowest Retail Price
              </span>
            )}
            {sortBy === 'distance_asc' && (
              <span className="text-[10px] font-semibold text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                Sorted by Distance (Closest Chemist)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Alternatives List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Pill className="w-4 h-4 text-teal-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Matching Alternatives ({displayedAlternatives.length})
            </h2>
          </div>
          <span className="text-[11px] text-slate-500">
            {sameGenericOnly ? 'Direct Bioequivalent Generic Substitutes' : 'Generic & Therapeutic Catalog'}
          </span>
        </div>

        {displayedAlternatives.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Filter className="w-5 h-5" />
            </div>
            <div className="text-sm font-bold text-slate-800">No alternatives match the selected filter</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No direct same-generic alternatives matched under the current criteria. Reset your filters to view all available therapeutic alternatives.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-teal-700 text-white text-xs font-semibold hover:bg-teal-800 transition-colors shadow-2xs cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedAlternatives.map((alt) => {
              const priceDifference = alt.standardMrpInr - sourceMedicine.standardMrpInr;
              const isLowerPrice = priceDifference < 0;
              const safety = getAlternativeSafetyProfile(alt);
              const isSafetyExpanded = !!expandedSafety[alt.id];
              const isSameGeneric = isSameGenericAlternative(sourceMedicine, alt);

              // Local Pharmacy Vendors data
              const vendors = getLocalVendorsForMedicine(alt.id, alt.standardMrpInr);
              const inStockCount = vendors.filter((v) => v.inStock).length;
              const lowestPrice = getLowestPriceInr(alt);
              const nearestDistanceKm = getMinDistanceKm(alt);
              const isInventoryExpanded = !!expandedInventory[alt.id];
              const isQuerying = !!queryingInventory[alt.id];
              const hasQueried = Boolean(inventoryLastChecked[alt.id]);

              const currentFilter = vendorFilter[alt.id] || 'all';
              const displayedVendors = currentFilter === 'in_stock' ? vendors.filter((v) => v.inStock) : vendors;

              return (
                <div
                  key={alt.id}
                  id={`therapeutic-item-${alt.id}`}
                  className="bg-white rounded-xl border border-slate-200 hover:border-teal-400 p-4 shadow-2xs transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        {isSameGeneric ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-900 border border-teal-200">
                            <FlaskConical className="w-3 h-3 text-teal-700" />
                            <span>Same Generic (Bioequivalent)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                            Therapeutic Alternative
                          </span>
                        )}
                        <span className="text-xs text-slate-500 font-medium">{alt.category}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-1">{alt.brandName}</h3>
                      <p className="text-xs text-slate-600">{alt.genericName}</p>
                      <p className="text-xs text-slate-500 mt-0.5">Mfg: {alt.manufacturer}</p>
                    </div>

                    <div className="text-left sm:text-right min-w-[130px]">
                      <div className="text-lg font-bold text-slate-900">₹{alt.standardMrpInr.toFixed(2)}</div>
                      <span className="text-[11px] text-slate-500 block">{alt.packSize}</span>
                      {lowestPrice < alt.standardMrpInr && (
                        <div className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 inline-block mt-0.5">
                          Best retail: ₹{lowestPrice.toFixed(2)}
                        </div>
                      )}
                      {nearestDistanceKm < 99 && (
                        <div className="text-[11px] font-medium text-slate-600 flex items-center justify-start sm:justify-end space-x-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{nearestDistanceKm.toFixed(1)} km nearest chemist</span>
                        </div>
                      )}
                      {isLowerPrice ? (
                        <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded mt-1 border border-emerald-200">
                          <TrendingDown className="w-3 h-3 mr-0.5" />
                          ₹{Math.abs(priceDifference).toFixed(2)} less than prescribed
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 block mt-1">
                          +₹{priceDifference.toFixed(2)} variance
                        </span>
                      )}
                    </div>
                  </div>

                {/* Formulation Characteristics */}
                <div className="flex flex-wrap gap-2 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                    <strong>Strength:</strong> {alt.strength}
                  </span>
                  <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                    <strong>Form:</strong> {alt.dosageForm}
                  </span>
                  <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                    <strong>Route:</strong> {alt.routeOfAdministration}
                  </span>
                </div>

                {/* Pharmacy & Vendor Availability Section */}
                <div
                  id={`pharmacy-availability-${alt.id}`}
                  className="bg-slate-50/90 rounded-xl border border-slate-200 p-3.5 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center space-x-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          inStockCount > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        <Store className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <h4 className="text-xs font-bold text-slate-900">Local Pharmacy Availability</h4>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                              inStockCount > 0
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-rose-50 text-rose-800 border-rose-200'
                            }`}
                          >
                            {inStockCount > 0 ? `${inStockCount} of ${vendors.length} in stock` : 'Out of stock nearby'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {hasQueried
                            ? `Best local price: ₹${lowestPrice.toFixed(2)} (Verified ${inventoryLastChecked[alt.id] || 'just now'})`
                            : 'Click below to query live inventory at nearby pharmacies'}
                        </p>
                      </div>
                    </div>

                    {/* Action Controls: Check Local Inventory & Toggle */}
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        id={`btn-check-inventory-${alt.id}`}
                        onClick={() => handleCheckInventory(alt.id)}
                        disabled={isQuerying}
                        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 shadow-2xs transition-colors disabled:opacity-70"
                      >
                        {isQuerying ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                            <span>Querying Vendors...</span>
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Check Local Inventory</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        id={`btn-toggle-inventory-${alt.id}`}
                        onClick={() => toggleInventory(alt.id)}
                        className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-2xs transition-colors"
                        aria-expanded={isInventoryExpanded}
                      >
                        <span>{isInventoryExpanded ? 'Hide' : `Stores (${vendors.length})`}</span>
                        {isInventoryExpanded ? (
                          <ChevronUp className="w-3 h-3 text-slate-500" />
                        ) : (
                          <ChevronDown className="w-3 h-3 text-slate-500" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Simulated Query Loading State */}
                  {isQuerying && (
                    <div className="bg-white rounded-lg p-3.5 border border-emerald-200 shadow-2xs space-y-1.5 text-center">
                      <div className="flex items-center justify-center space-x-2 text-xs font-semibold text-emerald-800">
                        <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                        <span>Querying nearby pharmacy inventory in Nashik...</span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Pinging College Road, Canada Corner, Panchavati & Nashik Road vendors for live batch counts & retail prices
                      </p>
                    </div>
                  )}

                  {/* Detailed Vendor List */}
                  {isInventoryExpanded && !isQuerying && (
                    <div className="space-y-2 pt-2 border-t border-slate-200">
                      {/* Filter Tabs & Subtitle */}
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-slate-500 font-medium">Filter:</span>
                          <button
                            type="button"
                            onClick={() => setVendorFilter((prev) => ({ ...prev, [alt.id]: 'all' }))}
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                              currentFilter === 'all'
                                ? 'bg-slate-900 text-white'
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            All Vendors ({vendors.length})
                          </button>
                          <button
                            type="button"
                            onClick={() => setVendorFilter((prev) => ({ ...prev, [alt.id]: 'in_stock' }))}
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                              currentFilter === 'in_stock'
                                ? 'bg-emerald-700 text-white'
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            In Stock ({inStockCount})
                          </button>
                        </div>
                        <span className="text-[10px] text-slate-400">Within 5 km radius</span>
                      </div>

                      {/* Vendor Cards */}
                      <div className="space-y-2">
                        {displayedVendors.map((vendor) => {
                          const reserveKey = `${alt.id}-${vendor.vendorId}`;
                          const isReserved = !!reservedPacks[reserveKey];
                          const reservationCode = reservedPacks[reserveKey];

                          return (
                            <div
                              key={vendor.vendorId}
                              id={`vendor-item-${alt.id}-${vendor.vendorId}`}
                              className={`bg-white rounded-lg p-3 border transition-all ${
                                vendor.inStock
                                  ? 'border-slate-200 hover:border-emerald-300 shadow-2xs'
                                  : 'border-slate-200 opacity-75 bg-slate-50/60'
                              }`}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                                <div className="space-y-1">
                                  <div className="flex items-center space-x-1.5 flex-wrap">
                                    <span className="font-bold text-xs text-slate-900">{vendor.vendorName}</span>
                                    {vendor.isPartner && (
                                      <span className="text-[9px] font-bold bg-teal-50 text-teal-800 px-1.5 py-0.2 rounded border border-teal-200">
                                        Verified Chemist
                                      </span>
                                    )}
                                    {vendor.is24Hours && (
                                      <span className="text-[9px] font-bold bg-blue-50 text-blue-800 px-1.5 py-0.2 rounded border border-blue-200">
                                        24/7 Open
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center space-x-2 text-[11px] text-slate-500">
                                    <span className="flex items-center space-x-1">
                                      <MapPin className="w-3 h-3 text-slate-400" />
                                      <span>{vendor.area}</span>
                                    </span>
                                    <span>•</span>
                                    <span className="font-medium text-slate-700">{vendor.distanceKm} km away</span>
                                  </div>

                                  <div className="flex items-center space-x-2 text-[10px] text-slate-500">
                                    <span className="flex items-center space-x-1">
                                      <Clock className="w-3 h-3 text-slate-400" />
                                      <span>{vendor.hours}</span>
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center space-x-1">
                                      <Phone className="w-3 h-3 text-slate-400" />
                                      <span>{vendor.phone}</span>
                                    </span>
                                  </div>
                                </div>

                                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1">
                                  <div className="text-right">
                                    <div className="flex items-baseline space-x-1 sm:justify-end">
                                      <span className="text-sm font-bold text-slate-900">
                                        ₹{vendor.retailPriceInr.toFixed(2)}
                                      </span>
                                      {vendor.discountPercentage > 0 && (
                                        <span className="text-[10px] text-slate-400 line-through">
                                          ₹{vendor.mrpInr.toFixed(2)}
                                        </span>
                                      )}
                                    </div>
                                    {vendor.discountPercentage > 0 && (
                                      <span className="text-[10px] font-semibold text-emerald-700 block">
                                        {vendor.discountPercentage}% off MRP
                                      </span>
                                    )}
                                  </div>

                                  {/* Availability Status Badge */}
                                  <div>
                                    {vendor.stockLevel === 'high' && (
                                      <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                        <span>In Stock ({vendor.stockCount} packs)</span>
                                      </span>
                                    )}
                                    {vendor.stockLevel === 'low' && (
                                      <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                        <AlertCircle className="w-3 h-3 text-amber-600" />
                                        <span>Low Stock ({vendor.stockCount} left)</span>
                                      </span>
                                    )}
                                    {vendor.stockLevel === 'out_of_stock' && (
                                      <span className="inline-flex items-center space-x-1 text-[10px] font-semibold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                                        <XCircle className="w-3 h-3 text-rose-500" />
                                        <span>Out of Stock</span>
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Action Footer */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 mt-2 border-t border-slate-100 text-[11px]">
                                {isReserved ? (
                                  <div className="flex items-center space-x-1.5 text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 font-medium">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>
                                      Pack Held for 2 Hours (Pickup Code:{' '}
                                      <strong className="font-bold font-mono text-emerald-950">{reservationCode}</strong>)
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-slate-500">
                                    {vendor.inStock
                                      ? 'Available for counter pickup or home delivery'
                                      : 'Expected restock delivery tomorrow morning'}
                                  </span>
                                )}

                                <div className="flex items-center space-x-2 self-end sm:self-auto">
                                  <a
                                    href={`tel:${vendor.phone}`}
                                    className="inline-flex items-center space-x-1 text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-50 px-2 py-1 rounded border border-slate-200 transition-colors"
                                  >
                                    <Phone className="w-3 h-3 text-slate-500" />
                                    <span>Call Chemist</span>
                                  </a>

                                  {vendor.inStock && (
                                    <button
                                      type="button"
                                      id={`btn-reserve-${alt.id}-${vendor.vendorId}`}
                                      onClick={() => handleReserve(alt.id, vendor.vendorId)}
                                      className={`inline-flex items-center space-x-1 text-[11px] font-semibold px-2.5 py-1 rounded transition-colors ${
                                        isReserved
                                          ? 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                                          : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-2xs'
                                      }`}
                                    >
                                      <ShoppingBag className="w-3 h-3" />
                                      <span>{isReserved ? 'Cancel Hold' : 'Reserve Pack'}</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Safety Information Section */}
                <div
                  id={`safety-info-${alt.id}`}
                  className="bg-slate-50/90 rounded-xl border border-slate-200 p-3.5 space-y-3"
                >
                  {/* Safety Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-md bg-amber-100 flex items-center justify-center text-amber-800 shrink-0">
                        <ShieldAlert className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                          <span>Safety Information</span>
                          <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            Advisory
                          </span>
                        </h4>
                        <p className="text-[10px] text-slate-500">Allergy risks, cross-reactivity & side effects</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      id={`btn-toggle-safety-${alt.id}`}
                      onClick={() => toggleSafety(alt.id)}
                      className="inline-flex items-center space-x-1 text-[11px] font-semibold text-slate-700 hover:text-slate-900 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs hover:bg-slate-50 transition-colors"
                      aria-expanded={isSafetyExpanded}
                    >
                      <span>{isSafetyExpanded ? 'Less details' : 'Full safety details'}</span>
                      {isSafetyExpanded ? (
                        <ChevronUp className="w-3 h-3 text-slate-500" />
                      ) : (
                        <ChevronDown className="w-3 h-3 text-slate-500" />
                      )}
                    </button>
                  </div>

                  {/* Allergy Warnings Box */}
                  <div className="bg-white rounded-lg p-3 border border-rose-200 shadow-2xs space-y-2">
                    <div className="flex items-center space-x-1.5 text-rose-800 font-bold text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>Allergy Warning: {safety.allergyWarnings.primaryAlert}</span>
                    </div>
                    <p className="text-[11px] text-slate-700 leading-relaxed">
                      <strong className="font-semibold text-rose-950">Cross-Allergy Risks:</strong>{' '}
                      {safety.allergyWarnings.crossAllergies.join(', ')}
                    </p>
                    <div className="flex flex-wrap items-center gap-1 pt-1.5 border-t border-rose-100">
                      <span className="text-[10px] font-bold text-rose-950 uppercase tracking-wider mr-1">
                        Watch for reactions:
                      </span>
                      {safety.allergyWarnings.symptomsToWatch.map((symptom, sIdx) => (
                        <span
                          key={sIdx}
                          className="text-[10px] font-medium bg-rose-50 text-rose-800 px-2 py-0.5 rounded border border-rose-200"
                        >
                          {symptom}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Potential Side Effects Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {/* Common Side Effects */}
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase text-slate-600 flex items-center space-x-1">
                        <Info className="w-3 h-3 text-slate-500" />
                        <span>Potential Common Side Effects</span>
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {safety.sideEffects.common.map((effect, eIdx) => (
                          <span
                            key={eIdx}
                            className="text-[10px] font-medium bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200"
                          >
                            {effect}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Severe / Rare Adverse Reactions */}
                    <div className="bg-white p-2.5 rounded-lg border border-amber-200 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase text-amber-900 flex items-center space-x-1">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        <span>Severe / High-Risk Effects</span>
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {safety.sideEffects.rareSevere.map((effect, rIdx) => (
                          <span
                            key={rIdx}
                            className="text-[10px] font-medium bg-amber-50 text-amber-900 px-2 py-0.5 rounded border border-amber-200"
                          >
                            {effect}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Detailed Monograph & Contraindications (shown when expanded) */}
                  {isSafetyExpanded && (
                    <div className="pt-2 border-t border-slate-200 space-y-2 text-[11px]">
                      {safety.contraindications.length > 0 && (
                        <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                          <span className="font-bold text-slate-900 block text-[10px] uppercase tracking-wider">
                            Contraindications:
                          </span>
                          <ul className="list-disc list-inside text-slate-700 mt-1 space-y-0.5">
                            {safety.contraindications.map((item, cIdx) => (
                              <li key={cIdx}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="bg-teal-50/80 p-2.5 rounded-lg border border-teal-200 text-slate-800">
                        <span className="font-bold block text-[10px] uppercase tracking-wider text-teal-900">
                          Clinical Administration Guidance:
                        </span>
                        <p className="mt-0.5 text-slate-700 leading-relaxed">{safety.clinicalAdvisory}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                  <button
                    id={`btn-consult-${alt.id}`}
                    onClick={() => handleConsult(alt)}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-2xs transition-colors"
                  >
                    <FileCheck2 className="w-3.5 h-3.5" />
                    <span>Request Doctor / Pharmacist Confirmation</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  </div>
);
};

export default MedicineComparisonView;
