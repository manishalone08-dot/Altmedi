import { ABDMFacilityRecord, ABDMDoctorRecord } from '../types';

export class ABDMService {
  // Simulates HFR (Health Facility Registry) facility verification
  static verifyFacility(facilityId: string): ABDMFacilityRecord {
    const facilities: Record<string, ABDMFacilityRecord> = {
      'HFR-MH-4201': {
        hfrId: 'HFR-MH-4201',
        facilityName: 'Nashik District Civil Hospital & Affiliates',
        facilityType: 'District Hospital / Teaching Facility',
        state: 'Maharashtra',
        district: 'Nashik',
        systemOfMedicine: 'Allopathy',
        status: 'verified'
      },
      'HFR-MH-3011': {
        hfrId: 'HFR-MH-3011',
        facilityName: 'Sassoon General Hospital & Medical Network',
        facilityType: 'Tertiary Care Teaching Hospital',
        state: 'Maharashtra',
        district: 'Pune',
        systemOfMedicine: 'Allopathy',
        status: 'verified'
      },
      'HFR-MH-1024': {
        hfrId: 'HFR-MH-1024',
        facilityName: 'Cooper Hospital & Suburban Clinics',
        facilityType: 'Municipal General Hospital',
        state: 'Maharashtra',
        district: 'Mumbai Suburban',
        systemOfMedicine: 'Allopathy',
        status: 'verified'
      }
    };

    return facilities[facilityId] || {
      hfrId: facilityId,
      facilityName: `Facility Registry #${facilityId}`,
      facilityType: 'Primary Healthcare Centre (PHC)',
      state: 'Maharashtra',
      district: 'Nashik',
      systemOfMedicine: 'Allopathy',
      status: 'active'
    };
  }

  // Simulates HPR (Healthcare Professionals Registry) / NMR verification
  static verifyDoctorLicense(registrationNumber: string, stateCouncil: string = 'MMC'): ABDMDoctorRecord {
    const mockDoctors: Record<string, ABDMDoctorRecord> = {
      'MMC-2018-8472': {
        hprId: '91-8472-3920-11',
        practitionerName: 'Dr. Rajesh Deshmukh',
        registrationNumber: 'MMC-2018-8472',
        stateCouncil: 'Maharashtra Medical Council (MMC)',
        speciality: 'Internal Medicine / Pulmonology',
        nmrVerified: true
      },
      'MMC-2015-4921': {
        hprId: '91-4921-8841-22',
        practitionerName: 'Dr. Sneha Kulkarni',
        registrationNumber: 'MMC-2015-4921',
        stateCouncil: 'Maharashtra Medical Council (MMC)',
        speciality: 'Pediatrics',
        nmrVerified: true
      }
    };

    return mockDoctors[registrationNumber] || {
      hprId: `91-${Math.floor(Math.random() * 8999 + 1000)}-${Math.floor(Math.random() * 8999 + 1000)}-00`,
      practitionerName: 'Registered Medical Practitioner',
      registrationNumber,
      stateCouncil,
      speciality: 'General Practice',
      nmrVerified: true
    };
  }

  // Validates 14-digit ABHA ID or PHR address
  static validateAbha(abhaInput: string): { isValid: boolean; abhaAddress?: string; abhaNumber?: string } {
    const clean = abhaInput.trim();
    if (clean.endsWith('@abdm') || clean.endsWith('@sbx')) {
      return {
        isValid: true,
        abhaAddress: clean,
        abhaNumber: '91-4421-9984-3321'
      };
    }

    const digitsOnly = clean.replace(/[-\s]/g, '');
    if (digitsOnly.length === 14 && /^\d+$/.test(digitsOnly)) {
      const formatted = `${digitsOnly.slice(0, 2)}-${digitsOnly.slice(2, 6)}-${digitsOnly.slice(6, 10)}-${digitsOnly.slice(10, 14)}`;
      return {
        isValid: true,
        abhaAddress: `${digitsOnly.slice(0, 6)}@abdm`,
        abhaNumber: formatted
      };
    }

    return { isValid: false };
  }
}
