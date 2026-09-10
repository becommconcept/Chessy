/**
 * Réglages du site.
 *
 * Chaque groupe est stocké en base dans une ligne `SiteSetting` (valeur JSON)
 * et éditable depuis « Paramètres » dans le back-office. Les valeurs par
 * défaut ci-dessous servent de repli : le site fonctionne même sur une base
 * vierge, et l'ajout d'un nouveau réglage n'oblige pas à migrer les données.
 */
import { prisma } from "@/lib/db";
import { safeJson } from "@/lib/utils";

export type OpeningSlot = { day: string; ranges: string[]; closed?: boolean };

export type SiteSettings = {
  identity: {
    name: string;
    shortName: string;
    tagline: string;
    inhabitantsLabel: string;
    department: string;
    region: string;
    intercommunality: string;
    intercommunalityUrl: string;
    insee: string;
    population: number;
    area: string;
    altitude: string;
    mayor: string;
  };
  contact: {
    venue: string;
    address: string;
    postalCode: string;
    city: string;
    phone: string;
    fax: string;
    email: string;
    technicalEmail: string;
    waterEmail: string;
    lat: number;
    lng: number;
    emergencyNote: string;
  };
  hours: {
    intro: string;
    slots: OpeningSlot[];
    note: string;
    phoneNote: string;
  };
  social: {
    facebook: string;
    instagram: string;
    youtube: string;
    linkedin: string;
    panneauPocket: string;
    intramuros: string;
  };
  footer: {
    about: string;
    partners: Array<{ label: string; href: string }>;
    legalLinks: Array<{ label: string; href: string }>;
  };
  theme: {
    primary: string;
    accent: string;
    dark: string;
    radius: "sobre" | "arrondi" | "doux";
    heroPattern: "mine" | "vigne" | "pierre" | "aucun";
  };
  services: {
    roomBooking: boolean;
    equipmentLoan: boolean;
    reporting: boolean;
    newsletter: boolean;
    appointment: boolean;
  };
  seo: {
    titleSuffix: string;
    description: string;
    keywords: string;
  };
};

export const DEFAULT_SETTINGS: SiteSettings = {
  identity: {
    name: "Chessy-les-Mines",
    shortName: "Chessy",
    tagline: "Village du Beaujolais des Pierres Dorées, berceau de l'azurite",
    inhabitantsLabel: "Cassissiennes et Cassissiens",
    department: "Rhône (69)",
    region: "Auvergne-Rhône-Alpes",
    intercommunality: "Communauté de communes Beaujolais Pierres Dorées",
    intercommunalityUrl: "https://www.cc-pierresdorees.com",
    insee: "69056",
    population: 2080,
    area: "6,4 km²",
    altitude: "de 240 à 420 m",
    mayor: "Thierry Padilla-Quintana",
  },
  contact: {
    venue: "Mairie de Chessy-les-Mines",
    address: "Place de la Mairie",
    postalCode: "69380",
    city: "Chessy-les-Mines",
    phone: "04 78 43 92 03",
    fax: "",
    email: "accueil@chessy69.fr",
    technicalEmail: "services.techniques@chessy69.fr",
    waterEmail: "service.eau@chessy69.fr",
    lat: 45.8836,
    lng: 4.6208,
    emergencyNote:
      "En cas d'urgence en dehors des heures d'ouverture, composez le 112 (secours), le 17 (police) ou le 18 (pompiers).",
  },
  hours: {
    intro: "L'accueil de la mairie vous reçoit sans rendez-vous aux horaires suivants :",
    slots: [
      { day: "Lundi", ranges: ["14h30 – 18h30"] },
      { day: "Mardi", ranges: ["14h30 – 18h30"] },
      { day: "Mercredi", ranges: ["09h00 – 12h00"] },
      { day: "Jeudi", ranges: ["14h30 – 18h30"] },
      { day: "Vendredi", ranges: ["14h30 – 18h30"] },
      { day: "Samedi", ranges: [], closed: true },
      { day: "Dimanche", ranges: [], closed: true },
    ],
    note: "Les demandes de carte d'identité et de passeport se font uniquement sur rendez-vous, en mairie de L'Arbresle ou du Bois-d'Oingt.",
    phoneNote: "Accueil téléphonique aux mêmes horaires.",
  },
  social: {
    facebook: "",
    instagram: "",
    youtube: "",
    linkedin: "",
    panneauPocket: "https://app.panneaupocket.com/ville/779546136-chessy-les-mines-69380",
    intramuros: "",
  },
  footer: {
    about:
      "Chessy-les-Mines, 2 080 habitants au cœur du Beaujolais des Pierres Dorées. Une commune où l'histoire minière, le patrimoine et la vie associative façonnent le quotidien.",
    partners: [
      { label: "Communauté de communes Beaujolais Pierres Dorées", href: "https://www.cc-pierresdorees.com" },
      { label: "Département du Rhône", href: "https://www.rhone.fr" },
      { label: "Région Auvergne-Rhône-Alpes", href: "https://www.auvergnerhonealpes.fr" },
      { label: "Service-Public.fr", href: "https://www.service-public.fr" },
      { label: "Geopark Beaujolais", href: "https://www.geopark-beaujolais.com" },
    ],
    legalLinks: [
      { label: "Mentions légales", href: "/mentions-legales" },
      { label: "Accessibilité", href: "/accessibilite" },
      { label: "Données personnelles", href: "/donnees-personnelles" },
      { label: "Plan du site", href: "/plan-du-site" },
      { label: "Contact", href: "/contact" },
    ],
  },
  theme: {
    primary: "#14507F",
    accent: "#C68A2E",
    dark: "#0B2E4F",
    radius: "doux",
    heroPattern: "mine",
  },
  services: {
    roomBooking: true,
    equipmentLoan: true,
    reporting: true,
    newsletter: true,
    appointment: true,
  },
  seo: {
    titleSuffix: "Mairie de Chessy-les-Mines",
    description:
      "Site officiel de la commune de Chessy-les-Mines (69380) : démarches en ligne, actualités, agenda, réservation de la salle des fêtes, prêt de matériel et vie associative.",
    keywords:
      "Chessy-les-Mines, mairie, 69380, Beaujolais, Pierres Dorées, azurite, chessylite, démarches, salle des fêtes",
  },
};

export type SettingsGroup = keyof SiteSettings;

export const SETTINGS_GROUP_LABELS: Record<SettingsGroup, string> = {
  identity: "Identité de la commune",
  contact: "Coordonnées",
  hours: "Horaires d'ouverture",
  social: "Réseaux sociaux et applications",
  footer: "Pied de page",
  theme: "Apparence",
  services: "Services en ligne",
  seo: "Référencement",
};

/** Fusion superficielle groupe par groupe des valeurs stockées. */
export async function getSettings(): Promise<SiteSettings> {
  let rows: Array<{ key: string; value: string }> = [];
  try {
    rows = await prisma.siteSetting.findMany({ select: { key: true, value: true } });
  } catch {
    // Base non initialisée : on sert les valeurs par défaut.
    return DEFAULT_SETTINGS;
  }

  const stored = new Map(rows.map((row) => [row.key, row.value]));
  const merged = {} as SiteSettings;

  for (const group of Object.keys(DEFAULT_SETTINGS) as SettingsGroup[]) {
    const fallback = DEFAULT_SETTINGS[group];
    const value = safeJson<Record<string, unknown>>(stored.get(group), {});
    // @ts-expect-error — fusion générique groupe par groupe
    merged[group] = { ...fallback, ...value };
  }

  return merged;
}

export async function saveSettingsGroup(
  group: SettingsGroup,
  value: Record<string, unknown>,
): Promise<void> {
  await prisma.siteSetting.upsert({
    where: { key: group },
    create: {
      key: group,
      value: JSON.stringify(value),
      group,
      label: SETTINGS_GROUP_LABELS[group],
    },
    update: { value: JSON.stringify(value) },
  });
}

/** Adresse postale sur une ligne. */
export function formatFullAddress(settings: SiteSettings): string {
  const { address, postalCode, city } = settings.contact;
  return `${address}, ${postalCode} ${city}`;
}

/** L'accueil de la mairie est-il ouvert à l'instant présent ? */
export function isOpenNow(settings: SiteSettings, now = new Date()): {
  open: boolean;
  label: string;
  nextLabel?: string;
} {
  const dayIndex = (now.getDay() + 6) % 7; // 0 = lundi
  const slots = settings.hours.slots;
  const today = slots[dayIndex];
  const minutes = now.getHours() * 60 + now.getMinutes();

  const parse = (range: string): [number, number] | null => {
    const match = range.match(/(\d{1,2})\s*h\s*(\d{2})?\s*[–\-—]\s*(\d{1,2})\s*h\s*(\d{2})?/i);
    if (!match) return null;
    const start = Number(match[1]) * 60 + Number(match[2] ?? 0);
    const end = Number(match[3]) * 60 + Number(match[4] ?? 0);
    return [start, end];
  };

  if (today && !today.closed) {
    for (const range of today.ranges) {
      const parsed = parse(range);
      if (parsed && minutes >= parsed[0] && minutes < parsed[1]) {
        return { open: true, label: `Ouvert jusqu'à ${range.split(/[–\-—]/)[1]?.trim() ?? ""}` };
      }
    }
  }

  // Recherche du prochain créneau dans les sept jours suivants.
  for (let offset = 0; offset < 8; offset += 1) {
    const index = (dayIndex + offset) % 7;
    const slot = slots[index];
    if (!slot || slot.closed || slot.ranges.length === 0) continue;
    const parsed = parse(slot.ranges[0]);
    if (!parsed) continue;
    if (offset === 0 && minutes >= parsed[0]) continue;
    const when = offset === 0 ? "aujourd'hui" : offset === 1 ? "demain" : slot.day.toLowerCase();
    return {
      open: false,
      label: "Fermé actuellement",
      nextLabel: `Réouverture ${when} à ${slot.ranges[0].split(/[–\-—]/)[0]?.trim()}`,
    };
  }

  return { open: false, label: "Fermé actuellement" };
}
