"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

export type AlertData = {
  id: string;
  level: "INFO" | "VIGILANCE" | "URGENCE";
  title: string;
  message: string | null;
  linkHref: string | null;
  linkLabel: string | null;
};

const STYLES = {
  INFO: {
    bar: "bg-azur-600 text-white",
    icon: "Info",
    label: "Information",
  },
  VIGILANCE: {
    bar: "bg-dore-500 text-dore-950",
    icon: "TriangleAlert",
    label: "Vigilance",
  },
  URGENCE: {
    bar: "bg-red-700 text-white",
    icon: "Megaphone",
    label: "Urgence",
  },
} as const;

const DISMISSED_KEY = "chessy-alertes-masquees";

/**
 * Bandeau d'alerte municipale.
 *
 * Le message est annoncé aux lecteurs d'écran (`role="status"`, ou
 * `role="alert"` en cas d'urgence). Les alertes d'information et de vigilance
 * peuvent être masquées par l'internaute ; une urgence reste affichée.
 */
export function AlertBanner({ alerts }: { alerts: AlertData[] }) {
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setDismissed(JSON.parse(sessionStorage.getItem(DISMISSED_KEY) ?? "[]"));
    } catch {
      setDismissed([]);
    }
    setReady(true);
  }, []);

  const dismiss = (id: string) => {
    const next = [...dismissed, id];
    setDismissed(next);
    try {
      sessionStorage.setItem(DISMISSED_KEY, JSON.stringify(next));
    } catch {
      // Stockage indisponible : le masquage reste valable pour la page courante.
    }
  };

  const visible = alerts.filter(
    (alert) => alert.level === "URGENCE" || !ready || !dismissed.includes(alert.id),
  );

  if (visible.length === 0) return null;

  return (
    <div className="sans-impression">
      {visible.map((alert) => {
        const style = STYLES[alert.level] ?? STYLES.INFO;
        return (
          <div
            key={alert.id}
            role={alert.level === "URGENCE" ? "alert" : "status"}
            className={cn("animate-glisse-bas", style.bar)}
          >
            <div className="conteneur flex items-start gap-3 py-2.5">
              <Icon name={style.icon} className="mt-0.5 size-5 shrink-0" />
              <div className="min-w-0 flex-1 text-sm">
                <p className="font-semibold">
                  <span className="mr-2 rounded bg-black/15 px-1.5 py-0.5 text-[0.625rem] font-bold tracking-wider uppercase">
                    {style.label}
                  </span>
                  {alert.title}
                </p>
                {alert.message ? (
                  <p className="mt-0.5 leading-snug opacity-90">{alert.message}</p>
                ) : null}
                {alert.linkHref ? (
                  <Link
                    href={alert.linkHref}
                    className="mt-1.5 inline-flex items-center gap-1.5 text-[0.8125rem] font-bold underline underline-offset-2"
                  >
                    {alert.linkLabel ?? "En savoir plus"}
                    <Icon name="ArrowRight" className="size-3.5" />
                  </Link>
                ) : null}
              </div>
              {alert.level !== "URGENCE" ? (
                <button
                  type="button"
                  onClick={() => dismiss(alert.id)}
                  className="-mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-black/15"
                >
                  <Icon name="X" className="size-4" />
                  <span className="sr-only">Masquer cette information</span>
                </button>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
