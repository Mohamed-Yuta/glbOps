import React, { useMemo, useState } from "react";
import {
  Search,
  Plus,
  MapPin,
  Compass,
  Download,
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

import { STAGES, STAGE_COLORS, AGENTS_CHANTIER, AGENTS_BUREAU, AGENTS_CONTROLE, ROLES } from "./constants";
import { today } from "./utils/dates";
import { visibleToUser } from "./utils/access";
import { matchesMateriel, matchesVehicule } from "./utils/stats";
import { nextClientId, nextMaterielId, nextVehiculeId } from "./utils/ids";
import { blankPrestation, seedClients, seedMateriels, seedVehicules, seedProjets } from "./data/seed";

import ProjetDrawer from "./components/ProjetDrawer";
import PrestationDrawer from "./components/PrestationDrawer";
import ClientDrawer from "./components/ClientDrawer";
import ClientsView from "./components/ClientsView";
import ResourceDrawer from "./components/ResourceDrawer";
import ResourceListView from "./components/ResourceListView";
import MapView from "./components/MapView";
import CalendarView from "./components/CalendarView";
import NewProjetModal from "./components/modals/NewProjetModal";
import NewResourceModal from "./components/modals/NewResourceModal";

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
  const [showNewClient, setShowNewClient] = useState(false);
  const [showNewMateriel, setShowNewMateriel] = useState(false);
  const [showNewVehicule, setShowNewVehicule] = useState(false);
  const [query, setQuery] = useState("");
  const [currentUser, setCurrentUser] = useState({ role: "Dispatcher", name: "Dispatcher" });

  const getClient = (id) => clients.find((c) => c.id === id);

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
    setProjets((prev) =>
      prev.map((pr) => {
        if (pr.id !== projetId) return pr;
        const nextNum = 140 + pr.prestations.length + projets.length;
        const newP = blankPrestation({ id: `PRS-2026-0${nextNum}`, natureDemandee: nature });
        return { ...pr, prestations: [...pr.prestations, newP] };
      })
    );
  };

  const createClient = (nom) => {
    const id = nextClientId(clients);
    setClients((prev) => [...prev, { id, nom }]);
    return id;
  };

  const renameClient = (clientId, nom) => {
    setClients((prev) => prev.map((c) => (c.id === clientId ? { ...c, nom } : c)));
  };

  const createMateriel = (nom) => {
    setMateriels((prev) => [...prev, { id: nextMaterielId(prev), nom }]);
  };

  const renameMateriel = (id, nom) => {
    setMateriels((prev) => prev.map((m) => (m.id === id ? { ...m, nom } : m)));
  };

  const createVehicule = (nom) => {
    setVehicules((prev) => [...prev, { id: nextVehiculeId(prev), nom }]);
  };

  const renameVehicule = (id, nom) => {
    setVehicules((prev) => prev.map((v) => (v.id === id ? { ...v, nom } : v)));
  };

  const createProjet = ({ clientId, newClientNom, refFonciere, situation, nature, lat, lng }) => {
    let cid = clientId;
    if (!cid && newClientNom) cid = createClient(newClientNom);
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
        prestations: [],
      },
      ...prev,
    ]);
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
          pr.id.toLowerCase().includes(q) ||
          pr.referenceFonciere.toLowerCase().includes(q)
        );
      });
  }, [projets, query, currentUser, clients]);

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
        p.projet.id, client?.nom || "", client?.id || "", p.projet.referenceFonciere, p.id,
        p.natureDemandee, p.natureExecutee, (p.agentChantier || []).join(", "), materielNoms,
        vehiculeNom, p.agentBureau, p.agentControle, STAGES.find((s) => s.key === p.stage).label, p.cycles,
        p.dateLivraison, p.chemin, p.cdN, p.disqueN,
      ];
    });
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c || "").replace(/"/g, '""')}"`).join(";")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `globetudes-prestations-${today().split("/").join("-")}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
        <div className="gt-brand">
          <div className="gt-brand-mark">
            <Compass size={16} strokeWidth={2} />
          </div>
          <div className="gt-brand-text">
            <div className="gt-brand-title">Globétudes</div>
            <div className="gt-brand-sub">PROJETS &amp; PRESTATIONS</div>
          </div>
        </div>

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
            <button className="gt-newbtn gt-newbtn-outline" onClick={exportCSV}>
              <Download size={15} /> Exporter CSV
            </button>
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
        <div className="gt-stats">
          <div className="gt-stat"><div className="gt-stat-num">{stats.total}</div><div className="gt-stat-label">Prestations visibles</div></div>
          <div className="gt-stat"><div className="gt-stat-num">{stats.enCours}</div><div className="gt-stat-label">En cours</div></div>
          <div className="gt-stat"><div className="gt-stat-num" style={{ color: stats.nonConf ? "var(--bad)" : "var(--ink)" }}>{stats.nonConf}</div><div className="gt-stat-label">Avec non-conformité</div></div>
          <div className="gt-stat"><div className="gt-stat-num">{stats.livres}</div><div className="gt-stat-label">Livrées</div></div>
        </div>
      )}

      {view === "projets" && (
        <div className="gt-projets">
          {filteredProjets.map((pr) => {
            const client = getClient(pr.clientId);
            return (
              <div className="gt-projetcard" key={pr.id} onClick={() => setOpenProjetId(pr.id)}>
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
                <div className="gt-projetcard-prest">
                  {pr.prestations.map((p) => (
                    <span className="gt-projetcard-prestchip" key={p.id} style={{ borderColor: STAGE_COLORS[p.stage] }}>
                      {p.natureDemandee || "Non définie"} · {STAGES.find((s) => s.key === p.stage).label}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
          {filteredProjets.length === 0 && <div className="gt-list-empty">Aucun projet ne correspond.</div>}
        </div>
      )}

      {view === "clients" && (
        <ClientsView
          clients={clients}
          projects={filteredProjets}
          query={query}
          onOpenClient={setOpenClientId}
          isOffice={isOffice}
        />
      )}

      {view === "materiels" && (
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
      )}

      {view === "vehicules" && (
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
      )}

      {view === "carte" && (
        <MapView projects={filteredProjets} getClient={getClient} onOpenProjet={setOpenProjetId} />
      )}

      {view === "calendrier" && (
        <CalendarView projects={filteredProjets} getClient={getClient} onOpenPrestation={setOpenPrestationId} />
      )}

      {openProjet && (
        <ProjetDrawer
          projet={openProjet}
          client={getClient(openProjet.clientId)}
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
          currentUser={currentUser}
        />
      )}

      {openPrestationCtx?.prestation && (
        <PrestationDrawer
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

      {openClient && (
        <ClientDrawer
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
          onRenameClient={renameClient}
          isOffice={isOffice}
        />
      )}

      {openMateriel && (
        <ResourceDrawer
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
          isOffice={isOffice}
        />
      )}

      {openVehicule && (
        <ResourceDrawer
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
          isOffice={isOffice}
        />
      )}

      {showNewProjet && (
        <NewProjetModal
          onClose={() => { setShowNewProjet(false); setNewProjetPresetClient(null); }}
          onCreate={createProjet}
          clients={clients}
          presetClient={newProjetPresetClient}
        />
      )}

      {showNewClient && (
        <NewResourceModal
          title="Nouveau client"
          label="Nom du client / maître d'ouvrage"
          placeholder="ex. SOMADIR Immobilier"
          onClose={() => setShowNewClient(false)}
          onCreate={createClient}
        />
      )}

      {showNewMateriel && (
        <NewResourceModal
          title="Nouveau matériel"
          label="Désignation du matériel"
          placeholder="ex. Théodolite"
          onClose={() => setShowNewMateriel(false)}
          onCreate={createMateriel}
        />
      )}

      {showNewVehicule && (
        <NewResourceModal
          title="Nouveau véhicule"
          label="Véhicule (type — immatriculation)"
          placeholder="ex. Pick-up — 33210-A-6"
          onClose={() => setShowNewVehicule(false)}
          onCreate={createVehicule}
        />
      )}
    </div>
  );
}
