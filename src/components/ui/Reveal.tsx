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
 * L'animation est purement décorative, et le masquage initial est porté par la
 * feuille de styles sous la classe `html.anim` : celle-ci n'est posée que si
 * JavaScript s'exécute et que les animations sont souhaitées. Sans script, ou
 * avec les animations réduites, le contenu s'affiche normalement — il n'est
 * jamais rendu invisible par une animation qui ne se déclencherait pas.
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

    // Déjà dans le champ de vision au montage — arrivée sur une ancre, position
    // de défilement restaurée, page courte : on affiche sans attendre
    // l'observateur, qui pourrait ne jamais recevoir de nouvelle intersection.
    const rect = element.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
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

    // Filet de sécurité : un défilement très rapide, un changement d'onglet ou
    // un redimensionnement peuvent faire manquer l'intersection. Passé ce
    // délai, mieux vaut un contenu affiché sans animation qu'un vide.
    const secours = window.setTimeout(() => {
      const box = element.getBoundingClientRect();
      if (box.top < window.innerHeight && box.bottom > 0) {
        setVisible(true);
        observer.disconnect();
      }
    }, 1200);

    return () => {
      window.clearTimeout(secours);
      observer.disconnect();
    };
  }, []);

  return (
    <Tag
      // @ts-expect-error — la référence est polymorphe selon la balise rendue
      ref={ref}
      data-visible={visible ? "oui" : "non"}
      data-sens={direction}
      style={visible && delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={cn("revele", className)}
    >
      {children}
    </Tag>
  );
}
