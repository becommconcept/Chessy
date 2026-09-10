import { prisma } from "@/lib/db";

export type NavNode = {
  id: string;
  label: string;
  href: string;
  description?: string | null;
  icon?: string | null;
  highlight: boolean;
  children: NavNode[];
};

/**
 * Charge un menu et le reconstruit sous forme d'arbre.
 *
 * Les menus sont administrables : libellé, lien, description, icône, ordre et
 * mise en avant se règlent depuis le back-office, sans toucher au code.
 */
export async function getMenu(key: string): Promise<NavNode[]> {
  let items: Array<{
    id: string;
    label: string;
    href: string | null;
    description: string | null;
    icon: string | null;
    highlight: boolean;
    order: number;
    parentId: string | null;
    page: { slug: string; status: string } | null;
  }> = [];

  try {
    items = await prisma.menuItem.findMany({
      where: { menu: { key } },
      orderBy: { order: "asc" },
      select: {
        id: true,
        label: true,
        href: true,
        description: true,
        icon: true,
        highlight: true,
        order: true,
        parentId: true,
        page: { select: { slug: true, status: true } },
      },
    });
  } catch {
    return [];
  }

  const nodes = new Map<string, NavNode>();
  for (const item of items) {
    // Le lien saisi prime ; à défaut, on utilise la page rattachée.
    const href = item.href ?? (item.page ? `/${item.page.slug}` : "#");
    nodes.set(item.id, {
      id: item.id,
      label: item.label,
      href,
      description: item.description,
      icon: item.icon,
      highlight: item.highlight,
      children: [],
    });
  }

  const roots: NavNode[] = [];
  for (const item of items) {
    const node = nodes.get(item.id)!;
    if (item.parentId && nodes.has(item.parentId)) {
      nodes.get(item.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

/** Fil d'Ariane calculé à partir de l'arborescence des pages. */
export async function getBreadcrumb(slug: string): Promise<Array<{ label: string; href: string }>> {
  const trail: Array<{ label: string; href: string }> = [];
  let currentSlug: string | null = slug;
  let guard = 0;

  while (currentSlug && guard < 8) {
    guard += 1;
    const page: { slug: string; title: string; navLabel: string | null; parent: { slug: string } | null } | null =
      await prisma.page.findUnique({
        where: { slug: currentSlug },
        select: {
          slug: true,
          title: true,
          navLabel: true,
          parent: { select: { slug: true } },
        },
      });
    if (!page) break;
    trail.unshift({ label: page.navLabel ?? page.title, href: `/${page.slug}` });
    currentSlug = page.parent?.slug ?? null;
  }

  return trail;
}

/** Pages filles publiées, utilisées par le sommaire latéral. */
export async function getSiblingPages(slug: string) {
  const page = await prisma.page.findUnique({
    where: { slug },
    select: { id: true, parentId: true, parent: { select: { id: true, slug: true, title: true, navLabel: true } } },
  });
  if (!page) return null;

  const parentId = page.parentId ?? page.id;
  const parent =
    page.parent ??
    (await prisma.page.findUnique({
      where: { id: page.id },
      select: { id: true, slug: true, title: true, navLabel: true },
    }));

  const children = await prisma.page.findMany({
    where: { parentId, status: "PUBLIEE", showInNav: true },
    orderBy: [{ order: "asc" }, { title: "asc" }],
    select: { slug: true, title: true, navLabel: true, icon: true },
  });

  if (children.length === 0) return null;

  return {
    parent: parent ? { label: parent.navLabel ?? parent.title, href: `/${parent.slug}` } : null,
    children: children.map((child) => ({
      label: child.navLabel ?? child.title,
      href: `/${child.slug}`,
      icon: child.icon,
    })),
  };
}
