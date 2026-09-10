import { resolveIcon } from "@/components/ui/icons";

type IconProps = {
  name?: string | null;
  className?: string;
  strokeWidth?: number;
  /** Icône affichée si `name` est vide ou inconnu. */
  fallback?: string;
  /** Libellé accessible ; sans lui, l'icône est purement décorative. */
  label?: string;
};

/**
 * Affiche une icône à partir de son nom.
 *
 * Les icônes décoratives sont masquées aux technologies d'assistance ; celles
 * qui portent une information reçoivent un rôle et un libellé.
 */
export function Icon({ name, className = "size-5", strokeWidth = 1.75, fallback, label }: IconProps) {
  const Component = resolveIcon(name) ?? resolveIcon(fallback);
  if (!Component) return null;
  return (
    <Component
      className={className}
      strokeWidth={strokeWidth}
      aria-hidden={label ? undefined : true}
      role={label ? "img" : undefined}
      aria-label={label}
    />
  );
}
