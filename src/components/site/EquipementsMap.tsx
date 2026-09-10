"use client";

import { useMemo, useState } from "react";

import { Icon } from "@/components/ui/Icon";
import { Badge, Card } from "@/components/ui/layout";
import { Visual } from "@/components/ui/Visual";
import { EQUIPEMENT_CATEGORY_LABELS, labelOf } from "@/lib/enums";
import { cn } from "@/lib/utils";

export type EquipementData = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  phone: string | null;
  email: string | null;
  hours: string | null;
  accessible: boolean;
  image: { url: string; alt: string } | null;
};

const CATEGORY_COLORS: Record<string, string> = {
  MAIRIE: "#14507f",
  SCOLAIRE: "#1e7a5f",
  SPORT: "#c68a2e",
  CULTURE: "#8a4fa0",
  PETITE_ENFANCE: "#2a7bb8",
  SANTE: "#b4562a",
  TECHNIQUE: "#5c5852",
  LOISIRS: "#2f8f7a",
};

const CATEGORY_ICONS: Record<string, string> = {
  MAIRIE: "Landmark",
  SCOLAIRE: "GraduationCap",
  SPORT: "Trophy",
  CULTURE: "BookOpen",
  PETITE_ENFANCE: "Baby",
  SANTE: "Stethoscope",
  TECHNIQUE: "Wrench",
  LOISIRS: "Trees",
};

/**
 * Plan schématique des équipements communaux.
 *
 * Aucun fond de carte tiers n'est chargé : le plan est dessiné à partir des
 * coordonnées enregistrées pour chaque équipement, ce qui évite tout dépôt de
 * traceur chez un fournisseur externe (exigence RGPD fréquente en collectivité)
 * et garantit l'affichage même hors ligne. Chaque fiche renvoie vers
 * OpenStreetMap pour l'itinéraire détaillé.
 */
export function EquipementsMap({ equipements }: { equipements: EquipementData[] }) {
  const categories = useMemo(
    () => [...new Set(equipements.map((equipement) => equipement.category))],
    [equipements],
  );
  const [filter, setFilter] = useState<string>("");
  const [selected, setSelected] = useState<string | null>(null);

  const visible = filter
    ? equipements.filter((equipement) => equipement.category === filter)
    : equipements;

  /* Cadre géographique calculé sur l'ensemble des points, avec une marge. */
  const bounds = useMemo(() => {
    const points = equipements.filter((item) => item.lat != null && item.lng != null);
    if (points.length === 0) return null;
    const lats = points.map((item) => item.lat!);
    const lngs = points.map((item) => item.lng!);
    const padLat = Math.max((Math.max(...lats) - Math.min(...lats)) * 0.25, 0.0012);
    const padLng = Math.max((Math.max(...lngs) - Math.min(...lngs)) * 0.25, 0.0018);
    return {
      minLat: Math.min(...lats) - padLat,
      maxLat: Math.max(...lats) + padLat,
      minLng: Math.min(...lngs) - padLng,
      maxLng: Math.max(...lngs) + padLng,
    };
  }, [equipements]);

  const project = (lat: number, lng: number) => {
    if (!bounds) return { x: 50, y: 50 };
    return {
      x: ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100,
      // L'axe des ordonnées est inversé : le nord est en haut.
      y: (1 - (lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * 100,
    };
  };

  const active = selected ? equipements.find((item) => item.id === selected) ?? null : null;

  return (
    <div>
      {/* Filtres par catégorie */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter("")}
          aria-pressed={filter === ""}
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors",
            filter === ""
              ? "border-azur-600 bg-azur-600 text-white"
              : "border-[color:var(--bordure)] hover:bg-[color:var(--surface-alt)]",
          )}
        >
          Tous ({equipements.length})
        </button>
        {categories.map((category) => {
          const count = equipements.filter((item) => item.category === category).length;
          const isActive = filter === category;
          return (
            <button
              key={category}
              type="button"
              onClick={() => setFilter(isActive ? "" : category)}
              aria-pressed={isActive}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors",
                isActive
                  ? "border-transparent text-white"
                  : "border-[color:var(--bordure)] hover:bg-[color:var(--surface-alt)]",
              )}
              style={isActive ? { backgroundColor: CATEGORY_COLORS[category] ?? "#14507f" } : undefined}
            >
              <Icon name={CATEGORY_ICONS[category]} className="size-3.5" />
              {labelOf(EQUIPEMENT_CATEGORY_LABELS, category)} ({count})
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Plan */}
        <div className="lg:col-span-3">
          <Card className="overflow-hidden">
            <div className="relative aspect-4/3 bg-linear-160 from-malachite-50 to-dore-50 dark:from-azur-950 dark:to-azur-900">
              {/* Trame de repérage */}
              <svg aria-hidden className="absolute inset-0 h-full w-full" viewBox="0 0 100 75">
                <defs>
                  <pattern id="trame-plan" width="8" height="8" patternUnits="userSpaceOnUse">
                    <path d="M8 0H0v8" fill="none" stroke="currentColor" strokeWidth="0.15" />
                  </pattern>
                </defs>
                <rect width="100" height="75" fill="url(#trame-plan)" className="text-azur-500/25" />
                {/* Voies schématiques reliant les points extrêmes */}
                <path
                  d="M6 62 Q34 46 52 40 T96 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  className="text-dore-400/50"
                />
                <path
                  d="M14 8 Q30 34 46 44 T88 68"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  className="text-azur-400/40"
                />
              </svg>

              {/* Rose des vents */}
              <div
                aria-hidden
                className="absolute top-3 right-3 flex size-9 items-center justify-center rounded-full bg-[color:var(--surface)]/85 text-xs font-bold text-azur-700 shadow-douce dark:text-azur-200"
              >
                N
                <Icon name="ArrowUp" className="absolute -top-0.5 size-3" />
              </div>

              {/* Marqueurs */}
              {visible
                .filter((item) => item.lat != null && item.lng != null)
                .map((item) => {
                  const { x, y } = project(item.lat!, item.lng!);
                  const isSelected = selected === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelected(isSelected ? null : item.id)}
                      aria-pressed={isSelected}
                      style={{ left: `${x}%`, top: `${y}%` }}
                      className={cn(
                        "group absolute -translate-x-1/2 -translate-y-full transition-transform duration-300 ease-douce",
                        isSelected ? "z-20 scale-115" : "z-10 hover:scale-110",
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-8 items-center justify-center rounded-full text-white shadow-relief ring-2 ring-white",
                          isSelected && "ring-4",
                        )}
                        style={{ backgroundColor: CATEGORY_COLORS[item.category] ?? "#14507f" }}
                      >
                        <Icon name={CATEGORY_ICONS[item.category]} className="size-4" />
                      </span>
                      <span
                        aria-hidden
                        className="mx-auto -mt-0.5 block size-2 rotate-45 bg-white"
                        style={{ backgroundColor: CATEGORY_COLORS[item.category] ?? "#14507f" }}
                      />
                      <span
                        className={cn(
                          "pointer-events-none absolute top-full left-1/2 mt-1 w-max max-w-40 -translate-x-1/2 rounded bg-azur-900 px-2 py-1 text-[0.6875rem] font-semibold text-white transition-opacity",
                          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                        )}
                      >
                        {item.name}
                      </span>
                    </button>
                  );
                })}
            </div>
            <p className="border-t border-[color:var(--bordure)] bg-[color:var(--surface-alt)] px-4 py-2.5 text-xs text-[color:var(--texte-doux)]">
              Plan schématique — cliquez sur un repère pour afficher la fiche de l'équipement. Aucun
              fond de carte extérieur n'est chargé sur cette page.
            </p>
          </Card>

          {active ? (
            <Card className="animate-glisse-haut mt-4 overflow-hidden">
              <div className="flex flex-col gap-4 sm:flex-row">
                <Visual
                  source={active.image}
                  ratio="4/3"
                  className="sm:w-52 sm:shrink-0"
                  sizes="220px"
                />
                <div className="min-w-0 flex-1 p-4 sm:py-4 sm:pr-5 sm:pl-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge tone="azur">{labelOf(EQUIPEMENT_CATEGORY_LABELS, active.category)}</Badge>
                    {active.accessible ? (
                      <Badge tone="succes" icon="Accessibility">
                        Accessible PMR
                      </Badge>
                    ) : null}
                  </div>
                  <h3 className="font-display text-lg font-bold text-azur-800 dark:text-white">
                    {active.name}
                  </h3>
                  {active.description ? (
                    <p className="mt-1.5 text-sm leading-relaxed text-[color:var(--texte-doux)]">
                      {active.description}
                    </p>
                  ) : null}
                  <dl className="mt-3 space-y-1.5 text-sm">
                    {active.address ? (
                      <div className="flex items-start gap-2">
                        <dt className="sr-only">Adresse</dt>
                        <Icon name="MapPin" className="mt-0.5 size-4 shrink-0 text-dore-600 dark:text-dore-300" />
                        <dd>{active.address}</dd>
                      </div>
                    ) : null}
                    {active.hours ? (
                      <div className="flex items-start gap-2">
                        <dt className="sr-only">Horaires</dt>
                        <Icon name="Clock" className="mt-0.5 size-4 shrink-0 text-dore-600 dark:text-dore-300" />
                        <dd>{active.hours}</dd>
                      </div>
                    ) : null}
                    {active.phone ? (
                      <div className="flex items-start gap-2">
                        <dt className="sr-only">Téléphone</dt>
                        <Icon name="Phone" className="mt-0.5 size-4 shrink-0 text-dore-600 dark:text-dore-300" />
                        <dd>
                          <a href={`tel:${active.phone.replace(/\s/g, "")}`} className="hover:underline">
                            {active.phone}
                          </a>
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                  {active.lat && active.lng ? (
                    <a
                      href={`https://www.openstreetmap.org/?mlat=${active.lat}&mlon=${active.lng}#map=18/${active.lat}/${active.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3.5 inline-flex items-center gap-1.5 text-sm font-semibold text-azur-600 hover:underline dark:text-azur-200"
                    >
                      <Icon name="Locate" className="size-4" />
                      Ouvrir dans OpenStreetMap
                      <span className="sr-only">(nouvelle fenêtre)</span>
                    </a>
                  ) : null}
                </div>
              </div>
            </Card>
          ) : null}
        </div>

        {/* Liste */}
        <div className="lg:col-span-2">
          <ul className="max-h-[38rem] space-y-2 overflow-y-auto pr-1">
            {visible.map((item) => (
              <li key={item.id} id={item.slug} className="scroll-mt-28">
                <button
                  type="button"
                  onClick={() => setSelected(item.id)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-card border p-3.5 text-left transition-colors",
                    selected === item.id
                      ? "border-azur-500 bg-azur-50 dark:bg-azur-900/40"
                      : "border-[color:var(--bordure)] hover:bg-[color:var(--surface-alt)]",
                  )}
                >
                  <span
                    className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg text-white"
                    style={{ backgroundColor: CATEGORY_COLORS[item.category] ?? "#14507f" }}
                  >
                    <Icon name={CATEGORY_ICONS[item.category]} className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{item.name}</span>
                    {item.address ? (
                      <span className="mt-0.5 block text-xs text-[color:var(--texte-doux)]">
                        {item.address}
                      </span>
                    ) : null}
                  </span>
                  {item.accessible ? (
                    <Icon
                      name="Accessibility"
                      className="mt-1 size-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                      label="Accessible aux personnes à mobilité réduite"
                    />
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
