import Link from "next/link";

import { AdminEmpty, AdminHeader, Cell, DataTable, FilterBar, FilterLink, HelpNote, Panel, Pill } from "@/components/admin/ui";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { prisma } from "@/lib/db";
import {
  AUDIENCE_LABELS,
  BOOKING_STATUSES,
  BOOKING_STATUS_LABELS,
  type Audience,
  type BookingStatus,
} from "@/lib/enums";
import { formatDate, formatPrice, formatRelative } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Réservations de salle" };

const TONES: Record<BookingStatus, "attente" | "encours" | "publie" | "refus"> = {
  EN_ATTENTE: "attente",
  PREVALIDEE: "encours",
  CONFIRMEE: "publie",
  REFUSEE: "refus",
  ANNULEE: "refus",
};

type Props = { searchParams: Promise<{ statut?: string }> };

export default async function AdminReservationsSallesPage({ searchParams }: Props) {
  const { statut } = await searchParams;
  const filtered = BOOKING_STATUSES.includes(statut as BookingStatus);

  const [bookings, counts] = await Promise.all([
    prisma.roomBooking.findMany({
      where: filtered ? { status: statut } : undefined,
      orderBy: [{ startDate: "asc" }],
      select: {
        id: true,
        reference: true,
        status: true,
        startDate: true,
        endDate: true,
        slotKey: true,
        audience: true,
        purpose: true,
        applicantName: true,
        organizationName: true,
        expectedAttendees: true,
        amountCents: true,
        createdAt: true,
        room: { select: { name: true } },
      },
    }),
    prisma.roomBooking.groupBy({ by: ["status"], _count: true }),
  ]);

  const countOf = (status: string) => counts.find((entry) => entry.status === status)?._count ?? 0;
  const total = counts.reduce((sum, entry) => sum + entry._count, 0);

  return (
    <>
      <AdminHeader
        title="Réservations de salle"
        description="Instruisez les demandes déposées en ligne : pré-réservation, confirmation, refus. L'usager est informé par courriel à chaque décision."
        breadcrumb={[{ label: "Réservations de salle" }]}
        actions={
          <ButtonLink href="/admin/ressources" variant="contour" size="sm" icon="Warehouse">
            Salles et fermetures
          </ButtonLink>
        }
      />

      <HelpNote title="Ce que voit l'usager" icon="Eye">
        Une demande <strong>en attente</strong> bloque déjà le créneau dans le calendrier public :
        personne d'autre ne peut le demander. Elle ne devient une réservation ferme qu'une fois
        <strong> confirmée</strong>. Un refus ou une annulation libère immédiatement le créneau.
      </HelpNote>

      <FilterBar>
        <FilterLink href="/admin/reservations/salles" active={!filtered} count={total}>
          Toutes
        </FilterLink>
        {BOOKING_STATUSES.map((status) => (
          <FilterLink
            key={status}
            href={`/admin/reservations/salles?statut=${status}`}
            active={statut === status}
            count={countOf(status)}
          >
            {BOOKING_STATUS_LABELS[status]}
          </FilterLink>
        ))}
      </FilterBar>

      <Panel>
        {bookings.length === 0 ? (
          <AdminEmpty
            icon="PartyPopper"
            title="Aucune réservation"
            description="Les demandes déposées depuis le site apparaîtront ici automatiquement."
          />
        ) : (
          <DataTable
            caption="Liste des réservations de salle"
            columns={[
              { label: "Référence" },
              { label: "Manifestation" },
              { label: "Salle et dates" },
              { label: "Situation" },
              { label: "Montant", className: "text-right" },
              { label: "État" },
              { label: "Actions", sr: true },
            ]}
          >
            {bookings.map((booking) => (
              <tr key={booking.id} className="transition-colors hover:bg-[color:var(--surface-alt)]">
                <Cell>
                  <span className="font-mono text-xs font-semibold">{booking.reference}</span>
                  <span className="mt-0.5 block text-xs text-[color:var(--texte-doux)]">
                    déposée {formatRelative(booking.createdAt)}
                  </span>
                </Cell>
                <Cell header>
                  <Link
                    href={`/admin/reservations/salles/${booking.id}`}
                    className="font-semibold hover:text-azur-600 dark:hover:text-azur-200"
                  >
                    {booking.purpose}
                  </Link>
                  <span className="mt-0.5 block text-xs text-[color:var(--texte-doux)]">
                    {booking.organizationName || booking.applicantName}
                    {booking.expectedAttendees ? ` · ${booking.expectedAttendees} pers.` : ""}
                  </span>
                </Cell>
                <Cell className="text-xs whitespace-nowrap">
                  <span className="block font-medium">{booking.room.name}</span>
                  <span className="block text-[color:var(--texte-doux)]">
                    {formatDate(booking.startDate, "d MMM")} → {formatDate(booking.endDate, "d MMM yyyy")}
                  </span>
                </Cell>
                <Cell className="text-xs text-[color:var(--texte-doux)]">
                  {AUDIENCE_LABELS[booking.audience as Audience] ?? booking.audience}
                </Cell>
                <Cell className="text-right text-xs font-semibold tabular-nums">
                  {formatPrice(booking.amountCents)}
                </Cell>
                <Cell>
                  <Pill tone={TONES[booking.status as BookingStatus] ?? "neutre"}>
                    {BOOKING_STATUS_LABELS[booking.status as BookingStatus]}
                  </Pill>
                </Cell>
                <Cell className="text-right">
                  <Link
                    href={`/admin/reservations/salles/${booking.id}`}
                    className="inline-flex items-center gap-1 rounded-field border border-[color:var(--bordure)] px-2.5 py-1.5 text-xs font-semibold transition-colors hover:bg-[color:var(--surface)]"
                  >
                    Instruire
                    <Icon name="ArrowRight" className="size-3.5" />
                  </Link>
                </Cell>
              </tr>
            ))}
          </DataTable>
        )}
      </Panel>
    </>
  );
}
