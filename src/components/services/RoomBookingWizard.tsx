"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Checkbox, Field, Input, Notice, RadioCard, Textarea } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { Badge, Card } from "@/components/ui/layout";
import { Visual } from "@/components/ui/Visual";
import type { DayStatus, RoomPublic } from "@/lib/booking";
import { AUDIENCES, AUDIENCE_HINTS, AUDIENCE_LABELS, type Audience } from "@/lib/enums";
import { addDays, cn, formatDate, formatPrice, toISODate } from "@/lib/utils";

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
const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];
const WEEKDAYS_FULL = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];

const STEPS = [
  { key: "creneau", label: "Salle et date", icon: "CalendarDays" },
  { key: "situation", label: "Votre situation", icon: "Users" },
  { key: "details", label: "Vos coordonnées", icon: "FileSignature" },
  { key: "recapitulatif", label: "Récapitulatif", icon: "CircleCheck" },
] as const;

type StepKey = (typeof STEPS)[number]["key"];

type Availability = Record<string, DayStatus>;

/**
 * Tunnel de réservation d'une salle communale.
 *
 * Quatre étapes, un calendrier qui affiche les créneaux réellement libres et
 * un tarif recalculé à chaque changement de situation. Toutes les règles sont
 * revérifiées côté serveur au moment du dépôt : l'affichage guide l'usager,
 * il ne décide pas.
 */
export function RoomBookingWizard({ rooms }: { rooms: RoomPublic[] }) {
  const [step, setStep] = useState<StepKey>("creneau");
  const [roomSlug, setRoomSlug] = useState(rooms[0]?.slug ?? "");
  const [slotKey, setSlotKey] = useState(rooms[0]?.slots[0]?.key ?? "");
  const [startDate, setStartDate] = useState<string | null>(null);
  const [audience, setAudience] = useState<Audience | "">("");
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [availability, setAvailability] = useState<Availability>({});
  const [loadingCalendar, setLoadingCalendar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ reference: string; token: string } | null>(null);
  const [form, setForm] = useState({
    purpose: "",
    expectedAttendees: "",
    organizationName: "",
    applicantName: "",
    applicantEmail: "",
    applicantPhone: "",
    applicantAddress: "",
    comment: "",
    needsTables: false,
    needsChairs: false,
    needsKitchen: false,
    needsBar: false,
    acceptRules: false,
    consentRgpd: false,
  });

  const room = useMemo(
    () => rooms.find((entry) => entry.slug === roomSlug) ?? rooms[0],
    [rooms, roomSlug],
  );
  const slot = useMemo(
    () => room?.slots.find((entry) => entry.key === slotKey) ?? room?.slots[0],
    [room, slotKey],
  );

  const tariff = useMemo(() => {
    if (!room || !slot || !audience) return null;
    return (
      room.tariffs.find((entry) => entry.audience === audience && entry.slotKey === slot.key) ?? null
    );
  }, [room, slot, audience]);

  /* Chargement du calendrier de la salle sur le mois affiché et le suivant. */
  const loadCalendar = useCallback(
    async (targetRoom: string, targetMonth: Date) => {
      setLoadingCalendar(true);
      const from = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
      const to = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 2, 0);
      try {
        const response = await fetch(
          `/api/reservations/salle/disponibilites?salle=${encodeURIComponent(targetRoom)}&debut=${toISODate(from)}&fin=${toISODate(to)}`,
        );
        const data = (await response.json()) as { calendrier?: Availability };
        setAvailability((current) => ({ ...current, ...(data.calendrier ?? {}) }));
      } catch {
        setError("Les disponibilités n'ont pas pu être chargées. Réessayez dans un instant.");
      } finally {
        setLoadingCalendar(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!roomSlug) return;
    setAvailability({});
    void loadCalendar(roomSlug, month);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomSlug]);

  useEffect(() => {
    if (!roomSlug) return;
    void loadCalendar(roomSlug, month);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  /* Le changement de salle réinitialise le créneau et la date. */
  useEffect(() => {
    if (!room) return;
    if (!room.slots.some((entry) => entry.key === slotKey)) {
      setSlotKey(room.slots[0]?.key ?? "");
    }
    setStartDate(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomSlug]);

  /* Un créneau imposant un jour de début invalide la date déjà choisie. */
  useEffect(() => {
    if (!slot || !startDate) return;
    const date = new Date(`${startDate}T12:00:00`);
    if (slot.startDow !== null && date.getDay() !== slot.startDow) setStartDate(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slotKey]);

  /** Les journées couvertes par le créneau à partir d'une date de début. */
  const spanOf = useCallback(
    (start: string): string[] => {
      const days = slot?.days ?? 1;
      const date = new Date(`${start}T12:00:00`);
      return Array.from({ length: days }, (_, index) => toISODate(addDays(date, index)));
    },
    [slot],
  );

  /** Une date peut-elle accueillir le créneau entier ? */
  const canStart = useCallback(
    (key: string): { ok: boolean; reason?: string } => {
      const date = new Date(`${key}T12:00:00`);
      if (slot?.startDow != null && date.getDay() !== slot.startDow) {
        return { ok: false, reason: `Ce créneau débute un ${WEEKDAYS_FULL[(slot.startDow + 6) % 7]}` };
      }
      for (const day of spanOf(key)) {
        const status = availability[day];
        if (!status) return { ok: false, reason: "Disponibilité inconnue" };
        if (status.state !== "libre") return { ok: false, reason: status.reason };
      }
      return { ok: true };
    },
    [availability, slot, spanOf],
  );

  const endDate = startDate ? spanOf(startDate).at(-1)! : null;

  const submit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const response = await fetch("/api/reservations/salle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomSlug,
          slotKey,
          startDate,
          audience,
          purpose: form.purpose,
          expectedAttendees: form.expectedAttendees || undefined,
          organizationName: form.organizationName || undefined,
          applicantName: form.applicantName,
          applicantEmail: form.applicantEmail,
          applicantPhone: form.applicantPhone,
          applicantAddress: form.applicantAddress || undefined,
          needsTables: form.needsTables,
          needsChairs: form.needsChairs,
          needsKitchen: form.needsKitchen,
          needsBar: form.needsBar,
          comment: form.comment || undefined,
          acceptRules: form.acceptRules,
          consentRgpd: form.consentRgpd,
        }),
      });
      const data = (await response.json()) as
        | { ok: true; reference: string; token: string }
        | { ok: false; message: string };

      if (!data.ok) {
        setError(data.message);
        // Une indisponibilité survenue entre-temps renvoie au choix de la date.
        if (response.status === 409) {
          setStep("creneau");
          setAvailability({});
          void loadCalendar(roomSlug, month);
        }
        return;
      }
      setResult({ reference: data.reference, token: data.token });
    } catch {
      setError("L'envoi a échoué. Vérifiez votre connexion et réessayez.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!room || !slot) {
    return (
      <Notice tone="attention" title="Aucune salle réservable">
        Le service de réservation en ligne est momentanément indisponible. Contactez l'accueil de la
        mairie au 04 78 43 92 03.
      </Notice>
    );
  }

  /* ----------------------------- Confirmation ---------------------------- */

  if (result) {
    return (
      <Card className="p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200">
            <Icon name="CircleCheck" className="size-7" />
          </span>
          <div className="min-w-0">
            <h2 className="font-display text-2xl font-bold text-azur-800 dark:text-white">
              Votre demande est déposée
            </h2>
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-[color:var(--texte-doux)]">
              Le créneau est <strong>réservé en option</strong> le temps de l'instruction. Le
              secrétariat vérifie votre dossier et vous confirme la réservation par courriel. Tant
              que la confirmation n'est pas arrivée, la salle n'est pas définitivement attribuée.
            </p>

            <dl className="mt-5 grid gap-4 rounded-card bg-[color:var(--surface-alt)] p-5 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-bold tracking-wide uppercase text-[color:var(--texte-doux)]">
                  Référence de suivi
                </dt>
                <dd className="mt-1 font-display text-2xl font-bold text-azur-700 tabular-nums dark:text-azur-200">
                  {result.reference}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold tracking-wide uppercase text-[color:var(--texte-doux)]">
                  Créneau demandé
                </dt>
                <dd className="mt-1 text-sm font-semibold">
                  {room.name} — {slot.label}
                  <span className="mt-0.5 block font-normal text-[color:var(--texte-doux)]">
                    du {formatDate(new Date(`${startDate}T12:00:00`))} au{" "}
                    {formatDate(new Date(`${endDate}T12:00:00`))}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold tracking-wide uppercase text-[color:var(--texte-doux)]">
                  Tarif prévisionnel
                </dt>
                <dd className="mt-1 text-sm font-semibold">{formatPrice(tariff?.amountCents ?? 0)}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold tracking-wide uppercase text-[color:var(--texte-doux)]">
                  Caution
                </dt>
                <dd className="mt-1 text-sm font-semibold">
                  {formatPrice(tariff?.depositCents ?? 0, { free: "Sans caution" })}
                </dd>
              </div>
            </dl>

            <div className="mt-5 rounded-card border-l-4 border-dore-400 bg-dore-50 p-4 text-sm dark:bg-dore-900/25">
              <p className="font-semibold text-dore-900 dark:text-dore-100">Prochaines étapes</p>
              <ol className="mt-2 space-y-1.5 text-dore-900/90 dark:text-dore-50/90">
                <li>1. Le secrétariat instruit votre demande.</li>
                <li>
                  2. Vous transmettez votre <strong>attestation d'assurance responsabilité
                  civile</strong> et, le cas échéant, un justificatif de domicile.
                </li>
                <li>3. La convention est signée et la caution remise avant les clés.</li>
                <li>4. État des lieux d'entrée à la remise des clés, et de sortie au retour.</li>
              </ol>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/suivi?ref=${encodeURIComponent(result.reference)}&cle=${result.token}`}
                className="inline-flex h-11 items-center gap-2 rounded-field bg-azur-600 px-5 text-[0.9375rem] font-semibold text-white transition-colors hover:bg-azur-700"
              >
                <Icon name="Search" className="size-4" />
                Suivre ma demande
              </Link>
              <Link
                href="/services/pret-de-materiel"
                className="inline-flex h-11 items-center gap-2 rounded-field border border-azur-600/30 px-5 text-[0.9375rem] font-semibold text-azur-700 transition-colors hover:bg-azur-50 dark:text-azur-200 dark:hover:bg-azur-900/40"
              >
                <Icon name="Package" className="size-4" />
                Emprunter du matériel
              </Link>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  /* -------------------------------- Étapes ------------------------------- */

  const currentIndex = STEPS.findIndex((entry) => entry.key === step);

  const stepValid =
    step === "creneau"
      ? Boolean(startDate)
      : step === "situation"
        ? Boolean(audience && tariff)
        : step === "details"
          ? form.purpose.trim().length >= 3 &&
            form.applicantName.trim().length >= 2 &&
            /\S+@\S+\.\S+/.test(form.applicantEmail) &&
            form.applicantPhone.trim().length >= 6
          : form.acceptRules && form.consentRgpd;

  return (
    <div>
      {/* Fil des étapes */}
      <ol className="mb-8 flex flex-wrap gap-2 sm:gap-3">
        {STEPS.map((entry, index) => {
          const done = index < currentIndex;
          const active = index === currentIndex;
          return (
            <li key={entry.key} className="flex-1">
              <button
                type="button"
                onClick={() => (done ? setStep(entry.key) : undefined)}
                disabled={!done && !active}
                aria-current={active ? "step" : undefined}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-field border p-3 text-left transition-colors",
                  active
                    ? "border-azur-500 bg-azur-50 dark:bg-azur-900/40"
                    : done
                      ? "cursor-pointer border-[color:var(--bordure)] hover:bg-[color:var(--surface-alt)]"
                      : "border-[color:var(--bordure)] opacity-55",
                )}
              >
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                    active
                      ? "bg-azur-600 text-white"
                      : done
                        ? "bg-emerald-500 text-white"
                        : "bg-[color:var(--surface-sunken)] text-[color:var(--texte-doux)]",
                  )}
                >
                  {done ? <Icon name="Check" className="size-3.5" /> : index + 1}
                </span>
                <span className="min-w-0 text-xs font-semibold sm:text-[0.8125rem]">
                  {entry.label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      {error ? (
        <Notice tone="erreur" title="Un point à corriger" className="mb-6">
          {error}
        </Notice>
      ) : null}

      {/* ---------------------------- Étape 1 ---------------------------- */}
      {step === "creneau" ? (
        <div className="space-y-6">
          {rooms.length > 1 ? (
            <Field label="Quelle salle souhaitez-vous réserver ?" required>
              <div className="grid gap-3 sm:grid-cols-2">
                {rooms.map((entry) => (
                  <label
                    key={entry.slug}
                    className={cn(
                      "flex cursor-pointer gap-3 rounded-card border p-3.5 transition-all duration-200",
                      roomSlug === entry.slug
                        ? "border-azur-500 bg-azur-50/70 ring-2 ring-azur-500/20 dark:bg-azur-900/30"
                        : "border-[color:var(--bordure)] hover:border-azur-300 hover:bg-[color:var(--surface-alt)]",
                    )}
                  >
                    <input
                      type="radio"
                      name="salle"
                      value={entry.slug}
                      checked={roomSlug === entry.slug}
                      onChange={() => setRoomSlug(entry.slug)}
                      className="sr-only"
                    />
                    <Visual
                      source={entry.image}
                      ratio="1/1"
                      className="size-16 shrink-0 rounded-field"
                      sizes="64px"
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-bold">{entry.name}</span>
                      {entry.subtitle ? (
                        <span className="mt-0.5 block text-xs text-[color:var(--texte-doux)]">
                          {entry.subtitle}
                        </span>
                      ) : null}
                      <span className="mt-1.5 flex flex-wrap gap-2 text-[0.6875rem] text-[color:var(--texte-doux)]">
                        {entry.capacitySeated ? <span>{entry.capacitySeated} places assises</span> : null}
                        {entry.surface ? <span>{entry.surface} m²</span> : null}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </Field>
          ) : null}

          <Field label="Quel créneau ?" required hint={slot.details ?? undefined}>
            <div className="grid gap-2 sm:grid-cols-3">
              {room.slots.map((entry) => (
                <RadioCard
                  key={entry.key}
                  name="creneau"
                  value={entry.key}
                  checked={slotKey === entry.key}
                  onChange={() => setSlotKey(entry.key)}
                  label={entry.label}
                  description={entry.details ?? undefined}
                />
              ))}
            </div>
          </Field>

          {/* Calendrier */}
          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold">
                Choisissez la date de début
                <span className="ml-0.5 text-red-600" aria-hidden>
                  *
                </span>
              </p>
              {loadingCalendar ? (
                <span className="flex items-center gap-1.5 text-xs text-[color:var(--texte-doux)]">
                  <Icon name="Loader2" className="size-3.5 animate-spin" />
                  Chargement des disponibilités…
                </span>
              ) : null}
            </div>

            <Card className="overflow-hidden">
              <div className="flex items-center justify-between border-b border-[color:var(--bordure)] px-4 py-3">
                <button
                  type="button"
                  onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
                  className="flex size-9 items-center justify-center rounded-field border border-[color:var(--bordure)] transition-colors hover:bg-[color:var(--surface-alt)]"
                >
                  <Icon name="ChevronLeft" className="size-4" />
                  <span className="sr-only">Mois précédent</span>
                </button>
                <p aria-live="polite" className="font-display text-base font-bold capitalize">
                  {MONTHS[month.getMonth()]} {month.getFullYear()}
                </p>
                <button
                  type="button"
                  onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
                  className="flex size-9 items-center justify-center rounded-field border border-[color:var(--bordure)] transition-colors hover:bg-[color:var(--surface-alt)]"
                >
                  <Icon name="ChevronRight" className="size-4" />
                  <span className="sr-only">Mois suivant</span>
                </button>
              </div>

              <MonthGrid
                month={month}
                slotDays={slot.days}
                startDate={startDate}
                onSelect={setStartDate}
                canStart={canStart}
                availability={availability}
                spanOf={spanOf}
              />

              <ul className="flex flex-wrap gap-x-4 gap-y-1.5 border-t border-[color:var(--bordure)] bg-[color:var(--surface-alt)] px-4 py-3 text-xs">
                {[
                  { color: "bg-emerald-500", label: "Disponible" },
                  { color: "bg-red-400", label: "Déjà réservé" },
                  { color: "bg-dore-400", label: "Fermeture / manifestation" },
                  { color: "bg-pierre-300", label: "Hors délai de réservation" },
                ].map((legend) => (
                  <li key={legend.label} className="flex items-center gap-1.5 text-[color:var(--texte-doux)]">
                    <span aria-hidden className={cn("size-2.5 rounded-full", legend.color)} />
                    {legend.label}
                  </li>
                ))}
              </ul>
            </Card>

            {startDate && endDate ? (
              <Notice tone="succes" className="mt-4">
                Créneau retenu : <strong>{slot.label}</strong>, du{" "}
                <strong>{formatDate(new Date(`${startDate}T12:00:00`))}</strong> au{" "}
                <strong>{formatDate(new Date(`${endDate}T12:00:00`))}</strong>.
              </Notice>
            ) : (
              <p className="mt-3 text-xs text-[color:var(--texte-doux)]">
                Les dates en vert peuvent accueillir l'intégralité du créneau
                {slot.days > 1 ? ` (${slot.days} jours consécutifs)` : ""}. Passez la souris sur une
                date indisponible pour connaître le motif.
              </p>
            )}
          </div>
        </div>
      ) : null}

      {/* ---------------------------- Étape 2 ---------------------------- */}
      {step === "situation" ? (
        <div className="space-y-6">
          <Field
            label="Au titre de quoi réservez-vous ?"
            required
            hint="Le tarif dépend de votre situation. Un justificatif pourra vous être demandé."
          >
            <div className="grid gap-2.5">
              {AUDIENCES.filter((entry) => entry !== "COMMUNE").map((entry) => {
                const entryTariff = room.tariffs.find(
                  (item) => item.audience === entry && item.slotKey === slot.key,
                );
                return (
                  <RadioCard
                    key={entry}
                    name="situation"
                    value={entry}
                    checked={audience === entry}
                    onChange={() => setAudience(entry)}
                    label={AUDIENCE_LABELS[entry]}
                    description={AUDIENCE_HINTS[entry]}
                    badge={
                      entryTariff ? (
                        <Badge tone={entryTariff.amountCents === 0 ? "succes" : "azur"}>
                          {formatPrice(entryTariff.amountCents)}
                        </Badge>
                      ) : (
                        <Badge tone="neutre">Sur devis</Badge>
                      )
                    }
                  />
                );
              })}
            </div>
          </Field>

          {tariff ? (
            <Card className="overflow-hidden">
              <div className="border-b border-[color:var(--bordure)] bg-[color:var(--surface-alt)] px-5 py-3">
                <p className="font-display text-sm font-bold">Détail du tarif appliqué</p>
              </div>
              <dl className="divide-y divide-[color:var(--bordure)] text-sm">
                <div className="flex items-baseline justify-between gap-4 px-5 py-3">
                  <dt className="text-[color:var(--texte-doux)]">Location — {tariff.label}</dt>
                  <dd className="font-display text-lg font-bold text-azur-700 dark:text-azur-200">
                    {formatPrice(tariff.amountCents)}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 px-5 py-3">
                  <dt className="text-[color:var(--texte-doux)]">
                    Caution
                    <span className="mt-0.5 block text-xs">
                      Restituée après l'état des lieux de sortie
                    </span>
                  </dt>
                  <dd className="font-semibold">
                    {formatPrice(tariff.depositCents, { free: "Sans caution" })}
                  </dd>
                </div>
                {tariff.notes ? (
                  <div className="px-5 py-3 text-xs text-[color:var(--texte-doux)]">{tariff.notes}</div>
                ) : null}
              </dl>
            </Card>
          ) : audience ? (
            <Notice tone="attention" title="Tarif à établir">
              Aucun tarif n'est prévu pour cette combinaison de situation et de créneau. Poursuivez
              votre demande : le secrétariat vous communiquera le montant applicable.
            </Notice>
          ) : null}
        </div>
      ) : null}

      {/* ---------------------------- Étape 3 ---------------------------- */}
      {step === "details" ? (
        <div className="space-y-5">
          <Field
            label="Nature de la manifestation"
            htmlFor="purpose"
            required
            hint="Repas de famille, assemblée générale, spectacle, loto, vide-greniers…"
          >
            <Input
              id="purpose"
              value={form.purpose}
              onChange={(event) => setForm({ ...form, purpose: event.target.value })}
              maxLength={200}
              required
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Nombre de personnes attendues"
              htmlFor="attendees"
              hint={
                room.capacitySeated
                  ? `Capacité de la salle : ${room.capacitySeated} places assises.`
                  : undefined
              }
            >
              <Input
                id="attendees"
                type="number"
                min={1}
                max={room.capacityStanding ?? 2000}
                value={form.expectedAttendees}
                onChange={(event) => setForm({ ...form, expectedAttendees: event.target.value })}
              />
            </Field>
            <Field
              label="Association ou structure"
              htmlFor="organization"
              hint="À renseigner si vous réservez au nom d'une structure."
            >
              <Input
                id="organization"
                value={form.organizationName}
                onChange={(event) => setForm({ ...form, organizationName: event.target.value })}
                maxLength={160}
              />
            </Field>
          </div>

          <hr className="border-t border-[color:var(--bordure)]" />

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Nom et prénom du responsable" htmlFor="applicantName" required>
              <Input
                id="applicantName"
                autoComplete="name"
                value={form.applicantName}
                onChange={(event) => setForm({ ...form, applicantName: event.target.value })}
                maxLength={120}
                required
              />
            </Field>
            <Field label="Adresse électronique" htmlFor="applicantEmail" required>
              <Input
                id="applicantEmail"
                type="email"
                autoComplete="email"
                value={form.applicantEmail}
                onChange={(event) => setForm({ ...form, applicantEmail: event.target.value })}
                maxLength={160}
                required
              />
            </Field>
            <Field label="Téléphone" htmlFor="applicantPhone" required>
              <Input
                id="applicantPhone"
                type="tel"
                autoComplete="tel"
                value={form.applicantPhone}
                onChange={(event) => setForm({ ...form, applicantPhone: event.target.value })}
                maxLength={30}
                required
              />
            </Field>
            <Field label="Adresse postale" htmlFor="applicantAddress">
              <Input
                id="applicantAddress"
                autoComplete="street-address"
                value={form.applicantAddress}
                onChange={(event) => setForm({ ...form, applicantAddress: event.target.value })}
                maxLength={200}
              />
            </Field>
          </div>

          <Field label="Besoins complémentaires" hint="Cochez ce dont vous aurez besoin.">
            <div className="grid gap-2 sm:grid-cols-2">
              <Checkbox
                checked={form.needsTables}
                onChange={(event) => setForm({ ...form, needsTables: event.target.checked })}
                label="Tables"
                description="Mise à disposition des tables de la salle"
              />
              <Checkbox
                checked={form.needsChairs}
                onChange={(event) => setForm({ ...form, needsChairs: event.target.checked })}
                label="Chaises"
                description="Mise à disposition des chaises de la salle"
              />
              <Checkbox
                checked={form.needsKitchen}
                onChange={(event) => setForm({ ...form, needsKitchen: event.target.checked })}
                label="Office traiteur"
                description="Four, réfrigérateur, lave-vaisselle"
              />
              <Checkbox
                checked={form.needsBar}
                onChange={(event) => setForm({ ...form, needsBar: event.target.checked })}
                label="Buvette"
                description="Débit de boissons temporaire à déclarer séparément"
              />
            </div>
          </Field>

          <Field
            label="Précisions à l'attention du secrétariat"
            htmlFor="comment"
            hint="Horaires souhaités, installation particulière, question sur le règlement…"
          >
            <Textarea
              id="comment"
              rows={4}
              value={form.comment}
              onChange={(event) => setForm({ ...form, comment: event.target.value })}
              maxLength={2000}
            />
          </Field>
        </div>
      ) : null}

      {/* ---------------------------- Étape 4 ---------------------------- */}
      {step === "recapitulatif" ? (
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <div className="border-b border-[color:var(--bordure)] bg-[color:var(--surface-alt)] px-5 py-3.5">
              <p className="font-display text-sm font-bold">Récapitulatif de votre demande</p>
            </div>
            <dl className="divide-y divide-[color:var(--bordure)] text-sm">
              {[
                { label: "Salle", value: room.name },
                { label: "Créneau", value: slot.label },
                {
                  label: "Dates",
                  value:
                    startDate && endDate
                      ? `du ${formatDate(new Date(`${startDate}T12:00:00`))} au ${formatDate(new Date(`${endDate}T12:00:00`))}`
                      : "—",
                },
                { label: "Situation", value: audience ? AUDIENCE_LABELS[audience] : "—" },
                { label: "Nature de la manifestation", value: form.purpose || "—" },
                { label: "Effectif attendu", value: form.expectedAttendees || "non précisé" },
                { label: "Structure", value: form.organizationName || "—" },
                { label: "Responsable", value: form.applicantName },
                { label: "Contact", value: `${form.applicantEmail} — ${form.applicantPhone}` },
                {
                  label: "Besoins",
                  value:
                    [
                      form.needsTables ? "tables" : null,
                      form.needsChairs ? "chaises" : null,
                      form.needsKitchen ? "office traiteur" : null,
                      form.needsBar ? "buvette" : null,
                    ]
                      .filter(Boolean)
                      .join(", ") || "aucun",
                },
                { label: "Tarif", value: formatPrice(tariff?.amountCents ?? 0) },
                {
                  label: "Caution",
                  value: formatPrice(tariff?.depositCents ?? 0, { free: "Sans caution" }),
                },
              ].map((row) => (
                <div key={row.label} className="grid gap-1 px-5 py-3 sm:grid-cols-3">
                  <dt className="text-[color:var(--texte-doux)]">{row.label}</dt>
                  <dd className="font-medium sm:col-span-2">{row.value}</dd>
                </div>
              ))}
            </dl>
          </Card>

          {room.rules ? (
            <details className="rounded-card border border-[color:var(--bordure)]">
              <summary className="cursor-pointer list-none px-5 py-3.5 font-semibold">
                <span className="flex items-center justify-between gap-3">
                  Règlement d'utilisation de la salle
                  <Icon name="ChevronDown" className="size-4" />
                </span>
              </summary>
              <div
                className="contenu border-t border-[color:var(--bordure)] px-5 py-4 text-sm"
                dangerouslySetInnerHTML={{ __html: room.rules }}
              />
            </details>
          ) : null}

          <div className="space-y-2.5">
            <Checkbox
              checked={form.acceptRules}
              onChange={(event) => setForm({ ...form, acceptRules: event.target.checked })}
              required
              label="J'ai pris connaissance du règlement d'utilisation et je m'engage à le respecter"
              description="Une attestation d'assurance responsabilité civile sera exigée avant la remise des clés."
            />
            <Checkbox
              checked={form.consentRgpd}
              onChange={(event) => setForm({ ...form, consentRgpd: event.target.checked })}
              required
              label="J'accepte que mes informations soient utilisées pour instruire cette réservation"
              description="Elles sont conservées cinq ans, et dix ans pour les pièces comptables."
            />
          </div>

          <Notice tone="info" title="Ce dépôt ne vaut pas confirmation">
            Votre demande pose une option sur le créneau. Elle devient une réservation ferme
            uniquement après validation par le secrétariat, qui vous en informera par courriel.
          </Notice>
        </div>
      ) : null}

      {/* Navigation */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--bordure)] pt-6">
        <Button
          variant="discret"
          onClick={() => setStep(STEPS[Math.max(currentIndex - 1, 0)].key)}
          disabled={currentIndex === 0}
          icon="ArrowLeft"
        >
          Étape précédente
        </Button>

        {step === "recapitulatif" ? (
          <Button
            size="lg"
            onClick={submit}
            disabled={!stepValid || submitting}
            icon={submitting ? "Loader2" : "Send"}
            className={submitting ? "[&_svg]:animate-spin" : undefined}
          >
            {submitting ? "Envoi en cours…" : "Déposer ma demande"}
          </Button>
        ) : (
          <Button
            size="lg"
            onClick={() => setStep(STEPS[currentIndex + 1].key)}
            disabled={!stepValid}
            iconRight="ArrowRight"
          >
            Continuer
          </Button>
        )}
      </div>

      {!stepValid && step !== "recapitulatif" ? (
        <p className="mt-3 text-right text-xs text-[color:var(--texte-doux)]">
          {step === "creneau"
            ? "Sélectionnez une date disponible pour continuer."
            : step === "situation"
              ? "Indiquez votre situation pour connaître le tarif."
              : "Complétez les champs obligatoires pour continuer."}
        </p>
      ) : null}
    </div>
  );
}

/* -------------------------- Grille d'un mois ----------------------------- */

function MonthGrid({
  month,
  slotDays,
  startDate,
  onSelect,
  canStart,
  availability,
  spanOf,
}: {
  month: Date;
  slotDays: number;
  startDate: string | null;
  onSelect: (key: string) => void;
  canStart: (key: string) => { ok: boolean; reason?: string };
  availability: Record<string, DayStatus>;
  spanOf: (key: string) => string[];
}) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const leading = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
  const selectedSpan = startDate ? new Set(spanOf(startDate)) : new Set<string>();

  const cells: Array<Date | null> = [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => new Date(year, monthIndex, index + 1)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <table className="w-full table-fixed">
      <caption className="sr-only">
        Disponibilités de {MONTHS[monthIndex]} {year}
      </caption>
      <thead>
        <tr>
          {WEEKDAYS.map((day, index) => (
            <th
              key={index}
              scope="col"
              className="px-1 pt-3 pb-1 text-center text-[0.6875rem] font-bold uppercase text-[color:var(--texte-doux)]"
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
            {cells.slice(week * 7, week * 7 + 7).map((date, index) => {
              if (!date) return <td key={index} className="p-1" />;

              const key = toISODate(date);
              const status = availability[key];
              const check = canStart(key);
              const inSelection = selectedSpan.has(key);
              const isStart = startDate === key;

              const dotColor =
                !status || status.state === "libre"
                  ? "bg-emerald-500"
                  : status.state === "occupee"
                    ? "bg-red-400"
                    : status.state === "fermee"
                      ? "bg-dore-400"
                      : "bg-pierre-300";

              return (
                <td key={key} className="p-0.5 sm:p-1">
                  <button
                    type="button"
                    disabled={!check.ok}
                    onClick={() => onSelect(key)}
                    title={check.ok ? undefined : check.reason}
                    aria-label={`${date.getDate()} ${MONTHS[monthIndex]} — ${
                      check.ok
                        ? `disponible${slotDays > 1 ? ` pour ${slotDays} jours` : ""}`
                        : check.reason ?? "indisponible"
                    }`}
                    className={cn(
                      "relative flex aspect-square w-full flex-col items-center justify-center rounded-lg text-sm transition-colors",
                      isStart
                        ? "bg-azur-600 font-bold text-white"
                        : inSelection
                          ? "bg-azur-200 font-semibold text-azur-900 dark:bg-azur-800 dark:text-white"
                          : check.ok
                            ? "bg-emerald-50 font-medium hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50"
                            : "cursor-not-allowed text-[color:var(--texte-doux)]/45",
                    )}
                  >
                    <span className="tabular-nums">{date.getDate()}</span>
                    {!inSelection ? (
                      <span aria-hidden className={cn("mt-0.5 size-1.5 rounded-full", dotColor)} />
                    ) : null}
                  </button>
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
