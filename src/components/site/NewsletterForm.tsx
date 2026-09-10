"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

/**
 * Inscription à la lettre d'information.
 *
 * Le consentement est explicite et l'adresse n'est enregistrée qu'après
 * validation côté serveur. Aucune case n'est pré-cochée (exigence RGPD).
 */
export function NewsletterForm({ inverse = false }: { inverse?: boolean }) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<"repos" | "envoi" | "succes" | "erreur">("repos");
  const [message, setMessage] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!consent) {
      setState("erreur");
      setMessage("Merci de cocher la case d'accord avant de valider.");
      return;
    }

    setState("envoi");
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await response.json()) as { ok: boolean; message: string };
      setState(data.ok ? "succes" : "erreur");
      setMessage(data.message);
      if (data.ok) setEmail("");
    } catch {
      setState("erreur");
      setMessage("L'inscription n'a pas pu aboutir. Merci de réessayer dans un instant.");
    }
  };

  if (state === "succes") {
    return (
      <p
        role="status"
        className={cn(
          "flex items-start gap-2.5 rounded-card p-4 text-sm",
          inverse ? "bg-white/10 text-white" : "bg-emerald-50 text-emerald-900 dark:bg-emerald-900/35 dark:text-emerald-50",
        )}
      >
        <Icon name="CircleCheck" className="mt-0.5 size-5 shrink-0" />
        {message}
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="flex-1">
          <label htmlFor="newsletter-email" className="sr-only">
            Votre adresse électronique
          </label>
          <input
            id="newsletter-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="prenom.nom@exemple.fr"
            aria-invalid={state === "erreur" || undefined}
            aria-describedby="newsletter-aide"
            className={cn(
              "h-11 w-full rounded-field px-3.5 text-[0.9375rem] transition-shadow focus:outline-none focus:ring-4",
              inverse
                ? "bg-white/10 text-white ring-1 ring-inset ring-white/25 placeholder:text-white/45 focus:ring-dore-400/40"
                : "border border-[color:var(--bordure)] bg-[color:var(--surface)] focus:border-azur-500 focus:ring-azur-500/12",
            )}
          />
        </div>
        <Button
          type="submit"
          variant={inverse ? "secondaire" : "principal"}
          disabled={state === "envoi"}
          icon={state === "envoi" ? "Loader2" : "Send"}
          className={state === "envoi" ? "[&_svg]:animate-spin" : undefined}
        >
          {state === "envoi" ? "Envoi…" : "Je m'inscris"}
        </Button>
      </div>

      <label
        className={cn(
          "flex cursor-pointer items-start gap-2.5 text-xs leading-relaxed",
          inverse ? "text-white/70" : "text-[color:var(--texte-doux)]",
        )}
      >
        <input
          type="checkbox"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
          className="mt-0.5 size-4 shrink-0 accent-dore-500"
        />
        <span id="newsletter-aide">
          J'accepte de recevoir la lettre d'information de la commune. Mon adresse ne sera utilisée
          que pour cet envoi et ne sera jamais cédée.{" "}
          <Link
            href="/donnees-personnelles"
            className={cn("underline", inverse ? "hover:text-white" : "hover:text-azur-600")}
          >
            En savoir plus
          </Link>
        </span>
      </label>

      {state === "erreur" ? (
        <p
          role="alert"
          className={cn(
            "flex items-start gap-2 text-xs font-medium",
            inverse ? "text-dore-200" : "text-red-700 dark:text-red-400",
          )}
        >
          <Icon name="CircleAlert" className="mt-px size-3.5 shrink-0" />
          {message}
        </p>
      ) : null}
    </form>
  );
}
