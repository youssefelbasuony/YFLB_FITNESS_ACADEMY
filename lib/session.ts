import { headers } from "next/headers";
import { auth } from "./auth";

export async function currentSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function requireUser() {
  const session = await currentSession();
  return session?.user ?? null;
}

export function requestHasSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const requestUrl = new URL(request.url);
    const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0].trim();
    const host = forwardedHost || request.headers.get("host");
    const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0].trim();
    const protocol = forwardedProto || requestUrl.protocol.replace(":", "");
    const actualOrigin = host ? new URL(`${protocol}://${host}`).origin : requestUrl.origin;
    return new URL(origin).origin === actualOrigin;
  } catch {
    return false;
  }
}
