export function calculateSpeed(pos1, pos2, timeDiffSeconds) {
  if (!pos1 || !pos2 || !timeDiffSeconds) return 0;
  
  const R = 6371; // Earth's radius in km 
  const toRad = (deg) => deg * (Math.PI / 180);
  const dLat = toRad(pos2.lat - pos1.lat);
  const dLon = toRad(pos2.lng - pos1.lng); 
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(pos1.lat)) * Math.cos(toRad(pos2.lat)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // distance in km 
  const speedKmh = (distance / timeDiffSeconds) * 3600;
  return speedKmh;
}

export async function fetchISSLocation() {
  try {
    const res = await fetch('/api/iss/iss-now.json');
    if (!res.ok) throw new Error("API failed");
    const data = await res.json();
    return {
      lat: parseFloat(data.iss_position.latitude),
      lng: parseFloat(data.iss_position.longitude),
      timestamp: data.timestamp
    };
  } catch (error) {
    console.error("Error fetching ISS location", error);
    return null;
  }
}

export async function fetchAstronauts() {
  try {
    const res = await fetch('/api/iss/astros.json');
    if (!res.ok) throw new Error("API failed");
    const data = await res.json();
    return {
      total: data.number,
      people: data.people
    };
  } catch (error) {
    console.error("Error fetching astronauts", error);
    return null;
  }
}

export async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
    if (!res.ok) throw new Error('Geocoding failed');
    const data = await res.json();
    
    if (data && data.address) {
      const city = data.address.city || data.address.town || data.address.village || data.address.state || data.address.country;
      return city || "Unknown Land";
    }
    return "Ocean / Unknown";
  } catch (error) {
    // If it fails or it's over the ocean, Nominatim often returns 400 or no address
    return "Ocean / Unknown";
  }
}
