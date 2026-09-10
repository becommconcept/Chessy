/**
 * Signature et vérification du jeton de session.
 *
 * Ce module n'importe ni Prisma ni `next/headers` : il est utilisable depuis
 * le middleware (runtime Edge) comme depuis le serveur Node.
 */
import { jwtVerify, SignJWT } from "jose";

export const SESSION_COOKIE = "chessy_session";

export type SessionPayload = {
  sub: string;
  email: string;
  name: string;
  role: string;
};

function secretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 24) {
    throw new Error(
      "AUTH_SECRET manquant ou trop court : définissez une clé de 32 caractères minimum dans .env",
    );
  }
  return new TextEncoder().encode(secret);
}

export async function signSessionToken(payload: SessionPayload, maxAgeSeconds: number): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${maxAgeSeconds}s`)
    .sign(secretKey());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    if (typeof payload.sub !== "string") return null;
    return {
      sub: payload.sub,
      email: String(payload.email ?? ""),
      name: String(payload.name ?? ""),
      role: String(payload.role ?? "EDITEUR"),
    };
  } catch {
    return null;
  }
}
