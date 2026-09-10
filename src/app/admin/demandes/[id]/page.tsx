import { notFound } from "next/navigation";

import { mettreAJourDemande, repondreDemande, supprimerDemande } from "@/app/admin/actions-demandes";
import { RowActions } from "@/components/admin/RowActions";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { AdminHeader, HelpNote, Panel, Pill } from "@/components/admin/ui";
import { Field, Select, Textarea } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { Visual } from "@/components/ui/Visual";
import { prisma } from "@/lib/db";
import {
  PRIORITIES,
  PRIORITY_LABELS,
  REQUEST_STATUSES,
  REQUEST_STATUS_LABELS,
  REQUEST_TYPE_LABELS,
  SIGNALEMENT_CATEGORY_LABELS,
  labelOf,
  type RequestStatus,
  type RequestType,
} from "@/lib/enums";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const request = await prisma.request.findUnique({ where: { id }, select: { subject: true } });
  return { title: request ? request.subject : "Demande introuvable" };
}

export default async function DemandePage({ params }: Props) {
  const { id } = await params;

  const [request, agents] = await Promise.all([
    prisma.request.findUnique({
      where: { id },
      include: {
        photo: { select: { url: true, alt: true } },
        assignedTo: { select: { id: true, name: true } },
        messages: { orderBy: { createdAt: "asc" } },
      },
    }),
    prisma.user.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, role: true },
    }),
  ]);

  if (!request) notFound();

  const status = request.status as RequestStatus;
  const mapsUrl =
    request.lat && request.lng
      ? `https://www.openstreetmap.org/?mlat=${request.lat}&mlon=${request.lng}#map=18/${request.lat}/${request.lng}`
      : null;

  return (
    <>
      <AdminHeader
        title={request.subject}
        description={`${REQUEST_TYPE_LABELS[request.type as RequestType]} — ${request.reference}, déposée le ${formatDateTime(request.createdAt)}`}
        breadcrumb={[
          { label: "Messages et signalements", href: "/admin/demandes" },
          { label: request.reference },
        ]}
        actions={
          <>
            <Pill
              tone={status === "NOUVEAU" ? "attente" : status === "EN_COURS" ? "encours" : "publie"}
            >
              {REQUEST_STATUS_LABELS[status]}
            </Pill>
            <RowActions
              items={[
                {
                  label: "Supprimer la demande",
                  icon: "Trash2",
                  danger: true,
                  confirm: `Supprimer définitivement la demande ${request.reference} ? Les échanges associés seront perdus.`,
                  action: supprimerDemande.bind(null, request.id),
                },
              ]}
            />
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Panel title="Le message">
            <div className="p-4 sm:p-5">
              <p className="text-[0.9375rem] leading-relaxed whitespace-pre-line">{request.message}</p>
            </div>

            {request.photo ? (
              <div className="border-t border-[color:var(--bordure)] p-4 sm:p-5">
                <p className="mb-2.5 flex items-center gap-2 text-xs font-bold tracking-wide uppercase text-[color:var(--texte-doux)]">
                  <Icon name="Camera" className="size-3.5" />
                  Photographie joignée
                </p>
                <a href={request.photo.url} target="_blank" rel="noopener noreferrer" className="block max-w-md">
                  <Visual source={request.photo} ratio="4/3" className="rounded-card" sizes="480px" />
                  <span className="mt-1.5 block text-xs text-azur-600 hover:underline dark:text-azur-200">
                    Ouvrir en grand (nouvelle fenêtre)
                  </span>
                </a>
              </div>
            ) : null}

            {request.lat && request.lng ? (
              <div className="border-t border-[color:var(--bordure)] p-4 sm:p-5">
                <p className="mb-2 flex items-center gap-2 text-xs font-bold tracking-wide uppercase text-[color:var(--texte-doux)]">
                  <Icon name="MapPin" className="size-3.5" />
                  Localisation
                </p>
                <p className="text-sm">
                  {request.locationLabel ?? "Point placé sur le plan par le déposant"}
                  <span className="mt-0.5 block font-mono text-xs text-[color:var(--texte-doux)]">
                    {request.lat.toFixed(5)}, {request.lng.toFixed(5)}
                  </span>
                </p>
                {mapsUrl ? (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-azur-600 hover:underline dark:text-azur-200"
                  >
                    <Icon name="Locate" className="size-4" />
                    Ouvrir dans OpenStreetMap
                  </a>
                ) : null}
              </div>
            ) : request.locationLabel ? (
              <div className="border-t border-[color:var(--bordure)] p-4 sm:p-5">
                <p className="mb-1 text-xs font-bold uppercase text-[color:var(--texte-doux)]">Lieu indiqué</p>
                <p className="text-sm">{request.locationLabel}</p>
              </div>
            ) : null}
          </Panel>

          <Panel title="Échanges avec le déposant">
            {request.messages.length === 0 ? (
              <p className="px-4 py-6 text-sm text-[color:var(--texte-doux)] sm:px-5">
                Aucun échange pour le moment. Votre réponse ci-dessous sera envoyée par courriel et
                visible par le déposant depuis sa page de suivi.
              </p>
            ) : (
              <ul className="divide-y divide-[color:var(--bordure)]">
                {request.messages.map((message) => (
                  <li key={message.id} className="p-4 sm:p-5">
                    <p className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-bold">
                        {message.author === "MAIRIE"
                          ? (message.authorName ?? "Mairie")
                          : request.name}
                      </span>
                      <Pill tone={message.author === "MAIRIE" ? "encours" : "neutre"}>
                        {message.author === "MAIRIE" ? "Mairie" : "Habitant"}
                      </Pill>
                      <span className="text-[color:var(--texte-doux)]">
                        {formatDateTime(message.createdAt)}
                      </span>
                    </p>
                    <p className="mt-2 text-sm leading-relaxed whitespace-pre-line">{message.body}</p>
                  </li>
                ))}
              </ul>
            )}

            <form action={repondreDemande} className="border-t border-[color:var(--bordure)] bg-[color:var(--surface-alt)] p-4 sm:p-5">
              <input type="hidden" name="id" value={request.id} />
              <Field
                label="Répondre au déposant"
                htmlFor="reponse"
                hint="Envoyé par courriel et ajouté à sa page de suivi. La demande passe automatiquement « en cours »."
              >
                <Textarea id="reponse" name="reponse" rows={4} required minLength={2} maxLength={4000} />
              </Field>
              <div className="mt-3">
                <SubmitButton icon="Send" pendingLabel="Envoi…">
                  Envoyer la réponse
                </SubmitButton>
              </div>
            </form>
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel title="Traitement">
            <form action={mettreAJourDemande} className="space-y-4 p-4 sm:p-5">
              <input type="hidden" name="id" value={request.id} />

              <Field label="État" htmlFor="statut">
                <Select id="statut" name="statut" defaultValue={request.status}>
                  {REQUEST_STATUSES.map((entry) => (
                    <option key={entry} value={entry}>
                      {REQUEST_STATUS_LABELS[entry]}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Priorité" htmlFor="priorite">
                <Select id="priorite" name="priorite" defaultValue={request.priority}>
                  {PRIORITIES.map((entry) => (
                    <option key={entry} value={entry}>
                      {PRIORITY_LABELS[entry]}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Agent en charge" htmlFor="affectation">
                <Select id="affectation" name="affectation" defaultValue={request.assignedToId ?? ""}>
                  <option value="">Non affectée</option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field
                label="Note interne"
                htmlFor="note"
                hint="Suivi technique, entreprise contactée, date d'intervention. Jamais transmise."
              >
                <Textarea id="note" name="note" rows={4} defaultValue={request.adminNote ?? ""} maxLength={2000} />
              </Field>

              <div className="border-t border-[color:var(--bordure)] pt-4">
                <SubmitButton fullWidth icon="Save">
                  Mettre à jour
                </SubmitButton>
              </div>
            </form>
          </Panel>

          <Panel title="Le déposant">
            <dl className="divide-y divide-[color:var(--bordure)] text-sm">
              {[
                { label: "Nom", value: request.name },
                {
                  label: "Courriel",
                  value: (
                    <a href={`mailto:${request.email}`} className="break-all text-azur-600 hover:underline dark:text-azur-200">
                      {request.email}
                    </a>
                  ),
                },
                {
                  label: "Téléphone",
                  value: request.phone ? (
                    <a href={`tel:${request.phone.replace(/\s/g, "")}`} className="text-azur-600 hover:underline dark:text-azur-200">
                      {request.phone}
                    </a>
                  ) : (
                    "—"
                  ),
                },
                { label: "Adresse", value: request.address ?? "—" },
                ...(request.category
                  ? [{ label: "Catégorie", value: labelOf(SIGNALEMENT_CATEGORY_LABELS, request.category) }]
                  : []),
              ].map((row) => (
                <div key={row.label} className="px-4 py-2.5">
                  <dt className="text-xs text-[color:var(--texte-doux)]">{row.label}</dt>
                  <dd className="mt-0.5 font-medium">{row.value}</dd>
                </div>
              ))}
            </dl>
          </Panel>

          <HelpNote title="Un signalement qui n'est pas de notre ressort" icon="Network">
            Route départementale, réseau d'électricité, éclairage sous contrat, conteneurs
            intercommunaux : transférez au gestionnaire compétent, puis répondez au déposant en le
            lui indiquant. Une réponse claire vaut mieux qu'un silence, même quand la commune ne
            peut pas intervenir.
          </HelpNote>
        </div>
      </div>
    </>
  );
}
