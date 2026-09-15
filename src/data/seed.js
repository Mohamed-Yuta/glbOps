import { today } from "../utils/dates";

export const blankPrestation = (overrides = {}) => ({
  id: "",
  natureDemandee: "",
  natureExecutee: "",
  dateDebutDemande: "",
  dateFinDemande: "",
  agentChantier: [],
  materielIds: [],
  vehiculeId: "",
  dateDebutExec: "",
  dateFinExec: "",
  agentBureau: "",
  taches: [],
  cheminBureau: "",
  dateDebutBureau: "",
  dateFinBureau: "",
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
  attachments: [],
  history: [{ date: today(), label: "Demande reçue" }],
  ...overrides,
});

export const blankEmployee = (overrides = {}) => ({
  role: "Agent Chantier",
  poste: "",
  telephone: "",
  email: "",
  dateEmbauche: "",
  status: "actif",
  conges: [],
  notes: "",
  ...overrides,
});

export const seedEmployees = () => [
  {
    id: "EMP-001", nom: "Pierre Lefèvre",
    ...blankEmployee({
      role: "Agent Chantier", poste: "Chef d'équipe", telephone: "06 61 20 30 40", email: "p.lefevre@globetudes.ma", dateEmbauche: "03/01/2019",
    }),
  },
  {
    id: "EMP-002", nom: "Marc Lambert",
    ...blankEmployee({
      role: "Agent Bureau", poste: "Agent bureau", telephone: "06 68 27 37 47", email: "m.lambert@globetudes.ma", dateEmbauche: "12/01/2019",
    }),
  },
  {
    id: "EMP-003", nom: "Julien Faure",
    ...blankEmployee({
      role: "Agent Contrôle", poste: "Agent contrôle", telephone: "06 71 30 40 50", email: "j.faure@globetudes.ma", dateEmbauche: "16/05/2020",
    }),
  },
];

export const blankClient = (overrides = {}) => ({
  contact: "",
  telephone: "",
  email: "",
  adresse: "",
  secteur: "",
  notes: "",
  ...overrides,
});

export const seedClients = () => [
  {
    id: "CLI-0231", nom: "SOMADIR Immobilier", code: "CLI-0231",
    ...blankClient({
      contact: "Rania El Fassi", telephone: "05 37 71 20 10", email: "r.elfassi@somadir.ma",
      adresse: "12 Avenue Annakhil, Hay Riad, Rabat", secteur: "Promotion immobilière",
    }),
  },
];

export const blankResource = (overrides = {}) => ({
  type: "autre",
  marque: "",
  modele: "",
  numeroSerie: "",
  status: "operationnel",
  derniereCalibration: "",
  prochaineCalibration: "",
  emplacement: "",
  dateAchat: "",
  valeur: "",
  fournisseur: "",
  maintenanceLog: [],
  attachments: [],
  ...overrides,
});

export const seedMateriels = () => [
  {
    id: "MAT-001", nom: "Station totale",
    ...blankResource({
      type: "station_totale", marque: "Leica", modele: "TS16", numeroSerie: "LC-88213", status: "operationnel",
      derniereCalibration: "15/03/2026", prochaineCalibration: "15/03/2027",
      emplacement: "Armoire matériel — Agence Rabat", dateAchat: "12/03/2023", valeur: "285 000 MAD", fournisseur: "Leica Geosystems Maroc",
    }),
  },
];

export const seedVehicules = () => [
  {
    id: "VEH-001", nom: "4x4 — 12345-A-6",
    ...blankResource({
      type: "vehicule", marque: "Toyota", modele: "Hilux", numeroSerie: "12345-A-6", status: "operationnel",
      emplacement: "Parking — Agence Rabat", dateAchat: "03/02/2022", valeur: "320 000 MAD", fournisseur: "Toyota du Maroc",
    }),
  },
];

export const seedProjets = () => [
  {
    id: "PRJ-2026-001",
    clientId: "CLI-0231",
    referenceFonciere: "TF/45213/R",
    situation: "Hay Riad, Rabat",
    lat: 33.9716,
    lng: -6.8498,
    naturePrestationProjet: "Lotissement résidentiel",
    dateDebut: "10/08/2026",
    notes: "",
    attachments: [],
    prestations: [
      blankPrestation({
        id: "PRS-2026-01",
        natureDemandee: "Levé topographique",
        natureExecutee: "Levé topo complet, 1.2 ha",
        agentChantier: ["Pierre Lefèvre"],
        materielIds: ["MAT-001"],
        vehiculeId: "VEH-001",
        agentBureau: "Marc Lambert",
        agentControle: "Julien Faure",
        dateDebutExec: "12/08/2026 09:00",
        dateFinExec: "12/08/2026 15:30",
        ref: "LIV-0201",
        taches: [{ label: "Plan topographique", agents: ["Marc Lambert"], done: true }],
        cheminBureau: "\\\\SERVEUR\\Traitement\\PRJ-2026-001\\PRS-01",
        dateDebutBureau: "13/08/2026",
        dateFinBureau: "14/08/2026",
        dateLivraison: "20/08/2026",
        chemin: "\\\\SERVEUR\\Projets\\PRJ-2026-001\\PRS-01",
        cdN: "CD-0301",
        disqueN: "DQ-041",
        stage: "livraison",
        history: [
          { date: "10/08/2026", label: "Demande reçue", author: "Dispatcher" },
          { date: "10/08/2026", label: "Prestation définie — Levé topographique", author: "Dispatcher" },
          { date: "11/08/2026", label: "Affectation : Pierre Lefèvre — visite prévue le 12/08/2026 09:00", author: "Dispatcher" },
          { date: "12/08/2026", label: "Passage à l'exécution — visite du 12/08/2026 09:00", author: "Pierre Lefèvre" },
          { date: "12/08/2026", label: "Exécution saisie — Levé topo complet, 1.2 ha", author: "Pierre Lefèvre" },
          { date: "13/08/2026", label: "Tâches affectées — Plan topographique", author: "Dispatcher" },
          { date: "14/08/2026", label: "Traitement bureau terminé — Plan topographique", author: "Marc Lambert" },
          { date: "16/08/2026", label: "Contrôle conforme", author: "Julien Faure" },
          { date: "20/08/2026", label: "Livré — Réf LIV-0201", author: "Dispatcher" },
        ],
      }),
      blankPrestation({
        id: "PRS-2026-02",
        natureDemandee: "Bornage terrain",
        natureExecutee: "Bornage contradictoire, 2 parcelles",
        agentChantier: ["Pierre Lefèvre"],
        materielIds: ["MAT-001"],
        vehiculeId: "VEH-001",
        agentBureau: "Marc Lambert",
        agentControle: "Julien Faure",
        dateDebutExec: "18/08/2026 09:00",
        dateFinExec: "18/08/2026 16:00",
        ref: "LIV-0204",
        taches: [{ label: "Rapport de bornage", agents: ["Marc Lambert"], done: true }],
        cheminBureau: "\\\\SERVEUR\\Traitement\\PRJ-2026-001\\PRS-02",
        dateDebutBureau: "19/08/2026",
        dateFinBureau: "20/08/2026",
        stage: "controle",
        cycles: 1,
        history: [
          { date: "15/08/2026", label: "Demande reçue", author: "Dispatcher" },
          { date: "15/08/2026", label: "Prestation définie — Bornage terrain", author: "Dispatcher" },
          { date: "16/08/2026", label: "Affectation : Pierre Lefèvre — visite prévue le 18/08/2026 09:00", author: "Dispatcher" },
          { date: "18/08/2026", label: "Exécution saisie — Bornage contradictoire, 2 parcelles", author: "Pierre Lefèvre" },
          { date: "19/08/2026", label: "Tâches affectées — Rapport de bornage", author: "Dispatcher" },
          { date: "20/08/2026", label: "Traitement bureau terminé — Rapport de bornage", author: "Marc Lambert" },
          { date: "21/08/2026", label: "Non conforme — [Agent Bureau (traitement)] Bornes voisines non repérées sur le plan. Retour à Traitement bureau.", author: "Julien Faure" },
        ],
      }),
      blankPrestation({
        id: "PRS-2026-03",
        natureDemandee: "Cartographie drone",
        dateDebutDemande: "05/09/2026",
        agentChantier: ["Pierre Lefèvre"],
        vehiculeId: "VEH-001",
        agentBureau: "Marc Lambert",
        agentControle: "Julien Faure",
        dateDebutExec: "16/09/2026 09:00",
        stage: "affectation",
        history: [
          { date: "05/09/2026", label: "Demande reçue", author: "Dispatcher" },
          { date: "06/09/2026", label: "Prestation définie — Cartographie drone", author: "Dispatcher" },
          { date: "07/09/2026", label: "Affectation : Pierre Lefèvre — visite prévue le 16/09/2026 09:00", author: "Dispatcher" },
        ],
      }),
    ],
  },
  {
    id: "PRJ-2026-002",
    clientId: "CLI-0231",
    referenceFonciere: "TF/60123/S",
    situation: "Hay Salam, Salé",
    lat: 34.0531,
    lng: -6.7985,
    naturePrestationProjet: "Lotissement social",
    dateDebut: "01/09/2026",
    notes: "",
    attachments: [],
    prestations: [
      blankPrestation({
        id: "PRS-2026-04",
        natureDemandee: "Levé topographique",
        dateDebutDemande: "02/09/2026",
        stage: "demande",
        history: [{ date: "01/09/2026", label: "Demande reçue", author: "Dispatcher" }],
      }),
    ],
  },
];
