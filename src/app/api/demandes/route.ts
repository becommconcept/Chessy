import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { REQUEST_TYPES, SIGNALEMENT_CATEGORIES } from "@/lib/enums";
import { acknowledgementMail, internalMail, sendMail } from "@/lib/notify";
import { nextReference, REFERENCE_PREFIXES } from "@/lib/references";

const schema = z.object({
  type: z.enum(REQUEST_TYPES),
  category: z.enum(SIGNALEMENT_CATEGORIES).optional().nullable(),
  subject: z.string().trim().min(2, "Merci de préciser l'objet de votre demande.").max(180),
  subjectLibre: z.string().trim().max(180).optional(),
  message: z.string().trim().min(10, "Merci de détailler votre demande (10 caractères minimum).").max(4000),
  name: z.string().trim().min(2, "Merci d'indiquer votre nom.").max(120),
  email: z.string().trim().toLowerCase().email("Adresse électronique invalide."),
  phone: z.string().trim().max(30).optional(),
  address: z.string().trim().max(200).optional(),
  lat: z.coerce.number().min(-90).max(90).optional().nullable(),
  lng: z.coerce.number().min(-180).max(180).optional().nullable(),
  locationLabel: z.string().trim().max(200).optional(),
  photoId: z.string().trim().max(60).optional().nullable(),
  consentRgpd: z.boolean().refine((value) => value, {
    message: "Merci d'accepter le traitement de vos données pour envoyer votre demande.",
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
  const subject = (data.subjectLibre?.trim() || data.subject).slice(0, 180);
  const prefix = REFERENCE_PREFIXES[data.type];
  const { reference, token } = await nextReference("request", prefix);

  // Un signalement de voirie ou d'éclairage est traité en priorité haute.
  const priority =
    data.type === "SIGNALEMENT" && ["VOIRIE", "ECLAIRAGE", "EAU"].includes(data.category ?? "")
      ? "HAUTE"
      : "NORMALE";

  const created = await prisma.request.create({
    data: {
      reference,
      token,
      type: data.type,
      category: data.category ?? null,
      subject,
      message: data.message,
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      address: data.address || null,
      lat: data.lat ?? null,
      lng: data.lng ?? null,
      locationLabel: data.locationLabel || null,
      photoId: data.photoId || null,
      priority,
      consentRgpd: true,
    },
    select: { id: true, reference: true, token: true },
  });

  const kind =
    data.type === "SIGNALEMENT"
      ? "Signalement"
      : data.type === "RENDEZ_VOUS"
        ? "Demande de rendez-vous"
        : data.type === "SUGGESTION"
          ? "Suggestion"
          : "Message";

  await Promise.all([
    sendMail(
      acknowledgementMail({
        to: data.email,
        name: data.name,
        reference: created.reference,
        token: created.token,
        subject,
        kind,
      }),
    ),
    sendMail(
      internalMail({
        subject: `${kind} : ${subject}`,
        reference: created.reference,
        summary: [
          `Type      : ${kind}`,
          data.category ? `Catégorie : ${data.category}` : null,
          `Priorité  : ${priority}`,
          `Déposant  : ${data.name} <${data.email}>`,
          data.phone ? `Téléphone : ${data.phone}` : null,
          data.locationLabel ? `Lieu      : ${data.locationLabel}` : null,
          "",
          data.message,
        ].filter((line): line is string => line !== null),
        adminPath: `/admin/demandes/${created.id}`,
      }),
    ),
  ]);

  return NextResponse.json({ ok: true, reference: created.reference, token: created.token });
}
