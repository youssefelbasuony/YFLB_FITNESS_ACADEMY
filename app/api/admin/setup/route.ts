import { NextResponse } from "next/server";
import { claimLocalAdmin } from "@/lib/admin-security";
import { requestHasSameOrigin, requireUser } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!requestHasSameOrigin(request)) {
    return NextResponse.json({ error: "تعذّر التحقق من مصدر الطلب." }, { status: 403 });
  }
  if (process.env.NODE_ENV !== "development" || process.env.ADMIN_EMAIL?.trim()) {
    return NextResponse.json({ error: "إعداد المالك المحلي غير متاح." }, { status: 404 });
  }

  const user = await requireUser();
  if (!user) return NextResponse.json({ error: "سجّل الدخول أولاً." }, { status: 401 });
  if (!await claimLocalAdmin(user)) {
    return NextResponse.json({ error: "تم إعداد حساب المالك بالفعل." }, { status: 409 });
  }

  return NextResponse.json({ ownerConfigured: true });
}
