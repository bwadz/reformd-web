import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function GET() {
  return new Response("GET alive", { status: 200 });
}

export async function POST(req: Request) {
  console.log("POST HIT");
  return new Response("POST alive", { status: 200 });
}

// function sha256Hex(input: string) {
//   return crypto.createHash("sha256").update(input).digest("hex");
// }

// function getSupabaseAdmin() {
//   const url = process.env.SUPABASE_URL;
//   const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

//   if (!url) throw new Error("Missing env SUPABASE_URL");
//   if (!serviceRoleKey) throw new Error("Missing env SUPABASE_SERVICE_ROLE_KEY");

//   return createClient(url, serviceRoleKey, { auth: { persistSession: false } });
// }

// function getSiteUrl(req: Request) {
//   const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
//   if (envUrl) return envUrl.replace(/\/+$/, "");
//   return new URL(req.url).origin;
// }

// export async function GET(req: Request) {
//   const url = new URL(req.url);
//   const token = (url.searchParams.get("token") || "").trim();
//   const base = getSiteUrl(req);

//   if (!token) return NextResponse.redirect(`${base}/?verified=missing`);

//   const tokenHash = sha256Hex(token);
//   const supabase = getSupabaseAdmin();
//   const nowIso = new Date().toISOString();

//   // Update the matching row if token hash matches and not expired
//   const { data, error } = await supabase
//     .from("waitlist")
//     .update({
//       verified: true, // <-- THIS fixes your "verified=false"
//       verified_at: nowIso,
//       verification_token_hash: null, // optional cleanup
//       verification_expires_at: null, // optional cleanup
//     })
//     .eq("verification_token_hash", tokenHash)
//     .gt("verification_expires_at", nowIso)
//     .select("email")
//     .maybeSingle();

//   if (error) {
//     console.error("verify error:", error);
//     return NextResponse.redirect(`${base}/?verified=error`);
//   }

//   if (!data?.email) {
//     return NextResponse.redirect(`${base}/?verified=invalid`);
//   }

//   return NextResponse.redirect(`${base}/?verified=success`);
// }
