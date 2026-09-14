export const STAGES = [
  { key: "demande", label: "Demande" },
  { key: "prestation", label: "Prestation demandée" },
  { key: "affectation", label: "Affectation terrain" },
  { key: "execution", label: "Exécution" },
  { key: "bureau", label: "Traitement bureau" },
  { key: "controle", label: "Contrôle" },
  { key: "livraison", label: "Livraison" },
];

export const STAGE_COLORS = {
  demande: "var(--muted)",
  prestation: "var(--blue)",
  affectation: "var(--accent)",
  execution: "var(--amber)",
  bureau: "var(--teal)",
  controle: "var(--violet)",
  livraison: "var(--good)",
};

export const NATURES = [
  "Levé topographique",
  "Bornage terrain",
  "Relevé LiDAR",
  "Cartographie drone",
  "Implantation VRD",
  "Auscultation structure",
];

export const AGENTS_CHANTIER = [
  { name: "K. Momayiz", role: "Chef d'équipe" },
  { name: "A. Oubrik", role: "Topographe" },
  { name: "Y. Chraibi", role: "Topographe" },
  { name: "N. Aziz", role: "Pilote drone" },
  { name: "S. Rami", role: "Topographe" },
  { name: "M. Fahmi", role: "Chef d'équipe" },
  { name: "L. Idrissi", role: "Géomètre" },
];

export const AGENTS_BUREAU = ["H. Belkadi", "N. Sabir", "K. Amrani"];
export const AGENTS_CONTROLE = ["M. Bensouda", "A. Lahlou"];
export const ROLES = ["Dispatcher", "Directrice", "Agent Chantier", "Agent Bureau", "Agent Contrôle"];

export const STATUS_COLORS = {
  vide: "#9A9C92",
  nonconforme: "#B23A2E",
  encours: "#C98A2C",
  livre: "#3F7855",
};

export const STATUS_LABELS = {
  vide: "Sans prestation",
  nonconforme: "Non-conformité",
  encours: "En cours",
  livre: "Livré",
};

export const WEEKDAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export const RESOURCE_STATUSES = [
  { key: "operationnel", label: "Opérationnel", color: "#3F7855" },
  { key: "maintenance", label: "En maintenance", color: "#C98A2C" },
  { key: "hors_service", label: "Hors service", color: "#B23A2E" },
];
