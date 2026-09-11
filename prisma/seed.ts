/**
 * Installation du contenu initial du site.
 *
 * Exécuté par `npm run db:seed`. Le script est idempotent : il remet la base
 * dans un état connu, ce qui permet de réinitialiser une démonstration en une
 * commande (`npm run db:reset`).
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

import { buildAlerts, buildDocuments, buildEvents, buildNews, NEWS_CATEGORIES } from "./data/editorial";
import { PHOTOS } from "./data/photos";
import { SEED_MENUS, SEED_PAGES, type SeedMenuItem } from "./data/pages";
import {
  ASSOCIATIONS,
  COMMISSIONS,
  DEMARCHES,
  ELUS,
  EQUIPEMENTS,
  EQUIPMENT_ITEMS,
  ROOMS,
  visuel,
} from "./data/reference";
import { buildSimplePdf } from "./lib/pdf";
import { DEFAULT_SETTINGS, SETTINGS_GROUP_LABELS } from "../src/lib/settings";

const prisma = new PrismaClient();

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const DOCUMENT_DIR = path.join(UPLOAD_DIR, "documents");

function slugifyFile(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

function daysFromNow(days: number, hour = 12): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  return date;
}

/** Prochain vendredi à partir d'un décalage donné (créneaux week-end). */
function nextFriday(offsetWeeks: number): Date {
  const date = new Date();
  const delta = (5 - date.getDay() + 7) % 7 || 7;
  date.setDate(date.getDate() + delta + offsetWeeks * 7);
  date.setHours(12, 0, 0, 0);
  return date;
}

function token(length = 24): string {
  const alphabet = "abcdefghijkmnopqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

async function reset(): Promise<void> {
  // Ordre choisi pour respecter les dépendances entre tables.
  await prisma.requestMessage.deleteMany();
  await prisma.request.deleteMany();
  await prisma.equipmentLoanLine.deleteMany();
  await prisma.equipmentLoan.deleteMany();
  await prisma.equipmentItem.deleteMany();
  await prisma.roomBooking.deleteMany();
  await prisma.roomClosure.deleteMany();
  await prisma.roomTariff.deleteMany();
  await prisma.roomSlot.deleteMany();
  await prisma.room.deleteMany();
  await prisma.commissionMember.deleteMany();
  await prisma.commission.deleteMany();
  await prisma.elu.deleteMany();
  await prisma.event.deleteMany();
  await prisma.association.deleteMany();
  await prisma.newsPost.deleteMany();
  await prisma.newsCategory.deleteMany();
  await prisma.document.deleteMany();
  await prisma.demarche.deleteMany();
  await prisma.equipement.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.menu.deleteMany();
  await prisma.pageRevision.deleteMany();
  await prisma.block.deleteMany();
  await prisma.page.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.newsletterSubscriber.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.media.deleteMany();
  await prisma.siteSetting.deleteMany();
  await prisma.user.deleteMany();
}

async function main(): Promise<void> {
  console.log("→ Réinitialisation de la base…");
  await reset();

  /* ----------------------------- Utilisateurs ---------------------------- */

  console.log("→ Comptes du back-office…");
  const password = await bcrypt.hash("chessy2026", 11);
  const admin = await prisma.user.create({
    data: {
      email: "admin@chessy69.fr",
      name: "Secrétariat général",
      job: "Secrétaire général de mairie",
      passwordHash: password,
      role: "ADMIN",
    },
  });
  const editeur = await prisma.user.create({
    data: {
      email: "communication@chessy69.fr",
      name: "Service communication",
      job: "Chargé de communication",
      passwordHash: password,
      role: "EDITEUR",
    },
  });
  const agent = await prisma.user.create({
    data: {
      email: "accueil@chessy69.fr",
      name: "Accueil de la mairie",
      job: "Agent d'accueil et état civil",
      passwordHash: password,
      role: "AGENT",
    },
  });

  /* ------------------------------ Paramètres ----------------------------- */

  console.log("→ Paramètres du site…");
  for (const [group, value] of Object.entries(DEFAULT_SETTINGS)) {
    await prisma.siteSetting.create({
      data: {
        key: group,
        value: JSON.stringify(value),
        group,
        label: SETTINGS_GROUP_LABELS[group as keyof typeof SETTINGS_GROUP_LABELS],
      },
    });
  }

  /* ------------------------------ Médiathèque ---------------------------- */

  console.log("→ Médiathèque (visuels de démonstration)…");
  const mediaCache = new Map<string, string>();

  async function media(
    scene: Parameters<typeof visuel>[0],
    seed: string,
    alt: string,
    folder = "general",
    width = 1600,
    height = 900,
  ): Promise<string> {
    const cacheKey = `${scene}:${seed}:${width}x${height}`;
    const cached = mediaCache.get(cacheKey);
    if (cached) return cached;
    const created = await prisma.media.create({
      data: {
        filename: `${slugifyFile(seed)}.svg`,
        url: visuel(scene, seed, undefined, width, height),
        mimeType: "image/svg+xml",
        size: 0,
        width,
        height,
        alt,
        credit: "Visuel de démonstration — à remplacer par une photographie de la commune",
        folder,
        uploadedById: admin.id,
      },
    });
    mediaCache.set(cacheKey, created.id);
    return created.id;
  }

  // Photographies réelles de la commune, versionnées dans public/photos/.
  // Elles rejoignent la médiathèque pour être réutilisables depuis le back-office.
  for (const p of PHOTOS) {
    await prisma.media.create({
      data: {
        filename: p.filename,
        url: p.url,
        mimeType: "image/jpeg",
        size: 0,
        width: p.width,
        height: p.height,
        alt: p.alt,
        credit: p.credit,
        folder: p.folder,
        uploadedById: admin.id,
      },
    });
  }

  /* ------------------------------- Documents ----------------------------- */

  console.log("→ Documents PDF…");
  if (!existsSync(DOCUMENT_DIR)) mkdirSync(DOCUMENT_DIR, { recursive: true });

  for (const doc of buildDocuments()) {
    const filename = `${slugifyFile(doc.title)}.pdf`;
    const buffer = buildSimplePdf({
      title: doc.title,
      subtitle: doc.description,
      paragraphs: [
        "Ce fichier est un document de demonstration livre avec le site afin que les liens de telechargement soient fonctionnels des l'installation.",
        "Pour le remplacer par le document officiel, connectez-vous au back-office, ouvrez la mediatheque, televersez le PDF definitif puis rattachez-le a cette fiche depuis la rubrique Documents.",
        "Le titre, la description, la categorie et la date de publication restent modifiables a tout moment, sans intervention technique.",
      ],
    });
    writeFileSync(path.join(DOCUMENT_DIR, filename), buffer);

    const file = await prisma.media.create({
      data: {
        filename,
        url: `/uploads/documents/${filename}`,
        mimeType: "application/pdf",
        size: buffer.byteLength,
        alt: doc.title,
        folder: "documents",
        uploadedById: admin.id,
      },
    });

    await prisma.document.create({
      data: {
        title: doc.title,
        description: doc.description,
        category: doc.category,
        year: doc.year,
        order: doc.order,
        fileId: file.id,
        meetingDate:
          "meetingDaysAgo" in doc && typeof doc.meetingDaysAgo === "number"
            ? daysFromNow(-doc.meetingDaysAgo, 20)
            : null,
        publishedAt:
          "meetingDaysAgo" in doc && typeof doc.meetingDaysAgo === "number"
            ? daysFromNow(-doc.meetingDaysAgo + 7, 10)
            : daysFromNow(-15 - doc.order * 30, 10),
      },
    });
  }

  /* ------------------------------ Actualités ----------------------------- */

  console.log("→ Actualités…");
  const categoryIds = new Map<string, string>();
  for (const category of NEWS_CATEGORIES) {
    const created = await prisma.newsCategory.create({ data: category });
    categoryIds.set(category.slug, created.id);
  }

  for (const post of buildNews()) {
    const coverId = await media(
      post.cover.includes("scene=mine")
        ? "mine"
        : post.cover.includes("scene=village")
          ? "village"
          : post.cover.includes("scene=paysage")
            ? "paysage"
            : post.cover.includes("scene=salle")
              ? "salle"
              : "abstrait",
      `actualite-${post.slug}`,
      post.title,
      "actualites",
    );

    await prisma.newsPost.create({
      data: {
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        coverId,
        categoryId: categoryIds.get(post.categorySlug) ?? null,
        status: "PUBLIEE",
        featured: post.featured,
        pinned: post.pinned,
        publishedAt: post.publishedAt,
        authorId: editeur.id,
        views: Math.floor(Math.random() * 400) + 40,
      },
    });
  }

  /* ----------------------------- Associations ---------------------------- */

  console.log("→ Associations…");
  const associationIds = new Map<string, string>();
  for (const association of ASSOCIATIONS) {
    const logoId = await media(
      "abstrait",
      `association-${association.slug}`,
      association.name,
      "associations",
      800,
      800,
    );
    const created = await prisma.association.create({
      data: {
        slug: association.slug,
        name: association.name,
        shortName: association.shortName,
        category: association.category,
        description: association.description,
        president: association.president || null,
        website: association.website || null,
        featured: association.featured,
        order: association.order,
        logoId,
        active: true,
      },
    });
    associationIds.set(association.slug, created.id);
  }

  /* -------------------------------- Agenda ------------------------------- */

  console.log("→ Agenda…");
  for (const event of buildEvents()) {
    const coverId = await media(
      event.cover.includes("scene=mine")
        ? "mine"
        : event.cover.includes("scene=village")
          ? "village"
          : event.cover.includes("scene=paysage")
            ? "paysage"
            : event.cover.includes("scene=salle")
              ? "salle"
              : "abstrait",
      `agenda-${event.slug}`,
      event.title,
      "agenda",
    );

    await prisma.event.create({
      data: {
        slug: event.slug,
        title: event.title,
        excerpt: event.excerpt,
        description: event.description,
        startAt: event.startAt,
        endAt: event.endAt,
        place: event.place,
        address: "address" in event ? (event.address as string) : null,
        organizer: "organizer" in event ? (event.organizer as string) : null,
        priceInfo: event.priceInfo,
        audience: event.audience,
        category: event.category,
        coverId,
        associationId:
          "associationSlug" in event
            ? associationIds.get(event.associationSlug as string) ?? null
            : null,
        status: "PUBLIEE",
        featured: event.featured,
      },
    });
  }

  /* --------------------------------- Élus -------------------------------- */

  console.log("→ Élus et commissions…");
  const eluIds: string[] = [];
  for (const elu of ELUS) {
    const photoId = await media("portrait", `elu-${elu.order}`, elu.name, "elus", 800, 800);
    const created = await prisma.elu.create({
      data: {
        name: elu.name,
        role: elu.role,
        title: elu.title,
        delegations: elu.delegations || null,
        email: elu.email || null,
        order: elu.order,
        photoId,
      },
    });
    eluIds.push(created.id);
  }

  for (const commission of COMMISSIONS) {
    const created = await prisma.commission.create({ data: commission });
    // Le maire siège dans toutes les commissions ; l'adjoint référent la préside.
    const chairIndex = Math.min(commission.order + 1, eluIds.length - 1);
    await prisma.commissionMember.create({
      data: { commissionId: created.id, eluId: eluIds[0], isChair: false },
    });
    if (chairIndex > 0) {
      await prisma.commissionMember.create({
        data: { commissionId: created.id, eluId: eluIds[chairIndex], isChair: true },
      });
    }
  }

  /* ------------------------------ Équipements ---------------------------- */

  console.log("→ Équipements communaux…");
  for (const equipement of EQUIPEMENTS) {
    const scene =
      equipement.category === "CULTURE"
        ? "salle"
        : equipement.category === "SPORT" || equipement.category === "LOISIRS"
          ? "paysage"
          : equipement.category === "MAIRIE"
            ? "village"
            : "abstrait";
    const imageId = await media(scene, `equipement-${equipement.slug}`, equipement.name, "equipements");
    await prisma.equipement.create({
      data: {
        slug: equipement.slug,
        name: equipement.name,
        category: equipement.category,
        description: equipement.description,
        address: equipement.address,
        lat: equipement.lat,
        lng: equipement.lng,
        phone: equipement.phone || null,
        email: equipement.email || null,
        hours: equipement.hours || null,
        accessible: equipement.accessible,
        order: equipement.order,
        imageId,
      },
    });
  }

  /* ------------------------------- Démarches ----------------------------- */

  console.log("→ Fiches démarches…");
  for (const demarche of DEMARCHES) {
    await prisma.demarche.create({
      data: {
        slug: demarche.slug,
        title: demarche.title,
        category: demarche.category,
        summary: demarche.summary,
        content: demarche.content,
        onlineUrl: demarche.onlineUrl || null,
        onlineLabel: demarche.onlineLabel || null,
        internalPath: "internalPath" in demarche ? (demarche.internalPath as string) : null,
        requiredDocs: JSON.stringify(demarche.requiredDocs),
        processTime: demarche.processTime || null,
        cost: demarche.cost || null,
        audience: demarche.audience || null,
        icon: demarche.icon || null,
        featured: demarche.featured,
        order: demarche.order,
      },
    });
  }

  /* --------------------------------- Salles ------------------------------ */

  console.log("→ Salles et tarifs…");
  const roomIds = new Map<string, string>();
  for (const room of ROOMS) {
    const imageId = await media("salle", `salle-${room.slug}`, room.name, "salles");
    const created = await prisma.room.create({
      data: {
        slug: room.slug,
        name: room.name,
        subtitle: room.subtitle,
        description: room.description,
        capacitySeated: room.capacitySeated,
        capacityStanding: room.capacityStanding,
        surface: room.surface,
        address: room.address,
        equipments: JSON.stringify(room.equipments),
        rules: room.rules,
        bookingWindowDays: room.bookingWindowDays,
        minNoticeDays: room.minNoticeDays,
        order: room.order,
        imageId,
        active: true,
        slots: { create: room.slots.map((slot) => ({ ...slot })) },
        tariffs: { create: room.tariffs.map((tariff) => ({ ...tariff })) },
      },
    });
    roomIds.set(room.slug, created.id);
  }

  const salleDesFetes = roomIds.get("salle-des-fetes")!;
  const salleAssociations = roomIds.get("salle-des-associations")!;

  // Mise à disposition récurrente pour la restauration scolaire, et travaux.
  await prisma.roomClosure.createMany({
    data: [
      {
        roomId: salleDesFetes,
        startDate: daysFromNow(30),
        endDate: daysFromNow(34),
        reason: "Travaux d'entretien : reprise du sol et peinture",
      },
      {
        roomId: salleDesFetes,
        startDate: daysFromNow(62),
        endDate: daysFromNow(62),
        reason: "Cérémonie commémorative du 11 novembre",
      },
      {
        roomId: salleAssociations,
        startDate: daysFromNow(48),
        endDate: daysFromNow(49),
        reason: "Bureau de vote — préparation et scrutin",
      },
    ],
  });

  console.log("→ Demandes de réservation d'exemple…");
  const bookings = [
    {
      reference: "SDF-2026-0031",
      roomId: salleDesFetes,
      start: nextFriday(1),
      slotKey: "WEEKEND",
      audience: "ASSO_LOCALE",
      purpose: "Gala de danse de fin d'année",
      organizationName: "Danse Art Concept",
      applicantName: "Contact de l'association",
      applicantEmail: "contact@exemple-association.fr",
      applicantPhone: "04 00 00 00 00",
      attendees: 180,
      status: "CONFIRMEE",
      amountCents: 0,
      depositCents: 50000,
      days: 3,
    },
    {
      reference: "SDF-2026-0032",
      roomId: salleDesFetes,
      start: nextFriday(3),
      slotKey: "WEEKEND",
      audience: "HABITANT",
      purpose: "Repas de famille — anniversaire",
      organizationName: null,
      applicantName: "Demandeur d'exemple",
      applicantEmail: "habitant@exemple.fr",
      applicantPhone: "06 00 00 00 00",
      attendees: 60,
      status: "EN_ATTENTE",
      amountCents: 30000,
      depositCents: 50000,
      days: 3,
    },
    {
      reference: "SDF-2026-0033",
      roomId: salleAssociations,
      start: daysFromNow(9),
      slotKey: "DEMI_JOURNEE",
      audience: "ASSO_LOCALE",
      purpose: "Atelier numérique pour les aînés",
      organizationName: "Cap Générations",
      applicantName: "Contact de l'association",
      applicantEmail: "contact@exemple-association.fr",
      applicantPhone: "04 00 00 00 00",
      attendees: 12,
      status: "CONFIRMEE",
      amountCents: 0,
      depositCents: 0,
      days: 1,
    },
    {
      reference: "SDF-2026-0034",
      roomId: salleDesFetes,
      start: nextFriday(6),
      slotKey: "WEEKEND",
      audience: "ASSO_EXTERIEURE",
      purpose: "Assemblée générale et repas",
      organizationName: "Association extérieure d'exemple",
      applicantName: "Demandeur d'exemple",
      applicantEmail: "asso@exemple.fr",
      applicantPhone: "06 00 00 00 01",
      attendees: 120,
      status: "PREVALIDEE",
      amountCents: 60000,
      depositCents: 80000,
      days: 3,
    },
  ];

  for (const booking of bookings) {
    const endDate = new Date(booking.start);
    endDate.setDate(endDate.getDate() + booking.days - 1);
    await prisma.roomBooking.create({
      data: {
        reference: booking.reference,
        token: token(),
        roomId: booking.roomId,
        startDate: booking.start,
        endDate,
        slotKey: booking.slotKey,
        audience: booking.audience,
        purpose: booking.purpose,
        expectedAttendees: booking.attendees,
        organizationName: booking.organizationName,
        applicantName: booking.applicantName,
        applicantEmail: booking.applicantEmail,
        applicantPhone: booking.applicantPhone,
        applicantAddress: "Chessy-les-Mines",
        needsTables: true,
        needsChairs: true,
        needsKitchen: booking.attendees > 40,
        amountCents: booking.amountCents,
        depositCents: booking.depositCents,
        status: booking.status,
        decidedAt: booking.status === "EN_ATTENTE" ? null : daysFromNow(-3),
        decidedById: booking.status === "EN_ATTENTE" ? null : admin.id,
        decisionMessage:
          booking.status === "CONFIRMEE"
            ? "Réservation confirmée. Les clés sont à retirer à l'accueil le vendredi après-midi."
            : booking.status === "PREVALIDEE"
              ? "Créneau réservé en option dans l'attente de votre attestation d'assurance."
              : null,
      },
    });
  }

  /* ------------------------------- Matériel ------------------------------ */

  console.log("→ Matériel prêté et demandes d'exemple…");
  const itemIds = new Map<string, string>();
  for (const item of EQUIPMENT_ITEMS) {
    const imageId = await media("abstrait", `materiel-${item.slug}`, item.name, "materiel", 800, 600);
    const created = await prisma.equipmentItem.create({
      data: {
        slug: item.slug,
        name: item.name,
        category: item.category,
        description: item.description,
        unitLabel: item.unitLabel,
        quantityTotal: item.quantityTotal,
        depositCents: item.depositCents,
        feeCents: item.feeCents,
        requiresVehicle: item.requiresVehicle,
        reservedForAssociations: Boolean(item.reservedForAssociations),
        order: item.order,
        imageId,
        active: true,
      },
    });
    itemIds.set(item.slug, created.id);
  }

  const loans = [
    {
      reference: "MAT-2026-0018",
      applicantName: "Contact de l'association",
      applicantEmail: "contact@exemple-association.fr",
      applicantPhone: "04 00 00 00 00",
      organizationName: "Comité des fêtes",
      audience: "ASSO_LOCALE",
      purpose: "Soirée guinguette sur la place du village",
      eventDate: daysFromNow(12),
      pickupDate: daysFromNow(11),
      returnDate: daysFromNow(14),
      status: "CONFIRMEE",
      lines: [
        { slug: "table-rectangulaire", quantity: 12 },
        { slug: "chaise", quantity: 100 },
        { slug: "barnum-3x3", quantity: 3 },
        { slug: "sonorisation-mobile", quantity: 1 },
      ],
    },
    {
      reference: "MAT-2026-0019",
      applicantName: "Contact de l'association",
      applicantEmail: "sou@exemple-association.fr",
      applicantPhone: "04 00 00 00 02",
      organizationName: "Sou des écoles",
      audience: "ASSO_LOCALE",
      purpose: "Marché de Noël",
      eventDate: daysFromNow(72),
      pickupDate: daysFromNow(71),
      returnDate: daysFromNow(74),
      status: "EN_ATTENTE",
      lines: [
        { slug: "grille-exposition", quantity: 16 },
        { slug: "barnum-3x3", quantity: 4 },
        { slug: "percolateur", quantity: 2 },
        { slug: "barriere-vauban", quantity: 20 },
      ],
    },
    {
      reference: "MAT-2026-0020",
      applicantName: "Demandeur d'exemple",
      applicantEmail: "habitant@exemple.fr",
      applicantPhone: "06 00 00 00 03",
      organizationName: null,
      audience: "HABITANT",
      purpose: "Repas de famille dans le jardin",
      eventDate: daysFromNow(-5),
      pickupDate: daysFromNow(-6),
      returnDate: daysFromNow(-3),
      status: "RETOURNEE",
      lines: [
        { slug: "table-rectangulaire", quantity: 3 },
        { slug: "chaise", quantity: 24 },
      ],
    },
  ];

  for (const loan of loans) {
    const depositCents = loan.lines.reduce((total, line) => {
      const item = EQUIPMENT_ITEMS.find((entry) => entry.slug === line.slug);
      return total + (item?.depositCents ?? 0);
    }, 0);

    await prisma.equipmentLoan.create({
      data: {
        reference: loan.reference,
        token: token(),
        applicantName: loan.applicantName,
        applicantEmail: loan.applicantEmail,
        applicantPhone: loan.applicantPhone,
        applicantAddress: "Chessy-les-Mines",
        organizationName: loan.organizationName,
        audience: loan.audience,
        purpose: loan.purpose,
        eventDate: loan.eventDate,
        pickupDate: loan.pickupDate,
        returnDate: loan.returnDate,
        status: loan.status,
        depositCents,
        decidedAt: loan.status === "EN_ATTENTE" ? null : daysFromNow(-2),
        decidedById: loan.status === "EN_ATTENTE" ? null : admin.id,
        decisionMessage:
          loan.status === "EN_ATTENTE"
            ? null
            : "Prêt accordé. Retrait à l'atelier des services techniques aux horaires indiqués.",
        lines: {
          create: loan.lines.map((line) => ({
            itemId: itemIds.get(line.slug)!,
            quantity: line.quantity,
          })),
        },
      },
    });
  }

  /* -------------------------------- Demandes ----------------------------- */

  console.log("→ Demandes des habitants d'exemple…");
  const requests = [
    {
      reference: "SIG-2026-0117",
      type: "SIGNALEMENT",
      category: "ECLAIRAGE",
      subject: "Lampadaire éteint route des Mines",
      message:
        "Le lampadaire situé juste avant le virage est éteint depuis plusieurs soirs. La visibilité est mauvaise pour les piétons qui remontent vers le bourg.",
      name: "Habitant d'exemple",
      email: "habitant@exemple.fr",
      status: "EN_COURS",
      priority: "HAUTE",
      lat: 45.8849,
      lng: 4.6231,
      locationLabel: "Route des Mines, avant le virage",
      daysAgo: 2,
      assigned: true,
      messages: [
        {
          author: "MAIRIE",
          body: "Merci pour votre signalement. Le point a été relevé et transmis à l'entreprise en charge de la maintenance de l'éclairage public. Intervention prévue cette semaine.",
        },
      ],
    },
    {
      reference: "SIG-2026-0118",
      type: "SIGNALEMENT",
      category: "PROPRETE",
      subject: "Dépôt sauvage près du point de collecte",
      message:
        "Plusieurs sacs et un vieux matelas ont été déposés à côté des colonnes à verre. Cela s'accumule depuis le week-end.",
      name: "Habitant d'exemple",
      email: "habitant2@exemple.fr",
      status: "TRAITE",
      priority: "NORMALE",
      lat: 45.8842,
      lng: 4.6196,
      locationLabel: "Colonnes à verre, place du village",
      daysAgo: 7,
      assigned: true,
      messages: [
        {
          author: "MAIRIE",
          body: "Le dépôt a été enlevé par les services techniques. Un rappel réglementaire va être affiché sur le point de collecte.",
        },
      ],
    },
    {
      reference: "SIG-2026-0119",
      type: "SIGNALEMENT",
      category: "VOIRIE",
      subject: "Nid-de-poule chemin des Vignes",
      message:
        "Un trou assez profond s'est formé au milieu de la chaussée. Il est dangereux pour les deux-roues.",
      name: "Habitant d'exemple",
      email: "habitant3@exemple.fr",
      status: "NOUVEAU",
      priority: "NORMALE",
      lat: 45.8861,
      lng: 4.6172,
      locationLabel: "Chemin des Vignes",
      daysAgo: 1,
      assigned: false,
      messages: [],
    },
    {
      reference: "CTC-2026-0204",
      type: "CONTACT",
      category: null,
      subject: "Question sur l'inscription au restaurant scolaire",
      message:
        "Bonjour, nous venons d'arriver sur la commune et je souhaiterais savoir comment inscrire mes deux enfants à la cantine pour la période à venir. Merci par avance.",
      name: "Nouvelle habitante d'exemple",
      email: "famille@exemple.fr",
      status: "TRAITE",
      priority: "NORMALE",
      lat: null,
      lng: null,
      locationLabel: null,
      daysAgo: 4,
      assigned: true,
      messages: [
        {
          author: "MAIRIE",
          body: "Bonjour et bienvenue à Chessy-les-Mines. L'inscription au restaurant scolaire se fait sur le portail famille ; nous vous transmettons les identifiants par courriel séparé. La fiche démarche détaille la procédure complète.",
        },
      ],
    },
    {
      reference: "SUG-2026-0026",
      type: "SUGGESTION",
      category: null,
      subject: "Créer un jardin partagé derrière la salle des fêtes",
      message:
        "Il y a un terrain peu utilisé derrière la salle des fêtes. Plusieurs habitants seraient volontaires pour y créer un jardin partagé avec quelques parcelles et un composteur collectif.",
      name: "Habitant d'exemple",
      email: "idee@exemple.fr",
      status: "EN_COURS",
      priority: "BASSE",
      lat: null,
      lng: null,
      locationLabel: null,
      daysAgo: 12,
      assigned: true,
      messages: [
        {
          author: "MAIRIE",
          body: "Merci pour cette proposition. Elle sera examinée par la commission cadre de vie lors de sa prochaine réunion, avec une visite du terrain envisagée.",
        },
      ],
    },
    {
      reference: "RDV-2026-0041",
      type: "RENDEZ_VOUS",
      category: null,
      subject: "Rendez-vous urbanisme — projet d'extension",
      message:
        "Je souhaite un rendez-vous avec le service urbanisme pour un projet d'extension d'environ 30 m² à l'arrière de la maison, afin de savoir quel dossier déposer.",
      name: "Demandeur d'exemple",
      email: "projet@exemple.fr",
      status: "NOUVEAU",
      priority: "NORMALE",
      lat: null,
      lng: null,
      locationLabel: null,
      daysAgo: 1,
      assigned: false,
      messages: [],
    },
  ];

  for (const request of requests) {
    const photoId =
      request.type === "SIGNALEMENT"
        ? await media("abstrait", `signalement-${request.reference}`, request.subject, "signalements", 1200, 900)
        : null;

    const created = await prisma.request.create({
      data: {
        reference: request.reference,
        token: token(),
        type: request.type,
        category: request.category,
        subject: request.subject,
        message: request.message,
        name: request.name,
        email: request.email,
        phone: "06 00 00 00 00",
        address: "Chessy-les-Mines",
        lat: request.lat,
        lng: request.lng,
        locationLabel: request.locationLabel,
        photoId,
        status: request.status,
        priority: request.priority,
        assignedToId: request.assigned ? agent.id : null,
        resolvedAt: request.status === "TRAITE" ? daysFromNow(-1) : null,
        createdAt: daysFromNow(-request.daysAgo, 10),
      },
    });

    for (const message of request.messages) {
      await prisma.requestMessage.create({
        data: {
          requestId: created.id,
          author: message.author,
          authorName: message.author === "MAIRIE" ? "Accueil de la mairie" : request.name,
          body: message.body,
        },
      });
    }
  }

  /* -------------------------------- Alertes ------------------------------ */

  console.log("→ Alertes…");
  for (const alert of buildAlerts()) {
    await prisma.alert.create({ data: alert });
  }

  /* --------------------------------- Pages ------------------------------- */

  console.log("→ Pages et blocs…");
  const pageIds = new Map<string, string>();

  // Premier passage : création des pages sans le parent (résolu ensuite).
  for (const page of SEED_PAGES) {
    const coverId = page.cover
      ? await media(
          page.cover.includes("scene=mine")
            ? "mine"
            : page.cover.includes("scene=village")
              ? "village"
              : page.cover.includes("scene=paysage")
                ? "paysage"
                : page.cover.includes("scene=salle")
                  ? "salle"
                  : "abstrait",
          `page-${page.slug}`,
          page.title,
          "pages",
        )
      : null;

    const created = await prisma.page.create({
      data: {
        slug: page.slug,
        title: page.title,
        navLabel: page.navLabel ?? null,
        excerpt: page.excerpt ?? null,
        template: page.template ?? "STANDARD",
        status: "PUBLIEE",
        order: page.order ?? 0,
        showInNav: page.showInNav ?? true,
        icon: page.icon ?? null,
        coverId,
        seoDescription: page.seoDescription ?? page.excerpt ?? null,
        publishedAt: new Date(),
        updatedById: editeur.id,
        blocks: {
          create: page.blocks.map((block, index) => ({
            type: block.type,
            order: index,
            data: JSON.stringify(block.data),
          })),
        },
      },
    });
    pageIds.set(page.slug, created.id);
  }

  // Second passage : rattachement des pages filles.
  for (const page of SEED_PAGES) {
    if (!page.parent) continue;
    const parentId = pageIds.get(page.parent);
    if (!parentId) continue;
    await prisma.page.update({
      where: { id: pageIds.get(page.slug)! },
      data: { parentId },
    });
  }

  /* --------------------------------- Menus ------------------------------- */

  console.log("→ Menus…");
  for (const menu of SEED_MENUS) {
    const created = await prisma.menu.create({ data: { key: menu.key, label: menu.label } });

    const createItems = async (items: SeedMenuItem[], parentId: string | null) => {
      for (const [index, item] of items.entries()) {
        const pageId = item.href?.startsWith("/")
          ? pageIds.get(item.href.replace(/^\//, "")) ?? null
          : null;
        const createdItem = await prisma.menuItem.create({
          data: {
            menuId: created.id,
            parentId,
            label: item.label,
            href: item.href ?? null,
            pageId,
            description: item.description ?? null,
            icon: item.icon ?? null,
            highlight: Boolean(item.highlight),
            order: index,
          },
        });
        if (item.children?.length) {
          await createItems(item.children, createdItem.id);
        }
      }
    };

    await createItems(menu.items, null);
  }

  /* ------------------------------ Newsletter ----------------------------- */

  await prisma.newsletterSubscriber.createMany({
    data: [
      { email: "abonne1@exemple.fr", name: "Abonné d'exemple", token: token(), confirmed: true, confirmedAt: new Date() },
      { email: "abonne2@exemple.fr", name: "Abonnée d'exemple", token: token(), confirmed: true, confirmedAt: new Date() },
      { email: "abonne3@exemple.fr", token: token(), confirmed: false },
    ],
  });

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: "CREATE",
      entity: "Site",
      label: "Installation du contenu initial",
      detail: `${SEED_PAGES.length} pages, ${ASSOCIATIONS.length} associations, ${DEMARCHES.length} fiches démarches`,
    },
  });

  const counts = {
    pages: await prisma.page.count(),
    blocs: await prisma.block.count(),
    actualites: await prisma.newsPost.count(),
    evenements: await prisma.event.count(),
    associations: await prisma.association.count(),
    demarches: await prisma.demarche.count(),
    documents: await prisma.document.count(),
    medias: await prisma.media.count(),
  };

  console.log("\n✓ Installation terminée");
  console.table(counts);
  console.log("\nComptes du back-office (mot de passe : chessy2026)");
  console.table([
    { role: "Administrateur", email: admin.email },
    { role: "Éditeur", email: editeur.email },
    { role: "Agent d'accueil", email: agent.email },
  ]);
  console.log("\n→ Site : http://localhost:3000");
  console.log("→ Back-office : http://localhost:3000/admin\n");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
