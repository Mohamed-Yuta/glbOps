import React, { useMemo } from "react";
import { computeResourceStats } from "../utils/stats";

export default function ResourceListView({ icon: Icon, items, projects, matches, query, onOpenItem, isOffice, emptyLabel }) {
  const rows = useMemo(() => {
    return items
      .map((it) => ({ item: it, stats: computeResourceStats(it, projects, matches) }))
      .filter(
        ({ item }) => !query || item.nom.toLowerCase().includes(query.toLowerCase()) || item.id.toLowerCase().includes(query.toLowerCase())
      )
      .sort((a, b) => b.stats.enCours - a.stats.enCours || b.stats.nbUsageTotal - a.stats.nbUsageTotal || a.item.nom.localeCompare(b.item.nom));
  }, [items, projects, query]);

  return (
    <div className="gt-projets">
      {rows.map(({ item, stats }) => (
        <div className="gt-projetcard" key={item.id} onClick={() => onOpenItem(item.id)}>
          <div className="gt-projetcard-top">
            <span className="gt-projetcard-client" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Icon size={15} color="var(--muted)" /> {item.nom}
              {stats.enCours > 0 && <span className="gt-pill gt-pill-warn">{stats.enCours} en cours</span>}
            </span>
            <span className="gt-projetcard-id gt-mono">{item.id}</span>
          </div>
          <div className="gt-projetcard-meta">
            <span>{stats.nbUsageTotal} utilisation{stats.nbUsageTotal > 1 ? "s" : ""} au total</span>
            <span>{stats.enCours} en cours</span>
          </div>
        </div>
      ))}
      {rows.length === 0 && <div className="gt-list-empty">{emptyLabel}</div>}
    </div>
  );
}
