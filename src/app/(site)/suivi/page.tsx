import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumb } from "@/components/site/Breadcrumb";
import { PageHeader } from "@/components/site/PageHeader";
import { Icon } from "@/components/ui/Icon";
import { Notice } from "@/components/ui/Field";
import { Badge, Card, Container, Section } from "@/components/ui/layout";
import { trackByReference } from "@/lib/tracking";
import { cn, formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Suivre ma demande",
  description:
    "Consultez l'avancement de votre demande auprès de la mairie de Chessy-les-Mines à l'aide de votre référence de suivi.",
  robots: { index: false, follow: true },
};

type Props = { searchParams: Promise<{ ref?: string; cle?: string }> };

const TONES = {
  attente: "bg-amber-100 text-amber-900 dark:bg-amber-900/50 dark:text-amber-100",
  encours: "bg-azur-100 text-azur-800 dark:bg-azur-900/60 dark:text-azur-100",
  succes: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/50 dark:text-emerald-100",
  refus: "bg-red-100 text-red-900 dark:bg-red-900/50 dark:text-red-100",
} as const;

const KIND_LABELS = {
  demande: { label: "Demande", icon: "Mail" },
  salle: { label: "Réservation de salle", icon: "PartyPopper" },
  materiel: { label: "Prêt de matériel", icon: "Package" },
} as const;

export default async function SuiviPage({ searchParams }: Props) {
  const { ref, cle } = await searchParams;
  const item = ref && cle ? await trackByReference(ref, cle) : null;
  const searched = Boolean(ref && cle);

  return (
    <>
      <Breadcrumb items={[{ label: "Suivre ma demande" }]} />
      <PageHeader
        eyebrow="Service en ligne"
        icon="Search"
        title="Suivre ma demande"
        excerpt="Saisissez la référence et la clé de suivi reçues par courriel pour consulter l'avancement de votre dossier."
      />

      <Section>
        <Container size="lecture">
          <Card className="p-5 sm:p-7">
            <form method="get" className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="ref" className="text-sm font-semibold">
                    Référence de suivi
                    <span className="ml-0.5 text-red-600" aria-hidden>
                      *
                    </span>
                  </label>
                  <p id="ref-aide" className="text-xs text-[color:var(--texte-doux)]">
                    Par exemple SDF-2026-0042 ou SIG-2026-0117.
                  </p>
                  <input
                    id="ref"
                    name="ref"
                    defaultValue={ref ?? ""}
                    required
                    aria-describedby="ref-aide"
                    placeholder="SDF-2026-0042"
                    className="h-11 w-full rounded-field border border-[color:var(--bordure)] bg-[color:var(--surface)] px-3.5 font-mono text-[0.9375rem] uppercase focus:border-azur-500 focus:ring-4 focus:ring-azur-500/12 focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="cle" className="text-sm font-semibold">
                    Clé de suivi
                    <span className="ml-0.5 text-red-600" aria-hidden>
                      *
                    </span>
                  </label>
                  <p id="cle-aide" className="text-xs text-[color:var(--texte-doux)]">
                    Chaîne de lettres et chiffres figurant dans le courriel.
                  </p>
                  <input
                    id="cle"
                    name="cle"
                    defaultValue={cle ?? ""}
                    required
                    aria-describedby="cle-aide"
                    className="h-11 w-full rounded-field border border-[color:var(--bordure)] bg-[color:var(--surface)] px-3.5 font-mono text-[0.9375rem] focus:border-azur-500 focus:ring-4 focus:ring-azur-500/12 focus:outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="inline-flex h-11 items-center gap-2 rounded-field bg-azur-600 px-5 text-[0.9375rem] font-semibold text-white transition-colors hover:bg-azur-700"
              >
                <Icon name="Search" className="size-4" />
                Consulter ma demande
              </button>
            </form>
          </Card>

          {searched && !item ? (
            <Notice tone="attention" title="Demande introuvable" className="mt-6">
              Aucune demande ne correspond à cette référence et à cette clé. Vérifiez les deux
              valeurs telles qu'elles figurent dans le courriel d'accusé de réception. Si le doute
              persiste, contactez l'accueil de la mairie au 04 78 43 92 03 : nous retrouverons votre
              dossier.
            </Notice>
          ) : null}

          {item ? (
            <div className="mt-8 space-y-6">
              <Card className="overflow-hidden">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[color:var(--bordure)] bg-[color:var(--surface-alt)] p-5">
                  <div className="min-w-0">
                    <Badge tone="neutre" icon={KIND_LABELS[item.kind].icon} className="mb-2">
                      {KIND_LABELS[item.kind].label}
                    </Badge>
                    <h2 className="font-display text-xl font-bold text-azur-800 dark:text-white">
                      {item.title}
                    </h2>
                    <p className="mt-1 text-sm text-[color:var(--texte-doux)]">{item.subtitle}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-bold tabular-nums">{item.reference}</p>
                    <span
                      className={cn(
                        "mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold",
                        TONES[item.tone],
                      )}
                    >
                      {item.statusLabel}
                    </span>
                  </div>
                </div>

                {/* Frise d'avancement */}
                <ol className="space-y-0 p-5">
                  {item.timeline.map((entry, index) => (
                    <li key={entry.label} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <span
                          className={cn(
                            "flex size-7 shrink-0 items-center justify-center rounded-full",
                            entry.done
                              ? entry.current && item.tone === "refus"
                                ? "bg-red-600 text-white"
                                : "bg-emerald-500 text-white"
                              : "border-2 border-[color:var(--bordure)] bg-[color:var(--surface)]",
                          )}
                        >
                          {entry.done ? (
                            <Icon
                              name={entry.current && item.tone === "refus" ? "X" : "Check"}
                              className="size-4"
                            />
                          ) : (
                            <span className="size-1.5 rounded-full bg-[color:var(--texte-doux)]/40" />
                          )}
                        </span>
                        {index < item.timeline.length - 1 ? (
                          <span
                            aria-hidden
                            className={cn(
                              "my-1 w-0.5 flex-1",
                              entry.done ? "bg-emerald-400" : "bg-[color:var(--bordure)]",
                            )}
                          />
                        ) : null}
                      </div>
                      <div className={cn("pb-6", index === item.timeline.length - 1 && "pb-0")}>
                        <p
                          className={cn(
                            "font-semibold",
                            !entry.done && "text-[color:var(--texte-doux)]",
                          )}
                        >
                          {entry.label}
                        </p>
                        {entry.date ? (
                          <p className="mt-0.5 text-xs text-[color:var(--texte-doux)]">
                            {formatDateTime(entry.date)}
                          </p>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ol>

                {item.decisionMessage ? (
                  <div className="border-t border-[color:var(--bordure)] bg-azur-50 p-5 dark:bg-azur-900/30">
                    <p className="flex items-center gap-2 text-xs font-bold tracking-wide uppercase text-azur-700 dark:text-azur-200">
                      <Icon name="MessageSquare" className="size-3.5" />
                      Message de la mairie
                    </p>
                    <p className="mt-2 text-sm leading-relaxed">{item.decisionMessage}</p>
                  </div>
                ) : null}

                <dl className="grid divide-y divide-[color:var(--bordure)] border-t border-[color:var(--bordure)] text-sm sm:grid-cols-2 sm:divide-y-0">
                  {item.facts.map((fact) => (
                    <div key={fact.label} className="px-5 py-3">
                      <dt className="text-xs font-semibold tracking-wide uppercase text-[color:var(--texte-doux)]">
                        {fact.label}
                      </dt>
                      <dd className="mt-1 font-medium">{fact.value}</dd>
                    </div>
                  ))}
                </dl>
              </Card>

              {item.messages && item.messages.length > 0 ? (
                <Card className="overflow-hidden">
                  <div className="border-b border-[color:var(--bordure)] bg-[color:var(--surface-alt)] px-5 py-3.5">
                    <p className="font-display text-sm font-bold">Échanges</p>
                  </div>
                  <ul className="divide-y divide-[color:var(--bordure)]">
                    {item.messages.map((message, index) => (
                      <li key={index} className="p-5">
                        <p className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-bold">
                            {message.author === "MAIRIE"
                              ? (message.authorName ?? "Mairie de Chessy-les-Mines")
                              : "Vous"}
                          </span>
                          <span className="text-[color:var(--texte-doux)]">
                            {formatDateTime(message.createdAt)}
                          </span>
                        </p>
                        <p className="mt-2 text-sm leading-relaxed">{message.body}</p>
                      </li>
                    ))}
                  </ul>
                </Card>
              ) : null}

              <div className="rounded-card border border-[color:var(--bordure)] bg-[color:var(--surface-alt)] p-5">
                <p className="font-display text-sm font-bold">Une question sur ce dossier ?</p>
                <p className="mt-1.5 text-sm text-[color:var(--texte-doux)]">
                  Contactez l'accueil de la mairie en indiquant votre référence{" "}
                  <strong>{item.reference}</strong> : votre interlocuteur retrouvera immédiatement
                  votre demande.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <a
                    href="tel:+33478439203"
                    className="inline-flex h-10 items-center gap-2 rounded-field bg-azur-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-azur-700"
                  >
                    <Icon name="Phone" className="size-4" />
                    04 78 43 92 03
                  </a>
                  <Link
                    href={`/contact?objet=Suivi%20de%20la%20demande%20${encodeURIComponent(item.reference)}`}
                    className="inline-flex h-10 items-center gap-2 rounded-field border border-azur-600/30 px-4 text-sm font-semibold text-azur-700 transition-colors hover:bg-azur-50 dark:text-azur-200 dark:hover:bg-azur-900/40"
                  >
                    <Icon name="Mail" className="size-4" />
                    Écrire à la mairie
                  </Link>
                </div>
              </div>
            </div>
          ) : null}

          {!searched ? (
            <div className="mt-8 rounded-card border border-[color:var(--bordure)] bg-[color:var(--surface-alt)] p-5">
              <p className="flex items-center gap-2 font-display text-sm font-bold">
                <Icon name="CircleHelp" className="size-4 text-dore-600 dark:text-dore-300" />
                Vous n'avez plus le courriel ?
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-[color:var(--texte-doux)]">
                La clé de suivi n'est pas récupérable en ligne, pour protéger vos données.
                Contactez l'accueil de la mairie au 04 78 43 92 03 en indiquant votre nom et la
                nature de votre demande : nous vous renseignerons directement.
              </p>
            </div>
          ) : null}
        </Container>
      </Section>
    </>
  );
}
