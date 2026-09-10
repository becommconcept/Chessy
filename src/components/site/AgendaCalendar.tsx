"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Icon } from "@/components/ui/Icon";
import { Card } from "@/components/ui/layout";
import { EVENT_CATEGORY_LABELS, labelOf } from "@/lib/enums";
import { cn } from "@/lib/utils";

export type CalendarEvent = {
  slug: string;
  title: string;
  startAt: string;
  endAt: string | null;
  allDay: boolean;
  place: string | null;
  category: string | null;
};

const MONTHS = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
];

const WEEKDAYS = ["lun.", "mar.", "mer.", "jeu.", "ven.", "sam.", "dim."];
const WEEKDAYS_FULL = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];

const CATEGORY_COLORS: Record<string, string> = {
  CULTURE: "#8a4fa0",
  SPORT: "#c68a2e",
  MUNICIPAL: "#14507f",
  FESTIF: "#b4562a",
  ASSOCIATIF: "#1e7a5f",
  MARCHE: "#2f8f7a",
};

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/**
 * Calendrier mensuel de l'agenda communal.
 *
 * Le tableau porte les rôles et libellés attendus : les jours sont des
 * cellules d'en-tête de colonne, chaque case annonce sa date complète, et la
 * liste des évènements du jour sélectionné est rendue sous le calendrier —
 * de sorte que l'information reste accessible sans survol.
 */
export function AgendaCalendar({ events }: { events: CalendarEvent[] }) {
  const today = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState<string | null>(dayKey(today));

  /* Regroupement des évènements par jour, en couvrant les périodes multi-jours. */
  const byDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of events) {
      const start = new Date(event.startAt);
      const end = event.endAt ? new Date(event.endAt) : start;
      const cursorDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const lastDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());
      let guard = 0;
      while (cursorDate <= lastDate && guard < 40) {
        const key = dayKey(cursorDate);
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(event);
        cursorDate.setDate(cursorDate.getDate() + 1);
        guard += 1;
      }
    }
    return map;
  }, [events]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leading = (firstOfMonth.getDay() + 6) % 7; // Semaine commençant le lundi

  const cells: Array<{ date: Date; inMonth: boolean }> = [];
  for (let index = 0; index < leading; index += 1) {
    cells.push({ date: new Date(year, month, index - leading + 1), inMonth: false });
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ date: new Date(year, month, day), inMonth: true });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ date: new Date(year, month, daysInMonth + (cells.length % 7)), inMonth: false });
  }

  const selectedEvents = selected ? byDay.get(selected) ?? [] : [];
  const selectedDate = selected ? new Date(`${selected}T12:00:00`) : null;

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <Card className="lg:col-span-3">
        <div className="flex items-center justify-between gap-3 border-b border-[color:var(--bordure)] px-4 py-3.5">
          <button
            type="button"
            onClick={() => setCursor(new Date(year, month - 1, 1))}
            className="flex size-9 items-center justify-center rounded-field border border-[color:var(--bordure)] transition-colors hover:bg-[color:var(--surface-alt)]"
          >
            <Icon name="ChevronLeft" className="size-4" />
            <span className="sr-only">Mois précédent</span>
          </button>

          <p aria-live="polite" className="font-display text-base font-bold capitalize">
            {MONTHS[month]} {year}
          </p>

          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => {
                setCursor(new Date(today.getFullYear(), today.getMonth(), 1));
                setSelected(dayKey(today));
              }}
              className="hidden h-9 items-center rounded-field border border-[color:var(--bordure)] px-3 text-xs font-semibold transition-colors hover:bg-[color:var(--surface-alt)] sm:flex"
            >
              Aujourd'hui
            </button>
            <button
              type="button"
              onClick={() => setCursor(new Date(year, month + 1, 1))}
              className="flex size-9 items-center justify-center rounded-field border border-[color:var(--bordure)] transition-colors hover:bg-[color:var(--surface-alt)]"
            >
              <Icon name="ChevronRight" className="size-4" />
              <span className="sr-only">Mois suivant</span>
            </button>
          </div>
        </div>

        <table className="w-full table-fixed">
          <caption className="sr-only">
            Calendrier des manifestations de {MONTHS[month]} {year}
          </caption>
          <thead>
            <tr>
              {WEEKDAYS.map((day, index) => (
                <th
                  key={day}
                  scope="col"
                  className="px-1 pt-3 pb-1.5 text-center text-[0.6875rem] font-bold tracking-wide uppercase text-[color:var(--texte-doux)]"
                >
                  <abbr title={WEEKDAYS_FULL[index]} className="no-underline">
                    {day}
                  </abbr>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: cells.length / 7 }, (_, week) => (
              <tr key={week}>
                {cells.slice(week * 7, week * 7 + 7).map((cell) => {
                  const key = dayKey(cell.date);
                  const dayEvents = byDay.get(key) ?? [];
                  const isToday = key === dayKey(today);
                  const isSelected = key === selected;

                  return (
                    <td key={key} className="p-0.5 align-top sm:p-1">
                      <button
                        type="button"
                        onClick={() => setSelected(key)}
                        aria-pressed={isSelected}
                        aria-label={`${cell.date.getDate()} ${MONTHS[cell.date.getMonth()]} ${cell.date.getFullYear()} — ${
                          dayEvents.length === 0
                            ? "aucune manifestation"
                            : `${dayEvents.length} manifestation${dayEvents.length > 1 ? "s" : ""}`
                        }`}
                        className={cn(
                          "flex aspect-square w-full flex-col items-center justify-start rounded-lg pt-1.5 text-sm transition-colors sm:pt-2",
                          !cell.inMonth && "opacity-35",
                          isSelected
                            ? "bg-azur-600 text-white"
                            : dayEvents.length > 0
                              ? "bg-azur-50 font-semibold hover:bg-azur-100 dark:bg-azur-900/40 dark:hover:bg-azur-900/70"
                              : "hover:bg-[color:var(--surface-alt)]",
                        )}
                      >
                        <span
                          className={cn(
                            "flex size-6 items-center justify-center rounded-full tabular-nums",
                            isToday && !isSelected && "bg-dore-500 font-bold text-white",
                          )}
                        >
                          {cell.date.getDate()}
                        </span>
                        {dayEvents.length > 0 ? (
                          <span aria-hidden className="mt-1 flex max-w-full flex-wrap justify-center gap-0.5">
                            {dayEvents.slice(0, 3).map((event, index) => (
                              <span
                                key={`${event.slug}-${index}`}
                                className="size-1.5 rounded-full"
                                style={{
                                  backgroundColor: isSelected
                                    ? "rgba(255,255,255,0.9)"
                                    : CATEGORY_COLORS[event.category ?? ""] ?? "#14507f",
                                }}
                              />
                            ))}
                          </span>
                        ) : null}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        <ul className="flex flex-wrap gap-x-4 gap-y-1.5 border-t border-[color:var(--bordure)] px-4 py-3">
          {Object.entries(CATEGORY_COLORS).map(([category, color]) => (
            <li key={category} className="flex items-center gap-1.5 text-xs text-[color:var(--texte-doux)]">
              <span aria-hidden className="size-2 rounded-full" style={{ backgroundColor: color }} />
              {labelOf(EVENT_CATEGORY_LABELS, category)}
            </li>
          ))}
        </ul>
      </Card>

      {/* Détail du jour sélectionné */}
      <div className="lg:col-span-2">
        <Card className="h-full p-5">
          <p className="font-display text-sm font-bold text-azur-800 dark:text-white">
            {selectedDate
              ? `${WEEKDAYS_FULL[(selectedDate.getDay() + 6) % 7]} ${selectedDate.getDate()} ${MONTHS[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`
              : "Sélectionnez une date"}
          </p>

          <div aria-live="polite" className="mt-4">
            {selectedEvents.length === 0 ? (
              <p className="flex items-start gap-2.5 text-sm text-[color:var(--texte-doux)]">
                <Icon name="CalendarX" className="mt-0.5 size-4 shrink-0" />
                Aucune manifestation programmée ce jour-là.
              </p>
            ) : (
              <ul className="space-y-2.5">
                {selectedEvents.map((event, index) => {
                  const start = new Date(event.startAt);
                  return (
                    <li key={`${event.slug}-${index}`}>
                      <Link
                        href={`/agenda/${event.slug}`}
                        className="group block rounded-field border border-[color:var(--bordure)] p-3.5 transition-colors hover:border-azur-300 hover:bg-[color:var(--surface-alt)]"
                      >
                        <span className="flex items-start gap-2.5">
                          <span
                            aria-hidden
                            className="mt-1.5 size-2.5 shrink-0 rounded-full"
                            style={{
                              backgroundColor: CATEGORY_COLORS[event.category ?? ""] ?? "#14507f",
                            }}
                          />
                          <span className="min-w-0">
                            <span className="block text-sm font-semibold group-hover:text-azur-600 dark:group-hover:text-azur-200">
                              {event.title}
                            </span>
                            <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-[color:var(--texte-doux)]">
                              {!event.allDay ? (
                                <span>
                                  {start.toLocaleTimeString("fr-FR", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              ) : (
                                <span>Toute la journée</span>
                              )}
                              {event.place ? <span>{event.place}</span> : null}
                            </span>
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
