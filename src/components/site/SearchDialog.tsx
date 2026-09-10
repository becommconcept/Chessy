"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Icon } from "@/components/ui/Icon";
import { SEARCH_TYPE_LABELS, type SearchResult } from "@/lib/search";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  { label: "Réserver la salle des fêtes", href: "/services/salle-des-fetes", icon: "PartyPopper" },
  { label: "Acte de naissance", href: "/demarches/acte-de-naissance", icon: "FileText" },
  { label: "Inscription scolaire", href: "/demarches/inscription-scolaire", icon: "GraduationCap" },
  { label: "Déclaration de travaux", href: "/demarches/declaration-prealable-travaux", icon: "Hammer" },
  { label: "Signaler un problème", href: "/services/signalement", icon: "TriangleAlert" },
  { label: "Le patrimoine minier", href: "/cadre-de-vie/patrimoine", icon: "Pickaxe" },
];

/**
 * Recherche rapide, ouverte par la loupe ou le raccourci Ctrl/⌘ + K.
 *
 * Motif ARIA « combobox » : la zone de saisie annonce la liste de résultats,
 * qui se parcourt aux flèches et se valide avec Entrée.
 */
export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setActive(0);
      // Laisse le temps au dialogue de se monter avant de donner le focus.
      const timer = setTimeout(() => inputRef.current?.focus(), 30);
      return () => clearTimeout(timer);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/recherche?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        const data = (await response.json()) as { results: SearchResult[] };
        setResults(data.results ?? []);
        setActive(0);
      } catch {
        // Requête annulée ou réseau indisponible : on garde l'affichage courant.
      } finally {
        setLoading(false);
      }
    }, 220);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, open]);

  if (!open) return null;

  const go = (href: string) => {
    onClose();
    if (href.startsWith("/uploads") || href.startsWith("http")) {
      window.open(href, "_blank", "noopener");
    } else {
      router.push(href);
    }
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((index) => Math.min(index + 1, Math.max(results.length - 1, 0)));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => Math.max(index - 1, 0));
    }
    if (event.key === "Enter") {
      event.preventDefault();
      if (results[active]) go(results[active].href);
      else if (query.trim().length >= 2) go(`/recherche?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Rechercher sur le site"
      className="animate-apparition fixed inset-0 z-90 flex items-start justify-center p-4 pt-[8vh] sm:pt-[12vh]"
    >
      <button
        type="button"
        aria-label="Fermer la recherche"
        onClick={onClose}
        className="absolute inset-0 bg-azur-950/55 backdrop-blur-sm"
      />

      <div className="animate-echelle relative w-full max-w-2xl overflow-hidden rounded-card border border-[color:var(--bordure)] bg-[color:var(--surface)] shadow-menu">
        <div className="flex items-center gap-3 border-b border-[color:var(--bordure)] px-4">
          <Icon name="Search" className="size-5 shrink-0 text-azur-500" />
          <input
            ref={inputRef}
            type="search"
            role="combobox"
            aria-expanded={results.length > 0}
            aria-controls="resultats-recherche"
            aria-autocomplete="list"
            aria-activedescendant={results[active] ? `resultat-${active}` : undefined}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Rechercher une démarche, une page, une actualité…"
            className="h-14 w-full bg-transparent text-[1.0625rem] outline-none placeholder:text-[color:var(--texte-doux)]/70"
          />
          {loading ? (
            <Icon name="Loader2" className="size-4 shrink-0 animate-spin text-azur-500" />
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="hidden shrink-0 rounded border border-[color:var(--bordure)] px-1.5 py-0.5 text-[0.6875rem] font-semibold text-[color:var(--texte-doux)] sm:block"
          >
            Échap
          </button>
        </div>

        <div className="max-h-[58vh] overflow-y-auto">
          {query.trim().length < 2 ? (
            <div className="p-4">
              <p className="mb-2.5 px-1 text-xs font-bold tracking-wide uppercase text-[color:var(--texte-doux)]">
                Recherches fréquentes
              </p>
              <ul className="grid gap-1 sm:grid-cols-2">
                {SUGGESTIONS.map((suggestion) => (
                  <li key={suggestion.href}>
                    <button
                      type="button"
                      onClick={() => go(suggestion.href)}
                      className="flex w-full items-center gap-2.5 rounded-field px-3 py-2.5 text-left text-sm transition-colors hover:bg-[color:var(--surface-alt)]"
                    >
                      <Icon name={suggestion.icon} className="size-4 shrink-0 text-azur-500" />
                      {suggestion.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : results.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Icon name="Search" className="mx-auto mb-3 size-8 text-[color:var(--texte-doux)]/50" />
              <p className="font-semibold">Aucun résultat pour « {query} »</p>
              <p className="mx-auto mt-1.5 max-w-sm text-sm text-[color:var(--texte-doux)]">
                Essayez avec un autre mot, ou contactez l'accueil de la mairie : nous vous orienterons.
              </p>
            </div>
          ) : (
            <ul id="resultats-recherche" role="listbox" className="p-2">
              {results.map((result, index) => (
                <li key={`${result.href}-${index}`} role="none">
                  <button
                    type="button"
                    id={`resultat-${index}`}
                    role="option"
                    aria-selected={index === active}
                    onMouseEnter={() => setActive(index)}
                    onClick={() => go(result.href)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-field p-3 text-left transition-colors",
                      index === active ? "bg-azur-50 dark:bg-azur-900/40" : "hover:bg-[color:var(--surface-alt)]",
                    )}
                  >
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-[color:var(--surface-sunken)] text-azur-600 dark:text-azur-200">
                      <Icon name={result.icon} className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold">{result.title}</span>
                        <span className="rounded-full bg-[color:var(--surface-sunken)] px-2 py-0.5 text-[0.6875rem] font-semibold text-[color:var(--texte-doux)]">
                          {SEARCH_TYPE_LABELS[result.type]}
                        </span>
                      </span>
                      {result.excerpt ? (
                        <span className="mt-0.5 block line-clamp-2 text-xs leading-snug text-[color:var(--texte-doux)]">
                          {result.excerpt}
                        </span>
                      ) : null}
                    </span>
                    <Icon name="ArrowRight" className="mt-2 size-4 shrink-0 opacity-40" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {query.trim().length >= 2 ? (
          <div className="border-t border-[color:var(--bordure)] bg-[color:var(--surface-alt)] px-4 py-2.5">
            <button
              type="button"
              onClick={() => go(`/recherche?q=${encodeURIComponent(query)}`)}
              className="flex w-full items-center justify-between text-sm font-semibold text-azur-600 dark:text-azur-200"
            >
              Voir tous les résultats pour « {query} »
              <Icon name="ArrowRight" className="size-4" />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
