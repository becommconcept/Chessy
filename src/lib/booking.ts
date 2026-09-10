import { prisma } from "@/lib/db";
import {
  AUDIENCE_LABELS,
  BOOKING_BLOCKING_STATUSES,
  LOAN_BLOCKING_STATUSES,
  type Audience,
} from "@/lib/enums";
import { addDays, daysBetween, fromISODate, rangesOverlap, safeJson, toISODate } from "@/lib/utils";

/* ========================================================================= */
/* Réservation de salle                                                      */
/* ========================================================================= */

export type RoomSlotInfo = {
  key: string;
  label: string;
  details: string | null;
  startDow: number | null;
  days: number;
};

export type RoomTariffInfo = {
  audience: string;
  slotKey: string;
  label: string;
  amountCents: number;
  depositCents: number;
  notes: string | null;
};

export type RoomPublic = {
  id: string;
  slug: string;
  name: string;
  subtitle: string | null;
  description: string;
  capacitySeated: number | null;
  capacityStanding: number | null;
  surface: number | null;
  address: string | null;
  equipments: string[];
  rules: string | null;
  bookingWindowDays: number;
  minNoticeDays: number;
  image: { url: string; alt: string } | null;
  slots: RoomSlotInfo[];
  tariffs: RoomTariffInfo[];
};

/** Motif d'indisponibilité d'une journée. */
export type DayStatus =
  | { state: "libre" }
  | { state: "occupee"; reason: string }
  | { state: "fermee"; reason: string }
  | { state: "delai"; reason: string }
  | { state: "hors-fenetre"; reason: string };

export async function getRooms(): Promise<RoomPublic[]> {
  const rooms = await prisma.room.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
    include: {
      image: { select: { url: true, alt: true } },
      slots: { orderBy: { order: "asc" } },
      tariffs: true,
    },
  });

  return rooms.map((room) => ({
    id: room.id,
    slug: room.slug,
    name: room.name,
    subtitle: room.subtitle,
    description: room.description,
    capacitySeated: room.capacitySeated,
    capacityStanding: room.capacityStanding,
    surface: room.surface,
    address: room.address,
    equipments: safeJson<string[]>(room.equipments, []),
    rules: room.rules,
    bookingWindowDays: room.bookingWindowDays,
    minNoticeDays: room.minNoticeDays,
    image: room.image,
    slots: room.slots.map((slot) => ({
      key: slot.key,
      label: slot.label,
      details: slot.details,
      startDow: slot.startDow,
      days: slot.days,
    })),
    tariffs: room.tariffs.map((tariff) => ({
      audience: tariff.audience,
      slotKey: tariff.slotKey,
      label: tariff.label,
      amountCents: tariff.amountCents,
      depositCents: tariff.depositCents,
      notes: tariff.notes,
    })),
  }));
}

/**
 * Construit le calendrier d'occupation d'une salle sur une période.
 *
 * Une journée peut être indisponible pour quatre raisons : une réservation
 * existante (y compris une demande encore en instruction, qui pose une option
 * sur le créneau), une fermeture programmée, le délai minimum d'anticipation,
 * ou le dépassement de la fenêtre de réservation.
 */
export async function getRoomCalendar(
  roomId: string,
  from: Date,
  to: Date,
): Promise<Record<string, DayStatus>> {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    select: { bookingWindowDays: true, minNoticeDays: true },
  });
  if (!room) return {};

  const [bookings, closures] = await Promise.all([
    prisma.roomBooking.findMany({
      where: {
        roomId,
        status: { in: BOOKING_BLOCKING_STATUSES },
        endDate: { gte: from },
        startDate: { lte: to },
      },
      select: { startDate: true, endDate: true, status: true, purpose: true },
    }),
    prisma.roomClosure.findMany({
      where: { roomId, endDate: { gte: from }, startDate: { lte: to } },
      select: { startDate: true, endDate: true, reason: true },
    }),
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const earliest = addDays(today, room.minNoticeDays);
  const latest = addDays(today, room.bookingWindowDays);

  const calendar: Record<string, DayStatus> = {};
  const cursor = new Date(from);
  cursor.setHours(12, 0, 0, 0);

  let guard = 0;
  while (cursor <= to && guard < 800) {
    guard += 1;
    const key = toISODate(cursor);
    const day = new Date(cursor);
    day.setHours(12, 0, 0, 0);

    const closure = closures.find((entry) =>
      rangesOverlap(day, day, atNoon(entry.startDate), atNoon(entry.endDate)),
    );
    const booking = bookings.find((entry) =>
      rangesOverlap(day, day, atNoon(entry.startDate), atNoon(entry.endDate)),
    );

    if (closure) {
      calendar[key] = { state: "fermee", reason: closure.reason };
    } else if (booking) {
      calendar[key] = {
        state: "occupee",
        reason:
          booking.status === "CONFIRMEE"
            ? "Salle déjà réservée"
            : "Créneau demandé par un autre usager (en instruction)",
      };
    } else if (day < earliest) {
      calendar[key] = {
        state: "delai",
        reason: `Demande à déposer au moins ${room.minNoticeDays} jours avant la date`,
      };
    } else if (day > latest) {
      calendar[key] = {
        state: "hors-fenetre",
        reason: `Réservations ouvertes au plus tôt ${room.bookingWindowDays} jours à l'avance`,
      };
    } else {
      calendar[key] = { state: "libre" };
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  return calendar;
}

function atNoon(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(12, 0, 0, 0);
  return copy;
}

/** Tarif applicable, ou `null` si la combinaison n'est pas prévue. */
export function findTariff(
  room: RoomPublic,
  audience: string,
  slotKey: string,
): RoomTariffInfo | null {
  return (
    room.tariffs.find((tariff) => tariff.audience === audience && tariff.slotKey === slotKey) ?? null
  );
}

export type BookingCheck =
  | { ok: true; startDate: Date; endDate: Date; amountCents: number; depositCents: number }
  | { ok: false; error: string };

/**
 * Contrôle une demande de réservation de bout en bout.
 *
 * La même fonction est utilisée par l'API publique et par le back-office :
 * les règles de délai, de créneau et de disponibilité ne peuvent donc pas
 * diverger entre les deux.
 */
export async function checkBooking(input: {
  roomSlug: string;
  slotKey: string;
  audience: string;
  startDate: string;
}): Promise<BookingCheck> {
  const rooms = await getRooms();
  const room = rooms.find((entry) => entry.slug === input.roomSlug);
  if (!room) return { ok: false, error: "Salle inconnue." };

  const slot = room.slots.find((entry) => entry.key === input.slotKey);
  if (!slot) return { ok: false, error: "Créneau indisponible pour cette salle." };

  const tariff = findTariff(room, input.audience, input.slotKey);
  if (!tariff) {
    return {
      ok: false,
      error: `Aucun tarif n'est défini pour « ${AUDIENCE_LABELS[input.audience as Audience] ?? input.audience} » sur ce créneau. Contactez la mairie.`,
    };
  }

  let startDate: Date;
  try {
    startDate = fromISODate(input.startDate);
    if (Number.isNaN(startDate.getTime())) throw new Error("date invalide");
  } catch {
    return { ok: false, error: "Date de début invalide." };
  }

  if (slot.startDow !== null && startDate.getDay() !== slot.startDow) {
    const dayNames = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
    return {
      ok: false,
      error: `Le créneau « ${slot.label} » débute obligatoirement un ${dayNames[slot.startDow]}.`,
    };
  }

  const endDate = addDays(startDate, slot.days - 1);

  const calendar = await getRoomCalendar(room.id, startDate, endDate);
  for (const [key, status] of Object.entries(calendar)) {
    if (status.state !== "libre") {
      const date = fromISODate(key).toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });
      return { ok: false, error: `Le ${date} n'est pas disponible : ${status.reason.toLowerCase()}.` };
    }
  }

  return {
    ok: true,
    startDate,
    endDate,
    amountCents: tariff.amountCents,
    depositCents: tariff.depositCents,
  };
}

/* ========================================================================= */
/* Prêt de matériel                                                          */
/* ========================================================================= */

export type EquipmentItemPublic = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string | null;
  unitLabel: string;
  quantityTotal: number;
  depositCents: number;
  feeCents: number;
  requiresVehicle: boolean;
  reservedForAssociations: boolean;
  image: { url: string; alt: string } | null;
};

export async function getEquipmentItems(): Promise<EquipmentItemPublic[]> {
  const items = await prisma.equipmentItem.findMany({
    where: { active: true },
    orderBy: [{ category: "asc" }, { order: "asc" }],
    include: { image: { select: { url: true, alt: true } } },
  });

  return items.map((item) => ({
    id: item.id,
    slug: item.slug,
    name: item.name,
    category: item.category,
    description: item.description,
    unitLabel: item.unitLabel,
    quantityTotal: item.quantityTotal,
    depositCents: item.depositCents,
    feeCents: item.feeCents,
    requiresVehicle: item.requiresVehicle,
    reservedForAssociations: item.reservedForAssociations,
    image: item.image,
  }));
}

/**
 * Quantités déjà engagées sur une période, par article.
 *
 * Un prêt occupe le matériel du retrait à la restitution incluse : deux
 * demandes qui se chevauchent, même d'une seule journée, se partagent le stock.
 */
export async function getEquipmentUsage(
  pickupDate: Date,
  returnDate: Date,
  excludeLoanId?: string,
): Promise<Record<string, number>> {
  const loans = await prisma.equipmentLoan.findMany({
    where: {
      status: { in: LOAN_BLOCKING_STATUSES },
      returnDate: { gte: pickupDate },
      pickupDate: { lte: returnDate },
      ...(excludeLoanId ? { id: { not: excludeLoanId } } : {}),
    },
    select: { lines: { select: { itemId: true, quantity: true } } },
  });

  const usage: Record<string, number> = {};
  for (const loan of loans) {
    for (const line of loan.lines) {
      usage[line.itemId] = (usage[line.itemId] ?? 0) + line.quantity;
    }
  }
  return usage;
}

export type LoanCheck =
  | {
      ok: true;
      pickupDate: Date;
      returnDate: Date;
      lines: Array<{ itemId: string; quantity: number }>;
      depositCents: number;
      feeCents: number;
    }
  | { ok: false; error: string };

/** Nombre de jours maximum d'un prêt (règle du règlement communal). */
export const MAX_LOAN_DAYS = 10;
/** Délai minimum entre la demande et le retrait. */
export const MIN_LOAN_NOTICE_DAYS = 7;

export async function checkLoan(input: {
  pickupDate: string;
  returnDate: string;
  audience: string;
  lines: Array<{ slug: string; quantity: number }>;
}): Promise<LoanCheck> {
  const pickupDate = fromISODate(input.pickupDate);
  const returnDate = fromISODate(input.returnDate);

  if (Number.isNaN(pickupDate.getTime()) || Number.isNaN(returnDate.getTime())) {
    return { ok: false, error: "Dates de retrait ou de restitution invalides." };
  }
  if (returnDate < pickupDate) {
    return { ok: false, error: "La date de restitution doit suivre la date de retrait." };
  }

  const duration = daysBetween(pickupDate, returnDate);
  if (duration > MAX_LOAN_DAYS) {
    return {
      ok: false,
      error: `La durée d'un prêt est limitée à ${MAX_LOAN_DAYS} jours. Pour une durée plus longue, contactez la mairie.`,
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (pickupDate < addDays(today, MIN_LOAN_NOTICE_DAYS)) {
    return {
      ok: false,
      error: `Le retrait doit être demandé au moins ${MIN_LOAN_NOTICE_DAYS} jours à l'avance.`,
    };
  }

  const requested = input.lines.filter((line) => line.quantity > 0);
  if (requested.length === 0) {
    return { ok: false, error: "Sélectionnez au moins un matériel." };
  }

  const items = await getEquipmentItems();
  const usage = await getEquipmentUsage(pickupDate, returnDate);

  const lines: Array<{ itemId: string; quantity: number }> = [];
  let depositCents = 0;
  let feeCents = 0;

  for (const line of requested) {
    const item = items.find((entry) => entry.slug === line.slug);
    if (!item) return { ok: false, error: `Matériel inconnu : ${line.slug}.` };

    if (item.reservedForAssociations && input.audience === "HABITANT") {
      return {
        ok: false,
        error: `« ${item.name} » est réservé aux associations et aux organisateurs de manifestations. Contactez la mairie pour un cas particulier.`,
      };
    }

    const available = item.quantityTotal - (usage[item.id] ?? 0);
    if (line.quantity > available) {
      return {
        ok: false,
        error:
          available <= 0
            ? `« ${item.name} » n'est plus disponible sur cette période.`
            : `Seulement ${available} ${item.unitLabel}${available > 1 ? "s" : ""} de « ${item.name} » ${available > 1 ? "sont" : "est"} disponible${available > 1 ? "s" : ""} sur cette période.`,
      };
    }

    lines.push({ itemId: item.id, quantity: line.quantity });
    depositCents += item.depositCents;
    feeCents += item.feeCents * line.quantity;
  }

  return { ok: true, pickupDate, returnDate, lines, depositCents, feeCents };
}
