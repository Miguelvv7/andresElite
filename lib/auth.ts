import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE = "ef_admin";
const MAX_AGE = 60 * 60 * 12; // 12 horas

const secret = () => process.env.ADMIN_SESSION_SECRET || "";

export const isAdminConfigured = () =>
  Boolean(process.env.ADMIN_PASSWORD) && secret().length >= 32;

const safeEqual = (a: string, b: string) =>
  timingSafeEqual(createHash("sha256").update(a).digest(), createHash("sha256").update(b).digest());

const sign = (value: string) => createHmac("sha256", secret()).update(value).digest("base64url");

export function checkPassword(candidate: string) {
  return isAdminConfigured() && safeEqual(candidate, process.env.ADMIN_PASSWORD as string);
}

export async function startSession() {
  const expires = String(Math.floor(Date.now() / 1000) + MAX_AGE);
  (await cookies()).set(COOKIE, `${expires}.${sign(expires)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

export async function isAuthenticated() {
  if (!isAdminConfigured()) return false;
  const value = (await cookies()).get(COOKIE)?.value;
  if (!value) return false;
  const [expires, signature] = value.split(".");
  if (!expires || !signature || !safeEqual(signature, sign(expires))) return false;
  return Number(expires) > Date.now() / 1000;
}

/** Para páginas y acciones de servidor. */
export async function requireAdmin() {
  if (!(await isAuthenticated())) redirect("/admin/login");
}
