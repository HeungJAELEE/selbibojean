import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST() { const supabase=await createSupabaseServerClient(); if(!supabase) return NextResponse.json({ok:false},{status:503}); const {data}=await supabase.auth.getUser(); if(!data.user) return NextResponse.json({ok:false},{status:401}); await supabase.rpc("touch_account_activity"); return NextResponse.json({ok:true}); }

