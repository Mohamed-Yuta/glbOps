import React, { useMemo } from "react";
import { Building2, Folder, AlertTriangle } from "lucide-react";
import { computeClientStats } from "../utils/stats";
import { formatTimestamp } from "../utils/dates";

export default function ClientsView({ clients, projects, query, onOpenClient, isOffice }) {
  const rows = useMemo(() => {
    return clients
      .map((c) => ({ client: c, stats: computeClientStats(c, projects) }))
      .filter(({ stats }) => stats.nbProjects > 0 || isOffice)
      .filter(
        ({ client }) =>
          !query || client.nom.toLowerCase().includes(query.toLowerCase()) || client.id.toLowerCase().includes(query.toLowerCase())
      )
      .sort((a, b) => b.stats.nbProjects - a.stats.nbProjects || a.client.nom.localeCompare(b.client.nom));
  }, [clients, projects, query, isOffice]);

  return (
    <div className="gt-projets">
      {rows.map(({ client, stats }) => (
        <div className="gt-projetcard" key={client.id} onClick={() => onOpenClient(client.id)}>
          <div className="gt-projetcard-top">
            <span className="gt-projetcard-client" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Building2 size={15} color="var(--muted)" /> {client.nom}
              {stats.nbProjects > 1 && (
                <span className="gt-pill gt-pill-warn">{stats.nbProjects} projets liés</span>
              )}
            </span>
            <span className="gt-projetcard-id gt-mono">{client.id}</span>
          </div>
          <div className="gt-projetcard-meta">
            <span><Folder size={12} style={{ verticalAlign: -2 }} /> {stats.nbProjects} projet{stats.nbProjects > 1 ? "s" : ""}</span>
            <span>{stats.nbPrestations} prestation{stats.nbPrestations > 1 ? "s" : ""}</span>
            <span>{stats.enCours} en cours</span>
            {stats.nonConf > 0 && (
              <span style={{ color: "var(--bad)" }}><AlertTriangle size={12} style={{ verticalAlign: -2 }} /> {stats.nonConf} non-conforme{stats.nonConf > 1 ? "s" : ""}</span>
            )}
            {stats.lastActivity != null && <span>Dernière activité : {formatTimestamp(stats.lastActivity)}</span>}
          </div>
        </div>
      ))}
      {rows.length === 0 && <div className="gt-list-empty">Aucun client ne correspond.</div>}
    </div>
  );
}
