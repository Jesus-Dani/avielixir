import crypto from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "avi_admin_session";
const SESSION_MESSAGE = "admin-authenticated";

function sign(password: string) {
  return crypto.createHmac("sha256", password).update(SESSION_MESSAGE).digest("hex");
}

export function checkAdminPassword(password: string) {
  const expected = process.env.ADMIN_PASSWORD;
  return !!expected && password === expected;
}

export async function createAdminSession() {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) throw new Error("ADMIN_PASSWORD is not configured");

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, sign(expected), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function isAdminAuthenticated() {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;

  const cookieStore = await cookies();
  const value = cookieStore.get(COOKIE_NAME)?.value;
  if (!value) return false;

  const expectedSignature = Buffer.from(sign(expected));
  const actualSignature = Buffer.from(value);
  if (expectedSignature.length !== actualSignature.length) return false;

  return crypto.timingSafeEqual(expectedSignature, actualSignature);
}
