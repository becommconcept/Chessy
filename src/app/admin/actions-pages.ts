"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { SavePagePayload, SaveResult } from "@/components/admin/BlockEditor";
import { can, recordAudit, requireUser } from "@/lib/auth";
import { getBlockDefinition } from "@/lib/blocks";
import { prisma } from "@/lib/db";
import { PAGE_TEMPLATES, type Role } from "@/lib/enums";
import { sanitizeBlockData, sanitizeHtml } from "@/lib/sanitize";
import { slugify } from "@/lib/utils";

/** Normalise un chemin de page : segments assainis, sans barre initiale. */
function normalizeSlug(raw: string): string {
  return raw
    .split("/")
    .map((segment) => slugify(segment))
    .filter(Boolean)
    .join("/");
}

async function requireEditor() {
  const user = await requireUser("/admin/pages");
  if (!can.editContent(user.role as Role)) redirect("/admin?acces=refuse");
  return user;
}

/** Invalide les pages publiques susceptibles d'afficher le contenu modifié. */
function revalidatePublicPaths(slug: string) {
  revalidatePath("/", "layout");
  revalidatePath("/plan-du-site");
  if (slug === "accueil") revalidatePath("/");
  else revalidatePath(`/${slug}`);
}

/**
 * Enregistre une page et l'intégralité de ses blocs.
 *
 * L'écriture est faite dans une transaction : en cas d'erreur au milieu du
 * traitement, la page conserve son état précédent plutôt que de se retrouver
 * avec la moitié de ses sections.
 */
export async function enregistrerPage(payload: SavePagePayload): Promise<SaveResult> {
  const user = await requireEditor();

  const title = payload.title.trim();
  if (title.length < 2) return { ok: false, error: "Le titre de la page est obligatoire." };

  const slug = normalizeSlug(payload.slug) || slugify(title);
  if (!slug) return { ok: false, error: "L'adresse de la page est invalide." };

  // Les chemins réservés aux rubriques dynamiques ne peuvent pas être pris par
  // une page du gestionnaire de contenu, sous peine de rendre l'une des deux
  // inaccessible.
  const RESERVED = [
    "actualites",
    "agenda",
    "associations",
    "contact",
    "recherche",
    "suivi",
    "services",
    "admin",
    "connexion",
    "api",
  ];
  if (RESERVED.includes(slug)) {
    return {
      ok: false,
      error: `L'adresse « ${slug} » est réservée à une rubrique du site. Choisissez une autre adresse.`,
    };
  }

  const duplicate = await prisma.page.findFirst({
    where: { slug, id: { not: payload.id } },
    select: { id: true, title: true },
  });
  if (duplicate) {
    return {
      ok: false,
      error: `L'adresse « ${slug} » est déjà utilisée par la page « ${duplicate.title} ».`,
    };
  }

  const status = payload.status === "PUBLIEE" ? "PUBLIEE" : "BROUILLON";
  const template = PAGE_TEMPLATES.includes(payload.template) ? payload.template : "STANDARD";

  // Un parent ne peut pas être la page elle-même ni l'une de ses descendantes.
  let parentId = payload.parentId || null;
  if (parentId) {
    let cursor: string | null = parentId;
    let guard = 0;
    while (cursor && guard < 10) {
      guard += 1;
      if (cursor === payload.id) {
        parentId = null;
        break;
      }
      const parent: { parentId: string | null } | null = await prisma.page.findUnique({
        where: { id: cursor },
        select: { parentId: true },
      });
      cursor = parent?.parentId ?? null;
    }
  }

  const previous = await prisma.page.findUnique({
    where: { id: payload.id },
    select: { slug: true, status: true },
  });

  const blocks = payload.blocks
    .filter((block) => Boolean(getBlockDefinition(block.type)))
    .map((block, index) => ({
      type: block.type,
      order: index,
      visible: block.visible !== false,
      data: JSON.stringify(sanitizeBlockData(block.data)),
    }));

  await prisma.$transaction(async (tx) => {
    await tx.block.deleteMany({ where: { pageId: payload.id } });
    await tx.page.update({
      where: { id: payload.id },
      data: {
        slug,
        title,
        navLabel: payload.navLabel.trim() || null,
        excerpt: payload.excerpt.trim() || null,
        parentId,
        template,
        status,
        order: Number.isFinite(payload.order) ? payload.order : 0,
        showInNav: Boolean(payload.showInNav),
        icon: payload.icon.trim() || null,
        coverId: payload.cover?.id ?? null,
        seoTitle: payload.seoTitle.trim() || null,
        seoDescription: payload.seoDescription.trim() || null,
        noIndex: Boolean(payload.noIndex),
        publishedAt: status === "PUBLIEE" ? new Date() : null,
        updatedById: user.id,
        blocks: { create: blocks },
      },
    });
  });

  await recordAudit({
    userId: user.id,
    action: status === "PUBLIEE" && previous?.status !== "PUBLIEE" ? "PUBLISH" : "UPDATE",
    entity: "Page",
    entityId: payload.id,
    label: title,
    detail: `${blocks.length} section(s) · /${slug}`,
  });

  revalidatePublicPaths(slug);
  if (previous && previous.slug !== slug) revalidatePublicPaths(previous.slug);

  return { ok: true, slug };
}

/** Crée une page vide et redirige vers son éditeur. */
export async function creerPage(formData: FormData): Promise<void> {
  const user = await requireEditor();

  const title = String(formData.get("titre") ?? "").trim() || "Nouvelle page";
  const parentId = String(formData.get("parent") ?? "") || null;

  const parent = parentId
    ? await prisma.page.findUnique({ where: { id: parentId }, select: { slug: true } })
    : null;

  const base = slugify(title) || "nouvelle-page";
  let slug = parent ? `${parent.slug}/${base}` : base;

  // Suffixe numérique si l'adresse est déjà prise.
  let attempt = 2;
  while (await prisma.page.findUnique({ where: { slug }, select: { id: true } })) {
    slug = parent ? `${parent.slug}/${base}-${attempt}` : `${base}-${attempt}`;
    attempt += 1;
    if (attempt > 50) break;
  }

  const page = await prisma.page.create({
    data: {
      slug,
      title,
      parentId,
      status: "BROUILLON",
      updatedById: user.id,
      blocks: {
        create: [
          {
            type: "richText",
            order: 0,
            data: JSON.stringify({
              title: "",
              html: "<p>Rédigez ici le contenu de la page.</p>",
              width: "lecture",
            }),
          },
        ],
      },
    },
    select: { id: true },
  });

  await recordAudit({
    userId: user.id,
    action: "CREATE",
    entity: "Page",
    entityId: page.id,
    label: title,
  });

  revalidatePath("/admin/pages");
  redirect(`/admin/pages/${page.id}`);
}

/** Duplique une page avec l'ensemble de ses blocs. */
export async function dupliquerPage(id: string): Promise<void> {
  const user = await requireEditor();

  const source = await prisma.page.findUnique({
    where: { id },
    include: { blocks: { orderBy: { order: "asc" } } },
  });
  if (!source) return;

  let slug = `${source.slug}-copie`;
  let attempt = 2;
  while (await prisma.page.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${source.slug}-copie-${attempt}`;
    attempt += 1;
    if (attempt > 50) break;
  }

  const copy = await prisma.page.create({
    data: {
      slug,
      title: `${source.title} (copie)`,
      navLabel: source.navLabel,
      excerpt: source.excerpt,
      parentId: source.parentId,
      coverId: source.coverId,
      template: source.template,
      status: "BROUILLON",
      order: source.order + 1,
      showInNav: false,
      icon: source.icon,
      seoTitle: source.seoTitle,
      seoDescription: source.seoDescription,
      noIndex: source.noIndex,
      updatedById: user.id,
      blocks: {
        create: source.blocks.map((block) => ({
          type: block.type,
          order: block.order,
          visible: block.visible,
          data: block.data,
        })),
      },
    },
    select: { id: true },
  });

  await recordAudit({
    userId: user.id,
    action: "CREATE",
    entity: "Page",
    entityId: copy.id,
    label: `${source.title} (copie)`,
    detail: "Duplication",
  });

  revalidatePath("/admin/pages");
  redirect(`/admin/pages/${copy.id}`);
}

/** Supprime une page. Les pages filles sont rattachées au niveau supérieur. */
export async function supprimerPage(id: string): Promise<void> {
  const user = await requireEditor();

  const page = await prisma.page.findUnique({
    where: { id },
    select: { slug: true, title: true, parentId: true },
  });
  if (!page) return;

  if (page.slug === "accueil") {
    // La page d'accueil est structurante : on refuse sa suppression.
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.page.updateMany({ where: { parentId: id }, data: { parentId: page.parentId } });
    await tx.page.delete({ where: { id } });
  });

  await recordAudit({
    userId: user.id,
    action: "DELETE",
    entity: "Page",
    entityId: id,
    label: page.title,
  });

  revalidatePublicPaths(page.slug);
  revalidatePath("/admin/pages");
  redirect("/admin/pages?supprimee=1");
}

/** Bascule l'état de publication depuis la liste des pages. */
export async function basculerPublicationPage(id: string): Promise<void> {
  const user = await requireEditor();

  const page = await prisma.page.findUnique({
    where: { id },
    select: { status: true, slug: true, title: true },
  });
  if (!page) return;

  const status = page.status === "PUBLIEE" ? "BROUILLON" : "PUBLIEE";
  await prisma.page.update({
    where: { id },
    data: { status, publishedAt: status === "PUBLIEE" ? new Date() : null, updatedById: user.id },
  });

  await recordAudit({
    userId: user.id,
    action: status === "PUBLIEE" ? "PUBLISH" : "UPDATE",
    entity: "Page",
    entityId: id,
    label: page.title,
    detail: status === "PUBLIEE" ? "Publication" : "Dépublication",
  });

  revalidatePublicPaths(page.slug);
  revalidatePath("/admin/pages");
}

/** Enregistre un instantané de la page, permettant un retour en arrière. */
export async function creerRevision(pageId: string, label?: string): Promise<void> {
  const user = await requireEditor();

  const page = await prisma.page.findUnique({
    where: { id: pageId },
    include: { blocks: { orderBy: { order: "asc" } } },
  });
  if (!page) return;

  await prisma.pageRevision.create({
    data: {
      pageId,
      label: label?.trim() || `Version du ${new Date().toLocaleString("fr-FR")}`,
      snapshot: JSON.stringify({
        title: page.title,
        navLabel: page.navLabel,
        excerpt: page.excerpt,
        template: page.template,
        icon: page.icon,
        seoTitle: page.seoTitle,
        seoDescription: page.seoDescription,
        blocks: page.blocks.map((block) => ({
          type: block.type,
          order: block.order,
          visible: block.visible,
          data: block.data,
        })),
      }),
      createdById: user.id,
    },
  });

  // On conserve les vingt dernières versions par page.
  const extra = await prisma.pageRevision.findMany({
    where: { pageId },
    orderBy: { createdAt: "desc" },
    skip: 20,
    select: { id: true },
  });
  if (extra.length > 0) {
    await prisma.pageRevision.deleteMany({ where: { id: { in: extra.map((entry) => entry.id) } } });
  }

  revalidatePath(`/admin/pages/${pageId}`);
}

/** Restaure une version antérieure de la page. */
export async function restaurerRevision(revisionId: string): Promise<void> {
  const user = await requireEditor();

  const revision = await prisma.pageRevision.findUnique({
    where: { id: revisionId },
    select: { pageId: true, snapshot: true, label: true, page: { select: { slug: true, title: true } } },
  });
  if (!revision) return;

  let snapshot: {
    title?: string;
    navLabel?: string | null;
    excerpt?: string | null;
    template?: string;
    icon?: string | null;
    seoTitle?: string | null;
    seoDescription?: string | null;
    blocks?: Array<{ type: string; order: number; visible: boolean; data: string }>;
  };
  try {
    snapshot = JSON.parse(revision.snapshot);
  } catch {
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.block.deleteMany({ where: { pageId: revision.pageId } });
    await tx.page.update({
      where: { id: revision.pageId },
      data: {
        title: snapshot.title ?? revision.page.title,
        navLabel: snapshot.navLabel ?? null,
        excerpt: snapshot.excerpt ?? null,
        template: snapshot.template ?? "STANDARD",
        icon: snapshot.icon ?? null,
        seoTitle: snapshot.seoTitle ?? null,
        seoDescription: snapshot.seoDescription ?? null,
        updatedById: user.id,
        blocks: {
          create: (snapshot.blocks ?? []).map((block) => ({
            type: block.type,
            order: block.order,
            visible: block.visible,
            // Le contenu est réassaini : une version ancienne peut avoir été
            // enregistrée avant un durcissement du filtre.
            data: JSON.stringify(sanitizeBlockData(JSON.parse(block.data || "{}"))),
          })),
        },
      },
    });
  });

  await recordAudit({
    userId: user.id,
    action: "UPDATE",
    entity: "Page",
    entityId: revision.pageId,
    label: revision.page.title,
    detail: `Restauration : ${revision.label ?? "version antérieure"}`,
  });

  revalidatePublicPaths(revision.page.slug);
  revalidatePath(`/admin/pages/${revision.pageId}`);
}

/** Vérifie et assainit un fragment HTML — utilisé par les formulaires simples. */
export async function assainir(html: string): Promise<string> {
  await requireEditor();
  return sanitizeHtml(html);
}
