import React, { useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import { computeClientStats } from "../utils/stats";
import { formatTimestamp } from "../utils/dates";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function ClientsView({ clients, projects, query, onOpenClient, isOffice }) {
  const rows = useMemo(() => {
    return clients
      .map((c) => ({ client: c, stats: computeClientStats(c, projects) }))
      .filter(({ stats }) => stats.nbProjects > 0 || isOffice)
      .filter(({ client }) => {
        if (!query) return true;
        const q = query.toLowerCase();
        return client.nom.toLowerCase().includes(q) || client.code.toLowerCase().includes(q);
      })
      .sort((a, b) => b.stats.nbProjects - a.stats.nbProjects || a.client.nom.localeCompare(b.client.nom));
  }, [clients, projects, query, isOffice]);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Code</TableHead>
          <TableHead>Client</TableHead>
          <TableHead>Projets</TableHead>
          <TableHead>Prestations</TableHead>
          <TableHead>En cours</TableHead>
          <TableHead>Non-conformité</TableHead>
          <TableHead>Dernière activité</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map(({ client, stats }) => (
          <TableRow key={client.id} className="cursor-pointer" onClick={() => onOpenClient(client.id)}>
            <TableCell className="font-mono">{client.code}</TableCell>
            <TableCell>
              <span className="font-semibold">{client.nom}</span>
              {stats.nbProjects > 1 && (
                <Badge variant="outline" className="ml-2 border-amber-600/40 text-amber-700">
                  {stats.nbProjects} projets liés
                </Badge>
              )}
            </TableCell>
            <TableCell>{stats.nbProjects}</TableCell>
            <TableCell>{stats.nbPrestations}</TableCell>
            <TableCell>{stats.enCours}</TableCell>
            <TableCell>
              {stats.nonConf > 0 ? (
                <span className="text-destructive inline-flex items-center gap-1">
                  <AlertTriangle size={12} /> {stats.nonConf}
                </span>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {stats.lastActivity != null ? formatTimestamp(stats.lastActivity) : "—"}
            </TableCell>
          </TableRow>
        ))}
        {rows.length === 0 && (
          <TableRow>
            <TableCell colSpan={7} className="text-muted-foreground text-center">
              Aucun client ne correspond.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
