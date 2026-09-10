"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Checkbox, Field, Input, Notice, Select, Textarea } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { Card } from "@/components/ui/layout";
import { REQUEST_TYPE_LABELS, type RequestType } from "@/lib/enums";

type Result = { reference: string; token: string };

const TYPES: RequestType[] = ["CONTACT", "RENDEZ_VOUS", "SUGGESTION"];

const SUBJECT_SUGGESTIONS = [
  "État civil (acte, livret de famille)",
  "Urbanisme et travaux",
  "Service de l'eau",
  "Inscription scolaire, cantine, périscolaire",
  "Réservation de salle ou de matériel",
  "Vie associative et manifestations",
  "CCAS et action sociale",
  "Autre demande",
];

/**
 * Formulaire de contact, de rendez-vous ou de suggestion.
 *
 * L'objet et le type peuvent être pré-remplis par l'URL (`?type=…&objet=…`),
 * ce qui permet de placer partout dans le site des liens contextuels vers un
 * formulaire déjà orienté.
 */
export function ContactForm({
  defaultType = "CONTACT",
  defaultSubject = "",
}: {
  defaultType?: string;
  defaultSubject?: string;
}) {
  const params = useSearchParams();
  const [type, setType] = useState<string>(defaultType);
  const [subject, setSubject] = useState(defaultSubject);
  const [state, setState] = useState<"repos" | "envoi" | "succes">("repos");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    const urlType = params.get("type");
    const urlSubject = params.get("objet");
    if (urlType && TYPES.includes(urlType as RequestType)) setType(urlType);
    if (urlSubject) setSubject(urlSubject);
  }, [params]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setState("envoi");

    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/demandes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, type, consentRgpd: formData.get("consentRgpd") === "on" }),
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
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200">
            <Icon name="CircleCheck" className="size-6" />
          </span>
          <div className="min-w-0">
            <h3 className="font-display text-xl font-bold text-azur-800 dark:text-white">
              Votre demande est enregistrée
            </h3>
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-[color:var(--texte-doux)]">
              Nos services l'examinent. Vous recevez un accusé de réception par courriel et pouvez
              suivre son avancement à tout moment.
            </p>

            <dl className="mt-5 rounded-card bg-[color:var(--surface-alt)] p-4">
              <dt className="text-xs font-bold tracking-wide uppercase text-[color:var(--texte-doux)]">
                Référence de suivi
              </dt>
              <dd className="mt-1 font-display text-2xl font-bold text-azur-700 tabular-nums dark:text-azur-200">
                {result.reference}
              </dd>
              <dd className="mt-2 text-xs text-[color:var(--texte-doux)]">
                Conservez cette référence : elle vous permet de consulter l'état de votre demande.
              </dd>
            </dl>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href={`/suivi?ref=${encodeURIComponent(result.reference)}&cle=${result.token}`}
                className="inline-flex h-11 items-center gap-2 rounded-field bg-azur-600 px-5 text-[0.9375rem] font-semibold text-white transition-colors hover:bg-azur-700"
              >
                <Icon name="Search" className="size-4" />
                Suivre ma demande
              </Link>
              <button
                type="button"
                onClick={() => {
                  setState("repos");
                  setResult(null);
                  setSubject("");
                }}
                className="inline-flex h-11 items-center gap-2 rounded-field border border-azur-600/30 px-5 text-[0.9375rem] font-semibold text-azur-700 transition-colors hover:bg-azur-50 dark:text-azur-200 dark:hover:bg-azur-900/40"
              >
                Envoyer une autre demande
              </button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-5 sm:p-7">
      <form onSubmit={submit} className="space-y-5" noValidate>
        {error ? <Notice tone="erreur" title="La demande n'a pas pu être envoyée">{error}</Notice> : null}

        <Field label="Votre demande concerne" htmlFor="type" required>
          <div className="grid gap-2 sm:grid-cols-3">
            {TYPES.map((option) => (
              <label
                key={option}
                className="flex cursor-pointer items-center gap-2.5 rounded-field border border-[color:var(--bordure)] px-3.5 py-3 text-sm transition-colors hover:border-azur-300 has-checked:border-azur-500 has-checked:bg-azur-50/70 dark:has-checked:bg-azur-900/30"
              >
                <input
                  type="radio"
                  name="typeChoix"
                  value={option}
                  checked={type === option}
                  onChange={() => setType(option)}
                  className="size-4 shrink-0 accent-azur-600"
                />
                <span className="font-medium">{REQUEST_TYPE_LABELS[option]}</span>
              </label>
            ))}
          </div>
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Nom et prénom" htmlFor="name" required>
            <Input id="name" name="name" required autoComplete="name" maxLength={120} />
          </Field>
          <Field label="Adresse électronique" htmlFor="email" required hint="Pour vous répondre.">
            <Input id="email" name="email" type="email" required autoComplete="email" maxLength={160} />
          </Field>
          <Field label="Téléphone" htmlFor="phone" hint="Utile si votre demande nécessite un échange.">
            <Input id="phone" name="phone" type="tel" autoComplete="tel" maxLength={30} />
          </Field>
          <Field label="Adresse postale" htmlFor="address" hint="Si votre demande concerne un logement.">
            <Input id="address" name="address" autoComplete="street-address" maxLength={200} />
          </Field>
        </div>

        <Field label="Objet" htmlFor="subject" required>
          <Select
            id="subject"
            name="subject"
            required
            value={SUBJECT_SUGGESTIONS.includes(subject) ? subject : subject ? "__libre" : ""}
            onChange={(event) => setSubject(event.target.value === "__libre" ? " " : event.target.value)}
          >
            <option value="" disabled>
              Choisissez un objet…
            </option>
            {SUBJECT_SUGGESTIONS.map((suggestion) => (
              <option key={suggestion} value={suggestion}>
                {suggestion}
              </option>
            ))}
            <option value="__libre">Autre objet (à préciser)</option>
          </Select>
        </Field>

        {!SUBJECT_SUGGESTIONS.includes(subject) && subject !== "" ? (
          <Field label="Précisez l'objet" htmlFor="subjectLibre" required>
            <Input
              id="subjectLibre"
              name="subjectLibre"
              value={subject.trim()}
              onChange={(event) => setSubject(event.target.value)}
              required
              maxLength={180}
            />
          </Field>
        ) : null}

        <Field
          label="Votre message"
          htmlFor="message"
          required
          hint="Décrivez votre demande le plus précisément possible : cela nous évite de vous recontacter pour des précisions."
        >
          <Textarea id="message" name="message" required minLength={10} maxLength={4000} rows={7} />
        </Field>

        <Checkbox
          name="consentRgpd"
          required
          label="J'accepte que ces informations soient utilisées pour traiter ma demande"
          description="Elles ne sont transmises qu'aux services concernés et conservées deux ans. Vous pouvez demander leur rectification ou leur suppression à tout moment."
        />

        <div className="flex flex-wrap items-center gap-4">
          <Button
            type="submit"
            size="lg"
            disabled={state === "envoi"}
            icon={state === "envoi" ? "Loader2" : "Send"}
            className={state === "envoi" ? "[&_svg]:animate-spin" : undefined}
          >
            {state === "envoi" ? "Envoi en cours…" : "Envoyer ma demande"}
          </Button>
          <p className="text-xs text-[color:var(--texte-doux)]">
            Réponse sous 5 jours ouvrés en moyenne.
          </p>
        </div>

        <p className="border-t border-[color:var(--bordure)] pt-4 text-xs leading-relaxed text-[color:var(--texte-doux)]">
          Champs marqués d'une étoile obligatoires. Pour en savoir plus sur le traitement de vos
          données, consultez la page{" "}
          <Link href="/donnees-personnelles" className="underline hover:text-azur-600">
            Données personnelles
          </Link>
          .
        </p>
      </form>
    </Card>
  );
}
