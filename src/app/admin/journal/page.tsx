import { AdminEmpty, AdminHeader, Cell, DataTable, FilterBar, FilterLink, HelpNote, Panel, Pill } from "@/components/admin/ui";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Journal des actions" };

const ACTION_LABELS: Record<string, string> = {
  CREATE: "Création",
  UPDATE: "Modification",
  DELETE: "Suppression",
  PUBLISH: "Publication",
  LOGIN: "Connexion",
  DECISION: "Décision",
};

const ACTION_TONES: Record<string, "publie" | "encours" | "refus" | "neutre" | "attente"> = {
  CREATE: "publie",
  UPDATE: "encours",
  DELETE: "refus",
  PUBLISH: "publie",
  LOGIN: "neutre",
  DECISION: "attente",
};

const ENTITY_LABELS: Record<string, string> = {
  Page: "Page",
  NewsPost: "Actualité",
  Event: "Évènement",
  Document: "Document",
  Alert: "Bandeau d'alerte",
  Association: "Association",
  Elu: "Élu",
  Equipement: "Équipement",
  Demarche: "Fiche démarche",
  Media: "Média",
  MenuItem: "Entrée de menu",
  Room: "Salle",
  RoomTariff: "Tarif de salle",
  RoomClosure: "Fermeture de salle",
  RoomBooking: "Réservation de salle",
  EquipmentItem: "Matériel",
  EquipmentLoan: "Prêt de matériel",
  Request: "Demande",
  User: "Compte utilisateur",
  SiteSetting: "Paramètres",
  Site: "Site",
};

type Props = { searchParams: Promise<{ action?: string; page?: string }> };

const PER_PAGE = 60;

export default async function AdminJournalPage({ searchParams }: Props) {
  await requireRole(["ADMIN"], "/admin/journal");

  const { action, page: pageParam } = await searchParams;
  const currentPage = Math.max(Number(pageParam) || 1, 1);

  const where = action && ACTION_LABELS[action] ? { action } : undefined;

  const [entries, total, counts] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (currentPage - 1) * PER_PAGE,
      take: PER_PAGE,
      select: {
        id: true,
        action: true,
        entity: true,
        entityId: true,
        label: true,
        detail: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.auditLog.count({ where }),
    prisma.auditLog.groupBy({ by: ["action"], _count: true }),
  ]);

  const countOf = (value: string) => counts.find((entry) => entry.action === value)?._count ?? 0;
  const grandTotal = counts.reduce((sum, entry) => sum + entry._count, 0);
  const totalPages = Math.max(Math.ceil(total / PER_PAGE), 1);

  return (
    <>
      <AdminHeader
        title="Journal des actions"
        description="Trace horodatée de toutes les opérations effectuées dans le back-office : qui a fait quoi, et quand."
        breadcrumb={[{ label: "Journal des actions" }]}
      />

      <HelpNote title="À quoi sert ce journal" icon="History">
        Il permet de retrouver l'auteur d'une modification, de comprendre pourquoi un contenu a
        changé, et de constituer une preuve en cas de contestation. Il ne contient aucune donnée
        personnelle d'usager : uniquement l'identité des agents et l'objet de leurs actions.
      </HelpNote>

      <FilterBar>
        <FilterLink href="/admin/journal" active={!action} count={grandTotal}>
          Toutes
        </FilterLink>
        {Object.keys(ACTION_LABELS)
          .filter((value) => countOf(value) > 0)
          .map((value) => (
            <FilterLink
              key={value}
              href={`/admin/journal?action=${value}`}
              active={action === value}
              count={countOf(value)}
            >
              {ACTION_LABELS[value]}
            </FilterLink>
          ))}
      </FilterBar>

      <Panel title={`${total} entrée${total > 1 ? "s" : ""}`}>
        {entries.length === 0 ? (
          <AdminEmpty icon="History" title="Journal vide" />
        ) : (
          <DataTable
            caption="Journal des actions du back-office"
            columns={[
              { label: "Date et heure" },
              { label: "Auteur" },
              { label: "Action" },
              { label: "Objet" },
              { label: "Détail" },
            ]}
          >
            {entries.map((entry) => (
              <tr key={entry.id} className="transition-colors hover:bg-[color:var(--surface-alt)]">
                <Cell className="text-xs whitespace-nowrap tabular-nums text-[color:var(--texte-doux)]">
                  {formatDateTime(entry.createdAt)}
                </Cell>
                <Cell className="text-xs">
                  {entry.user ? (
                    <>
                      <span className="block font-medium">{entry.user.name}</span>
                      <span className="block text-[color:var(--texte-doux)]">{entry.user.email}</span>
                    </>
                  ) : (
                    <span className="text-[color:var(--texte-doux)]">système</span>
                  )}
                </Cell>
                <Cell>
                  <Pill tone={ACTION_TONES[entry.action] ?? "neutre"}>
                    {ACTION_LABELS[entry.action] ?? entry.action}
                  </Pill>
                </Cell>
                <Cell className="text-xs">
                  <span className="block font-medium">
                    {ENTITY_LABELS[entry.entity] ?? entry.entity}
                  </span>
                  {entry.label ? (
                    <span className="block text-[color:var(--texte-doux)]">{entry.label}</span>
                  ) : null}
                </Cell>
                <Cell className="text-xs text-[color:var(--texte-doux)]">{entry.detail ?? "—"}</Cell>
              </tr>
            ))}
          </DataTable>
        )}
      </Panel>

      {totalPages > 1 ? (
        <nav aria-label="Pagination du journal" className="mt-5 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, index) => index + 1)
            .filter(
              (number) =>
                number === 1 ||
                number === totalPages ||
                Math.abs(number - currentPage) <= 2,
            )
            .map((number) => (
              <a
                key={number}
                href={`/admin/journal?${new URLSearchParams({ ...(action ? { action } : {}), page: String(number) })}`}
                aria-current={number === currentPage ? "page" : undefined}
                className={
                  number === currentPage
                    ? "flex size-9 items-center justify-center rounded-field bg-azur-600 text-sm font-semibold text-white tabular-nums"
                    : "flex size-9 items-center justify-center rounded-field border border-[color:var(--bordure)] bg-[color:var(--surface)] text-sm font-semibold tabular-nums transition-colors hover:bg-[color:var(--surface-alt)]"
                }
              >
                {number}
              </a>
            ))}
        </nav>
      ) : null}
    </>
  );
}
