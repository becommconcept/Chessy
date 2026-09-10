/**
 * Registre des blocs de contenu.
 *
 * Une page est une suite de blocs ordonnés. Chaque type déclare ici ses
 * champs : le back-office construit automatiquement le formulaire d'édition
 * correspondant, et le rendu public lit la même structure. Ajouter un bloc
 * consiste donc à décrire ses champs ici puis à écrire son composant de rendu
 * dans `src/components/blocks/`.
 */

export type FieldDef =
  | {
      type: "text" | "textarea" | "richtext" | "url" | "color" | "date";
      name: string;
      label: string;
      placeholder?: string;
      help?: string;
      required?: boolean;
      width?: "full" | "half";
    }
  | {
      type: "number";
      name: string;
      label: string;
      min?: number;
      max?: number;
      help?: string;
      width?: "full" | "half";
    }
  | { type: "boolean"; name: string; label: string; help?: string; width?: "full" | "half" }
  | {
      type: "select";
      name: string;
      label: string;
      options: Array<{ value: string; label: string }>;
      help?: string;
      width?: "full" | "half";
    }
  | { type: "media"; name: string; label: string; help?: string; width?: "full" | "half" }
  | {
      type: "repeater";
      name: string;
      label: string;
      itemLabel: string;
      fields: FieldDef[];
      max?: number;
      help?: string;
    };

export type BlockDefinition = {
  type: string;
  label: string;
  description: string;
  /** Nom d'icône `lucide-react` utilisé dans la palette du back-office. */
  icon: string;
  group: "Mise en avant" | "Texte et médias" | "Listes dynamiques" | "Interaction";
  fields: FieldDef[];
  defaultData: Record<string, unknown>;
};

const ALIGN_OPTIONS = [
  { value: "left", label: "À gauche" },
  { value: "center", label: "Centré" },
];

const COLUMN_OPTIONS = [
  { value: "2", label: "2 colonnes" },
  { value: "3", label: "3 colonnes" },
  { value: "4", label: "4 colonnes" },
];

const TONE_OPTIONS = [
  { value: "clair", label: "Fond clair" },
  { value: "sable", label: "Fond sable (pierres dorées)" },
  { value: "azur", label: "Fond azurite (foncé)" },
  { value: "blanc", label: "Fond blanc" },
];

/** Champs communs aux liens et boutons d'appel à l'action. */
const LINK_FIELDS: FieldDef[] = [
  { type: "text", name: "label", label: "Libellé", required: true, width: "half" },
  { type: "url", name: "href", label: "Lien", placeholder: "/demarches", width: "half" },
  {
    type: "text",
    name: "description",
    label: "Description courte",
    help: "Affichée sous le libellé lorsque le bloc le permet.",
  },
  {
    type: "text",
    name: "icon",
    label: "Icône",
    placeholder: "FileText",
    help: "Nom d'icône Lucide (voir la liste dans l'aide).",
    width: "half",
  },
];

export const BLOCK_DEFINITIONS: BlockDefinition[] = [
  {
    type: "hero",
    label: "Bandeau d'accueil",
    description: "Grande image ou dégradé avec titre, accroche et boutons.",
    icon: "PanelTop",
    group: "Mise en avant",
    fields: [
      { type: "text", name: "eyebrow", label: "Surtitre", width: "half" },
      { type: "text", name: "title", label: "Titre", required: true },
      { type: "textarea", name: "subtitle", label: "Accroche" },
      { type: "media", name: "image", label: "Image de fond" },
      {
        type: "select",
        name: "height",
        label: "Hauteur",
        width: "half",
        options: [
          { value: "compact", label: "Compacte" },
          { value: "moyenne", label: "Moyenne" },
          { value: "grande", label: "Grande (plein écran)" },
        ],
      },
      {
        type: "select",
        name: "align",
        label: "Alignement du texte",
        width: "half",
        options: ALIGN_OPTIONS,
      },
      { type: "boolean", name: "showSearch", label: "Afficher la barre de recherche" },
      { type: "repeater", name: "actions", label: "Boutons", itemLabel: "Bouton", fields: LINK_FIELDS, max: 3 },
    ],
    defaultData: {
      eyebrow: "",
      title: "Bienvenue à Chessy-les-Mines",
      subtitle: "",
      image: null,
      height: "moyenne",
      align: "left",
      showSearch: false,
      actions: [],
    },
  },
  {
    type: "quickLinks",
    label: "Accès rapides",
    description: "Rangée de raccourcis vers les démarches les plus demandées.",
    icon: "Zap",
    group: "Mise en avant",
    fields: [
      { type: "text", name: "title", label: "Titre" },
      { type: "text", name: "subtitle", label: "Sous-titre" },
      { type: "select", name: "columns", label: "Colonnes", width: "half", options: COLUMN_OPTIONS },
      { type: "repeater", name: "links", label: "Raccourcis", itemLabel: "Raccourci", fields: LINK_FIELDS, max: 12 },
    ],
    defaultData: { title: "Vos démarches en un clic", subtitle: "", columns: "4", links: [] },
  },
  {
    type: "richText",
    label: "Texte enrichi",
    description: "Paragraphes, titres, listes, liens et tableaux.",
    icon: "Type",
    group: "Texte et médias",
    fields: [
      { type: "text", name: "title", label: "Titre de section" },
      { type: "richtext", name: "html", label: "Contenu", required: true },
      {
        type: "select",
        name: "width",
        label: "Largeur du texte",
        width: "half",
        options: [
          { value: "lecture", label: "Colonne de lecture (recommandé)" },
          { value: "large", label: "Pleine largeur" },
        ],
      },
    ],
    defaultData: { title: "", html: "<p>Saisissez votre texte…</p>", width: "lecture" },
  },
  {
    type: "imageText",
    label: "Image et texte",
    description: "Une image à côté d'un texte, image à gauche ou à droite.",
    icon: "Columns2",
    group: "Texte et médias",
    fields: [
      { type: "text", name: "eyebrow", label: "Surtitre", width: "half" },
      { type: "text", name: "title", label: "Titre" },
      { type: "richtext", name: "html", label: "Texte" },
      { type: "media", name: "image", label: "Image" },
      {
        type: "select",
        name: "position",
        label: "Position de l'image",
        width: "half",
        options: [
          { value: "right", label: "À droite du texte" },
          { value: "left", label: "À gauche du texte" },
        ],
      },
      { type: "select", name: "tone", label: "Fond", width: "half", options: TONE_OPTIONS },
      { type: "repeater", name: "actions", label: "Boutons", itemLabel: "Bouton", fields: LINK_FIELDS, max: 2 },
    ],
    defaultData: {
      eyebrow: "",
      title: "",
      html: "<p></p>",
      image: null,
      position: "right",
      tone: "blanc",
      actions: [],
    },
  },
  {
    type: "columns",
    label: "Colonnes de texte",
    description: "Deux ou trois colonnes de texte libre côte à côte.",
    icon: "Columns3",
    group: "Texte et médias",
    fields: [
      { type: "text", name: "title", label: "Titre de section" },
      {
        type: "repeater",
        name: "items",
        label: "Colonnes",
        itemLabel: "Colonne",
        max: 4,
        fields: [
          { type: "text", name: "title", label: "Titre" },
          { type: "text", name: "icon", label: "Icône", width: "half" },
          { type: "richtext", name: "html", label: "Contenu" },
        ],
      },
    ],
    defaultData: { title: "", items: [] },
  },
  {
    type: "cardGrid",
    label: "Grille de cartes",
    description: "Cartes illustrées ou avec icône, cliquables.",
    icon: "LayoutGrid",
    group: "Mise en avant",
    fields: [
      { type: "text", name: "title", label: "Titre de section" },
      { type: "text", name: "subtitle", label: "Sous-titre" },
      { type: "select", name: "columns", label: "Colonnes", width: "half", options: COLUMN_OPTIONS },
      {
        type: "select",
        name: "variant",
        label: "Style",
        width: "half",
        options: [
          { value: "image", label: "Avec image" },
          { value: "icone", label: "Avec icône" },
          { value: "sobre", label: "Sobre (texte seul)" },
        ],
      },
      {
        type: "repeater",
        name: "cards",
        label: "Cartes",
        itemLabel: "Carte",
        fields: [
          { type: "text", name: "title", label: "Titre", required: true },
          { type: "textarea", name: "text", label: "Texte" },
          { type: "media", name: "image", label: "Image" },
          { type: "text", name: "icon", label: "Icône", width: "half" },
          { type: "url", name: "href", label: "Lien", width: "half" },
          { type: "text", name: "badge", label: "Étiquette", width: "half" },
        ],
      },
    ],
    defaultData: { title: "", subtitle: "", columns: "3", variant: "image", cards: [] },
  },
  {
    type: "stats",
    label: "Chiffres clés",
    description: "Compteurs animés pour présenter la commune en chiffres.",
    icon: "BarChart3",
    group: "Mise en avant",
    fields: [
      { type: "text", name: "title", label: "Titre" },
      { type: "text", name: "subtitle", label: "Sous-titre" },
      { type: "select", name: "tone", label: "Fond", width: "half", options: TONE_OPTIONS },
      {
        type: "repeater",
        name: "items",
        label: "Chiffres",
        itemLabel: "Chiffre",
        max: 6,
        fields: [
          { type: "number", name: "value", label: "Valeur", width: "half" },
          { type: "text", name: "suffix", label: "Suffixe", placeholder: "hab.", width: "half" },
          { type: "text", name: "label", label: "Libellé", required: true },
          { type: "text", name: "icon", label: "Icône", width: "half" },
        ],
      },
    ],
    defaultData: { title: "", subtitle: "", tone: "azur", items: [] },
  },
  {
    type: "timeline",
    label: "Frise chronologique",
    description: "Étapes ou dates clés présentées verticalement.",
    icon: "GitCommitVertical",
    group: "Texte et médias",
    fields: [
      { type: "text", name: "title", label: "Titre" },
      { type: "text", name: "subtitle", label: "Sous-titre" },
      {
        type: "repeater",
        name: "items",
        label: "Étapes",
        itemLabel: "Étape",
        fields: [
          { type: "text", name: "date", label: "Date ou période", required: true, width: "half" },
          { type: "text", name: "title", label: "Titre", required: true },
          { type: "textarea", name: "text", label: "Description" },
          { type: "media", name: "image", label: "Image" },
        ],
      },
    ],
    defaultData: { title: "", subtitle: "", items: [] },
  },
  {
    type: "steps",
    label: "Étapes numérotées",
    description: "Explique une démarche pas à pas (1, 2, 3…).",
    icon: "ListOrdered",
    group: "Texte et médias",
    fields: [
      { type: "text", name: "title", label: "Titre" },
      { type: "text", name: "subtitle", label: "Sous-titre" },
      {
        type: "repeater",
        name: "items",
        label: "Étapes",
        itemLabel: "Étape",
        fields: [
          { type: "text", name: "title", label: "Titre", required: true },
          { type: "textarea", name: "text", label: "Description" },
        ],
      },
    ],
    defaultData: { title: "", subtitle: "", items: [] },
  },
  {
    type: "gallery",
    label: "Galerie photos",
    description: "Mosaïque d'images avec agrandissement au clic.",
    icon: "Images",
    group: "Texte et médias",
    fields: [
      { type: "text", name: "title", label: "Titre" },
      { type: "text", name: "subtitle", label: "Sous-titre" },
      {
        type: "select",
        name: "layout",
        label: "Disposition",
        width: "half",
        options: [
          { value: "mosaique", label: "Mosaïque" },
          { value: "grille", label: "Grille régulière" },
          { value: "bande", label: "Bande défilante" },
        ],
      },
      {
        type: "repeater",
        name: "images",
        label: "Images",
        itemLabel: "Image",
        fields: [
          { type: "media", name: "image", label: "Fichier" },
          { type: "text", name: "caption", label: "Légende" },
        ],
      },
    ],
    defaultData: { title: "", subtitle: "", layout: "mosaique", images: [] },
  },
  {
    type: "accordion",
    label: "Questions fréquentes",
    description: "Liste de questions dépliables (accordéon accessible).",
    icon: "ChevronsUpDown",
    group: "Interaction",
    fields: [
      { type: "text", name: "title", label: "Titre" },
      { type: "text", name: "subtitle", label: "Sous-titre" },
      {
        type: "repeater",
        name: "items",
        label: "Questions",
        itemLabel: "Question",
        fields: [
          { type: "text", name: "question", label: "Question", required: true },
          { type: "richtext", name: "answer", label: "Réponse" },
        ],
      },
    ],
    defaultData: { title: "Questions fréquentes", subtitle: "", items: [] },
  },
  {
    type: "tabs",
    label: "Onglets",
    description: "Regroupe plusieurs contenus dans des onglets.",
    icon: "AppWindow",
    group: "Interaction",
    fields: [
      { type: "text", name: "title", label: "Titre" },
      {
        type: "repeater",
        name: "items",
        label: "Onglets",
        itemLabel: "Onglet",
        max: 6,
        fields: [
          { type: "text", name: "label", label: "Libellé", required: true },
          { type: "richtext", name: "html", label: "Contenu" },
        ],
      },
    ],
    defaultData: { title: "", items: [] },
  },
  {
    type: "pricingTable",
    label: "Tableau de tarifs",
    description: "Grille tarifaire lisible sur mobile.",
    icon: "Table",
    group: "Texte et médias",
    fields: [
      { type: "text", name: "title", label: "Titre" },
      { type: "text", name: "subtitle", label: "Sous-titre" },
      { type: "text", name: "colLabel", label: "Intitulé de la 1re colonne", width: "half" },
      { type: "text", name: "colValue", label: "Intitulé de la 2e colonne", width: "half" },
      {
        type: "repeater",
        name: "rows",
        label: "Lignes",
        itemLabel: "Ligne",
        fields: [
          { type: "text", name: "label", label: "Intitulé", required: true, width: "half" },
          { type: "text", name: "value", label: "Montant / valeur", width: "half" },
          { type: "text", name: "note", label: "Précision" },
        ],
      },
    ],
    defaultData: { title: "", subtitle: "", colLabel: "Prestation", colValue: "Tarif", rows: [] },
  },
  {
    type: "documents",
    label: "Liste de documents",
    description: "Affiche les documents d'une catégorie (bulletins, comptes rendus…).",
    icon: "FolderOpen",
    group: "Listes dynamiques",
    fields: [
      { type: "text", name: "title", label: "Titre" },
      { type: "text", name: "subtitle", label: "Sous-titre" },
      {
        type: "select",
        name: "category",
        label: "Catégorie",
        width: "half",
        options: [
          { value: "", label: "Toutes" },
          { value: "BULLETIN", label: "Bulletin municipal" },
          { value: "COMPTE_RENDU", label: "Comptes rendus du conseil" },
          { value: "ARRETE", label: "Arrêtés municipaux" },
          { value: "URBANISME", label: "Documents d'urbanisme" },
          { value: "BUDGET", label: "Budget et finances" },
          { value: "REGLEMENT", label: "Règlements" },
          { value: "AUTRE", label: "Autres documents" },
        ],
      },
      { type: "number", name: "limit", label: "Nombre affiché", min: 1, max: 50, width: "half" },
      { type: "boolean", name: "groupByYear", label: "Regrouper par année" },
    ],
    defaultData: { title: "Documents à télécharger", subtitle: "", category: "", limit: 12, groupByYear: true },
  },
  {
    type: "newsList",
    label: "Dernières actualités",
    description: "Reprend automatiquement les actualités publiées.",
    icon: "Newspaper",
    group: "Listes dynamiques",
    fields: [
      { type: "text", name: "title", label: "Titre" },
      { type: "text", name: "subtitle", label: "Sous-titre" },
      { type: "number", name: "limit", label: "Nombre affiché", min: 1, max: 12, width: "half" },
      {
        type: "select",
        name: "layout",
        label: "Disposition",
        width: "half",
        options: [
          { value: "vedette", label: "Une grande + liste" },
          { value: "grille", label: "Grille de cartes" },
          { value: "liste", label: "Liste compacte" },
        ],
      },
      { type: "boolean", name: "showMore", label: "Afficher le lien « Toutes les actualités »" },
    ],
    defaultData: { title: "Actualités", subtitle: "", limit: 4, layout: "vedette", showMore: true },
  },
  {
    type: "agendaList",
    label: "Prochains rendez-vous",
    description: "Reprend automatiquement les évènements à venir de l'agenda.",
    icon: "CalendarDays",
    group: "Listes dynamiques",
    fields: [
      { type: "text", name: "title", label: "Titre" },
      { type: "text", name: "subtitle", label: "Sous-titre" },
      { type: "number", name: "limit", label: "Nombre affiché", min: 1, max: 12, width: "half" },
      {
        type: "select",
        name: "layout",
        label: "Disposition",
        width: "half",
        options: [
          { value: "liste", label: "Liste avec pastille de date" },
          { value: "grille", label: "Grille de cartes" },
        ],
      },
      { type: "boolean", name: "showMore", label: "Afficher le lien « Tout l'agenda »" },
    ],
    defaultData: { title: "Agenda", subtitle: "", limit: 4, layout: "liste", showMore: true },
  },
  {
    type: "associationsList",
    label: "Annuaire des associations",
    description: "Liste filtrable des associations de la commune.",
    icon: "Users",
    group: "Listes dynamiques",
    fields: [
      { type: "text", name: "title", label: "Titre" },
      { type: "text", name: "subtitle", label: "Sous-titre" },
      {
        type: "select",
        name: "category",
        label: "Catégorie",
        width: "half",
        options: [
          { value: "", label: "Toutes" },
          { value: "SPORT", label: "Sport" },
          { value: "CULTURE", label: "Culture et musique" },
          { value: "LOISIRS", label: "Loisirs" },
          { value: "SOLIDARITE", label: "Solidarité et entraide" },
          { value: "PATRIMOINE", label: "Patrimoine et environnement" },
          { value: "JEUNESSE", label: "Enfance et jeunesse" },
          { value: "ECOLE", label: "Vie scolaire" },
        ],
      },
      { type: "number", name: "limit", label: "Nombre affiché", min: 1, max: 60, width: "half" },
      { type: "boolean", name: "withFilters", label: "Afficher les filtres par catégorie" },
    ],
    defaultData: { title: "Les associations", subtitle: "", category: "", limit: 60, withFilters: true },
  },
  {
    type: "demarchesList",
    label: "Liste de démarches",
    description: "Fiches pratiques classées par thème.",
    icon: "ClipboardList",
    group: "Listes dynamiques",
    fields: [
      { type: "text", name: "title", label: "Titre" },
      { type: "text", name: "subtitle", label: "Sous-titre" },
      {
        type: "select",
        name: "category",
        label: "Thème",
        width: "half",
        options: [
          { value: "", label: "Tous" },
          { value: "ETAT_CIVIL", label: "État civil et identité" },
          { value: "URBANISME", label: "Urbanisme et travaux" },
          { value: "ELECTIONS", label: "Élections et citoyenneté" },
          { value: "SCOLAIRE", label: "Enfance et scolarité" },
          { value: "LOGEMENT", label: "Logement et cadre de vie" },
          { value: "EAU", label: "Eau et assainissement" },
          { value: "ASSOCIATIONS", label: "Associations et manifestations" },
        ],
      },
      { type: "boolean", name: "groupByCategory", label: "Regrouper par thème" },
    ],
    defaultData: { title: "", subtitle: "", category: "", groupByCategory: true },
  },
  {
    type: "personGrid",
    label: "Trombinoscope des élus",
    description: "Présente le maire, les adjoints et les conseillers.",
    icon: "UserSquare2",
    group: "Listes dynamiques",
    fields: [
      { type: "text", name: "title", label: "Titre" },
      { type: "text", name: "subtitle", label: "Sous-titre" },
      {
        type: "select",
        name: "role",
        label: "Filtrer",
        width: "half",
        options: [
          { value: "", label: "Tous les élus" },
          { value: "MAIRE", label: "Maire" },
          { value: "ADJOINT", label: "Adjoints" },
          { value: "CONSEILLER", label: "Conseillers municipaux" },
        ],
      },
      { type: "boolean", name: "showDelegations", label: "Afficher les délégations" },
    ],
    defaultData: { title: "Le conseil municipal", subtitle: "", role: "", showDelegations: true },
  },
  {
    type: "equipementsMap",
    label: "Carte des équipements",
    description: "Plan interactif des lieux publics de la commune.",
    icon: "MapPin",
    group: "Interaction",
    fields: [
      { type: "text", name: "title", label: "Titre" },
      { type: "text", name: "subtitle", label: "Sous-titre" },
      {
        type: "select",
        name: "category",
        label: "Catégorie",
        width: "half",
        options: [
          { value: "", label: "Toutes" },
          { value: "MAIRIE", label: "Services municipaux" },
          { value: "SCOLAIRE", label: "Écoles et périscolaire" },
          { value: "SPORT", label: "Sport et plein air" },
          { value: "CULTURE", label: "Culture et salles" },
          { value: "PETITE_ENFANCE", label: "Petite enfance" },
          { value: "SANTE", label: "Santé et social" },
        ],
      },
    ],
    defaultData: { title: "Les équipements de la commune", subtitle: "", category: "" },
  },
  {
    type: "contactCard",
    label: "Coordonnées et horaires",
    description: "Adresse, téléphone, courriel et horaires d'ouverture.",
    icon: "Contact",
    group: "Interaction",
    fields: [
      { type: "text", name: "title", label: "Titre" },
      { type: "textarea", name: "intro", label: "Texte d'introduction" },
      { type: "boolean", name: "showMap", label: "Afficher le plan d'accès" },
      { type: "boolean", name: "showHours", label: "Afficher les horaires d'ouverture" },
    ],
    defaultData: { title: "Nous contacter", intro: "", showMap: true, showHours: true },
  },
  {
    type: "contactForm",
    label: "Formulaire de contact",
    description: "Formulaire relié aux demandes du back-office.",
    icon: "Mail",
    group: "Interaction",
    fields: [
      { type: "text", name: "title", label: "Titre" },
      { type: "textarea", name: "intro", label: "Texte d'introduction" },
      {
        type: "select",
        name: "requestType",
        label: "Type de demande",
        width: "half",
        options: [
          { value: "CONTACT", label: "Message à la mairie" },
          { value: "SUGGESTION", label: "Suggestion / idée" },
          { value: "RENDEZ_VOUS", label: "Demande de rendez-vous" },
        ],
      },
      { type: "text", name: "subjectPreset", label: "Objet pré-rempli", width: "half" },
    ],
    defaultData: { title: "Écrire à la mairie", intro: "", requestType: "CONTACT", subjectPreset: "" },
  },
  {
    type: "serviceTeaser",
    label: "Mise en avant d'un service en ligne",
    description: "Encart vers la réservation de salle, le prêt de matériel ou un signalement.",
    icon: "Sparkles",
    group: "Mise en avant",
    fields: [
      {
        type: "select",
        name: "service",
        label: "Service",
        width: "half",
        options: [
          { value: "salle", label: "Réserver une salle" },
          { value: "materiel", label: "Emprunter du matériel" },
          { value: "signalement", label: "Signaler un problème" },
        ],
      },
      { type: "text", name: "title", label: "Titre" },
      { type: "textarea", name: "text", label: "Texte" },
      { type: "text", name: "ctaLabel", label: "Libellé du bouton", width: "half" },
      { type: "media", name: "image", label: "Image d'illustration" },
    ],
    defaultData: { service: "salle", title: "", text: "", ctaLabel: "", image: null },
  },
  {
    type: "cta",
    label: "Appel à l'action",
    description: "Bandeau coloré avec un ou deux boutons.",
    icon: "MousePointerClick",
    group: "Mise en avant",
    fields: [
      { type: "text", name: "title", label: "Titre", required: true },
      { type: "textarea", name: "text", label: "Texte" },
      { type: "select", name: "tone", label: "Fond", width: "half", options: TONE_OPTIONS },
      { type: "repeater", name: "actions", label: "Boutons", itemLabel: "Bouton", fields: LINK_FIELDS, max: 2 },
    ],
    defaultData: { title: "", text: "", tone: "azur", actions: [] },
  },
  {
    type: "alertBox",
    label: "Encadré d'information",
    description: "Message signalé : information, vigilance ou urgence.",
    icon: "TriangleAlert",
    group: "Texte et médias",
    fields: [
      {
        type: "select",
        name: "level",
        label: "Niveau",
        width: "half",
        options: [
          { value: "INFO", label: "Information" },
          { value: "VIGILANCE", label: "Vigilance" },
          { value: "URGENCE", label: "Urgence" },
        ],
      },
      { type: "text", name: "title", label: "Titre", required: true },
      { type: "richtext", name: "html", label: "Message" },
    ],
    defaultData: { level: "INFO", title: "", html: "<p></p>" },
  },
  {
    type: "video",
    label: "Vidéo",
    description: "Intègre une vidéo hébergée (YouTube, Vimeo, Dailymotion, PeerTube).",
    icon: "Video",
    group: "Texte et médias",
    fields: [
      { type: "text", name: "title", label: "Titre" },
      { type: "url", name: "url", label: "Adresse de la vidéo", required: true },
      { type: "text", name: "caption", label: "Légende" },
      { type: "media", name: "poster", label: "Image de couverture" },
    ],
    defaultData: { title: "", url: "", caption: "", poster: null },
  },
  {
    type: "newsletter",
    label: "Inscription à la lettre d'information",
    description: "Encart d'inscription à la newsletter municipale.",
    icon: "Send",
    group: "Interaction",
    fields: [
      { type: "text", name: "title", label: "Titre" },
      { type: "textarea", name: "text", label: "Texte" },
      { type: "select", name: "tone", label: "Fond", width: "half", options: TONE_OPTIONS },
    ],
    defaultData: {
      title: "Restez informé",
      text: "Recevez chaque mois l'essentiel de la vie communale par courriel.",
      tone: "sable",
    },
  },
  {
    type: "separator",
    label: "Séparateur",
    description: "Espace vertical, avec ou sans filet.",
    icon: "Minus",
    group: "Texte et médias",
    fields: [
      {
        type: "select",
        name: "size",
        label: "Hauteur",
        width: "half",
        options: [
          { value: "s", label: "Petite" },
          { value: "m", label: "Moyenne" },
          { value: "l", label: "Grande" },
        ],
      },
      { type: "boolean", name: "rule", label: "Afficher un filet" },
    ],
    defaultData: { size: "m", rule: false },
  },
];

export const BLOCK_MAP: Record<string, BlockDefinition> = Object.fromEntries(
  BLOCK_DEFINITIONS.map((definition) => [definition.type, definition]),
);

export const BLOCK_GROUPS = [
  "Mise en avant",
  "Texte et médias",
  "Listes dynamiques",
  "Interaction",
] as const;

export function getBlockDefinition(type: string): BlockDefinition | undefined {
  return BLOCK_MAP[type];
}

/** Données par défaut d'un nouveau bloc (copie profonde). */
export function defaultBlockData(type: string): Record<string, unknown> {
  const definition = BLOCK_MAP[type];
  if (!definition) return {};
  return structuredClone(definition.defaultData) as Record<string, unknown>;
}

/** Libellé résumé d'un bloc, affiché dans la liste du back-office. */
export function blockSummary(type: string, data: Record<string, unknown>): string {
  const title = typeof data.title === "string" && data.title.trim() ? data.title.trim() : "";
  if (title) return title;
  if (typeof data.html === "string") {
    const text = data.html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (text) return text.length > 70 ? `${text.slice(0, 70)}…` : text;
  }
  return BLOCK_MAP[type]?.label ?? type;
}

/** Représentation typée d'un média sélectionné dans un champ `media`. */
export type MediaRef = {
  id?: string | null;
  url: string;
  alt?: string;
  width?: number | null;
  height?: number | null;
} | null;
