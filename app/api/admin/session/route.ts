import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { ADMIN_COOKIE, ADMIN_SESSION_SECONDS, createAdminCookieValue, isConfiguredAdmin, verifyAdminAccessKey } from "@/lib/admin-security";
import { requestHasSameOrigin, requireUser } from "@/lib/session";

export const runtime = "nodejs";
const payloadSchema = z.object({ accessKey: z.string().min(32).max(256) });

export async function POST(request: Request) {
  if (!requestHasSameOrigin(request)) return NextResponse.json({ error: "تعذّر التحقق من مصدر الطلب." }, { status: 403 });
  const user = await requireUser();
  if (!user || !await isConfiguredAdmin(user)) return NextResponse.json({ error: "بيانات الدخول الإدارية غير صحيحة." }, { status: 403 });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "أدخل مفتاح الإدارة." }, { status: 400 }); }
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success || !verifyAdminAccessKey(parsed.data.accessKey)) {
    return NextResponse.json({ error: "بيانات الدخول الإدارية غير صحيحة." }, { status: 403 });
  }

  (await cookies()).set(ADMIN_COOKIE, createAdminCookieValue(user.id), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: ADMIN_SESSION_SECONDS,
  });
  return NextResponse.json({ authenticated: true });
}

export async function DELETE(request: Request) {
  if (!requestHasSameOrigin(request)) return NextResponse.json({ error: "تعذّر التحقق من مصدر الطلب." }, { status: 403 });
  (await cookies()).delete(ADMIN_COOKIE);
  return NextResponse.json({ authenticated: false });
}
