"use server";

import { redirect } from "next/navigation";

import { login, logout } from "@/lib/auth";

export type LoginState = { error?: string } | null;

/** Traitement du formulaire de connexion au back-office. */
export async function connexionAction(
  _previous: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("motdepasse") ?? "");
  const next = String(formData.get("suite") ?? "/admin");

  if (!email || !password) {
    return { error: "Renseignez votre adresse et votre mot de passe." };
  }

  const result = await login(email, password);
  if (!result.ok) return { error: result.error };

  // On n'accepte qu'une redirection interne, pour éviter toute redirection
  // ouverte vers un site extérieur.
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/admin");
}

export async function deconnexionAction(): Promise<void> {
  await logout();
  redirect("/connexion");
}
