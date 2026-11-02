import { NextResponse } from "next/server";
import { currentSession } from "@/lib/session";
import { getCatalog, getMemberState } from "@/lib/repository";
import { hasAdminAccess, isConfiguredAdmin } from "@/lib/admin-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const catalog = await getCatalog();
    const session = await currentSession();
    const user = session?.user ?? null;
    const member = user ? await getMemberState(user.id) : { savedMachineIds:[], completedWorkoutIds:[] };
    return NextResponse.json({ ...catalog, user:user ? { id:user.id,name:user.name,email:user.email,isAdmin:Boolean(await isConfiguredAdmin(user) && await hasAdminAccess(user.id)) } : null, ...member });
  } catch (error) {
    console.error("Bootstrap failed", error);
    return NextResponse.json({ error:"Database is not ready. Run npm run db:setup." }, { status:500 });
  }
}
