import React, { useMemo, useState } from "react";
import { AlertTriangle, Palmtree, Building2 } from "lucide-react";
import { computeEmployeeStats } from "../utils/stats";
import { parseDateFR, nowMs } from "../utils/dates";
import { STAGES, STAGE_COLORS, RESOURCE_STATUSES } from "../constants";
import HistoriqueTimeline from "./HistoriqueTimeline";
import ResourceTypeIcon from "./ResourceTypeIcon";
import { DatePicker } from "@/components/ui/date-picker";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

const startOfDay = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
const endOfDay = (t) => { const d = new Date(t); d.setHours(23, 59, 59, 999); return d.getTime(); };

// Cette semaine / ce mois / personnalisé — scopes only "Livrées" and the pipeline cohort below
// (current-state cards like "En retard" or "Non conformes actuellement" stay live regardless,
// they describe right now, not a period).
function getRange(mode, customFrom, customTo) {
  const now = new Date();
  if (mode === "week") {
    const day = (now.getDay() + 6) % 7;
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return { start: startOfDay(start.getTime()), end: endOfDay(end.getTime()), label: "cette semaine" };
  }
  if (mode === "custom") {
    const s = parseDateFR(customFrom);
    const e = parseDateFR(customTo);
    return { start: s != null ? startOfDay(s) : null, end: e != null ? endOfDay(e) : null, label: "sur la période" };
  }
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { start: startOfDay(start.getTime()), end: endOfDay(end.getTime()), label: "ce mois" };
}

const inRange = (dateFR, range) => {
  const t = parseDateFR(dateFR);
  if (t == null || range.start == null || range.end == null) return false;
  return t >= range.start && t <= range.end;
};

// Non-conformity rate for the N-th month back, from prestations whose intake (first history
// entry) falls in that calendar month. Needs at least 3 prestations that month or it returns
// null — a rate over 1-2 data points is noise, not a signal.
function nonConfRateForMonth(prestations, monthsAgo) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1).getTime();
  const end = new Date(now.getFullYear(), now.getMonth() - monthsAgo + 1, 0, 23, 59, 59, 999).getTime();
  const cohort = prestations.filter((p) => {
    const t = parseDateFR(p.history?.[0]?.date);
    return t != null && t >= start && t <= end;
  });
  if (cohort.length < 3) return null;
  const nonConf = cohort.filter((p) => p.cycles > 0).length;
  return { rate: nonConf / cohort.length, n: cohort.length };
}

export default function OverviewDashboard({
  projets,
  allPrestationsFlat,
  materiels,
  vehicules,
  employees,
  getClient,
  enRetardCount,
  onOpenMateriel,
  onOpenVehicule,
  onOpenEmployee,
  onOpenClient,
  onOpenPrestation,
}) {
  const [rangeMode, setRangeMode] = useState("month");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const range = useMemo(() => getRange(rangeMode, customFrom, customTo), [rangeMode, customFrom, customTo]);

  const prestationsActives = useMemo(
    () => allPrestationsFlat.filter((p) => p.stage !== "livraison" || !p.chemin).length,
    [allPrestationsFlat]
  );
  const nonConfActuel = useMemo(
    () => allPrestationsFlat.filter((p) => p.cycles > 0 && (p.stage !== "livraison" || !p.chemin)).length,
    [allPrestationsFlat]
  );
  const livreesPeriode = useMemo(
    () => allPrestationsFlat.filter((p) => p.stage === "livraison" && p.chemin && inRange(p.dateLivraison, range)).length,
    [allPrestationsFlat, range]
  );

  const funnel = useMemo(() => {
    const cohort = allPrestationsFlat.filter((p) => inRange(p.history?.[0]?.date, range));
    const total = cohort.length;
    const counts = STAGES.map((s) => cohort.filter((p) => p.stage === s.key).length);
    return STAGES.map((s, i) => ({
      ...s,
      count: counts[i],
      pct: total > 0 ? Math.round((counts[i] / total) * 100) : 0,
      dropoff: i === 0 ? null : counts[i - 1] - counts[i],
    }));
  }, [allPrestationsFlat, range]);
  const funnelTotal = funnel.reduce((s, f) => s + f.count, 0);
  const funnelMax = Math.max(1, ...funnel.map((f) => f.count));

  const workload = useMemo(() => {
    const weekAgo = nowMs() - 7 * 86400000;
    return employees
      .filter((e) => (e.status || "actif") === "actif")
      .map((e) => {
        const { assignments } = computeEmployeeStats(e, projets);
        let enCours = 0, nonConf = 0, livreesSemaine = 0;
        assignments.forEach(({ prestation }) => {
          const archived = prestation.stage === "livraison" && prestation.chemin;
          if (archived) {
            const t = parseDateFR(prestation.dateLivraison);
            if (t != null && t >= weekAgo) livreesSemaine += 1;
          } else if (prestation.cycles > 0) {
            nonConf += 1;
          } else {
            enCours += 1;
          }
        });
        const total = enCours + nonConf + livreesSemaine;
        const parts = [];
        if (enCours > 0) parts.push(`${enCours} en cours`);
        if (nonConf > 0) parts.push(`${nonConf} non conforme${nonConf > 1 ? "s" : ""}`);
        if (livreesSemaine > 0) parts.push(`${livreesSemaine} livrée${livreesSemaine > 1 ? "s" : ""} cette semaine`);
        return { employee: e, enCours, nonConf, livreesSemaine, total, caption: parts.join(" · ") };
      })
      .filter((w) => w.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
  }, [employees, projets]);

  const recentActivity = useMemo(() => {
    const rows = [];
    projets.forEach((pr) => {
      pr.prestations.forEach((p) => {
        (p.history || []).forEach((h) => rows.push({ ...h, tag: p.id }));
      });
    });
    rows.sort((a, b) => (parseDateFR(a.date) || 0) - (parseDateFR(b.date) || 0));
    return rows;
  }, [projets]);

  const resourceAlerts = useMemo(() => {
    const all = [
      ...materiels.map((m) => ({ ...m, kindLabel: "Matériel", onOpen: onOpenMateriel })),
      ...vehicules.map((v) => ({ ...v, kindLabel: "Véhicule", onOpen: onOpenVehicule })),
    ];
    return all
      .filter((r) => (r.status || "operationnel") !== "operationnel")
      .sort((a, b) => (a.status === "hors_service" ? 0 : 1) - (b.status === "hors_service" ? 0 : 1));
  }, [materiels, vehicules, onOpenMateriel, onOpenVehicule]);

  const pendingConges = useMemo(() => {
    const rows = [];
    employees.forEach((e) => {
      (e.conges || []).forEach((c) => {
        if (c.statut === "en_attente") rows.push({ employee: e, conge: c });
      });
    });
    rows.sort((a, b) => (parseDateFR(a.conge.dateDebut) || 0) - (parseDateFR(b.conge.dateDebut) || 0));
    return rows;
  }, [employees]);

  const watchClients = useMemo(() => {
    const now = nowMs();
    const byClient = new Map();
    projets.forEach((pr) => {
      pr.prestations.forEach((p) => {
        const nonConfActive = p.cycles > 0 && (p.stage !== "livraison" || !p.chemin);
        const late = p.stage === "affectation" && (parseDateFR(p.dateDebutExec) ?? Infinity) < now;
        if (!nonConfActive && !late) return;
        const entry = byClient.get(pr.clientId) || { clientId: pr.clientId, nonConf: 0, retard: 0 };
        if (nonConfActive) entry.nonConf += 1;
        if (late) entry.retard += 1;
        byClient.set(pr.clientId, entry);
      });
    });
    return [...byClient.values()]
      .map((e) => ({ ...e, client: getClient(e.clientId) }))
      .filter((e) => e.client)
      .sort((a, b) => (b.nonConf + b.retard) - (a.nonConf + a.retard));
  }, [projets, getClient]);

  const totalWatch = watchClients.length + resourceAlerts.length + pendingConges.length;

  // ONE genuinely important signal, priority order — never render more than one, never render
  // a fake positive when nothing is actually wrong.
  const insight = useMemo(() => {
    if (enRetardCount > 0) {
      return {
        title: `${enRetardCount} prestation${enRetardCount > 1 ? "s" : ""} en retard cette semaine`,
        sub: "Visite terrain prévue non démarrée — affectation à revoir",
      };
    }
    if (nonConfActuel > 0) {
      return {
        title: `${nonConfActuel} prestation${nonConfActuel > 1 ? "s" : ""} non conforme${nonConfActuel > 1 ? "s" : ""} en attente de reprise`,
        sub: "Retour de non-conformité — reprise à planifier",
      };
    }
    const curr = nonConfRateForMonth(allPrestationsFlat, 0);
    const prev = nonConfRateForMonth(allPrestationsFlat, 1);
    if (curr && curr.rate >= 0.2 && (!prev || curr.rate >= prev.rate + 0.1)) {
      return {
        title: `Taux de non-conformité : ${Math.round(curr.rate * 100)}% ce mois`,
        sub: prev ? `vs ${Math.round(prev.rate * 100)}% le mois précédent` : "Sur les prestations démarrées ce mois-ci",
      };
    }
    return null;
  }, [enRetardCount, nonConfActuel, allPrestationsFlat]);

  return (
    <div className="gt-dash">
      <div className="gt-dash-rangebar">
        <span className="gt-projtoolbar-label">Période</span>
        <div className="gt-viewtoggle">
          <button type="button" className={rangeMode === "week" ? "active" : ""} onClick={() => setRangeMode("week")}>Cette semaine</button>
          <button type="button" className={rangeMode === "month" ? "active" : ""} onClick={() => setRangeMode("month")}>Ce mois</button>
          <button type="button" className={rangeMode === "custom" ? "active" : ""} onClick={() => setRangeMode("custom")}>Personnalisé</button>
        </div>
        {rangeMode === "custom" && (
          <div className="gt-dash-rangebar-custom">
            <DatePicker value={customFrom} onChange={setCustomFrom} className="min-w-[130px]" />
            <span className="gt-dash-rangebar-sep">→</span>
            <DatePicker value={customTo} onChange={setCustomTo} className="min-w-[130px]" />
          </div>
        )}
        <span className="gt-dash-rangebar-hint">s'applique à « Livrées » et au pipeline ci-dessous</span>
      </div>

      {insight && (
        <div className="gt-insight-card">
          <div className="gt-insight-icon"><AlertTriangle size={18} /></div>
          <div className="gt-insight-body">
            <div className="gt-insight-title">{insight.title}</div>
            <div className="gt-insight-sub">{insight.sub}</div>
          </div>
        </div>
      )}

      <div className="gt-stats">
        <div className="gt-stat gt-card">
          <div className="gt-stat-label">Prestations actives</div>
          <div className="gt-stat-num">{prestationsActives}</div>
        </div>
        <div className="gt-stat gt-card">
          <div className="gt-stat-label">Non conformes actuellement</div>
          <div className="gt-stat-num">{nonConfActuel}</div>
          <span className={`gt-status-pill ${nonConfActuel > 0 ? "danger" : "neutral"}`}>
            <span className="gt-status-pill-dot" />{nonConfActuel > 0 ? "À traiter" : "Aucune"}
          </span>
        </div>
        <div className="gt-stat gt-card">
          <div className="gt-stat-label">Livrées ({range.label})</div>
          <div className="gt-stat-num">{livreesPeriode}</div>
          <span className="gt-status-pill success"><span className="gt-status-pill-dot" />Conforme</span>
        </div>
        <div className="gt-stat gt-card">
          <div className="gt-stat-label">En retard</div>
          <div className="gt-stat-num">{enRetardCount}</div>
          <span className={`gt-status-pill ${enRetardCount > 0 ? "warning" : "neutral"}`}>
            <span className="gt-status-pill-dot" />{enRetardCount > 0 ? "À revoir" : "Aucune"}
          </span>
        </div>
      </div>

      <div className="gt-dash-row">
        <div className="gt-dash-panel gt-dash-panel-wide">
          <div className="gt-dash-panel-head">
            <span className="gt-dash-panel-title">Pipeline ({range.label})</span>
            {funnelTotal > 0 && <span className="gt-dash-panel-count">{funnelTotal} prestation{funnelTotal > 1 ? "s" : ""}</span>}
          </div>
          {funnelTotal === 0 ? (
            <div className="gt-list-empty">Aucune prestation démarrée sur cette période.</div>
          ) : (
            <TooltipProvider>
              <div className="gt-dash-funnel">
                {funnel.map((s, i) => (
                  <Tooltip key={s.key}>
                    <TooltipTrigger asChild>
                      <div className="gt-dash-funnel-row">
                        <span className="gt-dash-funnel-label">{s.label}</span>
                        <div className="gt-dash-funnel-bar">
                          {s.count > 0 && (
                            <div className="gt-dash-funnel-fill" style={{ width: `${(s.count / funnelMax) * 100}%`, background: STAGE_COLORS[s.key] }} />
                          )}
                        </div>
                        <span className="gt-dash-funnel-count">{s.count}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      {s.count} prestation{s.count > 1 ? "s" : ""} · {s.pct}% du total
                      {i > 0 && s.dropoff != null ? ` · ${s.dropoff >= 0 ? "-" : "+"}${Math.abs(s.dropoff)} vs étape précédente` : ""}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </TooltipProvider>
          )}
        </div>

        <div className="gt-dash-panel">
          <div className="gt-dash-panel-head">
            <span className="gt-dash-panel-title">Charge de travail</span>
          </div>
          {workload.length === 0 ? (
            <div className="gt-list-empty">Aucune charge active.</div>
          ) : (
            workload.map((w) => (
              <div key={w.employee.id} className="gt-dash-workload-row">
                <div className="gt-dash-workload-head">
                  <span className="gt-dash-workload-name">
                    {w.employee.nom}
                    <span className="gt-dash-workload-role">{w.employee.poste || w.employee.role}</span>
                  </span>
                  <span className="gt-dash-workload-total">{w.total}</span>
                </div>
                <div className="gt-segbar">
                  {w.enCours > 0 && <div className="gt-segbar-seg info" style={{ width: `${(w.enCours / w.total) * 100}%` }} />}
                  {w.nonConf > 0 && <div className="gt-segbar-seg danger" style={{ width: `${(w.nonConf / w.total) * 100}%` }} />}
                  {w.livreesSemaine > 0 && <div className="gt-segbar-seg success" style={{ width: `${(w.livreesSemaine / w.total) * 100}%` }} />}
                </div>
                <div className="gt-segbar-caption">{w.caption}</div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="gt-dash-row">
        <div className="gt-dash-panel gt-dash-panel-wide">
          <div className="gt-dash-panel-head">
            <span className="gt-dash-panel-title">Activité récente</span>
          </div>
          <div className="gt-dash-scrollbody">
            <HistoriqueTimeline history={recentActivity} limit={10} emptyLabel="Aucune activité récente." onOpenTag={onOpenPrestation} />
          </div>
        </div>

        <div className="gt-dash-panel">
          <div className="gt-dash-panel-head">
            <span className="gt-dash-panel-title">À surveiller</span>
            {totalWatch > 0 && <span className="gt-dash-panel-count">{totalWatch}</span>}
          </div>
          {totalWatch === 0 ? (
            <div className="gt-list-empty">Rien à signaler pour le moment.</div>
          ) : (
            <div className="gt-dash-scrollbody">
              {watchClients.length > 0 && (
                <>
                  <div className="gt-dash-subhead">Clients</div>
                  {watchClients.map((w) => (
                    <div key={w.clientId} className="gt-dash-alertrow" onClick={() => onOpenClient(w.clientId)}>
                      <div className={`gt-dash-alerticon ${w.nonConf > 0 ? "danger" : "warning"}`}>
                        <Building2 size={14} />
                      </div>
                      <div className="gt-dash-alertbody">
                        <div className="gt-dash-alertname">{w.client.nom}</div>
                        <div className="gt-dash-alertmeta">
                          {[w.nonConf > 0 ? `${w.nonConf} non conforme${w.nonConf > 1 ? "s" : ""}` : null, w.retard > 0 ? `${w.retard} en retard` : null].filter(Boolean).join(" · ")}
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {resourceAlerts.length > 0 && (
                <>
                  <div className="gt-dash-subhead">Ressources</div>
                  {resourceAlerts.map((r) => {
                    const st = RESOURCE_STATUSES.find((s) => s.key === (r.status || "operationnel"));
                    return (
                      <div key={r.id} className="gt-dash-alertrow" onClick={() => r.onOpen(r.id)}>
                        <div className={`gt-dash-alerticon ${st?.pill || "neutral"}`}>
                          <ResourceTypeIcon type={r.type} size={14} />
                        </div>
                        <div className="gt-dash-alertbody">
                          <div className="gt-dash-alertname">{r.nom}</div>
                          <div className="gt-dash-alertmeta">{r.kindLabel}{r.emplacement ? ` · ${r.emplacement}` : ""}</div>
                        </div>
                        {st && (
                          <span className={`gt-status-pill ${st.pill}`}>
                            <span className="gt-status-pill-dot" />{st.label}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </>
              )}

              {pendingConges.length > 0 && (
                <>
                  <div className="gt-dash-subhead">Congés</div>
                  {pendingConges.map(({ employee, conge }) => (
                    <div key={conge.id} className="gt-dash-alertrow" onClick={() => onOpenEmployee(employee.id)}>
                      <div className="gt-dash-alerticon warning">
                        <Palmtree size={14} />
                      </div>
                      <div className="gt-dash-alertbody">
                        <div className="gt-dash-alertname">{employee.nom}</div>
                        <div className="gt-dash-alertmeta">{conge.type} · {conge.dateDebut} → {conge.dateFin}</div>
                      </div>
                      <span className="gt-status-pill warning">
                        <span className="gt-status-pill-dot" />En attente
                      </span>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
