import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requestHasSameOrigin, requireUser } from "@/lib/session";
const schema=z.object({machineId:z.string().min(1).max(80).regex(/^[a-z0-9-]+$/)});
export const runtime="nodejs";
export async function PUT(request:Request,context:{params:Promise<{machineId:string}>}){
 if(!requestHasSameOrigin(request))return NextResponse.json({error:"Invalid request origin."},{status:403});
 const user=await requireUser();if(!user)return NextResponse.json({error:"سجّل دخولك عشان تحفظ أجهزة جيمك."},{status:401});
 const parsed=schema.safeParse(await context.params);if(!parsed.success)return NextResponse.json({error:"الجهاز غير صالح."},{status:400});
 if(!await db.get("SELECT id FROM machines WHERE id=?", [parsed.data.machineId]))return NextResponse.json({error:"الجهاز غير موجود."},{status:404});
 await db.run("INSERT INTO user_machines(user_id,machine_id) VALUES (?,?) ON CONFLICT(user_id,machine_id) DO NOTHING", [user.id,parsed.data.machineId]);
 return NextResponse.json({saved:true,machineId:parsed.data.machineId});
}
export async function DELETE(request:Request,context:{params:Promise<{machineId:string}>}){
 if(!requestHasSameOrigin(request))return NextResponse.json({error:"Invalid request origin."},{status:403});
 const user=await requireUser();if(!user)return NextResponse.json({error:"سجّل دخولك عشان تعدل أجهزتك."},{status:401});
 const parsed=schema.safeParse(await context.params);if(!parsed.success)return NextResponse.json({error:"الجهاز غير صالح."},{status:400});
 await db.run("DELETE FROM user_machines WHERE user_id=? AND machine_id=?", [user.id,parsed.data.machineId]);
 return NextResponse.json({saved:false,machineId:parsed.data.machineId});
}
