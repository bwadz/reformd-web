import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

export const runtime = "nodejs";

function sha256Hex(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error("Missing env SUPABASE_URL");
  if (!serviceRoleKey) throw new Error("Missing env SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, serviceRoleKey, { auth: { persistSession: false } });
}

export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);
  const token = (searchParams.get("token") || "").trim();
  if (!token) return NextResponse.redirect(`${origin}/?verified=missing`);

  const tokenHash = sha256Hex(token);
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("waitlist")
    .update({
      verified_at: new Date().toISOString(), // IMPORTANT: column must be verified_at
    })
    .eq("verification_token_hash", tokenHash)
    // expiry is currently NULL in your DB; treat NULL as valid for now
    .or(
      `verification_expires_at.is.null,verification_expires_at.gt.${new Date().toISOString()}`,
    )
    .is("verified_at", null)
    .select("email")
    .maybeSingle();

  if (error) {
    console.error("verify error", error);
    return NextResponse.redirect(`${origin}/?verified=error`);
  }

  if (!data?.email) {
    return NextResponse.redirect(`${origin}/?verified=invalid`);
  }

  return NextResponse.redirect(`${origin}/?verified=success`);
}
