/**
 * Génère un cookie de session valide pour un compte donné.
 *
 * Utilisé pour vérifier le back-office sans passer par le formulaire de
 * connexion (contrôles automatisés, diagnostic). N'a d'intérêt qu'en
 * développement : la clé de signature de production ne doit jamais servir ici.
 */
import { PrismaClient } from "@prisma/client";

import { SESSION_COOKIE, signSessionToken } from "../src/lib/session";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2] ?? "admin@chessy69.fr";
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`Aucun compte pour ${email}`);
    process.exit(1);
  }

  const token = await signSessionToken(
    { sub: user.id, email: user.email, name: user.name, role: user.role },
    3600,
  );

  console.log(`${SESSION_COOKIE}=${token}`);
}

main().finally(() => prisma.$disconnect());
