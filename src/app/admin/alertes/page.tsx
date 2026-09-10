import { basculerAlerte, enregistrerAlerte, supprimerAlerte } from "@/app/admin/actions-content";
import { RowActions } from "@/components/admin/RowActions";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { AdminEmpty, AdminHeader, Cell, DataTable, HelpNote, Panel, Pill } from "@/components/admin/ui";
import { ButtonLink } from "@/components/ui/Button";
import { Checkbox, Field, Input, Notice, Select, Textarea } from "@/components/ui/Field";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ALERT_LEVELS, ALERT_LEVEL_LABELS, labelOf } from "@/lib/enums";
import { formatDate, toISODate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Bandeaux d'alerte" };

type Props = { searchParams: Promise<{ modifier?: string; enregistre?: string }> };

export default async function AdminAlertesPage({ searchParams }: Props) {
  // Les contenus du site ne sont modifiables que par un administrateur ou un éditeur.
  await requireRole(["ADMIN", "EDITEUR"]);

  const { modifier, enregistre } = await searchParams;
  const editing = modifier && modifier !== "nouveau" ? modifier : null;

  const [alerts, current] = await Promise.all([
    prisma.alert.findMany({ orderBy: [{ active: "desc" }, { startAt: "desc" }] }),
    editing ? prisma.alert.findUnique({ where: { id: editing } }) : Promise.resolve(null),
  ]);

  const now = new Date();

  return (
    <>
      <AdminHeader
        title="Bandeaux d'alerte"
        description="Affichez un message en haut de toutes les pages du site : information, vigilance ou urgence."
        breadcrumb={[{ label: "Bandeaux d'alerte" }]}
        actions={
          <ButtonLink href="/admin/alertes?modifier=nouveau" size="sm" icon="Plus">
            Nouveau bandeau
          </ButtonLink>
        }
      />

      {enregistre ? (
        <Notice tone="succes" className="mb-5">
          Le bandeau a bien été enregistré.
        </Notice>
      ) : null}

      <HelpNote title="Choisir le bon niveau" icon="BellRing">
        <strong>Information</strong> (bleu) pour une nouveauté ou un rappel ;{" "}
        <strong>vigilance</strong> (doré) pour une gêne temporaire — travaux, coupure programmée ;{" "}
        <strong>urgence</strong> (rouge) pour un évènement qui demande une réaction immédiate. Une
        urgence ne peut pas être masquée par l'internaute : réservez-la aux situations qui le
        justifient, sous peine de perdre son attention.
      </HelpNote>

      {modifier ? (
        <Panel
          className="mt-5 mb-6"
          title={current ? "Modifier le bandeau" : "Nouveau bandeau"}
          actions={
            <ButtonLink href="/admin/alertes" variant="discret" size="sm" icon="X">
              Fermer
            </ButtonLink>
          }
        >
          <form action={enregistrerAlerte} className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
            <input type="hidden" name="id" value={current?.id ?? ""} />

            <Field label="Niveau" htmlFor="niveau" required>
              <Select id="niveau" name="niveau" defaultValue={current?.level ?? "INFO"}>
                {ALERT_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {ALERT_LEVEL_LABELS[level]}
                  </option>
                ))}
              </Select>
            </Field>

            <div className="flex items-end">
              <Checkbox
                name="active"
                defaultChecked={current?.active ?? true}
                label="Bandeau actif"
                description="Décochez pour préparer un message sans l'afficher."
                className="w-full"
              />
            </div>

            <Field label="Titre du message" htmlFor="titre" required className="sm:col-span-2">
              <Input
                id="titre"
                name="titre"
                defaultValue={current?.title ?? ""}
                required
                maxLength={180}
                placeholder="Coupure d'eau programmée mardi de 9h à 12h"
              />
            </Field>

            <Field
              label="Précision"
              htmlFor="message"
              hint="Une phrase complémentaire : secteur concerné, conduite à tenir."
              className="sm:col-span-2"
            >
              <Textarea id="message" name="message" rows={2} defaultValue={current?.message ?? ""} maxLength={400} />
            </Field>

            <Field label="Lien « en savoir plus »" htmlFor="lien">
              <Input
                id="lien"
                name="lien"
                defaultValue={current?.linkHref ?? ""}
                placeholder="/actualites/travaux-rue-du-bourg"
              />
            </Field>

            <Field label="Libellé du lien" htmlFor="libelleLien">
              <Input
                id="libelleLien"
                name="libelleLien"
                defaultValue={current?.linkLabel ?? ""}
                placeholder="Détail des travaux"
              />
            </Field>

            <Field label="Affiché à partir du" htmlFor="debut">
              <Input
                id="debut"
                name="debut"
                type="date"
                defaultValue={toISODate(current?.startAt ?? new Date())}
              />
            </Field>

            <Field label="Jusqu'au" htmlFor="fin" hint="Laissez vide pour un affichage sans limite.">
              <Input id="fin" name="fin" type="date" defaultValue={current?.endAt ? toISODate(current.endAt) : ""} />
            </Field>

            <div className="sm:col-span-2 border-t border-[color:var(--bordure)] pt-4">
              <SubmitButton icon="Save">Enregistrer le bandeau</SubmitButton>
            </div>
          </form>
        </Panel>
      ) : null}

      <Panel className="mt-5">
        {alerts.length === 0 ? (
          <AdminEmpty
            icon="BellRing"
            title="Aucun bandeau"
            description="Créez un bandeau pour diffuser une information importante."
          />
        ) : (
          <DataTable
            caption="Liste des bandeaux d'alerte"
            columns={[
              { label: "Message" },
              { label: "Niveau" },
              { label: "Période" },
              { label: "État" },
              { label: "Actions", sr: true },
            ]}
          >
            {alerts.map((alert) => {
              const expired = alert.endAt ? alert.endAt < now : false;
              const future = alert.startAt > now;
              return (
                <tr key={alert.id} className="transition-colors hover:bg-[color:var(--surface-alt)]">
                  <Cell header>
                    <span className="block font-semibold">{alert.title}</span>
                    {alert.message ? (
                      <span className="mt-0.5 block text-xs text-[color:var(--texte-doux)]">
                        {alert.message}
                      </span>
                    ) : null}
                  </Cell>
                  <Cell>
                    <Pill
                      tone={
                        alert.level === "URGENCE" ? "refus" : alert.level === "VIGILANCE" ? "attente" : "encours"
                      }
                    >
                      {labelOf(ALERT_LEVEL_LABELS, alert.level)}
                    </Pill>
                  </Cell>
                  <Cell className="text-xs whitespace-nowrap text-[color:var(--texte-doux)]">
                    du {formatDate(alert.startAt, "d MMM yyyy")}
                    {alert.endAt ? ` au ${formatDate(alert.endAt, "d MMM yyyy")}` : " (sans fin)"}
                  </Cell>
                  <Cell>
                    {!alert.active ? (
                      <Pill tone="brouillon">Inactif</Pill>
                    ) : expired ? (
                      <Pill tone="brouillon">Période écoulée</Pill>
                    ) : future ? (
                      <Pill tone="attente">Programmé</Pill>
                    ) : (
                      <Pill tone="publie" icon="Eye">
                        Affiché
                      </Pill>
                    )}
                  </Cell>
                  <Cell className="text-right">
                    <RowActions
                      editHref={`/admin/alertes?modifier=${alert.id}`}
                      items={[
                        {
                          label: alert.active ? "Désactiver" : "Activer",
                          icon: alert.active ? "EyeOff" : "Eye",
                          action: basculerAlerte.bind(null, alert.id),
                        },
                        {
                          label: "Supprimer",
                          icon: "Trash2",
                          danger: true,
                          confirm: `Supprimer le bandeau « ${alert.title} » ?`,
                          action: supprimerAlerte.bind(null, alert.id),
                        },
                      ]}
                    />
                  </Cell>
                </tr>
              );
            })}
          </DataTable>
        )}
      </Panel>
    </>
  );
}
