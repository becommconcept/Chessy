"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { can, recordAudit, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  BOOKING_STATUSES,
  BOOKING_STATUS_LABELS,
  LOAN_STATUSES,
  LOAN_STATUS_LABELS,
  PRIORITIES,
  REQUEST_STATUSES,
  REQUEST_STATUS_LABELS,
  type BookingStatus,
  type LoanStatus,
  type RequestStatus,
  type Role,
} from "@/lib/enums";
import { sendMail } from "@/lib/notify";
import { formatDate, formatPrice } from "@/lib/utils";

async function requireHandler(returnTo = "/admin") {
  const user = await requireUser(returnTo);
  if (!can.handleRequests(user.role as Role)) redirect("/admin?acces=refuse");
  return user;
}

const text = (formData: FormData, key: string): string => String(formData.get(key) ?? "").trim();

/** Courriel type informant l'usager d'une décision. */
function decisionMail(input: {
  to: string;
  name: string;
  reference: string;
  subject: string;
  statusLabel: string;
  message?: string | null;
  details?: string[];
}) {
  return {
    to: input.to,
    subject: `[Mairie de Chessy-les-Mines] ${input.subject} — ${input.statusLabel} (${input.reference})`,
    text: [
      `Bonjour ${input.name},`,
      "",
      `Votre demande ${input.reference} — ${input.subject} — a été instruite.`,
      `Nouvel état : ${input.statusLabel}.`,
      ...(input.details && input.details.length > 0 ? ["", ...input.details] : []),
      ...(input.message ? ["", "Message du service :", input.message] : []),
      "",
      "Pour toute question, contactez l'accueil de la mairie au 04 78 43 92 03.",
      "",
      "Bien cordialement,",
      "Mairie de Chessy-les-Mines",
    ].join("\n"),
  };
}

/* ========================= Réservations de salle ========================== */

export async function deciderReservation(formData: FormData): Promise<void> {
  const user = await requireHandler("/admin/reservations/salles");

  const id = text(formData, "id");
  const status = text(formData, "statut");
  if (!id || !BOOKING_STATUSES.includes(status as BookingStatus)) return;

  const booking = await prisma.roomBooking.findUnique({
    where: { id },
    include: { room: { select: { name: true } } },
  });
  if (!booking) return;

  const message = text(formData, "message") || null;
  const adminNote = text(formData, "note") || null;
  const amountCents = Number(formData.get("montant"));
  const depositCents = Number(formData.get("caution"));

  await prisma.roomBooking.update({
    where: { id },
    data: {
      status,
      decisionMessage: message,
      adminNote,
      amountCents: Number.isFinite(amountCents) && amountCents >= 0 ? Math.round(amountCents) : booking.amountCents,
      depositCents:
        Number.isFinite(depositCents) && depositCents >= 0 ? Math.round(depositCents) : booking.depositCents,
      decidedAt: new Date(),
      decidedById: user.id,
    },
  });

  const statusLabel = BOOKING_STATUS_LABELS[status as BookingStatus];

  await recordAudit({
    userId: user.id,
    action: "DECISION",
    entity: "RoomBooking",
    entityId: id,
    label: `${booking.reference} — ${booking.room.name}`,
    detail: statusLabel,
  });

  // L'usager n'est prévenu que lorsque la décision le concerne réellement.
  if (["CONFIRMEE", "PREVALIDEE", "REFUSEE", "ANNULEE"].includes(status)) {
    await sendMail(
      decisionMail({
        to: booking.applicantEmail,
        name: booking.applicantName,
        reference: booking.reference,
        subject: `Réservation de la ${booking.room.name}`,
        statusLabel,
        message,
        details: [
          `Dates : du ${formatDate(booking.startDate)} au ${formatDate(booking.endDate)}`,
          `Tarif : ${formatPrice(booking.amountCents)}`,
          `Caution : ${formatPrice(booking.depositCents, { free: "sans caution" })}`,
        ],
      }),
    );
  }

  revalidatePath("/admin/reservations/salles");
  revalidatePath(`/admin/reservations/salles/${id}`);
  revalidatePath("/admin");
  revalidatePath("/services/salle-des-fetes");
}

/* ============================ Prêts de matériel =========================== */

export async function deciderPret(formData: FormData): Promise<void> {
  const user = await requireHandler("/admin/reservations/materiel");

  const id = text(formData, "id");
  const status = text(formData, "statut");
  if (!id || !LOAN_STATUSES.includes(status as LoanStatus)) return;

  const loan = await prisma.equipmentLoan.findUnique({ where: { id } });
  if (!loan) return;

  const message = text(formData, "message") || null;
  const adminNote = text(formData, "note") || null;

  await prisma.equipmentLoan.update({
    where: { id },
    data: {
      status,
      decisionMessage: message,
      adminNote,
      decidedAt: new Date(),
      decidedById: user.id,
    },
  });

  const statusLabel = LOAN_STATUS_LABELS[status as LoanStatus];

  await recordAudit({
    userId: user.id,
    action: "DECISION",
    entity: "EquipmentLoan",
    entityId: id,
    label: loan.reference,
    detail: statusLabel,
  });

  if (["CONFIRMEE", "REFUSEE", "ANNULEE"].includes(status)) {
    await sendMail(
      decisionMail({
        to: loan.applicantEmail,
        name: loan.applicantName,
        reference: loan.reference,
        subject: "Prêt de matériel communal",
        statusLabel,
        message,
        details: [
          `Retrait : ${formatDate(loan.pickupDate)}`,
          `Restitution : ${formatDate(loan.returnDate)}`,
          `Caution : ${formatPrice(loan.depositCents, { free: "aucune" })}`,
        ],
      }),
    );
  }

  revalidatePath("/admin/reservations/materiel");
  revalidatePath(`/admin/reservations/materiel/${id}`);
  revalidatePath("/admin");
  revalidatePath("/services/pret-de-materiel");
}

/* ============================ Demandes citoyennes ========================= */

export async function mettreAJourDemande(formData: FormData): Promise<void> {
  const user = await requireHandler("/admin/demandes");

  const id = text(formData, "id");
  const status = text(formData, "statut");
  if (!id) return;

  const request = await prisma.request.findUnique({ where: { id } });
  if (!request) return;

  const priority = text(formData, "priorite");
  const assignedTo = text(formData, "affectation");
  const adminNote = text(formData, "note") || null;

  await prisma.request.update({
    where: { id },
    data: {
      status: REQUEST_STATUSES.includes(status as RequestStatus) ? status : request.status,
      priority: PRIORITIES.includes(priority as never) ? priority : request.priority,
      assignedToId: assignedTo || null,
      adminNote,
      resolvedAt:
        status === "TRAITE" || status === "CLOS" ? (request.resolvedAt ?? new Date()) : null,
    },
  });

  await recordAudit({
    userId: user.id,
    action: "UPDATE",
    entity: "Request",
    entityId: id,
    label: `${request.reference} — ${request.subject}`,
    detail: REQUEST_STATUS_LABELS[status as RequestStatus] ?? status,
  });

  revalidatePath("/admin/demandes");
  revalidatePath(`/admin/demandes/${id}`);
  revalidatePath("/admin");
}

/** Ajoute une réponse au fil de discussion et la transmet par courriel. */
export async function repondreDemande(formData: FormData): Promise<void> {
  const user = await requireHandler("/admin/demandes");

  const id = text(formData, "id");
  const body = text(formData, "reponse");
  if (!id || body.length < 2) return;

  const request = await prisma.request.findUnique({ where: { id } });
  if (!request) return;

  await prisma.requestMessage.create({
    data: { requestId: id, author: "MAIRIE", authorName: user.name, body },
  });

  // Une réponse fait automatiquement passer la demande « en cours ».
  if (request.status === "NOUVEAU") {
    await prisma.request.update({ where: { id }, data: { status: "EN_COURS" } });
  }

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  await sendMail({
    to: request.email,
    subject: `[Mairie de Chessy-les-Mines] Réponse à votre demande ${request.reference}`,
    text: [
      `Bonjour ${request.name},`,
      "",
      `Voici la réponse du service concernant votre demande « ${request.subject} » (${request.reference}) :`,
      "",
      body,
      "",
      `Suivre votre demande : ${base}/suivi?ref=${encodeURIComponent(request.reference)}&cle=${request.token}`,
      "",
      "Bien cordialement,",
      `${user.name} — Mairie de Chessy-les-Mines`,
    ].join("\n"),
  });

  await recordAudit({
    userId: user.id,
    action: "UPDATE",
    entity: "Request",
    entityId: id,
    label: `${request.reference} — réponse envoyée`,
  });

  revalidatePath(`/admin/demandes/${id}`);
  revalidatePath("/admin/demandes");
  revalidatePath("/admin");
}

export async function supprimerDemande(id: string): Promise<void> {
  const user = await requireHandler();
  const request = await prisma.request.findUnique({ where: { id }, select: { reference: true, subject: true } });
  if (!request) return;

  await prisma.request.delete({ where: { id } });
  await recordAudit({
    userId: user.id,
    action: "DELETE",
    entity: "Request",
    entityId: id,
    label: `${request.reference} — ${request.subject}`,
  });

  revalidatePath("/admin/demandes");
  revalidatePath("/admin");
  redirect("/admin/demandes?supprimee=1");
}

/* ========================= Fermetures de salle ============================ */

export async function ajouterFermeture(formData: FormData): Promise<void> {
  const user = await requireHandler("/admin/ressources");

  const roomId = text(formData, "salle");
  const reason = text(formData, "motif");
  const start = text(formData, "debut");
  const end = text(formData, "fin") || start;

  if (!roomId || !reason || !start) return;

  const startDate = new Date(`${start}T12:00:00`);
  const endDate = new Date(`${end}T12:00:00`);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return;

  await prisma.roomClosure.create({
    data: {
      roomId,
      reason,
      startDate,
      endDate: endDate < startDate ? startDate : endDate,
    },
  });

  await recordAudit({
    userId: user.id,
    action: "CREATE",
    entity: "RoomClosure",
    label: reason,
    detail: `${start} → ${end}`,
  });

  revalidatePath("/admin/ressources");
  revalidatePath("/services/salle-des-fetes");
}

export async function supprimerFermeture(id: string): Promise<void> {
  const user = await requireHandler();
  const closure = await prisma.roomClosure.findUnique({ where: { id }, select: { reason: true } });
  if (!closure) return;

  await prisma.roomClosure.delete({ where: { id } });
  await recordAudit({
    userId: user.id,
    action: "DELETE",
    entity: "RoomClosure",
    entityId: id,
    label: closure.reason,
  });

  revalidatePath("/admin/ressources");
  revalidatePath("/services/salle-des-fetes");
}
