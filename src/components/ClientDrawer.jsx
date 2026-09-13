import React, { useState } from "react";
import { X, Check, Pencil, Folder, AlertTriangle, Plus } from "lucide-react";
import { computeClientStats } from "../utils/stats";
import { formatTimestamp } from "../utils/dates";

export default function ClientDrawer({ client, projects, onClose, onOpenProjet, onNewProjetForClient, onRenameClient, isOffice }) {
  const [renaming, setRenaming] = useState(false);
  const [nomDraft, setNomDraft] = useState(client.nom);
  const stats = computeClientStats(client, projects);

  const submitRename = () => {
    if (nomDraft.trim()) onRenameClient(client.id, nomDraft.trim());
    setRenaming(false);
  };

  return (
    <div className="gt-drawer-backdrop" onClick={onClose}>
      <div className="gt-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="gt-drawer-head">
          <div style={{ flex: 1 }}>
            <div className="gt-mono gt-drawer-id">{client.id}</div>
            {renaming ? (
              <div className="gt-renamebox">
                <input value={nomDraft} onChange={(e) => setNomDraft(e.target.value)} autoFocus onKeyDown={(e) => e.key === "Enter" && submitRename()} />
                <button className="gt-iconbtn" onClick={submitRename}>
                  <Check size={16} />
                </button>
              </div>
            ) : (
              <div className="gt-drawer-client">
                {client.nom}
                {isOffice && (
                  <button className="gt-iconbtn gt-rename-btn" onClick={() => { setNomDraft(client.nom); setRenaming(true); }}>
                    <Pencil size={13} />
                  </button>
                )}
              </div>
            )}
          </div>
          <button className="gt-iconbtn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="gt-drawer-meta">
          <span className="gt-chip"><Folder size={12} /> {stats.nbProjects} projet{stats.nbProjects > 1 ? "s" : ""}</span>
          <span className="gt-chip">{stats.nbPrestations} prestation{stats.nbPrestations > 1 ? "s" : ""}</span>
          <span className="gt-chip">{stats.enCours} en cours</span>
          {stats.nonConf > 0 && (
            <span className="gt-chip" style={{ borderColor: "var(--bad)", color: "var(--bad)" }}>
              <AlertTriangle size={11} /> {stats.nonConf} non-conformité{stats.nonConf > 1 ? "s" : ""}
            </span>
          )}
          {stats.lastActivity != null && <span className="gt-chip">Dernière activité : {formatTimestamp(stats.lastActivity)}</span>}
        </div>

        <div className="gt-drawer-body">
          <section className="gt-section">
            <h4>Projets ({stats.projects.length})</h4>
            <div className="gt-projet-prestations">
              {stats.projects.map((pr) => (
                <button className="gt-listrow" key={pr.id} onClick={() => onOpenProjet(pr.id)}>
                  <div className="gt-listrow-info">
                    <div className="gt-mono gt-listrow-id">{pr.id}</div>
                    <div className="gt-listrow-client">{pr.naturePrestationProjet || pr.situation}</div>
                  </div>
                  <div className="gt-listrow-stage">{pr.prestations.length} prestation{pr.prestations.length > 1 ? "s" : ""}</div>
                </button>
              ))}
              {stats.projects.length === 0 && <div className="gt-list-empty">Aucun projet pour ce client.</div>}
            </div>

            {isOffice && (
              <button className="gt-btn gt-btn-neutral" style={{ marginTop: 12 }} onClick={() => onNewProjetForClient(client)}>
                <Plus size={14} /> Nouveau projet pour ce client
              </button>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
