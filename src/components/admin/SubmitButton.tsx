"use client";

import { useFormStatus } from "react-dom";

import { Button, type ButtonVariant } from "@/components/ui/Button";

/** Bouton de soumission qui affiche l'état d'envoi du formulaire parent. */
export function SubmitButton({
  children,
  pendingLabel = "Enregistrement…",
  icon = "Save",
  variant = "principal",
  size = "md",
  fullWidth,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  icon?: string;
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      disabled={pending}
      icon={pending ? "Loader2" : icon}
      className={pending ? "[&_svg]:animate-spin" : undefined}
    >
      {pending ? pendingLabel : children}
    </Button>
  );
}
