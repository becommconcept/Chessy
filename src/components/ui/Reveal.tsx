"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type RevealProps = {
  children: ReactNode;
  /** Décalage d'apparition, en millisecondes. */
  delay?: number;
  direction?: "bas" | "haut" | "gauche" | "droite" | "aucune";
  className?: string;
  as?: "div" | "section" | "li" | "article";
};

/**
 * Révèle son contenu lorsqu'il entre dans le champ de vision.
 *
 * L'animation est purement décorative : le contenu est présent dans le DOM dès
 * le rendu serveur (donc indexable et accessible), et l'effet est neutralisé
 * lorsque l'utilisateur a demandé la réduction des animations.
 */
export function Reveal({
  children,
  delay = 0,
  direction = "bas",
  className,
  as: Tag = "div",
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const reduced =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      document.documentElement.dataset.animations === "off";
    if (reduced) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const hidden =
    direction === "bas"
      ? "translate-y-7"
      : direction === "haut"
        ? "-translate-y-5"
        : direction === "gauche"
          ? "-translate-x-7"
          : direction === "droite"
            ? "translate-x-7"
            : "";

  return (
    <Tag
      // @ts-expect-error — la référence est polymorphe selon la balise rendue
      ref={ref}
      style={visible && delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={cn(
        "transition-[opacity,transform] duration-700 ease-douce will-change-[opacity,transform]",
        visible ? "translate-none opacity-100" : cn("opacity-0", hidden),
        className,
      )}
    >
      {children}
    </Tag>
  );
}
