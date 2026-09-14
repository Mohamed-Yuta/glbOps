import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Check, Pencil, Folder, AlertTriangle, Plus } from "lucide-react";
import { computeClientStats } from "../utils/stats";
import { formatTimestamp } from "../utils/dates";
import { backdropVariants, drawerVariants } from "../lib/motionVariants";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default function ClientDrawer({ client, projects, onClose, onOpenProjet, onNewProjetForClient, onEditClient, isOffice }) {
  const [editing, setEditing] = useState(false);
  const [nomDraft, setNomDraft] = useState(client.nom);
  const [codeDraft, setCodeDraft] = useState(client.code);
  const stats = computeClientStats(client, projects);

  const submitEdit = () => {
    if (nomDraft.trim()) onEditClient(client.id, { nom: nomDraft.trim(), code: codeDraft.trim() || client.code });
    setEditing(false);
  };

  return (
    <motion.div className="gt-drawer-backdrop" onClick={onClose} variants={backdropVariants} initial="hidden" animate="visible" exit="exit">
      <motion.div className="gt-drawer" onClick={(e) => e.stopPropagation()} variants={drawerVariants} initial="hidden" animate="visible" exit="exit">
        <div className="gt-drawer-head">
          <div style={{ flex: 1 }}>
            {editing ? (
              <div className="gt-editbox">
                <input value={codeDraft} onChange={(e) => setCodeDraft(e.target.value)} placeholder="Code client" className="gt-mono" />
                <input value={nomDraft} onChange={(e) => setNomDraft(e.target.value)} placeholder="Nom du client" autoFocus onKeyDown={(e) => e.key === "Enter" && submitEdit()} />
                <button className="gt-iconbtn" onClick={submitEdit}>
                  <Check size={16} />
                </button>
              </div>
            ) : (
              <>
                <div className="gt-mono gt-drawer-id">{client.code}</div>
                <div className="gt-drawer-client">
                  {client.nom}
                  {isOffice && (
                    <button className="gt-iconbtn gt-rename-btn" onClick={() => { setNomDraft(client.nom); setCodeDraft(client.code); setEditing(true); }}>
                      <Pencil size={13} />
                    </button>
                  )}
                </div>
              </>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Projet</TableHead>
                  <TableHead>Nature / situation</TableHead>
                  <TableHead>Prestations</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.projects.map((pr) => (
                  <TableRow key={pr.id} className="cursor-pointer" onClick={() => onOpenProjet(pr.id)}>
                    <TableCell className="font-mono">{pr.id}</TableCell>
                    <TableCell className="font-semibold">{pr.naturePrestationProjet || pr.situation}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {pr.prestations.length} prestation{pr.prestations.length > 1 ? "s" : ""}
                    </TableCell>
                  </TableRow>
                ))}
                {stats.projects.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-muted-foreground text-center">
                      Aucun projet pour ce client.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {isOffice && (
              <Button className="mt-3" onClick={() => onNewProjetForClient(client)}>
                <Plus size={14} /> Nouveau projet pour ce client
              </Button>
            )}
          </section>
        </div>
      </motion.div>
    </motion.div>
  );
}
