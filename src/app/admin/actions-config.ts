"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { can, hashPassword, recordAudit, requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ROLES, type Role } from "@/lib/enums";
import { sanitizeHtml } from "@/lib/sanitize";
import {
  DEFAULT_SETTINGS,
  SETTINGS_GROUP_LABELS,
  saveSettingsGroup,
  type SettingsGroup,
} from "@/lib/settings";
import { slugify } from "@/lib/utils";

const text = (formData: FormData, key: string): string => String(formData.get(key) ?? "").trim();
const flag = (formData: FormData, key: string): boolean => formData.get(key) === "on";
const number = (formData: FormData, key: string, fallback = 0): number => {
  const value = Number(formData.get(key));
  return Number.isFinite(value) ? value : fallback;
};

async function requireAdmin(returnTo = "/admin") {
  const user = await requireUser(returnTo);
  if (!can.manageSettings(user.role as Role)) redirect("/admin?acces=refuse");
  return user;
}

async function requireEditor(returnTo = "/admin") {
  const user = await requireUser(returnTo);
  if (!can.editContent(user.role as Role)) redirect("/admin?acces=refuse");
  return user;
}

/* ================================== Menus ================================= */

export async function enregistrerEntreeMenu(formData: FormData): Promise<void> {
  const user = await requireEditor("/admin/menus");

  const id = text(formData, "id");
  const menuId = text(formData, "menu");
  const label = text(formData, "libelle");
  if (!label || (!id && !menuId)) return;

  const data = {
    label,
    href: text(formData, "lien") || null,
    pageId: text(formData, "page") || null,
    description: text(formData, "description") || null,
    icon: text(formData, "icone") || null,
    highlight: flag(formData, "misEnAvant"),
    order: number(formData, "ordre"),
    parentId: text(formData, "parent") || null,
  };

  if (id) {
    await prisma.menuItem.update({ where: { id }, data });
    await recordAudit({ userId: user.id, action: "UPDATE", entity: "MenuItem", entityId: id, label });
  } else {
    const created = await prisma.menuItem.create({ data: { ...data, menuId }, select: { id: true } });
    await recordAudit({ userId: user.id, action: "CREATE", entity: "MenuItem", entityId: created.id, label });
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/menus");
}

export async function supprimerEntreeMenu(id: string): Promise<void> {
  const user = await requireEditor();
  const item = await prisma.menuItem.findUnique({ where: { id }, select: { label: true } });
  if (!item) return;

  // Les entrées filles sont supprimées en cascade (défini dans le schéma).
  await prisma.menuItem.delete({ where: { id } });
  await recordAudit({ userId: user.id, action: "DELETE", entity: "MenuItem", entityId: id, label: item.label });

  revalidatePath("/", "layout");
  revalidatePath("/admin/menus");
}

export async function deplacerEntreeMenu(id: string, direction: "haut" | "bas"): Promise<void> {
  const user = await requireEditor();

  const item = await prisma.menuItem.findUnique({
    where: { id },
    select: { id: true, order: true, menuId: true, parentId: true, label: true },
  });
  if (!item) return;

  const siblings = await prisma.menuItem.findMany({
    where: { menuId: item.menuId, parentId: item.parentId },
    orderBy: { order: "asc" },
    select: { id: true },
  });

  const index = siblings.findIndex((sibling) => sibling.id === id);
  const target = direction === "haut" ? index - 1 : index + 1;
  if (index === -1 || target < 0 || target >= siblings.length) return;

  const reordered = [...siblings];
  [reordered[index], reordered[target]] = [reordered[target], reordered[index]];

  // On réécrit l'ordre de toute la fratrie : plus simple et plus robuste qu'un
  // échange de deux valeurs, notamment si des doublons se sont glissés.
  await prisma.$transaction(
    reordered.map((sibling, position) =>
      prisma.menuItem.update({ where: { id: sibling.id }, data: { order: position } }),
    ),
  );

  await recordAudit({
    userId: user.id,
    action: "UPDATE",
    entity: "MenuItem",
    entityId: id,
    label: item.label,
    detail: `Déplacement vers le ${direction}`,
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin/menus");
}

/* =============================== Paramètres =============================== */

/**
 * Enregistre un groupe de réglages.
 *
 * Chaque groupe possède sa propre logique de reconstruction depuis le
 * formulaire : les horaires et les listes de liens n'ont pas la même forme
 * qu'un simple champ texte.
 */
export async function enregistrerParametres(formData: FormData): Promise<void> {
  const user = await requireAdmin("/admin/parametres");

  const group = text(formData, "groupe") as SettingsGroup;
  if (!(group in DEFAULT_SETTINGS)) return;

  let value: Record<string, unknown> = {};

  if (group === "identity") {
    value = {
      name: text(formData, "nom"),
      shortName: text(formData, "nomCourt"),
      tagline: text(formData, "accroche"),
      inhabitantsLabel: text(formData, "gentile"),
      department: text(formData, "departement"),
      region: text(formData, "region"),
      intercommunality: text(formData, "intercommunalite"),
      intercommunalityUrl: text(formData, "intercommunaliteUrl"),
      insee: text(formData, "insee"),
      population: number(formData, "population", DEFAULT_SETTINGS.identity.population),
      area: text(formData, "superficie"),
      altitude: text(formData, "altitude"),
      mayor: text(formData, "maire"),
    };
  } else if (group === "contact") {
    value = {
      venue: text(formData, "etablissement"),
      address: text(formData, "adresse"),
      postalCode: text(formData, "codePostal"),
      city: text(formData, "ville"),
      phone: text(formData, "telephone"),
      fax: text(formData, "fax"),
      email: text(formData, "courriel"),
      technicalEmail: text(formData, "courrielTechnique"),
      waterEmail: text(formData, "courrielEau"),
      lat: number(formData, "latitude", DEFAULT_SETTINGS.contact.lat),
      lng: number(formData, "longitude", DEFAULT_SETTINGS.contact.lng),
      emergencyNote: text(formData, "urgences"),
    };
  } else if (group === "hours") {
    const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
    value = {
      intro: text(formData, "introduction"),
      note: text(formData, "note"),
      phoneNote: text(formData, "noteTelephone"),
      slots: days.map((day, index) => {
        const raw = text(formData, `creneau-${index}`);
        const closed = !raw;
        return {
          day,
          closed,
          // Plusieurs plages horaires sont séparées par un point-virgule.
          ranges: closed
            ? []
            : raw
                .split(/[;·]/)
                .map((range) => range.trim())
                .filter(Boolean),
        };
      }),
    };
  } else if (group === "social") {
    value = {
      facebook: text(formData, "facebook"),
      instagram: text(formData, "instagram"),
      youtube: text(formData, "youtube"),
      linkedin: text(formData, "linkedin"),
      panneauPocket: text(formData, "panneauPocket"),
      intramuros: text(formData, "intramuros"),
    };
  } else if (group === "footer") {
    const parsePairs = (raw: string) =>
      raw
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [label, href] = line.split("|").map((part) => part.trim());
          return { label: label ?? "", href: href ?? "" };
        })
        .filter((entry) => entry.label && entry.href);

    value = {
      about: text(formData, "presentation"),
      partners: parsePairs(text(formData, "partenaires")),
      legalLinks: parsePairs(text(formData, "liensLegaux")),
    };
  } else if (group === "theme") {
    value = {
      primary: text(formData, "couleurPrincipale") || DEFAULT_SETTINGS.theme.primary,
      accent: text(formData, "couleurAccent") || DEFAULT_SETTINGS.theme.accent,
      dark: text(formData, "couleurFoncee") || DEFAULT_SETTINGS.theme.dark,
      radius: text(formData, "arrondis") || DEFAULT_SETTINGS.theme.radius,
      heroPattern: text(formData, "motif") || DEFAULT_SETTINGS.theme.heroPattern,
    };
  } else if (group === "services") {
    value = {
      roomBooking: flag(formData, "reservationSalle"),
      equipmentLoan: flag(formData, "pretMateriel"),
      reporting: flag(formData, "signalement"),
      newsletter: flag(formData, "newsletter"),
      appointment: flag(formData, "rendezVous"),
    };
  } else if (group === "seo") {
    value = {
      titleSuffix: text(formData, "suffixeTitre"),
      description: text(formData, "description"),
      keywords: text(formData, "motsCles"),
    };
  }

  await saveSettingsGroup(group, value);

  await recordAudit({
    userId: user.id,
    action: "UPDATE",
    entity: "SiteSetting",
    entityId: group,
    label: SETTINGS_GROUP_LABELS[group],
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin/parametres");
  redirect(`/admin/parametres?groupe=${group}&enregistre=1`);
}

/* ============================== Utilisateurs ============================== */

export async function enregistrerUtilisateur(formData: FormData): Promise<void> {
  const admin = await requireAdmin("/admin/utilisateurs");

  const id = text(formData, "id");
  const email = text(formData, "courriel").toLowerCase();
  const name = text(formData, "nom");
  const role = text(formData, "role");
  const password = String(formData.get("motdepasse") ?? "");

  if (!name || !email) redirect("/admin/utilisateurs?erreur=champs");
  if (!ROLES.includes(role as Role)) redirect("/admin/utilisateurs?erreur=role");

  const duplicate = await prisma.user.findFirst({
    where: { email, ...(id ? { id: { not: id } } : {}) },
    select: { id: true },
  });
  if (duplicate) redirect("/admin/utilisateurs?erreur=courriel");

  if (!id && password.length < 10) redirect("/admin/utilisateurs?erreur=motdepasse");
  if (password && password.length < 10) redirect("/admin/utilisateurs?erreur=motdepasse");

  const data: {
    email: string;
    name: string;
    role: string;
    job: string | null;
    active: boolean;
    passwordHash?: string;
  } = {
    email,
    name,
    role,
    job: text(formData, "fonction") || null,
    active: flag(formData, "actif"),
  };

  if (password) data.passwordHash = await hashPassword(password);

  if (id) {
    // Un administrateur ne peut ni se retirer ses droits ni se désactiver :
    // c'est le meilleur moyen de se retrouver enfermé dehors.
    if (id === admin.id) {
      data.role = "ADMIN";
      data.active = true;
    }
    await prisma.user.update({ where: { id }, data });
    await recordAudit({ userId: admin.id, action: "UPDATE", entity: "User", entityId: id, label: email });
  } else {
    const created = await prisma.user.create({
      data: { ...data, passwordHash: data.passwordHash ?? (await hashPassword(password)) },
      select: { id: true },
    });
    await recordAudit({ userId: admin.id, action: "CREATE", entity: "User", entityId: created.id, label: email });
  }

  revalidatePath("/admin/utilisateurs");
  redirect("/admin/utilisateurs?enregistre=1");
}

export async function basculerUtilisateur(id: string): Promise<void> {
  const admin = await requireAdmin();
  if (id === admin.id) return;

  const user = await prisma.user.findUnique({ where: { id }, select: { active: true, email: true } });
  if (!user) return;

  await prisma.user.update({ where: { id }, data: { active: !user.active } });
  await recordAudit({
    userId: admin.id,
    action: "UPDATE",
    entity: "User",
    entityId: id,
    label: user.email,
    detail: user.active ? "Désactivation" : "Réactivation",
  });

  revalidatePath("/admin/utilisateurs");
}

/**
 * Supprime un compte.
 *
 * Les contenus rédigés par cette personne restent en place : les relations
 * sont détachées (`onDelete: SetNull`), le journal d'audit conserve la trace
 * des actions passées.
 */
export async function supprimerUtilisateur(id: string): Promise<void> {
  const admin = await requireAdmin();
  if (id === admin.id) return;

  const user = await prisma.user.findUnique({ where: { id }, select: { email: true } });
  if (!user) return;

  await prisma.user.delete({ where: { id } });
  await recordAudit({ userId: admin.id, action: "DELETE", entity: "User", entityId: id, label: user.email });

  revalidatePath("/admin/utilisateurs");
}

/* ========================== Salles et matériel ============================ */

export async function enregistrerSalle(formData: FormData): Promise<void> {
  const user = await requireEditor("/admin/ressources");

  const id = text(formData, "id");
  const name = text(formData, "nom");
  if (!name) return;

  const equipments = text(formData, "equipements")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const data = {
    name,
    subtitle: text(formData, "sousTitre") || null,
    description: sanitizeHtml(text(formData, "description")),
    capacitySeated: number(formData, "capaciteAssise") || null,
    capacityStanding: number(formData, "capaciteDebout") || null,
    surface: number(formData, "surface") || null,
    address: text(formData, "adresse") || null,
    equipments: JSON.stringify(equipments),
    rules: sanitizeHtml(text(formData, "reglement")) || null,
    bookingWindowDays: number(formData, "fenetre", 365),
    minNoticeDays: number(formData, "delai", 15),
    active: flag(formData, "active"),
    order: number(formData, "ordre"),
    imageId: text(formData, "image") || null,
  };

  if (id) {
    await prisma.room.update({ where: { id }, data });
    await recordAudit({ userId: user.id, action: "UPDATE", entity: "Room", entityId: id, label: name });
  } else {
    let slug = slugify(name) || "salle";
    let attempt = 2;
    while (await prisma.room.findUnique({ where: { slug }, select: { id: true } })) {
      slug = `${slugify(name)}-${attempt}`;
      attempt += 1;
      if (attempt > 40) break;
    }
    const created = await prisma.room.create({ data: { ...data, slug }, select: { id: true } });
    await recordAudit({ userId: user.id, action: "CREATE", entity: "Room", entityId: created.id, label: name });
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/ressources");
}

export async function enregistrerTarif(formData: FormData): Promise<void> {
  const user = await requireEditor("/admin/ressources");

  const roomId = text(formData, "salle");
  const audience = text(formData, "situation");
  const slotKey = text(formData, "creneau");
  if (!roomId || !audience || !slotKey) return;

  const amountCents = Math.max(0, Math.round(number(formData, "montant")));
  const depositCents = Math.max(0, Math.round(number(formData, "caution")));

  await prisma.roomTariff.upsert({
    where: { roomId_audience_slotKey: { roomId, audience, slotKey } },
    create: {
      roomId,
      audience,
      slotKey,
      label: text(formData, "libelle") || audience,
      amountCents,
      depositCents,
      notes: text(formData, "note") || null,
    },
    update: {
      label: text(formData, "libelle") || audience,
      amountCents,
      depositCents,
      notes: text(formData, "note") || null,
    },
  });

  await recordAudit({
    userId: user.id,
    action: "UPDATE",
    entity: "RoomTariff",
    label: `${audience} / ${slotKey}`,
    detail: `${amountCents / 100} € · caution ${depositCents / 100} €`,
  });

  revalidatePath("/", "layout");
  revalidatePath("/admin/ressources");
}

export async function enregistrerMateriel(formData: FormData): Promise<void> {
  const user = await requireEditor("/admin/ressources");

  const id = text(formData, "id");
  const name = text(formData, "nom");
  if (!name) return;

  const data = {
    name,
    category: text(formData, "categorie") || "LOGISTIQUE",
    description: text(formData, "description") || null,
    unitLabel: text(formData, "unite") || "unité",
    quantityTotal: Math.max(0, number(formData, "quantite", 1)),
    depositCents: Math.max(0, Math.round(number(formData, "caution"))),
    feeCents: Math.max(0, Math.round(number(formData, "participation"))),
    requiresVehicle: flag(formData, "vehicule"),
    reservedForAssociations: flag(formData, "reserveAssociations"),
    active: flag(formData, "actif"),
    order: number(formData, "ordre"),
    imageId: text(formData, "image") || null,
  };

  if (id) {
    await prisma.equipmentItem.update({ where: { id }, data });
    await recordAudit({ userId: user.id, action: "UPDATE", entity: "EquipmentItem", entityId: id, label: name });
  } else {
    let slug = slugify(name) || "materiel";
    let attempt = 2;
    while (await prisma.equipmentItem.findUnique({ where: { slug }, select: { id: true } })) {
      slug = `${slugify(name)}-${attempt}`;
      attempt += 1;
      if (attempt > 40) break;
    }
    const created = await prisma.equipmentItem.create({ data: { ...data, slug }, select: { id: true } });
    await recordAudit({
      userId: user.id,
      action: "CREATE",
      entity: "EquipmentItem",
      entityId: created.id,
      label: name,
    });
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/ressources");
}

export async function supprimerMateriel(id: string): Promise<void> {
  const user = await requireEditor();

  const item = await prisma.equipmentItem.findUnique({
    where: { id },
    select: { name: true, _count: { select: { lines: true } } },
  });
  if (!item) return;

  if (item._count.lines > 0) {
    // Le matériel figure dans des prêts : on le désactive au lieu de le
    // supprimer, afin de conserver l'historique.
    await prisma.equipmentItem.update({ where: { id }, data: { active: false } });
    await recordAudit({
      userId: user.id,
      action: "UPDATE",
      entity: "EquipmentItem",
      entityId: id,
      label: item.name,
      detail: "Désactivation (matériel présent dans des prêts)",
    });
  } else {
    await prisma.equipmentItem.delete({ where: { id } });
    await recordAudit({
      userId: user.id,
      action: "DELETE",
      entity: "EquipmentItem",
      entityId: id,
      label: item.name,
    });
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/ressources");
}
