import { NextResponse } from "next/server";
import { z } from "zod";

import { checkBooking, getRooms } from "@/lib/booking";
import { prisma } from "@/lib/db";
import { AUDIENCES, AUDIENCE_LABELS, type Audience } from "@/lib/enums";
import { acknowledgementMail, internalMail, sendMail } from "@/lib/notify";
import { nextReference, REFERENCE_PREFIXES } from "@/lib/references";
import { formatDate, formatPrice } from "@/lib/utils";

const schema = z.object({
  roomSlug: z.string().trim().min(1),
  slotKey: z.string().trim().min(1),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide."),
  audience: z.enum(AUDIENCES),
  purpose: z.string().trim().min(3, "Précisez la nature de la manifestation.").max(200),
  expectedAttendees: z.coerce.number().int().min(1).max(2000).optional(),
  organizationName: z.string().trim().max(160).optional(),
  applicantName: z.string().trim().min(2, "Merci d'indiquer votre nom.").max(120),
  applicantEmail: z.string().trim().toLowerCase().email("Adresse électronique invalide."),
  applicantPhone: z.string().trim().min(6, "Un numéro de téléphone est nécessaire.").max(30),
  applicantAddress: z.string().trim().max(200).optional(),
  needsTables: z.boolean().optional(),
  needsChairs: z.boolean().optional(),
  needsKitchen: z.boolean().optional(),
  needsBar: z.boolean().optional(),
  comment: z.string().trim().max(2000).optional(),
  acceptRules: z.boolean().refine((value) => value, {
    message: "Merci de prendre connaissance du règlement d'utilisation.",
  }),
  consentRgpd: z.boolean().refine((value) => value, {
    message: "Merci d'accepter le traitement de vos données.",
  }),
});

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Requête invalide." }, { status: 400 });
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: parsed.error.issues[0]?.message ?? "Formulaire incomplet." },
      { status: 400 },
    );
  }

  const data = parsed.data;

  // Le contrôle de disponibilité et de tarif est refait côté serveur : les
  // valeurs affichées dans le navigateur ne font jamais foi.
  const check = await checkBooking({
    roomSlug: data.roomSlug,
    slotKey: data.slotKey,
    audience: data.audience,
    startDate: data.startDate,
  });

  if (!check.ok) {
    return NextResponse.json({ ok: false, message: check.error }, { status: 409 });
  }

  const rooms = await getRooms();
  const room = rooms.find((entry) => entry.slug === data.roomSlug)!;
  const slot = room.slots.find((entry) => entry.key === data.slotKey)!;

  const { reference, token } = await nextReference("roomBooking", REFERENCE_PREFIXES.SALLE);

  const booking = await prisma.roomBooking.create({
    data: {
      reference,
      token,
      roomId: room.id,
      startDate: check.startDate,
      endDate: check.endDate,
      slotKey: data.slotKey,
      audience: data.audience,
      purpose: data.purpose,
      expectedAttendees: data.expectedAttendees ?? null,
      organizationName: data.organizationName || null,
      applicantName: data.applicantName,
      applicantEmail: data.applicantEmail,
      applicantPhone: data.applicantPhone,
      applicantAddress: data.applicantAddress || null,
      needsTables: Boolean(data.needsTables),
      needsChairs: Boolean(data.needsChairs),
      needsKitchen: Boolean(data.needsKitchen),
      needsBar: Boolean(data.needsBar),
      comment: data.comment || null,
      amountCents: check.amountCents,
      depositCents: check.depositCents,
      status: "EN_ATTENTE",
    },
    select: { id: true, reference: true, token: true },
  });

  await Promise.all([
    sendMail(
      acknowledgementMail({
        to: data.applicantEmail,
        name: data.applicantName,
        reference: booking.reference,
        token: booking.token,
        subject: `${room.name} — ${slot.label} du ${formatDate(check.startDate)}`,
        kind: "Demande de réservation de salle",
      }),
    ),
    sendMail(
      internalMail({
        subject: `Réservation ${room.name}`,
        reference: booking.reference,
        summary: [
          `Salle     : ${room.name}`,
          `Créneau   : ${slot.label}`,
          `Dates     : du ${formatDate(check.startDate)} au ${formatDate(check.endDate)}`,
          `Situation : ${AUDIENCE_LABELS[data.audience as Audience]}`,
          `Objet     : ${data.purpose}`,
          data.organizationName ? `Structure : ${data.organizationName}` : null,
          `Demandeur : ${data.applicantName} <${data.applicantEmail}> — ${data.applicantPhone}`,
          data.expectedAttendees ? `Effectif  : ${data.expectedAttendees} personnes` : null,
          `Tarif     : ${formatPrice(check.amountCents)} — caution ${formatPrice(check.depositCents)}`,
          data.comment ? `\nCommentaire :\n${data.comment}` : null,
        ].filter((line): line is string => line !== null),
        adminPath: `/admin/reservations/salles/${booking.id}`,
      }),
    ),
  ]);

  return NextResponse.json({
    ok: true,
    reference: booking.reference,
    token: booking.token,
    amountCents: check.amountCents,
    depositCents: check.depositCents,
  });
}
