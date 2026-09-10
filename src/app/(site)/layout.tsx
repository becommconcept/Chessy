import { AlertBanner, type AlertData } from "@/components/site/AlertBanner";
import { BackToTop } from "@/components/site/BackToTop";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { prisma } from "@/lib/db";
import { getMenu } from "@/lib/navigation";
import { getSettings, isOpenNow } from "@/lib/settings";

/** Alertes en cours de validité, de la plus grave à la plus anodine. */
async function getActiveAlerts(): Promise<AlertData[]> {
  const now = new Date();
  try {
    const alerts = await prisma.alert.findMany({
      where: {
        active: true,
        startAt: { lte: now },
        OR: [{ endAt: null }, { endAt: { gte: now } }],
      },
      orderBy: { startAt: "desc" },
      take: 3,
      select: { id: true, level: true, title: true, message: true, linkHref: true, linkLabel: true },
    });

    const weight = { URGENCE: 0, VIGILANCE: 1, INFO: 2 } as const;
    return alerts
      .map((alert) => ({ ...alert, level: alert.level as AlertData["level"] }))
      .sort((a, b) => (weight[a.level] ?? 3) - (weight[b.level] ?? 3));
  } catch {
    return [];
  }
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, principal, services, decouvrir, demarches, mairie, alerts] = await Promise.all([
    getSettings(),
    getMenu("principal"),
    getMenu("services"),
    getMenu("pied-decouvrir"),
    getMenu("pied-demarches"),
    getMenu("pied-mairie"),
    getActiveAlerts(),
  ]);

  const opening = isOpenNow(settings);

  return (
    <>
      <AlertBanner alerts={alerts} />
      <Header
        menu={principal}
        services={services}
        siteName={settings.identity.name}
        tagline={`Mairie · ${settings.identity.department}`}
        phone={settings.contact.phone}
        openLabel={opening.label}
        openNow={opening.open}
        nextOpenLabel={opening.nextLabel}
      />
      <main id="contenu-principal" className="flex-1">
        {children}
      </main>
      <Footer
        settings={settings}
        columns={[
          { title: "Découvrir", items: decouvrir },
          { title: "Démarches", items: demarches },
          { title: "La mairie", items: mairie },
        ]}
      />
      <BackToTop />
    </>
  );
}
