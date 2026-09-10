import { notFound } from "next/navigation";

import { deciderPret } from "@/app/admin/actions-demandes";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { AdminHeader, HelpNote, Panel, Pill } from "@/components/admin/ui";
import { Field, Select, Textarea } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { prisma } from "@/lib/db";
import {
  AUDIENCE_LABELS,
  LOAN_STATUSES,
  LOAN_STATUS_LABELS,
  type Audience,
  type LoanStatus,
} from "@/lib/enums";
import { getEquipmentUsage } from "@/lib/booking";
import { formatDate, formatDateTime, formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const loan = await prisma.equipmentLoan.findUnique({ where: { id }, select: { reference: true } });
  return { title: loan ? `Prêt ${loan.reference}` : "Prêt introuvable" };
}

export default async function InstructionPretPage({ params }: Props) {
  const { id } = await params;

  const loan = await prisma.equipmentLoan.findUnique({
    where: { id },
    include: {
      lines: { include: { item: true } },
      decidedBy: { select: { name: true } },
    },
  });

  if (!loan) notFound();

  // Disponibilité restante hors cette demande : permet de vérifier qu'accorder
  // le prêt ne met pas le stock en négatif.
  const usage = await getEquipmentUsage(loan.pickupDate, loan.returnDate, loan.id);
  const status = loan.status as LoanStatus;

  return (
    <>
      <AdminHeader
        title={loan.organizationName || loan.applicantName}
        description={`Demande ${loan.reference} déposée le ${formatDateTime(loan.createdAt)}`}
        breadcrumb={[
          { label: "Prêts de matériel", href: "/admin/reservations/materiel" },
          { label: loan.reference },
        ]}
        actions={
          <Pill
            tone={
              status === "EN_ATTENTE"
                ? "attente"
                : status === "REFUSEE" || status === "ANNULEE"
                  ? "refus"
                  : status === "SORTIE"
                    ? "encours"
                    : "publie"
            }
          >
            {LOAN_STATUS_LABELS[status]}
          </Pill>
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Panel title="Matériel demandé">
            <table className="w-full text-sm">
              <caption className="sr-only">Matériel demandé et disponibilité</caption>
              <thead>
                <tr className="border-b border-[color:var(--bordure)] bg-[color:var(--surface-alt)]">
                  <th scope="col" className="px-4 py-2.5 text-left text-xs font-bold uppercase text-[color:var(--texte-doux)]">
                    Matériel
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-right text-xs font-bold uppercase text-[color:var(--texte-doux)]">
                    Demandé
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-right text-xs font-bold uppercase text-[color:var(--texte-doux)]">
                    Stock
                  </th>
                  <th scope="col" className="px-4 py-2.5 text-right text-xs font-bold uppercase text-[color:var(--texte-doux)]">
                    Reste disponible
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--bordure)]">
                {loan.lines.map((line) => {
                  const engaged = usage[line.itemId] ?? 0;
                  const remaining = line.item.quantityTotal - engaged;
                  const enough = remaining >= line.quantity;
                  return (
                    <tr key={line.id}>
                      <th scope="row" className="px-4 py-3 text-left font-medium">
                        {line.item.name}
                        {line.item.requiresVehicle ? (
                          <span className="mt-0.5 flex items-center gap-1 text-xs font-normal text-[color:var(--texte-doux)]">
                            <Icon name="Truck" className="size-3" />
                            transport par véhicule
                          </span>
                        ) : null}
                      </th>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums">{line.quantity}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-[color:var(--texte-doux)]">
                        {line.item.quantityTotal}
                      </td>
                      <td
                        className={
                          enough
                            ? "px-4 py-3 text-right font-semibold tabular-nums text-emerald-700 dark:text-emerald-300"
                            : "px-4 py-3 text-right font-semibold tabular-nums text-red-700 dark:text-red-300"
                        }
                      >
                        {remaining}
                        {!enough ? (
                          <span className="mt-0.5 block text-xs font-normal">insuffisant</span>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="border-t border-[color:var(--bordure)] bg-[color:var(--surface-alt)] px-4 py-3 text-sm">
              <p className="flex justify-between gap-3">
                <span className="text-[color:var(--texte-doux)]">Caution totale</span>
                <span className="font-semibold tabular-nums">
                  {formatPrice(loan.depositCents, { free: "aucune" })}
                </span>
              </p>
            </div>
          </Panel>

          <Panel title="La demande">
            <dl className="divide-y divide-[color:var(--bordure)] text-sm">
              {[
                { label: "Usage prévu", value: loan.purpose },
                {
                  label: "Date de la manifestation",
                  value: loan.eventDate ? formatDate(loan.eventDate) : "identique à la période",
                },
                { label: "Retrait", value: formatDate(loan.pickupDate) },
                { label: "Restitution", value: formatDate(loan.returnDate) },
                {
                  label: "Transport",
                  value:
                    loan.transport === "RETRAIT"
                      ? "Retrait par le demandeur"
                      : "Livraison demandée (à arbitrer)",
                },
                {
                  label: "Situation déclarée",
                  value: AUDIENCE_LABELS[loan.audience as Audience] ?? loan.audience,
                },
                { label: "Structure", value: loan.organizationName ?? "—" },
                { label: "Responsable", value: loan.applicantName },
                {
                  label: "Contact",
                  value: (
                    <>
                      <a
                        href={`mailto:${loan.applicantEmail}`}
                        className="text-azur-600 hover:underline dark:text-azur-200"
                      >
                        {loan.applicantEmail}
                      </a>
                      {" — "}
                      <a
                        href={`tel:${loan.applicantPhone.replace(/\s/g, "")}`}
                        className="text-azur-600 hover:underline dark:text-azur-200"
                      >
                        {loan.applicantPhone}
                      </a>
                    </>
                  ),
                },
                { label: "Adresse", value: loan.applicantAddress ?? "—" },
              ].map((row) => (
                <div key={row.label} className="grid gap-1 px-4 py-3 sm:grid-cols-3 sm:px-5">
                  <dt className="text-[color:var(--texte-doux)]">{row.label}</dt>
                  <dd className="font-medium sm:col-span-2">{row.value}</dd>
                </div>
              ))}
            </dl>
          </Panel>

          {loan.decidedAt ? (
            <Panel title="Suivi">
              <div className="space-y-2 p-4 text-sm sm:p-5">
                <p>
                  <strong>{LOAN_STATUS_LABELS[status]}</strong> le {formatDateTime(loan.decidedAt)}
                  {loan.decidedBy ? ` par ${loan.decidedBy.name}` : ""}.
                </p>
                {loan.decisionMessage ? (
                  <p className="rounded-field bg-[color:var(--surface-alt)] p-3 leading-relaxed">
                    {loan.decisionMessage}
                  </p>
                ) : null}
                {loan.adminNote ? (
                  <p className="rounded-field border border-dashed border-[color:var(--bordure)] p-3 leading-relaxed">
                    <span className="mb-1 block text-xs font-bold uppercase text-[color:var(--texte-doux)]">
                      Note interne
                    </span>
                    {loan.adminNote}
                  </p>
                ) : null}
              </div>
            </Panel>
          ) : null}
        </div>

        <div className="space-y-5">
          <Panel title="Instruire la demande">
            <form action={deciderPret} className="space-y-4 p-4 sm:p-5">
              <input type="hidden" name="id" value={loan.id} />

              <Field label="État du prêt" htmlFor="statut" required>
                <Select id="statut" name="statut" defaultValue={loan.status}>
                  {LOAN_STATUSES.map((entry) => (
                    <option key={entry} value={entry}>
                      {LOAN_STATUS_LABELS[entry]}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field
                label="Message au demandeur"
                htmlFor="message"
                hint="Transmis par courriel pour un accord, un refus ou une annulation."
              >
                <Textarea
                  id="message"
                  name="message"
                  rows={5}
                  defaultValue={loan.decisionMessage ?? ""}
                  maxLength={2000}
                />
              </Field>

              <Field label="Note interne" htmlFor="note">
                <Textarea id="note" name="note" rows={3} defaultValue={loan.adminNote ?? ""} maxLength={2000} />
              </Field>

              <div className="border-t border-[color:var(--bordure)] pt-4">
                <SubmitButton fullWidth icon="CheckCheck">
                  Enregistrer
                </SubmitButton>
              </div>
            </form>
          </Panel>

          <HelpNote title="Au retrait et au retour" icon="ClipboardList">
            Vérifiez l'attestation d'assurance, comptez le matériel devant le demandeur, et notez
            tout défaut constaté dans la note interne. Passez le prêt en « matériel retiré » puis en
            « restitué » : c'est ce qui garde le stock affiché aux habitants exact.
          </HelpNote>
        </div>
      </div>
    </>
  );
}
