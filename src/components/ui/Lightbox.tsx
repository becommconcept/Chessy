"use client";

import { useCallback, useEffect, useState } from "react";

import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

export type LightboxImage = { url: string; alt: string; caption?: string };

/**
 * Galerie avec agrandissement au clic.
 *
 * La visionneuse piège le focus, se ferme avec Échap et se parcourt aux
 * flèches. Les vignettes restent de simples boutons : la galerie est
 * consultable sans JavaScript, chaque image étant présente dans le document.
 */
export function Lightbox({
  images,
  layout = "mosaique",
}: {
  images: LightboxImage[];
  layout?: "mosaique" | "grille" | "bande";
}) {
  const [index, setIndex] = useState<number | null>(null);

  const close = useCallback(() => setIndex(null), []);
  const next = useCallback(
    () => setIndex((current) => (current === null ? null : (current + 1) % images.length)),
    [images.length],
  );
  const previous = useCallback(
    () =>
      setIndex((current) =>
        current === null ? null : (current - 1 + images.length) % images.length,
      ),
    [images.length],
  );

  useEffect(() => {
    if (index === null) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") next();
      if (event.key === "ArrowLeft") previous();
    };

    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [index, close, next, previous]);

  if (images.length === 0) return null;

  const current = index === null ? null : images[index];

  return (
    <>
      <ul
        className={cn(
          layout === "bande"
            ? "-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3"
            : "grid gap-3 sm:gap-4",
          layout === "mosaique" && "grid-cols-2 lg:grid-cols-4",
          layout === "grille" && "grid-cols-2 sm:grid-cols-3",
        )}
      >
        {images.map((image, position) => (
          <li
            key={`${image.url}-${position}`}
            className={cn(
              layout === "bande" && "w-64 shrink-0 snap-start sm:w-80",
              layout === "mosaique" && position % 5 === 0 && "col-span-2 row-span-2",
            )}
          >
            <button
              type="button"
              onClick={() => setIndex(position)}
              className="group relative block h-full w-full overflow-hidden rounded-card bg-[color:var(--surface-sunken)]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.url}
                alt={image.alt}
                loading="lazy"
                className={cn(
                  "h-full w-full object-cover transition-transform duration-500 ease-douce group-hover:scale-105",
                  layout === "mosaique" && position % 5 === 0 ? "aspect-square" : "aspect-4/3",
                )}
              />
              <span className="absolute inset-0 bg-azur-900/0 transition-colors duration-300 group-hover:bg-azur-900/25" />
              <span className="absolute right-2.5 bottom-2.5 flex size-8 items-center justify-center rounded-full bg-white/85 text-azur-800 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <Icon name="Search" className="size-4" />
              </span>
              {image.caption ? (
                <span className="absolute inset-x-0 bottom-0 bg-linear-to-t from-azur-950/85 to-transparent p-3 pt-8 text-left text-xs font-medium text-white">
                  {image.caption}
                </span>
              ) : null}
              <span className="sr-only">Agrandir : {image.alt}</span>
            </button>
          </li>
        ))}
      </ul>

      {current ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={current.caption || current.alt}
          className="animate-apparition fixed inset-0 z-100 flex items-center justify-center bg-azur-950/94 p-4 backdrop-blur-sm"
          onClick={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <button
            type="button"
            onClick={close}
            autoFocus
            className="absolute top-4 right-4 flex size-11 items-center justify-center rounded-full bg-white/12 text-white transition-colors hover:bg-white/25"
          >
            <Icon name="X" className="size-5" />
            <span className="sr-only">Fermer la visionneuse</span>
          </button>

          {images.length > 1 ? (
            <>
              <button
                type="button"
                onClick={previous}
                className="absolute left-3 flex size-11 items-center justify-center rounded-full bg-white/12 text-white transition-colors hover:bg-white/25 sm:left-6"
              >
                <Icon name="ChevronLeft" className="size-6" />
                <span className="sr-only">Image précédente</span>
              </button>
              <button
                type="button"
                onClick={next}
                className="absolute right-3 flex size-11 items-center justify-center rounded-full bg-white/12 text-white transition-colors hover:bg-white/25 sm:right-6"
              >
                <Icon name="ChevronRight" className="size-6" />
                <span className="sr-only">Image suivante</span>
              </button>
            </>
          ) : null}

          <figure className="animate-echelle max-h-full w-full max-w-5xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current.url}
              alt={current.alt}
              className="mx-auto max-h-[76vh] w-auto rounded-card object-contain shadow-menu"
            />
            <figcaption className="mt-4 text-center text-sm text-white/80">
              {current.caption || current.alt}
              <span className="mt-1 block text-xs text-white/55">
                Image {index! + 1} sur {images.length}
              </span>
            </figcaption>
          </figure>
        </div>
      ) : null}
    </>
  );
}
