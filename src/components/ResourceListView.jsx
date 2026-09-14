import React, { useMemo } from "react";
import { computeResourceStats } from "../utils/stats";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function ResourceListView({ codeLabel, nameLabel, items, projects, matches, query, onOpenItem, emptyLabel }) {
  const rows = useMemo(() => {
    return items
      .map((it) => ({ item: it, stats: computeResourceStats(it, projects, matches) }))
      .filter(
        ({ item }) => !query || item.nom.toLowerCase().includes(query.toLowerCase()) || item.id.toLowerCase().includes(query.toLowerCase())
      )
      .sort((a, b) => b.stats.enCours - a.stats.enCours || b.stats.nbUsageTotal - a.stats.nbUsageTotal || a.item.nom.localeCompare(b.item.nom));
  }, [items, projects, query]);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{codeLabel}</TableHead>
          <TableHead>{nameLabel}</TableHead>
          <TableHead>Utilisations</TableHead>
          <TableHead>En cours</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map(({ item, stats }) => (
          <TableRow key={item.id} className="cursor-pointer" onClick={() => onOpenItem(item.id)}>
            <TableCell className="font-mono">{item.id}</TableCell>
            <TableCell>
              <span className="font-semibold">{item.nom}</span>
              {stats.enCours > 0 && (
                <Badge variant="outline" className="ml-2 border-amber-600/40 text-amber-700">
                  {stats.enCours} en cours
                </Badge>
              )}
            </TableCell>
            <TableCell>{stats.nbUsageTotal}</TableCell>
            <TableCell>
              {stats.enCours > 0 ? stats.enCours : <span className="text-muted-foreground">—</span>}
            </TableCell>
          </TableRow>
        ))}
        {rows.length === 0 && (
          <TableRow>
            <TableCell colSpan={4} className="text-muted-foreground text-center">
              {emptyLabel}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
