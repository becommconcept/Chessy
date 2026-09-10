"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Checkbox, Field, Input, Notice, RadioCard } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { Badge, Card } from "@/components/ui/layout";
import { Visual } from "@/components/ui/Visual";
import type { EquipmentItemPublic } from "@/lib/booking";
import {
  AUDIENCES,
  AUDIENCE_HINTS,
  AUDIENCE_LABELS,
  EQUIPMENT_CATEGORY_LABELS,
  labelOf,
  type Audience,
} from "@/lib/enums";
import { addDays, cn, daysBetween, formatDate, formatPrice, fromISODate, toISODate } from "@/lib/utils";

const MIN_NOTICE_DAYS = 7;
const MAX_LOAN_DAYS = 10;

const STEPS = [
  { key: "periode", label: "Période", icon: "CalendarDays" },
  { key: "materiel", label: "Matériel", icon: "Package" },
  { key: "details", label: "Vos coordonnées", icon: "FileSignature" },
  { key: "recapitulatif", label: "Récapitulatif", icon: "CircleCheck" },
] as const;

type StepKey = (typeof STEPS)[number]["key"];

/**
 * Tunnel de demande de prêt de matériel communal.
 *
 * Le stock affiché est celui réellement disponible sur la période choisie :
 * changer les dates recalcule les quantités et ajuste le panier si nécessaire.
 */
export function EquipmentLoanWizard({ items }: { items: EquipmentItemPublic[] }) {
  const defaultPickup = toISODate(addDays(new Date(), MIN_NOTICE_DAYS + 1));
  const defaultReturn = toISODate(addDays(new Date(), MIN_NOTICE_DAYS + 4));

  const [step, setStep] = useState<StepKey>("periode");
  const [pickupDate, setPickupDate] = useState(defaultPickup);
  const [returnDate, setReturnDate] = useState(defaultReturn);
  const [eventDate, setEventDate] = useState("");
  const [audience, setAudience] = useState<Audience | "">("");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [stock, setStock] = useState<Record<string, number>>(
    Object.fromEntries(items.map((item) => [item.slug, item.quantityTotal])),
  );
  const [loadingStock, setLoadingStock] = useState(false);
  const [category, setCategory] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ reference: string; token: string } | null>(null);
  const [form, setForm] = useState({
    purpose: "",
    organizationName: "",
    applicantName: "",
    applicantEmail: "",
    applicantPhone: "",
    applicantAddress: "",
    transport: "RETRAIT" as "RETRAIT" | "LIVRAISON_DEMANDEE",
    acceptRules: false,
    consentRgpd: false,
  });

  const loadStock = useCallback(async (pickup: string, back: string) => {
    setLoadingStock(true);
    try {
      const response = await fetch(
        `/api/reservations/materiel/stock?retrait=${pickup}&retour=${back}`,
      );
      const data = (await response.json()) as { stock?: Record<string, number> };
      if (data.stock) setStock(data.stock);
    } catch {
      setError("Le stock disponible n'a pas pu être vérifié. Réessayez dans un instant.");
    } finally {
      setLoadingStock(false);
    }
  }, []);

  useEffect(() => {
    void loadStock(pickupDate, returnDate);
  }, [pickupDate, returnDate, loadStock]);

  /* Le panier est ramené au stock disponible lorsque la période change. */
  useEffect(() => {
    setCart((current) => {
      const next: Record<string, number> = {};
      let changed = false;
      for (const [slug, quantity] of Object.entries(current)) {
        const available = stock[slug] ?? 0;
        const capped = Math.min(quantity, available);
        if (capped !== quantity) changed = true;
        if (capped > 0) next[slug] = capped;
      }
      return changed ? next : current;
    });
  }, [stock]);

  const categories = useMemo(() => [...new Set(items.map((item) => item.category))], [items]);
  const visibleItems = category ? items.filter((item) => item.category === category) : items;

  const cartLines = useMemo(
    () =>
      Object.entries(cart)
        .filter(([, quantity]) => quantity > 0)
        .map(([slug, quantity]) => ({
          item: items.find((entry) => entry.slug === slug)!,
          quantity,
        }))
        .filter((line) => Boolean(line.item)),
    [cart, items],
  );

  const totals = useMemo(
    () => ({
      deposit: cartLines.reduce((sum, line) => sum + line.item.depositCents, 0),
      fee: cartLines.reduce((sum, line) => sum + line.item.feeCents * line.quantity, 0),
      pieces: cartLines.reduce((sum, line) => sum + line.quantity, 0),
      needsVehicle: cartLines.some((line) => line.item.requiresVehicle),
    }),
    [cartLines],
  );

  const duration = useMemo(() => {
    try {
      return daysBetween(fromISODate(pickupDate), fromISODate(returnDate));
    } catch {
      return 0;
    }
  }, [pickupDate, returnDate]);

  const setQuantity = (slug: string, quantity: number) => {
    const available = stock[slug] ?? 0;
    const value = Math.max(0, Math.min(quantity, available));
    setCart((current) => {
      const next = { ...current };
      if (value === 0) delete next[slug];
      else next[slug] = value;
      return next;
    });
  };

  const periodValid =
    duration >= 1 &&
    duration <= MAX_LOAN_DAYS &&
    fromISODate(pickupDate) >= addDays(new Date(new Date().setHours(0, 0, 0, 0)), MIN_NOTICE_DAYS) &&
    Boolean(audience);

  const submit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const response = await fetch("/api/reservations/materiel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickupDate,
          returnDate,
          eventDate: eventDate || undefined,
          audience,
          purpose: form.purpose,
          organizationName: form.organizationName || undefined,
          applicantName: form.applicantName,
          applicantEmail: form.applicantEmail,
          applicantPhone: form.applicantPhone,
          applicantAddress: form.applicantAddress || undefined,
          transport: form.transport,
          lines: cartLines.map((line) => ({ slug: line.item.slug, quantity: line.quantity })),
          acceptRules: form.acceptRules,
          consentRgpd: form.consentRgpd,
        }),
      });
      const data = (await response.json()) as
        | { ok: true; reference: string; token: string }
        | { ok: false; message: string };

      if (!data.ok) {
        setError(data.message);
        if (response.status === 409) {
          setStep("materiel");
          void loadStock(pickupDate, returnDate);
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

  /* ----------------------------- Confirmation ---------------------------- */

  if (result) {
    return (
      <Card className="p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200">
            <Icon name="PackageCheck" className="size-7" />
          </span>
          <div className="min-w-0">
            <h2 className="font-display text-2xl font-bold text-azur-800 dark:text-white">
              Votre demande de prêt est enregistrée
            </h2>
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-[color:var(--texte-doux)]">
              Le matériel est mis en attente sur la période demandée. Les services techniques
              vérifient la disponibilité et vous confirment le prêt ainsi que les modalités de
              retrait.
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
                  Période
                </dt>
                <dd className="mt-1 text-sm font-semibold">
                  du {formatDate(fromISODate(pickupDate))} au {formatDate(fromISODate(returnDate))}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold tracking-wide uppercase text-[color:var(--texte-doux)]">
                  Matériel demandé
                </dt>
                <dd className="mt-1 text-sm font-semibold">
                  {totals.pieces} pièce{totals.pieces > 1 ? "s" : ""} · {cartLines.length} référence
                  {cartLines.length > 1 ? "s" : ""}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold tracking-wide uppercase text-[color:var(--texte-doux)]">
                  Caution
                </dt>
                <dd className="mt-1 text-sm font-semibold">
                  {formatPrice(totals.deposit, { free: "Sans caution" })}
                </dd>
              </div>
            </dl>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/suivi?ref=${encodeURIComponent(result.reference)}&cle=${result.token}`}
                className="inline-flex h-11 items-center gap-2 rounded-field bg-azur-600 px-5 text-[0.9375rem] font-semibold text-white transition-colors hover:bg-azur-700"
              >
                <Icon name="Search" className="size-4" />
                Suivre ma demande
              </Link>
              <Link
                href="/services/salle-des-fetes"
                className="inline-flex h-11 items-center gap-2 rounded-field border border-azur-600/30 px-5 text-[0.9375rem] font-semibold text-azur-700 transition-colors hover:bg-azur-50 dark:text-azur-200 dark:hover:bg-azur-900/40"
              >
                <Icon name="PartyPopper" className="size-4" />
                Réserver une salle
              </Link>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  const currentIndex = STEPS.findIndex((entry) => entry.key === step);

  const stepValid =
    step === "periode"
      ? periodValid
      : step === "materiel"
        ? cartLines.length > 0
        : step === "details"
          ? form.purpose.trim().length >= 3 &&
            form.applicantName.trim().length >= 2 &&
            /\S+@\S+\.\S+/.test(form.applicantEmail) &&
            form.applicantPhone.trim().length >= 6
          : form.acceptRules && form.consentRgpd;

  return (
    <div>
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
      {step === "periode" ? (
        <div className="space-y-6">
          <div className="grid gap-5 sm:grid-cols-3">
            <Field
              label="Retrait du matériel"
              htmlFor="pickup"
              required
              hint={`Au moins ${MIN_NOTICE_DAYS} jours après la demande.`}
            >
              <Input
                id="pickup"
                type="date"
                value={pickupDate}
                min={toISODate(addDays(new Date(), MIN_NOTICE_DAYS))}
                onChange={(event) => {
                  setPickupDate(event.target.value);
                  if (event.target.value > returnDate) setReturnDate(event.target.value);
                }}
                required
              />
            </Field>
            <Field
              label="Restitution"
              htmlFor="return"
              required
              hint={`Durée maximale : ${MAX_LOAN_DAYS} jours.`}
            >
              <Input
                id="return"
                type="date"
                value={returnDate}
                min={pickupDate}
                max={toISODate(addDays(fromISODate(pickupDate), MAX_LOAN_DAYS - 1))}
                onChange={(event) => setReturnDate(event.target.value)}
                required
              />
            </Field>
            <Field
              label="Date de la manifestation"
              htmlFor="eventDate"
              hint="Si elle diffère de la période d'emprunt."
            >
              <Input
                id="eventDate"
                type="date"
                value={eventDate}
                onChange={(event) => setEventDate(event.target.value)}
              />
            </Field>
          </div>

          {duration > 0 ? (
            <Notice tone={duration > MAX_LOAN_DAYS ? "attention" : "info"}>
              Durée d'emprunt : <strong>{duration} jour{duration > 1 ? "s" : ""}</strong>
              {duration > MAX_LOAN_DAYS
                ? ` — au-delà de ${MAX_LOAN_DAYS} jours, contactez la mairie pour un accord particulier.`
                : "."}
            </Notice>
          ) : null}

          <Field
            label="À quel titre empruntez-vous ?"
            required
            hint="Certains matériels sont réservés aux associations et aux organisateurs de manifestations."
          >
            <div className="grid gap-2.5 sm:grid-cols-2">
              {AUDIENCES.filter((entry) => entry !== "COMMUNE").map((entry) => (
                <RadioCard
                  key={entry}
                  name="audience"
                  value={entry}
                  checked={audience === entry}
                  onChange={() => setAudience(entry)}
                  label={AUDIENCE_LABELS[entry]}
                  description={AUDIENCE_HINTS[entry]}
                />
              ))}
            </div>
          </Field>
        </div>
      ) : null}

      {/* ---------------------------- Étape 2 ---------------------------- */}
      {step === "materiel" ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-[color:var(--texte-doux)]">
                Stock disponible du <strong>{formatDate(fromISODate(pickupDate))}</strong> au{" "}
                <strong>{formatDate(fromISODate(returnDate))}</strong>
              </p>
              {loadingStock ? (
                <span className="flex items-center gap-1.5 text-xs text-[color:var(--texte-doux)]">
                  <Icon name="Loader2" className="size-3.5 animate-spin" />
                  Vérification du stock…
                </span>
              ) : null}
            </div>

            <div className="mb-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setCategory("")}
                aria-pressed={category === ""}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors",
                  category === ""
                    ? "border-azur-600 bg-azur-600 text-white"
                    : "border-[color:var(--bordure)] hover:bg-[color:var(--surface-alt)]",
                )}
              >
                Tout le matériel
              </button>
              {categories.map((entry) => (
                <button
                  key={entry}
                  type="button"
                  onClick={() => setCategory(category === entry ? "" : entry)}
                  aria-pressed={category === entry}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors",
                    category === entry
                      ? "border-azur-600 bg-azur-600 text-white"
                      : "border-[color:var(--bordure)] hover:bg-[color:var(--surface-alt)]",
                  )}
                >
                  {labelOf(EQUIPMENT_CATEGORY_LABELS, entry)}
                </button>
              ))}
            </div>

            <ul className="space-y-3">
              {visibleItems.map((item) => {
                const available = stock[item.slug] ?? 0;
                const quantity = cart[item.slug] ?? 0;
                const blocked = item.reservedForAssociations && audience === "HABITANT";

                return (
                  <li key={item.slug}>
                    <Card
                      className={cn(
                        "flex gap-4 p-3.5",
                        quantity > 0 && "border-azur-400 bg-azur-50/50 dark:bg-azur-900/25",
                        (available === 0 || blocked) && "opacity-60",
                      )}
                    >
                      <Visual
                        source={item.image}
                        ratio="1/1"
                        className="size-20 shrink-0 rounded-field sm:size-24"
                        sizes="96px"
                      />
                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-display text-[0.9375rem] font-bold">{item.name}</p>
                            {item.description ? (
                              <p className="mt-0.5 text-xs leading-snug text-[color:var(--texte-doux)]">
                                {item.description}
                              </p>
                            ) : null}
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {available === 0 ? (
                              <Badge tone="danger" icon="PackageX">
                                Indisponible
                              </Badge>
                            ) : (
                              <Badge tone={available > item.quantityTotal / 2 ? "succes" : "attente"}>
                                {available} disponible{available > 1 ? "s" : ""}
                              </Badge>
                            )}
                            {item.depositCents > 0 ? (
                              <Badge tone="neutre" icon="Coins">
                                caution {formatPrice(item.depositCents)}
                              </Badge>
                            ) : null}
                            {item.requiresVehicle ? (
                              <Badge tone="neutre" icon="Truck">
                                véhicule requis
                              </Badge>
                            ) : null}
                          </div>
                        </div>

                        {blocked ? (
                          <p className="mt-3 text-xs font-medium text-dore-700 dark:text-dore-300">
                            Réservé aux associations et organisateurs de manifestations.
                          </p>
                        ) : (
                          <div className="mt-auto flex items-center gap-2 pt-3">
                            <label htmlFor={`qty-${item.slug}`} className="sr-only">
                              Quantité de {item.name}
                            </label>
                            <button
                              type="button"
                              onClick={() => setQuantity(item.slug, quantity - 1)}
                              disabled={quantity === 0}
                              className="flex size-9 items-center justify-center rounded-field border border-[color:var(--bordure)] transition-colors hover:bg-[color:var(--surface-alt)] disabled:opacity-40"
                            >
                              <Icon name="Minus" className="size-4" />
                              <span className="sr-only">Retirer une unité</span>
                            </button>
                            <input
                              id={`qty-${item.slug}`}
                              type="number"
                              min={0}
                              max={available}
                              value={quantity}
                              onChange={(event) => setQuantity(item.slug, Number(event.target.value))}
                              disabled={available === 0}
                              className="h-9 w-16 rounded-field border border-[color:var(--bordure)] bg-[color:var(--surface)] text-center text-sm tabular-nums focus:border-azur-500 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => setQuantity(item.slug, quantity + 1)}
                              disabled={quantity >= available}
                              className="flex size-9 items-center justify-center rounded-field border border-[color:var(--bordure)] transition-colors hover:bg-[color:var(--surface-alt)] disabled:opacity-40"
                            >
                              <Icon name="Plus" className="size-4" />
                              <span className="sr-only">Ajouter une unité</span>
                            </button>
                            <span className="text-xs text-[color:var(--texte-doux)]">
                              {item.unitLabel}
                              {quantity > 1 ? "s" : ""}
                            </span>
                          </div>
                        )}
                      </div>
                    </Card>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Panier */}
          <div>
            <Card className="overflow-hidden lg:sticky lg:top-32">
              <div className="border-b border-[color:var(--bordure)] bg-[color:var(--surface-alt)] px-4 py-3.5">
                <p className="flex items-center gap-2 font-display text-sm font-bold">
                  <Icon name="Boxes" className="size-4" />
                  Votre demande
                  {totals.pieces > 0 ? (
                    <Badge tone="azur" className="ml-auto">
                      {totals.pieces}
                    </Badge>
                  ) : null}
                </p>
              </div>

              {cartLines.length === 0 ? (
                <p className="p-5 text-sm text-[color:var(--texte-doux)]">
                  Ajoutez du matériel avec les boutons + pour composer votre demande.
                </p>
              ) : (
                <>
                  <ul className="divide-y divide-[color:var(--bordure)] text-sm">
                    {cartLines.map((line) => (
                      <li key={line.item.slug} className="flex items-start gap-3 px-4 py-3">
                        <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded bg-azur-100 text-xs font-bold text-azur-700 tabular-nums dark:bg-azur-900 dark:text-azur-200">
                          {line.quantity}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-medium">{line.item.name}</span>
                          {line.item.depositCents > 0 ? (
                            <span className="text-xs text-[color:var(--texte-doux)]">
                              caution {formatPrice(line.item.depositCents)}
                            </span>
                          ) : null}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuantity(line.item.slug, 0)}
                          className="shrink-0 text-[color:var(--texte-doux)] transition-colors hover:text-red-600"
                        >
                          <Icon name="Trash2" className="size-4" />
                          <span className="sr-only">Retirer {line.item.name}</span>
                        </button>
                      </li>
                    ))}
                  </ul>

                  <dl className="space-y-2 border-t border-[color:var(--bordure)] bg-[color:var(--surface-alt)] px-4 py-3.5 text-sm">
                    <div className="flex justify-between gap-3">
                      <dt className="text-[color:var(--texte-doux)]">Caution totale</dt>
                      <dd className="font-semibold tabular-nums">
                        {formatPrice(totals.deposit, { free: "Aucune" })}
                      </dd>
                    </div>
                    {totals.fee > 0 ? (
                      <div className="flex justify-between gap-3">
                        <dt className="text-[color:var(--texte-doux)]">Participation</dt>
                        <dd className="font-semibold tabular-nums">{formatPrice(totals.fee)}</dd>
                      </div>
                    ) : null}
                    {totals.needsVehicle ? (
                      <p className="flex items-start gap-2 pt-1 text-xs text-dore-700 dark:text-dore-300">
                        <Icon name="Truck" className="mt-0.5 size-3.5 shrink-0" />
                        Certains articles nécessitent un véhicule adapté pour le transport.
                      </p>
                    ) : null}
                  </dl>
                </>
              )}
            </Card>
          </div>
        </div>
      ) : null}

      {/* ---------------------------- Étape 3 ---------------------------- */}
      {step === "details" ? (
        <div className="space-y-5">
          <Field
            label="Usage prévu du matériel"
            htmlFor="purpose"
            required
            hint="Nom et nature de la manifestation, lieu d'installation."
          >
            <Input
              id="purpose"
              value={form.purpose}
              onChange={(event) => setForm({ ...form, purpose: event.target.value })}
              maxLength={300}
              required
            />
          </Field>

          <Field label="Association ou structure" htmlFor="organization">
            <Input
              id="organization"
              value={form.organizationName}
              onChange={(event) => setForm({ ...form, organizationName: event.target.value })}
              maxLength={160}
            />
          </Field>

          <hr className="border-t border-[color:var(--bordure)]" />

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Nom et prénom du responsable" htmlFor="loanName" required>
              <Input
                id="loanName"
                autoComplete="name"
                value={form.applicantName}
                onChange={(event) => setForm({ ...form, applicantName: event.target.value })}
                maxLength={120}
                required
              />
            </Field>
            <Field label="Adresse électronique" htmlFor="loanEmail" required>
              <Input
                id="loanEmail"
                type="email"
                autoComplete="email"
                value={form.applicantEmail}
                onChange={(event) => setForm({ ...form, applicantEmail: event.target.value })}
                maxLength={160}
                required
              />
            </Field>
            <Field label="Téléphone" htmlFor="loanPhone" required>
              <Input
                id="loanPhone"
                type="tel"
                autoComplete="tel"
                value={form.applicantPhone}
                onChange={(event) => setForm({ ...form, applicantPhone: event.target.value })}
                maxLength={30}
                required
              />
            </Field>
            <Field label="Adresse postale" htmlFor="loanAddress">
              <Input
                id="loanAddress"
                autoComplete="street-address"
                value={form.applicantAddress}
                onChange={(event) => setForm({ ...form, applicantAddress: event.target.value })}
                maxLength={200}
              />
            </Field>
          </div>

          <Field label="Transport du matériel" required>
            <div className="grid gap-2.5 sm:grid-cols-2">
              <RadioCard
                name="transport"
                value="RETRAIT"
                checked={form.transport === "RETRAIT"}
                onChange={() => setForm({ ...form, transport: "RETRAIT" })}
                label="Je viens chercher le matériel"
                description="Retrait à l'atelier des services techniques, du lundi au vendredi de 8h à 12h."
              />
              <RadioCard
                name="transport"
                value="LIVRAISON_DEMANDEE"
                checked={form.transport === "LIVRAISON_DEMANDEE"}
                onChange={() => setForm({ ...form, transport: "LIVRAISON_DEMANDEE" })}
                label="Je demande une livraison"
                description="Selon la disponibilité des agents ; réponse au cas par cas."
              />
            </div>
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
                {
                  label: "Période d'emprunt",
                  value: `du ${formatDate(fromISODate(pickupDate))} au ${formatDate(fromISODate(returnDate))} (${duration} jour${duration > 1 ? "s" : ""})`,
                },
                {
                  label: "Date de la manifestation",
                  value: eventDate ? formatDate(fromISODate(eventDate)) : "identique à la période",
                },
                { label: "Situation", value: audience ? AUDIENCE_LABELS[audience] : "—" },
                { label: "Usage", value: form.purpose || "—" },
                { label: "Structure", value: form.organizationName || "—" },
                { label: "Responsable", value: form.applicantName },
                { label: "Contact", value: `${form.applicantEmail} — ${form.applicantPhone}` },
                {
                  label: "Transport",
                  value:
                    form.transport === "RETRAIT"
                      ? "Retrait par le demandeur"
                      : "Livraison demandée (sous réserve)",
                },
                { label: "Caution", value: formatPrice(totals.deposit, { free: "Aucune" }) },
              ].map((row) => (
                <div key={row.label} className="grid gap-1 px-5 py-3 sm:grid-cols-3">
                  <dt className="text-[color:var(--texte-doux)]">{row.label}</dt>
                  <dd className="font-medium sm:col-span-2">{row.value}</dd>
                </div>
              ))}
              <div className="px-5 py-3">
                <dt className="mb-2 text-[color:var(--texte-doux)]">Matériel demandé</dt>
                <dd>
                  <ul className="space-y-1">
                    {cartLines.map((line) => (
                      <li key={line.item.slug} className="flex justify-between gap-3">
                        <span>
                          {line.quantity} × {line.item.name}
                        </span>
                        {line.item.depositCents > 0 ? (
                          <span className="text-xs text-[color:var(--texte-doux)]">
                            caution {formatPrice(line.item.depositCents)}
                          </span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            </dl>
          </Card>

          <div className="space-y-2.5">
            <Checkbox
              checked={form.acceptRules}
              onChange={(event) => setForm({ ...form, acceptRules: event.target.checked })}
              required
              label="Je m'engage à restituer le matériel en bon état, nettoyé, à la date convenue"
              description="Le matériel détérioré ou non restitué est facturé au demandeur. Une attestation d'assurance responsabilité civile est exigée au retrait."
            />
            <Checkbox
              checked={form.consentRgpd}
              onChange={(event) => setForm({ ...form, consentRgpd: event.target.checked })}
              required
              label="J'accepte que mes informations soient utilisées pour instruire ce prêt"
              description="Elles sont conservées trois ans."
            />
          </div>

          <Notice tone="info" title="Ce dépôt ne vaut pas accord">
            Les services techniques vérifient la disponibilité effective et vous confirment le prêt
            ainsi que les modalités de retrait.
          </Notice>
        </div>
      ) : null}

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
          {step === "periode"
            ? "Choisissez des dates valides et indiquez votre situation."
            : step === "materiel"
              ? "Sélectionnez au moins un matériel."
              : "Complétez les champs obligatoires."}
        </p>
      ) : null}
    </div>
  );
}
