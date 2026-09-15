import React from "react";
import { Clock, CheckCircle2, PauseCircle, AlertTriangle, XCircle, Archive, Users, FolderOpen, FileText } from "lucide-react";

// Classifies a history label into an icon + color so entries are scannable at a glance
// without rereading the full sentence. Colors reuse the app's existing STAGE_COLORS-style
// tokens — no new palette.
const EVENT_TYPES = [
  { match: /^Demande reçue/, icon: FileText, color: "var(--muted)" },
  { match: /^Prestation définie/, icon: FileText, color: "var(--blue)" },
  { match: /^Affectation/, icon: Users, color: "var(--accent)" },
  { match: /^(Passage à l'exécution|Exécution saisie|Nouvelle exécution)/, icon: CheckCircle2, color: "var(--amber)" },
  { match: /^Visite partielle/, icon: PauseCircle, color: "var(--amber)" },
  { match: /^Données insuffisantes/, icon: AlertTriangle, color: "var(--bad)" },
  { match: /^Tâches affectées/, icon: Users, color: "var(--teal)" },
  { match: /^Traitement bureau terminé/, icon: CheckCircle2, color: "var(--teal)" },
  { match: /^Non conforme/, icon: XCircle, color: "var(--bad)" },
  { match: /^Contrôle conforme/, icon: CheckCircle2, color: "var(--violet)" },
  { match: /^Livré/, icon: Archive, color: "var(--good)" },
  { match: /^(Chemin ajouté|.*pièce.*jointe)/i, icon: FolderOpen, color: "var(--muted)" },
];
const DEFAULT_EVENT = { icon: Clock, color: "var(--muted)" };

const classify = (label) => EVENT_TYPES.find((e) => e.match.test(label)) || DEFAULT_EVENT;

// Consecutive entries with the identical label + author collapse into one row with a ×N
// badge, so a real bug (or a legitimate repeat) reads as one grouped event instead of a wall
// of identical lines.
function groupConsecutive(history) {
  const grouped = [];
  (history || []).forEach((h) => {
    const last = grouped[grouped.length - 1];
    if (last && last.label === h.label && last.author === h.author) {
      last.count += 1;
      last.lastDate = h.date;
    } else {
      grouped.push({ ...h, count: 1, lastDate: h.date });
    }
  });
  return grouped;
}

export default function HistoriqueTimeline({ history, limit, emptyLabel = "Aucun événement pour l'instant." }) {
  const grouped = groupConsecutive(history).reverse();
  const shown = limit ? grouped.slice(0, limit) : grouped;

  return (
    <div className="gt-timeline">
      {shown.map((h, i) => {
        const { icon: Icon, color } = classify(h.label);
        return (
          <div className="gt-timeline-row" key={i}>
            <div className="gt-timeline-icon" style={{ color, borderColor: color }}>
              <Icon size={12} />
            </div>
            <div className="gt-timeline-body">
              <div className="gt-mono gt-timeline-date">
                {h.count > 1 ? `${h.date} → ${h.lastDate}` : h.date}
                {h.author && <span className="gt-timeline-author"> · {h.author}</span>}
                {h.count > 1 && <span className="gt-timeline-count">×{h.count}</span>}
              </div>
              <div className="gt-timeline-label">{h.label}</div>
            </div>
          </div>
        );
      })}
      {shown.length === 0 && <div className="gt-list-empty">{emptyLabel}</div>}
    </div>
  );
}
