import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  Plus,
  MapPin,
  Download,
  ChevronDown,
  UserCog,
  List,
  Folder,
  Truck,
  Wrench,
  Building2,
  Map as MapIcon,
  Calendar,
} from "lucide-react";
import "./styles/app.css";

import { fadeUpVariants, staggerContainer } from "./lib/motionVariants";
import { STAGES, AGENTS_CHANTIER, AGENTS_BUREAU, AGENTS_CONTROLE, ROLES } from "./constants";
import { today, parseDateFR } from "./utils/dates";
import { visibleToUser } from "./utils/access";
import { matchesMateriel, matchesVehicule } from "./utils/stats";
import { nextClientId, nextMaterielId, nextVehiculeId, nextPrestationId } from "./utils/ids";
import { downloadFile, buildGeoJSON, buildKML } from "./utils/geo";
import { blankPrestation, blankResource, seedClients, seedMateriels, seedVehicules, seedProjets } from "./data/seed";

import ProjetDrawer from "./components/ProjetDrawer";
import PrestationDrawer from "./components/PrestationDrawer";
import ClientDrawer from "./components/ClientDrawer";
import ClientsView from "./components/ClientsView";
import ResourceDrawer from "./components/ResourceDrawer";
import ResourceListView from "./components/ResourceListView";
import MapView from "./components/MapView";
import CalendarView from "./components/CalendarView";
import MiniPipeline from "./components/MiniPipeline";
import ProjetsToolbar from "./components/ProjetsToolbar";
import KanbanBoard from "./components/KanbanBoard";
import NewProjetModal from "./components/modals/NewProjetModal";
import NewResourceModal from "./components/modals/NewResourceModal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export default function GlobetudesProjets() {
  const [clients, setClients] = useState(seedClients());
  const [materiels, setMateriels] = useState(seedMateriels());
  const [vehicules, setVehicules] = useState(seedVehicules());
  const [projets, setProjets] = useState(seedProjets());
  const [view, setView] = useState("projets");
  const [openProjetId, setOpenProjetId] = useState(null);
  const [openPrestationId, setOpenPrestationId] = useState(null);
  const [openClientId, setOpenClientId] = useState(null);
  const [openMaterielId, setOpenMaterielId] = useState(null);
  const [openVehiculeId, setOpenVehiculeId] = useState(null);
  const [showNewProjet, setShowNewProjet] = useState(false);
  const [newProjetPresetClient, setNewProjetPresetClient] = useState(null);
  const [newProjetPresetLocation, setNewProjetPresetLocation] = useState(null);
  const [showNewClient, setShowNewClient] = useState(false);
  const [showNewMateriel, setShowNewMateriel] = useState(false);
  const [showNewVehicule, setShowNewVehicule] = useState(false);
  const [query, setQuery] = useState("");
  const [currentUser, setCurrentUser] = useState({ role: "Dispatcher", name: "Dispatcher" });
  const [boardMode, setBoardMode] = useState("list");
  const [filterStage, setFilterStage] = useState("all");
  const [filterClient, setFilterClient] = useState("all");
  const [filterAgent, setFilterAgent] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortKey, setSortKey] = useState("recent");

  const getClient = (id) => clients.find((c) => c.id === id);

  const isPrestationArchived = (p) => p.stage === "livraison" && p.chemin && p.dateLivraison;

  const getProjetStage = (pr) => {
    if (pr.prestations.length === 0) return null;
    const active = pr.prestations.filter((p) => !isPrestationArchived(p));
    const pool = active.length > 0 ? active : pr.prestations;
    let earliest = pool[0].stage;
    pool.forEach((p) => {
      if (STAGES.findIndex((s) => s.key === p.stage) < STAGES.findIndex((s) => s.key === earliest)) earliest = p.stage;
    });
    return earliest;
  };

  const roleNameOptions = () => {
    if (currentUser.role === "Agent Chantier") return AGENTS_CHANTIER.map((a) => a.name);
    if (currentUser.role === "Agent Bureau") return AGENTS_BUREAU;
    if (currentUser.role === "Agent Contrôle") return AGENTS_CONTROLE;
    return [];
  };

  const updatePrestation = (projetId, prestationId, patch) => {
    setProjets((prev) =>
      prev.map((pr) =>
        pr.id !== projetId
          ? pr
          : {
              ...pr,
              prestations: pr.prestations.map((p) => (p.id === prestationId ? { ...p, ...patch } : p)),
            }
      )
    );
  };

  const findProjetOfPrestation = (prestationId) => projets.find((pr) => pr.prestations.some((p) => p.id === prestationId));

  const addPrestation = (projetId, nature) => {
    const newId = nextPrestationId(projets);
    setProjets((prev) =>
      prev.map((pr) => {
        if (pr.id !== projetId) return pr;
        const newP = blankPrestation({ id: newId, natureDemandee: nature });
        return { ...pr, prestations: [...pr.prestations, newP] };
      })
    );
  };

  const createClient = ({ nom, code }) => {
    const id = nextClientId(clients);
    setClients((prev) => [...prev, { id, nom, code: code || id }]);
    return id;
  };

  const editClient = (clientId, { nom, code }) => {
    setClients((prev) => prev.map((c) => (c.id === clientId ? { ...c, nom, code } : c)));
  };

  const createMateriel = (nom) => {
    setMateriels((prev) => [...prev, { id: nextMaterielId(prev), nom, ...blankResource() }]);
  };

  const renameMateriel = (id, nom) => {
    setMateriels((prev) => prev.map((m) => (m.id === id ? { ...m, nom } : m)));
  };

  const editMateriel = (id, patch) => {
    setMateriels((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  };

  const addMaterielMaintenance = (id, entry) => {
    setMateriels((prev) => prev.map((m) => (m.id === id ? { ...m, maintenanceLog: [...(m.maintenanceLog || []), entry] } : m)));
  };

  const addMaterielAttachments = (id, fileList) => {
    const newFiles = Array.from(fileList).map((f) => ({ name: f.name, size: f.size }));
    if (newFiles.length === 0) return;
    setMateriels((prev) => prev.map((m) => (m.id === id ? { ...m, attachments: [...(m.attachments || []), ...newFiles] } : m)));
  };

  const removeMaterielAttachment = (id, index) => {
    setMateriels((prev) => prev.map((m) => (m.id === id ? { ...m, attachments: m.attachments.filter((_, i) => i !== index) } : m)));
  };

  const createVehicule = (nom) => {
    setVehicules((prev) => [...prev, { id: nextVehiculeId(prev), nom, ...blankResource() }]);
  };

  const renameVehicule = (id, nom) => {
    setVehicules((prev) => prev.map((v) => (v.id === id ? { ...v, nom } : v)));
  };

  const editVehicule = (id, patch) => {
    setVehicules((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  };

  const addVehiculeMaintenance = (id, entry) => {
    setVehicules((prev) => prev.map((v) => (v.id === id ? { ...v, maintenanceLog: [...(v.maintenanceLog || []), entry] } : v)));
  };

  const addVehiculeAttachments = (id, fileList) => {
    const newFiles = Array.from(fileList).map((f) => ({ name: f.name, size: f.size }));
    if (newFiles.length === 0) return;
    setVehicules((prev) => prev.map((v) => (v.id === id ? { ...v, attachments: [...(v.attachments || []), ...newFiles] } : v)));
  };

  const removeVehiculeAttachment = (id, index) => {
    setVehicules((prev) => prev.map((v) => (v.id === id ? { ...v, attachments: v.attachments.filter((_, i) => i !== index) } : v)));
  };

  const createProjet = ({ clientId, newClientNom, refFonciere, situation, nature, lat, lng }) => {
    let cid = clientId;
    if (!cid && newClientNom) cid = createClient({ nom: newClientNom });
    const id = `PRJ-2026-0${20 + projets.length}`;
    setProjets((prev) => [
      {
        id,
        clientId: cid,
        referenceFonciere: refFonciere,
        situation,
        lat: lat ?? null,
        lng: lng ?? null,
        naturePrestationProjet: nature,
        dateDebut: today(),
        notes: "",
        attachments: [],
        prestations: [],
      },
      ...prev,
    ]);
  };

  const editProjet = (projetId, patch) => {
    setProjets((prev) => prev.map((pr) => (pr.id === projetId ? { ...pr, ...patch } : pr)));
  };

  const updateProjetNotes = (projetId, notes) => {
    setProjets((prev) => prev.map((pr) => (pr.id === projetId ? { ...pr, notes } : pr)));
  };

  const addProjetAttachments = (projetId, fileList) => {
    const newFiles = Array.from(fileList).map((f) => ({ name: f.name, size: f.size }));
    if (newFiles.length === 0) return;
    setProjets((prev) =>
      prev.map((pr) => (pr.id === projetId ? { ...pr, attachments: [...(pr.attachments || []), ...newFiles] } : pr))
    );
  };

  const removeProjetAttachment = (projetId, index) => {
    setProjets((prev) =>
      prev.map((pr) =>
        pr.id === projetId ? { ...pr, attachments: pr.attachments.filter((_, i) => i !== index) } : pr
      )
    );
  };

  const filteredProjets = useMemo(() => {
    return projets
      .map((pr) => ({ ...pr, prestations: pr.prestations.filter((p) => visibleToUser(p, currentUser)) }))
      .filter((pr) => pr.prestations.length > 0 || currentUser.role === "Dispatcher" || currentUser.role === "Directrice")
      .filter((pr) => {
        if (!query) return true;
        const client = getClient(pr.clientId);
        const q = query.toLowerCase();
        return (
          (client?.nom || "").toLowerCase().includes(q) ||
          (client?.code || "").toLowerCase().includes(q) ||
          pr.id.toLowerCase().includes(q) ||
          pr.referenceFonciere.toLowerCase().includes(q)
        );
      });
  }, [projets, query, currentUser, clients]);

  const visibleProjets = useMemo(() => {
    const from = dateFrom ? parseDateFR(dateFrom) : null;
    const to = dateTo ? parseDateFR(dateTo) : null;
    const filtered = filteredProjets.filter((pr) => {
      if (filterStage !== "all" && !pr.prestations.some((p) => p.stage === filterStage)) return false;
      if (filterClient !== "all" && pr.clientId !== filterClient) return false;
      if (filterAgent !== "all" && !pr.prestations.some((p) => (p.agentChantier || []).includes(filterAgent))) return false;
      const debut = parseDateFR(pr.dateDebut);
      if (from != null && (debut == null || debut < from)) return false;
      if (to != null && (debut == null || debut > to)) return false;
      return true;
    });
    const sorted = [...filtered];
    if (sortKey === "recent") sorted.sort((a, b) => (parseDateFR(b.dateDebut) || 0) - (parseDateFR(a.dateDebut) || 0));
    else if (sortKey === "ancien") sorted.sort((a, b) => (parseDateFR(a.dateDebut) || 0) - (parseDateFR(b.dateDebut) || 0));
    else if (sortKey === "client") sorted.sort((a, b) => (getClient(a.clientId)?.nom || "").localeCompare(getClient(b.clientId)?.nom || ""));
    else if (sortKey === "prestations") sorted.sort((a, b) => b.prestations.length - a.prestations.length);
    return sorted;
  }, [filteredProjets, filterStage, filterClient, filterAgent, dateFrom, dateTo, sortKey, clients]);

  const allPrestationsFlat = useMemo(() => {
    const rows = [];
    projets.forEach((pr) => {
      pr.prestations.forEach((p) => {
        if (visibleToUser(p, currentUser)) rows.push({ ...p, projet: pr });
      });
    });
    return rows;
  }, [projets, currentUser]);

  const exportCSV = () => {
    const headers = [
      "Projet", "Client", "Code client", "Réf foncière", "Prestation ID", "Nature demandée", "Nature exécutée",
      "Agent chantier", "Matériel", "Véhicule", "Agent bureau", "Agent contrôle", "Étape", "Non-conformités",
      "Date livraison", "Chemin", "CD N", "Disque N",
    ];
    const rows = allPrestationsFlat.map((p) => {
      const client = getClient(p.projet.clientId);
      const materielNoms = (p.materielIds || []).map((id) => materiels.find((m) => m.id === id)?.nom).filter(Boolean).join(", ");
      const vehiculeNom = vehicules.find((v) => v.id === p.vehiculeId)?.nom || "";
      return [
        p.projet.id, client?.nom || "", client?.code || "", p.projet.referenceFonciere, p.id,
        p.natureDemandee, p.natureExecutee, (p.agentChantier || []).join(", "), materielNoms,
        vehiculeNom, p.agentBureau, p.agentControle, STAGES.find((s) => s.key === p.stage).label, p.cycles,
        p.dateLivraison, p.chemin, p.cdN, p.disqueN,
      ];
    });
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c || "").replace(/"/g, '""')}"`).join(";")).join("\n");
    downloadFile(`globetudes-prestations-${today().split("/").join("-")}.csv`, "﻿" + csv, "text/csv");
  };

  const exportGeoJSON = () => {
    downloadFile(`globetudes-projets-${today().split("/").join("-")}.geojson`, buildGeoJSON(filteredProjets, getClient), "application/geo+json");
  };

  const exportKML = () => {
    downloadFile(`globetudes-projets-${today().split("/").join("-")}.kml`, buildKML(filteredProjets, getClient), "application/vnd.google-earth.kml+xml");
  };

  const openProjet = projets.find((pr) => pr.id === openProjetId);
  const openPrestationCtx = openPrestationId
    ? { projet: findProjetOfPrestation(openPrestationId), prestation: findProjetOfPrestation(openPrestationId)?.prestations.find((p) => p.id === openPrestationId) }
    : null;
  const openClient = openClientId ? getClient(openClientId) : null;
  const openMateriel = openMaterielId ? materiels.find((m) => m.id === openMaterielId) : null;
  const openVehicule = openVehiculeId ? vehicules.find((v) => v.id === openVehiculeId) : null;

  const isOffice = currentUser.role === "Dispatcher" || currentUser.role === "Directrice";

  const stats = useMemo(() => {
    const total = allPrestationsFlat.length;
    const enCours = allPrestationsFlat.filter((p) => p.stage !== "livraison" || !p.chemin).length;
    const nonConf = allPrestationsFlat.filter((p) => p.cycles > 0).length;
    const livres = allPrestationsFlat.filter((p) => p.stage === "livraison" && p.chemin).length;
    return { total, enCours, nonConf, livres };
  }, [allPrestationsFlat]);

  const searchPlaceholder = {
    projets: "Client, projet, réf. foncière...",
    clients: "Nom ou code client...",
    materiels: "Nom ou code matériel...",
    vehicules: "Nom ou immatriculation...",
    carte: "Client, projet, réf. foncière...",
    calendrier: "Client, projet, réf. foncière...",
  }[view];

  return (
    <div className="gt-app">
      <div className="gt-topbar">
        <motion.div
          className="gt-brand"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35 }}
        >
          <motion.img
            src="/logo.png"
            alt="Globétudes"
            className="gt-brand-mark"
            whileHover={{ rotate: 8, scale: 1.06 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          />
          <div className="gt-brand-text">
            <div className="gt-brand-title">Globétudes</div>
            <div className="gt-brand-sub">PROJETS &amp; PRESTATIONS</div>
          </div>
        </motion.div>

        <div className="gt-tabs">
          <button className={`gt-tab ${view === "projets" ? "active" : ""}`} onClick={() => setView("projets")}>
            <List size={13} /> Projets
          </button>
          <button className={`gt-tab ${view === "clients" ? "active" : ""}`} onClick={() => setView("clients")}>
            <Building2 size={13} /> Clients
          </button>
          <button className={`gt-tab ${view === "materiels" ? "active" : ""}`} onClick={() => setView("materiels")}>
            <Wrench size={13} /> Matériel
          </button>
          <button className={`gt-tab ${view === "vehicules" ? "active" : ""}`} onClick={() => setView("vehicules")}>
            <Truck size={13} /> Véhicules
          </button>
          <button className={`gt-tab ${view === "carte" ? "active" : ""}`} onClick={() => setView("carte")}>
            <MapIcon size={13} /> Carte
          </button>
          <button className={`gt-tab ${view === "calendrier" ? "active" : ""}`} onClick={() => setView("calendrier")}>
            <Calendar size={13} /> Calendrier
          </button>
        </div>

        <div className="gt-userswitch">
          <UserCog size={14} color="var(--muted)" />
          <select
            className="gt-userselect"
            value={currentUser.role}
            onChange={(e) => {
              const role = e.target.value;
              const opts = role === "Agent Chantier" ? AGENTS_CHANTIER.map((a) => a.name) : role === "Agent Bureau" ? AGENTS_BUREAU : role === "Agent Contrôle" ? AGENTS_CONTROLE : [role];
              setCurrentUser({ role, name: opts[0] });
            }}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          {!isOffice && (
            <select className="gt-userselect" value={currentUser.name} onChange={(e) => setCurrentUser({ role: currentUser.role, name: e.target.value })}>
              {roleNameOptions().map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          )}
        </div>

        <div className="gt-topbar-right">
          <div className="gt-search">
            <Search size={14} color="#9A9C92" />
            <input placeholder={searchPlaceholder} value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          {view === "projets" && isOffice && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-auto py-2">
                  <Download size={15} /> Exporter <ChevronDown size={13} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={exportCSV}>CSV (prestations)</DropdownMenuItem>
                <DropdownMenuItem onClick={exportGeoJSON}>GeoJSON (projets géolocalisés)</DropdownMenuItem>
                <DropdownMenuItem onClick={exportKML}>KML (projets géolocalisés)</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {view === "projets" && isOffice && (
            <button className="gt-newbtn" onClick={() => { setNewProjetPresetClient(null); setShowNewProjet(true); }}>
              <Plus size={15} /> Nouveau projet
            </button>
          )}
          {view === "clients" && isOffice && (
            <button className="gt-newbtn" onClick={() => setShowNewClient(true)}>
              <Plus size={15} /> Nouveau client
            </button>
          )}
          {view === "materiels" && isOffice && (
            <button className="gt-newbtn" onClick={() => setShowNewMateriel(true)}>
              <Plus size={15} /> Nouveau matériel
            </button>
          )}
          {view === "vehicules" && isOffice && (
            <button className="gt-newbtn" onClick={() => setShowNewVehicule(true)}>
              <Plus size={15} /> Nouveau véhicule
            </button>
          )}
        </div>
      </div>

      {view === "projets" && (
        <motion.div className="gt-stats" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          <div className="gt-stat"><div className="gt-stat-num">{stats.total}</div><div className="gt-stat-label">Prestations visibles</div></div>
          <div className="gt-stat"><div className="gt-stat-num">{stats.enCours}</div><div className="gt-stat-label">En cours</div></div>
          <div className="gt-stat"><div className="gt-stat-num" style={{ color: stats.nonConf ? "var(--bad)" : "var(--ink)" }}>{stats.nonConf}</div><div className="gt-stat-label">Avec non-conformité</div></div>
          <div className="gt-stat"><div className="gt-stat-num">{stats.livres}</div><div className="gt-stat-label">Livrées</div></div>
        </motion.div>
      )}

      {view === "projets" && (
        <ProjetsToolbar
          clients={clients}
          agents={AGENTS_CHANTIER.map((a) => a.name)}
          filterStage={filterStage}
          setFilterStage={setFilterStage}
          filterClient={filterClient}
          setFilterClient={setFilterClient}
          filterAgent={filterAgent}
          setFilterAgent={setFilterAgent}
          dateFrom={dateFrom}
          setDateFrom={setDateFrom}
          dateTo={dateTo}
          setDateTo={setDateTo}
          sortKey={sortKey}
          setSortKey={setSortKey}
          boardMode={boardMode}
          setBoardMode={setBoardMode}
        />
      )}

      <AnimatePresence mode="wait">
        {view === "projets" && boardMode === "kanban" && (
          <KanbanBoard
            key="projets-kanban"
            projects={visibleProjets}
            getClient={getClient}
            onOpenProjet={setOpenProjetId}
            getProjetStage={getProjetStage}
          />
        )}

        {view === "projets" && boardMode === "list" && (
          <motion.div
            className="gt-projets"
            key="projets"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0 }}
          >
            {visibleProjets.map((pr) => {
              const client = getClient(pr.clientId);
              return (
                <motion.div
                  className="gt-projetcard"
                  key={pr.id}
                  variants={fadeUpVariants}
                  onClick={() => setOpenProjetId(pr.id)}
                  whileHover={{ y: -2 }}
                >
                  <div className="gt-projetcard-top">
                    <span className="gt-projetcard-id gt-mono">{pr.id}</span>
                    <span className="gt-projetcard-id gt-mono">{pr.referenceFonciere}</span>
                  </div>
                  <div className="gt-projetcard-client">{client?.nom || "—"}</div>
                  <div className="gt-projetcard-meta">
                    <span><MapPin size={12} style={{ verticalAlign: -2 }} /> {pr.situation}</span>
                    <span><Folder size={12} style={{ verticalAlign: -2 }} /> {pr.naturePrestationProjet}</span>
                    <span>{pr.prestations.length} prestation{pr.prestations.length > 1 ? "s" : ""}</span>
                  </div>
                  <div className="gt-projetcard-prestlist">
                    {pr.prestations.map((p) => (
                      <div className="gt-projetcard-prestrow" key={p.id}>
                        <span className="gt-projetcard-prest-label">{p.natureDemandee || "Non définie"}</span>
                        <MiniPipeline stage={p.stage} />
                        <span className="gt-projetcard-prest-stage">{STAGES.find((s) => s.key === p.stage).label}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
            {visibleProjets.length === 0 && <div className="gt-list-empty">Aucun projet ne correspond.</div>}
          </motion.div>
        )}

        {view === "clients" && (
          <motion.div key="clients" variants={fadeUpVariants} initial="hidden" animate="visible" exit={{ opacity: 0 }}>
            <ClientsView
              clients={clients}
              projects={filteredProjets}
              query={query}
              onOpenClient={setOpenClientId}
              isOffice={isOffice}
            />
          </motion.div>
        )}

        {view === "materiels" && (
          <motion.div key="materiels" variants={fadeUpVariants} initial="hidden" animate="visible" exit={{ opacity: 0 }}>
            <ResourceListView
              icon={Wrench}
              items={materiels}
              projects={filteredProjets}
              matches={matchesMateriel}
              query={query}
              onOpenItem={setOpenMaterielId}
              isOffice={isOffice}
              emptyLabel="Aucun matériel ne correspond."
            />
          </motion.div>
        )}

        {view === "vehicules" && (
          <motion.div key="vehicules" variants={fadeUpVariants} initial="hidden" animate="visible" exit={{ opacity: 0 }}>
            <ResourceListView
              icon={Truck}
              items={vehicules}
              projects={filteredProjets}
              matches={matchesVehicule}
              query={query}
              onOpenItem={setOpenVehiculeId}
              isOffice={isOffice}
              emptyLabel="Aucun véhicule ne correspond."
            />
          </motion.div>
        )}

        {view === "carte" && (
          <motion.div
            key="carte"
            style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0 }}
          >
            <MapView
              projects={filteredProjets}
              getClient={getClient}
              onOpenProjet={setOpenProjetId}
              onCreateProjetAt={(lat, lng, situation) => {
                setNewProjetPresetClient(null);
                setNewProjetPresetLocation({ lat, lng, situation });
                setShowNewProjet(true);
              }}
            />
          </motion.div>
        )}

        {view === "calendrier" && (
          <motion.div
            key="calendrier"
            style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0 }}
          >
            <CalendarView projects={filteredProjets} getClient={getClient} onOpenPrestation={setOpenPrestationId} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {openProjet && (
          <ProjetDrawer
            key="projet-drawer"
            projet={openProjet}
            client={getClient(openProjet.clientId)}
            materiels={materiels}
            vehicules={vehicules}
            onClose={() => setOpenProjetId(null)}
            onOpenPrestation={(id) => {
              setOpenProjetId(null);
              setOpenPrestationId(id);
            }}
            onAddPrestation={addPrestation}
            onOpenClient={(clientId) => {
              setOpenProjetId(null);
              setOpenClientId(clientId);
            }}
            onEditProjet={editProjet}
            onUpdateNotes={updateProjetNotes}
            onAddAttachments={addProjetAttachments}
            onRemoveAttachment={removeProjetAttachment}
            currentUser={currentUser}
            isOffice={isOffice}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {openPrestationCtx?.prestation && (
          <PrestationDrawer
            key="prestation-drawer"
            projet={openPrestationCtx.projet}
            client={getClient(openPrestationCtx.projet.clientId)}
            prestation={openPrestationCtx.prestation}
            materiels={materiels}
            vehicules={vehicules}
            allProjets={projets}
            onClose={() => setOpenPrestationId(null)}
            onUpdate={(id, patch) => updatePrestation(openPrestationCtx.projet.id, id, patch)}
            onOpenMateriel={(id) => {
              setOpenPrestationId(null);
              setOpenMaterielId(id);
            }}
            onOpenVehicule={(id) => {
              setOpenPrestationId(null);
              setOpenVehiculeId(id);
            }}
            currentUser={currentUser}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {openClient && (
          <ClientDrawer
            key="client-drawer"
            client={openClient}
            projects={projets}
            onClose={() => setOpenClientId(null)}
            onOpenProjet={(id) => {
              setOpenClientId(null);
              setOpenProjetId(id);
            }}
            onNewProjetForClient={(client) => {
              setOpenClientId(null);
              setNewProjetPresetClient(client);
              setShowNewProjet(true);
            }}
            onEditClient={editClient}
            isOffice={isOffice}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {openMateriel && (
          <ResourceDrawer
            key="materiel-drawer"
            item={openMateriel}
            projects={projets}
            matches={matchesMateriel}
            typeLabel="Matériel"
            onClose={() => setOpenMaterielId(null)}
            onOpenPrestation={(id) => {
              setOpenMaterielId(null);
              setOpenPrestationId(id);
            }}
            onRenameItem={renameMateriel}
            onEditItem={editMateriel}
            onAddMaintenance={addMaterielMaintenance}
            onAddAttachments={addMaterielAttachments}
            onRemoveAttachment={removeMaterielAttachment}
            isOffice={isOffice}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {openVehicule && (
          <ResourceDrawer
            key="vehicule-drawer"
            item={openVehicule}
            projects={projets}
            matches={matchesVehicule}
            typeLabel="Véhicule"
            onClose={() => setOpenVehiculeId(null)}
            onOpenPrestation={(id) => {
              setOpenVehiculeId(null);
              setOpenPrestationId(id);
            }}
            onRenameItem={renameVehicule}
            onEditItem={editVehicule}
            onAddMaintenance={addVehiculeMaintenance}
            onAddAttachments={addVehiculeAttachments}
            onRemoveAttachment={removeVehiculeAttachment}
            isOffice={isOffice}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showNewProjet && (
          <NewProjetModal
            key="new-projet-modal"
            onClose={() => { setShowNewProjet(false); setNewProjetPresetClient(null); setNewProjetPresetLocation(null); }}
            onCreate={createProjet}
            clients={clients}
            presetClient={newProjetPresetClient}
            presetLocation={newProjetPresetLocation}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showNewClient && (
          <NewResourceModal
            key="new-client-modal"
            title="Nouveau client"
            label="Nom du client / maître d'ouvrage"
            placeholder="ex. SOMADIR Immobilier"
            onClose={() => setShowNewClient(false)}
            onCreate={createClient}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showNewMateriel && (
          <NewResourceModal
            key="new-materiel-modal"
            title="Nouveau matériel"
            label="Désignation du matériel"
            placeholder="ex. Théodolite"
            onClose={() => setShowNewMateriel(false)}
            onCreate={createMateriel}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showNewVehicule && (
          <NewResourceModal
            key="new-vehicule-modal"
            title="Nouveau véhicule"
            label="Véhicule (type — immatriculation)"
            placeholder="ex. Pick-up — 33210-A-6"
            onClose={() => setShowNewVehicule(false)}
            onCreate={createVehicule}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
