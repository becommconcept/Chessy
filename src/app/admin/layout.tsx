import type { Metadata } from "next";

import { AdminSidebar, type AdminNavGroup } from "@/components/admin/AdminSidebar";
import { ComfortMenu } from "@/components/site/ComfortMenu";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { can } from "@/lib/auth";
import type { Role } from "@/lib/enums";

export const metadata: Metadata = {
  title: { default: "Espace mairie", template: "%s — Espace mairie" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("/admin");

  /* Compteurs de demandes en attente, affichés dans la navigation. */
  const [bookings, loans, requests] = await Promise.all([
    prisma.roomBooking.count({ where: { status: "EN_ATTENTE" } }),
    prisma.equipmentLoan.count({ where: { status: "EN_ATTENTE" } }),
    prisma.request.count({ where: { status: "NOUVEAU" } }),
  ]);

  const groups: AdminNavGroup[] = [
    {
      title: "Pilotage",
      items: [{ label: "Tableau de bord", href: "/admin", icon: "LayoutDashboard", exact: true }],
    },
    {
      title: "Demandes des habitants",
      items: [
        { label: "Réservations de salle", href: "/admin/reservations/salles", icon: "PartyPopper", badge: bookings },
        { label: "Prêts de matériel", href: "/admin/reservations/materiel", icon: "Package", badge: loans },
        { label: "Messages et signalements", href: "/admin/demandes", icon: "Inbox", badge: requests },
      ],
    },
  ];

  if (can.editContent(user.role as Role)) {
    groups.push(
      {
        title: "Contenus",
        items: [
          { label: "Pages du site", href: "/admin/pages", icon: "LayoutTemplate" },
          { label: "Actualités", href: "/admin/actualites", icon: "Newspaper" },
          { label: "Agenda", href: "/admin/agenda", icon: "CalendarDays" },
          { label: "Médiathèque", href: "/admin/medias", icon: "Image" },
          { label: "Documents", href: "/admin/documents", icon: "FolderOpen" },
          { label: "Bandeaux d'alerte", href: "/admin/alertes", icon: "BellRing" },
        ],
      },
      {
        title: "Annuaires",
        items: [
          { label: "Associations", href: "/admin/associations", icon: "HeartHandshake" },
          { label: "Élus", href: "/admin/elus", icon: "UserSquare2" },
          { label: "Équipements", href: "/admin/equipements", icon: "MapPin" },
          { label: "Fiches démarches", href: "/admin/demarches", icon: "ClipboardList" },
        ],
      },
      {
        title: "Configuration",
        items: [
          { label: "Menus de navigation", href: "/admin/menus", icon: "ListFilter" },
          { label: "Salles et matériel", href: "/admin/ressources", icon: "Warehouse" },
        ],
      },
    );
  }

  if (can.manageSettings(user.role as Role)) {
    groups.push({
      title: "Administration",
      items: [
        { label: "Paramètres du site", href: "/admin/parametres", icon: "Settings" },
        { label: "Comptes utilisateurs", href: "/admin/utilisateurs", icon: "Users" },
        { label: "Journal des actions", href: "/admin/journal", icon: "History" },
      ],
    });
  }

  return (
    <div className="flex min-h-dvh bg-[color:var(--surface-alt)]">
      <AdminSidebar groups={groups} user={{ ...user, role: user.role as Role }} />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Barre supérieure (grand écran) */}
        <div className="sticky top-0 z-30 hidden items-center justify-end gap-2 border-b border-[color:var(--bordure)] bg-[color:var(--surface)]/92 px-6 py-2.5 backdrop-blur-xl lg:flex">
          <ComfortMenu compact />
        </div>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
