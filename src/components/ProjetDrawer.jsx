import React, { useState } from "react";
import { X, MapPin, Plus, ChevronRight, AlertTriangle } from "lucide-react";
import { STAGES, STAGE_COLORS, NATURES } from "../constants";
import { visibleToUser } from "../utils/access";

export default function ProjetDrawer({ projet, client, onClose, onOpenPrestation, onAddPrestation, onOpenClient, currentUser }) {
  const office = currentUser.role === "Dispatcher" || currentUser.role === "Directrice";
  const [showNew, setShowNew] = useState(false);
  const [nature, setNature] = useState(NATURES[0]);

  const visiblePrestations = projet.prestations.filter((p) => visibleToUser(p, currentUser));

  return (
    <div className="gt-drawer-backdrop" onClick={onClose}>
      <div className="gt-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="gt-drawer-head">
          <div>
            <div className="gt-mono gt-drawer-id">{projet.id}</div>
            {onOpenClient && client ? (
              <button className="gt-drawer-client gt-drawer-client-link" onClick={() => onOpenClient(client.id)}>
                {client.nom}
              </button>
            ) : (
              <div className="gt-drawer-client">{client?.nom || "—"}</div>
            )}
          </div>
          <button className="gt-iconbtn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="gt-drawer-meta">
          <span className="gt-chip">Code {client?.id || "—"}</span>
          <span className="gt-chip">Réf. foncière {projet.referenceFonciere}</span>
          <span className="gt-chip"><MapPin size={12} /> {projet.situation}</span>
          <span className="gt-chip">{projet.naturePrestationProjet}</span>
        </div>

        <div className="gt-drawer-body">
          <section className="gt-section">
            <h4>Prestations ({visiblePrestations.length})</h4>
            <div className="gt-projet-prestations">
              {visiblePrestations.map((p) => (
                <button className="gt-listrow" key={p.id} onClick={() => onOpenPrestation(p.id)}>
                  <div className="gt-listrow-info">
                    <div className="gt-mono gt-listrow-id">{p.id}</div>
                    <div className="gt-listrow-client">{p.natureDemandee || "Non définie"}</div>
                  </div>
                  <div className="gt-listrow-progress">
                    {STAGES.map((s, i) => {
                      const idx = STAGES.findIndex((x) => x.key === p.stage);
                      return (
                        <div
                          key={s.key}
                          className="gt-listrow-seg"
                          style={i <= idx ? { background: STAGE_COLORS[p.stage] } : undefined}
                        />
                      );
                    })}
                  </div>
                  <div className="gt-listrow-stage">{STAGES.find((s) => s.key === p.stage).label}</div>
                  {p.cycles > 0 && (
                    <span className="gt-pill gt-pill-bad">
                      <AlertTriangle size={11} /> ×{p.cycles}
                    </span>
                  )}
                </button>
              ))}
              {visiblePrestations.length === 0 && <div className="gt-list-empty">Aucune prestation visible.</div>}
            </div>

            {office && (
              !showNew ? (
                <button className="gt-btn gt-btn-neutral" style={{ marginTop: 12 }} onClick={() => setShowNew(true)}>
                  <Plus size={14} /> Ajouter une prestation à ce projet
                </button>
              ) : (
                <div className="gt-reprogbox" style={{ marginTop: 12 }}>
                  <label>Nature de la prestation</label>
                  <select value={nature} onChange={(e) => setNature(e.target.value)}>
                    {NATURES.map((n) => (
                      <option key={n}>{n}</option>
                    ))}
                  </select>
                  <button
                    className="gt-btn gt-btn-primary"
                    onClick={() => {
                      onAddPrestation(projet.id, nature);
                      setShowNew(false);
                    }}
                  >
                    Créer la prestation <ChevronRight size={14} />
                  </button>
                </div>
              )
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
