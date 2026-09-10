import Link from "next/link";

import { AdminEmpty, AdminHeader, Cell, DataTable, FilterBar, FilterLink, HelpNote, Panel, Pill } from "@/components/admin/ui";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { prisma } from "@/lib/db";
import { AUDIENCE_LABELS, LOAN_STATUSES, LOAN_STATUS_LABELS, type Audience, type LoanStatus } from "@/lib/enums";
import { formatDate, formatPrice, formatRelative } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Prêts de matériel" };

const TONES: Record<LoanStatus, "attente" | "encours" | "publie" | "refus"> = {
  EN_ATTENTE: "attente",
  CONFIRMEE: "publie",
  SORTIE: "encours",
  RETOURNEE: "publie",
  REFUSEE: "refus",
  ANNULEE: "refus",
};

type Props = { searchParams: Promise<{ statut?: string }> };

export default async function AdminPretsPage({ searchParams }: Props) {
  const { statut } = await searchParams;
  const filtered = LOAN_STATUSES.includes(statut as LoanStatus);

  const [loans, counts] = await Promise.all([
    prisma.equipmentLoan.findMany({
      where: filtered ? { status: statut } : undefined,
      orderBy: { pickupDate: "asc" },
      select: {
        id: true,
        reference: true,
        status: true,
        pickupDate: true,
        returnDate: true,
        audience: true,
        purpose: true,
        applicantName: true,
        organizationName: true,
        depositCents: true,
        transport: true,
        createdAt: true,
        lines: { select: { quantity: true, item: { select: { name: true } } } },
      },
    }),
    prisma.equipmentLoan.groupBy({ by: ["status"], _count: true }),
  ]);

  const countOf = (status: string) => counts.find((entry) => entry.status === status)?._count ?? 0;
  const total = counts.reduce((sum, entry) => sum + entry._count, 0);

  return (
    <>
      <AdminHeader
        title="Prêts de matériel"
        description="Suivez les demandes de prêt, du dépôt à la restitution du matériel."
        breadcrumb={[{ label: "Prêts de matériel" }]}
        actions={
          <ButtonLink href="/admin/ressources" variant="contour" size="sm" icon="Warehouse">
            Inventaire du matériel
          </ButtonLink>
        }
      />

      <HelpNote title="Le cycle d'un prêt" icon="PackageCheck">
        <strong>En attente</strong> → <strong>accordé</strong> (l'usager est prévenu) →{" "}
        <strong>matériel retiré</strong> le jour du départ → <strong>restitué</strong> au retour.
        Marquer les deux dernières étapes garde l'inventaire juste : le matériel sorti n'est pas
        proposé à un autre demandeur.
      </HelpNote>

      <FilterBar>
        <FilterLink href="/admin/reservations/materiel" active={!filtered} count={total}>
          Tous
        </FilterLink>
        {LOAN_STATUSES.map((status) => (
          <FilterLink
            key={status}
            href={`/admin/reservations/materiel?statut=${status}`}
            active={statut === status}
            count={countOf(status)}
          >
            {LOAN_STATUS_LABELS[status]}
          </FilterLink>
        ))}
      </FilterBar>

      <Panel>
        {loans.length === 0 ? (
          <AdminEmpty icon="Package" title="Aucun prêt" description="Les demandes déposées en ligne apparaîtront ici." />
        ) : (
          <DataTable
            caption="Liste des prêts de matériel"
            columns={[
              { label: "Référence" },
              { label: "Demandeur et usage" },
              { label: "Période" },
              { label: "Matériel" },
              { label: "Caution", className: "text-right" },
              { label: "État" },
              { label: "Actions", sr: true },
            ]}
          >
            {loans.map((loan) => (
              <tr key={loan.id} className="transition-colors hover:bg-[color:var(--surface-alt)]">
                <Cell>
                  <span className="font-mono text-xs font-semibold">{loan.reference}</span>
                  <span className="mt-0.5 block text-xs text-[color:var(--texte-doux)]">
                    {formatRelative(loan.createdAt)}
                  </span>
                </Cell>
                <Cell header>
                  <Link
                    href={`/admin/reservations/materiel/${loan.id}`}
                    className="font-semibold hover:text-azur-600 dark:hover:text-azur-200"
                  >
                    {loan.organizationName || loan.applicantName}
                  </Link>
                  <span className="mt-0.5 block text-xs text-[color:var(--texte-doux)]">
                    {loan.purpose} · {AUDIENCE_LABELS[loan.audience as Audience] ?? loan.audience}
                  </span>
                </Cell>
                <Cell className="text-xs whitespace-nowrap">
                  <span className="block">retrait {formatDate(loan.pickupDate, "d MMM")}</span>
                  <span className="block text-[color:var(--texte-doux)]">
                    retour {formatDate(loan.returnDate, "d MMM yyyy")}
                  </span>
                  {loan.transport === "LIVRAISON_DEMANDEE" ? (
                    <Pill tone="attente" icon="Truck">
                      Livraison
                    </Pill>
                  ) : null}
                </Cell>
                <Cell className="text-xs text-[color:var(--texte-doux)]">
                  {loan.lines
                    .slice(0, 2)
                    .map((line) => `${line.quantity} × ${line.item.name}`)
                    .join(", ")}
                  {loan.lines.length > 2 ? ` +${loan.lines.length - 2}` : ""}
                </Cell>
                <Cell className="text-right text-xs font-semibold tabular-nums">
                  {formatPrice(loan.depositCents, { free: "—" })}
                </Cell>
                <Cell>
                  <Pill tone={TONES[loan.status as LoanStatus] ?? "neutre"}>
                    {LOAN_STATUS_LABELS[loan.status as LoanStatus]}
                  </Pill>
                </Cell>
                <Cell className="text-right">
                  <Link
                    href={`/admin/reservations/materiel/${loan.id}`}
                    className="inline-flex items-center gap-1 rounded-field border border-[color:var(--bordure)] px-2.5 py-1.5 text-xs font-semibold transition-colors hover:bg-[color:var(--surface)]"
                  >
                    Instruire
                    <Icon name="ArrowRight" className="size-3.5" />
                  </Link>
                </Cell>
              </tr>
            ))}
          </DataTable>
        )}
      </Panel>
    </>
  );
}
