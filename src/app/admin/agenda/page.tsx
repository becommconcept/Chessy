import Link from "next/link";

import { supprimerEvenement } from "@/app/admin/actions-content";
import { RowActions } from "@/components/admin/RowActions";
import { AdminEmpty, AdminHeader, Cell, DataTable, FilterBar, FilterLink, Panel, Pill } from "@/components/admin/ui";
import { ButtonLink } from "@/components/ui/Button";
import { Notice } from "@/components/ui/Field";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { EVENT_CATEGORY_LABELS, labelOf } from "@/lib/enums";
import { formatDate, formatTimeRange } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Agenda" };

type Props = { searchParams: Promise<{ periode?: string; enregistre?: string }> };

export default async function AdminAgendaPage({ searchParams }: Props) {
  // Les contenus du site ne sont modifiables que par un administrateur ou un éditeur.
  await requireRole(["ADMIN", "EDITEUR"]);

  const { periode, enregistre } = await searchParams;
  const now = new Date(new Date().setHours(0, 0, 0, 0));

  const [events, upcoming, past] = await Promise.all([
    prisma.event.findMany({
      where: periode === "passe" ? { startAt: { lt: now } } : { startAt: { gte: now } },
      orderBy: { startAt: periode === "passe" ? "desc" : "asc" },
      take: 200,
      select: {
        id: true,
        slug: true,
        title: true,
        startAt: true,
        endAt: true,
        allDay: true,
        place: true,
        category: true,
        status: true,
        featured: true,
        association: { select: { shortName: true, name: true } },
      },
    }),
    prisma.event.count({ where: { startAt: { gte: now } } }),
    prisma.event.count({ where: { startAt: { lt: now } } }),
  ]);

  return (
    <>
      <AdminHeader
        title="Agenda"
        description="Les évènements publiés alimentent le calendrier du site, la page d'accueil et le fichier iCalendar."
        breadcrumb={[{ label: "Agenda" }]}
        actions={
          <ButtonLink href="/admin/agenda/nouveau" size="sm" icon="Plus">
            Nouvel évènement
          </ButtonLink>
        }
      />

      {enregistre ? (
        <Notice tone="succes" className="mb-5">
          L'évènement a bien été enregistré.
        </Notice>
      ) : null}

      <FilterBar>
        <FilterLink href="/admin/agenda" active={periode !== "passe"} count={upcoming}>
          À venir
        </FilterLink>
        <FilterLink href="/admin/agenda?periode=passe" active={periode === "passe"} count={past}>
          Passés
        </FilterLink>
      </FilterBar>

      <Panel>
        {events.length === 0 ? (
          <AdminEmpty
            icon="CalendarDays"
            title={periode === "passe" ? "Aucun évènement passé" : "Aucun évènement à venir"}
            description="Ajoutez les manifestations de la commune et des associations."
            action={
              <ButtonLink href="/admin/agenda/nouveau" icon="Plus">
                Ajouter un évènement
              </ButtonLink>
            }
          />
        ) : (
          <DataTable
            caption="Liste des évènements"
            columns={[
              { label: "Date" },
              { label: "Évènement" },
              { label: "Lieu" },
              { label: "Type" },
              { label: "État" },
              { label: "Actions", sr: true },
            ]}
          >
            {events.map((event) => (
              <tr key={event.id} className="transition-colors hover:bg-[color:var(--surface-alt)]">
                <Cell className="whitespace-nowrap">
                  <span className="block font-semibold">{formatDate(event.startAt, "d MMM yyyy")}</span>
                  <span className="block text-xs text-[color:var(--texte-doux)]">
                    {event.allDay ? "toute la journée" : formatTimeRange(event.startAt, event.endAt)}
                  </span>
                </Cell>
                <Cell header>
                  <Link
                    href={`/admin/agenda/${event.id}`}
                    className="font-semibold hover:text-azur-600 dark:hover:text-azur-200"
                  >
                    {event.title}
                  </Link>
                  {event.association ? (
                    <span className="mt-0.5 block text-xs text-[color:var(--texte-doux)]">
                      {event.association.shortName ?? event.association.name}
                    </span>
                  ) : null}
                </Cell>
                <Cell className="text-xs text-[color:var(--texte-doux)]">{event.place ?? "—"}</Cell>
                <Cell>
                  {event.category ? (
                    <Pill tone="neutre">{labelOf(EVENT_CATEGORY_LABELS, event.category)}</Pill>
                  ) : (
                    <span className="text-xs text-[color:var(--texte-doux)]">—</span>
                  )}
                </Cell>
                <Cell>
                  <Pill tone={event.status === "PUBLIEE" ? "publie" : "brouillon"}>
                    {event.status === "PUBLIEE" ? "Publié" : "Brouillon"}
                  </Pill>
                </Cell>
                <Cell className="text-right">
                  <RowActions
                    editHref={`/admin/agenda/${event.id}`}
                    items={[
                      {
                        label: "Supprimer",
                        icon: "Trash2",
                        danger: true,
                        confirm: `Supprimer définitivement l'évènement « ${event.title} » ?`,
                        action: supprimerEvenement.bind(null, event.id),
                      },
                    ]}
                  />
                </Cell>
              </tr>
            ))}
          </DataTable>
        )}
      </Panel>
    </>
  );
}
