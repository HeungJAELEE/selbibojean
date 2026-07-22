import type { Metadata } from "next";
import { AdminLogin } from "@/components/admin-login";
import { createSupabaseServerClient } from "@/lib/supabase/server";
export const metadata:Metadata={robots:{index:false,follow:false}};
export default async function AdminLayout({children}:{children:React.ReactNode}){const configured=Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL&&process.env.ADMIN_ALLOWLIST_EMAILS);if(!configured)return <>{children}</>;const supabase=await createSupabaseServerClient();const {data}=supabase?await supabase.auth.getUser():{data:{user:null}};const allowed=new Set((process.env.ADMIN_ALLOWLIST_EMAILS??'').split(',').map(v=>v.trim().toLowerCase()).filter(Boolean));if(!data.user?.email||!allowed.has(data.user.email.toLowerCase()))return <div className="page-wrap py-16"><AdminLogin/></div>;return <>{children}</>}

