import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList,
  Map as MapIcon,
  CalendarDays,
  ChevronLeft,
  MapPin,
  Users,
  Wrench,
  Truck,
  Clock,
  AlertTriangle,
  PauseCircle,
  ChevronRight,
  Paperclip,
  X,
} from "lucide-react";
import { STAGES, STAGE_COLORS } from "../constants";
import { today, parseDateFR, formatFileSize, fileExt } from "../utils/dates";
import { canAct } from "../utils/access";
import PipelineStepper from "./PipelineStepper";
import MapView from "./MapView";
import { DatePicker } from "@/components/ui/date-picker";

const ACTIONABLE_STAGES = ["affectation", "execution"];

function stageLabel(key) {
  return STAGES.find((s) => s.key === key)?.label || key;
}

function TaskCard({ task, onOpen }) {
  const { projet, ...prestation } = task;
  const actionable = ACTIONABLE_STAGES.includes(prestation.stage);
  return (
    <button className={`ac-taskcard ${actionable ? "actionable" : ""}`} onClick={() => onOpen(prestation.id)}>
      <div className="ac-taskcard-stripe" style={{ background: STAGE_COLORS[prestation.stage] }} />
      <div className="ac-taskcard-body">
        <div className="ac-taskcard-top">
          <span className="ac-taskcard-id">{projet.id}</span>
          {prestation.cycles > 0 && (
            <span className="ac-taskcard-flag">
              <AlertTriangle size={12} /> Retour
            </span>
          )}
        </div>
        <div className="ac-taskcard-nature">{prestation.natureDemandee || "Prestation"}</div>
        <div className="ac-taskcard-meta">
          <MapPin size={13} /> {projet.situation}
        </div>
        <div className="ac-taskcard-bottom">
          <span className="ac-stagebadge" style={{ background: STAGE_COLORS[prestation.stage] }}>
            {stageLabel(prestation.stage)}
          </span>
          {prestation.dateDebutExec && <span className="ac-taskcard-date">{prestation.dateDebutExec}</span>}
        </div>
      </div>
      <ChevronRight size={20} className="ac-taskcard-chevron" />
    </button>
  );
}

function formatAgendaHeading(dateFR) {
  const t = parseDateFR(dateFR);
  if (t == null) return dateFR;
  const label = new Date(t).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function AgentPlanning({ tasks, onOpen }) {
  const todayKey = today();
  const groups = useMemo(() => {
    const map = new Map();
    tasks.filter((t) => t.dateDebutExec).forEach((t) => {
      if (!map.has(t.dateDebutExec)) map.set(t.dateDebutExec, []);
      map.get(t.dateDebutExec).push(t);
    });
    return [...map.entries()].sort((a, b) => (parseDateFR(a[0]) || 0) - (parseDateFR(b[0]) || 0));
  }, [tasks]);

  return (
    <div className="ac-agenda">
      {groups.map(([dateFR, items]) => (
        <div className="ac-agenda-group" key={dateFR}>
          <div className={`ac-agenda-date ${dateFR === todayKey ? "today" : ""}`}>
            {dateFR === todayKey ? "Aujourd'hui" : formatAgendaHeading(dateFR)}
          </div>
          {items.map((t) => (
            <button key={t.id} className="ac-agenda-item" onClick={() => onOpen(t.id)}>
              <span className="ac-agenda-dot" style={{ background: STAGE_COLORS[t.stage] }} />
              <span className="ac-agenda-item-body">
                <span className="ac-agenda-item-title">{t.natureDemandee || "Prestation"}</span>
                <span className="ac-agenda-item-meta"><MapPin size={11} /> {t.projet.situation}</span>
              </span>
              <ChevronRight size={16} className="ac-taskcard-chevron" />
            </button>
          ))}
        </div>
      ))}
      {groups.length === 0 && <div className="ac-empty">Aucune visite planifiée.</div>}
    </div>
  );
}

function TaskDetail({ task, client, materiels, vehicules, currentUser, onUpdate, onClose }) {
  const { projet, ...prestation } = task;
  const stage = prestation.stage;
  const allowed = canAct(stage, currentUser);

  const [natureExecutee, setNatureExecutee] = useState(prestation.natureExecutee || "");
  const [dateFinExec, setDateFinExec] = useState(prestation.dateFinExec || "");
  const [showReprog, setShowReprog] = useState(false);
  const [reprogDate, setReprogDate] = useState("");

  const materielObjs = (prestation.materielIds || []).map((id) => materiels.find((m) => m.id === id)).filter(Boolean);
  const vehiculeObj = vehicules.find((v) => v.id === prestation.vehiculeId);

  const push = (patch, label) => {
    onUpdate(prestation.id, {
      ...patch,
      history: [...prestation.history, { date: today(), label }],
    });
  };

  const handleAddFiles = (fileList) => {
    const newFiles = Array.from(fileList).map((f) => ({ name: f.name, size: f.size }));
    if (newFiles.length === 0) return;
    push(
      { attachments: [...prestation.attachments, ...newFiles] },
      `${newFiles.length} pièce${newFiles.length > 1 ? "s" : ""} jointe${newFiles.length > 1 ? "s" : ""} ajoutée${newFiles.length > 1 ? "s" : ""}`
    );
  };

  return (
    <motion.div className="ac-detail" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 340, damping: 32 }}>
      <div className="ac-detail-head">
        <button className="ac-iconbtn" onClick={onClose}>
          <ChevronLeft size={22} />
        </button>
        <div className="ac-detail-headtext">
          <div className="ac-detail-id">{prestation.id} · {projet.id}</div>
          <div className="ac-detail-client">{client?.nom || "—"}</div>
        </div>
      </div>

      <div className="ac-detail-body">
        <div className="ac-detail-chips">
          <span className="ac-chip"><MapPin size={12} /> {projet.situation}</span>
          <span className="ac-chip">Réf. {projet.referenceFonciere}</span>
        </div>

        <div className="ac-detail-pipeline">
          <PipelineStepper stage={stage} cycles={prestation.cycles} />
        </div>

        {stage === "affectation" && (
          <div className="ac-card">
            <div className="ac-card-row"><Users size={15} /> {(prestation.agentChantier || []).join(", ") || "—"}</div>
            <div className="ac-card-row"><Wrench size={15} /> {materielObjs.map((m) => m.nom).join(", ") || "—"}</div>
            <div className="ac-card-row"><Truck size={15} /> {vehiculeObj?.nom || "—"}</div>
            <div className="ac-card-row"><Clock size={15} /> Visite prévue le {prestation.dateDebutExec}</div>
            {allowed ? (
              <button
                className="ac-btn ac-btn-primary"
                onClick={() => push({ stage: "execution" }, `Passage à l'exécution — visite du ${prestation.dateDebutExec}`)}
              >
                Démarrer l'exécution
              </button>
            ) : (
              <div className="ac-readonly">En attente de l'agent chantier assigné</div>
            )}
          </div>
        )}

        {stage === "execution" && (
          allowed ? (
            <div className="ac-card">
              {prestation.reprogramme && (
                <div className="ac-notice ac-notice-amber">Visite précédente inachevée — reprise prévue le {prestation.dateDebutExec}</div>
              )}
              {prestation.cycles > 0 && (
                <div className="ac-notice ac-notice-bad">
                  <AlertTriangle size={14} /> Renvoyé pour reprise — une nouvelle exécution est requise.
                </div>
              )}
              <label className="ac-label">Ce qui a été fait sur le terrain</label>
              <textarea className="ac-textarea" rows={4} value={natureExecutee} onChange={(e) => setNatureExecutee(e.target.value)} placeholder="Décrire l'exécution..." />
              <label className="ac-label">Date de fin d'exécution</label>
              <div className="ac-datefield">
                <DatePicker value={dateFinExec} onChange={setDateFinExec} className="ac-dateinput" />
                <button type="button" className="ac-todaybtn" onClick={() => setDateFinExec(today())}>Aujourd'hui</button>
              </div>
              <button
                className="ac-btn ac-btn-primary"
                disabled={!natureExecutee || !dateFinExec}
                onClick={() => push({ stage: "bureau", natureExecutee, dateFinExec, reprogramme: false }, `Exécution saisie — ${natureExecutee}`)}
              >
                Envoyer au bureau
              </button>

              {!showReprog ? (
                <button className="ac-btn ac-btn-outline" onClick={() => setShowReprog(true)}>
                  <PauseCircle size={16} /> Mission non terminée
                </button>
              ) : (
                <div className="ac-reprog">
                  <label className="ac-label">Nouvelle date de visite</label>
                  <DatePicker value={reprogDate} onChange={setReprogDate} className="ac-dateinput" />
                  <button
                    className="ac-btn ac-btn-primary"
                    disabled={!reprogDate}
                    onClick={() => push({ dateDebutExec: reprogDate, reprogramme: true }, `Visite partielle — reprise prévue le ${reprogDate}`)}
                  >
                    Reprogrammer
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="ac-readonly">Réservé à l'agent chantier assigné</div>
          )
        )}

        {!ACTIONABLE_STAGES.includes(stage) && (
          <div className="ac-card">
            <div className="ac-notice">
              {stage === "bureau" && "En cours de traitement au bureau."}
              {stage === "controle" && "En cours de contrôle qualité."}
              {stage === "livraison" && "Livrée — dossier archivé."}
              {(stage === "demande" || stage === "prestation") && "En attente de préparation par le bureau."}
            </div>
          </div>
        )}

        <div className="ac-card">
          <div className="ac-card-heading"><Paperclip size={14} /> Pièces jointes ({prestation.attachments.length})</div>
          {allowed && (
            <label className="ac-btn ac-btn-outline ac-attach">
              <Paperclip size={15} /> Ajouter des photos / fichiers
              <input type="file" multiple onChange={(e) => { handleAddFiles(e.target.files); e.target.value = ""; }} />
            </label>
          )}
          {prestation.attachments.length > 0 && (
            <div className="ac-attach-list">
              {prestation.attachments.map((a, i) => (
                <div className="ac-attach-item" key={i}>
                  <span className="ac-attach-ext">{fileExt(a.name)}</span>
                  <span className="ac-attach-name">{a.name}</span>
                  <span className="ac-attach-size">{formatFileSize(a.size)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="ac-card">
          <div className="ac-card-heading"><Clock size={14} /> Historique récent</div>
          <div className="ac-timeline">
            {prestation.history.slice().reverse().slice(0, 5).map((h, i) => (
              <div className="ac-timeline-row" key={i}>
                <div className="ac-timeline-dot" />
                <div>
                  <div className="ac-timeline-date">{h.date}</div>
                  <div className="ac-timeline-label">{h.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function AgentChantierApp({ currentUser, tasks, projects, materiels, vehicules, getClient, onUpdatePrestation }) {
  const [tab, setTab] = useState("taches");
  const [openId, setOpenId] = useState(null);

  const sortedTasks = useMemo(() => {
    const rank = (t) => (ACTIONABLE_STAGES.includes(t.stage) ? 0 : 1);
    return [...tasks].sort((a, b) => rank(a) - rank(b));
  }, [tasks]);

  const openTask = openId ? tasks.find((t) => t.id === openId) : null;
  const todoCount = tasks.filter((t) => ACTIONABLE_STAGES.includes(t.stage)).length;

  return (
    <div className="ac-app">
      <div className="ac-header">
        <div className="ac-header-greeting">Bonjour, {currentUser.name}</div>
        <div className="ac-header-sub">
          {todoCount > 0 ? `${todoCount} mission${todoCount > 1 ? "s" : ""} à traiter` : "Rien à traiter pour le moment"}
        </div>
      </div>

      <div className="ac-content">
        {tab === "taches" && (
          <div className="ac-tasklist">
            {sortedTasks.map((t) => (
              <TaskCard key={t.id} task={t} onOpen={setOpenId} />
            ))}
            {sortedTasks.length === 0 && <div className="ac-empty">Aucune mission assignée.</div>}
          </div>
        )}

        {tab === "carte" && (
          <div className="ac-fullpane">
            <MapView
              projects={projects}
              getClient={getClient}
              onOpenProjet={(projetId) => {
                const match = tasks.find((t) => t.projet.id === projetId);
                if (match) setOpenId(match.id);
                setTab("taches");
              }}
            />
          </div>
        )}

        {tab === "planning" && <AgentPlanning tasks={tasks} onOpen={setOpenId} />}
      </div>

      <div className="ac-navbar">
        <button className={`ac-navbtn ${tab === "taches" ? "active" : ""}`} onClick={() => setTab("taches")}>
          <ClipboardList size={20} />
          <span>Mes tâches</span>
        </button>
        <button className={`ac-navbtn ${tab === "carte" ? "active" : ""}`} onClick={() => setTab("carte")}>
          <MapIcon size={20} />
          <span>Carte</span>
        </button>
        <button className={`ac-navbtn ${tab === "planning" ? "active" : ""}`} onClick={() => setTab("planning")}>
          <CalendarDays size={20} />
          <span>Planning</span>
        </button>
      </div>

      <AnimatePresence>
        {openTask && (
          <TaskDetail
            key="task-detail"
            task={openTask}
            client={getClient(openTask.projet.clientId)}
            materiels={materiels}
            vehicules={vehicules}
            currentUser={currentUser}
            onUpdate={onUpdatePrestation}
            onClose={() => setOpenId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
