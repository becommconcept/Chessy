import Link from "next/link";

import { CreatePageForm } from "@/components/admin/CreatePageForm";
import { RowActions } from "@/components/admin/RowActions";
import { AdminEmpty, AdminHeader, Cell, DataTable, HelpNote, Panel, Pill } from "@/components/admin/ui";
import { Icon } from "@/components/ui/Icon";
import { basculerPublicationPage, dupliquerPage, supprimerPage } from "@/app/admin/actions-pages";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PAGE_TEMPLATE_LABELS, type PageTemplate } from "@/lib/enums";
import { formatRelative } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = { title: "Pages du site" };

export default async function AdminPagesPage() {
  // Les contenus du site ne sont modifiables que par un administrateur ou un éditeur.
  await requireRole(["ADMIN", "EDITEUR"]);

  const pages = await prisma.page.findMany({
    orderBy: [{ order: "asc" }, { title: "asc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      template: true,
      showInNav: true,
      order: true,
      updatedAt: true,
      parentId: true,
      parent: { select: { title: true } },
      updatedBy: { select: { name: true } },
      _count: { select: { blocks: true, children: true } },
    },
  });

  /* Présentation hiérarchique : les pages filles suivent leur parente. */
  const roots = pages.filter((page) => !page.parentId);
  const ordered = roots.flatMap((root) => [
    { page: root, depth: 0 },
    ...pages.filter((page) => page.parentId === root.id).map((page) => ({ page, depth: 1 })),
  ]);
  const orphans = pages
    .filter((page) => page.parentId && !roots.some((root) => root.id === page.parentId))
    .map((page) => ({ page, depth: 1 }));
  const rows = [...ordered, ...orphans];

  return (
    <>
      <AdminHeader
        title="Pages du site"
        description="Chaque page est composée de sections que vous pouvez ajouter, réordonner et modifier librement."
        breadcrumb={[{ label: "Pages du site" }]}
        actions={<CreatePageForm parents={roots.map((page) => ({ id: page.id, title: page.title }))} />}
      />

      <HelpNote title="Comment ça marche" icon="CircleHelp">
        Ouvrez une page pour accéder à son éditeur. À gauche s'affiche la liste de ses sections
        (bandeau, texte, cartes, galerie…), à droite le formulaire de la section sélectionnée.
        Enregistrez en brouillon pour préparer une page sans la rendre visible, puis publiez-la
        quand elle est prête.
      </HelpNote>

      <Panel className="mt-5" title={`${pages.length} pages`}>
        {rows.length === 0 ? (
          <AdminEmpty
            icon="LayoutTemplate"
            title="Aucune page"
            description="Créez votre première page pour commencer."
          />
        ) : (
          <DataTable
            caption="Liste des pages du site"
            columns={[
              { label: "Page" },
              { label: "Adresse" },
              { label: "Sections", className: "text-right" },
              { label: "État" },
              { label: "Dernière modification" },
              { label: "Actions", sr: true },
            ]}
          >
            {rows.map(({ page, depth }) => (
              <tr key={page.id} className="transition-colors hover:bg-[color:var(--surface-alt)]">
                <Cell header>
                  <span className={depth > 0 ? "flex items-center gap-2 pl-5" : "flex items-center gap-2"}>
                    {depth > 0 ? (
                      <Icon
                        name="ChevronRight"
                        className="size-3.5 shrink-0 text-[color:var(--texte-doux)]/50"
                      />
                    ) : null}
                    <Link
                      href={`/admin/pages/${page.id}`}
                      className="truncate font-semibold hover:text-azur-600 dark:hover:text-azur-200"
                    >
                      {page.title}
                    </Link>
                  </span>
                  <span className="mt-0.5 flex flex-wrap items-center gap-1.5 pl-5 text-xs text-[color:var(--texte-doux)]">
                    {PAGE_TEMPLATE_LABELS[page.template as PageTemplate]}
                    {!page.showInNav ? <span>· hors menu</span> : null}
                    {page._count.children > 0 ? (
                      <span>· {page._count.children} sous-page(s)</span>
                    ) : null}
                  </span>
                </Cell>
                <Cell>
                  <a
                    href={page.slug === "accueil" ? "/" : `/${page.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-xs text-[color:var(--texte-doux)] hover:text-azur-600 hover:underline dark:hover:text-azur-200"
                  >
                    /{page.slug}
                    <Icon name="ExternalLink" className="size-3" />
                  </a>
                </Cell>
                <Cell className="text-right tabular-nums">{page._count.blocks}</Cell>
                <Cell>
                  <Pill tone={page.status === "PUBLIEE" ? "publie" : "brouillon"}>
                    {page.status === "PUBLIEE" ? "Publiée" : "Brouillon"}
                  </Pill>
                </Cell>
                <Cell className="text-xs text-[color:var(--texte-doux)]">
                  {formatRelative(page.updatedAt)}
                  {page.updatedBy ? (
                    <span className="mt-0.5 block">par {page.updatedBy.name}</span>
                  ) : null}
                </Cell>
                <Cell className="text-right">
                  <RowActions
                    editHref={`/admin/pages/${page.id}`}
                    items={[
                      {
                        label: page.status === "PUBLIEE" ? "Dépublier" : "Publier",
                        icon: page.status === "PUBLIEE" ? "EyeOff" : "CheckCheck",
                        action: basculerPublicationPage.bind(null, page.id),
                      },
                      {
                        label: "Dupliquer",
                        icon: "CopyPlus",
                        action: dupliquerPage.bind(null, page.id),
                      },
                      ...(page.slug === "accueil"
                        ? []
                        : [
                            {
                              label: "Supprimer",
                              icon: "Trash2",
                              danger: true,
                              confirm: `Supprimer définitivement la page « ${page.title} » ? Ses sous-pages seront rattachées au niveau supérieur.`,
                              action: supprimerPage.bind(null, page.id),
                            },
                          ]),
                    ]}
                  />
                </Cell>
              </tr>
            ))}
          </DataTable>
        )}
      </Panel>
    </>
  );
}
