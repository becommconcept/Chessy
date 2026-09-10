import { mettreAJourMedia, supprimerMedia } from "@/app/admin/actions-content";
import { RowActions } from "@/components/admin/RowActions";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { UploadZone } from "@/components/admin/UploadZone";
import { AdminEmpty, AdminHeader, FilterBar, FilterLink, HelpNote, Panel, Pill } from "@/components/admin/ui";
import { Field, Input, Select } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDate, formatFileSize } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Médiathèque" };

const FOLDERS = [
  "general",
  "pages",
  "actualites",
  "agenda",
  "associations",
  "elus",
  "equipements",
  "salles",
  "materiel",
  "documents",
  "signalements",
];

type Props = { searchParams: Promise<{ dossier?: string; modifier?: string }> };

export default async function AdminMediasPage({ searchParams }: Props) {
  // Les contenus du site ne sont modifiables que par un administrateur ou un éditeur.
  await requireRole(["ADMIN", "EDITEUR"]);

  const { dossier, modifier } = await searchParams;

  const [medias, counts, current] = await Promise.all([
    prisma.media.findMany({
      where: dossier ? { folder: dossier } : undefined,
      orderBy: { createdAt: "desc" },
      take: 240,
      select: {
        id: true,
        url: true,
        filename: true,
        alt: true,
        credit: true,
        mimeType: true,
        size: true,
        width: true,
        height: true,
        folder: true,
        createdAt: true,
        uploadedBy: { select: { name: true } },
        _count: {
          select: {
            pageCovers: true,
            newsCovers: true,
            eventCovers: true,
            associationLogos: true,
            eluPhotos: true,
            equipementImages: true,
            roomImages: true,
            itemImages: true,
            documents: true,
            requestPhotos: true,
          },
        },
      },
    }),
    prisma.media.groupBy({ by: ["folder"], _count: true }),
    modifier ? prisma.media.findUnique({ where: { id: modifier } }) : Promise.resolve(null),
  ]);

  const countOf = (value: string) => counts.find((entry) => entry.folder === value)?._count ?? 0;
  const total = counts.reduce((sum, entry) => sum + entry._count, 0);
  const usagesOf = (media: (typeof medias)[number]) =>
    Object.values(media._count).reduce((sum, count) => sum + count, 0);
  const totalSize = medias.reduce((sum, media) => sum + media.size, 0);

  return (
    <>
      <AdminHeader
        title="Médiathèque"
        description={`${total} fichiers · ${formatFileSize(totalSize)} sur cette page. Les images et documents téléversés ici sont réutilisables partout sur le site.`}
        breadcrumb={[{ label: "Médiathèque" }]}
      />

      <UploadZone folder={dossier || "general"} folders={FOLDERS} />

      {current ? (
        <Panel className="mt-5" title={`Modifier « ${current.filename} »`}>
          <form action={mettreAJourMedia} className="grid gap-4 p-4 sm:grid-cols-3 sm:p-5">
            <input type="hidden" name="id" value={current.id} />
            <Field
              label="Texte alternatif"
              htmlFor="alt"
              hint="Décrit ce que montre l'image. Lu par les lecteurs d'écran, indispensable au RGAA."
              className="sm:col-span-2"
            >
              <Input id="alt" name="alt" defaultValue={current.alt} maxLength={300} />
            </Field>
            <Field label="Dossier" htmlFor="dossier">
              <Select id="dossier" name="dossier" defaultValue={current.folder}>
                {FOLDERS.map((folder) => (
                  <option key={folder} value={folder}>
                    {folder}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Crédit photographique" htmlFor="credit" className="sm:col-span-2">
              <Input id="credit" name="credit" defaultValue={current.credit ?? ""} maxLength={200} />
            </Field>
            <div className="flex items-end gap-2">
              <SubmitButton icon="Save">Enregistrer</SubmitButton>
            </div>
          </form>
        </Panel>
      ) : null}

      <FilterBar>
        <FilterLink href="/admin/medias" active={!dossier} count={total}>
          Tous
        </FilterLink>
        {FOLDERS.filter((folder) => countOf(folder) > 0).map((folder) => (
          <FilterLink
            key={folder}
            href={`/admin/medias?dossier=${folder}`}
            active={dossier === folder}
            count={countOf(folder)}
          >
            {folder}
          </FilterLink>
        ))}
      </FilterBar>

      <Panel>
        {medias.length === 0 ? (
          <AdminEmpty
            icon="Images"
            title="Aucun fichier"
            description="Téléversez vos photographies et vos documents PDF."
          />
        ) : (
          <ul className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {medias.map((media) => {
              const usages = usagesOf(media);
              return (
                <li
                  key={media.id}
                  className="overflow-hidden rounded-card border border-[color:var(--bordure)]"
                >
                  {media.mimeType === "application/pdf" ? (
                    <a
                      href={media.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex aspect-4/3 items-center justify-center bg-dore-50 text-dore-700 transition-colors hover:bg-dore-100 dark:bg-dore-900/40 dark:text-dore-200"
                    >
                      <Icon name="FileText" className="size-9" />
                    </a>
                  ) : (
                    <a href={media.url} target="_blank" rel="noopener noreferrer" className="block">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={media.url}
                        alt={media.alt}
                        loading="lazy"
                        className="aspect-4/3 w-full bg-[color:var(--surface-sunken)] object-cover"
                      />
                    </a>
                  )}

                  <div className="p-2.5">
                    <p className="truncate text-xs font-semibold" title={media.filename}>
                      {media.filename}
                    </p>
                    <p className="mt-0.5 text-[0.625rem] text-[color:var(--texte-doux)]">
                      {media.width && media.height ? `${media.width}×${media.height} · ` : ""}
                      {formatFileSize(media.size)} · {formatDate(media.createdAt, "d MMM yyyy")}
                    </p>

                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {!media.alt ? (
                        <Pill tone="attente">Sans texte alternatif</Pill>
                      ) : null}
                      {usages > 0 ? (
                        <Pill tone="publie">
                          {usages} utilisation{usages > 1 ? "s" : ""}
                        </Pill>
                      ) : (
                        <Pill tone="brouillon">Non utilisé</Pill>
                      )}
                    </div>

                    <div className="mt-2">
                      <RowActions
                        editHref={`/admin/medias?modifier=${media.id}${dossier ? `&dossier=${dossier}` : ""}`}
                        items={
                          usages === 0
                            ? [
                                {
                                  label: "Supprimer de la médiathèque",
                                  icon: "Trash2",
                                  danger: true,
                                  confirm: `Retirer « ${media.filename} » de la médiathèque ? Le fichier reste sur le serveur mais ne sera plus proposé.`,
                                  action: supprimerMedia.bind(null, media.id),
                                },
                              ]
                            : []
                        }
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      <HelpNote title="Le texte alternatif, en pratique" icon="Accessibility">
        Décrivez ce que l'image apporte comme information, pas le fichier : « la salle des fêtes
        aménagée pour un repas » plutôt que « photo1.jpg ». Une image purement décorative peut avoir
        un texte alternatif vide, mais une image qui porte une information doit toujours être
        décrite.
      </HelpNote>
    </>
  );
}
