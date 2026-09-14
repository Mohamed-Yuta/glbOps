export const nextClientId = (clients) => `CLI-0${240 + clients.length}`;
export const nextEmployeeId = (list) => `EMP-${String(list.length + 1).padStart(3, "0")}`;
export const nextMaterielId = (list) => `MAT-${String(list.length + 1).padStart(3, "0")}`;
export const nextVehiculeId = (list) => `VEH-${String(list.length + 1).padStart(3, "0")}`;

export const nextPrestationId = (projets) => {
  let max = 0;
  projets.forEach((pr) => {
    pr.prestations.forEach((p) => {
      const n = parseInt(String(p.id).split("-").pop(), 10);
      if (Number.isFinite(n) && n > max) max = n;
    });
  });
  return `PRS-2026-0${max + 1}`;
};
