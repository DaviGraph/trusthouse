export type OnsiteCapture = {
  photoUrl: string;
  lat: number;
  lng: number;
  accuracyM: number;
  capturedAt: string;
};

const AREA_CENTERS: Record<string, { lat: number; lng: number }> = {
  "Lekki Phase 1": { lat: 6.4478, lng: 3.4723 },
  "Lekki Phase 2": { lat: 6.45, lng: 3.515 },
  Ikoyi: { lat: 6.45, lng: 3.434 },
  "Victoria Island": { lat: 6.4281, lng: 3.4219 },
  Oniru: { lat: 6.4283, lng: 3.459 },
  "Banana Island": { lat: 6.461, lng: 3.435 },
  "Ikeja GRA": { lat: 6.58, lng: 3.347 },
  Ikeja: { lat: 6.6018, lng: 3.3515 },
  Maryland: { lat: 6.568, lng: 3.366 },
  Magodo: { lat: 6.62, lng: 3.398 },
  Gbagada: { lat: 6.555, lng: 3.387 },
  Yaba: { lat: 6.5095, lng: 3.3711 },
  Surulere: { lat: 6.4969, lng: 3.357 },
  Ajah: { lat: 6.4698, lng: 3.5852 },
  Sangotedo: { lat: 6.472, lng: 3.625 },
  Chevron: { lat: 6.4415, lng: 3.536 },
  Ilupeju: { lat: 6.55, lng: 3.354 },
  Ogudu: { lat: 6.576, lng: 3.398 },
};

const MAX_DISTANCE_KM = 5;
const MAX_ACCURACY_M = 300;
const MAX_AGE_HOURS = 24;

function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export type OnsiteResult = { ok: boolean; message: string };

export function checkOnsite(
  area: string,
  capture: { lat: number; lng: number; accuracyM: number; capturedAt: string },
  now = Date.now(),
): OnsiteResult {
  const center = AREA_CENTERS[area];
  if (!center) return { ok: false, message: `No location data for ${area} yet.` };

  const capturedMs = new Date(capture.capturedAt).getTime();
  if (Number.isNaN(capturedMs) || now - capturedMs > MAX_AGE_HOURS * 3600_000 || capturedMs - now > 300_000) {
    return { ok: false, message: "The photo is too old. Take a new one at the property." };
  }
  if (capture.accuracyM > MAX_ACCURACY_M) {
    return {
      ok: false,
      message: "Your phone's location was not precise enough. Go outside, turn on GPS, and try again.",
    };
  }
  const km = distanceKm(center.lat, center.lng, capture.lat, capture.lng);
  if (km > MAX_DISTANCE_KM) {
    return {
      ok: false,
      message: `Your location is about ${Math.round(km)} km from ${area}. Take the photo at the property.`,
    };
  }
  return { ok: true, message: `Location confirmed near ${area}.` };
}