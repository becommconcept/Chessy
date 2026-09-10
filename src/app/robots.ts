import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Le back-office, les API et les pages de suivi personnel ne sont pas
        // destinés à l'indexation.
        disallow: ["/admin", "/api/", "/connexion", "/suivi", "/recherche"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
