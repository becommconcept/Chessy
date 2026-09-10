import type { Metadata, Viewport } from "next";

import { PREFS_SCRIPT } from "@/components/site/ComfortMenu";
import { getSettings } from "@/lib/settings";
import "@/styles/globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return {
    metadataBase: new URL(base),
    title: {
      default: `${settings.identity.name} — site officiel de la commune`,
      template: `%s — ${settings.seo.titleSuffix}`,
    },
    description: settings.seo.description,
    keywords: settings.seo.keywords.split(",").map((keyword) => keyword.trim()),
    authors: [{ name: settings.contact.venue }],
    applicationName: settings.identity.name,
    openGraph: {
      type: "website",
      locale: "fr_FR",
      siteName: settings.seo.titleSuffix,
      title: `${settings.identity.name} — site officiel de la commune`,
      description: settings.seo.description,
    },
    twitter: { card: "summary_large_image" },
    robots: { index: true, follow: true },
    alternates: { types: { "application/rss+xml": "/flux.xml" } },
    formatDetection: { telephone: true, address: true },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#14507f" },
    { media: "(prefers-color-scheme: dark)", color: "#0b2e4f" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/*
          Applique les préférences d'affichage avant le premier rendu afin
          d'éviter tout clignotement de thème ou de taille de texte.
        */}
        <script dangerouslySetInnerHTML={{ __html: PREFS_SCRIPT }} />
      </head>
      <body className="flex min-h-dvh flex-col">{children}</body>
    </html>
  );
}
