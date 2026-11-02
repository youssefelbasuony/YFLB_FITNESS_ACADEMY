import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { db, databaseProvider } from "@/lib/db";
import { requireUser } from "@/lib/session";

export const ADMIN_COOKIE = "yflb_admin_session";
export const ADMIN_SESSION_SECONDS = 6 * 60 * 60;

type AdminIdentity = { id: string; email: string };
const LOCAL_OWNER_SETTING = "local_admin_owner_id";

function isLocalAdminSetupAvailable() {
  return process.env.NODE_ENV === "development" && !process.env.ADMIN_EMAIL?.trim();
}

async function getLocalOwnerId() {
  if (!isLocalAdminSetupAvailable() || databaseProvider !== "sqlite") return null;
  const row = await db.get("SELECT value FROM app_settings WHERE key=?", [LOCAL_OWNER_SETTING]) as { value: string } | undefined;
  return row?.value ?? null;
}

export async function localAdminSetupState() {
  if (!isLocalAdminSetupAvailable()) return { available: false, ownerConfigured: false };
  const ownerId = await getLocalOwnerId();
  return { available: !ownerId, ownerConfigured: Boolean(ownerId) };
}

export async function claimLocalAdmin(user: AdminIdentity) {
  if (!isLocalAdminSetupAvailable()) return false;
  if (databaseProvider !== "sqlite") return false;
  return db.transaction(async () => {
    const existing = await db.get("SELECT value FROM app_settings WHERE key=?", [LOCAL_OWNER_SETTING]) as { value: string } | undefined;
    if (existing) return existing.value === user.id;
    await db.run("INSERT INTO app_settings(key,value) VALUES(?,?)", [LOCAL_OWNER_SETTING, user.id]);
    return true;
  });
}

export async function isConfiguredAdmin(user: AdminIdentity | null | undefined) {
  const allowedEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!user) return false;
  if (allowedEmail) return user.email.toLowerCase() === allowedEmail;
  return await getLocalOwnerId() === user.id;
}

export function verifyAdminAccessKey(value: string) {
  const configured = process.env.ADMIN_ACCESS_KEY;
  if (!configured || Buffer.byteLength(configured, "utf8") < 32 || value.length > 256) return false;
  const submittedHash = createHash("sha256").update(value, "utf8").digest();
  const configuredHash = createHash("sha256").update(configured, "utf8").digest();
  return timingSafeEqual(submittedHash, configuredHash);
}

function signingKey() {
  const authSecret = process.env.BETTER_AUTH_SECRET;
  const accessKey = process.env.ADMIN_ACCESS_KEY;
  if (!authSecret || !accessKey) return null;
  return createHmac("sha256", authSecret).update("YFLB admin cookie:").update(accessKey).digest();
}

function sign(userId: string, expiresAt: number) {
  const key = signingKey();
  if (!key) throw new Error("Admin session signing is not configured.");
  return createHmac("sha256", key).update(`${userId}|${expiresAt}`).digest("base64url");
}

export function createAdminCookieValue(userId: string) {
  const expiresAt = Math.floor(Date.now() / 1000) + ADMIN_SESSION_SECONDS;
  return `${expiresAt}.${sign(userId, expiresAt)}`;
}

export async function hasAdminAccess(userId: string) {
  if (await getLocalOwnerId() === userId) return true;
  if (!process.env.ADMIN_ACCESS_KEY || !process.env.BETTER_AUTH_SECRET) return false;
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  const [expiresText, receivedSignature, ...extra] = token.split(".");
  if (extra.length || !/^\d{10}$/.test(expiresText) || !/^[\w-]{40,50}$/.test(receivedSignature)) return false;
  const expiresAt = Number(expiresText);
  const now = Math.floor(Date.now() / 1000);
  if (expiresAt <= now || expiresAt > now + ADMIN_SESSION_SECONDS + 30) return false;
  const expected = Buffer.from(sign(userId, expiresAt), "base64url");
  const actual = Buffer.from(receivedSignature, "base64url");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function requireAdminAccess() {
  const user = await requireUser();
  if (!user || !await isConfiguredAdmin(user) || !await hasAdminAccess(user.id)) return null;
  return user;
}
