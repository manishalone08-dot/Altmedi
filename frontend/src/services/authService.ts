import { AuthUser, UserRole } from '../types';

const STORAGE_KEY = 'altmedi_auth_session';
const TOKEN_KEY = 'altmedi_auth_token';
const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api/v1';

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

export interface RegistrationFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  area: string;
  abhaId?: string;
  knownAllergies?: string[];
  licenseNumber?: string;
  organization?: string;
  speciality?: string;
}

export const getStoredAuthToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setStoredAuthToken = (token: string | null): void => {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // Ignore storage quota errors
  }
};

export const getStoredAuthUser = (): AuthUser | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
};

export const setStoredAuthUser = (user: AuthUser | null) => {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // Ignore storage quota errors
  }
};

export const loginWithDemoUser = async (role: UserRole): Promise<AuthUser> => {
  const fallbackUser = DEMO_USERS[role] || DEMO_USERS.patient;

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emailOrPhone: fallbackUser.email, role })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.token) setStoredAuthToken(data.token);
      if (data.user) {
        setStoredAuthUser(data.user);
        return data.user;
      }
    }
  } catch {
    // Server offline, fall back seamlessly
  }

  setStoredAuthUser(fallbackUser);
  return fallbackUser;
};

export const loginWithCredentials = async (
  emailOrPhone: string,
  passwordOrOtp: string,
  preferredRole: UserRole = 'patient'
): Promise<AuthUser> => {
  const trimmed = emailOrPhone.trim().toLowerCase();

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        emailOrPhone: trimmed,
        password: passwordOrOtp,
        role: preferredRole
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.token) setStoredAuthToken(data.token);
      if (data.user) {
        setStoredAuthUser(data.user);
        return data.user;
      }
    }
  } catch {
    // Server offline, fall back seamlessly
  }

  // Fallback demo user matching
  const matched = Object.values(DEMO_USERS).find(
    (u) => u.email.toLowerCase() === trimmed || (u.phone && u.phone === trimmed)
  );

  if (matched) {
    setStoredAuthUser(matched);
    return matched;
  }

  const isEmail = trimmed.includes('@');
  const user: AuthUser = {
    id: `usr-${Math.random().toString(36).slice(2, 9)}`,
    name: isEmail
      ? trimmed.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      : `User ${trimmed.slice(-4)}`,
    email: isEmail ? trimmed : `${trimmed}@mobile.altmedi.in`,
    phone: isEmail ? undefined : trimmed,
    role: preferredRole,
    tenantId: 'pilot-nashik-01',
    tenantName: 'Nashik Central Healthcare Network',
    area: 'Nashik Central',
    isVerified: true,
    createdAt: new Date().toISOString().split('T')[0]
  };

  setStoredAuthUser(user);
  return user;
};

export const registerNewUser = async (data: RegistrationFormData): Promise<AuthUser> => {
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (res.ok) {
      const resp = await res.json();
      if (resp.token) setStoredAuthToken(resp.token);
      if (resp.user) {
        setStoredAuthUser(resp.user);
        return resp.user;
      }
    }
  } catch {
    // Server offline, fall back seamlessly
  }

  const newUser: AuthUser = {
    id: `usr-reg-${Math.random().toString(36).slice(2, 9)}`,
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    phone: data.phone.trim(),
    role: data.role,
    tenantId: 'pilot-nashik-01',
    tenantName: 'Nashik Central Healthcare Network',
    area: data.area || 'College Road, Nashik',
    abhaId: data.abhaId?.trim(),
    knownAllergies: data.knownAllergies,
    licenseNumber: data.licenseNumber?.trim(),
    organization: data.organization?.trim(),
    speciality: data.speciality?.trim(),
    isVerified: true,
    createdAt: new Date().toISOString().split('T')[0]
  };

  setStoredAuthUser(newUser);
  return newUser;
};

export const logoutUser = (): void => {
  setStoredAuthUser(null);
  setStoredAuthToken(null);
};
