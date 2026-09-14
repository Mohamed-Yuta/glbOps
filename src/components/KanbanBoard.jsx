import React from "react";
import { motion } from "framer-motion";
import { STAGES, STAGE_COLORS } from "../constants";
import { fadeUpVariants, staggerContainer } from "../lib/motionVariants";

export default function KanbanBoard({ projects, getClient, onOpenProjet, getProjetStage }) {
  return (
    <motion.div className="gt-kanban" variants={staggerContainer} initial="hidden" animate="visible">
      {STAGES.map((stage) => {
        const colProjects = projects.filter((pr) => getProjetStage(pr) === stage.key);
        return (
          <motion.div className="gt-kanban-col" key={stage.key} variants={fadeUpVariants}>
            <div className="gt-kanban-col-head" style={{ borderBottomColor: STAGE_COLORS[stage.key] }}>
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
