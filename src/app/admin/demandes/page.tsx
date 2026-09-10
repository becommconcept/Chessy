import Link from "next/link";

import { AdminEmpty, AdminHeader, FilterBar, FilterLink, Panel, Pill } from "@/components/admin/ui";
import { Icon } from "@/components/ui/Icon";
import { Notice } from "@/components/ui/Field";
import { prisma } from "@/lib/db";
import {
  REQUEST_STATUSES,
  REQUEST_STATUS_LABELS,
  REQUEST_TYPES,
  REQUEST_TYPE_LABELS,
  SIGNALEMENT_CATEGORY_LABELS,
  labelOf,
  type RequestStatus,
  type RequestType,
} from "@/lib/enums";
import { formatRelative, truncate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Messages et signalements" };

const TYPE_ICONS: Record<RequestType, string> = {
  CONTACT: "Mail",
  SIGNALEMENT: "TriangleAlert",
  SUGGESTION: "Lightbulb",
  RENDEZ_VOUS: "CalendarClock",
};

type Props = { searchParams: Promise<{ statut?: string; type?: string; supprimee?: string }> };

export default async function AdminDemandesPage({ searchParams }: Props) {
  const { statut, type, supprimee } = await searchParams;

  const where = {
    ...(REQUEST_STATUSES.includes(statut as RequestStatus) ? { status: statut } : {}),
    ...(REQUEST_TYPES.includes(type as RequestType) ? { type } : {}),
  };

  const [requests, statusCounts, typeCounts] = await Promise.all([
    prisma.request.findMany({
      where,
      orderBy: [{ status: "asc" }, { priority: "desc" }, { createdAt: "desc" }],
      take: 200,
      select: {
        id: true,
        reference: true,
        type: true,
        category: true,
        subject: true,
        message: true,
        status: true,
        priority: true,
        name: true,
        createdAt: true,
        photoId: true,
        assignedTo: { select: { name: true } },
        _count: { select: { messages: true } },
      },
    }),
    prisma.request.groupBy({ by: ["status"], _count: true }),
    prisma.request.groupBy({ by: ["type"], _count: true }),
  ]);

  const statusCount = (value: string) =>
    statusCounts.find((entry) => entry.status === value)?._count ?? 0;
  const typeCount = (value: string) => typeCounts.find((entry) => entry.type === value)?._count ?? 0;
  const total = statusCounts.reduce((sum, entry) => sum + entry._count, 0);

  return (
    <>
      <AdminHeader
        title="Messages et signalements"
        description="Toutes les demandes déposées par les habitants : messages, signalements dans l'espace public, suggestions et demandes de rendez-vous."
        breadcrumb={[{ label: "Messages et signalements" }]}
      />

      {supprimee ? (
        <Notice tone="succes" className="mb-5">
          La demande a été supprimée.
        </Notice>
      ) : null}

      <FilterBar>
        <FilterLink href="/admin/demandes" active={!statut && !type} count={total}>
          Toutes
        </FilterLink>
        {REQUEST_STATUSES.map((status) => (
          <FilterLink
            key={status}
            href={`/admin/demandes?statut=${status}`}
            active={statut === status}
            count={statusCount(status)}
          >
            {REQUEST_STATUS_LABELS[status]}
          </FilterLink>
        ))}
        <span aria-hidden className="mx-1 h-5 w-px bg-[color:var(--bordure)]" />
        {REQUEST_TYPES.map((entry) => (
          <FilterLink
            key={entry}
            href={`/admin/demandes?type=${entry}`}
            active={type === entry}
            count={typeCount(entry)}
          >
            {REQUEST_TYPE_LABELS[entry]}
          </FilterLink>
        ))}
      </FilterBar>

      <Panel>
        {requests.length === 0 ? (
          <AdminEmpty
            icon="Inbox"
            title="Aucune demande"
            description="Les messages et signalements déposés sur le site arrivent ici."
          />
        ) : (
          <ul className="divide-y divide-[color:var(--bordure)]">
            {requests.map((request) => (
              <li key={request.id}>
                <Link
                  href={`/admin/demandes/${request.id}`}
                  className="flex items-start gap-4 p-4 transition-colors hover:bg-[color:var(--surface-alt)] sm:p-5"
                >
                  <span
                    className={
                      request.priority === "HAUTE" && request.status !== "TRAITE"
                        ? "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-field bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200"
                        : "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-field bg-[color:var(--surface-sunken)] text-[color:var(--texte-doux)]"
                    }
                  >
                    <Icon name={TYPE_ICONS[request.type as RequestType] ?? "Mail"} className="size-4.5" />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{request.subject}</span>
                      <Pill
                        tone={
                          request.status === "NOUVEAU"
                            ? "attente"
                            : request.status === "EN_COURS"
                              ? "encours"
                              : "publie"
                        }
                      >
                        {REQUEST_STATUS_LABELS[request.status as RequestStatus]}
                      </Pill>
                      {request.priority === "HAUTE" ? (
                        <Pill tone="refus" icon="TriangleAlert">
                          Priorité haute
                        </Pill>
                      ) : null}
                      {request.category ? (
                        <Pill tone="neutre">
                          {labelOf(SIGNALEMENT_CATEGORY_LABELS, request.category)}
                        </Pill>
                      ) : null}
                      {request.photoId ? (
                        <Pill tone="neutre" icon="Camera">
                          Photo
                        </Pill>
                      ) : null}
                      {request._count.messages > 0 ? (
                        <Pill tone="neutre" icon="MessageSquare">
                          {request._count.messages}
                        </Pill>
                      ) : null}
                    </span>

                    <span className="mt-1 block text-sm text-[color:var(--texte-doux)]">
                      {truncate(request.message, 150)}
                    </span>

                    <span className="mt-1.5 block text-xs text-[color:var(--texte-doux)]">
                      <span className="font-mono">{request.reference}</span> ·{" "}
                      {REQUEST_TYPE_LABELS[request.type as RequestType]} · {request.name} ·{" "}
                      {formatRelative(request.createdAt)}
                      {request.assignedTo ? ` · affectée à ${request.assignedTo.name}` : ""}
                    </span>
                  </span>

                  <Icon
                    name="ChevronRight"
                    className="mt-2.5 size-4 shrink-0 text-[color:var(--texte-doux)]/50"
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}
