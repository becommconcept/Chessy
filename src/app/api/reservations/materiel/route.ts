import { NextResponse } from "next/server";
import { z } from "zod";

import { checkLoan, getEquipmentItems } from "@/lib/booking";
import { prisma } from "@/lib/db";
import { AUDIENCES, AUDIENCE_LABELS, type Audience } from "@/lib/enums";
import { acknowledgementMail, internalMail, sendMail } from "@/lib/notify";
import { nextReference, REFERENCE_PREFIXES } from "@/lib/references";
import { formatDate, formatPrice } from "@/lib/utils";

const schema = z.object({
  pickupDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date de retrait invalide."),
  returnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date de restitution invalide."),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
  audience: z.enum(AUDIENCES),
  purpose: z.string().trim().min(3, "Précisez l'usage prévu du matériel.").max(300),
  organizationName: z.string().trim().max(160).optional(),
  applicantName: z.string().trim().min(2, "Merci d'indiquer votre nom.").max(120),
  applicantEmail: z.string().trim().toLowerCase().email("Adresse électronique invalide."),
  applicantPhone: z.string().trim().min(6, "Un numéro de téléphone est nécessaire.").max(30),
  applicantAddress: z.string().trim().max(200).optional(),
  transport: z.enum(["RETRAIT", "LIVRAISON_DEMANDEE"]).default("RETRAIT"),
  lines: z
    .array(z.object({ slug: z.string().trim().min(1), quantity: z.coerce.number().int().min(1).max(500) }))
    .min(1, "Sélectionnez au moins un matériel."),
  acceptRules: z.boolean().refine((value) => value, {
    message: "Merci de prendre connaissance du règlement de prêt.",
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

  const check = await checkLoan({
    pickupDate: data.pickupDate,
    returnDate: data.returnDate,
    audience: data.audience,
    lines: data.lines,
  });

  if (!check.ok) {
    return NextResponse.json({ ok: false, message: check.error }, { status: 409 });
  }

  const { reference, token } = await nextReference("equipmentLoan", REFERENCE_PREFIXES.MATERIEL);
  const items = await getEquipmentItems();

  const loan = await prisma.equipmentLoan.create({
    data: {
      reference,
      token,
      applicantName: data.applicantName,
      applicantEmail: data.applicantEmail,
      applicantPhone: data.applicantPhone,
      applicantAddress: data.applicantAddress || null,
      organizationName: data.organizationName || null,
      audience: data.audience,
      purpose: data.purpose,
      eventDate: data.eventDate ? new Date(`${data.eventDate}T12:00:00`) : null,
      pickupDate: check.pickupDate,
      returnDate: check.returnDate,
      transport: data.transport,
      depositCents: check.depositCents,
      feeCents: check.feeCents,
      status: "EN_ATTENTE",
      lines: { create: check.lines },
    },
    select: { id: true, reference: true, token: true },
  });

  const detail = check.lines.map((line) => {
    const item = items.find((entry) => entry.id === line.itemId);
    return `  · ${line.quantity} × ${item?.name ?? line.itemId}`;
  });

  await Promise.all([
    sendMail(
      acknowledgementMail({
        to: data.applicantEmail,
        name: data.applicantName,
        reference: loan.reference,
        token: loan.token,
        subject: `Prêt de matériel du ${formatDate(check.pickupDate)} au ${formatDate(check.returnDate)}`,
        kind: "Demande de prêt de matériel",
      }),
    ),
    sendMail(
      internalMail({
        subject: "Prêt de matériel",
        reference: loan.reference,
        summary: [
          `Retrait   : ${formatDate(check.pickupDate)}`,
          `Retour    : ${formatDate(check.returnDate)}`,
          `Situation : ${AUDIENCE_LABELS[data.audience as Audience]}`,
          `Usage     : ${data.purpose}`,
          data.organizationName ? `Structure : ${data.organizationName}` : null,
          `Demandeur : ${data.applicantName} <${data.applicantEmail}> — ${data.applicantPhone}`,
          `Transport : ${data.transport === "RETRAIT" ? "Retrait par le demandeur" : "Livraison demandée"}`,
          `Caution   : ${formatPrice(check.depositCents)}`,
          "",
          "Matériel demandé :",
          ...detail,
        ].filter((line): line is string => line !== null),
        adminPath: `/admin/reservations/materiel/${loan.id}`,
      }),
    ),
  ]);

  return NextResponse.json({
    ok: true,
    reference: loan.reference,
    token: loan.token,
    depositCents: check.depositCents,
    feeCents: check.feeCents,
  });
}
