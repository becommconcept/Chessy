import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { LoginForm } from "@/components/admin/LoginForm";
import { LogoMark } from "@/components/site/Logo";
import { Icon } from "@/components/ui/Icon";
import { getSessionUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Connexion à l'espace mairie",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ suite?: string }> };

export default async function ConnexionPage({ searchParams }: Props) {
  const user = await getSessionUser();
  if (user) redirect("/admin");

  const { suite } = await searchParams;

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      {/* Colonne de présentation */}
      <div className="relative flex flex-1 flex-col justify-between overflow-hidden bg-azur-800 p-8 text-white lg:p-12 dark:bg-azur-950">
        <div aria-hidden className="motif-filons absolute inset-0" />

        <div className="relative">
          <Link href="/" className="inline-flex items-center gap-3">
            <LogoMark className="size-11" />
            <span>
              <span className="block font-display leading-tight font-bold">Chessy-les-Mines</span>
              <span className="block text-[0.6875rem] font-semibold tracking-[0.11em] uppercase text-dore-200">
                Espace mairie
              </span>
            </span>
          </Link>
        </div>

        <div className="relative my-12 max-w-lg">
          <h1 className="font-display text-3xl leading-tight font-bold lg:text-4xl">
            Le site de la commune, administré par la mairie
          </h1>
          <p className="mt-4 text-white/75">
            Modifiez les pages, publiez une actualité, traitez une réservation de salle ou un
            signalement : tout se fait ici, sans intervention technique.
          </p>

          <ul className="mt-8 space-y-3.5">
            {[
              {
                icon: "LayoutTemplate",
                title: "Pages et mise en page",
                text: "Ajoutez, réordonnez ou masquez les sections d'une page par glisser-déposer.",
              },
              {
                icon: "Image",
                title: "Médiathèque",
                text: "Téléversez vos photographies et vos PDF, réutilisables partout.",
              },
              {
                icon: "Inbox",
                title: "Demandes des habitants",
                text: "Réservations, prêts de matériel, signalements : instruits au même endroit.",
              },
            ].map((item) => (
              <li key={item.title} className="flex gap-3.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-field bg-white/12 text-dore-200">
                  <Icon name={item.icon} className="size-4.5" />
                </span>
                <span>
                  <span className="block text-sm font-semibold">{item.title}</span>
                  <span className="mt-0.5 block text-sm text-white/65">{item.text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-white/50">
          Accès réservé aux agents et élus habilités. Toutes les actions sont journalisées.
        </p>
      </div>

      {/* Formulaire */}
      <div className="flex flex-1 items-center justify-center bg-[color:var(--surface)] p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <h2 className="font-display text-2xl font-bold text-azur-800 dark:text-white">
            Connexion
          </h2>
          <p className="mt-2 text-sm text-[color:var(--texte-doux)]">
            Utilisez l'adresse professionnelle qui vous a été communiquée.
          </p>

          <Suspense
            fallback={<div className="mt-7 h-64 animate-pulse rounded-card bg-[color:var(--surface-alt)]" />}
          >
            <LoginForm next={suite} />
          </Suspense>

          <div className="mt-8 rounded-card border border-[color:var(--bordure)] bg-[color:var(--surface-alt)] p-4 text-xs leading-relaxed text-[color:var(--texte-doux)]">
            <p className="mb-1.5 flex items-center gap-1.5 font-semibold text-[color:var(--texte)]">
              <Icon name="Info" className="size-3.5" />
              Comptes de démonstration
            </p>
            <ul className="space-y-1">
              <li>
                <code className="font-mono">admin@chessy69.fr</code> — administrateur
              </li>
              <li>
                <code className="font-mono">communication@chessy69.fr</code> — éditeur
              </li>
              <li>
                <code className="font-mono">accueil@chessy69.fr</code> — agent d'accueil
              </li>
            </ul>
            <p className="mt-2">
              Mot de passe commun : <code className="font-mono font-semibold">chessy2026</code>. À
              modifier impérativement avant toute mise en production.
            </p>
          </div>

          <p className="mt-6 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-[color:var(--texte-doux)] transition-colors hover:text-azur-600 dark:hover:text-azur-200"
            >
              <Icon name="ArrowLeft" className="size-4" />
              Retour au site
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
