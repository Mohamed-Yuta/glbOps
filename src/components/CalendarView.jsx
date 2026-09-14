import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, AlertTriangle, CalendarDays, CalendarRange, Users } from "lucide-react";
import { STAGES, STAGE_COLORS, WEEKDAY_LABELS, AGENTS_CHANTIER } from "../constants";
import { today } from "../utils/dates";
import { bookingsFromProjets, groupBookingsByDate, conflictingIds } from "../utils/bookings";
import { buildMonthGrid, buildWeekGrid } from "../utils/calendarGrid";
import { fadeUpVariants } from "../lib/motionVariants";

const dateKey = (d) => d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });

function DayCell({ date, inMonth, todayKey, dayBookings, conflicts, onOpenPrestation, getClient }) {
  const key = dateKey(date);
  return (
    <div className={`gt-cal-cell ${inMonth ? "" : "outmonth"} ${key === todayKey ? "today" : ""}`}>
      <div className="gt-cal-daynum">{date.getDate()}</div>
      <div className="gt-cal-chips">
        {dayBookings.map(({ prestation, projet }) => (
          <button
            key={prestation.id}
            className={`gt-cal-chip ${conflicts.has(prestation.id) ? "conflict" : ""}`}
            style={{ borderLeftColor: STAGE_COLORS[prestation.stage] }}
            onClick={() => onOpenPrestation(prestation.id)}
            title={`${prestation.id} — ${getClient(projet.clientId)?.nom || "—"}`}
          >
            {conflicts.has(prestation.id) && <AlertTriangle size={10} className="gt-cal-chip-warn" />}
            <span className="gt-cal-chip-text">
              {(prestation.agentChantier || []).join(", ") || "—"} · {projet.id}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function CalendarView({ projects, getClient, onOpenPrestation }) {
  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const [viewMode, setViewMode] = useState("mois"); // mois | semaine | agents
  const [filterStage, setFilterStage] = useState("all");
  const [filterAgent, setFilterAgent] = useState("all");
  const todayKey = today();

  const allBookings = useMemo(() => bookingsFromProjets(projects), [projects]);
  const filteredBookings = useMemo(() => {
    return allBookings.filter(({ prestation }) => {
      if (filterStage !== "all" && prestation.stage !== filterStage) return false;
      if (filterAgent !== "all" && !(prestation.agentChantier || []).includes(filterAgent)) return false;
      return true;
    });
  }, [allBookings, filterStage, filterAgent]);

  const bookingsByDate = useMemo(() => groupBookingsByDate(filteredBookings), [filteredBookings]);

  const totalConflictDays = useMemo(() => {
    let n = 0;
    Object.values(bookingsByDate).forEach((list) => { if (conflictingIds(list).size > 0) n += 1; });
    return n;
  }, [bookingsByDate]);

  const monthCells = useMemo(() => buildMonthGrid(anchorDate), [anchorDate]);
  const weekCells = useMemo(() => buildWeekGrid(anchorDate), [anchorDate]);
  const cells = viewMode === "semaine" ? weekCells : monthCells;

  const goPrev = () => setAnchorDate((d) => {
    const n = new Date(d);
    if (viewMode === "mois") n.setMonth(n.getMonth() - 1);
    else n.setDate(n.getDate() - 7);
    return n;
  });
  const goNext = () => setAnchorDate((d) => {
    const n = new Date(d);
    if (viewMode === "mois") n.setMonth(n.getMonth() + 1);
    else n.setDate(n.getDate() + 7);
    return n;
  });
  const goToday = () => setAnchorDate(new Date());

  const label = viewMode === "mois"
    ? anchorDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
    : `${weekCells[0].date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })} – ${weekCells[6].date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}`;

  const visibleAgents = filterAgent === "all" ? AGENTS_CHANTIER : AGENTS_CHANTIER.filter((a) => a.name === filterAgent);

  return (
    <div className="gt-cal-wrap">
      <div className="gt-cal-toolbar">
        <button className="gt-iconbtn" onClick={goPrev}>
          <ChevronLeft size={18} />
        </button>
        <div className="gt-cal-monthlabel gt-mono">{label}</div>
        <button className="gt-iconbtn" onClick={goNext}>
          <ChevronRight size={18} />
        </button>
        <button className="gt-btn gt-btn-neutral gt-cal-todaybtn" onClick={goToday}>
          Aujourd'hui
        </button>

        <div className="gt-viewtoggle">
          <button className={viewMode === "mois" ? "active" : ""} onClick={() => setViewMode("mois")}>
            <CalendarDays size={13} /> Mois
          </button>
          <button className={viewMode === "semaine" ? "active" : ""} onClick={() => setViewMode("semaine")}>
            <CalendarRange size={13} /> Semaine
          </button>
          <button className={viewMode === "agents" ? "active" : ""} onClick={() => setViewMode("agents")}>
            <Users size={13} /> Agents
          </button>
        </div>

        {totalConflictDays > 0 && (
          <span className="gt-pill gt-pill-bad" style={{ marginLeft: "auto" }}>
            <AlertTriangle size={11} /> {totalConflictDays} jour{totalConflictDays > 1 ? "s" : ""} avec conflit{totalConflictDays > 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div className="gt-cal-filters">
        <select value={filterStage} onChange={(e) => setFilterStage(e.target.value)}>
          <option value="all">Toutes les étapes</option>
          {STAGES.map((s) => (
            <option key={s.key} value={s.key}>{s.label}</option>
          ))}
        </select>
        <select value={filterAgent} onChange={(e) => setFilterAgent(e.target.value)}>
          <option value="all">Tous les agents</option>
          {AGENTS_CHANTIER.map((a) => (
            <option key={a.name} value={a.name}>{a.name}</option>
          ))}
        </select>
      </div>

      <div className="gt-cal-legend">
        {STAGES.map((s) => (
          <div className="gt-cal-legend-row" key={s.key}>
            <span className="gt-cal-legend-dot" style={{ background: STAGE_COLORS[s.key] }} />
            {s.label}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {viewMode === "agents" ? (
          <motion.div className="gt-cal-swimlanes" key="agents" variants={fadeUpVariants} initial="hidden" animate="visible" exit={{ opacity: 0 }}>
            <div className="gt-cal-swimlane-head">
              <div className="gt-cal-swimlane-head-cell">Agent</div>
              {weekCells.map(({ date }) => (
                <div className="gt-cal-swimlane-head-cell" key={dateKey(date)}>
                  {WEEKDAY_LABELS[(date.getDay() + 6) % 7]} {date.getDate()}
                </div>
              ))}
            </div>
            {visibleAgents.map((agent) => (
              <div className="gt-cal-swimlane-row" key={agent.name}>
                <div className="gt-cal-swimlane-label">{agent.name}</div>
                {weekCells.map(({ date }) => {
                  const key = dateKey(date);
                  const dayBookings = (bookingsByDate[key] || []).filter(({ prestation }) => (prestation.agentChantier || []).includes(agent.name));
                  const conflicts = conflictingIds(bookingsByDate[key] || []);
                  return (
                    <div className="gt-cal-swimlane-cell" key={key}>
                      {dayBookings.map(({ prestation, projet }) => (
                        <button
                          key={prestation.id}
                          className={`gt-cal-chip ${conflicts.has(prestation.id) ? "conflict" : ""}`}
                          style={{ borderLeftColor: STAGE_COLORS[prestation.stage] }}
                          onClick={() => onOpenPrestation(prestation.id)}
                          title={`${prestation.id} — ${getClient(projet.clientId)?.nom || "—"}`}
                        >
                          {conflicts.has(prestation.id) && <AlertTriangle size={10} className="gt-cal-chip-warn" />}
                          <span className="gt-cal-chip-text">{projet.id}</span>
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
            {visibleAgents.length === 0 && <div className="gt-list-empty">Aucun agent ne correspond.</div>}
          </motion.div>
        ) : (
          <motion.div key={viewMode} variants={fadeUpVariants} initial="hidden" animate="visible" exit={{ opacity: 0 }} className={viewMode === "semaine" ? "gt-cal-week" : ""}>
            <div className="gt-cal-grid gt-cal-weekdays">
              {WEEKDAY_LABELS.map((w) => (
                <div className="gt-cal-weekday" key={w}>{w}</div>
              ))}
            </div>
            <div className="gt-cal-grid gt-cal-days">
              {cells.map(({ date, inMonth }, i) => {
                const key = dateKey(date);
                const dayBookings = bookingsByDate[key] || [];
                const conflicts = conflictingIds(dayBookings);
                return (
                  <DayCell
                    key={i}
                    date={date}
                    inMonth={inMonth}
                    todayKey={todayKey}
                    dayBookings={dayBookings}
                    conflicts={conflicts}
                    onOpenPrestation={onOpenPrestation}
                    getClient={getClient}
                  />
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
