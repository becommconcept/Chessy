import { NextRequest, NextResponse } from "next/server";

import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

/**
 * Protection du back-office.
 *
 * Le middleware ne vérifie que la signature du jeton de session — il tourne
 * dans un environnement où Prisma n'est pas disponible. La vérification que le
 * compte existe toujours et reste actif est faite côté serveur, à chaque page
 * de l'espace d'administration (cf. `getSessionUser`).
 */
export async function middleware(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const payload = token ? await verifySessionToken(token) : null;

  if (!payload) {
    const url = request.nextUrl.clone();
    url.pathname = "/connexion";
    url.search = `?suite=${encodeURIComponent(request.nextUrl.pathname)}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
