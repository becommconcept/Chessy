import { NextRequest, NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { normalizeForSearch } from "@/lib/utils";

export const dynamic = "force-dynamic";

/** Liste des fichiers de la médiathèque, réservée aux comptes du back-office. */
export async function GET(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Accès refusé." }, { status: 401 });

  const params = request.nextUrl.searchParams;
  const folder = params.get("dossier") ?? "";
  const query = params.get("q") ?? "";
  const type = params.get("type") ?? "tous";

  const medias = await prisma.media.findMany({
    where: {
      ...(folder ? { folder } : {}),
      ...(type === "images"
        ? { mimeType: { startsWith: "image/" } }
        : type === "documents"
          ? { mimeType: "application/pdf" }
          : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      url: true,
      filename: true,
      alt: true,
      mimeType: true,
      size: true,
      width: true,
      height: true,
      folder: true,
      credit: true,
    },
  });

  // Le filtre textuel est appliqué en mémoire pour rester insensible aux
  // accents, ce que `LIKE` en SQLite ne permet pas.
  const needle = normalizeForSearch(query.trim());
  const filtered = needle
    ? medias.filter(
        (media) =>
          normalizeForSearch(media.filename).includes(needle) ||
          normalizeForSearch(media.alt).includes(needle),
      )
    : medias;

  return NextResponse.json({ medias: filtered });
}
