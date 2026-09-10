import { deplacerEntreeMenu, enregistrerEntreeMenu, supprimerEntreeMenu } from "@/app/admin/actions-config";
import { RowActions } from "@/components/admin/RowActions";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { AdminEmpty, AdminHeader, HelpNote, Panel, Pill } from "@/components/admin/ui";
import { ButtonLink } from "@/components/ui/Button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata = { title: "Menus de navigation" };

type Props = { searchParams: Promise<{ menu?: string; modifier?: string; ajouter?: string; parent?: string }> };

export default async function AdminMenusPage({ searchParams }: Props) {
  // Les contenus du site ne sont modifiables que par un administrateur ou un éditeur.
  await requireRole(["ADMIN", "EDITEUR"]);

  const { menu: menuKey, modifier, ajouter, parent } = await searchParams;

  const menus = await prisma.menu.findMany({
    orderBy: { key: "asc" },
    include: {
      items: {
        orderBy: { order: "asc" },
        include: { page: { select: { slug: true, title: true } } },
      },
    },
  });

  const active = menus.find((entry) => entry.key === menuKey) ?? menus[0];

  const [pages, editing] = await Promise.all([
    prisma.page.findMany({
      where: { status: "PUBLIEE" },
      orderBy: [{ order: "asc" }, { title: "asc" }],
      select: { id: true, title: true, slug: true },
    }),
    modifier ? prisma.menuItem.findUnique({ where: { id: modifier } }) : Promise.resolve(null),
  ]);

  if (!active) {
    return (
      <>
        <AdminHeader title="Menus de navigation" breadcrumb={[{ label: "Menus" }]} />
        <Panel>
          <AdminEmpty icon="ListFilter" title="Aucun menu configuré" />
        </Panel>
      </>
    );
  }

  const roots = active.items.filter((item) => !item.parentId);
  const childrenOf = (id: string) => active.items.filter((item) => item.parentId === id);
  const showForm = Boolean(modifier || ajouter);

  return (
    <>
      <AdminHeader
        title="Menus de navigation"
        description="Le menu principal, les services mis en avant et les colonnes du pied de page se règlent ici, sans toucher au code."
        breadcrumb={[{ label: "Menus" }]}
        actions={
          <ButtonLink href={`/admin/menus?menu=${active.key}&ajouter=1`} size="sm" icon="Plus">
            Ajouter une entrée
          </ButtonLink>
        }
      />

      <HelpNote title="Comment sont organisés les menus" icon="ListFilter">
        Une entrée de premier niveau du <strong>menu principal</strong> devient une rubrique du
        mégamenu ; ses entrées filles s'affichent dans le panneau déroulant, avec leur description
        et leur icône. Cochez « mise en avant » pour faire ressortir un service en ligne.
      </HelpNote>

      {/* Sélecteur de menu */}
      <div className="my-5 flex flex-wrap gap-2">
        {menus.map((entry) => (
          <a
            key={entry.key}
            href={`/admin/menus?menu=${entry.key}`}
            aria-current={entry.key === active.key ? "page" : undefined}
            className={
              entry.key === active.key
                ? "inline-flex items-center gap-2 rounded-field bg-azur-600 px-3.5 py-2 text-sm font-semibold text-white"
                : "inline-flex items-center gap-2 rounded-field border border-[color:var(--bordure)] bg-[color:var(--surface)] px-3.5 py-2 text-sm font-semibold transition-colors hover:bg-[color:var(--surface-alt)]"
            }
          >
            {entry.label}
            <span
              className={
                entry.key === active.key
                  ? "rounded-full bg-white/20 px-1.5 text-xs tabular-nums"
                  : "rounded-full bg-[color:var(--surface-sunken)] px-1.5 text-xs tabular-nums"
              }
            >
              {entry.items.length}
            </span>
          </a>
        ))}
      </div>

      {showForm ? (
        <Panel
          className="mb-6"
          title={editing ? `Modifier « ${editing.label} »` : "Nouvelle entrée de menu"}
          actions={
            <ButtonLink href={`/admin/menus?menu=${active.key}`} variant="discret" size="sm" icon="X">
              Fermer
            </ButtonLink>
          }
        >
          <form action={enregistrerEntreeMenu} className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
            <input type="hidden" name="id" value={editing?.id ?? ""} />
            <input type="hidden" name="menu" value={active.id} />

            <Field label="Libellé" htmlFor="libelle" required>
              <Input id="libelle" name="libelle" defaultValue={editing?.label ?? ""} required maxLength={120} />
            </Field>

            <Field
              label="Entrée parente"
              htmlFor="parent"
              hint="Laissez vide pour une rubrique de premier niveau."
            >
              <Select
                id="parent"
                name="parent"
                defaultValue={editing?.parentId ?? parent ?? ""}
              >
                <option value="">Premier niveau</option>
                {roots
                  .filter((item) => item.id !== editing?.id)
                  .map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
              </Select>
            </Field>

            <Field
              label="Page du site"
              htmlFor="page"
              hint="Choisissez une page, ou saisissez un lien libre ci-dessous."
            >
              <Select id="page" name="page" defaultValue={editing?.pageId ?? ""}>
                <option value="">Aucune page rattachée</option>
                {pages.map((page) => (
                  <option key={page.id} value={page.id}>
                    {page.title} (/{page.slug})
                  </option>
                ))}
              </Select>
            </Field>

            <Field
              label="Lien libre"
              htmlFor="lien"
              hint="Prend le pas sur la page rattachée. Chemin interne ou adresse complète."
            >
              <Input
                id="lien"
                name="lien"
                defaultValue={editing?.href ?? ""}
                placeholder="/services/salle-des-fetes"
              />
            </Field>

            <Field
              label="Description"
              htmlFor="description"
              hint="Affichée sous le libellé dans le mégamenu."
              className="sm:col-span-2"
            >
              <Textarea
                id="description"
                name="description"
                rows={2}
                defaultValue={editing?.description ?? ""}
                maxLength={200}
              />
            </Field>

            <Field label="Icône" htmlFor="icone" hint="Nom d'icône, par exemple Droplets.">
              <Input id="icone" name="icone" defaultValue={editing?.icon ?? ""} maxLength={60} />
            </Field>

            <Field label="Ordre" htmlFor="ordre">
              <Input id="ordre" name="ordre" type="number" defaultValue={String(editing?.order ?? active.items.length)} />
            </Field>

            <div className="sm:col-span-2">
              <Checkbox
                name="misEnAvant"
                defaultChecked={editing?.highlight ?? false}
                label="Mettre en avant"
                description="Fond doré dans le mégamenu, pour les services en ligne."
              />
            </div>

            <div className="sm:col-span-2 border-t border-[color:var(--bordure)] pt-4">
              <SubmitButton icon="Save">Enregistrer l'entrée</SubmitButton>
            </div>
          </form>
        </Panel>
      ) : null}

      <Panel title={active.label}>
        {roots.length === 0 ? (
          <AdminEmpty icon="ListFilter" title="Ce menu est vide" />
        ) : (
          <ul className="divide-y divide-[color:var(--bordure)]">
            {roots.map((item) => {
              const children = childrenOf(item.id);
              return (
                <li key={item.id}>
                  <div className="flex items-start gap-3 p-3.5">
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-field bg-[color:var(--surface-sunken)] text-azur-600 dark:text-azur-200">
                      <Icon name={item.icon} fallback="Link2" className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold">{item.label}</span>
                        {item.highlight ? <Pill tone="attente" icon="Star">Mise en avant</Pill> : null}
                        <span className="font-mono text-xs text-[color:var(--texte-doux)]">
                          {item.href ?? (item.page ? `/${item.page.slug}` : "—")}
                        </span>
                      </p>
                      {item.description ? (
                        <p className="mt-0.5 text-xs text-[color:var(--texte-doux)]">{item.description}</p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <a
                        href={`/admin/menus?menu=${active.key}&ajouter=1&parent=${item.id}`}
                        title="Ajouter une sous-entrée"
                        className="flex size-8 items-center justify-center rounded-field border border-[color:var(--bordure)] transition-colors hover:bg-[color:var(--surface-alt)]"
                      >
                        <Icon name="Plus" className="size-3.5" />
                        <span className="sr-only">Ajouter une sous-entrée sous « {item.label} »</span>
                      </a>
                      <RowActions
                        editHref={`/admin/menus?menu=${active.key}&modifier=${item.id}`}
                        items={[
                          {
                            label: "Monter",
                            icon: "MoveUp",
                            action: deplacerEntreeMenu.bind(null, item.id, "haut"),
                          },
                          {
                            label: "Descendre",
                            icon: "MoveDown",
                            action: deplacerEntreeMenu.bind(null, item.id, "bas"),
                          },
                          {
                            label: "Supprimer",
                            icon: "Trash2",
                            danger: true,
                            confirm: `Supprimer l'entrée « ${item.label} »${children.length > 0 ? ` et ses ${children.length} sous-entrées` : ""} ?`,
                            action: supprimerEntreeMenu.bind(null, item.id),
                          },
                        ]}
                      />
                    </div>
                  </div>

                  {children.length > 0 ? (
                    <ul className="border-t border-dashed border-[color:var(--bordure)] bg-[color:var(--surface-alt)]">
                      {children.map((child) => (
                        <li
                          key={child.id}
                          className="flex items-start gap-3 border-b border-[color:var(--bordure)] py-2.5 pr-3.5 pl-12 last:border-0"
                        >
                          <Icon
                            name="ChevronRight"
                            className="mt-1 size-3.5 shrink-0 text-[color:var(--texte-doux)]/50"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="flex flex-wrap items-center gap-2 text-sm">
                              <span className="font-medium">{child.label}</span>
                              {child.highlight ? <Pill tone="attente">Mise en avant</Pill> : null}
                              <span className="font-mono text-xs text-[color:var(--texte-doux)]">
                                {child.href ?? (child.page ? `/${child.page.slug}` : "—")}
                              </span>
                            </p>
                            {child.description ? (
                              <p className="mt-0.5 text-xs text-[color:var(--texte-doux)]">
                                {child.description}
                              </p>
                            ) : null}
                          </div>
                          <RowActions
                            editHref={`/admin/menus?menu=${active.key}&modifier=${child.id}`}
                            items={[
                              {
                                label: "Monter",
                                icon: "MoveUp",
                                action: deplacerEntreeMenu.bind(null, child.id, "haut"),
                              },
                              {
                                label: "Descendre",
                                icon: "MoveDown",
                                action: deplacerEntreeMenu.bind(null, child.id, "bas"),
                              },
                              {
                                label: "Supprimer",
                                icon: "Trash2",
                                danger: true,
                                confirm: `Supprimer l'entrée « ${child.label} » ?`,
                                action: supprimerEntreeMenu.bind(null, child.id),
                              },
                            ]}
                          />
                        </li>
                      ))}
                    </ul>
                  ) : null}

                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </>
  );
}
