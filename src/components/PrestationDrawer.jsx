import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  X,
  MapPin,
  Users,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Clock,
  PauseCircle,
  Lock,
  Truck,
  Wrench,
  Archive,
  Paperclip,
} from "lucide-react";
import { STAGES, NATURES, AGENTS_CHANTIER, AGENTS_BUREAU, AGENTS_CONTROLE } from "../constants";
import { today, formatFileSize, fileExt } from "../utils/dates";
import { canAct } from "../utils/access";
import { bookingsFromProjets, findDraftConflicts } from "../utils/bookings";
import PipelineStepper from "./PipelineStepper";
import { backdropVariants, drawerVariants } from "../lib/motionVariants";

export default function PrestationDrawer({ projet, client, prestation, materiels, vehicules, allProjets, onClose, onUpdate, onOpenMateriel, onOpenVehicule, currentUser }) {
  const [natureDemandee, setNatureDemandee] = useState(prestation.natureDemandee);
  const [dateDebutDemande, setDateDebutDemande] = useState(prestation.dateDebutDemande);
  const [dateFinDemande, setDateFinDemande] = useState(prestation.dateFinDemande);

  const [agentChantierSel, setAgentChantierSel] = useState(prestation.agentChantier);
  const [materielSel, setMaterielSel] = useState(prestation.materielIds);
  const [vehiculeId, setVehiculeId] = useState(prestation.vehiculeId);
  const [agentBureau, setAgentBureau] = useState(prestation.agentBureau || AGENTS_BUREAU[0]);
  const [agentControle, setAgentControle] = useState(prestation.agentControle || AGENTS_CONTROLE[0]);
  const [dateDebutExecPrevue, setDateDebutExecPrevue] = useState(prestation.dateDebutExec);

  const [natureExecutee, setNatureExecutee] = useState(prestation.natureExecutee);
  const [dateFinExec, setDateFinExec] = useState(prestation.dateFinExec);
  const [showReprog, setShowReprog] = useState(false);
  const [reprogDate, setReprogDate] = useState("");

  const [refBureau, setRefBureau] = useState(prestation.ref);

  const [dateDebutControle, setDateDebutControle] = useState(prestation.dateDebutControle);
  const [dateFinControle, setDateFinControle] = useState(prestation.dateFinControle);
  const [motifNonConforme, setMotifNonConforme] = useState("");

  const [dateLivraison, setDateLivraison] = useState(prestation.dateLivraison);
  const [chemin, setChemin] = useState(prestation.chemin);
  const [cdN, setCdN] = useState(prestation.cdN);
  const [disqueN, setDisqueN] = useState(prestation.disqueN);

  const push = (patch, label) => {
    onUpdate(prestation.id, {
      ...patch,
      history: [...prestation.history, { date: today(), label }],
    });
  };

  const toggleChantier = (name) =>
    setAgentChantierSel((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]));
  const toggleMateriel = (id) =>
    setMaterielSel((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const stage = prestation.stage;
  const allowed = canAct(stage, currentUser);

  const materielObjs = (prestation.materielIds || []).map((id) => materiels.find((m) => m.id === id)).filter(Boolean);
  const vehiculeObj = vehicules.find((v) => v.id === prestation.vehiculeId);

  const assignmentConflicts = useMemo(() => {
    if (!dateDebutExecPrevue) return [];
    const bookings = bookingsFromProjets(allProjets).filter((b) => b.prestation.dateDebutExec === dateDebutExecPrevue);
    return findDraftConflicts(bookings, { excludePrestationId: prestation.id, vehiculeId, agentNames: agentChantierSel });
  }, [allProjets, dateDebutExecPrevue, vehiculeId, agentChantierSel, prestation.id]);

  const handleAddFiles = (fileList) => {
    const newFiles = Array.from(fileList).map((f) => ({ name: f.name, size: f.size }));
    if (newFiles.length === 0) return;
    push(
      { attachments: [...prestation.attachments, ...newFiles] },
      `${newFiles.length} pièce${newFiles.length > 1 ? "s" : ""} jointe${newFiles.length > 1 ? "s" : ""} ajoutée${newFiles.length > 1 ? "s" : ""} : ${newFiles.map((f) => f.name).join(", ")}`
    );
  };

  const removeAttachment = (index) => {
    const removed = prestation.attachments[index];
    push(
      { attachments: prestation.attachments.filter((_, i) => i !== index) },
      `Pièce jointe supprimée : ${removed?.name || "—"}`
    );
  };

  return (
    <motion.div className="gt-drawer-backdrop" onClick={onClose} variants={backdropVariants} initial="hidden" animate="visible" exit="exit">
      <motion.div className="gt-drawer" onClick={(e) => e.stopPropagation()} variants={drawerVariants} initial="hidden" animate="visible" exit="exit">
        <div className="gt-drawer-head">
          <div>
            <div className="gt-mono gt-drawer-id">{prestation.id} · {projet.id}</div>
            <div className="gt-drawer-client">{client?.nom || "—"}</div>
          </div>
          <button className="gt-iconbtn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="gt-drawer-meta">
          <span className="gt-chip">
            <MapPin size={12} /> {projet.situation}
          </span>
          <span className="gt-chip">Réf. foncière : {projet.referenceFonciere}</span>
          <span className="gt-chip">Client : {client?.id || "—"}</span>
          {!allowed && (
            <span className="gt-chip" style={{ borderColor: "var(--muted)" }}>
              <Lock size={11} /> Lecture seule pour votre rôle
            </span>
          )}
        </div>

        <div className="gt-drawer-pipeline">
          <PipelineStepper stage={stage} cycles={prestation.cycles} />
        </div>

        <div className="gt-drawer-body">
          <section className="gt-section">
            <h4>Étape en cours — {STAGES.find((s) => s.key === stage).label}</h4>

            {stage === "demande" && (
              allowed ? (
                <div className="gt-form">
                  <label>Nature de la prestation demandée</label>
                  <select value={natureDemandee} onChange={(e) => setNatureDemandee(e.target.value)}>
                    <option value="">— choisir —</option>
                    {NATURES.map((n) => (
                      <option key={n}>{n}</option>
                    ))}
                  </select>
                  <div className="gt-formrow">
                    <div style={{ flex: 1 }}>
                      <label>Date début</label>
                      <input value={dateDebutDemande} onChange={(e) => setDateDebutDemande(e.target.value)} placeholder="jj/mm/aaaa" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label>Date fin prévue</label>
                      <input value={dateFinDemande} onChange={(e) => setDateFinDemande(e.target.value)} placeholder="jj/mm/aaaa" />
                    </div>
                  </div>
                  <button
                    className="gt-btn gt-btn-primary"
                    disabled={!natureDemandee || !dateDebutDemande}
                    onClick={() =>
                      push(
                        { stage: "prestation", natureDemandee, dateDebutDemande, dateFinDemande },
                        `Prestation définie — ${natureDemandee}`
                      )
                    }
                  >
                    Valider la prestation demandée <ChevronRight size={14} />
                  </button>
                </div>
              ) : (
                <div className="gt-readonly gt-restricted"><Lock size={12} /> Réservé au bureau (Dispatcher/Directrice)</div>
              )
            )}

            {stage === "prestation" && (
              allowed ? (
                <div className="gt-form">
                  <div className="gt-readonly">
                    <div className="gt-mono">{prestation.natureDemandee}</div>
                    <div>Demandé du {prestation.dateDebutDemande} au {prestation.dateFinDemande || "—"}</div>
                  </div>
                  <label>Agent(s) chantier</label>
                  <div className="gt-teamgrid">
                    {AGENTS_CHANTIER.map((t) => (
                      <label key={t.name} className={`gt-teampick ${agentChantierSel.includes(t.name) ? "active" : ""}`}>
                        <input type="checkbox" checked={agentChantierSel.includes(t.name)} onChange={() => toggleChantier(t.name)} />
                        <span className="gt-teampick-name">{t.name}</span>
                        <span className="gt-teampick-role">{t.role}</span>
                      </label>
                    ))}
                  </div>
                  <label>Matériel utilisé</label>
                  <div className="gt-teamgrid">
                    {materiels.map((m) => (
                      <label key={m.id} className={`gt-teampick ${materielSel.includes(m.id) ? "active" : ""}`}>
                        <input type="checkbox" checked={materielSel.includes(m.id)} onChange={() => toggleMateriel(m.id)} />
                        <span className="gt-teampick-name">{m.nom}</span>
                      </label>
                    ))}
                  </div>
                  <label>Véhicule</label>
                  <select value={vehiculeId} onChange={(e) => setVehiculeId(e.target.value)}>
                    <option value="">— choisir —</option>
                    {vehicules.map((v) => (
                      <option key={v.id} value={v.id}>{v.nom}</option>
                    ))}
                  </select>
                  <div className="gt-formrow">
                    <div style={{ flex: 1 }}>
                      <label>Agent bureau (traitement)</label>
                      <select value={agentBureau} onChange={(e) => setAgentBureau(e.target.value)}>
                        {AGENTS_BUREAU.map((a) => (
                          <option key={a}>{a}</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label>Agent contrôle</label>
                      <select value={agentControle} onChange={(e) => setAgentControle(e.target.value)}>
                        {AGENTS_CONTROLE.map((a) => (
                          <option key={a}>{a}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <label>Date de visite prévue</label>
                  <input value={dateDebutExecPrevue} onChange={(e) => setDateDebutExecPrevue(e.target.value)} placeholder="jj/mm/aaaa" />

                  {assignmentConflicts.length > 0 && (
                    <div className="gt-conflict-warning">
                      <div className="gt-conflict-title">
                        <AlertTriangle size={13} /> {assignmentConflicts.length} conflit{assignmentConflicts.length > 1 ? "s" : ""} de réservation le {dateDebutExecPrevue}
                      </div>
                      <ul className="gt-conflict-list">
                        {assignmentConflicts.map((c, i) => (
                          <li key={i}>
                            {c.type === "vehicule"
                              ? `Véhicule déjà affecté à ${c.prestation.id} (${c.projet.id})`
                              : `${c.agentName} déjà affecté à ${c.prestation.id} (${c.projet.id})`}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <button
                    className="gt-btn gt-btn-primary"
                    disabled={agentChantierSel.length === 0 || !dateDebutExecPrevue}
                    onClick={() =>
                      push(
                        {
                          stage: "affectation",
                          agentChantier: agentChantierSel,
                          materielIds: materielSel,
                          vehiculeId,
                          agentBureau,
                          agentControle,
                          dateDebutExec: dateDebutExecPrevue,
                        },
                        `Affectation : ${agentChantierSel.join(", ")} — visite prévue le ${dateDebutExecPrevue}`
                      )
                    }
                  >
                    Affecter les ressources <ChevronRight size={14} />
                  </button>
                </div>
              ) : (
                <div className="gt-readonly gt-restricted"><Lock size={12} /> Réservé au bureau (Dispatcher/Directrice)</div>
              )
            )}

            {stage === "affectation" && (
              <div className="gt-form">
                <div className="gt-readonly">
                  <div><Users size={12} style={{ verticalAlign: -2 }} /> {prestation.agentChantier.join(", ")}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <Wrench size={12} />
                    {materielObjs.length === 0 && "—"}
                    {materielObjs.map((m) => (
                      <button
                        key={m.id}
                        className={onOpenMateriel ? "gt-inline-link" : "gt-inline-text"}
                        onClick={onOpenMateriel ? () => onOpenMateriel(m.id) : undefined}
                      >
                        {m.nom}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Truck size={12} />
                    {vehiculeObj ? (
                      <button
                        className={onOpenVehicule ? "gt-inline-link" : "gt-inline-text"}
                        onClick={onOpenVehicule ? () => onOpenVehicule(vehiculeObj.id) : undefined}
                      >
                        {vehiculeObj.nom}
                      </button>
                    ) : "—"}
                  </div>
                  <div>Visite prévue le {prestation.dateDebutExec}</div>
                </div>
                {allowed ? (
                  <button
                    className="gt-btn gt-btn-primary"
                    onClick={() => push({ stage: "execution" }, `Passage à l'exécution — visite du ${prestation.dateDebutExec}`)}
                  >
                    Démarrer l'exécution <ChevronRight size={14} />
                  </button>
                ) : (
                  <div className="gt-readonly gt-restricted"><Lock size={12} /> En attente de l'agent chantier assigné</div>
                )}
              </div>
            )}

            {stage === "execution" && (
              allowed ? (
                <div className="gt-form">
                  {prestation.reprogramme && (
                    <div className="gt-readonly" style={{ borderColor: "var(--amber)", color: "var(--amber)" }}>
                      Visite précédente inachevée — reprise prévue le {prestation.dateDebutExec}
                    </div>
                  )}
                  <label>Prestation réellement exécutée</label>
                  <textarea value={natureExecutee} onChange={(e) => setNatureExecutee(e.target.value)} rows={2} placeholder="Ce qui a été fait sur le terrain..." />
                  <label>Date de fin d'exécution</label>
                  <input value={dateFinExec} onChange={(e) => setDateFinExec(e.target.value)} placeholder="jj/mm/aaaa" />
                  <button
                    className="gt-btn gt-btn-primary"
                    disabled={!natureExecutee || !dateFinExec}
                    onClick={() =>
                      push(
                        { stage: "bureau", natureExecutee, dateFinExec, reprogramme: false },
                        `Exécution saisie — ${natureExecutee}`
                      )
                    }
                  >
                    Envoyer au bureau <ChevronRight size={14} />
                  </button>

                  {!showReprog ? (
                    <button className="gt-btn gt-btn-neutral" onClick={() => setShowReprog(true)}>
                      <PauseCircle size={14} /> Mission non terminée — reprogrammer
                    </button>
                  ) : (
                    <div className="gt-reprogbox">
                      <label>Nouvelle date de visite</label>
                      <input value={reprogDate} onChange={(e) => setReprogDate(e.target.value)} placeholder="jj/mm/aaaa" />
                      <button
                        className="gt-btn gt-btn-primary"
                        disabled={!reprogDate}
                        onClick={() => push({ dateDebutExec: reprogDate, reprogramme: true }, `Visite partielle — reprise prévue le ${reprogDate}`)}
                      >
                        Reprogrammer <ChevronRight size={14} />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="gt-readonly gt-restricted"><Lock size={12} /> Réservé à l'agent chantier assigné</div>
              )
            )}

            {stage === "bureau" && (
              allowed ? (
                <div className="gt-form">
                  <div className="gt-readonly">{prestation.natureExecutee}</div>
                  <label>Référence du livrable (en cours de traitement)</label>
                  <input value={refBureau} onChange={(e) => setRefBureau(e.target.value)} placeholder="ex. LIV-0134" />
                  <button
                    className="gt-btn gt-btn-primary"
                    onClick={() => push({ stage: "controle", ref: refBureau }, "Traitement bureau terminé")}
                  >
                    Envoyer au contrôle <ChevronRight size={14} />
                  </button>
                </div>
              ) : (
                <div className="gt-readonly gt-restricted"><Lock size={12} /> Réservé à l'agent bureau assigné ({prestation.agentBureau})</div>
              )
            )}

            {stage === "controle" && (
              allowed ? (
                <div className="gt-form">
                  <div className="gt-readonly">{prestation.natureExecutee}</div>
                  <div className="gt-formrow">
                    <div style={{ flex: 1 }}>
                      <label>Date début contrôle</label>
                      <input value={dateDebutControle} onChange={(e) => setDateDebutControle(e.target.value)} placeholder="jj/mm/aaaa" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label>Date fin contrôle</label>
                      <input value={dateFinControle} onChange={(e) => setDateFinControle(e.target.value)} placeholder="jj/mm/aaaa" />
                    </div>
                  </div>
                  <label>Motif (si non conforme)</label>
                  <textarea value={motifNonConforme} onChange={(e) => setMotifNonConforme(e.target.value)} rows={2} />
                  <div className="gt-btnrow">
                    <button
                      className="gt-btn gt-btn-good"
                      onClick={() => push({ stage: "livraison", dateDebutControle, dateFinControle }, "Contrôle conforme")}
                    >
                      <CheckCircle2 size={14} /> Conforme
                    </button>
                    <button
                      className="gt-btn gt-btn-bad"
                      disabled={!motifNonConforme}
                      onClick={() =>
                        push(
                          { stage: "execution", dateDebutControle, dateFinControle, cycles: prestation.cycles + 1 },
                          `Non conforme — ${motifNonConforme}. Retour à Exécution.`
                        )
                      }
                    >
                      <AlertTriangle size={14} /> Non conforme
                    </button>
                  </div>
                </div>
              ) : (
                <div className="gt-readonly gt-restricted"><Lock size={12} /> Réservé à l'agent contrôle assigné ({prestation.agentControle})</div>
              )
            )}

            {stage === "livraison" && (
              allowed ? (
                prestation.chemin && prestation.dateLivraison ? (
                  <div className="gt-readonly">
                    <div className="gt-mono">Livré le {prestation.dateLivraison} — Réf {prestation.ref}</div>
                    <div className="gt-mono">{prestation.chemin}</div>
                    <div className="gt-mono">CD {prestation.cdN} · Disque {prestation.disqueN}</div>
                  </div>
                ) : (
                  <div className="gt-form">
                    <label>Date de livraison</label>
                    <input value={dateLivraison} onChange={(e) => setDateLivraison(e.target.value)} placeholder="jj/mm/aaaa" />
                    <label>Chemin réseau</label>
                    <input value={chemin} onChange={(e) => setChemin(e.target.value)} placeholder="\\SERVEUR\Projets\..." />
                    <div className="gt-formrow">
                      <div style={{ flex: 1 }}>
                        <label>CD N°</label>
                        <input value={cdN} onChange={(e) => setCdN(e.target.value)} placeholder="CD-0123" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label>Disque N°</label>
                        <input value={disqueN} onChange={(e) => setDisqueN(e.target.value)} placeholder="DQ-045" />
                      </div>
                    </div>
                    <button
                      className="gt-btn gt-btn-primary"
                      disabled={!dateLivraison || !chemin}
                      onClick={() => push({ dateLivraison, chemin, cdN, disqueN }, `Livré — Réf ${prestation.ref || "—"}`)}
                    >
                      <Archive size={14} /> Archiver et clôturer
                    </button>
                  </div>
                )
              ) : (
                <div className="gt-readonly gt-restricted"><Lock size={12} /> Réservé au bureau (Dispatcher/Directrice)</div>
              )
            )}
          </section>

          <section className="gt-section">
            <h4>
              <Paperclip size={13} strokeWidth={2.2} /> Pièces jointes ({prestation.attachments.length})
            </h4>
            {allowed && (
              <label className="gt-btn gt-btn-neutral gt-attach-uploadbtn">
                <Paperclip size={14} /> Ajouter des fichiers
                <input type="file" multiple onChange={(e) => { handleAddFiles(e.target.files); e.target.value = ""; }} />
              </label>
            )}
            <div className="gt-attach-list">
              {prestation.attachments.map((a, i) => (
                <div className="gt-attach-item" key={i}>
                  <span className="gt-attach-ext">{fileExt(a.name)}</span>
                  <span className="gt-attach-name">{a.name}</span>
                  <span className="gt-attach-size">{formatFileSize(a.size)}</span>
                  {allowed && (
                    <button className="gt-iconbtn" onClick={() => removeAttachment(i)}>
                      <X size={13} />
                    </button>
                  )}
                </div>
              ))}
              {prestation.attachments.length === 0 && <div className="gt-list-empty">Aucune pièce jointe.</div>}
            </div>
            <div className="gt-attach-note">Démo — les fichiers ne sont pas réellement téléversés, seul le nom est conservé.</div>
          </section>

          <section className="gt-section">
            <h4>
              <Clock size={13} strokeWidth={2.2} /> Historique
            </h4>
            <div className="gt-timeline">
              {prestation.history
                .slice()
                .reverse()
                .map((h, i) => (
                  <div className="gt-timeline-row" key={i}>
                    <div className="gt-timeline-dot" />
                    <div>
                      <div className="gt-mono gt-timeline-date">{h.date}</div>
                      <div className="gt-timeline-label">{h.label}</div>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        </div>
      </motion.div>
    </motion.div>
  );
}
