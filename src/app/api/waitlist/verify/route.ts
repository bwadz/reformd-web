import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) throw new Error("Missing env SUPABASE_URL");
  if (!serviceRoleKey) throw new Error("Missing env SUPABASE_SERVICE_ROLE_KEY");

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

function sha256Hex(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function getSiteUrl(req: Request) {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (envUrl) return envUrl.replace(/\/+$/, "");
  return new URL(req.url).origin;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token = (url.searchParams.get("token") || "").trim();

    if (!token) {
      return NextResponse.redirect(
        `${getSiteUrl(req)}/?verified=0&reason=missing`,
      );
    }

    const tokenHash = sha256Hex(token);
    const supabase = getSupabaseAdmin();

    // Look up the row by token hash
    const { data: row, error: selErr } = await supabase
      .from("waitlist")
      .select("email, verified_at, verification_expires_at")
      .eq("verification_token_hash", tokenHash)
      .maybeSingle();

    if (selErr) {
      return NextResponse.redirect(`${getSiteUrl(req)}/?verified=0&reason=db`);
    }

    if (!row?.email) {
      return NextResponse.redirect(
        `${getSiteUrl(req)}/?verified=0&reason=invalid`,
      );
    }

    // Already verified — just send them home with a clean signal
    if (row.verified_at) {
      return NextResponse.redirect(`${getSiteUrl(req)}/?verified=1&already=1`);
    }

    // Expired link
    if (row.verification_expires_at) {
      const expires = new Date(row.verification_expires_at).getTime();
      if (Number.isFinite(expires) && Date.now() > expires) {
        return NextResponse.redirect(
          `${getSiteUrl(req)}/?verified=0&reason=expired`,
        );
      }
    }

    // ✅ Mark verified (set BOTH fields), and clear token fields
    const { error: upErr } = await supabase
      .from("waitlist")
      .update({
        verified: true, // <-- this is why you're still seeing verified=false
        verified_at: new Date().toISOString(),
        verification_token_hash: null,
        verification_expires_at: null,
      })
      .eq("verification_token_hash", tokenHash);

    if (upErr) {
      return NextResponse.redirect(
        `${getSiteUrl(req)}/?verified=0&reason=update`,
      );
    }

    return NextResponse.redirect(`${getSiteUrl(req)}/?verified=1`);
  } catch (e) {
    return NextResponse.redirect(
      `${getSiteUrl(req)}/?verified=0&reason=server`,
    );
  }
}
