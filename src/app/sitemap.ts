import type { MetadataRoute } from "next";

import { prisma } from "@/lib/db";

/** Plan du site destiné aux moteurs de recherche. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const [pages, posts, events, demarches, associations] = await Promise.all([
    prisma.page.findMany({
      where: { status: "PUBLIEE", noIndex: false },
      select: { slug: true, updatedAt: true },
    }),
    prisma.newsPost.findMany({
      where: { status: "PUBLIEE" },
      select: { slug: true, updatedAt: true },
    }),
    prisma.event.findMany({
      where: { status: "PUBLIEE" },
      select: { slug: true, updatedAt: true },
    }),
    prisma.demarche.findMany({ select: { slug: true, updatedAt: true } }),
    prisma.association.findMany({
      where: { active: true },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const entries: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/actualites`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/agenda`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/demarches`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/associations`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/services/salle-des-fetes`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/services/pret-de-materiel`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/services/signalement`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/plan-du-site`, changeFrequency: "monthly", priority: 0.3 },
  ];

  for (const page of pages) {
    if (page.slug === "accueil") continue;
    entries.push({
      url: `${base}/${page.slug}`,
      lastModified: page.updatedAt,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  for (const post of posts) {
    entries.push({
      url: `${base}/actualites/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "yearly",
      priority: 0.6,
    });
  }

  for (const event of events) {
    entries.push({
      url: `${base}/agenda/${event.slug}`,
      lastModified: event.updatedAt,
      changeFrequency: "weekly",
      priority: 0.5,
    });
  }

  for (const demarche of demarches) {
    entries.push({
      url: `${base}/demarches/${demarche.slug}`,
      lastModified: demarche.updatedAt,
      changeFrequency: "monthly",
      priority: 0.8,
    });
  }

  for (const association of associations) {
    entries.push({
      url: `${base}/associations/${association.slug}`,
      lastModified: association.updatedAt,
      changeFrequency: "monthly",
      priority: 0.5,
    });
  }

  return entries;
}
