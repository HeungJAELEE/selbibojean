import { createHmac } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const parsed=z.object({password:z.string().min(8)}).safeParse(await request.json().catch(()=>null)); if(!parsed.success) return NextResponse.json({error:"비밀번호를 확인해 주세요."},{status:400});
  const supabase=await createSupabaseServerClient(); const admin=createSupabaseAdminClient(); if(!supabase||!admin) return NextResponse.json({error:"Supabase 설정이 필요합니다."},{status:503});
  const {data:auth}=await supabase.auth.getUser(); if(!auth.user) return NextResponse.json({error:"다시 로그인해 주세요."},{status:401});
  const {data:credential}=await admin.from("username_credentials").select("internal_email, username").eq("user_id",auth.user.id).single();
  if(!credential) return NextResponse.json({error:"계정을 확인할 수 없습니다."},{status:404});
  const {error:verifyError}=await supabase.auth.signInWithPassword({email:credential.internal_email,password:parsed.data.password}); if(verifyError) return NextResponse.json({error:"비밀번호를 확인해 주세요."},{status:401});
  const auditSecret=process.env.RATE_LIMIT_HMAC_SECRET ?? crypto.randomUUID(); const userHash=createHmac("sha256",auditSecret).update(`purge:${auth.user.id}`).digest("hex");
  const {data:audit,error:auditError}=await admin.from("account_purge_events").insert({anonymous_user_hash:userHash,reason:"manual",purged_at:new Date().toISOString()}).select("id").single();
  if(auditError||!audit)return NextResponse.json({error:"계정 삭제 기록을 만들지 못했습니다."},{status:500});
  const {error:deleteError}=await admin.auth.admin.deleteUser(auth.user.id);
  if(deleteError){await admin.from("account_purge_events").delete().eq("id",audit.id);return NextResponse.json({error:"계정을 삭제하지 못했습니다. 잠시 후 다시 시도해 주세요."},{status:500});}
  await supabase.auth.signOut();
  return NextResponse.json({ok:true});
}
