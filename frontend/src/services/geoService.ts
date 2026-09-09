// GeoLocation & Distance Matrix Service for Nashik Pharmacy Network

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface PharmacyLocation {
  id: string;
  name: string;
  area: string;
  coordinates: Coordinates;
  address: string;
  phone: string;
  isOpen24Hours?: boolean;
}

export const NASHIK_PHARMACIES: Record<string, PharmacyLocation> = {
  'Lifeline Pharmacy Hub': {
    id: 'pharm-1',
    name: 'Lifeline Pharmacy Hub',
    area: 'Canada Corner, Nashik',
    coordinates: { latitude: 20.0063, longitude: 73.7749 },
    address: 'Shop 4-5, Archit Center, Canada Corner, Sharanpur Road',
    phone: '+91 98220 55100',
    isOpen24Hours: true
  },
  'Nashik Medicos & Surgicals': {
    id: 'pharm-2',
    name: 'Nashik Medicos & Surgicals',
    area: 'College Road, Nashik',
    coordinates: { latitude: 20.0012, longitude: 73.7634 },
    address: '12, Shree Arcade, Opp. BYK College, College Road',
    phone: '+91 98220 55612'
  },
  'Wellness Forever - Mahatma Nagar': {
    id: 'pharm-3',
    name: 'Wellness Forever - Mahatma Nagar',
    area: 'Mahatma Nagar, Nashik',
    coordinates: { latitude: 19.9942, longitude: 73.754 },
    address: 'Ground Floor, Trimbak Road, Near Water Tank, Mahatma Nagar',
    phone: '+91 98220 33441',
    isOpen24Hours: true
  },
  'Shree Ganesh Chemist': {
    id: 'pharm-4',
    name: 'Shree Ganesh Chemist',
    area: 'Panchavati, Nashik',
    coordinates: { latitude: 20.0125, longitude: 73.7912 },
    address: 'Malegaon Stand, Panchavati Karanja',
    phone: '+91 98220 88200'
  },
  'Apollo Pharmacy - Nashik Road': {
    id: 'pharm-5',
    name: 'Apollo Pharmacy - Nashik Road',
    area: 'Nashik Road Railway Station',
    coordinates: { latitude: 19.9574, longitude: 73.834 },
    address: 'Station Road, Near Bitco Hospital, Nashik Road',
    phone: '+91 98220 99400',
    isOpen24Hours: true
  },
  'Godavari Super Chemist': {
    id: 'pharm-6',
    name: 'Godavari Super Chemist',
    area: 'Indira Nagar, Nashik',
    coordinates: { latitude: 19.9678, longitude: 73.769 },
    address: 'Rane Nagar Link Road, Indira Nagar',
    phone: '+91 98220 44331'
  }
};

// Default reference position: Nashik Central (Ashok Stambh)
export const DEFAULT_NASHIK_CENTER: Coordinates = {
  latitude: 19.9975,
  longitude: 73.7898
};

/**
 * Calculates great-circle distance between two GPS coordinates in kilometers
 * using the Haversine formula.
 */
export function calculateHaversineDistance(c1: Coordinates, c2: Coordinates): number {
  const R = 6371; // Earth radius in km
  const dLat = ((c2.latitude - c1.latitude) * Math.PI) / 180;
  const dLon = ((c2.longitude - c1.longitude) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((c1.latitude * Math.PI) / 180) *
      Math.cos((c2.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Requests the user's real browser GPS coordinates
 */
export async function requestUserPosition(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  });
}

/**
 * Returns distance from coordinates to a named pharmacy or area
 */
export function getPharmacyDistance(userPos: Coordinates, pharmacyNameOrArea: string): number {
  const match = Object.values(NASHIK_PHARMACIES).find(
    (p) =>
      p.name.toLowerCase().includes(pharmacyNameOrArea.toLowerCase()) ||
      p.area.toLowerCase().includes(pharmacyNameOrArea.toLowerCase()) ||
      pharmacyNameOrArea.toLowerCase().includes(p.name.toLowerCase())
  );

  if (!match) return 2.5; // default reasonable estimate

  return calculateHaversineDistance(userPos, match.coordinates);
}
