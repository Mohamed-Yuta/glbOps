import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { STAGE_COLORS, WEEKDAY_LABELS } from "../constants";
import { today } from "../utils/dates";
import { bookingsFromProjets, groupBookingsByDate, conflictingIds } from "../utils/bookings";
import { buildMonthGrid } from "../utils/calendarGrid";

export default function CalendarView({ projects, getClient, onOpenPrestation }) {
  const [month, setMonth] = useState(() => { const d = new Date(); d.setDate(1); return d; });

  const bookingsByDate = useMemo(() => groupBookingsByDate(bookingsFromProjets(projects)), [projects]);
  const cells = useMemo(() => buildMonthGrid(month), [month]);
  const todayKey = today();

  const totalConflictDays = useMemo(() => {
    let n = 0;
    Object.values(bookingsByDate).forEach((list) => { if (conflictingIds(list).size > 0) n += 1; });
    return n;
  }, [bookingsByDate]);

  return (
    <div className="gt-cal-wrap">
      <div className="gt-cal-toolbar">
        <button className="gt-iconbtn" onClick={() => setMonth((m) => { const d = new Date(m); d.setMonth(d.getMonth() - 1); return d; })}>
          <ChevronLeft size={18} />
        </button>
        <div className="gt-cal-monthlabel gt-mono">
          {month.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
        </div>
        <button className="gt-iconbtn" onClick={() => setMonth((m) => { const d = new Date(m); d.setMonth(d.getMonth() + 1); return d; })}>
          <ChevronRight size={18} />
        </button>
        <button className="gt-btn gt-btn-neutral gt-cal-todaybtn" onClick={() => { const d = new Date(); d.setDate(1); setMonth(d); }}>
          Aujourd'hui
        </button>
        {totalConflictDays > 0 && (
          <span className="gt-pill gt-pill-bad" style={{ marginLeft: "auto" }}>
            <AlertTriangle size={11} /> {totalConflictDays} jour{totalConflictDays > 1 ? "s" : ""} avec conflit{totalConflictDays > 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div className="gt-cal-grid gt-cal-weekdays">
        {WEEKDAY_LABELS.map((w) => (
          <div className="gt-cal-weekday" key={w}>{w}</div>
        ))}
      </div>

      <div className="gt-cal-grid gt-cal-days">
        {cells.map(({ date, inMonth }, i) => {
          const key = date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
          const dayBookings = bookingsByDate[key] || [];
          const conflicts = conflictingIds(dayBookings);
          return (
            <div className={`gt-cal-cell ${inMonth ? "" : "outmonth"} ${key === todayKey ? "today" : ""}`} key={i}>
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
        })}
      </div>
    </div>
  );
}
