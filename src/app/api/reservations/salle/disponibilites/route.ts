import { NextRequest, NextResponse } from "next/server";

import { getRoomCalendar, getRooms } from "@/lib/booking";
import { fromISODate } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * Calendrier d'occupation d'une salle.
 *
 * Exemple : /api/reservations/salle/disponibilites?salle=salle-des-fetes&debut=2026-09-01&fin=2026-10-31
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const slug = params.get("salle");
  if (!slug) return NextResponse.json({ error: "Paramètre « salle » manquant." }, { status: 400 });

  const rooms = await getRooms();
  const room = rooms.find((entry) => entry.slug === slug);
  if (!room) return NextResponse.json({ error: "Salle inconnue." }, { status: 404 });

  const from = params.get("debut") ? fromISODate(params.get("debut")!) : new Date();
  const to = params.get("fin")
    ? fromISODate(params.get("fin")!)
    : new Date(from.getFullYear(), from.getMonth() + 3, 0);

  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    return NextResponse.json({ error: "Dates invalides." }, { status: 400 });
  }

  // Bornage à un an pour éviter les requêtes déraisonnables.
  const maxTo = new Date(from);
  maxTo.setFullYear(maxTo.getFullYear() + 1);
  const boundedTo = to > maxTo ? maxTo : to;

  const calendar = await getRoomCalendar(room.id, from, boundedTo);
  return NextResponse.json({ salle: room.slug, calendrier: calendar });
}
