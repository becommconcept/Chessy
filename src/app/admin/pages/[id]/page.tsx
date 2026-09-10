import { notFound, redirect } from "next/navigation";

import { creerRevision, enregistrerPage } from "@/app/admin/actions-pages";
import { BlockEditor, type EditablePage } from "@/components/admin/BlockEditor";
import { can, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { PageTemplate, Role } from "@/lib/enums";
import { safeJson } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const page = await prisma.page.findUnique({ where: { id }, select: { title: true } });
  return { title: page ? `Modifier « ${page.title} »` : "Page introuvable" };
}

export default async function EditeurPage({ params }: Props) {
  const user = await requireUser();
  if (!can.editContent(user.role as Role)) redirect("/admin?acces=refuse");

  const { id } = await params;

  const [page, parents, revisions] = await Promise.all([
    prisma.page.findUnique({
      where: { id },
      include: {
        cover: { select: { id: true, url: true, alt: true } },
        blocks: { orderBy: { order: "asc" } },
      },
    }),
    prisma.page.findMany({
      where: { parentId: null },
      orderBy: [{ order: "asc" }, { title: "asc" }],
      select: { id: true, title: true, slug: true },
    }),
    prisma.pageRevision.findMany({
      where: { pageId: id },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        label: true,
        createdAt: true,
        createdBy: { select: { name: true } },
      },
    }),
  ]);

  if (!page) notFound();

  const editable: EditablePage = {
    id: page.id,
    slug: page.slug,
    title: page.title,
    navLabel: page.navLabel ?? "",
    excerpt: page.excerpt ?? "",
    parentId: page.parentId,
    template: page.template as PageTemplate,
    status: page.status === "PUBLIEE" ? "PUBLIEE" : "BROUILLON",
    order: page.order,
    showInNav: page.showInNav,
    icon: page.icon ?? "",
    cover: page.cover ? { id: page.cover.id, url: page.cover.url, alt: page.cover.alt } : null,
    seoTitle: page.seoTitle ?? "",
    seoDescription: page.seoDescription ?? "",
    noIndex: page.noIndex,
    blocks: page.blocks.map((block) => ({
      key: block.id,
      type: block.type,
      visible: block.visible,
      data: safeJson<Record<string, unknown>>(block.data, {}),
    })),
  };

  return (
    <BlockEditor
      page={editable}
      parents={parents}
      onSave={enregistrerPage}
      onCreateRevision={creerRevision.bind(null, page.id, undefined)}
      revisions={revisions.map((revision) => ({
        id: revision.id,
        label: revision.label,
        createdAt: revision.createdAt.toISOString(),
        author: revision.createdBy?.name ?? null,
      }))}
    />
  );
}
