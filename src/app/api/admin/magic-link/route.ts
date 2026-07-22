import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
export async function POST(request:Request){const parsed=z.object({email:z.email()}).safeParse(await request.json().catch(()=>null));const generic="허용된 관리자 이메일이면 로그인 링크를 보냈습니다.";if(!parsed.success)return NextResponse.json({message:generic});const allowed=new Set((process.env.ADMIN_ALLOWLIST_EMAILS??'').split(',').map(v=>v.trim().toLowerCase()).filter(Boolean));if(!allowed.has(parsed.data.email.toLowerCase()))return NextResponse.json({message:generic});const supabase=await createSupabaseServerClient();if(!supabase)return NextResponse.json({error:"Supabase 환경 설정이 필요합니다."},{status:503});const origin=new URL(request.url).origin;await supabase.auth.signInWithOtp({email:parsed.data.email,options:{shouldCreateUser:false,emailRedirectTo:`${origin}/auth/callback?next=/admin`}});return NextResponse.json({message:generic})}

