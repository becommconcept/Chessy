import Link from "next/link";

import { AdminEmpty, AdminHeader, Cell, DataTable, HelpNote, Panel, Pill, StatCard } from "@/components/admin/ui";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { can, getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  BOOKING_STATUS_LABELS,
  LOAN_STATUS_LABELS,
  REQUEST_TYPE_LABELS,
  type BookingStatus,
  type LoanStatus,
  type RequestType,
  type Role,
} from "@/lib/enums";
import { formatDate, formatRelative } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TableauDeBordPage() {
  const user = await getSessionUser();
  const role = (user?.role ?? "AGENT") as Role;

  const [
    pendingBookings,
    pendingLoans,
    newRequests,
    inProgressRequests,
    publishedPages,
    draftPages,
    publishedNews,
    draftNews,
    upcomingEvents,
    mediaCount,
    subscribers,
    bookings,
    loans,
    requests,
    audit,
  ] = await Promise.all([
    prisma.roomBooking.count({ where: { status: "EN_ATTENTE" } }),
    prisma.equipmentLoan.count({ where: { status: "EN_ATTENTE" } }),
    prisma.request.count({ where: { status: "NOUVEAU" } }),
    prisma.request.count({ where: { status: "EN_COURS" } }),
    prisma.page.count({ where: { status: "PUBLIEE" } }),
    prisma.page.count({ where: { status: "BROUILLON" } }),
    prisma.newsPost.count({ where: { status: "PUBLIEE" } }),
    prisma.newsPost.count({ where: { status: "BROUILLON" } }),
    prisma.event.count({ where: { status: "PUBLIEE", startAt: { gte: new Date() } } }),
    prisma.media.count(),
    prisma.newsletterSubscriber.count({ where: { confirmed: true } }),
    prisma.roomBooking.findMany({
      orderBy: [{ status: "asc" }, { startDate: "asc" }],
      take: 6,
      select: {
        id: true,
        reference: true,
        status: true,
        startDate: true,
        purpose: true,
        applicantName: true,
        organizationName: true,
        amountCents: true,
        room: { select: { name: true } },
      },
    }),
    prisma.equipmentLoan.findMany({
      where: { status: { in: ["EN_ATTENTE", "CONFIRMEE", "SORTIE"] } },
      orderBy: { pickupDate: "asc" },
      take: 5,
      select: {
        id: true,
        reference: true,
        status: true,
        pickupDate: true,
        returnDate: true,
        applicantName: true,
        organizationName: true,
        _count: { select: { lines: true } },
      },
    }),
    prisma.request.findMany({
      where: { status: { in: ["NOUVEAU", "EN_COURS"] } },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      take: 6,
      select: {
        id: true,
        reference: true,
        type: true,
        subject: true,
        status: true,
        priority: true,
        createdAt: true,
        name: true,
      },
    }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        action: true,
        entity: true,
        label: true,
        createdAt: true,
        user: { select: { name: true } },
      },
    }),
  ]);

  const totalTodo = pendingBookings + pendingLoans + newRequests;

  return (
    <>
      <AdminHeader
        title={`Bonjour ${user?.name ?? ""}`}
        description={
          totalTodo > 0
            ? `${totalTodo} demande${totalTodo > 1 ? "s" : ""} attend${totalTodo > 1 ? "ent" : ""} votre traitement.`
            : "Aucune demande en attente : tout est à jour."
        }
        actions={
          can.editContent(role) ? (
            <>
              <ButtonLink href="/admin/actualites/nouvelle" icon="Plus" size="sm">
                Nouvelle actualité
              </ButtonLink>
              <ButtonLink href="/admin/pages" variant="contour" icon="LayoutTemplate" size="sm">
                Modifier une page
              </ButtonLink>
            </>
          ) : null
        }
      />

      {/* Indicateurs */}
      <div className="mb-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Réservations à instruire"
          value={pendingBookings}
          icon="PartyPopper"
          tone={pendingBookings > 0 ? "attente" : "succes"}
          href="/admin/reservations/salles?statut=EN_ATTENTE"
          hint={pendingBookings > 0 ? "En attente de décision" : "Rien en attente"}
        />
        <StatCard
          label="Prêts de matériel"
          value={pendingLoans}
          icon="Package"
          tone={pendingLoans > 0 ? "attente" : "succes"}
          href="/admin/reservations/materiel?statut=EN_ATTENTE"
          hint={pendingLoans > 0 ? "En attente de décision" : "Rien en attente"}
        />
        <StatCard
          label="Messages et signalements"
          value={newRequests}
          icon="Inbox"
          tone={newRequests > 0 ? "alerte" : "succes"}
          href="/admin/demandes?statut=NOUVEAU"
          hint={`${inProgressRequests} en cours de traitement`}
        />
        <StatCard
          label="Prochains évènements"
          value={upcomingEvents}
          icon="CalendarDays"
          href="/admin/agenda"
          hint={`${publishedNews} actualités publiées`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Réservations */}
          <Panel
            title="Réservations de salle"
            description="Les demandes les plus proches et celles en attente."
            actions={
              <Link
                href="/admin/reservations/salles"
                className="text-xs font-semibold text-azur-600 hover:underline dark:text-azur-200"
              >
                Tout voir
              </Link>
            }
          >
            {bookings.length === 0 ? (
              <AdminEmpty
                icon="PartyPopper"
                title="Aucune réservation enregistrée"
                description="Les demandes déposées depuis le site apparaîtront ici."
              />
            ) : (
              <DataTable
                caption="Dernières réservations de salle"
                columns={[
                  { label: "Demande" },
                  { label: "Salle" },
                  { label: "Date" },
                  { label: "Statut" },
                  { label: "Action", sr: true },
                ]}
              >
                {bookings.map((booking) => (
                  <tr key={booking.id} className="transition-colors hover:bg-[color:var(--surface-alt)]">
                    <Cell header>
                      <span className="block truncate">{booking.purpose}</span>
                      <span className="mt-0.5 block text-xs text-[color:var(--texte-doux)]">
                        {booking.organizationName || booking.applicantName} ·{" "}
                        <span className="font-mono">{booking.reference}</span>
                      </span>
                    </Cell>
                    <Cell className="text-[color:var(--texte-doux)]">{booking.room.name}</Cell>
                    <Cell className="whitespace-nowrap">{formatDate(booking.startDate, "d MMM yyyy")}</Cell>
                    <Cell>
                      <Pill
                        tone={
                          booking.status === "CONFIRMEE"
                            ? "publie"
                            : booking.status === "EN_ATTENTE"
                              ? "attente"
                              : booking.status === "PREVALIDEE"
                                ? "encours"
                                : "refus"
                        }
                      >
                        {BOOKING_STATUS_LABELS[booking.status as BookingStatus]}
                      </Pill>
                    </Cell>
                    <Cell className="text-right">
                      <Link
                        href={`/admin/reservations/salles/${booking.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-azur-600 hover:underline dark:text-azur-200"
                      >
                        Traiter
                        <Icon name="ArrowRight" className="size-3.5" />
                      </Link>
                    </Cell>
                  </tr>
                ))}
              </DataTable>
            )}
          </Panel>

          {/* Demandes */}
          <Panel
            title="Messages et signalements à traiter"
            actions={
              <Link
                href="/admin/demandes"
                className="text-xs font-semibold text-azur-600 hover:underline dark:text-azur-200"
              >
                Tout voir
              </Link>
            }
          >
            {requests.length === 0 ? (
              <AdminEmpty
                icon="CheckCheck"
                title="Aucune demande en attente"
                description="Toutes les demandes des habitants ont été traitées."
              />
            ) : (
              <ul className="divide-y divide-[color:var(--bordure)]">
                {requests.map((request) => (
                  <li key={request.id}>
                    <Link
                      href={`/admin/demandes/${request.id}`}
                      className="flex items-start gap-3.5 px-4 py-3.5 transition-colors hover:bg-[color:var(--surface-alt)] sm:px-5"
                    >
                      <span
                        className={
                          request.priority === "HAUTE"
                            ? "mt-1 flex size-8 shrink-0 items-center justify-center rounded-field bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200"
                            : "mt-1 flex size-8 shrink-0 items-center justify-center rounded-field bg-[color:var(--surface-sunken)] text-[color:var(--texte-doux)]"
                        }
                      >
                        <Icon
                          name={
                            request.type === "SIGNALEMENT"
                              ? "TriangleAlert"
                              : request.type === "RENDEZ_VOUS"
                                ? "CalendarClock"
                                : request.type === "SUGGESTION"
                                  ? "Lightbulb"
                                  : "Mail"
                          }
                          className="size-4"
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold">{request.subject}</span>
                          <Pill tone={request.status === "NOUVEAU" ? "attente" : "encours"}>
                            {request.status === "NOUVEAU" ? "Nouveau" : "En cours"}
                          </Pill>
                          {request.priority === "HAUTE" ? (
                            <Pill tone="refus" icon="TriangleAlert">
                              Priorité haute
                            </Pill>
                          ) : null}
                        </span>
                        <span className="mt-1 block text-xs text-[color:var(--texte-doux)]">
                          {REQUEST_TYPE_LABELS[request.type as RequestType]} · {request.name} ·{" "}
                          {formatRelative(request.createdAt)} ·{" "}
                          <span className="font-mono">{request.reference}</span>
                        </span>
                      </span>
                      <Icon
                        name="ChevronRight"
                        className="mt-2 size-4 shrink-0 text-[color:var(--texte-doux)]/50"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">
          <Panel title="Prêts de matériel en cours">
            {loans.length === 0 ? (
              <AdminEmpty icon="Package" title="Aucun prêt en cours" />
            ) : (
              <ul className="divide-y divide-[color:var(--bordure)] text-sm">
                {loans.map((loan) => (
                  <li key={loan.id}>
                    <Link
                      href={`/admin/reservations/materiel/${loan.id}`}
                      className="block px-4 py-3 transition-colors hover:bg-[color:var(--surface-alt)]"
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate font-semibold">
                          {loan.organizationName || loan.applicantName}
                        </span>
                        <Pill
                          tone={
                            loan.status === "EN_ATTENTE"
                              ? "attente"
                              : loan.status === "SORTIE"
                                ? "encours"
                                : "publie"
                          }
                        >
                          {LOAN_STATUS_LABELS[loan.status as LoanStatus]}
                        </Pill>
                      </span>
                      <span className="mt-1 block text-xs text-[color:var(--texte-doux)]">
                        {loan._count.lines} référence{loan._count.lines > 1 ? "s" : ""} · retrait le{" "}
                        {formatDate(loan.pickupDate, "d MMM")}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          {can.editContent(role) ? (
            <Panel title="État des contenus">
              <dl className="divide-y divide-[color:var(--bordure)] text-sm">
                {[
                  { label: "Pages publiées", value: publishedPages, hint: `${draftPages} brouillon${draftPages > 1 ? "s" : ""}` },
                  { label: "Actualités publiées", value: publishedNews, hint: `${draftNews} brouillon${draftNews > 1 ? "s" : ""}` },
                  { label: "Évènements à venir", value: upcomingEvents },
                  { label: "Fichiers en médiathèque", value: mediaCount },
                  { label: "Abonnés à la lettre", value: subscribers },
                ].map((row) => (
                  <div key={row.label} className="flex items-baseline justify-between gap-3 px-4 py-2.5">
                    <dt className="text-[color:var(--texte-doux)]">
                      {row.label}
                      {row.hint ? (
                        <span className="mt-0.5 block text-xs opacity-75">{row.hint}</span>
                      ) : null}
                    </dt>
                    <dd className="font-display font-bold tabular-nums">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </Panel>
          ) : null}

          <Panel title="Dernières actions">
            {audit.length === 0 ? (
              <AdminEmpty icon="History" title="Journal vide" />
            ) : (
              <ul className="divide-y divide-[color:var(--bordure)] text-sm">
                {audit.map((entry) => (
                  <li key={entry.id} className="px-4 py-2.5">
                    <p className="truncate">
                      <span className="font-medium">{entry.label ?? entry.entity}</span>
                    </p>
                    <p className="mt-0.5 text-xs text-[color:var(--texte-doux)]">
                      {entry.action.toLowerCase()} · {entry.user?.name ?? "système"} ·{" "}
                      {formatRelative(entry.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <HelpNote title="Besoin d'un coup de main ?" icon="CircleHelp">
            Le guide d'administration livré avec le site (dossier <code>docs/</code>) détaille chaque
            écran, avec des exemples. Pour toute question, l'assistance figure en page de contact du
            prestataire.
          </HelpNote>
        </div>
      </div>
    </>
  );
}
