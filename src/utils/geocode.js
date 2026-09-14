export async function reverseGeocode(lat, lng, signal) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=14&accept-language=fr`;
  const res = await fetch(url, { signal, headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Reverse geocoding failed: ${res.status}`);
  const data = await res.json();
  const a = data.address || {};
  const locality = a.suburb || a.neighbourhood || a.town || a.village || a.city_district || a.city || "";
  const city = a.city || a.town || a.village || "";
  if (locality && city && locality !== city) return `${locality}, ${city}`;
  return locality || city || data.display_name || null;
}
