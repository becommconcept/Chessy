import { format, formatDistanceToNow, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";

/** Concatène des classes CSS conditionnelles. */
export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}

/** Transforme un texte libre en identifiant d'URL. */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[\u2018\u2019'"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

/** Formate un montant stocké en centimes. */
export function formatPrice(cents: number, options?: { free?: string }): string {
  if (cents === 0) return options?.free ?? "Gratuit";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

export function formatDate(value: Date | string, pattern = "d MMMM yyyy"): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return format(date, pattern, { locale: fr });
}

export function formatDateTime(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return format(date, "d MMMM yyyy 'à' HH'h'mm", { locale: fr });
}

export function formatShortDate(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return format(date, "dd/MM/yyyy", { locale: fr });
}

export function formatRelative(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return formatDistanceToNow(date, { locale: fr, addSuffix: true });
}

/** Rend une plage de dates de façon naturelle en français. */
export function formatDateRange(start: Date | string, end?: Date | string | null): string {
  const from = typeof start === "string" ? new Date(start) : start;
  if (!end) return formatDate(from);
  const to = typeof end === "string" ? new Date(end) : end;
  if (isSameDay(from, to)) return formatDate(from);
  if (from.getFullYear() === to.getFullYear()) {
    if (from.getMonth() === to.getMonth()) {
      return `du ${format(from, "d", { locale: fr })} au ${formatDate(to)}`;
    }
    return `du ${format(from, "d MMMM", { locale: fr })} au ${formatDate(to)}`;
  }
  return `du ${formatDate(from)} au ${formatDate(to)}`;
}

/** Plage horaire d'un évènement (« 14h00 → 18h00 »). */
export function formatTimeRange(start: Date | string, end?: Date | string | null): string {
  const from = typeof start === "string" ? new Date(start) : start;
  const startLabel = format(from, "HH'h'mm", { locale: fr });
  if (!end) return startLabel;
  const to = typeof end === "string" ? new Date(end) : end;
  return `${startLabel} → ${format(to, "HH'h'mm", { locale: fr })}`;
}

/** Date au format `yyyy-MM-dd`, utilisée par les champs de formulaire. */
export function toISODate(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Construit une date locale à midi, pour éviter les décalages de fuseau. */
export function fromISODate(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1, 12, 0, 0, 0);
}

/** Nombre de jours (bornes incluses) entre deux dates. */
export function daysBetween(start: Date, end: Date): number {
  const a = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  const b = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
  return Math.round((b - a) / 86_400_000) + 1;
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/** Deux plages de dates se recouvrent-elles ? (bornes incluses) */
export function rangesOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart <= bEnd && bStart <= aEnd;
}

/** Référence lisible communiquée à l'usager, ex. « SDF-2026-0042 ». */
export function buildReference(prefix: string, sequence: number, date = new Date()): string {
  return `${prefix}-${date.getFullYear()}-${String(sequence).padStart(4, "0")}`;
}

/** Jeton aléatoire de suivi d'une demande (URL-safe). */
export function randomToken(length = 24): string {
  const alphabet = "abcdefghijkmnopqrstuvwxyz23456789";
  const bytes = new Uint8Array(length);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

/** Coupe un texte sans casser les mots. */
export function truncate(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, clean.lastIndexOf(" ", max)).trim()}…`;
}

/** Retire le balisage d'un contenu HTML (résumés, indexation, méta). */
export function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

/** Chaîne comparable sans accent ni casse (recherche interne). */
export function normalizeForSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** Parse un JSON stocké en base sans jamais lever d'exception. */
export function safeJson<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return (parsed ?? fallback) as T;
  } catch {
    return fallback;
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

/** Numéro de téléphone français présenté par paires. */
export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 10) return value;
  return digits.replace(/(\d{2})(?=\d)/g, "$1 ").trim();
}
