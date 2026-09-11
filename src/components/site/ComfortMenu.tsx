"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

/**
 * Menu « Confort de lecture ».
 *
 * Regroupe les réglages d'accessibilité attendus par le RGAA au-delà du strict
 * minimum : thème clair/sombre, taille du texte, contraste renforcé,
 * espacement adapté à la dyslexie et désactivation des animations.
 *
 * Les préférences sont enregistrées dans le navigateur de l'internaute
 * (`localStorage`) et ne quittent jamais son poste.
 */

export const PREFS_KEY = "chessy-preferences";

type Prefs = {
  theme: "clair" | "sombre" | "systeme";
  taille: "normal" | "grand" | "tres-grand";
  contraste: "normal" | "fort";
  lecture: "normal" | "confort";
  animations: "on" | "off";
};

const DEFAULTS: Prefs = {
  theme: "systeme",
  taille: "normal",
  contraste: "normal",
  lecture: "normal",
  animations: "on",
};

/** Script injecté avant le premier rendu pour éviter tout clignotement. */
export const PREFS_SCRIPT = `(function(){try{
var p=JSON.parse(localStorage.getItem("${PREFS_KEY}")||"{}");
var r=document.documentElement;
var dark=p.theme==="sombre"||(!p.theme||p.theme==="systeme")&&window.matchMedia("(prefers-color-scheme: dark)").matches;
r.classList.toggle("dark",!!dark);
if(p.taille&&p.taille!=="normal")r.dataset.taille=p.taille;
if(p.contraste==="fort")r.dataset.contraste="fort";
if(p.lecture==="confort")r.dataset.lecture="confort";
if(p.animations==="off")r.dataset.animations="off";
r.classList.toggle("anim",p.animations!=="off"&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
}catch(e){}})();`;

function apply(prefs: Prefs) {
  const root = document.documentElement;
  const dark =
    prefs.theme === "sombre" ||
    (prefs.theme === "systeme" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  root.classList.toggle("dark", dark);

  if (prefs.taille === "normal") delete root.dataset.taille;
  else root.dataset.taille = prefs.taille;

  if (prefs.contraste === "normal") delete root.dataset.contraste;
  else root.dataset.contraste = "fort";

  if (prefs.lecture === "normal") delete root.dataset.lecture;
  else root.dataset.lecture = "confort";

  if (prefs.animations === "on") delete root.dataset.animations;
  else root.dataset.animations = "off";

  // Pilote le masquage initial des apparitions au défilement (voir globals.css).
  root.classList.toggle(
    "anim",
    prefs.animations === "on" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
}

export function ComfortMenu({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [ready, setReady] = useState(false);
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(PREFS_KEY) ?? "{}");
      setPrefs({ ...DEFAULTS, ...stored });
    } catch {
      setPrefs(DEFAULTS);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    apply(prefs);
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    } catch {
      // Navigation privée ou stockage refusé : les réglages restent en mémoire.
    }
  }, [prefs, ready]);

  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (container.current && !container.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const set = <K extends keyof Prefs>(key: K, value: Prefs[K]) =>
    setPrefs((current) => ({ ...current, [key]: value }));

  const modified =
    prefs.taille !== "normal" ||
    prefs.contraste !== "normal" ||
    prefs.lecture !== "normal" ||
    prefs.animations !== "on";

  return (
    <div ref={container} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "flex items-center gap-1.5 rounded transition-colors",
          compact
            ? "size-10 justify-center rounded-field text-[color:var(--texte-doux)] hover:bg-[color:var(--surface-alt)] hover:text-[color:var(--texte)]"
            : "px-2 py-1 text-white/85 hover:bg-white/10 hover:text-white",
        )}
      >
        <Icon name="Accessibility" className={compact ? "size-5" : "size-3.5"} />
        {compact ? null : <span className="text-[0.8125rem]">Confort de lecture</span>}
        {modified ? (
          <span aria-hidden className="size-1.5 rounded-full bg-dore-400" />
        ) : null}
        <span className="sr-only">
          Confort de lecture et accessibilité{modified ? " (réglages personnalisés actifs)" : ""}
        </span>
      </button>

      {open ? (
        <div
          role="group"
          aria-label="Réglages d'affichage"
          className="animate-glisse-bas absolute top-full right-0 z-60 mt-2 w-80 overflow-hidden rounded-card border border-[color:var(--bordure)] bg-[color:var(--surface)] text-[color:var(--texte)] shadow-menu"
        >
          <div className="border-b border-[color:var(--bordure)] bg-[color:var(--surface-alt)] px-4 py-3">
            <p className="font-display text-sm font-bold">Confort de lecture</p>
            <p className="mt-0.5 text-xs text-[color:var(--texte-doux)]">
              Vos réglages restent enregistrés dans ce navigateur.
            </p>
          </div>

          <div className="space-y-4 p-4">
            <Group label="Thème">
              <Choice
                options={[
                  { value: "clair", label: "Clair", icon: "Sun" },
                  { value: "sombre", label: "Sombre", icon: "Moon" },
                  { value: "systeme", label: "Système", icon: "Gauge" },
                ]}
                value={prefs.theme}
                onChange={(value) => set("theme", value as Prefs["theme"])}
                name="theme"
              />
            </Group>

            <Group label="Taille du texte">
              <Choice
                options={[
                  { value: "normal", label: "A" },
                  { value: "grand", label: "A+" },
                  { value: "tres-grand", label: "A++" },
                ]}
                value={prefs.taille}
                onChange={(value) => set("taille", value as Prefs["taille"])}
                name="taille"
              />
            </Group>

            <Toggle
              label="Contraste renforcé"
              hint="Noir et blanc appuyés, liens soulignés."
              checked={prefs.contraste === "fort"}
              onChange={(checked) => set("contraste", checked ? "fort" : "normal")}
            />

            <Toggle
              label="Espacement confort"
              hint="Interlignes et espaces élargis, utile en cas de dyslexie."
              checked={prefs.lecture === "confort"}
              onChange={(checked) => set("lecture", checked ? "confort" : "normal")}
            />

            <Toggle
              label="Réduire les animations"
              hint="Supprime les apparitions et les transitions."
              checked={prefs.animations === "off"}
              onChange={(checked) => set("animations", checked ? "off" : "on")}
            />

            <div className="flex items-center justify-between border-t border-[color:var(--bordure)] pt-3">
              <button
                type="button"
                onClick={() => setPrefs(DEFAULTS)}
                className="text-xs font-semibold text-azur-600 hover:underline dark:text-azur-200"
              >
                Réinitialiser
              </button>
              <Link
                href="/accessibilite"
                className="text-xs text-[color:var(--texte-doux)] hover:underline"
              >
                Déclaration d'accessibilité
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-2 text-xs font-bold tracking-wide uppercase text-[color:var(--texte-doux)]">
        {label}
      </legend>
      {children}
    </fieldset>
  );
}

function Choice({
  options,
  value,
  onChange,
  name,
}: {
  options: Array<{ value: string; label: string; icon?: string }>;
  value: string;
  onChange: (value: string) => void;
  name: string;
}) {
  return (
    <div className="flex gap-1.5">
      {options.map((option) => (
        <label
          key={option.value}
          className={cn(
            "flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-field border px-2 py-2 text-xs font-semibold transition-colors",
            value === option.value
              ? "border-azur-500 bg-azur-50 text-azur-700 dark:bg-azur-900/50 dark:text-white"
              : "border-[color:var(--bordure)] hover:bg-[color:var(--surface-alt)]",
          )}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="sr-only"
          />
          {option.icon ? <Icon name={option.icon} className="size-3.5" /> : null}
          {option.label}
        </label>
      ))}
    </div>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-3">
      <span className="min-w-0">
        <span className="block text-sm font-semibold">{label}</span>
        {hint ? (
          <span className="mt-0.5 block text-xs text-[color:var(--texte-doux)]">{hint}</span>
        ) : null}
      </span>
      <span className="relative mt-0.5 shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden
          className="block h-6 w-11 rounded-full bg-[color:var(--surface-sunken)] ring-1 ring-inset ring-[color:var(--bordure)] transition-colors peer-checked:bg-azur-500 peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-dore-500"
        />
        <span
          aria-hidden
          className="absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-douce peer-checked:translate-x-5"
        />
      </span>
    </label>
  );
}
