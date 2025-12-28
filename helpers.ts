const FAST_OPTIONS: PositionOptions = {
  enableHighAccuracy: false,
  timeout: 15000,
  maximumAge: 1000 * 60 * 5, // 5 minutes cache
};

export type CachedLocation = {
  lat: number;
  lng: number;
  timestamp: number;
};

const KEY = "user_location_cache";
const MAX_AGE = 1000 * 60 * 10; // 10 minutes

export function getCachedLocation(): { lat: number; lng: number } | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;

    const data: CachedLocation = JSON.parse(raw);

    if (Date.now() - data.timestamp > MAX_AGE) {
      // Clear expired cache
      localStorage.removeItem(KEY);
      return null;
    }

    return { lat: data.lat, lng: data.lng };
  } catch {
    return null;
  }
}

export function setCachedLocation(lat: number, lng: number) {
  const data: CachedLocation = {
    lat,
    lng,
    timestamp: Date.now(),
  };

  localStorage.setItem(KEY, JSON.stringify(data));
}

export function clearCachedLocation() {
  localStorage.removeItem(KEY);
}

export function getUserLocation(
  forceRefresh = false,
): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }

    // Skip cache if force refresh is requested
    if (!forceRefresh) {
      const cached = getCachedLocation();
      if (cached) {
        resolve(cached);
        return;
      }
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setCachedLocation(loc.lat, loc.lng);
        resolve(loc);
      },
      () => {
        // First attempt failed, try with high accuracy
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const loc = {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            };
            setCachedLocation(loc.lat, loc.lng);
            resolve(loc);
          },
          (err) => {
            // Clear cache on error so we don't serve stale data
            clearCachedLocation();
            reject(new Error(err.message));
          },
          {
            enableHighAccuracy: true,
            timeout: 30000,
          },
        );
      },
      FAST_OPTIONS,
    );
  });
}

export function getDistanceInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
