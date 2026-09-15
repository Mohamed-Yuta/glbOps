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

export const seedProjets = () => [];
