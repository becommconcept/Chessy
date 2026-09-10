"use client";

import { useActionState, useState } from "react";

import { connexionAction, type LoginState } from "@/app/admin/actions-auth";
import { Button } from "@/components/ui/Button";
import { Field, Input, Notice } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(connexionAction, null);
  const [visible, setVisible] = useState(false);

  return (
    <form action={formAction} className="mt-7 space-y-5">
      <input type="hidden" name="suite" value={next ?? "/admin"} />

      {state?.error ? (
        <Notice tone="erreur" title="Connexion impossible">
          {state.error}
        </Notice>
      ) : null}

      <Field label="Adresse électronique" htmlFor="email" required>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          autoFocus
          placeholder="prenom.nom@chessy69.fr"
        />
      </Field>

      <Field label="Mot de passe" htmlFor="motdepasse" required>
        <div className="relative">
          <Input
            id="motdepasse"
            name="motdepasse"
            type={visible ? "text" : "password"}
            autoComplete="current-password"
            required
            className="pr-11"
          />
          <button
            type="button"
            onClick={() => setVisible((value) => !value)}
            className="absolute top-1/2 right-1.5 flex size-9 -translate-y-1/2 items-center justify-center rounded-field text-[color:var(--texte-doux)] transition-colors hover:bg-[color:var(--surface-alt)]"
          >
            <Icon name={visible ? "EyeOff" : "Eye"} className="size-4.5" />
            <span className="sr-only">
              {visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            </span>
          </button>
        </div>
      </Field>

      <Button
        type="submit"
        size="lg"
        fullWidth
        disabled={pending}
        icon={pending ? "Loader2" : "KeyRound"}
        className={pending ? "[&_svg]:animate-spin" : undefined}
      >
        {pending ? "Connexion…" : "Se connecter"}
      </Button>

      <p className="text-xs text-[color:var(--texte-doux)]">
        Mot de passe oublié ? Contactez l'administrateur du site, qui procédera à sa
        réinitialisation.
      </p>
    </form>
  );
}
