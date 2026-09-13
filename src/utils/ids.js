export const nextClientId = (clients) => `CLI-0${240 + clients.length}`;
export const nextMaterielId = (list) => `MAT-${String(list.length + 1).padStart(3, "0")}`;
export const nextVehiculeId = (list) => `VEH-${String(list.length + 1).padStart(3, "0")}`;
