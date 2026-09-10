import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/db";
import { randomToken } from "@/lib/utils";

const schema = z.object({
  email: z.string().trim().toLowerCase().email("Adresse électronique invalide."),
  name: z.string().trim().max(120).optional(),
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
      { ok: false, message: parsed.error.issues[0]?.message ?? "Adresse invalide." },
      { status: 400 },
    );
  }

  const { email, name } = parsed.data;

  const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });
  if (existing) {
    // Réponse volontairement identique : l'existence d'un abonnement n'a pas à
    // être divulguée à un tiers qui saisirait l'adresse de quelqu'un d'autre.
    return NextResponse.json({
      ok: true,
      message: "Votre inscription est enregistrée. Merci de votre confiance.",
    });
  }

  await prisma.newsletterSubscriber.create({
    data: { email, name: name ?? null, token: randomToken(32), confirmed: true, confirmedAt: new Date() },
  });

  return NextResponse.json({
    ok: true,
    message: "Votre inscription est enregistrée. Merci de votre confiance.",
  });
}
