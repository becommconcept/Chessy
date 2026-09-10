import "server-only";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import { type Role } from "@/lib/enums";
import { verifySessionToken, signSessionToken, SESSION_COOKIE } from "@/lib/session";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
};

const SESSION_MAX_AGE = 60 * 60 * 12; // 12 heures

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 11);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/** Vérifie les identifiants et ouvre une session (cookie httpOnly signé). */
export async function login(
  email: string,
  password: string,
): Promise<{ ok: true; user: SessionUser } | { ok: false; error: string }> {
  const normalized = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalized } });

  // Message volontairement identique dans les deux cas pour ne pas révéler
  // l'existence d'un compte.
  const genericError = "Identifiants incorrects.";
  if (!user || !user.active) {
    await bcrypt.compare(password, "$2a$11$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidin");
    return { ok: false, error: genericError };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return { ok: false, error: genericError };

  const token = await signSessionToken(
    { sub: user.id, email: user.email, name: user.name, role: user.role },
    SESSION_MAX_AGE,
  );

  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await prisma.auditLog.create({
    data: { userId: user.id, action: "LOGIN", entity: "User", entityId: user.id, label: user.email },
  });

  return {
    ok: true,
    user: { id: user.id, email: user.email, name: user.name, role: user.role as Role },
  };
}

export async function logout(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/** Session courante, ou `null` si l'utilisateur n'est pas connecté. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const payload = await verifySessionToken(token);
  if (!payload) return null;

  // On revalide en base : un compte désactivé perd immédiatement l'accès.
  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, name: true, role: true, active: true },
  });
  if (!user || !user.active) return null;

  return { id: user.id, email: user.email, name: user.name, role: user.role as Role };
}

/** Exige une session, sinon redirige vers la page de connexion. */
export async function requireUser(returnTo?: string): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    redirect(`/connexion${returnTo ? `?suite=${encodeURIComponent(returnTo)}` : ""}`);
  }
  return user;
}

/** Exige une session dont le rôle figure parmi ceux autorisés. */
export async function requireRole(roles: Role[], returnTo?: string): Promise<SessionUser> {
  const user = await requireUser(returnTo);
  if (!roles.includes(user.role)) redirect("/admin?acces=refuse");
  return user;
}

/** Droits fonctionnels dérivés du rôle. */
export const can = {
  editContent: (role: Role) => role === "ADMIN" || role === "EDITEUR",
  handleRequests: (role: Role) => role === "ADMIN" || role === "AGENT" || role === "EDITEUR",
  manageSettings: (role: Role) => role === "ADMIN",
  manageUsers: (role: Role) => role === "ADMIN",
};

/** Enregistre une action dans le journal d'audit. */
export async function recordAudit(input: {
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  label?: string | null;
  detail?: string | null;
}): Promise<void> {
  await prisma.auditLog.create({
    data: {
      userId: input.userId ?? null,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId ?? null,
      label: input.label ?? null,
      detail: input.detail ?? null,
    },
  });
}
