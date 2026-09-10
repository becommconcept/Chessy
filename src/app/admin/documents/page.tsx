import { enregistrerDocument, supprimerDocument } from "@/app/admin/actions-content";
import { MediaField } from "@/components/admin/MediaField";
import { RowActions } from "@/components/admin/RowActions";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { AdminEmpty, AdminHeader, Cell, DataTable, FilterBar, FilterLink, HelpNote, Panel, Pill } from "@/components/admin/ui";
import { ButtonLink } from "@/components/ui/Button";
import { Field, Input, Notice, Select, Textarea } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DOCUMENT_CATEGORIES, DOCUMENT_CATEGORY_LABELS, labelOf, type DocumentCategory } from "@/lib/enums";
import { formatDate, formatFileSize, toISODate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Documents" };

type Props = { searchParams: Promise<{ categorie?: string; modifier?: string; enregistre?: string }> };

export default async function AdminDocumentsPage({ searchParams }: Props) {
  // Les contenus du site ne sont modifiables que par un administrateur ou un éditeur.
  await requireRole(["ADMIN", "EDITEUR"]);

  const { categorie, modifier, enregistre } = await searchParams;
  const editing = modifier === "nouveau" ? null : modifier;

  const [documents, counts, current] = await Promise.all([
    prisma.document.findMany({
      where: DOCUMENT_CATEGORIES.includes(categorie as DocumentCategory) ? { category: categorie } : undefined,
      orderBy: [{ category: "asc" }, { publishedAt: "desc" }],
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        year: true,
        meetingDate: true,
        publishedAt: true,
        href: true,
        file: { select: { url: true, size: true, filename: true } },
      },
    }),
    prisma.document.groupBy({ by: ["category"], _count: true }),
    editing
      ? prisma.document.findUnique({
          where: { id: editing },
          include: { file: { select: { id: true, url: true, alt: true } } },
        })
      : Promise.resolve(null),
  ]);

  const countOf = (value: string) => counts.find((entry) => entry.category === value)?._count ?? 0;
  const total = counts.reduce((sum, entry) => sum + entry._count, 0);
  const showForm = Boolean(modifier);

  return (
    <>
      <AdminHeader
        title="Documents"
        description="Bulletins municipaux, comptes rendus du conseil, arrêtés, règlements, documents d'urbanisme : tout ce que les habitants peuvent télécharger."
        breadcrumb={[{ label: "Documents" }]}
        actions={
          <ButtonLink href="/admin/documents?modifier=nouveau" size="sm" icon="Plus">
            Ajouter un document
          </ButtonLink>
        }
      />

      {enregistre ? (
        <Notice tone="succes" className="mb-5">
          Le document a bien été enregistré.
        </Notice>
      ) : null}

      {showForm ? (
        <Panel
          className="mb-6"
          title={current ? `Modifier « ${current.title} »` : "Ajouter un document"}
          actions={
            <ButtonLink href="/admin/documents" variant="discret" size="sm" icon="X">
              Fermer
            </ButtonLink>
          }
        >
          <form action={enregistrerDocument} className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
            <input type="hidden" name="id" value={current?.id ?? ""} />

            <Field label="Titre" htmlFor="titre" required className="sm:col-span-2">
              <Input id="titre" name="titre" defaultValue={current?.title ?? ""} required maxLength={200} />
            </Field>

            <Field
              label="Description"
              htmlFor="description"
              hint="Sommaire ou objet du document, affiché sous le titre."
              className="sm:col-span-2"
            >
              <Textarea
                id="description"
                name="description"
                rows={2}
                defaultValue={current?.description ?? ""}
                maxLength={400}
              />
            </Field>

            <Field label="Catégorie" htmlFor="categorie" required>
              <Select id="categorie" name="categorie" defaultValue={current?.category ?? "BULLETIN"}>
                {DOCUMENT_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {DOCUMENT_CATEGORY_LABELS[category]}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Année" htmlFor="annee">
              <Input
                id="annee"
                name="annee"
                type="number"
                min={1900}
                max={2100}
                defaultValue={current?.year ?? new Date().getFullYear()}
              />
            </Field>

            <Field
              label="Date de séance"
              htmlFor="dateSeance"
              hint="Pour un compte rendu de conseil municipal."
            >
              <Input
                id="dateSeance"
                name="dateSeance"
                type="date"
                defaultValue={current?.meetingDate ? toISODate(current.meetingDate) : ""}
              />
            </Field>

            <Field label="Date de publication" htmlFor="datePublication">
              <Input
                id="datePublication"
                name="datePublication"
                type="date"
                defaultValue={toISODate(current?.publishedAt ?? new Date())}
              />
            </Field>

            <div className="sm:col-span-2">
              <MediaField
                name="fichier"
                label="Fichier PDF"
                hint="Téléversez le document. Vérifiez qu'il ne comporte pas de données personnelles à masquer."
                accept="documents"
                defaultValue={
                  current?.file ? { id: current.file.id, url: current.file.url, alt: current.file.alt } : null
                }
              />
            </div>

            <Field
              label="Ou lien externe"
              htmlFor="lien"
              hint="Si le document est hébergé ailleurs (préfecture, intercommunalité)."
              className="sm:col-span-2"
            >
              <Input id="lien" name="lien" type="url" defaultValue={current?.href ?? ""} placeholder="https://…" />
            </Field>

            <div className="sm:col-span-2 border-t border-[color:var(--bordure)] pt-4">
              <SubmitButton icon="Save">Enregistrer le document</SubmitButton>
            </div>
          </form>
        </Panel>
      ) : null}

      <FilterBar>
        <FilterLink href="/admin/documents" active={!categorie} count={total}>
          Tous
        </FilterLink>
        {DOCUMENT_CATEGORIES.filter((category) => countOf(category) > 0).map((category) => (
          <FilterLink
            key={category}
            href={`/admin/documents?categorie=${category}`}
            active={categorie === category}
            count={countOf(category)}
          >
            {DOCUMENT_CATEGORY_LABELS[category]}
          </FilterLink>
        ))}
      </FilterBar>

      <Panel>
        {documents.length === 0 ? (
          <AdminEmpty
            icon="FolderOpen"
            title="Aucun document"
            description="Publiez les bulletins municipaux et les comptes rendus du conseil."
          />
        ) : (
          <DataTable
            caption="Liste des documents"
            columns={[
              { label: "Document" },
              { label: "Catégorie" },
              { label: "Date" },
              { label: "Fichier" },
              { label: "Actions", sr: true },
            ]}
          >
            {documents.map((document) => (
              <tr key={document.id} className="transition-colors hover:bg-[color:var(--surface-alt)]">
                <Cell header>
                  <span className="block font-semibold">{document.title}</span>
                  {document.description ? (
                    <span className="mt-0.5 block text-xs text-[color:var(--texte-doux)]">
                      {document.description}
                    </span>
                  ) : null}
                </Cell>
                <Cell>
                  <Pill tone="neutre">{labelOf(DOCUMENT_CATEGORY_LABELS, document.category)}</Pill>
                </Cell>
                <Cell className="text-xs whitespace-nowrap text-[color:var(--texte-doux)]">
                  {document.meetingDate
                    ? `séance du ${formatDate(document.meetingDate, "d MMM yyyy")}`
                    : formatDate(document.publishedAt, "d MMM yyyy")}
                </Cell>
                <Cell className="text-xs">
                  {document.file ? (
                    <a
                      href={document.file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-azur-600 hover:underline dark:text-azur-200"
                    >
                      <Icon name="FileText" className="size-3.5" />
                      {formatFileSize(document.file.size)}
                    </a>
                  ) : document.href ? (
                    <a
                      href={document.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-azur-600 hover:underline dark:text-azur-200"
                    >
                      <Icon name="ExternalLink" className="size-3.5" />
                      lien externe
                    </a>
                  ) : (
                    <Pill tone="attente">Fichier manquant</Pill>
                  )}
                </Cell>
                <Cell className="text-right">
                  <RowActions
                    editHref={`/admin/documents?modifier=${document.id}`}
                    items={[
                      {
                        label: "Supprimer",
                        icon: "Trash2",
                        danger: true,
                        confirm: `Supprimer la fiche « ${document.title} » ? Le lien de téléchargement ne fonctionnera plus.`,
                        action: supprimerDocument.bind(null, document.id),
                      },
                    ]}
                  />
                </Cell>
              </tr>
            ))}
          </DataTable>
        )}
      </Panel>

      <HelpNote title="Avant de publier un PDF" icon="ShieldAlert">
        Vérifiez qu'il ne contient pas de données personnelles à occulter (adresses, situations
        individuelles, signatures), et privilégiez un PDF avec texte sélectionnable plutôt qu'un
        scan d'image : c'est indispensable pour les lecteurs d'écran et pour la recherche.
      </HelpNote>
    </>
  );
}
