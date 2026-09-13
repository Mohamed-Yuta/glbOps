import React, { useState } from "react";
import { X, Check, Pencil } from "lucide-react";
import { STAGES, STAGE_COLORS } from "../constants";
import { computeResourceStats } from "../utils/stats";

export default function ResourceDrawer({ item, projects, matches, typeLabel, onClose, onOpenPrestation, onRenameItem, isOffice }) {
  const [renaming, setRenaming] = useState(false);
  const [nomDraft, setNomDraft] = useState(item.nom);
  const stats = computeResourceStats(item, projects, matches);

  const submitRename = () => {
    if (nomDraft.trim()) onRenameItem(item.id, nomDraft.trim());
    setRenaming(false);
  };

  return (
    <div className="gt-drawer-backdrop" onClick={onClose}>
      <div className="gt-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="gt-drawer-head">
          <div style={{ flex: 1 }}>
            <div className="gt-mono gt-drawer-id">{item.id} · {typeLabel}</div>
            {renaming ? (
              <div className="gt-renamebox">
                <input value={nomDraft} onChange={(e) => setNomDraft(e.target.value)} autoFocus onKeyDown={(e) => e.key === "Enter" && submitRename()} />
                <button className="gt-iconbtn" onClick={submitRename}>
                  <Check size={16} />
                </button>
              </div>
            ) : (
              <div className="gt-drawer-client">
                {item.nom}
                {isOffice && (
                  <button className="gt-iconbtn gt-rename-btn" onClick={() => { setNomDraft(item.nom); setRenaming(true); }}>
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
          <span className="gt-chip">{stats.nbUsageTotal} utilisation{stats.nbUsageTotal > 1 ? "s" : ""}</span>
          <span className="gt-chip" style={stats.enCours > 0 ? { borderColor: "var(--amber)", color: "var(--amber)" } : undefined}>
            {stats.enCours} en cours
          </span>
        </div>

        <div className="gt-drawer-body">
          <section className="gt-section">
            <h4>Affectations ({stats.assignments.length})</h4>
            <div className="gt-projet-prestations">
              {stats.assignments.map(({ prestation, projet }) => (
                <button className="gt-listrow" key={prestation.id} onClick={() => onOpenPrestation(prestation.id)}>
                  <div className="gt-listrow-info">
                    <div className="gt-mono gt-listrow-id">{prestation.id} · {projet.id}</div>
                    <div className="gt-listrow-client">{prestation.natureDemandee || "Non définie"}</div>
                  </div>
                  <div className="gt-listrow-stage" style={{ color: STAGE_COLORS[prestation.stage] }}>
                    {STAGES.find((s) => s.key === prestation.stage).label}
                  </div>
                </button>
              ))}
              {stats.assignments.length === 0 && <div className="gt-list-empty">Aucune affectation enregistrée.</div>}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
