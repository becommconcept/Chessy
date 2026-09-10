import { NextRequest, NextResponse } from "next/server";

import { getEquipmentItems, getEquipmentUsage } from "@/lib/booking";
import { fromISODate } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * Stock disponible par article sur une période donnée.
 *
 * Exemple : /api/reservations/materiel/stock?retrait=2026-10-10&retour=2026-10-13
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const pickup = params.get("retrait");
  const back = params.get("retour");

  const items = await getEquipmentItems();

  if (!pickup || !back) {
    return NextResponse.json({
      stock: Object.fromEntries(items.map((item) => [item.slug, item.quantityTotal])),
    });
  }

  const pickupDate = fromISODate(pickup);
  const returnDate = fromISODate(back);
  if (Number.isNaN(pickupDate.getTime()) || Number.isNaN(returnDate.getTime())) {
    return NextResponse.json({ error: "Dates invalides." }, { status: 400 });
  }

  const usage = await getEquipmentUsage(pickupDate, returnDate);
  const stock = Object.fromEntries(
    items.map((item) => [item.slug, Math.max(item.quantityTotal - (usage[item.id] ?? 0), 0)]),
  );

  return NextResponse.json({ stock });
}
