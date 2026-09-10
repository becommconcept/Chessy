"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { FieldsForm } from "@/components/admin/FieldRenderer";
import { MediaPicker, type MediaValue } from "@/components/admin/MediaPicker";
import { Panel, Pill } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import { Checkbox, Field, Input, Notice, Select, Textarea } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import {
  BLOCK_DEFINITIONS,
  BLOCK_GROUPS,
  blockSummary,
  defaultBlockData,
  getBlockDefinition,
} from "@/lib/blocks";
import { PAGE_TEMPLATES, PAGE_TEMPLATE_LABELS, type PageTemplate } from "@/lib/enums";
import { cn, slugify } from "@/lib/utils";

export type EditableBlock = {
  key: string;
  type: string;
  visible: boolean;
  data: Record<string, unknown>;
};

export type EditablePage = {
  id: string;
  slug: string;
  title: string;
  navLabel: string;
  excerpt: string;
  parentId: string | null;
  template: PageTemplate;
  status: "BROUILLON" | "PUBLIEE";
  order: number;
  showInNav: boolean;
  icon: string;
  cover: MediaValue;
  seoTitle: string;
  seoDescription: string;
  noIndex: boolean;
  blocks: EditableBlock[];
};

export type SavePagePayload = EditablePage;

export type SaveResult = { ok: true; slug: string } | { ok: false; error: string };

let keyCounter = 0;
const nextKey = () => `bloc-${Date.now().toString(36)}-${(keyCounter += 1)}`;

/**
 * Éditeur d'une page du site.
 *
 * Le principe : une page est une pile de sections (les « blocs ») que l'on
 * ajoute, réordonne, masque ou supprime. Chaque bloc a son propre formulaire,
 * généré à partir de sa description. Le tout est enregistré en une seule fois,
 * ce qui rend l'abandon d'une modification sans conséquence.
 */
export function BlockEditor({
  page,
  parents,
  onSave,
  onCreateRevision,
  revisions,
}: {
  page: EditablePage;
  parents: Array<{ id: string; title: string; slug: string }>;
  onSave: (payload: SavePagePayload) => Promise<SaveResult>;
  onCreateRevision?: () => Promise<void>;
  revisions?: Array<{ id: string; label: string | null; createdAt: string; author: string | null }>;
}) {
  const [state, setState] = useState<EditablePage>(page);
  const [selected, setSelected] = useState<string | null>(page.blocks[0]?.key ?? null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [insertAt, setInsertAt] = useState<number | null>(null);
  const [tab, setTab] = useState<"contenu" | "reglages" | "referencement">("contenu");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: "succes" | "erreur"; text: string } | null>(null);
  const [dragKey, setDragKey] = useState<string | null>(null);

  /* Avertissement avant de quitter la page avec des modifications non enregistrées. */
  useEffect(() => {
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const patch = useCallback((changes: Partial<EditablePage>) => {
    setState((current) => ({ ...current, ...changes }));
    setDirty(true);
    setMessage(null);
  }, []);

  const patchBlock = useCallback((key: string, changes: Partial<EditableBlock>) => {
    setState((current) => ({
      ...current,
      blocks: current.blocks.map((block) => (block.key === key ? { ...block, ...changes } : block)),
    }));
    setDirty(true);
    setMessage(null);
  }, []);

  const addBlock = (type: string) => {
    const block: EditableBlock = { key: nextKey(), type, visible: true, data: defaultBlockData(type) };
    setState((current) => {
      const blocks = [...current.blocks];
      blocks.splice(insertAt ?? blocks.length, 0, block);
      return { ...current, blocks };
    });
    setSelected(block.key);
    setPaletteOpen(false);
    setInsertAt(null);
    setDirty(true);
  };

  const removeBlock = (key: string) => {
    setState((current) => ({ ...current, blocks: current.blocks.filter((block) => block.key !== key) }));
    setSelected((current) => (current === key ? null : current));
    setDirty(true);
  };

  const duplicateBlock = (key: string) => {
    setState((current) => {
      const index = current.blocks.findIndex((block) => block.key === key);
      if (index === -1) return current;
      const copy: EditableBlock = {
        ...structuredClone(current.blocks[index]),
        key: nextKey(),
      };
      const blocks = [...current.blocks];
      blocks.splice(index + 1, 0, copy);
      return { ...current, blocks };
    });
    setDirty(true);
  };

  const moveBlock = (key: string, direction: -1 | 1) => {
    setState((current) => {
      const index = current.blocks.findIndex((block) => block.key === key);
      const target = index + direction;
      if (index === -1 || target < 0 || target >= current.blocks.length) return current;
      const blocks = [...current.blocks];
      [blocks[index], blocks[target]] = [blocks[target], blocks[index]];
      return { ...current, blocks };
    });
    setDirty(true);
  };

  const reorderTo = (key: string, targetKey: string) => {
    if (key === targetKey) return;
    setState((current) => {
      const from = current.blocks.findIndex((block) => block.key === key);
      const to = current.blocks.findIndex((block) => block.key === targetKey);
      if (from === -1 || to === -1) return current;
      const blocks = [...current.blocks];
      const [moved] = blocks.splice(from, 1);
      blocks.splice(to, 0, moved);
      return { ...current, blocks };
    });
    setDirty(true);
  };

  const save = async (status?: "BROUILLON" | "PUBLIEE") => {
    setSaving(true);
    setMessage(null);
    const payload = status ? { ...state, status } : state;
    try {
      const result = await onSave(payload);
      if (result.ok) {
        setState((current) => ({ ...current, status: payload.status, slug: result.slug }));
        setDirty(false);
        setMessage({
          tone: "succes",
          text:
            payload.status === "PUBLIEE"
              ? "Page enregistrée et publiée. Les visiteurs voient désormais cette version."
              : "Page enregistrée comme brouillon. Elle n'est pas visible du public.",
        });
      } else {
        setMessage({ tone: "erreur", text: result.error });
      }
    } catch {
      setMessage({ tone: "erreur", text: "L'enregistrement a échoué. Réessayez." });
    } finally {
      setSaving(false);
    }
  };

  const selectedBlock = state.blocks.find((block) => block.key === selected) ?? null;
  const definition = selectedBlock ? getBlockDefinition(selectedBlock.type) : null;

  const groupedPalette = useMemo(
    () =>
      BLOCK_GROUPS.map((group) => ({
        group,
        blocks: BLOCK_DEFINITIONS.filter((entry) => entry.group === group),
      })),
    [],
  );

  return (
    <div>
      {/* Barre d'action collante */}
      <div className="sticky top-0 z-20 -mx-4 mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[color:var(--bordure)] bg-[color:var(--surface)]/94 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/admin/pages"
            className="flex size-9 shrink-0 items-center justify-center rounded-field border border-[color:var(--bordure)] transition-colors hover:bg-[color:var(--surface-alt)]"
          >
            <Icon name="ArrowLeft" className="size-4" />
            <span className="sr-only">Retour à la liste des pages</span>
          </Link>
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-bold">{state.title || "Sans titre"}</p>
            <p className="flex items-center gap-2 text-xs text-[color:var(--texte-doux)]">
              <span className="font-mono">/{state.slug}</span>
              <Pill tone={state.status === "PUBLIEE" ? "publie" : "brouillon"}>
                {state.status === "PUBLIEE" ? "Publiée" : "Brouillon"}
              </Pill>
              {dirty ? <Pill tone="attente">Modifications non enregistrées</Pill> : null}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`/${state.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center gap-1.5 rounded-field border border-[color:var(--bordure)] px-3 text-sm font-semibold transition-colors hover:bg-[color:var(--surface-alt)]"
          >
            <Icon name="Eye" className="size-4" />
            <span className="hidden sm:inline">Voir la page</span>
          </a>
          <Button
            variant="contour"
            size="sm"
            onClick={() => void save("BROUILLON")}
            disabled={saving}
            icon="Save"
          >
            Brouillon
          </Button>
          <Button
            size="sm"
            onClick={() => void save("PUBLIEE")}
            disabled={saving}
            icon={saving ? "Loader2" : "CheckCheck"}
            className={saving ? "[&_svg]:animate-spin" : undefined}
          >
            {saving ? "Enregistrement…" : "Enregistrer et publier"}
          </Button>
        </div>
      </div>

      {message ? (
        <Notice tone={message.tone === "succes" ? "succes" : "erreur"} className="mb-5">
          {message.text}
        </Notice>
      ) : null}

      {/* Onglets */}
      <div
        role="tablist"
        aria-label="Sections de l'éditeur"
        className="mb-5 flex gap-1 border-b border-[color:var(--bordure)]"
      >
        {(
          [
            { key: "contenu", label: "Contenu et mise en page", icon: "LayoutTemplate" },
            { key: "reglages", label: "Réglages de la page", icon: "Settings" },
            { key: "referencement", label: "Référencement", icon: "Search" },
          ] as const
        ).map((entry) => (
          <button
            key={entry.key}
            type="button"
            role="tab"
            aria-selected={tab === entry.key}
            onClick={() => setTab(entry.key)}
            className={cn(
              "-mb-px flex items-center gap-2 border-b-2 px-3.5 py-2.5 text-sm font-semibold transition-colors",
              tab === entry.key
                ? "border-azur-600 text-azur-700 dark:text-azur-200"
                : "border-transparent text-[color:var(--texte-doux)] hover:text-[color:var(--texte)]",
            )}
          >
            <Icon name={entry.icon} className="size-4" />
            <span className="hidden sm:inline">{entry.label}</span>
          </button>
        ))}
      </div>

      {/* ------------------------- Onglet contenu ------------------------- */}
      {tab === "contenu" ? (
        <div className="grid gap-5 lg:grid-cols-12">
          {/* Liste des blocs */}
          <div className="lg:col-span-5 xl:col-span-4">
            <Panel
              title="Sections de la page"
              description={`${state.blocks.length} section${state.blocks.length > 1 ? "s" : ""}`}
              actions={
                <button
                  type="button"
                  onClick={() => {
                    setInsertAt(null);
                    setPaletteOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-field bg-azur-600 px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-azur-700"
                >
                  <Icon name="Plus" className="size-3.5" />
                  Ajouter
                </button>
              }
            >
              {state.blocks.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <Icon name="Layers" className="mx-auto mb-3 size-7 text-[color:var(--texte-doux)]/50" />
                  <p className="text-sm font-semibold">Cette page est vide</p>
                  <p className="mt-1 text-xs text-[color:var(--texte-doux)]">
                    Ajoutez une première section pour commencer.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-[color:var(--bordure)]">
                  {state.blocks.map((block, index) => {
                    const blockDefinition = getBlockDefinition(block.type);
                    const active = selected === block.key;
                    return (
                      <li
                        key={block.key}
                        draggable
                        onDragStart={() => setDragKey(block.key)}
                        onDragEnd={() => setDragKey(null)}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => {
                          event.preventDefault();
                          if (dragKey) reorderTo(dragKey, block.key);
                          setDragKey(null);
                        }}
                        className={cn(
                          "group relative transition-colors",
                          active && "bg-azur-50 dark:bg-azur-900/30",
                          dragKey === block.key && "opacity-50",
                        )}
                      >
                        <div className="flex items-start gap-2 p-2.5">
                          <span
                            aria-hidden
                            title="Glisser pour réordonner"
                            className="mt-1.5 cursor-grab text-[color:var(--texte-doux)]/50 active:cursor-grabbing"
                          >
                            <Icon name="GripVertical" className="size-4" />
                          </span>

                          <button
                            type="button"
                            onClick={() => setSelected(block.key)}
                            className="min-w-0 flex-1 text-left"
                          >
                            <span className="flex items-center gap-2">
                              <Icon
                                name={blockDefinition?.icon}
                                fallback="Square"
                                className="size-3.5 shrink-0 text-azur-600 dark:text-azur-200"
                              />
                              <span className="truncate text-xs font-bold tracking-wide uppercase text-[color:var(--texte-doux)]">
                                {blockDefinition?.label ?? block.type}
                              </span>
                              {!block.visible ? (
                                <Pill tone="brouillon" icon="EyeOff">
                                  Masqué
                                </Pill>
                              ) : null}
                            </span>
                            <span className="mt-0.5 block truncate text-sm font-medium">
                              {blockSummary(block.type, block.data)}
                            </span>
                          </button>

                          <span className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                            <IconButton
                              icon="MoveUp"
                              label="Monter la section"
                              onClick={() => moveBlock(block.key, -1)}
                              disabled={index === 0}
                            />
                            <IconButton
                              icon="MoveDown"
                              label="Descendre la section"
                              onClick={() => moveBlock(block.key, 1)}
                              disabled={index === state.blocks.length - 1}
                            />
                            <IconButton
                              icon={block.visible ? "Eye" : "EyeOff"}
                              label={block.visible ? "Masquer la section" : "Afficher la section"}
                              onClick={() => patchBlock(block.key, { visible: !block.visible })}
                            />
                            <IconButton
                              icon="CopyPlus"
                              label="Dupliquer la section"
                              onClick={() => duplicateBlock(block.key)}
                            />
                            <IconButton
                              icon="Trash2"
                              label="Supprimer la section"
                              danger
                              onClick={() => removeBlock(block.key)}
                            />
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setInsertAt(index + 1);
                            setPaletteOpen(true);
                          }}
                          className="absolute -bottom-2.5 left-1/2 z-10 flex size-5 -translate-x-1/2 items-center justify-center rounded-full bg-azur-600 text-white opacity-0 transition-opacity hover:bg-azur-700 group-hover:opacity-100 focus:opacity-100"
                        >
                          <Icon name="Plus" className="size-3" />
                          <span className="sr-only">Insérer une section ici</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Panel>

            <p className="mt-3 flex items-start gap-2 text-xs text-[color:var(--texte-doux)]">
              <Icon name="Info" className="mt-0.5 size-3.5 shrink-0" />
              Glissez une section pour la déplacer, ou utilisez les flèches (accessibles au
              clavier). Le bouton <strong>+</strong> entre deux sections insère un bloc à cet
              endroit précis.
            </p>
          </div>

          {/* Formulaire du bloc sélectionné */}
          <div className="lg:col-span-7 xl:col-span-8">
            {selectedBlock && definition ? (
              <Panel
                title={definition.label}
                description={definition.description}
                actions={
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="flex size-7 items-center justify-center rounded transition-colors hover:bg-[color:var(--surface)]"
                  >
                    <Icon name="X" className="size-4" />
                    <span className="sr-only">Fermer le formulaire</span>
                  </button>
                }
              >
                <div className="p-4 sm:p-5">
                  <FieldsForm
                    fields={definition.fields}
                    values={selectedBlock.data}
                    onChange={(data) => patchBlock(selectedBlock.key, { data })}
                  />
                </div>
              </Panel>
            ) : (
              <Panel>
                <div className="px-6 py-16 text-center">
                  <Icon
                    name="MousePointerClick"
                    className="mx-auto mb-3 size-8 text-[color:var(--texte-doux)]/40"
                  />
                  <p className="font-display font-semibold">Sélectionnez une section</p>
                  <p className="mx-auto mt-1.5 max-w-sm text-sm text-[color:var(--texte-doux)]">
                    Cliquez sur une section à gauche pour modifier son contenu, ou ajoutez-en une
                    nouvelle.
                  </p>
                </div>
              </Panel>
            )}
          </div>
        </div>
      ) : null}

      {/* ------------------------ Onglet réglages ------------------------ */}
      {tab === "reglages" ? (
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <Panel title="Identité de la page">
              <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
                <Field label="Titre de la page" htmlFor="titre" required className="sm:col-span-2">
                  <Input
                    id="titre"
                    value={state.title}
                    onChange={(event) => patch({ title: event.target.value })}
                  />
                </Field>

                <Field
                  label="Adresse de la page"
                  htmlFor="slug"
                  required
                  hint="Partie de l'URL après le nom du site. Modifier cette valeur casse les liens existants."
                  className="sm:col-span-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="shrink-0 text-sm text-[color:var(--texte-doux)]">
                      chessy69.fr/
                    </span>
                    <Input
                      id="slug"
                      value={state.slug}
                      onChange={(event) => patch({ slug: event.target.value })}
                      onBlur={(event) =>
                        patch({
                          slug: event.target.value
                            .split("/")
                            .map((segment) => slugify(segment))
                            .filter(Boolean)
                            .join("/"),
                        })
                      }
                      className="font-mono"
                    />
                  </div>
                </Field>

                <Field
                  label="Libellé dans les menus"
                  htmlFor="navLabel"
                  hint="Version courte du titre, utilisée dans la navigation."
                >
                  <Input
                    id="navLabel"
                    value={state.navLabel}
                    onChange={(event) => patch({ navLabel: event.target.value })}
                    placeholder={state.title}
                  />
                </Field>

                <Field
                  label="Icône"
                  htmlFor="icone"
                  hint="Nom d'icône, par exemple Landmark ou Droplets."
                >
                  <Input
                    id="icone"
                    value={state.icon}
                    onChange={(event) => patch({ icon: event.target.value })}
                    placeholder="Landmark"
                  />
                </Field>

                <Field
                  label="Chapeau"
                  htmlFor="excerpt"
                  hint="Phrase d'introduction affichée sous le titre et dans les listes."
                  className="sm:col-span-2"
                >
                  <Textarea
                    id="excerpt"
                    rows={3}
                    value={state.excerpt}
                    onChange={(event) => patch({ excerpt: event.target.value })}
                  />
                </Field>

                <div className="sm:col-span-2">
                  <MediaPicker
                    label="Image de rubrique"
                    hint="Affichée en bandeau si la page ne commence pas par un bloc « Bandeau d'accueil »."
                    value={state.cover}
                    onChange={(cover) => patch({ cover })}
                  />
                </div>
              </div>
            </Panel>

            <Panel title="Emplacement et présentation">
              <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
                <Field
                  label="Rubrique parente"
                  htmlFor="parent"
                  hint="Détermine le fil d'Ariane et le sous-menu de rubrique."
                >
                  <Select
                    id="parent"
                    value={state.parentId ?? ""}
                    onChange={(event) => patch({ parentId: event.target.value || null })}
                  >
                    <option value="">Aucune (page de premier niveau)</option>
                    {parents
                      .filter((parent) => parent.id !== state.id)
                      .map((parent) => (
                        <option key={parent.id} value={parent.id}>
                          {parent.title}
                        </option>
                      ))}
                  </Select>
                </Field>

                <Field label="Gabarit" htmlFor="template">
                  <Select
                    id="template"
                    value={state.template}
                    onChange={(event) => patch({ template: event.target.value as PageTemplate })}
                  >
                    {PAGE_TEMPLATES.map((template) => (
                      <option key={template} value={template}>
                        {PAGE_TEMPLATE_LABELS[template]}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field
                  label="Ordre d'affichage"
                  htmlFor="ordre"
                  hint="Plus le nombre est petit, plus la page apparaît en premier."
                >
                  <Input
                    id="ordre"
                    type="number"
                    value={String(state.order)}
                    onChange={(event) => patch({ order: Number(event.target.value) || 0 })}
                  />
                </Field>

                <div className="flex items-end">
                  <Checkbox
                    checked={state.showInNav}
                    onChange={(event) => patch({ showInNav: event.target.checked })}
                    label="Afficher dans les menus et le plan du site"
                    className="w-full"
                  />
                </div>
              </div>
            </Panel>
          </div>

          <div className="space-y-5">
            <Panel title="Publication">
              <div className="space-y-3 p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold">État</span>
                  <Pill tone={state.status === "PUBLIEE" ? "publie" : "brouillon"}>
                    {state.status === "PUBLIEE" ? "Publiée" : "Brouillon"}
                  </Pill>
                </div>
                <p className="text-xs leading-relaxed text-[color:var(--texte-doux)]">
                  Une page en brouillon reste invisible pour le public et n'apparaît ni dans les
                  menus, ni dans la recherche, ni dans le plan du site.
                </p>
                <div className="flex flex-col gap-2">
                  <Button
                    variant={state.status === "PUBLIEE" ? "contour" : "principal"}
                    onClick={() => void save(state.status === "PUBLIEE" ? "BROUILLON" : "PUBLIEE")}
                    disabled={saving}
                    fullWidth
                    icon={state.status === "PUBLIEE" ? "EyeOff" : "CheckCheck"}
                  >
                    {state.status === "PUBLIEE" ? "Dépublier la page" : "Publier la page"}
                  </Button>
                </div>
              </div>
            </Panel>

            {onCreateRevision ? (
              <Panel
                title="Versions"
                description="Un instantané permet de revenir en arrière."
                actions={
                  <button
                    type="button"
                    onClick={() => void onCreateRevision()}
                    className="inline-flex items-center gap-1.5 rounded-field border border-[color:var(--bordure)] px-2.5 py-1.5 text-xs font-semibold transition-colors hover:bg-[color:var(--surface)]"
                  >
                    <Icon name="History" className="size-3.5" />
                    Enregistrer une version
                  </button>
                }
              >
                {revisions && revisions.length > 0 ? (
                  <ul className="divide-y divide-[color:var(--bordure)] text-sm">
                    {revisions.map((revision) => (
                      <li key={revision.id} className="px-4 py-2.5">
                        <p className="font-medium">{revision.label ?? "Version enregistrée"}</p>
                        <p className="text-xs text-[color:var(--texte-doux)]">
                          {new Date(revision.createdAt).toLocaleString("fr-FR")}
                          {revision.author ? ` · ${revision.author}` : ""}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="px-4 py-4 text-xs text-[color:var(--texte-doux)]">
                    Aucune version enregistrée. Créez-en une avant une modification importante.
                  </p>
                )}
              </Panel>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* --------------------- Onglet référencement --------------------- */}
      {tab === "referencement" ? (
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Panel title="Référencement naturel">
              <div className="space-y-4 p-4 sm:p-5">
                <Field
                  label="Titre pour les moteurs de recherche"
                  htmlFor="seoTitle"
                  hint="60 caractères environ. Laissez vide pour reprendre le titre de la page."
                >
                  <Input
                    id="seoTitle"
                    value={state.seoTitle}
                    onChange={(event) => patch({ seoTitle: event.target.value })}
                    placeholder={state.title}
                    maxLength={90}
                  />
                  <p className="mt-1 text-xs text-[color:var(--texte-doux)] tabular-nums">
                    {(state.seoTitle || state.title).length} caractères
                  </p>
                </Field>

                <Field
                  label="Description"
                  htmlFor="seoDescription"
                  hint="150 à 160 caractères. C'est le texte affiché sous le lien dans les résultats de recherche."
                >
                  <Textarea
                    id="seoDescription"
                    rows={3}
                    value={state.seoDescription}
                    onChange={(event) => patch({ seoDescription: event.target.value })}
                    placeholder={state.excerpt}
                    maxLength={320}
                  />
                  <p className="mt-1 text-xs text-[color:var(--texte-doux)] tabular-nums">
                    {(state.seoDescription || state.excerpt).length} caractères
                  </p>
                </Field>

                <Checkbox
                  checked={state.noIndex}
                  onChange={(event) => patch({ noIndex: event.target.checked })}
                  label="Demander aux moteurs de ne pas indexer cette page"
                  description="À réserver aux pages techniques ou temporaires."
                />
              </div>
            </Panel>
          </div>

          <div>
            <Panel title="Aperçu dans les résultats">
              <div className="p-4">
                <div className="rounded-field border border-[color:var(--bordure)] p-3.5">
                  <p className="truncate text-xs text-malachite-600 dark:text-malachite-300">
                    chessy69.fr › {state.slug.split("/").join(" › ")}
                  </p>
                  <p className="mt-1 line-clamp-2 text-base leading-snug font-medium text-azur-700 dark:text-azur-200">
                    {state.seoTitle || state.title} — Mairie de Chessy-les-Mines
                  </p>
                  <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-[color:var(--texte-doux)]">
                    {state.seoDescription || state.excerpt || "Aucune description renseignée."}
                  </p>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-[color:var(--texte-doux)]">
                  Cet aperçu est indicatif : les moteurs de recherche réécrivent parfois le titre et
                  la description selon la requête de l'internaute.
                </p>
              </div>
            </Panel>
          </div>
        </div>
      ) : null}

      {/* Palette d'ajout de bloc */}
      {paletteOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Ajouter une section"
          className="fixed inset-0 z-100 flex items-start justify-center bg-azur-950/55 p-4 pt-[6vh] backdrop-blur-sm"
        >
          <div className="flex max-h-[84dvh] w-full max-w-3xl flex-col overflow-hidden rounded-card border border-[color:var(--bordure)] bg-[color:var(--surface)] shadow-menu">
            <div className="flex items-center justify-between gap-3 border-b border-[color:var(--bordure)] bg-[color:var(--surface-alt)] px-5 py-3.5">
              <div>
                <h2 className="font-display text-base font-bold">Ajouter une section</h2>
                <p className="text-xs text-[color:var(--texte-doux)]">
                  {insertAt === null
                    ? "La section sera ajoutée à la fin de la page."
                    : `La section sera insérée en position ${insertAt + 1}.`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPaletteOpen(false);
                  setInsertAt(null);
                }}
                className="flex size-9 items-center justify-center rounded-field transition-colors hover:bg-[color:var(--surface)]"
              >
                <Icon name="X" className="size-4.5" />
                <span className="sr-only">Fermer</span>
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
              {groupedPalette.map(({ group, blocks }) => (
                <div key={group} className="mb-6 last:mb-0">
                  <p className="mb-2.5 text-xs font-bold tracking-wide uppercase text-[color:var(--texte-doux)]">
                    {group}
                  </p>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {blocks.map((entry) => (
                      <li key={entry.type}>
                        <button
                          type="button"
                          onClick={() => addBlock(entry.type)}
                          className="group flex w-full items-start gap-3 rounded-field border border-[color:var(--bordure)] p-3 text-left transition-[border-color,background-color] hover:border-azur-400 hover:bg-azur-50/60 dark:hover:bg-azur-900/25"
                        >
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-field bg-[color:var(--surface-sunken)] text-azur-600 transition-colors group-hover:bg-azur-500 group-hover:text-white dark:text-azur-200">
                            <Icon name={entry.icon} fallback="Square" className="size-4.5" />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-sm font-semibold">{entry.label}</span>
                            <span className="mt-0.5 block text-xs leading-snug text-[color:var(--texte-doux)]">
                              {entry.description}
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function IconButton({
  icon,
  label,
  onClick,
  disabled,
  danger,
}: {
  icon: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={cn(
        "flex size-7 items-center justify-center rounded transition-colors disabled:opacity-30",
        danger
          ? "text-red-600 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-900/30"
          : "text-[color:var(--texte-doux)] hover:bg-[color:var(--surface)] hover:text-[color:var(--texte)]",
      )}
    >
      <Icon name={icon} className="size-3.5" />
      <span className="sr-only">{label}</span>
    </button>
  );
}
