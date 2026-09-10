import { prisma } from "@/lib/db";
import { stripHtml, truncate } from "@/lib/utils";

export const revalidate = 600;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Flux RSS des actualités municipales. */
export async function GET() {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const posts = await prisma.newsPost.findMany({
    where: { status: "PUBLIEE", publishedAt: { lte: new Date() } },
    orderBy: { publishedAt: "desc" },
    take: 30,
    select: {
      slug: true,
      title: true,
      excerpt: true,
      content: true,
      publishedAt: true,
      category: { select: { name: true } },
    },
  });

  const items = posts
    .map((post) =>
      [
        "    <item>",
        `      <title>${escapeXml(post.title)}</title>`,
        `      <link>${base}/actualites/${post.slug}</link>`,
        `      <guid isPermaLink="true">${base}/actualites/${post.slug}</guid>`,
        `      <description>${escapeXml(truncate(post.excerpt || stripHtml(post.content), 400))}</description>`,
        post.category ? `      <category>${escapeXml(post.category.name)}</category>` : null,
        post.publishedAt ? `      <pubDate>${post.publishedAt.toUTCString()}</pubDate>` : null,
        "    </item>",
      ]
        .filter((line) => line !== null)
        .join("\n"),
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Actualités — Mairie de Chessy-les-Mines</title>
    <link>${base}/actualites</link>
    <atom:link href="${base}/flux.xml" rel="self" type="application/rss+xml" />
    <description>Les actualités officielles de la commune de Chessy-les-Mines (69380).</description>
    <language>fr-FR</language>
    <copyright>Commune de Chessy-les-Mines</copyright>
    <lastBuildDate>${(posts[0]?.publishedAt ?? new Date()).toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
