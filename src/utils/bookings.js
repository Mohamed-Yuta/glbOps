export function bookingsFromProjets(projets) {
  const rows = [];
  projets.forEach((pr) => {
    pr.prestations.forEach((p) => {
      if (p.dateDebutExec) rows.push({ prestation: p, projet: pr });
    });
  });
  return rows;
}

export function groupBookingsByDate(bookings) {
  const map = {};
  bookings.forEach((b) => {
    const key = b.prestation.dateDebutExec;
    if (!map[key]) map[key] = [];
    map[key].push(b);
  });
  return map;
}

export function conflictingIds(dayBookings) {
  const ids = new Set();
  for (let i = 0; i < dayBookings.length; i++) {
    for (let j = i + 1; j < dayBookings.length; j++) {
      const a = dayBookings[i].prestation;
      const b = dayBookings[j].prestation;
      if (a.id === b.id) continue;
      const sameVehicule = a.vehiculeId && a.vehiculeId === b.vehiculeId;
      const sameAgent = (a.agentChantier || []).some((n) => (b.agentChantier || []).includes(n));
      if (sameVehicule || sameAgent) {
        ids.add(a.id);
        ids.add(b.id);
      }
    }
  }
  return ids;
}

export function findDraftConflicts(bookingsForDate, { excludePrestationId, vehiculeId, agentNames }) {
  const conflicts = [];
  bookingsForDate.forEach(({ prestation, projet }) => {
    if (prestation.id === excludePrestationId) return;
    if (vehiculeId && prestation.vehiculeId === vehiculeId) {
      conflicts.push({ type: "vehicule", prestation, projet });
    }
    (agentNames || []).forEach((name) => {
      if ((prestation.agentChantier || []).includes(name)) {
        conflicts.push({ type: "agent", agentName: name, prestation, projet });
      }
    });
  });
  return conflicts;
}
