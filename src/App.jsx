import React, { useState, useMemo } from "react";
import {
  Search,
  Plus,
  X,
  MapPin,
  Users,
  CheckCircle2,
  AlertTriangle,
  Compass,
  ChevronRight,
  ChevronLeft,
  Clock,
  Flag,
  Download,
  RotateCcw,
  PauseCircle,
  UserCog,
  Lock,
  List,
  Folder,
  Truck,
  Wrench,
  Archive,
  Building2,
  Pencil,
  Check,
} from "lucide-react";

const STAGES = [
  { key: "demande", label: "Demande" },
  { key: "prestation", label: "Prestation demandée" },
  { key: "affectation", label: "Affectation terrain" },
  { key: "execution", label: "Exécution" },
  { key: "bureau", label: "Traitement bureau" },
  { key: "controle", label: "Contrôle" },
  { key: "livraison", label: "Livraison" },
];

const STAGE_COLORS = {
  demande: "var(--muted)",
  prestation: "var(--blue)",
  affectation: "var(--accent)",
  execution: "var(--amber)",
  bureau: "var(--teal)",
  controle: "var(--violet)",
  livraison: "var(--good)",
};

const NATURES = [
  "Levé topographique",
  "Bornage terrain",
  "Relevé LiDAR",
  "Cartographie drone",
  "Implantation VRD",
  "Auscultation structure",
];

const AGENTS_CHANTIER = [
  { name: "K. Momayiz", role: "Chef d'équipe" },
  { name: "A. Oubrik", role: "Topographe" },
  { name: "Y. Chraibi", role: "Topographe" },
  { name: "N. Aziz", role: "Pilote drone" },
  { name: "S. Rami", role: "Topographe" },
  { name: "M. Fahmi", role: "Chef d'équipe" },
  { name: "L. Idrissi", role: "Géomètre" },
];

const AGENTS_BUREAU = ["H. Belkadi", "N. Sabir", "K. Amrani"];
const AGENTS_CONTROLE = ["M. Bensouda", "A. Lahlou"];
const VEHICULES = ["4x4 — 12345-A-6", "Fourgon — 78901-B-6", "Berline — 45632-A-6"];
const MATERIELS = ["Station totale", "GPS RTK", "Drone", "Scanner LiDAR", "Niveau optique"];
const ROLES = ["Dispatcher", "Directrice", "Agent Chantier", "Agent Bureau", "Agent Contrôle"];

const today = () =>
  new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });

const parseDateFR = (s) => {
  if (!s) return null;
  const [d, m, y] = s.split("/").map(Number);
  if (!d || !m || !y) return null;
  const t = new Date(y, m - 1, d).getTime();
  return Number.isNaN(t) ? null : t;
};

const formatTimestamp = (t) =>
  t == null ? null : new Date(t).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });

const nextClientId = (clients) => `CLI-0${240 + clients.length}`;

const blankPrestation = (overrides = {}) => ({
  id: "",
  natureDemandee: "",
  natureExecutee: "",
  dateDebutDemande: "",
  dateFinDemande: "",
  agentChantier: [],
  materiel: [],
  vehicule: "",
  dateDebutExec: "",
  dateFinExec: "",
  agentBureau: "",
  agentControle: "",
  dateDebutControle: "",
  dateFinControle: "",
  dateLivraison: "",
  ref: "",
  chemin: "",
  cdN: "",
  disqueN: "",
  stage: "demande",
  cycles: 0,
  reprogramme: false,
  history: [{ date: today(), label: "Demande reçue" }],
  ...overrides,
});

const seedClients = () => [
  { id: "CLI-0231", nom: "SOMADIR Immobilier" },
  { id: "CLI-0198", nom: "Groupe Chaabi Aménagement" },
  { id: "CLI-0090", nom: "OCP Foncier" },
  { id: "CLI-0012", nom: "Ministère de l'Équipement — DPE Rabat" },
];

const seedProjets = () => [
  {
    id: "PRJ-2026-014",
    clientId: "CLI-0231",
    referenceFonciere: "TF/45213/R",
    situation: "Hay Riad, Rabat",
    naturePrestationProjet: "Lotissement résidentiel",
    dateDebut: "20/08/2026",
    prestations: [
      blankPrestation({
        id: "PRS-2026-0131",
        natureDemandee: "Levé topographique",
        dateDebutDemande: "22/08/2026",
        stage: "prestation",
        history: [
          { date: "20/08/2026", label: "Demande reçue" },
          { date: "22/08/2026", label: "Prestation définie — Levé topographique" },
        ],
      }),
    ],
  },
  {
    id: "PRJ-2026-011",
    clientId: "CLI-0198",
    referenceFonciere: "TF/78341/K",
    situation: "Zone industrielle, Kénitra",
    naturePrestationProjet: "Aménagement VRD",
    dateDebut: "10/08/2026",
    prestations: [
      blankPrestation({
        id: "PRS-2026-0128",
        natureDemandee: "Implantation VRD",
        dateDebutDemande: "12/08/2026",
        agentChantier: ["M. Fahmi", "L. Idrissi"],
        materiel: ["Station totale", "GPS RTK"],
        vehicule: "4x4 — 12345-A-6",
        agentBureau: "H. Belkadi",
        agentControle: "M. Bensouda",
        dateDebutExec: "10/09/2026",
        stage: "affectation",
        history: [
          { date: "10/08/2026", label: "Demande reçue" },
          { date: "12/08/2026", label: "Prestation définie — Implantation VRD" },
          { date: "14/08/2026", label: "Affectation : M. Fahmi, L. Idrissi — visite prévue le 10/09/2026" },
        ],
      }),
    ],
  },
  {
    id: "PRJ-2026-009",
    clientId: "CLI-0090",
    referenceFonciere: "TF/12938/S",
    situation: "Sidi Bouknadel",
    naturePrestationProjet: "Bornage",
    dateDebut: "01/08/2026",
    prestations: [
      blankPrestation({
        id: "PRS-2026-0124",
        natureDemandee: "Bornage terrain",
        natureExecutee: "Bornage contradictoire, 2 parcelles",
        agentChantier: ["K. Momayiz"],
        materiel: ["GPS RTK", "Niveau optique"],
        vehicule: "Berline — 45632-A-6",
        agentBureau: "N. Sabir",
        agentControle: "A. Lahlou",
        dateDebutExec: "15/08/2026",
        dateFinExec: "15/08/2026",
        stage: "controle",
        cycles: 1,
        history: [
          { date: "01/08/2026", label: "Demande reçue" },
          { date: "03/08/2026", label: "Prestation définie — Bornage terrain" },
          { date: "05/08/2026", label: "Affectation : K. Momayiz — visite prévue le 15/08/2026" },
          { date: "15/08/2026", label: "Exécution saisie — Bornage contradictoire, 2 parcelles" },
          { date: "18/08/2026", label: "Traitement bureau terminé" },
          { date: "20/08/2026", label: "Non conforme — bornes voisines non repérées. Retour à Exécution." },
          { date: "22/08/2026", label: "Nouvelle exécution saisie, envoyée au contrôle" },
        ],
      }),
    ],
  },
  {
    id: "PRJ-2026-005",
    clientId: "CLI-0090",
    referenceFonciere: "TF/55010/S",
    situation: "Aïn Aouda",
    naturePrestationProjet: "Cartographie drone",
    dateDebut: "18/07/2026",
    prestations: [
      blankPrestation({
        id: "PRS-2026-0115",
        natureDemandee: "Cartographie drone",
        natureExecutee: "Orthophoto 40 ha",
        agentChantier: ["N. Aziz"],
        materiel: ["Drone"],
        vehicule: "Fourgon — 78901-B-6",
        agentBureau: "K. Amrani",
        agentControle: "A. Lahlou",
        dateDebutExec: "22/07/2026",
        dateFinExec: "22/07/2026",
        dateLivraison: "02/08/2026",
        ref: "LIV-0115",
        chemin: "\\\\SERVEUR\\Projets\\PRJ-2026-005\\PRS-0115",
        cdN: "CD-0198",
        disqueN: "DQ-009",
        stage: "livraison",
        history: [
          { date: "18/07/2026", label: "Demande reçue" },
          { date: "19/07/2026", label: "Prestation définie — Cartographie drone" },
          { date: "20/07/2026", label: "Affectation : N. Aziz" },
          { date: "22/07/2026", label: "Exécution saisie — Orthophoto 40 ha" },
          { date: "28/07/2026", label: "Traitement bureau terminé" },
          { date: "30/07/2026", label: "Chantier conforme" },
          { date: "02/08/2026", label: "Livré — Réf LIV-0115" },
        ],
      }),
    ],
  },
  {
    id: "PRJ-2026-002",
    clientId: "CLI-0012",
    referenceFonciere: "DPU/R401",
    situation: "Route régionale R401, Casablanca",
    naturePrestationProjet: "Étude linéaire",
    dateDebut: "01/07/2026",
    prestations: [
      blankPrestation({
        id: "PRS-2026-0110",
        natureDemandee: "Relevé LiDAR",
        natureExecutee: "Relevé LiDAR mobile, 14 km de linéaire",
        agentChantier: ["N. Aziz", "Y. Chraibi"],
        materiel: ["Scanner LiDAR", "Drone"],
        vehicule: "Fourgon — 78901-B-6",
        agentBureau: "K. Amrani",
        agentControle: "M. Bensouda",
        dateDebutExec: "05/08/2026",
        dateFinExec: "06/08/2026",
        dateLivraison: "27/08/2026",
        ref: "LIV-0110",
        chemin: "\\\\SERVEUR\\Projets\\PRJ-2026-002\\PRS-0110",
        cdN: "CD-0231",
        disqueN: "DQ-014",
        stage: "livraison",
        history: [
          { date: "01/07/2026", label: "Demande reçue" },
          { date: "02/07/2026", label: "Prestation définie — Relevé LiDAR" },
          { date: "05/07/2026", label: "Affectation : N. Aziz, Y. Chraibi" },
          { date: "06/08/2026", label: "Exécution saisie — relevé mobile 14 km" },
          { date: "12/08/2026", label: "Traitement bureau terminé" },
          { date: "18/08/2026", label: "Chantier conforme" },
          { date: "27/08/2026", label: "Livré — Réf LIV-0110" },
        ],
      }),
    ],
  },
];

function PipelineStepper({ stage, cycles }) {
  const idx = STAGES.findIndex((s) => s.key === stage);
  return (
    <div>
      <div className="gt-pipeline">
        {STAGES.map((s, i) => (
          <React.Fragment key={s.key}>
            <div className={`gt-pipe-step ${i < idx ? "done" : ""} ${i === idx ? "current" : ""}`}>
              <div className="gt-pipe-dot">{i < idx ? <CheckCircle2 size={11} /> : i + 1}</div>
              <div className="gt-pipe-label">{s.label}</div>
            </div>
            {i < STAGES.length - 1 && <div className={`gt-pipe-line ${i < idx ? "done" : ""}`} />}
          </React.Fragment>
        ))}
      </div>
      {cycles > 0 && (
        <div className="gt-pipe-loop">
          <RotateCcw size={12} strokeWidth={2.2} />
          Renvoyé en Exécution {cycles} fois suite à non-conformité
        </div>
      )}
    </div>
  );
}

function canAct(stageKey, currentUser) {
  const office = currentUser.role === "Dispatcher" || currentUser.role === "Directrice";
  if (office) return true;
  if (stageKey === "affectation" || stageKey === "execution") return currentUser.role === "Agent Chantier";
  if (stageKey === "bureau") return currentUser.role === "Agent Bureau";
  if (stageKey === "controle") return currentUser.role === "Agent Contrôle";
  return false;
}

function visibleToUser(prestation, currentUser) {
  const office = currentUser.role === "Dispatcher" || currentUser.role === "Directrice";
  if (office) return true;
  if (currentUser.role === "Agent Chantier") return (prestation.agentChantier || []).includes(currentUser.name);
  if (currentUser.role === "Agent Bureau") return prestation.agentBureau === currentUser.name;
  if (currentUser.role === "Agent Contrôle") return prestation.agentControle === currentUser.name;
  return true;
}

function PrestationDrawer({ projet, client, prestation, onClose, onUpdate, currentUser }) {
  const [natureDemandee, setNatureDemandee] = useState(prestation.natureDemandee);
  const [dateDebutDemande, setDateDebutDemande] = useState(prestation.dateDebutDemande);
  const [dateFinDemande, setDateFinDemande] = useState(prestation.dateFinDemande);

  const [agentChantierSel, setAgentChantierSel] = useState(prestation.agentChantier);
  const [materielSel, setMaterielSel] = useState(prestation.materiel);
  const [vehicule, setVehicule] = useState(prestation.vehicule);
  const [agentBureau, setAgentBureau] = useState(prestation.agentBureau || AGENTS_BUREAU[0]);
  const [agentControle, setAgentControle] = useState(prestation.agentControle || AGENTS_CONTROLE[0]);
  const [dateDebutExecPrevue, setDateDebutExecPrevue] = useState(prestation.dateDebutExec);

  const [natureExecutee, setNatureExecutee] = useState(prestation.natureExecutee);
  const [dateFinExec, setDateFinExec] = useState(prestation.dateFinExec);
  const [showReprog, setShowReprog] = useState(false);
  const [reprogDate, setReprogDate] = useState("");

  const [refBureau, setRefBureau] = useState(prestation.ref);

  const [dateDebutControle, setDateDebutControle] = useState(prestation.dateDebutControle);
  const [dateFinControle, setDateFinControle] = useState(prestation.dateFinControle);
  const [motifNonConforme, setMotifNonConforme] = useState("");

  const [dateLivraison, setDateLivraison] = useState(prestation.dateLivraison);
  const [chemin, setChemin] = useState(prestation.chemin);
  const [cdN, setCdN] = useState(prestation.cdN);
  const [disqueN, setDisqueN] = useState(prestation.disqueN);

  const push = (patch, label) => {
    onUpdate(prestation.id, {
      ...patch,
      history: [...prestation.history, { date: today(), label }],
    });
  };

  const toggleChantier = (name) =>
    setAgentChantierSel((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]));
  const toggleMateriel = (m) =>
    setMaterielSel((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));

  const stage = prestation.stage;
  const allowed = canAct(stage, currentUser);

  return (
    <div className="gt-drawer-backdrop" onClick={onClose}>
      <div className="gt-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="gt-drawer-head">
          <div>
            <div className="gt-mono gt-drawer-id">{prestation.id} · {projet.id}</div>
            <div className="gt-drawer-client">{client?.nom || "—"}</div>
          </div>
          <button className="gt-iconbtn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="gt-drawer-meta">
          <span className="gt-chip">
            <MapPin size={12} /> {projet.situation}
          </span>
          <span className="gt-chip">Réf. foncière : {projet.referenceFonciere}</span>
          <span className="gt-chip">Client : {client?.id || "—"}</span>
          {!allowed && (
            <span className="gt-chip" style={{ borderColor: "var(--muted)" }}>
              <Lock size={11} /> Lecture seule pour votre rôle
            </span>
          )}
        </div>

        <div className="gt-drawer-pipeline">
          <PipelineStepper stage={stage} cycles={prestation.cycles} />
        </div>

        <div className="gt-drawer-body">
          <section className="gt-section">
            <h4>Étape en cours — {STAGES.find((s) => s.key === stage).label}</h4>

            {stage === "demande" && (
              allowed ? (
                <div className="gt-form">
                  <label>Nature de la prestation demandée</label>
                  <select value={natureDemandee} onChange={(e) => setNatureDemandee(e.target.value)}>
                    <option value="">— choisir —</option>
                    {NATURES.map((n) => (
                      <option key={n}>{n}</option>
                    ))}
                  </select>
                  <div className="gt-formrow">
                    <div style={{ flex: 1 }}>
                      <label>Date début</label>
                      <input value={dateDebutDemande} onChange={(e) => setDateDebutDemande(e.target.value)} placeholder="jj/mm/aaaa" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label>Date fin prévue</label>
                      <input value={dateFinDemande} onChange={(e) => setDateFinDemande(e.target.value)} placeholder="jj/mm/aaaa" />
                    </div>
                  </div>
                  <button
                    className="gt-btn gt-btn-primary"
                    disabled={!natureDemandee || !dateDebutDemande}
                    onClick={() =>
                      push(
                        { stage: "prestation", natureDemandee, dateDebutDemande, dateFinDemande },
                        `Prestation définie — ${natureDemandee}`
                      )
                    }
                  >
                    Valider la prestation demandée <ChevronRight size={14} />
                  </button>
                </div>
              ) : (
                <div className="gt-readonly gt-restricted"><Lock size={12} /> Réservé au bureau (Dispatcher/Directrice)</div>
              )
            )}

            {stage === "prestation" && (
              allowed ? (
                <div className="gt-form">
                  <div className="gt-readonly">
                    <div className="gt-mono">{prestation.natureDemandee}</div>
                    <div>Demandé du {prestation.dateDebutDemande} au {prestation.dateFinDemande || "—"}</div>
                  </div>
                  <label>Agent(s) chantier</label>
                  <div className="gt-teamgrid">
                    {AGENTS_CHANTIER.map((t) => (
                      <label key={t.name} className={`gt-teampick ${agentChantierSel.includes(t.name) ? "active" : ""}`}>
                        <input type="checkbox" checked={agentChantierSel.includes(t.name)} onChange={() => toggleChantier(t.name)} />
                        <span className="gt-teampick-name">{t.name}</span>
                        <span className="gt-teampick-role">{t.role}</span>
                      </label>
                    ))}
                  </div>
                  <label>Matériel utilisé</label>
                  <div className="gt-teamgrid">
                    {MATERIELS.map((m) => (
                      <label key={m} className={`gt-teampick ${materielSel.includes(m) ? "active" : ""}`}>
                        <input type="checkbox" checked={materielSel.includes(m)} onChange={() => toggleMateriel(m)} />
                        <span className="gt-teampick-name">{m}</span>
                      </label>
                    ))}
                  </div>
                  <label>Véhicule</label>
                  <select value={vehicule} onChange={(e) => setVehicule(e.target.value)}>
                    <option value="">— choisir —</option>
                    {VEHICULES.map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                  <div className="gt-formrow">
                    <div style={{ flex: 1 }}>
                      <label>Agent bureau (traitement)</label>
                      <select value={agentBureau} onChange={(e) => setAgentBureau(e.target.value)}>
                        {AGENTS_BUREAU.map((a) => (
                          <option key={a}>{a}</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label>Agent contrôle</label>
                      <select value={agentControle} onChange={(e) => setAgentControle(e.target.value)}>
                        {AGENTS_CONTROLE.map((a) => (
                          <option key={a}>{a}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <label>Date de visite prévue</label>
                  <input value={dateDebutExecPrevue} onChange={(e) => setDateDebutExecPrevue(e.target.value)} placeholder="jj/mm/aaaa" />
                  <button
                    className="gt-btn gt-btn-primary"
                    disabled={agentChantierSel.length === 0 || !dateDebutExecPrevue}
                    onClick={() =>
                      push(
                        {
                          stage: "affectation",
                          agentChantier: agentChantierSel,
                          materiel: materielSel,
                          vehicule,
                          agentBureau,
                          agentControle,
                          dateDebutExec: dateDebutExecPrevue,
                        },
                        `Affectation : ${agentChantierSel.join(", ")} — visite prévue le ${dateDebutExecPrevue}`
                      )
                    }
                  >
                    Affecter les ressources <ChevronRight size={14} />
                  </button>
                </div>
              ) : (
                <div className="gt-readonly gt-restricted"><Lock size={12} /> Réservé au bureau (Dispatcher/Directrice)</div>
              )
            )}

            {stage === "affectation" && (
              <div className="gt-form">
                <div className="gt-readonly">
                  <div><Users size={12} style={{ verticalAlign: -2 }} /> {prestation.agentChantier.join(", ")}</div>
                  <div><Wrench size={12} style={{ verticalAlign: -2 }} /> {prestation.materiel.join(", ") || "—"}</div>
                  <div><Truck size={12} style={{ verticalAlign: -2 }} /> {prestation.vehicule || "—"}</div>
                  <div>Visite prévue le {prestation.dateDebutExec}</div>
                </div>
                {allowed ? (
                  <button
                    className="gt-btn gt-btn-primary"
                    onClick={() => push({ stage: "execution" }, `Passage à l'exécution — visite du ${prestation.dateDebutExec}`)}
                  >
                    Démarrer l'exécution <ChevronRight size={14} />
                  </button>
                ) : (
                  <div className="gt-readonly gt-restricted"><Lock size={12} /> En attente de l'agent chantier assigné</div>
                )}
              </div>
            )}

            {stage === "execution" && (
              allowed ? (
                <div className="gt-form">
                  {prestation.reprogramme && (
                    <div className="gt-readonly" style={{ borderColor: "var(--amber)", color: "var(--amber)" }}>
                      Visite précédente inachevée — reprise prévue le {prestation.dateDebutExec}
                    </div>
                  )}
                  <label>Prestation réellement exécutée</label>
                  <textarea value={natureExecutee} onChange={(e) => setNatureExecutee(e.target.value)} rows={2} placeholder="Ce qui a été fait sur le terrain..." />
                  <label>Date de fin d'exécution</label>
                  <input value={dateFinExec} onChange={(e) => setDateFinExec(e.target.value)} placeholder="jj/mm/aaaa" />
                  <button
                    className="gt-btn gt-btn-primary"
                    disabled={!natureExecutee || !dateFinExec}
                    onClick={() =>
                      push(
                        { stage: "bureau", natureExecutee, dateFinExec, reprogramme: false },
                        `Exécution saisie — ${natureExecutee}`
                      )
                    }
                  >
                    Envoyer au bureau <ChevronRight size={14} />
                  </button>

                  {!showReprog ? (
                    <button className="gt-btn gt-btn-neutral" onClick={() => setShowReprog(true)}>
                      <PauseCircle size={14} /> Mission non terminée — reprogrammer
                    </button>
                  ) : (
                    <div className="gt-reprogbox">
                      <label>Nouvelle date de visite</label>
                      <input value={reprogDate} onChange={(e) => setReprogDate(e.target.value)} placeholder="jj/mm/aaaa" />
                      <button
                        className="gt-btn gt-btn-primary"
                        disabled={!reprogDate}
                        onClick={() => push({ dateDebutExec: reprogDate, reprogramme: true }, `Visite partielle — reprise prévue le ${reprogDate}`)}
                      >
                        Reprogrammer <ChevronRight size={14} />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="gt-readonly gt-restricted"><Lock size={12} /> Réservé à l'agent chantier assigné</div>
              )
            )}

            {stage === "bureau" && (
              allowed ? (
                <div className="gt-form">
                  <div className="gt-readonly">{prestation.natureExecutee}</div>
                  <label>Référence du livrable (en cours de traitement)</label>
                  <input value={refBureau} onChange={(e) => setRefBureau(e.target.value)} placeholder="ex. LIV-0134" />
                  <button
                    className="gt-btn gt-btn-primary"
                    onClick={() => push({ stage: "controle", ref: refBureau }, "Traitement bureau terminé")}
                  >
                    Envoyer au contrôle <ChevronRight size={14} />
                  </button>
                </div>
              ) : (
                <div className="gt-readonly gt-restricted"><Lock size={12} /> Réservé à l'agent bureau assigné ({prestation.agentBureau})</div>
              )
            )}

            {stage === "controle" && (
              allowed ? (
                <div className="gt-form">
                  <div className="gt-readonly">{prestation.natureExecutee}</div>
                  <div className="gt-formrow">
                    <div style={{ flex: 1 }}>
                      <label>Date début contrôle</label>
                      <input value={dateDebutControle} onChange={(e) => setDateDebutControle(e.target.value)} placeholder="jj/mm/aaaa" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label>Date fin contrôle</label>
                      <input value={dateFinControle} onChange={(e) => setDateFinControle(e.target.value)} placeholder="jj/mm/aaaa" />
                    </div>
                  </div>
                  <label>Motif (si non conforme)</label>
                  <textarea value={motifNonConforme} onChange={(e) => setMotifNonConforme(e.target.value)} rows={2} />
                  <div className="gt-btnrow">
                    <button
                      className="gt-btn gt-btn-good"
                      onClick={() => push({ stage: "livraison", dateDebutControle, dateFinControle }, "Contrôle conforme")}
                    >
                      <CheckCircle2 size={14} /> Conforme
                    </button>
                    <button
                      className="gt-btn gt-btn-bad"
                      disabled={!motifNonConforme}
                      onClick={() =>
                        push(
                          { stage: "execution", dateDebutControle, dateFinControle, cycles: prestation.cycles + 1 },
                          `Non conforme — ${motifNonConforme}. Retour à Exécution.`
                        )
                      }
                    >
                      <AlertTriangle size={14} /> Non conforme
                    </button>
                  </div>
                </div>
              ) : (
                <div className="gt-readonly gt-restricted"><Lock size={12} /> Réservé à l'agent contrôle assigné ({prestation.agentControle})</div>
              )
            )}

            {stage === "livraison" && (
              allowed ? (
                prestation.chemin && prestation.dateLivraison ? (
                  <div className="gt-readonly">
                    <div className="gt-mono">Livré le {prestation.dateLivraison} — Réf {prestation.ref}</div>
                    <div className="gt-mono">{prestation.chemin}</div>
                    <div className="gt-mono">CD {prestation.cdN} · Disque {prestation.disqueN}</div>
                  </div>
                ) : (
                  <div className="gt-form">
                    <label>Date de livraison</label>
                    <input value={dateLivraison} onChange={(e) => setDateLivraison(e.target.value)} placeholder="jj/mm/aaaa" />
                    <label>Chemin réseau</label>
                    <input value={chemin} onChange={(e) => setChemin(e.target.value)} placeholder="\\SERVEUR\Projets\..." />
                    <div className="gt-formrow">
                      <div style={{ flex: 1 }}>
                        <label>CD N°</label>
                        <input value={cdN} onChange={(e) => setCdN(e.target.value)} placeholder="CD-0123" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label>Disque N°</label>
                        <input value={disqueN} onChange={(e) => setDisqueN(e.target.value)} placeholder="DQ-045" />
                      </div>
                    </div>
                    <button
                      className="gt-btn gt-btn-primary"
                      disabled={!dateLivraison || !chemin}
                      onClick={() => push({ dateLivraison, chemin, cdN, disqueN }, `Livré — Réf ${prestation.ref || "—"}`)}
                    >
                      <Archive size={14} /> Archiver et clôturer
                    </button>
                  </div>
                )
              ) : (
                <div className="gt-readonly gt-restricted"><Lock size={12} /> Réservé au bureau (Dispatcher/Directrice)</div>
              )
            )}
          </section>

          <section className="gt-section">
            <h4>
              <Clock size={13} strokeWidth={2.2} /> Historique
            </h4>
            <div className="gt-timeline">
              {prestation.history
                .slice()
                .reverse()
                .map((h, i) => (
                  <div className="gt-timeline-row" key={i}>
                    <div className="gt-timeline-dot" />
                    <div>
                      <div className="gt-mono gt-timeline-date">{h.date}</div>
                      <div className="gt-timeline-label">{h.label}</div>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function ProjetDrawer({ projet, client, onClose, onOpenPrestation, onAddPrestation, onOpenClient, currentUser }) {
  const office = currentUser.role === "Dispatcher" || currentUser.role === "Directrice";
  const [showNew, setShowNew] = useState(false);
  const [nature, setNature] = useState(NATURES[0]);

  const visiblePrestations = projet.prestations.filter((p) => visibleToUser(p, currentUser));

  return (
    <div className="gt-drawer-backdrop" onClick={onClose}>
      <div className="gt-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="gt-drawer-head">
          <div>
            <div className="gt-mono gt-drawer-id">{projet.id}</div>
            {onOpenClient && client ? (
              <button className="gt-drawer-client gt-drawer-client-link" onClick={() => onOpenClient(client.id)}>
                {client.nom}
              </button>
            ) : (
              <div className="gt-drawer-client">{client?.nom || "—"}</div>
            )}
          </div>
          <button className="gt-iconbtn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="gt-drawer-meta">
          <span className="gt-chip">Code {client?.id || "—"}</span>
          <span className="gt-chip">Réf. foncière {projet.referenceFonciere}</span>
          <span className="gt-chip"><MapPin size={12} /> {projet.situation}</span>
          <span className="gt-chip">{projet.naturePrestationProjet}</span>
        </div>

        <div className="gt-drawer-body">
          <section className="gt-section">
            <h4>Prestations ({visiblePrestations.length})</h4>
            <div className="gt-projet-prestations">
              {visiblePrestations.map((p) => (
                <button className="gt-listrow" key={p.id} onClick={() => onOpenPrestation(p.id)}>
                  <div className="gt-listrow-info">
                    <div className="gt-mono gt-listrow-id">{p.id}</div>
                    <div className="gt-listrow-client">{p.natureDemandee || "Non définie"}</div>
                  </div>
                  <div className="gt-listrow-progress">
                    {STAGES.map((s, i) => {
                      const idx = STAGES.findIndex((x) => x.key === p.stage);
                      return (
                        <div
                          key={s.key}
                          className="gt-listrow-seg"
                          style={i <= idx ? { background: STAGE_COLORS[p.stage] } : undefined}
                        />
                      );
                    })}
                  </div>
                  <div className="gt-listrow-stage">{STAGES.find((s) => s.key === p.stage).label}</div>
                  {p.cycles > 0 && (
                    <span className="gt-pill gt-pill-bad">
                      <AlertTriangle size={11} /> ×{p.cycles}
                    </span>
                  )}
                </button>
              ))}
              {visiblePrestations.length === 0 && <div className="gt-list-empty">Aucune prestation visible.</div>}
            </div>

            {office && (
              !showNew ? (
                <button className="gt-btn gt-btn-neutral" style={{ marginTop: 12 }} onClick={() => setShowNew(true)}>
                  <Plus size={14} /> Ajouter une prestation à ce projet
                </button>
              ) : (
                <div className="gt-reprogbox" style={{ marginTop: 12 }}>
                  <label>Nature de la prestation</label>
                  <select value={nature} onChange={(e) => setNature(e.target.value)}>
                    {NATURES.map((n) => (
                      <option key={n}>{n}</option>
                    ))}
                  </select>
                  <button
                    className="gt-btn gt-btn-primary"
                    onClick={() => {
                      onAddPrestation(projet.id, nature);
                      setShowNew(false);
                    }}
                  >
                    Créer la prestation <ChevronRight size={14} />
                  </button>
                </div>
              )
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function NewProjetModal({ onClose, onCreate, clients, presetClient }) {
  const [selectedClientId, setSelectedClientId] = useState(presetClient ? presetClient.id : "");
  const [newClientNom, setNewClientNom] = useState("");
  const [refFonciere, setRefFonciere] = useState("");
  const [situation, setSituation] = useState("");
  const [nature, setNature] = useState("");

  const creatingNewClient = !presetClient && selectedClientId === "__new__";
  const clientReady = presetClient ? true : creatingNewClient ? newClientNom.trim().length > 0 : selectedClientId !== "";

  const submit = () => {
    if (!clientReady || !situation) return;
    onCreate({
      clientId: presetClient ? presetClient.id : creatingNewClient ? null : selectedClientId,
      newClientNom: presetClient ? null : creatingNewClient ? newClientNom.trim() : null,
      refFonciere,
      situation,
      nature,
    });
    onClose();
  };

  return (
    <div className="gt-drawer-backdrop" onClick={onClose}>
      <div className="gt-modal" onClick={(e) => e.stopPropagation()}>
        <div className="gt-drawer-head">
          <div className="gt-drawer-client">Nouveau projet</div>
          <button className="gt-iconbtn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="gt-form" style={{ padding: "16px 20px 20px" }}>
          {presetClient ? (
            <>
              <label>Client</label>
              <div className="gt-chip" style={{ width: "fit-content" }}>
                <Building2 size={12} /> {presetClient.nom} ({presetClient.id})
              </div>
            </>
          ) : (
            <>
              <label>Client</label>
              <select value={selectedClientId} onChange={(e) => setSelectedClientId(e.target.value)}>
                <option value="">— choisir un client —</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.nom} ({c.id})</option>
                ))}
                <option value="__new__">+ Nouveau client…</option>
              </select>
              {creatingNewClient && (
                <input value={newClientNom} onChange={(e) => setNewClientNom(e.target.value)} placeholder="Nom du nouveau client" autoFocus />
              )}
            </>
          )}
          <label>Référence foncière</label>
          <input value={refFonciere} onChange={(e) => setRefFonciere(e.target.value)} placeholder="ex. TF/12345/R" />
          <label>Situation / localisation</label>
          <input value={situation} onChange={(e) => setSituation(e.target.value)} placeholder="ex. Hay Riad, Rabat" />
          <label>Nature du projet</label>
          <input value={nature} onChange={(e) => setNature(e.target.value)} placeholder="ex. Lotissement résidentiel" />
          <button className="gt-btn gt-btn-primary" onClick={submit} disabled={!clientReady || !situation}>
            Créer le projet <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function NewClientModal({ onClose, onCreate }) {
  const [nom, setNom] = useState("");

  const submit = () => {
    if (!nom.trim()) return;
    onCreate(nom.trim());
    onClose();
  };

  return (
    <div className="gt-drawer-backdrop" onClick={onClose}>
      <div className="gt-modal" onClick={(e) => e.stopPropagation()}>
        <div className="gt-drawer-head">
          <div className="gt-drawer-client">Nouveau client</div>
          <button className="gt-iconbtn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="gt-form" style={{ padding: "16px 20px 20px" }}>
          <label>Nom du client / maître d'ouvrage</label>
          <input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="ex. SOMADIR Immobilier" autoFocus />
          <button className="gt-btn gt-btn-primary" onClick={submit} disabled={!nom.trim()}>
            Créer le client <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function computeClientStats(client, projects) {
  const clientProjects = projects.filter((p) => p.clientId === client.id);
  let nbPrestations = 0;
  let enCours = 0;
  let nonConf = 0;
  let lastActivity = null;
  clientProjects.forEach((pr) => {
    pr.prestations.forEach((p) => {
      nbPrestations += 1;
      if (p.stage !== "livraison" || !p.chemin) enCours += 1;
      if (p.cycles > 0) nonConf += 1;
      p.history.forEach((h) => {
        const t = parseDateFR(h.date);
        if (t != null && (lastActivity === null || t > lastActivity)) lastActivity = t;
      });
    });
  });
  return { projects: clientProjects, nbProjects: clientProjects.length, nbPrestations, enCours, nonConf, lastActivity };
}

function ClientDrawer({ client, projects, onClose, onOpenProjet, onNewProjetForClient, onRenameClient, isOffice }) {
  const [renaming, setRenaming] = useState(false);
  const [nomDraft, setNomDraft] = useState(client.nom);
  const stats = computeClientStats(client, projects);

  const submitRename = () => {
    if (nomDraft.trim()) onRenameClient(client.id, nomDraft.trim());
    setRenaming(false);
  };

  return (
    <div className="gt-drawer-backdrop" onClick={onClose}>
      <div className="gt-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="gt-drawer-head">
          <div style={{ flex: 1 }}>
            <div className="gt-mono gt-drawer-id">{client.id}</div>
            {renaming ? (
              <div className="gt-renamebox">
                <input value={nomDraft} onChange={(e) => setNomDraft(e.target.value)} autoFocus onKeyDown={(e) => e.key === "Enter" && submitRename()} />
                <button className="gt-iconbtn" onClick={submitRename}>
                  <Check size={16} />
                </button>
              </div>
            ) : (
              <div className="gt-drawer-client">
                {client.nom}
                {isOffice && (
                  <button className="gt-iconbtn gt-rename-btn" onClick={() => { setNomDraft(client.nom); setRenaming(true); }}>
                    <Pencil size={13} />
                  </button>
                )}
              </div>
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
            <div className="gt-projet-prestations">
              {stats.projects.map((pr) => (
                <button className="gt-listrow" key={pr.id} onClick={() => onOpenProjet(pr.id)}>
                  <div className="gt-listrow-info">
                    <div className="gt-mono gt-listrow-id">{pr.id}</div>
                    <div className="gt-listrow-client">{pr.naturePrestationProjet || pr.situation}</div>
                  </div>
                  <div className="gt-listrow-stage">{pr.prestations.length} prestation{pr.prestations.length > 1 ? "s" : ""}</div>
                </button>
              ))}
              {stats.projects.length === 0 && <div className="gt-list-empty">Aucun projet pour ce client.</div>}
            </div>

            {isOffice && (
              <button className="gt-btn gt-btn-neutral" style={{ marginTop: 12 }} onClick={() => onNewProjetForClient(client)}>
                <Plus size={14} /> Nouveau projet pour ce client
              </button>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function ClientsView({ clients, projects, query, onOpenClient, isOffice }) {
  const rows = useMemo(() => {
    return clients
      .map((c) => ({ client: c, stats: computeClientStats(c, projects) }))
      .filter(({ stats }) => stats.nbProjects > 0 || isOffice)
      .filter(
        ({ client }) =>
          !query || client.nom.toLowerCase().includes(query.toLowerCase()) || client.id.toLowerCase().includes(query.toLowerCase())
      )
      .sort((a, b) => b.stats.nbProjects - a.stats.nbProjects || a.client.nom.localeCompare(b.client.nom));
  }, [clients, projects, query, isOffice]);

  return (
    <div className="gt-projets">
      {rows.map(({ client, stats }) => (
        <div className="gt-projetcard" key={client.id} onClick={() => onOpenClient(client.id)}>
          <div className="gt-projetcard-top">
            <span className="gt-projetcard-client" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Building2 size={15} color="var(--muted)" /> {client.nom}
              {stats.nbProjects > 1 && (
                <span className="gt-pill gt-pill-warn">{stats.nbProjects} projets liés</span>
              )}
            </span>
            <span className="gt-projetcard-id gt-mono">{client.id}</span>
          </div>
          <div className="gt-projetcard-meta">
            <span><Folder size={12} style={{ verticalAlign: -2 }} /> {stats.nbProjects} projet{stats.nbProjects > 1 ? "s" : ""}</span>
            <span>{stats.nbPrestations} prestation{stats.nbPrestations > 1 ? "s" : ""}</span>
            <span>{stats.enCours} en cours</span>
            {stats.nonConf > 0 && (
              <span style={{ color: "var(--bad)" }}><AlertTriangle size={12} style={{ verticalAlign: -2 }} /> {stats.nonConf} non-conforme{stats.nonConf > 1 ? "s" : ""}</span>
            )}
            {stats.lastActivity != null && <span>Dernière activité : {formatTimestamp(stats.lastActivity)}</span>}
          </div>
        </div>
      ))}
      {rows.length === 0 && <div className="gt-list-empty">Aucun client ne correspond.</div>}
    </div>
  );
}

export default function GlobetudesProjets() {
  const [clients, setClients] = useState(seedClients());
  const [projets, setProjets] = useState(seedProjets());
  const [view, setView] = useState("projets");
  const [openProjetId, setOpenProjetId] = useState(null);
  const [openPrestationId, setOpenPrestationId] = useState(null);
  const [openClientId, setOpenClientId] = useState(null);
  const [showNewProjet, setShowNewProjet] = useState(false);
  const [newProjetPresetClient, setNewProjetPresetClient] = useState(null);
  const [showNewClient, setShowNewClient] = useState(false);
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

  const createProjet = ({ clientId, newClientNom, refFonciere, situation, nature }) => {
    let cid = clientId;
    if (!cid && newClientNom) cid = createClient(newClientNom);
    const id = `PRJ-2026-0${20 + projets.length}`;
    setProjets((prev) => [
      {
        id,
        clientId: cid,
        referenceFonciere: refFonciere,
        situation,
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
      return [
        p.projet.id, client?.nom || "", client?.id || "", p.projet.referenceFonciere, p.id,
        p.natureDemandee, p.natureExecutee, (p.agentChantier || []).join(", "), (p.materiel || []).join(", "),
        p.vehicule, p.agentBureau, p.agentControle, STAGES.find((s) => s.key === p.stage).label, p.cycles,
        p.dateLivraison, p.chemin, p.cdN, p.disqueN,
      ];
    });
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c || "").replace(/"/g, '""')}"`).join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
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

  const isOffice = currentUser.role === "Dispatcher" || currentUser.role === "Directrice";

  const stats = useMemo(() => {
    const total = allPrestationsFlat.length;
    const enCours = allPrestationsFlat.filter((p) => p.stage !== "livraison" || !p.chemin).length;
    const nonConf = allPrestationsFlat.filter((p) => p.cycles > 0).length;
    const livres = allPrestationsFlat.filter((p) => p.stage === "livraison" && p.chemin).length;
    return { total, enCours, nonConf, livres };
  }, [allPrestationsFlat]);

  return (
    <div className="gt-app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

        .gt-app {
          --ink: #14181F; --paper: #EEF0EA; --panel: #FAFAF6; --line: #D6D3C8;
          --accent: #E15B1F; --blue: #2F4858; --violet: #6B4FA0; --teal: #2E7D6B;
          --good: #3F7855; --bad: #B23A2E; --amber: #C98A2C; --muted: #6B6F66;
          font-family: 'IBM Plex Sans', sans-serif; background: var(--paper); color: var(--ink);
          min-height: 100vh; display: flex; flex-direction: column;
        }
        .gt-mono { font-family: 'IBM Plex Mono', monospace; }

        .gt-topbar { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 16px 24px; border-bottom: 1px solid var(--line); background: var(--panel); flex-wrap: wrap; row-gap: 10px; }
        .gt-brand { display: flex; align-items: center; gap: 10px; }
        .gt-brand-mark { width: 30px; height: 30px; border: 1.5px solid var(--ink); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--accent); }
        .gt-brand-text { line-height: 1.1; }
        .gt-brand-title { font-weight: 600; font-size: 15px; }
        .gt-brand-sub { font-size: 11.5px; color: var(--muted); font-family: 'IBM Plex Mono', monospace; letter-spacing: 0.02em; }

        .gt-tabs { display: flex; gap: 2px; border: 1px solid var(--line); background: #fff; padding: 2px; }
        .gt-tab { display: flex; align-items: center; gap: 5px; border: none; background: transparent; padding: 6px 11px; font-size: 12.5px; font-weight: 500; color: var(--muted); cursor: pointer; font-family: 'IBM Plex Sans', sans-serif; }
        .gt-tab.active { background: var(--ink); color: #fff; }

        .gt-userswitch { display: flex; align-items: center; gap: 6px; border: 1px solid var(--line); background: #fff; padding: 5px 8px; }
        .gt-userselect { border: none; background: transparent; font-size: 12.5px; color: var(--ink); font-family: 'IBM Plex Sans', sans-serif; cursor: pointer; }
        .gt-userselect:focus { outline: none; }

        .gt-topbar-right { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; row-gap: 8px; }
        .gt-search { display: flex; align-items: center; gap: 6px; border: 1px solid var(--line); background: #fff; padding: 7px 10px; min-width: 200px; }
        .gt-search input { border: none; outline: none; font-size: 13px; width: 100%; background: transparent; color: var(--ink); font-family: 'IBM Plex Sans', sans-serif; }
        .gt-search input::placeholder { color: #9A9C92; }

        .gt-newbtn { display: flex; align-items: center; gap: 6px; background: var(--ink); color: #fff; border: none; padding: 8px 14px; font-size: 13px; font-weight: 500; cursor: pointer; }
        .gt-newbtn:hover { background: #262C36; }
        .gt-newbtn-outline { background: #fff; color: var(--ink); border: 1px solid var(--line); }
        .gt-newbtn-outline:hover { background: #F1EFE6; border-color: var(--ink); }

        .gt-stats { display: flex; gap: 0; border-bottom: 1px solid var(--line); background: var(--panel); }
        .gt-stat { padding: 10px 22px; border-right: 1px solid var(--line); }
        .gt-stat-num { font-family: 'IBM Plex Mono', monospace; font-size: 18px; font-weight: 600; }
        .gt-stat-label { font-size: 11px; color: var(--muted); }

        .gt-projets { flex: 1; overflow-y: auto; padding: 18px 24px; display: flex; flex-direction: column; gap: 10px; }
        .gt-projetcard { border: 1px solid var(--line); background: var(--panel); padding: 14px 16px; cursor: pointer; display: flex; flex-direction: column; gap: 6px; }
        .gt-projetcard:hover { border-color: var(--ink); }
        .gt-projetcard-top { display: flex; justify-content: space-between; align-items: baseline; }
        .gt-projetcard-id { font-size: 11px; color: var(--muted); }
        .gt-projetcard-client { font-size: 15px; font-weight: 600; }
        .gt-projetcard-meta { display: flex; flex-wrap: wrap; gap: 12px; font-size: 12px; color: var(--muted); }
        .gt-projetcard-prest { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 4px; }
        .gt-projetcard-prestchip { font-size: 11px; padding: 3px 8px; border: 1px solid var(--line); display: flex; align-items: center; gap: 4px; }

        .gt-listrow { width: 100%; text-align: left; background: transparent; border: none; border-bottom: 1px solid var(--line); padding: 10px 4px; display: flex; align-items: center; gap: 14px; cursor: pointer; font-family: 'IBM Plex Sans', sans-serif; color: var(--ink); }
        .gt-listrow:hover { background: var(--paper); }
        .gt-listrow-info { flex: 1; min-width: 0; }
        .gt-listrow-id { font-size: 10.5px; color: var(--muted); }
        .gt-listrow-client { font-size: 13px; font-weight: 600; }
        .gt-listrow-progress { display: flex; gap: 3px; flex-shrink: 0; }
        .gt-listrow-seg { width: 16px; height: 5px; border-radius: 2px; background: var(--line); }
        .gt-listrow-stage { font-size: 11px; color: var(--muted); width: 130px; flex-shrink: 0; }
        .gt-list-empty { color: var(--muted); font-size: 12.5px; padding: 8px 4px; }
        .gt-projet-prestations { display: flex; flex-direction: column; }

        .gt-pill { display: inline-flex; align-items: center; gap: 4px; font-size: 10.5px; padding: 3px 7px; width: fit-content; }
        .gt-pill-bad { background: #FBEBE8; color: var(--bad); }
        .gt-pill-warn { background: #FBF1E1; color: var(--amber); }

        .gt-drawer-backdrop { position: fixed; inset: 0; background: rgba(20,24,31,0.35); display: flex; justify-content: flex-end; z-index: 50; }
        .gt-drawer { width: 460px; max-width: 92vw; background: var(--panel); height: 100%; overflow-y: auto; border-left: 1px solid var(--line); }
        .gt-modal { width: 420px; max-width: 92vw; background: var(--panel); margin: auto; border: 1px solid var(--line); max-height: 90vh; overflow-y: auto; }
        .gt-drawer-head { display: flex; justify-content: space-between; align-items: flex-start; padding: 18px 20px 14px; border-bottom: 1px solid var(--line); }
        .gt-drawer-id { font-size: 11.5px; color: var(--muted); }
        .gt-drawer-client { font-size: 17px; font-weight: 600; margin-top: 2px; display: flex; align-items: center; gap: 6px; }
        .gt-drawer-client-link { background: none; border: none; padding: 0; cursor: pointer; font-family: inherit; text-align: left; text-decoration: underline; text-decoration-color: var(--line); text-underline-offset: 3px; }
        .gt-drawer-client-link:hover { text-decoration-color: var(--ink); }
        .gt-rename-btn { color: var(--muted); }
        .gt-renamebox { display: flex; align-items: center; gap: 6px; margin-top: 4px; }
        .gt-renamebox input { border: 1px solid var(--line); padding: 6px 8px; font-size: 14px; font-family: 'IBM Plex Sans', sans-serif; }
        .gt-iconbtn { background: none; border: none; cursor: pointer; color: var(--muted); padding: 2px; }
        .gt-iconbtn:hover { color: var(--ink); }

        .gt-drawer-meta { display: flex; flex-wrap: wrap; gap: 6px; padding: 14px 20px; border-bottom: 1px solid var(--line); }
        .gt-chip { display: inline-flex; align-items: center; gap: 4px; border: 1px solid var(--line); padding: 3px 8px; font-size: 11.5px; color: var(--muted); }

        .gt-drawer-pipeline { padding: 14px 20px; border-bottom: 1px solid var(--line); overflow-x: auto; }
        .gt-pipeline { display: flex; align-items: flex-start; min-width: 500px; }
        .gt-pipe-step { display: flex; flex-direction: column; align-items: center; width: 68px; flex-shrink: 0; }
        .gt-pipe-dot { width: 22px; height: 22px; border-radius: 50%; border: 1.5px solid var(--line); display: flex; align-items: center; justify-content: center; font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: var(--muted); background: #fff; }
        .gt-pipe-step.done .gt-pipe-dot { background: var(--ink); border-color: var(--ink); color: #fff; }
        .gt-pipe-step.current .gt-pipe-dot { border-color: var(--accent); border-width: 2px; color: var(--accent); font-weight: 600; }
        .gt-pipe-label { font-size: 9px; color: var(--muted); text-align: center; margin-top: 4px; line-height: 1.2; }
        .gt-pipe-step.current .gt-pipe-label { color: var(--ink); font-weight: 600; }
        .gt-pipe-line { flex: 1; height: 1.5px; background: var(--line); margin: 10px 2px 0; min-width: 6px; }
        .gt-pipe-line.done { background: var(--ink); }
        .gt-pipe-loop { display: flex; align-items: center; gap: 5px; margin-top: 10px; font-size: 11px; color: var(--bad); }

        .gt-drawer-body { padding: 4px 20px 24px; display: flex; flex-direction: column; gap: 22px; }
        .gt-section h4 { font-size: 12px; font-weight: 600; color: var(--muted); margin: 16px 0 10px; display: flex; align-items: center; gap: 6px; }
        .gt-form { display: flex; flex-direction: column; gap: 8px; }
        .gt-form label { font-size: 11.5px; color: var(--muted); margin-top: 4px; }
        .gt-form input, .gt-form select, .gt-form textarea { border: 1px solid var(--line); padding: 8px 9px; font-size: 13px; font-family: 'IBM Plex Sans', sans-serif; background: #fff; color: var(--ink); resize: vertical; }
        .gt-form input:focus, .gt-form select:focus, .gt-form textarea:focus { outline: 2px solid var(--ink); outline-offset: -1px; }
        .gt-formrow { display: flex; gap: 8px; }
        .gt-readonly { background: #F1EFE6; border: 1px solid var(--line); padding: 10px 11px; font-size: 12.5px; color: var(--muted); display: flex; flex-direction: column; gap: 4px; }
        .gt-restricted { color: var(--muted); display: flex; align-items: center; gap: 6px; }

        .gt-teamgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
        .gt-teampick { display: flex; align-items: center; gap: 6px; border: 1px solid var(--line); background: #fff; padding: 7px 8px; font-size: 11.5px; cursor: pointer; }
        .gt-teampick.active { border-color: var(--accent); background: #FCEEE7; }
        .gt-teampick input { margin: 0; }
        .gt-teampick-name { font-weight: 500; }
        .gt-teampick-role { font-size: 10px; color: var(--muted); margin-left: auto; }

        .gt-btn { display: flex; align-items: center; justify-content: center; gap: 6px; border: none; padding: 10px 14px; font-size: 13px; font-weight: 500; cursor: pointer; margin-top: 6px; font-family: 'IBM Plex Sans', sans-serif; }
        .gt-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .gt-btn-primary { background: var(--ink); color: #fff; }
        .gt-btn-primary:not(:disabled):hover { background: #262C36; }
        .gt-btn-good { background: var(--good); color: #fff; flex: 1; }
        .gt-btn-bad { background: var(--bad); color: #fff; flex: 1; }
        .gt-btn-neutral { background: #fff; color: var(--ink); border: 1px solid var(--line); }
        .gt-btn-neutral:hover { background: #F1EFE6; border-color: var(--ink); }
        .gt-btnrow { display: flex; gap: 8px; margin-top: 6px; }
        .gt-reprogbox { border: 1px solid var(--amber); background: #FBF1E1; padding: 10px; margin-top: 8px; display: flex; flex-direction: column; gap: 6px; }

        .gt-timeline { display: flex; flex-direction: column; }
        .gt-timeline-row { display: flex; gap: 10px; padding-bottom: 14px; position: relative; }
        .gt-timeline-row:not(:last-child)::before { content: ''; position: absolute; left: 3px; top: 12px; bottom: 0; width: 1px; background: var(--line); }
        .gt-timeline-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--accent); margin-top: 4px; flex-shrink: 0; }
        .gt-timeline-date { font-size: 10.5px; color: var(--muted); }
        .gt-timeline-label { font-size: 12.5px; margin-top: 1px; }
      `}</style>

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
            <input
              placeholder={view === "clients" ? "Nom ou code client..." : "Client, projet, réf. foncière..."}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
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

      {view === "projets" ? (
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
      ) : (
        <ClientsView
          clients={clients}
          projects={filteredProjets}
          query={query}
          onOpenClient={setOpenClientId}
          isOffice={isOffice}
        />
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
          onClose={() => setOpenPrestationId(null)}
          onUpdate={(id, patch) => updatePrestation(openPrestationCtx.projet.id, id, patch)}
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

      {showNewProjet && (
        <NewProjetModal
          onClose={() => { setShowNewProjet(false); setNewProjetPresetClient(null); }}
          onCreate={createProjet}
          clients={clients}
          presetClient={newProjetPresetClient}
        />
      )}

      {showNewClient && <NewClientModal onClose={() => setShowNewClient(false)} onCreate={createClient} />}
    </div>
  );
}
