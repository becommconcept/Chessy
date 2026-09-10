import type { Metadata } from "next";

import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { getPageOr404, pageMetadata } from "@/lib/pages";
import { getSettings } from "@/lib/settings";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const [meta, settings] = await Promise.all([pageMetadata("accueil"), getSettings()]);
  return {
    ...meta,
    title: `${settings.identity.name} — site officiel de la commune`,
    alternates: { canonical: "/" },
  };
}

export default async function AccueilPage() {
  const [page, settings] = await Promise.all([getPageOr404("accueil"), getSettings()]);

  /* Données structurées : identifie la collectivité pour les moteurs de recherche. */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "GovernmentOrganization",
    name: settings.contact.venue,
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    telephone: settings.contact.phone,
    email: settings.contact.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.contact.address,
      postalCode: settings.contact.postalCode,
      addressLocality: settings.contact.city,
      addressCountry: "FR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: settings.contact.lat,
      longitude: settings.contact.lng,
    },
    areaServed: settings.identity.name,
  };

  return (
    <>
      <BlockRenderer blocks={page.blocks} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
