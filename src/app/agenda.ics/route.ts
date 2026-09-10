import { prisma } from "@/lib/db";
import { buildCalendar } from "@/lib/ical";
import { stripHtml, truncate } from "@/lib/utils";

export const revalidate = 600;

/** Agenda complet de la commune, à s'abonner depuis son propre calendrier. */
export async function GET() {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const events = await prisma.event.findMany({
    where: { status: "PUBLIEE" },
    orderBy: { startAt: "asc" },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      description: true,
      startAt: true,
      endAt: true,
      allDay: true,
      place: true,
      address: true,
      updatedAt: true,
    },
  });

  const calendar = buildCalendar(
    events.map((event) => ({
      uid: `${event.id}@chessy69.fr`,
      title: event.title,
      description: truncate(event.excerpt ?? stripHtml(event.description), 500),
      location: [event.place, event.address].filter(Boolean).join(", ") || "Chessy-les-Mines",
      start: event.startAt,
      end: event.endAt,
      allDay: event.allDay,
      url: `${base}/agenda/${event.slug}`,
      updatedAt: event.updatedAt,
    })),
    "Agenda de Chessy-les-Mines",
  );

  return new Response(calendar, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="agenda-chessy-les-mines.ics"',
    },
  });
}
