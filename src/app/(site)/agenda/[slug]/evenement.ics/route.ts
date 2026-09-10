import { prisma } from "@/lib/db";
import { buildCalendar } from "@/lib/ical";
import { stripHtml, truncate } from "@/lib/utils";

/** Fichier iCalendar d'un évènement isolé. */
export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const event = await prisma.event.findFirst({
    where: { slug, status: "PUBLIEE" },
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

  if (!event) return new Response("Évènement introuvable", { status: 404 });

  const calendar = buildCalendar(
    [
      {
        uid: `${event.id}@chessy69.fr`,
        title: event.title,
        description: truncate(event.excerpt ?? stripHtml(event.description), 500),
        location: [event.place, event.address].filter(Boolean).join(", ") || "Chessy-les-Mines",
        start: event.startAt,
        end: event.endAt,
        allDay: event.allDay,
        url: `${base}/agenda/${event.slug}`,
        updatedAt: event.updatedAt,
      },
    ],
    event.title,
  );

  return new Response(calendar, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${event.slug}.ics"`,
    },
  });
}
