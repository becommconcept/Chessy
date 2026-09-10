/**
 * Énumérations applicatives.
 *
 * Elles sont stockées en texte en base (portabilité SQLite ↔ PostgreSQL) et
 * validées ici, ce qui permet aussi d'exposer partout les libellés français
 * affichés à l'écran.
 */

export const ROLES = ["ADMIN", "EDITEUR", "AGENT"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrateur",
  EDITEUR: "Éditeur",
  AGENT: "Agent d'accueil",
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  ADMIN: "Accès complet : contenus, services, paramètres et comptes.",
  EDITEUR: "Rédige et publie les contenus (pages, actualités, agenda, médias).",
  AGENT: "Traite les demandes des habitants, les réservations et les prêts.",
};

export const PUBLICATION_STATUSES = ["BROUILLON", "PUBLIEE"] as const;
export type PublicationStatus = (typeof PUBLICATION_STATUSES)[number];

export const PUBLICATION_LABELS: Record<PublicationStatus, string> = {
  BROUILLON: "Brouillon",
  PUBLIEE: "Publiée",
};

export const PAGE_TEMPLATES = ["STANDARD", "LARGE", "ACCUEIL"] as const;
export type PageTemplate = (typeof PAGE_TEMPLATES)[number];

export const PAGE_TEMPLATE_LABELS: Record<PageTemplate, string> = {
  STANDARD: "Standard (avec sommaire latéral)",
  LARGE: "Pleine largeur",
  ACCUEIL: "Page d'accueil",
};

/* --------------------------------- Salles -------------------------------- */

export const AUDIENCES = [
  "ASSO_LOCALE",
  "HABITANT",
  "ASSO_EXTERIEURE",
  "ENTREPRISE",
  "COMMUNE",
] as const;
export type Audience = (typeof AUDIENCES)[number];

export const AUDIENCE_LABELS: Record<Audience, string> = {
  ASSO_LOCALE: "Association de Chessy",
  HABITANT: "Habitant de Chessy",
  ASSO_EXTERIEURE: "Association extérieure",
  ENTREPRISE: "Entreprise / professionnel",
  COMMUNE: "Service municipal",
};

export const AUDIENCE_HINTS: Record<Audience, string> = {
  ASSO_LOCALE: "Association à but non lucratif dont le siège est à Chessy.",
  HABITANT: "Particulier domicilié sur la commune (justificatif demandé).",
  ASSO_EXTERIEURE: "Association dont le siège est hors de la commune.",
  ENTREPRISE: "Société, profession libérale, organisme à but lucratif.",
  COMMUNE: "Réservation interne, à valider par le secrétariat général.",
};

export const BOOKING_STATUSES = [
  "EN_ATTENTE",
  "PREVALIDEE",
  "CONFIRMEE",
  "REFUSEE",
  "ANNULEE",
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  EN_ATTENTE: "En attente d'instruction",
  PREVALIDEE: "Pré-réservée (option)",
  CONFIRMEE: "Confirmée",
  REFUSEE: "Refusée",
  ANNULEE: "Annulée",
};

/** Statuts qui occupent effectivement le créneau dans le calendrier. */
export const BOOKING_BLOCKING_STATUSES: BookingStatus[] = [
  "EN_ATTENTE",
  "PREVALIDEE",
  "CONFIRMEE",
];

/* ------------------------------- Matériel -------------------------------- */

export const LOAN_STATUSES = [
  "EN_ATTENTE",
  "CONFIRMEE",
  "SORTIE",
  "RETOURNEE",
  "REFUSEE",
  "ANNULEE",
] as const;
export type LoanStatus = (typeof LOAN_STATUSES)[number];

export const LOAN_STATUS_LABELS: Record<LoanStatus, string> = {
  EN_ATTENTE: "En attente d'instruction",
  CONFIRMEE: "Accordé",
  SORTIE: "Matériel retiré",
  RETOURNEE: "Matériel restitué",
  REFUSEE: "Refusé",
  ANNULEE: "Annulé",
};

export const LOAN_BLOCKING_STATUSES: LoanStatus[] = [
  "EN_ATTENTE",
  "CONFIRMEE",
  "SORTIE",
];

export const EQUIPMENT_CATEGORIES = [
  "MOBILIER",
  "RECEPTION",
  "TECHNIQUE",
  "SIGNALISATION",
  "JEUX",
  "LOGISTIQUE",
] as const;
export type EquipmentCategory = (typeof EQUIPMENT_CATEGORIES)[number];

export const EQUIPMENT_CATEGORY_LABELS: Record<EquipmentCategory, string> = {
  MOBILIER: "Mobilier",
  RECEPTION: "Réception et vaisselle",
  TECHNIQUE: "Sonorisation et technique",
  SIGNALISATION: "Signalisation et sécurité",
  JEUX: "Jeux et animation",
  LOGISTIQUE: "Logistique et rangement",
};

/* -------------------------------- Demandes ------------------------------- */

export const REQUEST_TYPES = [
  "CONTACT",
  "SIGNALEMENT",
  "SUGGESTION",
  "RENDEZ_VOUS",
] as const;
export type RequestType = (typeof REQUEST_TYPES)[number];

export const REQUEST_TYPE_LABELS: Record<RequestType, string> = {
  CONTACT: "Message à la mairie",
  SIGNALEMENT: "Signalement dans l'espace public",
  SUGGESTION: "Suggestion / idée",
  RENDEZ_VOUS: "Demande de rendez-vous",
};

export const REQUEST_STATUSES = ["NOUVEAU", "EN_COURS", "TRAITE", "CLOS"] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  NOUVEAU: "Nouveau",
  EN_COURS: "En cours de traitement",
  TRAITE: "Traité",
  CLOS: "Clos",
};

export const SIGNALEMENT_CATEGORIES = [
  "VOIRIE",
  "ECLAIRAGE",
  "PROPRETE",
  "ESPACES_VERTS",
  "EAU",
  "BATIMENT",
  "ANIMAUX",
  "AUTRE",
] as const;
export type SignalementCategory = (typeof SIGNALEMENT_CATEGORIES)[number];

export const SIGNALEMENT_CATEGORY_LABELS: Record<SignalementCategory, string> = {
  VOIRIE: "Voirie, trottoir, nid-de-poule",
  ECLAIRAGE: "Éclairage public",
  PROPRETE: "Propreté, dépôt sauvage",
  ESPACES_VERTS: "Espaces verts, arbres",
  EAU: "Eau, assainissement, fuite",
  BATIMENT: "Bâtiment communal",
  ANIMAUX: "Animaux errants, nuisibles",
  AUTRE: "Autre",
};

export const PRIORITIES = ["BASSE", "NORMALE", "HAUTE"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const PRIORITY_LABELS: Record<Priority, string> = {
  BASSE: "Basse",
  NORMALE: "Normale",
  HAUTE: "Haute",
};

/* -------------------------------- Annuaires ------------------------------ */

export const ASSOCIATION_CATEGORIES = [
  "SPORT",
  "CULTURE",
  "LOISIRS",
  "SOLIDARITE",
  "PATRIMOINE",
  "JEUNESSE",
  "ECOLE",
  "AUTRE",
] as const;
export type AssociationCategory = (typeof ASSOCIATION_CATEGORIES)[number];

export const ASSOCIATION_CATEGORY_LABELS: Record<AssociationCategory, string> = {
  SPORT: "Sport",
  CULTURE: "Culture et musique",
  LOISIRS: "Loisirs",
  SOLIDARITE: "Solidarité et entraide",
  PATRIMOINE: "Patrimoine et environnement",
  JEUNESSE: "Enfance et jeunesse",
  ECOLE: "Vie scolaire",
  AUTRE: "Autre",
};

export const ELU_ROLES = [
  "MAIRE",
  "ADJOINT",
  "CONSEILLER_DELEGUE",
  "CONSEILLER",
] as const;
export type EluRole = (typeof ELU_ROLES)[number];

export const ELU_ROLE_LABELS: Record<EluRole, string> = {
  MAIRE: "Maire",
  ADJOINT: "Adjoint au maire",
  CONSEILLER_DELEGUE: "Conseiller délégué",
  CONSEILLER: "Conseiller municipal",
};

export const EQUIPEMENT_CATEGORIES = [
  "MAIRIE",
  "SCOLAIRE",
  "SPORT",
  "CULTURE",
  "PETITE_ENFANCE",
  "SANTE",
  "TECHNIQUE",
  "LOISIRS",
] as const;
export type EquipementCategory = (typeof EQUIPEMENT_CATEGORIES)[number];

export const EQUIPEMENT_CATEGORY_LABELS: Record<EquipementCategory, string> = {
  MAIRIE: "Services municipaux",
  SCOLAIRE: "Écoles et périscolaire",
  SPORT: "Sport et plein air",
  CULTURE: "Culture et salles",
  PETITE_ENFANCE: "Petite enfance",
  SANTE: "Santé et social",
  TECHNIQUE: "Services techniques",
  LOISIRS: "Loisirs et détente",
};

export const DEMARCHE_CATEGORIES = [
  "ETAT_CIVIL",
  "URBANISME",
  "ELECTIONS",
  "SCOLAIRE",
  "LOGEMENT",
  "EAU",
  "ASSOCIATIONS",
  "AUTRE",
] as const;
export type DemarcheCategory = (typeof DEMARCHE_CATEGORIES)[number];

export const DEMARCHE_CATEGORY_LABELS: Record<DemarcheCategory, string> = {
  ETAT_CIVIL: "État civil et identité",
  URBANISME: "Urbanisme et travaux",
  ELECTIONS: "Élections et citoyenneté",
  SCOLAIRE: "Enfance et scolarité",
  LOGEMENT: "Logement et cadre de vie",
  EAU: "Eau et assainissement",
  ASSOCIATIONS: "Associations et manifestations",
  AUTRE: "Autres démarches",
};

export const DOCUMENT_CATEGORIES = [
  "BULLETIN",
  "COMPTE_RENDU",
  "ARRETE",
  "URBANISME",
  "BUDGET",
  "REGLEMENT",
  "AUTRE",
] as const;
export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number];

export const DOCUMENT_CATEGORY_LABELS: Record<DocumentCategory, string> = {
  BULLETIN: "Bulletin municipal",
  COMPTE_RENDU: "Comptes rendus du conseil",
  ARRETE: "Arrêtés municipaux",
  URBANISME: "Documents d'urbanisme",
  BUDGET: "Budget et finances",
  REGLEMENT: "Règlements",
  AUTRE: "Autres documents",
};

export const EVENT_CATEGORIES = [
  "CULTURE",
  "SPORT",
  "MUNICIPAL",
  "FESTIF",
  "ASSOCIATIF",
  "MARCHE",
] as const;
export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export const EVENT_CATEGORY_LABELS: Record<EventCategory, string> = {
  CULTURE: "Culture",
  SPORT: "Sport",
  MUNICIPAL: "Vie municipale",
  FESTIF: "Fête et convivialité",
  ASSOCIATIF: "Vie associative",
  MARCHE: "Marché et commerce",
};

export const ALERT_LEVELS = ["INFO", "VIGILANCE", "URGENCE"] as const;
export type AlertLevel = (typeof ALERT_LEVELS)[number];

export const ALERT_LEVEL_LABELS: Record<AlertLevel, string> = {
  INFO: "Information",
  VIGILANCE: "Vigilance",
  URGENCE: "Urgence",
};

/** Renvoie le libellé d'une valeur d'énumération, avec repli sûr. */
export function labelOf<T extends string>(
  dict: Record<string, string>,
  value: T | null | undefined,
  fallback = "—",
): string {
  if (!value) return fallback;
  return dict[value] ?? value;
}
