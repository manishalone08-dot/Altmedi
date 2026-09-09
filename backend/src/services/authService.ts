import { AuthUser } from '../types';

export const DEMO_USERS: Record<string, AuthUser> = {
  patient: {
    id: 'usr-patient-01',
    name: 'Rahul Deshmukh',
    email: 'rahul.deshmukh@gmail.com',
    phone: '9822014589',
    role: 'patient',
    tenantId: 'pilot-nashik-01',
    tenantName: 'Nashik Health & Pharmacy Network',
    abhaId: '91-4521-9082-1140',
    knownAllergies: ['Penicillin', 'Sulfa Antibiotics'],
    area: 'College Road, Nashik',
    isVerified: true,
    createdAt: '2026-08-10'
  },
  pharmacist: {
    id: 'usr-pharm-01',
    name: 'Pharm. Sunita Patil, M.Pharm',
    email: 'sunita.patil@nashikmedicos.com',
    phone: '9822055612',
    role: 'pharmacist',
    tenantId: 'pilot-nashik-01',
    tenantName: 'Nashik Medicos & Surgicals (Partner Chemist)',
    licenseNumber: 'MH-PH-84920',
    organization: 'Nashik Medicos & Surgicals',
    area: 'College Road, Nashik',
    isVerified: true,
    createdAt: '2026-07-15'
  },
  doctor: {
    id: 'usr-doc-01',
    name: 'Dr. Amit Kulkarni, MD',
    email: 'dr.amit@lifelinehospital.org',
    phone: '9822077890',
    role: 'doctor',
    tenantId: 'pilot-nashik-01',
    tenantName: 'Nashik Central Healthcare Network',
    licenseNumber: 'MMC-2014/05/1829',
    speciality: 'Internal Medicine & Therapeutics',
    organization: 'Lifeline Multispeciality Hospital',
    area: 'Canada Corner, Nashik',
    isVerified: true,
    createdAt: '2026-06-01'
  },
  vendor: {
    id: 'usr-vend-01',
    name: 'Rajesh Jain',
    email: 'rajesh@wellnessforever.in',
    phone: '9822033441',
    role: 'vendor',
    tenantId: 'pilot-nashik-01',
    tenantName: 'Wellness Forever Chemists Network',
    licenseNumber: '20B/21B-NK-77412',
    organization: 'Wellness Forever - Mahatma Nagar',
    area: 'Mahatma Nagar, Nashik',
    isVerified: true,
    createdAt: '2026-07-20'
  },
  tenant_admin: {
    id: 'usr-admin-01',
    name: 'Dr. Vikram Joshi',
    email: 'admin@nashikhealth.gov.in',
    phone: '9822099001',
    role: 'tenant_admin',
    tenantId: 'pilot-nashik-01',
    tenantName: 'Nashik Central Healthcare Network',
    organization: 'District Health Authority / AltMedi Pilot',
    area: 'Nashik District H.Q.',
    isVerified: true,
    createdAt: '2026-05-10'
  },
  platform_admin: {
    id: 'usr-plat-01',
    name: 'Pooja Sharma',
    email: 'pooja.sharma@altmedi.org',
    phone: '9822000112',
    role: 'platform_admin',
    tenantId: 'platform-root',
    tenantName: 'AltMedi Platform Operations',
    organization: 'AltMedi National Healthcare Tech',
    area: 'Central Operations Hub',
    isVerified: true,
    createdAt: '2026-01-01'
  }
};
