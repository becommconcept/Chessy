import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { saveUpload } from "@/lib/upload";

/** Limite simple des dépôts anonymes, par adresse et par fenêtre glissante. */
const anonymousUploads = new Map<string, number[]>();
const ANONYMOUS_WINDOW_MS = 10 * 60 * 1000;
const ANONYMOUS_MAX = 6;

function tooManyAnonymousUploads(key: string): boolean {
  const now = Date.now();
  const history = (anonymousUploads.get(key) ?? []).filter(
    (timestamp) => now - timestamp < ANONYMOUS_WINDOW_MS,
  );
  if (history.length >= ANONYMOUS_MAX) {
    anonymousUploads.set(key, history);
    return true;
  }
  history.push(now);
  anonymousUploads.set(key, history);
  return false;
}

/**
 * Téléversement d'un fichier.
 *
 * Deux usages : la médiathèque du back-office (utilisateur authentifié, images
 * et PDF) et la photographie jointe à un signalement (dépôt anonyme, images
 * seulement, nombre limité par adresse).
 */
export async function POST(request: Request) {
  const user = await getSessionUser();

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Requête invalide." }, { status: 400 });
  }

  const file = formData.get("fichier");
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "Aucun fichier reçu." }, { status: 400 });
  }

  const requestedFolder = String(formData.get("dossier") ?? "general");

  if (!user) {
    // Dépôt anonyme : réservé aux photographies de signalement.
    if (requestedFolder !== "signalements") {
      return NextResponse.json(
        { ok: false, error: "Téléversement non autorisé." },
        { status: 401 },
      );
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "inconnu";

    if (tooManyAnonymousUploads(ip)) {
      return NextResponse.json(
        {
          ok: false,
          error: "Trop d'envois successifs. Patientez quelques minutes avant de réessayer.",
        },
        { status: 429 },
      );
    }
  }

  const result = await saveUpload({
    file,
    folder: requestedFolder,
    alt: String(formData.get("alt") ?? ""),
    credit: (formData.get("credit") as string) || undefined,
    uploadedById: user?.id ?? null,
    allow: user ? "tous" : "images",
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    mediaId: result.mediaId,
    url: result.url,
    mimeType: result.mimeType,
    size: result.size,
  });
}
