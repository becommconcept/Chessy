import { ajouterFermeture, supprimerFermeture } from "@/app/admin/actions-demandes";
import {
  enregistrerMateriel,
  enregistrerSalle,
  enregistrerTarif,
  supprimerMateriel,
} from "@/app/admin/actions-config";
import { HtmlField } from "@/components/admin/HtmlField";
import { MediaField } from "@/components/admin/MediaField";
import { RowActions } from "@/components/admin/RowActions";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { AdminHeader, Cell, DataTable, HelpNote, Panel, Pill } from "@/components/admin/ui";
import { ButtonLink } from "@/components/ui/Button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  AUDIENCES,
  AUDIENCE_LABELS,
  EQUIPMENT_CATEGORIES,
  EQUIPMENT_CATEGORY_LABELS,
  labelOf,
} from "@/lib/enums";
import { formatDate, formatPrice, safeJson, toISODate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Salles et matériel" };

type Props = { searchParams: Promise<{ onglet?: string; salle?: string; materiel?: string }> };

export default async function AdminRessourcesPage({ searchParams }: Props) {
  // Les contenus du site ne sont modifiables que par un administrateur ou un éditeur.
  await requireRole(["ADMIN", "EDITEUR"]);

  const { onglet, salle: salleId, materiel: materielId } = await searchParams;
  const tab = onglet === "materiel" ? "materiel" : "salles";

  const [rooms, closures, items, editingRoom, editingItem] = await Promise.all([
    prisma.room.findMany({
      orderBy: { order: "asc" },
      include: {
        image: { select: { id: true, url: true, alt: true } },
        slots: { orderBy: { order: "asc" } },
        tariffs: true,
        _count: { select: { bookings: true } },
      },
    }),
    prisma.roomClosure.findMany({
      where: { endDate: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
      orderBy: { startDate: "asc" },
      include: { room: { select: { name: true } } },
    }),
    prisma.equipmentItem.findMany({
      orderBy: [{ category: "asc" }, { order: "asc" }],
      include: {
        image: { select: { id: true, url: true, alt: true } },
        _count: { select: { lines: true } },
      },
    }),
    salleId && salleId !== "nouvelle"
      ? prisma.room.findUnique({
          where: { id: salleId },
          include: { image: { select: { id: true, url: true, alt: true } } },
        })
      : Promise.resolve(null),
    materielId && materielId !== "nouveau"
      ? prisma.equipmentItem.findUnique({
          where: { id: materielId },
          include: { image: { select: { id: true, url: true, alt: true } } },
        })
      : Promise.resolve(null),
  ]);

  return (
    <>
      <AdminHeader
        title="Salles et matériel"
        description="L'inventaire qui alimente les services de réservation et de prêt : caractéristiques des salles, grilles tarifaires, périodes de fermeture et stock de matériel."
        breadcrumb={[{ label: "Salles et matériel" }]}
      />

      {/* Onglets */}
      <div className="mb-5 flex gap-1 border-b border-[color:var(--bordure)]">
        {[
          { key: "salles", label: "Salles, tarifs et fermetures", icon: "PartyPopper" },
          { key: "materiel", label: "Inventaire du matériel", icon: "Package" },
        ].map((entry) => (
          <a
            key={entry.key}
            href={`/admin/ressources?onglet=${entry.key}`}
            aria-current={tab === entry.key ? "page" : undefined}
            className={
              tab === entry.key
                ? "-mb-px flex items-center gap-2 border-b-2 border-azur-600 px-3.5 py-2.5 text-sm font-semibold text-azur-700 dark:text-azur-200"
                : "-mb-px flex items-center gap-2 border-b-2 border-transparent px-3.5 py-2.5 text-sm font-semibold text-[color:var(--texte-doux)] transition-colors hover:text-[color:var(--texte)]"
            }
          >
            <Icon name={entry.icon} className="size-4" />
            {entry.label}
          </a>
        ))}
      </div>

      {/* -------------------------------- Salles ------------------------------ */}
      {tab === "salles" ? (
        <div className="space-y-6">
          {salleId ? (
            <Panel
              title={editingRoom ? `Modifier « ${editingRoom.name} »` : "Nouvelle salle"}
              actions={
                <ButtonLink href="/admin/ressources" variant="discret" size="sm" icon="X">
                  Fermer
                </ButtonLink>
              }
            >
              <form action={enregistrerSalle} className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
                <input type="hidden" name="id" value={editingRoom?.id ?? ""} />

                <Field label="Nom de la salle" htmlFor="nom" required>
                  <Input id="nom" name="nom" defaultValue={editingRoom?.name ?? ""} required maxLength={160} />
                </Field>
                <Field label="Sous-titre" htmlFor="sousTitre">
                  <Input id="sousTitre" name="sousTitre" defaultValue={editingRoom?.subtitle ?? ""} maxLength={200} />
                </Field>

                <div className="sm:col-span-2">
                  <HtmlField
                    name="description"
                    label="Présentation"
                    defaultValue={editingRoom?.description ?? "<p></p>"}
                    minHeight={160}
                  />
                </div>

                <Field label="Places assises" htmlFor="capaciteAssise">
                  <Input
                    id="capaciteAssise"
                    name="capaciteAssise"
                    type="number"
                    min={0}
                    defaultValue={String(editingRoom?.capacitySeated ?? "")}
                  />
                </Field>
                <Field label="Capacité debout" htmlFor="capaciteDebout">
                  <Input
                    id="capaciteDebout"
                    name="capaciteDebout"
                    type="number"
                    min={0}
                    defaultValue={String(editingRoom?.capacityStanding ?? "")}
                  />
                </Field>
                <Field label="Surface (m²)" htmlFor="surface">
                  <Input
                    id="surface"
                    name="surface"
                    type="number"
                    min={0}
                    defaultValue={String(editingRoom?.surface ?? "")}
                  />
                </Field>
                <Field label="Adresse" htmlFor="adresse">
                  <Input id="adresse" name="adresse" defaultValue={editingRoom?.address ?? ""} maxLength={200} />
                </Field>

                <Field
                  label="Équipements inclus"
                  htmlFor="equipements"
                  hint="Un équipement par ligne."
                  className="sm:col-span-2"
                >
                  <Textarea
                    id="equipements"
                    name="equipements"
                    rows={5}
                    defaultValue={safeJson<string[]>(editingRoom?.equipments, []).join("\n")}
                  />
                </Field>

                <div className="sm:col-span-2">
                  <HtmlField
                    name="reglement"
                    label="Règlement d'utilisation"
                    hint="Affiché avant la validation de la demande, et rappelé dans le récapitulatif."
                    defaultValue={editingRoom?.rules ?? "<p></p>"}
                    minHeight={180}
                  />
                </div>

                <Field
                  label="Ouverture des réservations (jours)"
                  htmlFor="fenetre"
                  hint="À combien de jours à l'avance une salle peut être demandée."
                >
                  <Input
                    id="fenetre"
                    name="fenetre"
                    type="number"
                    min={1}
                    defaultValue={String(editingRoom?.bookingWindowDays ?? 365)}
                  />
                </Field>
                <Field
                  label="Délai minimum (jours)"
                  htmlFor="delai"
                  hint="Combien de jours avant la date une demande doit être déposée."
                >
                  <Input
                    id="delai"
                    name="delai"
                    type="number"
                    min={0}
                    defaultValue={String(editingRoom?.minNoticeDays ?? 15)}
                  />
                </Field>

                <Field label="Ordre d'affichage" htmlFor="ordre">
                  <Input id="ordre" name="ordre" type="number" defaultValue={String(editingRoom?.order ?? 0)} />
                </Field>

                <div className="flex items-end">
                  <Checkbox
                    name="active"
                    defaultChecked={editingRoom?.active ?? true}
                    label="Salle réservable en ligne"
                    className="w-full"
                  />
                </div>

                <div className="sm:col-span-2">
                  <MediaField
                    name="image"
                    label="Photographie de la salle"
                    defaultValue={
                      editingRoom?.image
                        ? {
                            id: editingRoom.image.id,
                            url: editingRoom.image.url,
                            alt: editingRoom.image.alt,
                          }
                        : null
                    }
                  />
                </div>

                <div className="sm:col-span-2 border-t border-[color:var(--bordure)] pt-4">
                  <SubmitButton icon="Save">Enregistrer la salle</SubmitButton>
                </div>
              </form>
            </Panel>
          ) : null}

          {rooms.map((room) => (
            <Panel
              key={room.id}
              title={room.name}
              description={`${room._count.bookings} réservation(s) enregistrée(s) · ${room.slots.length} créneau(x)`}
              actions={
                <ButtonLink
                  href={`/admin/ressources?onglet=salles&salle=${room.id}`}
                  variant="contour"
                  size="sm"
                  icon="SquarePen"
                >
                  Modifier la salle
                </ButtonLink>
              }
            >
              <div className="overflow-x-auto">
                <table className="w-full min-w-[40rem] text-sm">
                  <caption className="sr-only">Grille tarifaire de {room.name}</caption>
                  <thead>
                    <tr className="border-b border-[color:var(--bordure)] bg-[color:var(--surface-alt)]">
                      <th scope="col" className="px-4 py-2.5 text-left text-xs font-bold uppercase text-[color:var(--texte-doux)]">
                        Situation
                      </th>
                      {room.slots.map((slot) => (
                        <th
                          key={slot.key}
                          scope="col"
                          className="px-4 py-2.5 text-right text-xs font-bold uppercase text-[color:var(--texte-doux)]"
                        >
                          {slot.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[color:var(--bordure)]">
                    {AUDIENCES.map((audience) => (
                      <tr key={audience}>
                        <th scope="row" className="px-4 py-2.5 text-left font-medium">
                          {AUDIENCE_LABELS[audience]}
                        </th>
                        {room.slots.map((slot) => {
                          const tariff = room.tariffs.find(
                            (entry) => entry.audience === audience && entry.slotKey === slot.key,
                          );
                          return (
                            <td key={slot.key} className="px-4 py-2 text-right">
                              <form
                                action={enregistrerTarif}
                                className="inline-flex items-center justify-end gap-1"
                              >
                                <input type="hidden" name="salle" value={room.id} />
                                <input type="hidden" name="situation" value={audience} />
                                <input type="hidden" name="creneau" value={slot.key} />
                                <input
                                  type="hidden"
                                  name="libelle"
                                  value={tariff?.label ?? AUDIENCE_LABELS[audience]}
                                />
                                <label className="sr-only" htmlFor={`montant-${room.id}-${audience}-${slot.key}`}>
                                  Tarif en centimes
                                </label>
                                <input
                                  id={`montant-${room.id}-${audience}-${slot.key}`}
                                  name="montant"
                                  type="number"
                                  min={0}
                                  step={100}
                                  defaultValue={tariff?.amountCents ?? 0}
                                  className="h-8 w-20 rounded border border-[color:var(--bordure)] bg-[color:var(--surface)] px-1.5 text-right text-xs tabular-nums focus:border-azur-500 focus:outline-none"
                                />
                                <label className="sr-only" htmlFor={`caution-${room.id}-${audience}-${slot.key}`}>
                                  Caution en centimes
                                </label>
                                <input
                                  id={`caution-${room.id}-${audience}-${slot.key}`}
                                  name="caution"
                                  type="number"
                                  min={0}
                                  step={100}
                                  defaultValue={tariff?.depositCents ?? 0}
                                  className="h-8 w-20 rounded border border-dashed border-[color:var(--bordure)] bg-[color:var(--surface)] px-1.5 text-right text-xs tabular-nums focus:border-azur-500 focus:outline-none"
                                />
                                <button
                                  type="submit"
                                  title={`Enregistrer le tarif ${AUDIENCE_LABELS[audience]} / ${slot.label}`}
                                  className="flex size-8 items-center justify-center rounded border border-[color:var(--bordure)] transition-colors hover:bg-azur-50 dark:hover:bg-azur-900/40"
                                >
                                  <Icon name="Save" className="size-3.5" />
                                  <span className="sr-only">Enregistrer</span>
                                </button>
                              </form>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="border-t border-[color:var(--bordure)] bg-[color:var(--surface-alt)] px-4 py-2.5 text-xs text-[color:var(--texte-doux)]">
                Montants exprimés en <strong>centimes</strong> : 30000 correspond à 300 €. Le premier
                champ est le tarif de location, le second (en pointillés) la caution. Enregistrez
                chaque case séparément.
              </p>
            </Panel>
          ))}

          <Panel
            title="Périodes de fermeture"
            description="Les dates bloquées n'apparaissent plus comme disponibles dans le calendrier public."
          >
            <form action={ajouterFermeture} className="grid gap-4 border-b border-[color:var(--bordure)] p-4 sm:grid-cols-4 sm:p-5">
              <Field label="Salle" htmlFor="fermeture-salle" required>
                <Select id="fermeture-salle" name="salle" required>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Du" htmlFor="fermeture-debut" required>
                <Input id="fermeture-debut" name="debut" type="date" required defaultValue={toISODate(new Date())} />
              </Field>
              <Field label="Au" htmlFor="fermeture-fin" hint="Laissez vide pour une seule journée.">
                <Input id="fermeture-fin" name="fin" type="date" />
              </Field>
              <Field label="Motif" htmlFor="fermeture-motif" required>
                <Input
                  id="fermeture-motif"
                  name="motif"
                  required
                  maxLength={200}
                  placeholder="Travaux, élections, manifestation municipale…"
                />
              </Field>
              <div className="sm:col-span-4">
                <SubmitButton icon="CalendarX" size="sm">
                  Bloquer cette période
                </SubmitButton>
              </div>
            </form>

            {closures.length === 0 ? (
              <p className="px-4 py-6 text-sm text-[color:var(--texte-doux)] sm:px-5">
                Aucune fermeture programmée à venir.
              </p>
            ) : (
              <DataTable
                caption="Périodes de fermeture programmées"
                columns={[{ label: "Salle" }, { label: "Période" }, { label: "Motif" }, { label: "Actions", sr: true }]}
              >
                {closures.map((closure) => (
                  <tr key={closure.id}>
                    <Cell header>{closure.room.name}</Cell>
                    <Cell className="text-xs whitespace-nowrap">
                      du {formatDate(closure.startDate, "d MMM yyyy")} au{" "}
                      {formatDate(closure.endDate, "d MMM yyyy")}
                    </Cell>
                    <Cell className="text-xs text-[color:var(--texte-doux)]">{closure.reason}</Cell>
                    <Cell className="text-right">
                      <RowActions
                        items={[
                          {
                            label: "Supprimer",
                            icon: "Trash2",
                            danger: true,
                            confirm: `Rouvrir la période « ${closure.reason} » à la réservation ?`,
                            action: supprimerFermeture.bind(null, closure.id),
                          },
                        ]}
                      />
                    </Cell>
                  </tr>
                ))}
              </DataTable>
            )}
          </Panel>

          <HelpNote title="Créneaux et jours imposés" icon="CalendarDays">
            Les créneaux d'une salle (week-end, journée, soirée) et leur jour de début imposé sont
            définis à l'installation. Pour en ajouter ou en modifier la durée, contactez le
            prestataire : ces règles conditionnent le calendrier de réservation.
          </HelpNote>
        </div>
      ) : null}

      {/* ------------------------------- Matériel ----------------------------- */}
      {tab === "materiel" ? (
        <div className="space-y-6">
          <div className="flex justify-end">
            <ButtonLink href="/admin/ressources?onglet=materiel&materiel=nouveau" size="sm" icon="Plus">
              Ajouter du matériel
            </ButtonLink>
          </div>

          {materielId ? (
            <Panel
              title={editingItem ? `Modifier « ${editingItem.name} »` : "Nouveau matériel"}
              actions={
                <ButtonLink
                  href="/admin/ressources?onglet=materiel"
                  variant="discret"
                  size="sm"
                  icon="X"
                >
                  Fermer
                </ButtonLink>
              }
            >
              <form action={enregistrerMateriel} className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
                <input type="hidden" name="id" value={editingItem?.id ?? ""} />

                <Field label="Nom" htmlFor="materiel-nom" required>
                  <Input
                    id="materiel-nom"
                    name="nom"
                    defaultValue={editingItem?.name ?? ""}
                    required
                    maxLength={160}
                  />
                </Field>
                <Field label="Catégorie" htmlFor="materiel-categorie" required>
                  <Select
                    id="materiel-categorie"
                    name="categorie"
                    defaultValue={editingItem?.category ?? "MOBILIER"}
                  >
                    {EQUIPMENT_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {EQUIPMENT_CATEGORY_LABELS[category]}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label="Description" htmlFor="materiel-description" className="sm:col-span-2">
                  <Textarea
                    id="materiel-description"
                    name="description"
                    rows={2}
                    defaultValue={editingItem?.description ?? ""}
                    maxLength={400}
                  />
                </Field>

                <Field label="Quantité en stock" htmlFor="materiel-quantite" required>
                  <Input
                    id="materiel-quantite"
                    name="quantite"
                    type="number"
                    min={0}
                    defaultValue={String(editingItem?.quantityTotal ?? 1)}
                    required
                  />
                </Field>
                <Field label="Unité" htmlFor="materiel-unite" hint="Exemple : table, chaise, lot, barnum.">
                  <Input
                    id="materiel-unite"
                    name="unite"
                    defaultValue={editingItem?.unitLabel ?? "unité"}
                    maxLength={40}
                  />
                </Field>
                <Field label="Caution (centimes)" htmlFor="materiel-caution">
                  <Input
                    id="materiel-caution"
                    name="caution"
                    type="number"
                    min={0}
                    step={100}
                    defaultValue={String(editingItem?.depositCents ?? 0)}
                  />
                </Field>
                <Field label="Participation (centimes)" htmlFor="materiel-participation">
                  <Input
                    id="materiel-participation"
                    name="participation"
                    type="number"
                    min={0}
                    step={100}
                    defaultValue={String(editingItem?.feeCents ?? 0)}
                  />
                </Field>
                <Field label="Ordre" htmlFor="materiel-ordre">
                  <Input
                    id="materiel-ordre"
                    name="ordre"
                    type="number"
                    defaultValue={String(editingItem?.order ?? items.length)}
                  />
                </Field>

                <div className="space-y-2 sm:col-span-2">
                  <Checkbox
                    name="vehicule"
                    defaultChecked={editingItem?.requiresVehicle ?? false}
                    label="Transport par véhicule nécessaire"
                    description="Affiché comme avertissement au demandeur."
                  />
                  <Checkbox
                    name="reserveAssociations"
                    defaultChecked={editingItem?.reservedForAssociations ?? false}
                    label="Réservé aux associations et organisateurs"
                    description="Non proposé aux particuliers."
                  />
                  <Checkbox
                    name="actif"
                    defaultChecked={editingItem?.active ?? true}
                    label="Matériel proposé au prêt"
                  />
                </div>

                <div className="sm:col-span-2">
                  <MediaField
                    name="image"
                    label="Photographie"
                    defaultValue={
                      editingItem?.image
                        ? {
                            id: editingItem.image.id,
                            url: editingItem.image.url,
                            alt: editingItem.image.alt,
                          }
                        : null
                    }
                  />
                </div>

                <div className="sm:col-span-2 border-t border-[color:var(--bordure)] pt-4">
                  <SubmitButton icon="Save">Enregistrer le matériel</SubmitButton>
                </div>
              </form>
            </Panel>
          ) : null}

          <Panel title={`${items.length} références`}>
            <DataTable
              caption="Inventaire du matériel prêté"
              columns={[
                { label: "Matériel" },
                { label: "Catégorie" },
                { label: "Stock", className: "text-right" },
                { label: "Caution", className: "text-right" },
                { label: "Prêts", className: "text-right" },
                { label: "État" },
                { label: "Actions", sr: true },
              ]}
            >
              {items.map((item) => (
                <tr key={item.id} className="transition-colors hover:bg-[color:var(--surface-alt)]">
                  <Cell header>
                    <span className="block font-semibold">{item.name}</span>
                    {item.description ? (
                      <span className="mt-0.5 block text-xs text-[color:var(--texte-doux)]">
                        {item.description}
                      </span>
                    ) : null}
                    <span className="mt-1 flex flex-wrap gap-1.5">
                      {item.requiresVehicle ? (
                        <Pill tone="neutre" icon="Truck">
                          Véhicule
                        </Pill>
                      ) : null}
                      {item.reservedForAssociations ? (
                        <Pill tone="attente">Associations</Pill>
                      ) : null}
                    </span>
                  </Cell>
                  <Cell>
                    <Pill tone="neutre">{labelOf(EQUIPMENT_CATEGORY_LABELS, item.category)}</Pill>
                  </Cell>
                  <Cell className="text-right font-semibold tabular-nums">
                    {item.quantityTotal}
                    <span className="ml-1 text-xs font-normal text-[color:var(--texte-doux)]">
                      {item.unitLabel}
                    </span>
                  </Cell>
                  <Cell className="text-right text-xs tabular-nums">
                    {formatPrice(item.depositCents, { free: "—" })}
                  </Cell>
                  <Cell className="text-right text-xs tabular-nums text-[color:var(--texte-doux)]">
                    {item._count.lines}
                  </Cell>
                  <Cell>
                    {item.active ? <Pill tone="publie">Proposé</Pill> : <Pill tone="brouillon">Retiré</Pill>}
                  </Cell>
                  <Cell className="text-right">
                    <RowActions
                      editHref={`/admin/ressources?onglet=materiel&materiel=${item.id}`}
                      items={[
                        {
                          label: item._count.lines > 0 ? "Retirer du catalogue" : "Supprimer",
                          icon: "Trash2",
                          danger: true,
                          confirm:
                            item._count.lines > 0
                              ? `« ${item.name} » figure dans ${item._count.lines} prêt(s). Il sera retiré du catalogue mais conservé dans l'historique. Continuer ?`
                              : `Supprimer définitivement « ${item.name} » de l'inventaire ?`,
                          action: supprimerMateriel.bind(null, item.id),
                        },
                      ]}
                    />
                  </Cell>
                </tr>
              ))}
            </DataTable>
          </Panel>

          <HelpNote title="Tenir le stock à jour" icon="Boxes">
            La quantité saisie ici est le stock total. Le site calcule automatiquement ce qui reste
            disponible aux dates demandées, en tenant compte des prêts en cours. Un matériel cassé
            ou envoyé en réparation : baissez la quantité plutôt que de le retirer, pour conserver
            l'historique.
          </HelpNote>
        </div>
      ) : null}
    </>
  );
}
