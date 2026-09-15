import React from "react";
import { motion } from "framer-motion";
import { STAGES, STAGE_COLORS } from "../constants";
import { fadeUpVariants, staggerContainer } from "../lib/motionVariants";

// A project with no prestations yet (or none still active) has no STAGES key to land in, so it
// gets its own leading column instead of silently vanishing from the board.
const NO_STAGE_COLUMN = { key: null, label: "Sans prestation" };

export default function KanbanBoard({ projects, getClient, onOpenProjet, getProjetStage }) {
  const columns = [NO_STAGE_COLUMN, ...STAGES];
  return (
    <motion.div className="gt-kanban" variants={staggerContainer} initial="hidden" animate="visible">
      {columns.map((stage) => {
        const colProjects = projects.filter((pr) => getProjetStage(pr) === stage.key);
        return (
          <motion.div className="gt-kanban-col" key={stage.key ?? "sans-prestation"} variants={fadeUpVariants}>
            <div className="gt-kanban-col-head" style={{ borderBottomColor: stage.key ? STAGE_COLORS[stage.key] : "var(--muted)" }}>
              {stage.label}
              <span className="gt-kanban-col-count">{colProjects.length}</span>
            </div>
            <div className="gt-kanban-col-body">
              {colProjects.map((pr) => {
                const client = getClient(pr.clientId);
                return (
                  <div className="gt-kanban-card" key={pr.id} onClick={() => onOpenProjet(pr.id)}>
                    <div className="gt-kanban-card-id gt-mono">{pr.id}</div>
                    <div className="gt-kanban-card-client">{client?.nom || "—"}</div>
                    <div className="gt-kanban-card-meta">{pr.referenceFonciere}</div>
                    <div className="gt-kanban-card-meta">
                      {pr.prestations.length} prestation{pr.prestations.length > 1 ? "s" : ""}
                    </div>
                  </div>
                );
              })}
              {colProjects.length === 0 && <div className="gt-kanban-empty">Aucun projet.</div>}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
