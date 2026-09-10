"use client";

import { useEffect, useState } from "react";

import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

/** Bouton de retour en haut de page, révélé après un défilement notable. */
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 700);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={cn(
        "sans-impression fixed right-4 bottom-4 z-40 flex size-11 items-center justify-center rounded-full bg-azur-700 text-white shadow-relief transition-all duration-300 ease-douce hover:bg-azur-800 sm:right-6 sm:bottom-6",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
      )}
    >
      <Icon name="ArrowUp" className="size-5" />
      <span className="sr-only">Revenir en haut de la page</span>
    </button>
  );
}
