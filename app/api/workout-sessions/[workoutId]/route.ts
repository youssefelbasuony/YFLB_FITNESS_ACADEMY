import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requestHasSameOrigin, requireUser } from "@/lib/session";
const schema=z.object({workoutId:z.string().min(1).max(80).regex(/^[a-z0-9-]+$/)});
export const runtime="nodejs";
export async function PUT(request:Request,context:{params:Promise<{workoutId:string}>}){
 if(!requestHasSameOrigin(request))return NextResponse.json({error:"Invalid request origin."},{status:403});
 const user=await requireUser();if(!user)return NextResponse.json({error:"سجّل دخولك عشان تحفظ تقدمك."},{status:401});
 const parsed=schema.safeParse(await context.params);if(!parsed.success)return NextResponse.json({error:"الخطة غير صالحة."},{status:400});
 if(!await db.get("SELECT id FROM workouts WHERE id=?", [parsed.data.workoutId]))return NextResponse.json({error:"الخطة غير موجودة."},{status:404});
 await db.run("INSERT INTO workout_completions(user_id,workout_id) VALUES (?,?) ON CONFLICT(user_id,workout_id) DO UPDATE SET completed_at=CURRENT_TIMESTAMP", [user.id,parsed.data.workoutId]);
 return NextResponse.json({completed:true,workoutId:parsed.data.workoutId});
}
export async function DELETE(request:Request,context:{params:Promise<{workoutId:string}>}){
 if(!requestHasSameOrigin(request))return NextResponse.json({error:"Invalid request origin."},{status:403});
 const user=await requireUser();if(!user)return NextResponse.json({error:"سجّل دخولك عشان تعدل تقدمك."},{status:401});
 const parsed=schema.safeParse(await context.params);if(!parsed.success)return NextResponse.json({error:"الخطة غير صالحة."},{status:400});
 await db.run("DELETE FROM workout_completions WHERE user_id=? AND workout_id=?", [user.id,parsed.data.workoutId]);
 return NextResponse.json({completed:false,workoutId:parsed.data.workoutId});
}
