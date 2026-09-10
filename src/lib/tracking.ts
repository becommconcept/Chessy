import { prisma } from "@/lib/db";
import {
  BOOKING_STATUS_LABELS,
  LOAN_STATUS_LABELS,
  REQUEST_STATUS_LABELS,
  REQUEST_TYPE_LABELS,
  type BookingStatus,
  type LoanStatus,
  type RequestStatus,
  type RequestType,
} from "@/lib/enums";
import { formatPrice } from "@/lib/utils";

export type TrackedItem = {
  kind: "demande" | "salle" | "materiel";
  reference: string;
  title: string;
  subtitle: string;
  status: string;
  statusLabel: string;
  tone: "attente" | "encours" | "succes" | "refus";
  createdAt: Date;
  updatedAt: Date;
  facts: Array<{ label: string; value: string }>;
  decisionMessage?: string | null;
  timeline: Array<{ label: string; date: Date | null; done: boolean; current: boolean }>;
  messages?: Array<{ author: string; authorName: string | null; body: string; createdAt: Date }>;
};

/** Correspondance entre statut métier et couleur d'affichage. */
function toneOfRequest(status: RequestStatus): TrackedItem["tone"] {
  if (status === "NOUVEAU") return "attente";
  if (status === "EN_COURS") return "encours";
  return "succes";
}

function toneOfBooking(status: BookingStatus): TrackedItem["tone"] {
  if (status === "CONFIRMEE") return "succes";
  if (status === "REFUSEE" || status === "ANNULEE") return "refus";
  if (status === "PREVALIDEE") return "encours";
  return "attente";
}

function toneOfLoan(status: LoanStatus): TrackedItem["tone"] {
  if (status === "CONFIRMEE" || status === "SORTIE" || status === "RETOURNEE") return "succes";
  if (status === "REFUSEE" || status === "ANNULEE") return "refus";
  return "attente";
}

function frDate(date: Date | null | undefined): string {
  if (!date) return "—";
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

/**
 * Retrouve une demande à partir de sa référence et de son jeton de suivi.
 *
 * Le jeton est indispensable : la référence seule ne donne accès à rien, afin
 * qu'une référence devinée ou lue par-dessus l'épaule ne révèle pas les
 * coordonnées d'un usager.
 */
export async function trackByReference(
  reference: string,
  token: string,
): Promise<TrackedItem | null> {
  const ref = reference.trim().toUpperCase();
  const key = token.trim();
  if (!ref || !key) return null;

  /* ---------------------------- Demandes ---------------------------- */
  const request = await prisma.request.findFirst({
    where: { reference: ref, token: key },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  if (request) {
    const status = request.status as RequestStatus;
    return {
      kind: "demande",
      reference: request.reference,
      title: request.subject,
      subtitle: REQUEST_TYPE_LABELS[request.type as RequestType] ?? "Demande",
      status,
      statusLabel: REQUEST_STATUS_LABELS[status] ?? status,
      tone: toneOfRequest(status),
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
      facts: [
        { label: "Déposée le", value: frDate(request.createdAt) },
        ...(request.locationLabel ? [{ label: "Lieu", value: request.locationLabel }] : []),
        ...(request.category ? [{ label: "Catégorie", value: request.category }] : []),
        ...(request.resolvedAt ? [{ label: "Traitée le", value: frDate(request.resolvedAt) }] : []),
      ],
      timeline: [
        { label: "Demande reçue", date: request.createdAt, done: true, current: status === "NOUVEAU" },
        {
          label: "Prise en charge par un agent",
          date: status !== "NOUVEAU" ? request.updatedAt : null,
          done: status !== "NOUVEAU",
          current: status === "EN_COURS",
        },
        {
          label: "Traitement terminé",
          date: request.resolvedAt,
          done: status === "TRAITE" || status === "CLOS",
          current: status === "TRAITE",
        },
      ],
      messages: request.messages.map((message) => ({
        author: message.author,
        authorName: message.authorName,
        body: message.body,
        createdAt: message.createdAt,
      })),
    };
  }

  /* ------------------------ Réservation de salle ------------------------ */
  const booking = await prisma.roomBooking.findFirst({
    where: { reference: ref, token: key },
    include: { room: { select: { name: true, slots: { select: { key: true, label: true } } } } },
  });

  if (booking) {
    const status = booking.status as BookingStatus;
    const slotLabel =
      booking.room.slots.find((slot) => slot.key === booking.slotKey)?.label ?? booking.slotKey;

    return {
      kind: "salle",
      reference: booking.reference,
      title: `${booking.room.name} — ${slotLabel}`,
      subtitle: booking.purpose,
      status,
      statusLabel: BOOKING_STATUS_LABELS[status] ?? status,
      tone: toneOfBooking(status),
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
      decisionMessage: booking.decisionMessage,
      facts: [
        { label: "Salle", value: booking.room.name },
        { label: "Créneau", value: slotLabel },
        { label: "Du", value: frDate(booking.startDate) },
        { label: "Au", value: frDate(booking.endDate) },
        { label: "Tarif", value: formatPrice(booking.amountCents) },
        {
          label: "Caution",
          value: formatPrice(booking.depositCents, { free: "Sans caution" }),
        },
        ...(booking.organizationName
          ? [{ label: "Structure", value: booking.organizationName }]
          : []),
      ],
      timeline: [
        { label: "Demande déposée", date: booking.createdAt, done: true, current: status === "EN_ATTENTE" },
        {
          label: "Pré-réservation (option posée)",
          date: status === "PREVALIDEE" || status === "CONFIRMEE" ? booking.decidedAt : null,
          done: status === "PREVALIDEE" || status === "CONFIRMEE",
          current: status === "PREVALIDEE",
        },
        {
          label: status === "REFUSEE" ? "Demande refusée" : status === "ANNULEE" ? "Réservation annulée" : "Réservation confirmée",
          date: booking.decidedAt,
          done: status === "CONFIRMEE" || status === "REFUSEE" || status === "ANNULEE",
          current: status === "CONFIRMEE" || status === "REFUSEE" || status === "ANNULEE",
        },
      ],
    };
  }

  /* -------------------------- Prêt de matériel -------------------------- */
  const loan = await prisma.equipmentLoan.findFirst({
    where: { reference: ref, token: key },
    include: { lines: { include: { item: { select: { name: true, unitLabel: true } } } } },
  });

  if (loan) {
    const status = loan.status as LoanStatus;
    return {
      kind: "materiel",
      reference: loan.reference,
      title: "Prêt de matériel communal",
      subtitle: loan.purpose,
      status,
      statusLabel: LOAN_STATUS_LABELS[status] ?? status,
      tone: toneOfLoan(status),
      createdAt: loan.createdAt,
      updatedAt: loan.updatedAt,
      decisionMessage: loan.decisionMessage,
      facts: [
        { label: "Retrait prévu", value: frDate(loan.pickupDate) },
        { label: "Restitution prévue", value: frDate(loan.returnDate) },
        {
          label: "Matériel",
          value: loan.lines
            .map((line) => `${line.quantity} × ${line.item.name}`)
            .join(", "),
        },
        { label: "Caution", value: formatPrice(loan.depositCents, { free: "Aucune" }) },
        {
          label: "Transport",
          value: loan.transport === "RETRAIT" ? "Retrait par le demandeur" : "Livraison demandée",
        },
        ...(loan.organizationName ? [{ label: "Structure", value: loan.organizationName }] : []),
      ],
      timeline: [
        { label: "Demande déposée", date: loan.createdAt, done: true, current: status === "EN_ATTENTE" },
        {
          label: status === "REFUSEE" ? "Demande refusée" : "Prêt accordé",
          date: loan.decidedAt,
          done: ["CONFIRMEE", "SORTIE", "RETOURNEE", "REFUSEE"].includes(status),
          current: status === "CONFIRMEE" || status === "REFUSEE",
        },
        {
          label: "Matériel retiré",
          date: status === "SORTIE" || status === "RETOURNEE" ? loan.updatedAt : null,
          done: status === "SORTIE" || status === "RETOURNEE",
          current: status === "SORTIE",
        },
        {
          label: "Matériel restitué",
          date: status === "RETOURNEE" ? loan.updatedAt : null,
          done: status === "RETOURNEE",
          current: status === "RETOURNEE",
        },
      ],
    };
  }

  return null;
}
