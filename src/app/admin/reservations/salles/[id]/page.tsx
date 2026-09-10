import { notFound } from "next/navigation";

import { deciderReservation } from "@/app/admin/actions-demandes";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { AdminHeader, HelpNote, Panel, Pill } from "@/components/admin/ui";
import { Field, Input, Notice, Select, Textarea } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { prisma } from "@/lib/db";
import {
  AUDIENCE_LABELS,
  BOOKING_STATUSES,
  BOOKING_STATUS_LABELS,
  type Audience,
  type BookingStatus,
} from "@/lib/enums";
import { formatDate, formatDateTime, formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const booking = await prisma.roomBooking.findUnique({ where: { id }, select: { reference: true } });
  return { title: booking ? `Réservation ${booking.reference}` : "Réservation introuvable" };
}

export default async function InstructionReservationPage({ params }: Props) {
  const { id } = await params;

  const booking = await prisma.roomBooking.findUnique({
    where: { id },
    include: {
      room: { select: { name: true, slots: { select: { key: true, label: true } }, tariffs: true } },
      decidedBy: { select: { name: true } },
    },
  });

  if (!booking) notFound();

  const slotLabel = booking.room.slots.find((slot) => slot.key === booking.slotKey)?.label ?? booking.slotKey;
  const status = booking.status as BookingStatus;

  /* Autres demandes sur le même créneau : utile pour arbitrer. */
  const concurrent = await prisma.roomBooking.findMany({
    where: {
      id: { not: booking.id },
      roomId: booking.roomId,
      status: { in: ["EN_ATTENTE", "PREVALIDEE", "CONFIRMEE"] },
      endDate: { gte: booking.startDate },
      startDate: { lte: booking.endDate },
    },
    select: { id: true, reference: true, status: true, purpose: true, applicantName: true },
  });

  const needs = [
    booking.needsTables ? "tables" : null,
    booking.needsChairs ? "chaises" : null,
    booking.needsKitchen ? "office traiteur" : null,
    booking.needsBar ? "buvette" : null,
  ].filter(Boolean);

  return (
    <>
      <AdminHeader
        title={booking.purpose}
        description={`Demande ${booking.reference} déposée le ${formatDateTime(booking.createdAt)}`}
        breadcrumb={[
          { label: "Réservations de salle", href: "/admin/reservations/salles" },
          { label: booking.reference },
        ]}
        actions={
          <Pill
            tone={
              status === "CONFIRMEE"
                ? "publie"
                : status === "EN_ATTENTE"
                  ? "attente"
                  : status === "PREVALIDEE"
                    ? "encours"
                    : "refus"
            }
          >
            {BOOKING_STATUS_LABELS[status]}
          </Pill>
        }
      />

      {concurrent.length > 0 ? (
        <Notice tone="attention" title="Attention : créneau demandé par ailleurs" className="mb-5">
          <ul className="mt-1 space-y-1">
            {concurrent.map((entry) => (
              <li key={entry.id}>
                <a
                  href={`/admin/reservations/salles/${entry.id}`}
                  className="font-semibold underline"
                >
                  {entry.reference}
                </a>{" "}
                — {entry.purpose} ({entry.applicantName}) ·{" "}
                {BOOKING_STATUS_LABELS[entry.status as BookingStatus]}
              </li>
            ))}
          </ul>
        </Notice>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Panel title="La demande">
            <dl className="divide-y divide-[color:var(--bordure)] text-sm">
              {[
                { label: "Salle", value: booking.room.name },
                { label: "Créneau", value: slotLabel },
                {
                  label: "Dates",
                  value: `du ${formatDate(booking.startDate)} au ${formatDate(booking.endDate)}`,
                },
                {
                  label: "Situation déclarée",
                  value: AUDIENCE_LABELS[booking.audience as Audience] ?? booking.audience,
                },
                { label: "Nature de la manifestation", value: booking.purpose },
                {
                  label: "Effectif attendu",
                  value: booking.expectedAttendees ? `${booking.expectedAttendees} personnes` : "non précisé",
                },
                { label: "Structure", value: booking.organizationName ?? "—" },
                { label: "Besoins", value: needs.length > 0 ? needs.join(", ") : "aucun" },
              ].map((row) => (
                <div key={row.label} className="grid gap-1 px-4 py-3 sm:grid-cols-3 sm:px-5">
                  <dt className="text-[color:var(--texte-doux)]">{row.label}</dt>
                  <dd className="font-medium sm:col-span-2">{row.value}</dd>
                </div>
              ))}
            </dl>

            {booking.comment ? (
              <div className="border-t border-[color:var(--bordure)] bg-[color:var(--surface-alt)] p-4 sm:p-5">
                <p className="mb-1.5 flex items-center gap-2 text-xs font-bold tracking-wide uppercase text-[color:var(--texte-doux)]">
                  <Icon name="MessageSquare" className="size-3.5" />
                  Précisions du demandeur
                </p>
                <p className="text-sm leading-relaxed whitespace-pre-line">{booking.comment}</p>
              </div>
            ) : null}
          </Panel>

          <Panel title="Le demandeur">
            <dl className="divide-y divide-[color:var(--bordure)] text-sm">
              {[
                { label: "Nom", value: booking.applicantName },
                {
                  label: "Courriel",
                  value: (
                    <a href={`mailto:${booking.applicantEmail}`} className="text-azur-600 hover:underline dark:text-azur-200">
                      {booking.applicantEmail}
                    </a>
                  ),
                },
                {
                  label: "Téléphone",
                  value: (
                    <a
                      href={`tel:${booking.applicantPhone.replace(/\s/g, "")}`}
                      className="text-azur-600 hover:underline dark:text-azur-200"
                    >
                      {booking.applicantPhone}
                    </a>
                  ),
                },
                { label: "Adresse", value: booking.applicantAddress ?? "—" },
              ].map((row) => (
                <div key={row.label} className="grid gap-1 px-4 py-3 sm:grid-cols-3 sm:px-5">
                  <dt className="text-[color:var(--texte-doux)]">{row.label}</dt>
                  <dd className="font-medium sm:col-span-2">{row.value}</dd>
                </div>
              ))}
            </dl>
          </Panel>

          {booking.decidedAt ? (
            <Panel title="Décision enregistrée">
              <div className="space-y-2 p-4 text-sm sm:p-5">
                <p>
                  <strong>{BOOKING_STATUS_LABELS[status]}</strong> le{" "}
                  {formatDateTime(booking.decidedAt)}
                  {booking.decidedBy ? ` par ${booking.decidedBy.name}` : ""}.
                </p>
                {booking.decisionMessage ? (
                  <p className="rounded-field bg-[color:var(--surface-alt)] p-3 leading-relaxed">
                    <span className="mb-1 block text-xs font-bold uppercase text-[color:var(--texte-doux)]">
                      Message transmis au demandeur
                    </span>
                    {booking.decisionMessage}
                  </p>
                ) : null}
                {booking.adminNote ? (
                  <p className="rounded-field border border-dashed border-[color:var(--bordure)] p-3 leading-relaxed">
                    <span className="mb-1 block text-xs font-bold uppercase text-[color:var(--texte-doux)]">
                      Note interne (non transmise)
                    </span>
                    {booking.adminNote}
                  </p>
                ) : null}
              </div>
            </Panel>
          ) : null}
        </div>

        <div className="space-y-5">
          <Panel title="Instruire la demande">
            <form action={deciderReservation} className="space-y-4 p-4 sm:p-5">
              <input type="hidden" name="id" value={booking.id} />

              <Field label="Décision" htmlFor="statut" required>
                <Select id="statut" name="statut" defaultValue={booking.status}>
                  {BOOKING_STATUSES.map((entry) => (
                    <option key={entry} value={entry}>
                      {BOOKING_STATUS_LABELS[entry]}
                    </option>
                  ))}
                </Select>
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Tarif (centimes)" htmlFor="montant" hint={formatPrice(booking.amountCents)}>
                  <Input
                    id="montant"
                    name="montant"
                    type="number"
                    min={0}
                    step={100}
                    defaultValue={booking.amountCents}
                  />
                </Field>
                <Field label="Caution (centimes)" htmlFor="caution" hint={formatPrice(booking.depositCents)}>
                  <Input
                    id="caution"
                    name="caution"
                    type="number"
                    min={0}
                    step={100}
                    defaultValue={booking.depositCents}
                  />
                </Field>
              </div>

              <Field
                label="Message au demandeur"
                htmlFor="message"
                hint="Transmis par courriel. Précisez les modalités : remise des clés, pièces à fournir, horaires."
              >
                <Textarea
                  id="message"
                  name="message"
                  rows={5}
                  defaultValue={booking.decisionMessage ?? ""}
                  maxLength={2000}
                />
              </Field>

              <Field
                label="Note interne"
                htmlFor="note"
                hint="Visible uniquement des agents. Jamais transmise à l'usager."
              >
                <Textarea id="note" name="note" rows={3} defaultValue={booking.adminNote ?? ""} maxLength={2000} />
              </Field>

              <div className="border-t border-[color:var(--bordure)] pt-4">
                <SubmitButton fullWidth icon="CheckCheck" pendingLabel="Enregistrement…">
                  Enregistrer la décision
                </SubmitButton>
              </div>
            </form>
          </Panel>

          <Panel title="Grille tarifaire de la salle">
            <ul className="divide-y divide-[color:var(--bordure)] text-xs">
              {booking.room.tariffs
                .filter((tariff) => tariff.slotKey === booking.slotKey)
                .map((tariff) => (
                  <li
                    key={`${tariff.audience}-${tariff.slotKey}`}
                    className="flex items-baseline justify-between gap-3 px-4 py-2.5"
                  >
                    <span
                      className={
                        tariff.audience === booking.audience
                          ? "font-bold text-azur-700 dark:text-azur-200"
                          : "text-[color:var(--texte-doux)]"
                      }
                    >
                      {AUDIENCE_LABELS[tariff.audience as Audience] ?? tariff.audience}
                    </span>
                    <span className="font-semibold tabular-nums">
                      {formatPrice(tariff.amountCents)}
                      {tariff.depositCents > 0 ? (
                        <span className="ml-1 font-normal text-[color:var(--texte-doux)]">
                          + {formatPrice(tariff.depositCents)}
                        </span>
                      ) : null}
                    </span>
                  </li>
                ))}
            </ul>
          </Panel>

          <HelpNote title="Pièces à réclamer" icon="Paperclip">
            Attestation d'assurance responsabilité civile dans tous les cas ; justificatif de
            domicile pour le tarif habitant ; statuts et récépissé de préfecture pour une
            association.
          </HelpNote>
        </div>
      </div>
    </>
  );
}
