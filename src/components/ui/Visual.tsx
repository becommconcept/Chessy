import Image from "next/image";

import { cn } from "@/lib/utils";

export type VisualSource = {
  url: string;
  alt?: string;
  width?: number | null;
  height?: number | null;
} | null | undefined;

const RATIOS = {
  "16/9": "aspect-video",
  "4/3": "aspect-4/3",
  "3/2": "aspect-3/2",
  "1/1": "aspect-square",
  "21/9": "aspect-21/9",
  libre: "",
} as const;

/**
 * Affiche une image issue de la médiathèque.
 *
 * Les visuels de démonstration sont des SVG générés à la volée : ils sont
 * rendus tels quels, l'optimiseur d'images de Next.js n'apportant rien sur ce
 * format. Les photographies téléversées par la mairie passent, elles, par
 * `next/image` (redimensionnement, AVIF/WebP, chargement différé).
 */
export function Visual({
  source,
  alt,
  ratio = "16/9",
  className,
  imageClassName,
  priority = false,
  sizes = "(min-width: 1024px) 50vw, 100vw",
  fallbackLabel,
}: {
  source: VisualSource;
  alt?: string;
  ratio?: keyof typeof RATIOS;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  sizes?: string;
  fallbackLabel?: string;
}) {
  const label = alt ?? source?.alt ?? "";

  if (!source?.url) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-linear-135 from-azur-100 to-dore-100 text-azur-400 dark:from-azur-900 dark:to-azur-800",
          RATIOS[ratio],
          className,
        )}
      >
        {fallbackLabel ? (
          <span className="px-4 text-center text-xs font-semibold tracking-wide uppercase">
            {fallbackLabel}
          </span>
        ) : null}
      </div>
    );
  }

  const isVector = source.url.endsWith(".svg") || source.url.startsWith("/api/visuel");

  return (
    <div className={cn("relative overflow-hidden bg-[color:var(--surface-sunken)]", RATIOS[ratio], className)}>
      {isVector ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={source.url}
          alt={label}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className={cn("h-full w-full object-cover", imageClassName)}
        />
      ) : (
        <Image
          src={source.url}
          alt={label}
          fill
          sizes={sizes}
          priority={priority}
          className={cn("object-cover", imageClassName)}
        />
      )}
    </div>
  );
}
