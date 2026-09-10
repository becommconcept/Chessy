"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { can, recordAudit, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  ALERT_LEVELS,
  ASSOCIATION_CATEGORIES,
  DEMARCHE_CATEGORIES,
  DOCUMENT_CATEGORIES,
  ELU_ROLES,
  EQUIPEMENT_CATEGORIES,
  EVENT_CATEGORIES,
  type Role,
} from "@/lib/enums";
import { sanitizeHtml } from "@/lib/sanitize";
import { slugify, truncate } from "@/lib/utils";

async function requireEditor(returnTo = "/admin") {
  const user = await requireUser(returnTo);
  if (!can.editContent(user.role as Role)) redirect("/admin?acces=refuse");
  return user;
}

/* ------------------------------ Utilitaires ------------------------------- */

const text = (formData: FormData, key: string): string => String(formData.get(key) ?? "").trim();
const flag = (formData: FormData, key: string): boolean => formData.get(key) === "on";
const number = (formData: FormData, key: string, fallback = 0): number => {
  const value = Number(formData.get(key));
  return Number.isFinite(value) ? value : fallback;
};
const optional = (formData: FormData, key: string): string | null => text(formData, key) || null;
const media = (formData: FormData, key: string): string | null => text(formData, key) || null;
const dateOf = (formData: FormData, key: string): Date | null => {
  const value = text(formData, key);
  if (!value) return null;
  const date = new Date(value.length === 10 ? `${value}T12:00:00` : value);
  return Number.isNaN(date.getTime()) ? null : date;
};

/** Génère un identifiant d'URL unique pour une table donnée. */
async function uniqueSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>,
  fallback = "element",
): Promise<string> {
  const root = slugify(base) || fallback;
  let candidate = root;
  let attempt = 2;
  while (await exists(candidate)) {
    candidate = `${root}-${attempt}`;
    attempt += 1;
    if (attempt > 60) break;
  }
  return candidate;
}

function refreshEditorial() {
  revalidatePath("/", "layout");
  revalidatePath("/actualites");
  revalidatePath("/agenda");
}

/* ================================ Actualités ============================== */

export async function enregistrerActualite(formData: FormData): Promise<void> {
  const user = await requireEditor("/admin/actualites");

  const id = text(formData, "id");
  const title = text(formData, "titre");
  if (title.length < 2) redirect("/admin/actualites?erreur=titre");

  const status = text(formData, "statut") === "PUBLIEE" ? "PUBLIEE" : "BROUILLON";
  const content = sanitizeHtml(text(formData, "contenu"));
  const excerpt = text(formData, "chapeau") || truncate(content.replace(/<[^>]+>/g, " "), 200);

  const data = {
    title,
    excerpt,
    content,
    categoryId: optional(formData, "categorie"),
    coverId: media(formData, "image"),
    status,
    featured: flag(formData, "vedette"),
    pinned: flag(formData, "epingle"),
    publishedAt: status === "PUBLIEE" ? (dateOf(formData, "datePublication") ?? new Date()) : null,
    authorId: user.id,
  };

  if (id) {
    await prisma.newsPost.update({ where: { id }, data });
    await recordAudit({ userId: user.id, action: "UPDATE", entity: "NewsPost", entityId: id, label: title });
  } else {
    const slug = await uniqueSlug(
      title,
      async (candidate) =>
        Boolean(await prisma.newsPost.findUnique({ where: { slug: candidate }, select: { id: true } })),
      "actualite",
    );
    const created = await prisma.newsPost.create({ data: { ...data, slug }, select: { id: true } });
    await recordAudit({
      userId: user.id,
      action: "CREATE",
      entity: "NewsPost",
      entityId: created.id,
      label: title,
    });
  }

  refreshEditorial();
  revalidatePath("/admin/actualites");
  redirect("/admin/actualites?enregistre=1");
}

export async function basculerPublicationActualite(id: string): Promise<void> {
  const user = await requireEditor();
  const post = await prisma.newsPost.findUnique({ where: { id }, select: { status: true, title: true } });
  if (!post) return;

  const status = post.status === "PUBLIEE" ? "BROUILLON" : "PUBLIEE";
  await prisma.newsPost.update({
    where: { id },
    data: { status, publishedAt: status === "PUBLIEE" ? new Date() : null },
  });
  await recordAudit({
    userId: user.id,
    action: status === "PUBLIEE" ? "PUBLISH" : "UPDATE",
    entity: "NewsPost",
    entityId: id,
    label: post.title,
  });

  refreshEditorial();
  revalidatePath("/admin/actualites");
}

export async function supprimerActualite(id: string): Promise<void> {
  const user = await requireEditor();
  const post = await prisma.newsPost.findUnique({ where: { id }, select: { title: true } });
  if (!post) return;

  await prisma.newsPost.delete({ where: { id } });
  await recordAudit({ userId: user.id, action: "DELETE", entity: "NewsPost", entityId: id, label: post.title });

  refreshEditorial();
  revalidatePath("/admin/actualites");
}

/* ================================== Agenda ================================ */

export async function enregistrerEvenement(formData: FormData): Promise<void> {
  const user = await requireEditor("/admin/agenda");

  const id = text(formData, "id");
  const title = text(formData, "titre");
  const startAt = dateOf(formData, "debut");
  if (title.length < 2 || !startAt) redirect("/admin/agenda?erreur=champs");

  const category = text(formData, "categorie");

  const data = {
    title,
    excerpt: optional(formData, "chapeau"),
    description: sanitizeHtml(text(formData, "description")),
    startAt,
    endAt: dateOf(formData, "fin"),
    allDay: flag(formData, "journeeEntiere"),
    place: optional(formData, "lieu"),
    address: optional(formData, "adresse"),
    organizer: optional(formData, "organisateur"),
    priceInfo: optional(formData, "tarif"),
    audience: optional(formData, "public"),
    category: EVENT_CATEGORIES.includes(category as never) ? category : null,
    registrationUrl: optional(formData, "inscription"),
    contactEmail: optional(formData, "courriel"),
    coverId: media(formData, "image"),
    associationId: optional(formData, "association"),
    status: text(formData, "statut") === "BROUILLON" ? "BROUILLON" : "PUBLIEE",
    featured: flag(formData, "vedette"),
  };

  if (id) {
    await prisma.event.update({ where: { id }, data });
    await recordAudit({ userId: user.id, action: "UPDATE", entity: "Event", entityId: id, label: title });
  } else {
    const slug = await uniqueSlug(
      title,
      async (candidate) =>
        Boolean(await prisma.event.findUnique({ where: { slug: candidate }, select: { id: true } })),
      "evenement",
    );
    const created = await prisma.event.create({ data: { ...data, slug }, select: { id: true } });
    await recordAudit({ userId: user.id, action: "CREATE", entity: "Event", entityId: created.id, label: title });
  }

  refreshEditorial();
  revalidatePath("/admin/agenda");
  redirect("/admin/agenda?enregistre=1");
}

export async function supprimerEvenement(id: string): Promise<void> {
  const user = await requireEditor();
  const event = await prisma.event.findUnique({ where: { id }, select: { title: true } });
  if (!event) return;

  await prisma.event.delete({ where: { id } });
  await recordAudit({ userId: user.id, action: "DELETE", entity: "Event", entityId: id, label: event.title });

  refreshEditorial();
  revalidatePath("/admin/agenda");
}

/* ================================ Documents =============================== */

export async function enregistrerDocument(formData: FormData): Promise<void> {
  const user = await requireEditor("/admin/documents");

  const id = text(formData, "id");
  const title = text(formData, "titre");
  if (title.length < 2) redirect("/admin/documents?erreur=titre");

  const category = text(formData, "categorie");

  const data = {
    title,
    description: optional(formData, "description"),
    category: DOCUMENT_CATEGORIES.includes(category as never) ? category : "AUTRE",
    year: number(formData, "annee", new Date().getFullYear()),
    meetingDate: dateOf(formData, "dateSeance"),
    publishedAt: dateOf(formData, "datePublication") ?? new Date(),
    order: number(formData, "ordre"),
    fileId: media(formData, "fichier"),
    href: optional(formData, "lien"),
  };

  if (id) {
    await prisma.document.update({ where: { id }, data });
    await recordAudit({ userId: user.id, action: "UPDATE", entity: "Document", entityId: id, label: title });
  } else {
    const created = await prisma.document.create({ data, select: { id: true } });
    await recordAudit({
      userId: user.id,
      action: "CREATE",
      entity: "Document",
      entityId: created.id,
      label: title,
    });
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/documents");
  redirect("/admin/documents?enregistre=1");
}

export async function supprimerDocument(id: string): Promise<void> {
  const user = await requireEditor();
  const document = await prisma.document.findUnique({ where: { id }, select: { title: true } });
  if (!document) return;

  await prisma.document.delete({ where: { id } });
  await recordAudit({
    userId: user.id,
    action: "DELETE",
    entity: "Document",
    entityId: id,
    label: document.title,
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin/documents");
}

/* ================================= Alertes ================================ */

export async function enregistrerAlerte(formData: FormData): Promise<void> {
  const user = await requireEditor("/admin/alertes");

  const id = text(formData, "id");
  const title = text(formData, "titre");
  if (title.length < 2) redirect("/admin/alertes?erreur=titre");

  const level = text(formData, "niveau");

  const data = {
    level: ALERT_LEVELS.includes(level as never) ? level : "INFO",
    title,
    message: optional(formData, "message"),
    linkHref: optional(formData, "lien"),
    linkLabel: optional(formData, "libelleLien"),
    startAt: dateOf(formData, "debut") ?? new Date(),
    endAt: dateOf(formData, "fin"),
    active: flag(formData, "active"),
  };

  if (id) {
    await prisma.alert.update({ where: { id }, data });
    await recordAudit({ userId: user.id, action: "UPDATE", entity: "Alert", entityId: id, label: title });
  } else {
    const created = await prisma.alert.create({ data, select: { id: true } });
    await recordAudit({ userId: user.id, action: "CREATE", entity: "Alert", entityId: created.id, label: title });
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/alertes");
  redirect("/admin/alertes?enregistre=1");
}

export async function basculerAlerte(id: string): Promise<void> {
  const user = await requireEditor();
  const alert = await prisma.alert.findUnique({ where: { id }, select: { active: true, title: true } });
  if (!alert) return;

  await prisma.alert.update({ where: { id }, data: { active: !alert.active } });
  await recordAudit({
    userId: user.id,
    action: "UPDATE",
    entity: "Alert",
    entityId: id,
    label: alert.title,
    detail: alert.active ? "Désactivation" : "Activation",
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin/alertes");
}

export async function supprimerAlerte(id: string): Promise<void> {
  const user = await requireEditor();
  const alert = await prisma.alert.findUnique({ where: { id }, select: { title: true } });
  if (!alert) return;

  await prisma.alert.delete({ where: { id } });
  await recordAudit({ userId: user.id, action: "DELETE", entity: "Alert", entityId: id, label: alert.title });

  revalidatePath("/", "layout");
  revalidatePath("/admin/alertes");
}

/* =============================== Associations ============================= */

export async function enregistrerAssociation(formData: FormData): Promise<void> {
  const user = await requireEditor("/admin/associations");

  const id = text(formData, "id");
  const name = text(formData, "nom");
  if (name.length < 2) redirect("/admin/associations?erreur=nom");

  const category = text(formData, "categorie");

  const data = {
    name,
    shortName: optional(formData, "nomCourt"),
    category: ASSOCIATION_CATEGORIES.includes(category as never) ? category : "AUTRE",
    description: sanitizeHtml(text(formData, "description")),
    president: optional(formData, "president"),
    contactName: optional(formData, "contact"),
    email: optional(formData, "courriel"),
    phone: optional(formData, "telephone"),
    website: optional(formData, "siteInternet"),
    facebook: optional(formData, "facebook"),
    address: optional(formData, "adresse"),
    schedule: optional(formData, "creneaux"),
    fee: optional(formData, "cotisation"),
    logoId: media(formData, "logo"),
    active: flag(formData, "active"),
    featured: flag(formData, "vedette"),
    order: number(formData, "ordre"),
  };

  if (id) {
    await prisma.association.update({ where: { id }, data });
    await recordAudit({ userId: user.id, action: "UPDATE", entity: "Association", entityId: id, label: name });
  } else {
    const slug = await uniqueSlug(
      name,
      async (candidate) =>
        Boolean(await prisma.association.findUnique({ where: { slug: candidate }, select: { id: true } })),
      "association",
    );
    const created = await prisma.association.create({ data: { ...data, slug }, select: { id: true } });
    await recordAudit({
      userId: user.id,
      action: "CREATE",
      entity: "Association",
      entityId: created.id,
      label: name,
    });
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/associations");
  redirect("/admin/associations?enregistre=1");
}

export async function supprimerAssociation(id: string): Promise<void> {
  const user = await requireEditor();
  const association = await prisma.association.findUnique({ where: { id }, select: { name: true } });
  if (!association) return;

  await prisma.association.delete({ where: { id } });
  await recordAudit({
    userId: user.id,
    action: "DELETE",
    entity: "Association",
    entityId: id,
    label: association.name,
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin/associations");
}

/* =================================== Élus ================================= */

export async function enregistrerElu(formData: FormData): Promise<void> {
  const user = await requireEditor("/admin/elus");

  const id = text(formData, "id");
  const name = text(formData, "nom");
  if (name.length < 2) redirect("/admin/elus?erreur=nom");

  const role = text(formData, "fonction");

  const data = {
    name,
    role: ELU_ROLES.includes(role as never) ? role : "CONSEILLER",
    title: optional(formData, "intitule"),
    delegations: optional(formData, "delegations"),
    email: optional(formData, "courriel"),
    order: number(formData, "ordre"),
    photoId: media(formData, "photo"),
  };

  if (id) {
    await prisma.elu.update({ where: { id }, data });
    await recordAudit({ userId: user.id, action: "UPDATE", entity: "Elu", entityId: id, label: name });
  } else {
    const created = await prisma.elu.create({ data, select: { id: true } });
    await recordAudit({ userId: user.id, action: "CREATE", entity: "Elu", entityId: created.id, label: name });
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/elus");
  redirect("/admin/elus?enregistre=1");
}

export async function supprimerElu(id: string): Promise<void> {
  const user = await requireEditor();
  const elu = await prisma.elu.findUnique({ where: { id }, select: { name: true } });
  if (!elu) return;

  await prisma.elu.delete({ where: { id } });
  await recordAudit({ userId: user.id, action: "DELETE", entity: "Elu", entityId: id, label: elu.name });

  revalidatePath("/", "layout");
  revalidatePath("/admin/elus");
}

/* =============================== Équipements ============================== */

export async function enregistrerEquipement(formData: FormData): Promise<void> {
  const user = await requireEditor("/admin/equipements");

  const id = text(formData, "id");
  const name = text(formData, "nom");
  if (name.length < 2) redirect("/admin/equipements?erreur=nom");

  const category = text(formData, "categorie");
  const lat = Number(formData.get("latitude"));
  const lng = Number(formData.get("longitude"));

  const data = {
    name,
    category: EQUIPEMENT_CATEGORIES.includes(category as never) ? category : "MAIRIE",
    description: optional(formData, "description"),
    address: optional(formData, "adresse"),
    lat: Number.isFinite(lat) && lat !== 0 ? lat : null,
    lng: Number.isFinite(lng) && lng !== 0 ? lng : null,
    phone: optional(formData, "telephone"),
    email: optional(formData, "courriel"),
    hours: optional(formData, "horaires"),
    accessible: flag(formData, "accessible"),
    order: number(formData, "ordre"),
    imageId: media(formData, "image"),
  };

  if (id) {
    await prisma.equipement.update({ where: { id }, data });
    await recordAudit({ userId: user.id, action: "UPDATE", entity: "Equipement", entityId: id, label: name });
  } else {
    const slug = await uniqueSlug(
      name,
      async (candidate) =>
        Boolean(await prisma.equipement.findUnique({ where: { slug: candidate }, select: { id: true } })),
      "equipement",
    );
    const created = await prisma.equipement.create({ data: { ...data, slug }, select: { id: true } });
    await recordAudit({
      userId: user.id,
      action: "CREATE",
      entity: "Equipement",
      entityId: created.id,
      label: name,
    });
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/equipements");
  redirect("/admin/equipements?enregistre=1");
}

export async function supprimerEquipement(id: string): Promise<void> {
  const user = await requireEditor();
  const equipement = await prisma.equipement.findUnique({ where: { id }, select: { name: true } });
  if (!equipement) return;

  await prisma.equipement.delete({ where: { id } });
  await recordAudit({
    userId: user.id,
    action: "DELETE",
    entity: "Equipement",
    entityId: id,
    label: equipement.name,
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin/equipements");
}

/* ================================ Démarches =============================== */

export async function enregistrerDemarche(formData: FormData): Promise<void> {
  const user = await requireEditor("/admin/demarches");

  const id = text(formData, "id");
  const title = text(formData, "titre");
  if (title.length < 2) redirect("/admin/demarches?erreur=titre");

  const category = text(formData, "categorie");

  // Les pièces à fournir sont saisies une par ligne.
  const requiredDocs = text(formData, "pieces")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const data = {
    title,
    category: DEMARCHE_CATEGORIES.includes(category as never) ? category : "AUTRE",
    summary: text(formData, "resume"),
    content: sanitizeHtml(text(formData, "contenu")),
    onlineUrl: optional(formData, "teleservice"),
    onlineLabel: optional(formData, "libelleTeleservice"),
    internalPath: optional(formData, "serviceInterne"),
    requiredDocs: JSON.stringify(requiredDocs),
    processTime: optional(formData, "delai"),
    cost: optional(formData, "cout"),
    audience: optional(formData, "public"),
    icon: optional(formData, "icone"),
    featured: flag(formData, "vedette"),
    order: number(formData, "ordre"),
  };

  if (id) {
    await prisma.demarche.update({ where: { id }, data });
    await recordAudit({ userId: user.id, action: "UPDATE", entity: "Demarche", entityId: id, label: title });
  } else {
    const slug = await uniqueSlug(
      title,
      async (candidate) =>
        Boolean(await prisma.demarche.findUnique({ where: { slug: candidate }, select: { id: true } })),
      "demarche",
    );
    const created = await prisma.demarche.create({ data: { ...data, slug }, select: { id: true } });
    await recordAudit({
      userId: user.id,
      action: "CREATE",
      entity: "Demarche",
      entityId: created.id,
      label: title,
    });
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/demarches");
  redirect("/admin/demarches?enregistre=1");
}

export async function supprimerDemarche(id: string): Promise<void> {
  const user = await requireEditor();
  const demarche = await prisma.demarche.findUnique({ where: { id }, select: { title: true } });
  if (!demarche) return;

  await prisma.demarche.delete({ where: { id } });
  await recordAudit({
    userId: user.id,
    action: "DELETE",
    entity: "Demarche",
    entityId: id,
    label: demarche.title,
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin/demarches");
}

/* =============================== Médiathèque ============================== */

export async function mettreAJourMedia(formData: FormData): Promise<void> {
  const user = await requireEditor("/admin/medias");

  const id = text(formData, "id");
  if (!id) return;

  await prisma.media.update({
    where: { id },
    data: {
      alt: text(formData, "alt"),
      credit: optional(formData, "credit"),
      folder: slugify(text(formData, "dossier")) || "general",
    },
  });

  await recordAudit({ userId: user.id, action: "UPDATE", entity: "Media", entityId: id, label: text(formData, "alt") });
  revalidatePath("/admin/medias");
}

/**
 * Supprime un fichier de la médiathèque.
 *
 * Le fichier physique est conservé sur le disque : le supprimer risquerait de
 * casser une page qui le référencerait encore par son URL. Le ménage des
 * fichiers orphelins relève d'une opération d'administration séparée.
 */
export async function supprimerMedia(id: string): Promise<void> {
  const user = await requireEditor();

  const media = await prisma.media.findUnique({
    where: { id },
    select: {
      filename: true,
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
  });
  if (!media) return;

  const usages = Object.values(media._count).reduce((sum, count) => sum + count, 0);
  if (usages > 0) {
    // Un média encore utilisé n'est pas supprimé : l'écran affiche le nombre
    // d'utilisations pour que l'agent les détache d'abord.
    revalidatePath("/admin/medias");
    return;
  }

  await prisma.media.delete({ where: { id } });
  await recordAudit({ userId: user.id, action: "DELETE", entity: "Media", entityId: id, label: media.filename });
  revalidatePath("/admin/medias");
}
