export function parseGPX(text) {
  const doc = new DOMParser().parseFromString(text, "application/xml");
  if (doc.querySelector("parsererror")) throw new Error("Fichier GPX invalide");
  return [...doc.querySelectorAll("wpt")].map((wpt, i) => {
    const lat = parseFloat(wpt.getAttribute("lat"));
    const lng = parseFloat(wpt.getAttribute("lon"));
    const name = wpt.querySelector("name")?.textContent?.trim() || `Point ${i + 1}`;
    return { name, lat, lng };
  }).filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng));
}

export function parseCSV(text) {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];

  const splitLine = (line) => line.split(/[,;]/).map((c) => c.trim().replace(/^"|"$/g, ""));
  const header = splitLine(lines[0]).map((h) => h.toLowerCase());
  const latIdx = header.findIndex((h) => /^lat/.test(h));
  const lngIdx = header.findIndex((h) => /^(lng|lon|long)/.test(h));
  const nameIdx = header.findIndex((h) => /^(nom|name|label|situation)/.test(h));
  const hasHeader = latIdx !== -1 && lngIdx !== -1;

  const rows = hasHeader ? lines.slice(1) : lines;
  const li = hasHeader ? latIdx : 0;
  const lo = hasHeader ? lngIdx : 1;
  const ni = hasHeader ? nameIdx : 2;

  return rows.map((line, i) => {
    const cols = splitLine(line);
    const lat = parseFloat(cols[li]?.replace(",", "."));
    const lng = parseFloat(cols[lo]?.replace(",", "."));
    const name = (ni !== -1 && cols[ni]) || `Point ${i + 1}`;
    return { name, lat, lng };
  }).filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng));
}

export function parseImportFile(filename, text) {
  return /\.gpx$/i.test(filename) ? parseGPX(text) : parseCSV(text);
}
