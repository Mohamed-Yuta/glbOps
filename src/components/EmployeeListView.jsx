import React, { useMemo } from "react";
import { Palmtree } from "lucide-react";
import { computeEmployeeStats } from "../utils/stats";
import { activeCongeOn, today } from "../utils/dates";
import { EMPLOYEE_STATUSES } from "../constants";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function EmployeeListView({ items, projects, query, onOpenItem }) {
  const rows = useMemo(() => {
    return items
      .map((it) => ({ item: it, stats: computeEmployeeStats(it, projects) }))
      .filter(
        ({ item }) => !query || item.nom.toLowerCase().includes(query.toLowerCase()) || item.id.toLowerCase().includes(query.toLowerCase())
      )
      .sort((a, b) => a.item.role.localeCompare(b.item.role) || a.item.nom.localeCompare(b.item.nom));
  }, [items, projects, query]);

  const todayKey = today();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Code</TableHead>
          <TableHead>Nom</TableHead>
          <TableHead>Poste</TableHead>
          <TableHead>Rôle</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead>En cours</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map(({ item, stats }) => {
          const statusInfo = EMPLOYEE_STATUSES.find((s) => s.key === (item.status || "actif"));
          const onLeave = activeCongeOn(item.conges, todayKey);
          return (
            <TableRow key={item.id} className="cursor-pointer" onClick={() => onOpenItem(item.id)}>
              <TableCell className="font-mono">{item.id}</TableCell>
              <TableCell>
                <span className="font-semibold">{item.nom}</span>
                {onLeave && (
                  <Badge variant="outline" className="ml-2" style={{ borderColor: "var(--amber)", color: "var(--amber)" }}>
                    <Palmtree size={11} /> En congé
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">{item.poste || "—"}</TableCell>
              <TableCell className="text-muted-foreground">{item.role}</TableCell>
              <TableCell>
                {statusInfo && (
                  <Badge variant="outline" style={{ borderColor: statusInfo.color, color: statusInfo.color }}>
                    {statusInfo.label}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {stats.enCours > 0 ? stats.enCours : <span className="text-muted-foreground">—</span>}
              </TableCell>
            </TableRow>
          );
        })}
        {rows.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="text-muted-foreground text-center">
              Aucun employé ne correspond.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
