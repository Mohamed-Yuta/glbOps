import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutGrid, CalendarDays, AlertTriangle, MapPin, ChevronRight, ClipboardList } from "lucide-react";
import { STAGE_COLORS, STAGES } from "../constants";
import { parseDateFR, today } from "../utils/dates";
import { notifySuccess, notifyError } from "../utils/notify";
import { rejectionReason, buildNotifications } from "../utils/notifications";
import { staggerContainer, fadeUpVariants } from "../lib/motionVariants";
import PrestationDrawer from "./PrestationDrawer";
import NotificationBell from "./NotificationBell";

const COLUMNS = [
  { key: "attente", label: "En attente terrain", stages: ["demande", "prestation", "affectation", "execution"] },
  { key: "traiter", label: "À traiter", stages: ["bureau"] },
  { key: "controle", label: "Envoyé au contrôle", stages: ["controle"] },
  { key: "livre", label: "Livré", stages: ["livraison"] },
];

function columnOf(stage) {
  return COLUMNS.find((c) => c.stages.includes(stage))?.key;
}

function dateForColumn(prestation, colKey) {
  if (colKey === "attente") return prestation.dateDebutExec;
  if (colKey === "traiter") return prestation.dateFinExec;
  if (colKey === "controle") return prestation.dateFinBureau;
  if (colKey === "livre") return prestation.dateLivraison;
  return null;
}

function BureauCard({ task, client, colKey, onOpen, onDragStart, draggable }) {
  const { projet, ...prestation } = task;
  const date = dateForColumn(prestation, colKey);
  const reason = rejectionReason(prestation);
  const taches = prestation.taches || [];
  const doneCount = taches.filter((t) => t.done).length;
  return (
    <button
      className={`ab-card ${colKey === "traiter" ? "actionable" : ""} ${reason ? "rejected" : ""}`}
      onClick={() => onOpen(prestation.id)}
      draggable={draggable}
      onDragStart={draggable ? (e) => onDragStart(e, prestation.id) : undefined}
    >
      <div className="ab-card-stripe" style={{ background: reason ? "var(--bad)" : STAGE_COLORS[prestation.stage] }} />
      <div className="ab-card-body">
        <div className="ab-card-top">
          <span className="ab-card-id gt-mono">{projet.id}</span>
          {reason && (
            <span className="ab-card-flag">
              <AlertTriangle size={11} /> Retour
            </span>
          )}
        </div>
        <div className="ab-card-client">{client?.nom || "—"}</div>
        <div className="ab-card-nature">{prestation.natureExecutee || prestation.natureDemandee || "Prestation"}</div>
        {reason && (
          <div className="ab-card-rejectreason">
            <AlertTriangle size={11} /> {reason}
          </div>
        )}
        <div className="ab-card-meta">
          <MapPin size={11} /> {projet.situation}
        </div>
        <div className="ab-card-bottom">
          <span className="ab-card-agents">{(prestation.agentChantier || []).join(", ") || "—"}</span>
          {date && <span className="ab-card-date">{date}</span>}
        </div>
        {taches.length > 0 && (
          <div className="ab-card-taches">
            <ClipboardList size={11} /> {doneCount}/{taches.length} tâche{taches.length > 1 ? "s" : ""} complète{taches.length > 1 ? "s" : ""}
            <div className="gt-progressbar" style={{ marginTop: 4 }}>
              <div className="gt-progressbar-fill" style={{ width: `${taches.length ? (doneCount / taches.length) * 100 : 0}%` }} />
            </div>
          </div>
        )}
      </div>
    </button>
  );
}

function formatAgendaHeading(dateFR) {
  const t = parseDateFR(dateFR);
  if (t == null) return dateFR;
  const label = new Date(t).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function stageLabel(key) {
  return STAGES.find((s) => s.key === key)?.label || key;
}

function BureauAgenda({ tasks, getClient, onOpen }) {
  const groups = useMemo(() => {
    const map = new Map();
    tasks.forEach((t) => {
      const colKey = columnOf(t.stage);
      const date = colKey && dateForColumn(t, colKey);
      if (!date) return;
      if (!map.has(date)) map.set(date, []);
      map.get(date).push(t);
    });
    return [...map.entries()].sort((a, b) => (parseDateFR(a[0]) || 0) - (parseDateFR(b[0]) || 0));
  }, [tasks]);

  return (
    <div className="ab-agenda">
      {groups.map(([dateFR, items]) => (
        <div className="ab-agenda-group" key={dateFR}>
          <div className="ab-agenda-date">{formatAgendaHeading(dateFR)}</div>
          {items.map((t) => (
            <button key={t.id} className="ab-agenda-item" onClick={() => onOpen(t.id)}>
              <span className="ab-agenda-dot" style={{ background: STAGE_COLORS[t.stage] }} />
              <span className="ab-agenda-item-body">
                <span className="ab-agenda-item-title">{getClient(t.projet.clientId)?.nom || t.projet.id}</span>
                <span className="ab-agenda-item-meta">{stageLabel(t.stage)} · {t.natureExecutee || t.natureDemandee || "Prestation"}</span>
              </span>
              <ChevronRight size={16} className="ab-agenda-chevron" />
            </button>
          ))}
        </div>
      ))}
      {groups.length === 0 && <div className="ab-col-empty">Aucun dossier à afficher.</div>}
    </div>
  );
}

export default function AgentBureauApp({ currentUser, tasks, materiels, vehicules, employees, allProjets, getClient, onUpdatePrestation }) {
  const [tab, setTab] = useState("kanban");
  const [openId, setOpenId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);

  const grouped = useMemo(() => {
    const map = { attente: [], traiter: [], controle: [], livre: [] };
    tasks.forEach((t) => {
      const key = columnOf(t.stage);
      if (key) map[key].push(t);
    });
    map.traiter.sort((a, b) => (parseDateFR(a.dateFinExec) || 0) - (parseDateFR(b.dateFinExec) || 0));
    map.attente.sort((a, b) => (rejectionReason(b) ? 1 : 0) - (rejectionReason(a) ? 1 : 0));
    return map;
  }, [tasks]);

  // Drag-and-drop only makes sense for the one transition Agent Bureau actually controls
  // themselves: a "À traiter" card dropped onto "Envoyé au contrôle". Anything else (the
  // other columns are driven by other roles) is not a valid drop target.
  const handleDragStart = (e, prestationId) => {
    e.dataTransfer.setData("text/plain", prestationId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (e, targetColKey) => {
    e.preventDefault();
    setDragOverCol(null);
    if (targetColKey !== "controle") return;
    const prestationId = e.dataTransfer.getData("text/plain");
    const task = tasks.find((t) => t.id === prestationId);
    if (!task || columnOf(task.stage) !== "traiter") return;

    const taches = task.taches || [];
    const ready = taches.length > 0 && taches.every((t) => (t.agents || []).length > 0) && task.ref && String(task.ref).trim();
    if (!ready) {
      notifyError("Référence et tâches requises avant d'envoyer au contrôle — ouverture du dossier");
      setOpenId(prestationId);
      return;
    }
    onUpdatePrestation(prestationId, {
      stage: "controle",
      history: [
        ...task.history,
        { date: today(), label: "Traitement bureau terminé (glisser-déposer)", author: currentUser.name || currentUser.role },
      ],
    });
    notifySuccess("Envoyé au contrôle");
  };

  const openTask = openId ? tasks.find((t) => t.id === openId) : null;
  const todoCount = grouped.traiter.length;
  const rejectedCount = tasks.filter((t) => rejectionReason(t)).length;
  const notifications = useMemo(() => buildNotifications(currentUser, { tasks, getClient }), [currentUser, tasks, getClient]);

  return (
    <div className="ab-app">
      <div className="ab-header">
        <div>
          <div className="ab-header-greeting">Bonjour, {currentUser.name}</div>
          <div className="ab-header-sub">
            {todoCount > 0 ? `${todoCount} dossier${todoCount > 1 ? "s" : ""} à traiter` : "Rien à traiter pour le moment"}
          </div>
          {rejectedCount > 0 && (
            <div className="ab-header-alert">
              <AlertTriangle size={13} /> {rejectedCount} dossier{rejectedCount > 1 ? "s" : ""} renvoyé{rejectedCount > 1 ? "s" : ""} au terrain — voir « En attente terrain »
            </div>
          )}
        </div>
        <div className="ab-header-right">
          <div className="ab-tabs">
            <button className={tab === "kanban" ? "active" : ""} onClick={() => setTab("kanban")}>
              <LayoutGrid size={14} /> Kanban
            </button>
            <button className={tab === "calendrier" ? "active" : ""} onClick={() => setTab("calendrier")}>
              <CalendarDays size={14} /> Agenda
            </button>
          </div>
          <NotificationBell notifications={notifications} onOpen={(n) => setOpenId(n.prestationId)} />
        </div>
      </div>

      {tab === "kanban" && (
        <motion.div className="ab-kanban" variants={staggerContainer} initial="hidden" animate="visible">
          {COLUMNS.map((col) => (
            <motion.div className="ab-col" key={col.key} variants={fadeUpVariants}>
              <div className="ab-col-head">
                {col.label}
                <span className="ab-col-count">{grouped[col.key].length}</span>
              </div>
              <div
                className={`ab-col-body ${dragOverCol === col.key ? "drag-over" : ""}`}
                onDragOver={col.key === "controle" ? (e) => { e.preventDefault(); setDragOverCol("controle"); } : undefined}
                onDragLeave={col.key === "controle" ? () => setDragOverCol(null) : undefined}
                onDrop={col.key === "controle" ? (e) => handleDrop(e, col.key) : undefined}
              >
                {grouped[col.key].map((t) => (
                  <BureauCard
                    key={t.id}
                    task={t}
                    client={getClient(t.projet.clientId)}
                    colKey={col.key}
                    onOpen={setOpenId}
                    draggable={col.key === "traiter"}
                    onDragStart={handleDragStart}
                  />
                ))}
                {grouped[col.key].length === 0 && <div className="ab-col-empty">Aucun dossier.</div>}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {tab === "calendrier" && (
        <div className="ab-fullpane">
          <BureauAgenda tasks={tasks} getClient={getClient} onOpen={setOpenId} />
        </div>
      )}

      <AnimatePresence>
        {openTask && (() => {
          const { projet, ...prestation } = openTask;
          return (
            <PrestationDrawer
              key={prestation.id}
              projet={projet}
              client={getClient(projet.clientId)}
              prestation={prestation}
              materiels={materiels}
              vehicules={vehicules}
              employees={employees}
              allProjets={allProjets}
              onClose={() => setOpenId(null)}
              onUpdate={onUpdatePrestation}
              currentUser={currentUser}
            />
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
