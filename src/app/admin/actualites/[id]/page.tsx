import { notFound } from "next/navigation";

import { enregistrerActualite } from "@/app/admin/actions-content";
import { HtmlField } from "@/components/admin/HtmlField";
import { MediaField } from "@/components/admin/MediaField";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { AdminHeader, HelpNote, Panel } from "@/components/admin/ui";
import { ButtonLink } from "@/components/ui/Button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/Field";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { toISODate } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  if (id === "nouvelle") return { title: "Nouvelle actualité" };
  const post = await prisma.newsPost.findUnique({ where: { id }, select: { title: true } });
  return { title: post ? `Modifier « ${post.title} »` : "Actualité introuvable" };
}

export default async function EditeurActualitePage({ params }: Props) {
  // Les contenus du site ne sont modifiables que par un administrateur ou un éditeur.
  await requireRole(["ADMIN", "EDITEUR"]);

  const { id } = await params;
  const creating = id === "nouvelle";

  const [post, categories] = await Promise.all([
    creating
      ? Promise.resolve(null)
      : prisma.newsPost.findUnique({
          where: { id },
          include: { cover: { select: { id: true, url: true, alt: true } } },
        }),
    prisma.newsCategory.findMany({ orderBy: { order: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!creating && !post) notFound();

  return (
    <>
      <AdminHeader
        title={creating ? "Nouvelle actualité" : "Modifier l'actualité"}
        breadcrumb={[
          { label: "Actualités", href: "/admin/actualites" },
          { label: creating ? "Nouvelle" : (post?.title ?? "") },
        ]}
        actions={
          post ? (
            <ButtonLink
              href={`/actualites/${post.slug}`}
              variant="contour"
              size="sm"
              icon="Eye"
              target="_blank"
            >
              Voir sur le site
            </ButtonLink>
          ) : null
        }
      />

      <form action={enregistrerActualite} className="grid gap-5 lg:grid-cols-3">
        <input type="hidden" name="id" value={post?.id ?? ""} />

        <div className="space-y-5 lg:col-span-2">
          <Panel title="Contenu de l'article">
            <div className="space-y-4 p-4 sm:p-5">
              <Field label="Titre" htmlFor="titre" required>
                <Input id="titre" name="titre" defaultValue={post?.title ?? ""} required maxLength={200} />
              </Field>

              <Field
                label="Chapeau"
                htmlFor="chapeau"
                hint="Deux ou trois phrases d'accroche, affichées dans les listes et le flux RSS. Généré automatiquement si laissé vide."
              >
                <Textarea id="chapeau" name="chapeau" rows={3} defaultValue={post?.excerpt ?? ""} maxLength={400} />
              </Field>

              <HtmlField
                name="contenu"
                label="Article"
                hint="Structurez avec des intertitres : c'est ce qui rend un texte lisible à l'écran."
                defaultValue={post?.content ?? "<p></p>"}
                minHeight={340}
              />
            </div>
          </Panel>

          <Panel title="Illustration">
            <div className="p-4 sm:p-5">
              <MediaField
                name="image"
                label="Image de couverture"
                hint="Format paysage recommandé (au moins 1200 × 675 pixels). Pensez au texte alternatif."
                defaultValue={
                  post?.cover
                    ? { id: post.cover.id, url: post.cover.url, alt: post.cover.alt }
                    : null
                }
              />
            </div>
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel title="Publication">
            <div className="space-y-4 p-4 sm:p-5">
              <Field label="État" htmlFor="statut">
                <Select id="statut" name="statut" defaultValue={post?.status ?? "BROUILLON"}>
                  <option value="BROUILLON">Brouillon (non visible)</option>
                  <option value="PUBLIEE">Publiée</option>
                </Select>
              </Field>

              <Field
                label="Date de publication"
                htmlFor="datePublication"
                hint="Laissez vide pour utiliser la date du jour."
              >
                <Input
                  id="datePublication"
                  name="datePublication"
                  type="date"
                  defaultValue={post?.publishedAt ? toISODate(post.publishedAt) : ""}
                />
              </Field>

              <Field label="Rubrique" htmlFor="categorie">
                <Select id="categorie" name="categorie" defaultValue={post?.categoryId ?? ""}>
                  <option value="">Aucune rubrique</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
              </Field>

              <div className="space-y-2">
                <Checkbox
                  name="epingle"
                  defaultChecked={post?.pinned ?? false}
                  label="Épingler à la une"
                  description="L'article reste en tête de liste, quelle que soit sa date."
                />
                <Checkbox
                  name="vedette"
                  defaultChecked={post?.featured ?? false}
                  label="Mettre en avant"
                  description="Signale l'article comme important pour les mises en avant automatiques."
                />
              </div>

              <div className="border-t border-[color:var(--bordure)] pt-4">
                <SubmitButton fullWidth icon="Save">
                  Enregistrer
                </SubmitButton>
              </div>
            </div>
          </Panel>

          <HelpNote title="Écrire pour être lu" icon="Lightbulb">
            Commencez par l'information la plus utile, employez des phrases courtes, et évitez le
            jargon administratif. Un habitant doit comprendre en une lecture ce qui le concerne et
            ce qu'il doit faire.
          </HelpNote>
        </div>
      </form>
    </>
  );
}
