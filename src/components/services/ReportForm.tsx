"use client";

import Link from "next/link";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Checkbox, Field, Input, Notice, Textarea } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { Card } from "@/components/ui/layout";
import {
  SIGNALEMENT_CATEGORIES,
  SIGNALEMENT_CATEGORY_LABELS,
  type SignalementCategory,
} from "@/lib/enums";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: Record<SignalementCategory, string> = {
  VOIRIE: "Hammer",
  ECLAIRAGE: "Lightbulb",
  PROPRETE: "Trash2",
  ESPACES_VERTS: "Trees",
  EAU: "Droplets",
  BATIMENT: "Building2",
  ANIMAUX: "Dog",
  AUTRE: "CircleHelp",
};

/** Cadre géographique approximatif de la commune, pour le placement du repère. */
const BOUNDS = { minLat: 45.8755, maxLat: 45.8925, minLng: 4.6075, maxLng: 4.6345 };

/**
 * Formulaire de signalement dans l'espace public.
 *
 * Trois apports par rapport à un simple courriel : la catégorie oriente
 * directement le signalement vers le bon service, la photographie évite un
 * aller-retour de précisions, et la localisation sur un plan supprime les
 * descriptions approximatives (« vers le virage après l'école »).
 */
export function ReportForm() {
  const [category, setCategory] = useState<SignalementCategory | "">("");
  const [point, setPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [photo, setPhoto] = useState<{ id: string; url: string; name: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [geoState, setGeoState] = useState<"repos" | "recherche" | "refus">("repos");
  const [state, setState] = useState<"repos" | "envoi" | "succes">("repos");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ reference: string; token: string } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    subject: "",
    message: "",
    locationLabel: "",
    name: "",
    email: "",
    phone: "",
    consentRgpd: false,
  });

  const upload = async (file: File) => {
    setUploadError(null);
    setUploading(true);
    try {
      const body = new FormData();
      body.append("fichier", file);
      body.append("dossier", "signalements");
      body.append("alt", `Photographie du signalement : ${form.subject || "espace public"}`);

      const response = await fetch("/api/televersement", { method: "POST", body });
      const data = (await response.json()) as
        | { ok: true; mediaId: string; url: string }
        | { ok: false; error: string };

      if (!data.ok) {
        setUploadError(data.error);
        return;
      }
      setPhoto({ id: data.mediaId, url: data.url, name: file.name });
    } catch {
      setUploadError("L'envoi de la photographie a échoué. Vous pouvez continuer sans photo.");
    } finally {
      setUploading(false);
    }
  };

  const locate = () => {
    if (!navigator.geolocation) {
      setGeoState("refus");
      return;
    }
    setGeoState("recherche");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPoint({ lat: position.coords.latitude, lng: position.coords.longitude });
        setGeoState("repos");
      },
      () => setGeoState("refus"),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const pickOnMap = (event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    setPoint({
      lat: BOUNDS.maxLat - y * (BOUNDS.maxLat - BOUNDS.minLat),
      lng: BOUNDS.minLng + x * (BOUNDS.maxLng - BOUNDS.minLng),
    });
  };

  const markerPosition = point
    ? {
        left: `${((point.lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * 100}%`,
        top: `${((BOUNDS.maxLat - point.lat) / (BOUNDS.maxLat - BOUNDS.minLat)) * 100}%`,
      }
    : null;

  const insideBounds =
    point &&
    point.lat >= BOUNDS.minLat &&
    point.lat <= BOUNDS.maxLat &&
    point.lng >= BOUNDS.minLng &&
    point.lng <= BOUNDS.maxLng;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setState("envoi");

    try {
      const response = await fetch("/api/demandes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "SIGNALEMENT",
          category: category || "AUTRE",
          subject: form.subject,
          message: form.message,
          name: form.name,
          email: form.email,
          phone: form.phone || undefined,
          lat: point?.lat,
          lng: point?.lng,
          locationLabel: form.locationLabel || undefined,
          photoId: photo?.id,
          consentRgpd: form.consentRgpd,
        }),
      });
      const data = (await response.json()) as
        | { ok: true; reference: string; token: string }
        | { ok: false; message: string };

      if (!data.ok) {
        setError(data.message);
        setState("repos");
        return;
      }
      setResult({ reference: data.reference, token: data.token });
      setState("succes");
    } catch {
      setError("L'envoi a échoué. Vérifiez votre connexion et réessayez.");
      setState("repos");
    }
  };

  if (state === "succes" && result) {
    return (
      <Card className="p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200">
            <Icon name="CircleCheck" className="size-7" />
          </span>
          <div className="min-w-0">
            <h2 className="font-display text-2xl font-bold text-azur-800 dark:text-white">
              Merci, votre signalement est transmis
            </h2>
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-[color:var(--texte-doux)]">
              Les services techniques en ont été informés. La prise en compte intervient sous
              48 heures ouvrées ; le délai de résolution dépend de la nature de l'intervention et,
              parfois, du gestionnaire compétent (route départementale, réseau d'un concessionnaire).
            </p>

            <dl className="mt-5 rounded-card bg-[color:var(--surface-alt)] p-5">
              <dt className="text-xs font-bold tracking-wide uppercase text-[color:var(--texte-doux)]">
                Référence de suivi
              </dt>
              <dd className="mt-1 font-display text-2xl font-bold text-azur-700 tabular-nums dark:text-azur-200">
                {result.reference}
              </dd>
            </dl>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/suivi?ref=${encodeURIComponent(result.reference)}&cle=${result.token}`}
                className="inline-flex h-11 items-center gap-2 rounded-field bg-azur-600 px-5 text-[0.9375rem] font-semibold text-white transition-colors hover:bg-azur-700"
              >
                <Icon name="Search" className="size-4" />
                Suivre mon signalement
              </Link>
              <button
                type="button"
                onClick={() => {
                  setState("repos");
                  setResult(null);
                  setCategory("");
                  setPoint(null);
                  setPhoto(null);
                  setForm({
                    subject: "",
                    message: "",
                    locationLabel: "",
                    name: form.name,
                    email: form.email,
                    phone: form.phone,
                    consentRgpd: false,
                  });
                }}
                className="inline-flex h-11 items-center gap-2 rounded-field border border-azur-600/30 px-5 text-[0.9375rem] font-semibold text-azur-700 transition-colors hover:bg-azur-50 dark:text-azur-200 dark:hover:bg-azur-900/40"
              >
                <Icon name="Plus" className="size-4" />
                Signaler autre chose
              </button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  const valid =
    Boolean(category) &&
    form.subject.trim().length >= 3 &&
    form.message.trim().length >= 10 &&
    form.name.trim().length >= 2 &&
    /\S+@\S+\.\S+/.test(form.email) &&
    form.consentRgpd;

  return (
    <form onSubmit={submit} className="space-y-6" noValidate>
      {error ? (
        <Notice tone="erreur" title="Le signalement n'a pas pu être envoyé">
          {error}
        </Notice>
      ) : null}

      {/* Catégorie */}
      <Field label="De quoi s'agit-il ?" required>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {SIGNALEMENT_CATEGORIES.map((entry) => (
            <label
              key={entry}
              className={cn(
                "flex cursor-pointer flex-col items-center gap-2 rounded-card border p-3.5 text-center transition-all duration-200",
                category === entry
                  ? "border-azur-500 bg-azur-50 ring-2 ring-azur-500/20 dark:bg-azur-900/35"
                  : "border-[color:var(--bordure)] hover:border-azur-300 hover:bg-[color:var(--surface-alt)]",
              )}
            >
              <input
                type="radio"
                name="categorie"
                value={entry}
                checked={category === entry}
                onChange={() => setCategory(entry)}
                className="sr-only"
              />
              <Icon
                name={CATEGORY_ICONS[entry]}
                className={cn(
                  "size-6",
                  category === entry
                    ? "text-azur-600 dark:text-azur-200"
                    : "text-[color:var(--texte-doux)]",
                )}
              />
              <span className="text-xs leading-snug font-semibold">
                {SIGNALEMENT_CATEGORY_LABELS[entry]}
              </span>
            </label>
          ))}
        </div>
      </Field>

      <Field
        label="Résumé en quelques mots"
        htmlFor="subject"
        required
        hint="Exemple : « Lampadaire éteint route des Mines »."
      >
        <Input
          id="subject"
          value={form.subject}
          onChange={(event) => setForm({ ...form, subject: event.target.value })}
          maxLength={180}
          required
        />
      </Field>

      <Field
        label="Description"
        htmlFor="message"
        required
        hint="Depuis quand ? Quelle gêne ou quel danger ? Un détail précis fait gagner du temps aux agents."
      >
        <Textarea
          id="message"
          rows={5}
          value={form.message}
          onChange={(event) => setForm({ ...form, message: event.target.value })}
          minLength={10}
          maxLength={4000}
          required
        />
      </Field>

      {/* Localisation */}
      <Field
        label="Où se situe le problème ?"
        hint="Cliquez sur le plan, utilisez votre position, ou décrivez le lieu par écrit."
      >
        <div className="space-y-3">
          <Card className="overflow-hidden">
            <button
              type="button"
              onClick={pickOnMap}
              className="relative block aspect-4/3 w-full cursor-crosshair bg-linear-160 from-malachite-50 to-dore-50 sm:aspect-video dark:from-azur-950 dark:to-azur-900"
            >
              <svg aria-hidden className="absolute inset-0 h-full w-full" viewBox="0 0 100 60">
                <defs>
                  <pattern id="trame-signalement" width="6" height="6" patternUnits="userSpaceOnUse">
                    <path d="M6 0H0v6" fill="none" stroke="currentColor" strokeWidth="0.12" />
                  </pattern>
                </defs>
                <rect
                  width="100"
                  height="60"
                  fill="url(#trame-signalement)"
                  className="text-azur-500/25"
                />
                <path
                  d="M4 50 Q30 36 50 32 T97 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  className="text-dore-400/60"
                />
                <path
                  d="M12 6 Q28 28 44 36 T90 55"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.1"
                  strokeLinecap="round"
                  className="text-azur-400/45"
                />
                <circle cx="50" cy="31" r="2.2" className="fill-azur-600/70" />
                <text
                  x="50"
                  y="27"
                  textAnchor="middle"
                  className="fill-azur-800 text-[3px] font-semibold dark:fill-azur-100"
                >
                  Le bourg
                </text>
              </svg>

              {markerPosition && insideBounds ? (
                <span
                  aria-hidden
                  style={markerPosition}
                  className="absolute -translate-x-1/2 -translate-y-full"
                >
                  <span className="flex size-8 items-center justify-center rounded-full bg-red-600 text-white shadow-relief ring-2 ring-white">
                    <Icon name="MapPin" className="size-4" />
                  </span>
                  <span
                    aria-hidden
                    className="mx-auto -mt-1 block size-2 rotate-45 bg-red-600"
                  />
                </span>
              ) : null}

              <span className="absolute inset-x-0 bottom-0 bg-azur-950/55 px-3 py-2 text-xs font-medium text-white">
                {point
                  ? insideBounds
                    ? "Repère placé — cliquez de nouveau pour le déplacer"
                    : "Position hors du territoire communal : précisez le lieu par écrit"
                  : "Cliquez sur le plan pour placer un repère"}
              </span>
            </button>
          </Card>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="contour"
              size="sm"
              onClick={locate}
              disabled={geoState === "recherche"}
              icon={geoState === "recherche" ? "Loader2" : "Locate"}
              className={geoState === "recherche" ? "[&_svg]:animate-spin" : undefined}
            >
              {geoState === "recherche" ? "Localisation…" : "Utiliser ma position"}
            </Button>
            {point ? (
              <Button
                type="button"
                variant="discret"
                size="sm"
                onClick={() => setPoint(null)}
                icon="X"
              >
                Retirer le repère
              </Button>
            ) : null}
          </div>

          {geoState === "refus" ? (
            <p className="text-xs text-[color:var(--texte-doux)]">
              La géolocalisation n'est pas disponible ou a été refusée. Placez le repère sur le plan
              ou décrivez le lieu ci-dessous.
            </p>
          ) : null}

          <Input
            id="locationLabel"
            value={form.locationLabel}
            onChange={(event) => setForm({ ...form, locationLabel: event.target.value })}
            placeholder="Adresse ou point de repère : « 12 route des Mines », « face à l'école »…"
            maxLength={200}
          />
        </div>
      </Field>

      {/* Photographie */}
      <Field
        label="Photographie"
        hint="Une image vaut mieux qu'une longue description. Formats JPEG, PNG ou WebP, 6 Mo maximum."
      >
        {photo ? (
          <div className="flex items-center gap-4 rounded-card border border-[color:var(--bordure)] p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.url}
              alt="Aperçu de la photographie jointe"
              className="size-20 rounded-field object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{photo.name}</p>
              <p className="text-xs text-[color:var(--texte-doux)]">Photographie jointe</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setPhoto(null);
                if (fileInput.current) fileInput.current.value = "";
              }}
              className="shrink-0 rounded-field border border-[color:var(--bordure)] p-2 transition-colors hover:bg-[color:var(--surface-alt)]"
            >
              <Icon name="Trash2" className="size-4" />
              <span className="sr-only">Retirer la photographie</span>
            </button>
          </div>
        ) : (
          <div>
            <label
              className={cn(
                "flex cursor-pointer flex-col items-center gap-2 rounded-card border-2 border-dashed border-[color:var(--bordure)] px-4 py-8 text-center transition-colors hover:border-azur-400 hover:bg-[color:var(--surface-alt)]",
                uploading && "pointer-events-none opacity-60",
              )}
            >
              <input
                ref={fileInput}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                capture="environment"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void upload(file);
                }}
                className="sr-only"
              />
              <Icon
                name={uploading ? "Loader2" : "Camera"}
                className={cn("size-7 text-azur-500", uploading && "animate-spin")}
              />
              <span className="text-sm font-semibold">
                {uploading ? "Envoi de la photographie…" : "Ajouter une photographie"}
              </span>
              <span className="text-xs text-[color:var(--texte-doux)]">
                Prenez la photo directement ou choisissez un fichier
              </span>
            </label>
            {uploadError ? (
              <p role="alert" className="mt-2 flex items-start gap-1.5 text-xs text-red-700 dark:text-red-400">
                <Icon name="CircleAlert" className="mt-px size-3.5 shrink-0" />
                {uploadError}
              </p>
            ) : null}
          </div>
        )}
      </Field>

      <hr className="border-t border-[color:var(--bordure)]" />

      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Nom et prénom" htmlFor="reportName" required>
          <Input
            id="reportName"
            autoComplete="name"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            maxLength={120}
            required
          />
        </Field>
        <Field label="Adresse électronique" htmlFor="reportEmail" required hint="Pour le suivi.">
          <Input
            id="reportEmail"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            maxLength={160}
            required
          />
        </Field>
        <Field label="Téléphone" htmlFor="reportPhone" hint="Si un agent doit vous joindre.">
          <Input
            id="reportPhone"
            type="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={(event) => setForm({ ...form, phone: event.target.value })}
            maxLength={30}
          />
        </Field>
      </div>

      <Checkbox
        checked={form.consentRgpd}
        onChange={(event) => setForm({ ...form, consentRgpd: event.target.checked })}
        required
        label="J'accepte que ces informations soient transmises aux services concernés"
        description="Elles sont conservées deux ans après la résolution du signalement. La photographie ne doit pas comporter de personne identifiable ni de plaque d'immatriculation lisible."
      />

      <div className="flex flex-wrap items-center gap-4">
        <Button
          type="submit"
          size="lg"
          disabled={!valid || state === "envoi"}
          icon={state === "envoi" ? "Loader2" : "Send"}
          className={state === "envoi" ? "[&_svg]:animate-spin" : undefined}
        >
          {state === "envoi" ? "Envoi en cours…" : "Envoyer mon signalement"}
        </Button>
        <p className="text-xs text-[color:var(--texte-doux)]">
          Prise en compte sous 48 heures ouvrées.
        </p>
      </div>
    </form>
  );
}
