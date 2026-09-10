import { prisma } from "@/lib/db";
import { buildReference, randomToken } from "@/lib/utils";

type Counter = "request" | "roomBooking" | "equipmentLoan";

/**
 * Génère une référence lisible et unique (ex. « SDF-2026-0042 ») ainsi que le
 * jeton de suivi associé.
 *
 * La séquence repart de 1 chaque année. En cas de collision — deux demandes
 * déposées dans le même instant — on réessaie avec le rang suivant.
 */
export async function nextReference(
  counter: Counter,
  prefix: string,
): Promise<{ reference: string; token: string }> {
  const year = new Date().getFullYear();

  // On repart du plus grand rang déjà attribué (et non d'un simple décompte) :
  // une suppression en base ne provoque ainsi jamais de doublon de référence.
  const where = { reference: { startsWith: `${prefix}-${year}-` } };
  const last =
    counter === "request"
      ? await prisma.request.findFirst({
          where,
          orderBy: { reference: "desc" },
          select: { reference: true },
        })
      : counter === "roomBooking"
        ? await prisma.roomBooking.findFirst({
            where,
            orderBy: { reference: "desc" },
            select: { reference: true },
          })
        : await prisma.equipmentLoan.findFirst({
            where,
            orderBy: { reference: "desc" },
            select: { reference: true },
          });

  const existing = last ? Number(last.reference.split("-").at(-1)) || 0 : 0;

  for (let attempt = 0; attempt < 25; attempt += 1) {
    const reference = buildReference(prefix, existing + 1 + attempt);
    const taken =
      counter === "request"
        ? await prisma.request.findUnique({ where: { reference }, select: { id: true } })
        : counter === "roomBooking"
          ? await prisma.roomBooking.findUnique({ where: { reference }, select: { id: true } })
          : await prisma.equipmentLoan.findUnique({ where: { reference }, select: { id: true } });
    if (!taken) return { reference, token: randomToken(28) };
  }

  // Repli improbable : référence horodatée, toujours unique.
  return { reference: `${prefix}-${year}-${Date.now().toString(36).toUpperCase()}`, token: randomToken(28) };
}

export const REFERENCE_PREFIXES = {
  CONTACT: "CTC",
  SIGNALEMENT: "SIG",
  SUGGESTION: "SUG",
  RENDEZ_VOUS: "RDV",
  SALLE: "SDF",
  MATERIEL: "MAT",
} as const;
