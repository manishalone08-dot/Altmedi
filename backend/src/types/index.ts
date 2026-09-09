export interface ABDMFacilityRecord {
  hfrId: string;
  facilityName: string;
  facilityType: string;
  state: string;
  district: string;
  systemOfMedicine: string;
  status: 'active' | 'pending' | 'verified';
}

export interface ABDMDoctorRecord {
  hprId: string;
  practitionerName: string;
  registrationNumber: string;
  stateCouncil: string;
  speciality: string;
  nmrVerified: boolean;
}
