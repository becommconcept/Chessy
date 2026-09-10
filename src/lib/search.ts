import { prisma } from "@/lib/db";
import { normalizeForSearch, safeJson, stripHtml, truncate } from "@/lib/utils";

export type SearchResult = {
  type: "page" | "actualite" | "evenement" | "demarche" | "association" | "document" | "equipement";
  title: string;
  excerpt: string;
  href: string;
  category?: string;
  icon: string;
  score: number;
};

export const SEARCH_TYPE_LABELS: Record<SearchResult["type"], string> = {
  page: "Page",
  actualite: "Actualité",
  evenement: "Agenda",
  demarche: "Démarche",
  association: "Association",
  document: "Document",
  equipement: "Équipement",
};

const TYPE_WEIGHT: Record<SearchResult["type"], number> = {
  demarche: 6,
  page: 5,
  actualite: 4,
  evenement: 4,
  association: 3,
  equipement: 3,
  document: 2,
};

/**
 * Recherche interne au site.
 *
 * Le corpus reste modeste (quelques centaines d'entrées) : les enregistrements
 * publiés sont chargés puis filtrés en mémoire, ce qui rend la recherche
 * insensible aux accents et à la casse — ce que `LIKE` en SQLite ne permet pas.
 * Sur un corpus beaucoup plus large, ce module serait remplacé par un index
 * plein texte (FTS5 ou moteur dédié) sans changer son interface.
 */
export async function search(query: string, limit = 24): Promise<SearchResult[]> {
  const needle = normalizeForSearch(query.trim());
  if (needle.length < 2) return [];

  const terms = needle.split(/\s+/).filter((term) => term.length > 1);
  if (terms.length === 0) return [];

  const results: SearchResult[] = [];

  /** Attribue un score : titre > résumé > corps, avec bonus si tous les mots sont présents. */
  const score = (
    weight: number,
    title: string,
    summary: string,
    body: string,
  ): number => {
    const nTitle = normalizeForSearch(title);
    const nSummary = normalizeForSearch(summary);
    const nBody = normalizeForSearch(body);

    let total = 0;
    let matched = 0;
    for (const term of terms) {
      let termScore = 0;
      if (nTitle.includes(term)) termScore += nTitle.startsWith(term) ? 14 : 10;
      if (nSummary.includes(term)) termScore += 4;
      if (nBody.includes(term)) termScore += 1.5;
      if (termScore > 0) matched += 1;
      total += termScore;
    }
    if (matched === 0) return 0;
    // Une correspondance partielle reste possible, mais nettement moins bien classée.
    const completeness = matched / terms.length;
    return total * completeness * (completeness === 1 ? 1.6 : 0.6) + weight;
  };

  const push = (
    type: SearchResult["type"],
    title: string,
    summary: string,
    body: string,
    href: string,
    icon: string,
    category?: string,
  ) => {
    const value = score(TYPE_WEIGHT[type], title, summary, body);
    if (value <= 0) return;
    results.push({
      type,
      title,
      excerpt: truncate(summary || body, 165),
      href,
      icon,
      category,
      score: value,
    });
  };

  const [pages, news, events, demarches, associations, documents, equipements] = await Promise.all([
    prisma.page.findMany({
      where: { status: "PUBLIEE", noIndex: false },
      select: {
        slug: true,
        title: true,
        excerpt: true,
        icon: true,
        blocks: { select: { data: true, visible: true } },
      },
    }),
    prisma.newsPost.findMany({
      where: { status: "PUBLIEE" },
      select: { slug: true, title: true, excerpt: true, content: true, category: { select: { name: true } } },
    }),
    prisma.event.findMany({
      where: { status: "PUBLIEE" },
      select: { slug: true, title: true, excerpt: true, description: true, place: true, startAt: true },
    }),
    prisma.demarche.findMany({
      select: { slug: true, title: true, summary: true, content: true, category: true, icon: true },
    }),
    prisma.association.findMany({
      where: { active: true },
      select: { slug: true, name: true, shortName: true, description: true, category: true },
    }),
    prisma.document.findMany({
      select: { id: true, title: true, description: true, category: true, file: { select: { url: true } }, href: true },
    }),
    prisma.equipement.findMany({
      select: { slug: true, name: true, description: true, address: true, category: true },
    }),
  ]);

  for (const page of pages) {
    // Le texte des blocs est indexé afin que la recherche porte sur le contenu
    // réellement affiché, et non seulement sur le titre de la page.
    const body = page.blocks
      .filter((block) => block.visible)
      .map((block) => extractText(block.data))
      .join(" ");
    push("page", page.title, page.excerpt ?? "", body, `/${page.slug}`, page.icon ?? "FileText");
  }

  for (const post of news) {
    push(
      "actualite",
      post.title,
      post.excerpt,
      stripHtml(post.content),
      `/actualites/${post.slug}`,
      "Newspaper",
      post.category?.name,
    );
  }

  for (const event of events) {
    push(
      "evenement",
      event.title,
      event.excerpt ?? "",
      `${stripHtml(event.description)} ${event.place ?? ""}`,
      `/agenda/${event.slug}`,
      "CalendarDays",
      event.startAt.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
    );
  }

  for (const demarche of demarches) {
    push(
      "demarche",
      demarche.title,
      demarche.summary,
      stripHtml(demarche.content),
      `/demarches/${demarche.slug}`,
      demarche.icon ?? "ClipboardList",
    );
  }

  for (const association of associations) {
    push(
      "association",
      association.name,
      association.shortName ?? "",
      stripHtml(association.description),
      `/associations/${association.slug}`,
      "Users",
    );
  }

  for (const document of documents) {
    const url = document.file?.url ?? document.href;
    if (!url) continue;
    push("document", document.title, document.description ?? "", "", url, "FileDown");
  }

  for (const equipement of equipements) {
    push(
      "equipement",
      equipement.name,
      equipement.description ?? "",
      equipement.address ?? "",
      `/cadre-de-vie/equipements#${equipement.slug}`,
      "MapPin",
    );
  }

  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}

/** Extrait le texte utile de la charge JSON d'un bloc, quelle qu'en soit la forme. */
function extractText(raw: string): string {
  const data = safeJson<Record<string, unknown>>(raw, {});
  const parts: string[] = [];

  const walk = (value: unknown) => {
    if (typeof value === "string") {
      parts.push(value.includes("<") ? stripHtml(value) : value);
    } else if (Array.isArray(value)) {
      value.forEach(walk);
    } else if (value && typeof value === "object") {
      for (const [key, nested] of Object.entries(value)) {
        // On ignore les champs techniques (URL, réglages d'affichage).
        if (["url", "href", "icon", "tone", "layout", "variant", "columns", "size", "width", "height", "align"].includes(key)) {
          continue;
        }
        walk(nested);
      }
    }
  };

  walk(data);
  return parts.join(" ");
}
