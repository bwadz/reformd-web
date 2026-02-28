// src/app/api/waitlist/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { Resend } from "resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Expectation (DB columns):
 * - waitlist.email (unique)
 * - full_name, age_bracket, gender, goal, biggest_issue, timeframe, notes
 * - source, landing_url, referrer, utm_source, utm_medium, utm_campaign, utm_content, utm_term
 * - verification_token_hash, verification_expires_at, verified_at
 */

type WaitlistPayload = {
  email: string;
  full_name?: string | null;
  age_bracket?: string | null;
  gender?: string | null;

  goal?: string | null;
  biggest_issue?: string | null;
  timeframe?: string | null;
  notes?: string | null;

  // honeypot
  website?: string | null;

  // attribution
  source?: string | null;
  landing_url?: string | null;
  referrer?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
};

// super-light in-memory rate limit (per lambda instance)
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 8;
const rateMap = new Map<string, { count: number; resetAt: number }>();

function rateLimit(ip: string | null) {
  if (!ip) return { ok: true };
  const now = Date.now();
  const cur = rateMap.get(ip);

  if (!cur || now > cur.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return { ok: true };
  }

  if (cur.count >= RATE_MAX) return { ok: false };
  cur.count += 1;
  rateMap.set(ip, cur);
  return { ok: true };
}

function getClientIp(req: Request) {
  const xff = req.headers.get("x-forwarded-for");
  if (!xff) return null;
  return xff.split(",")[0]?.trim() || null;
}

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) throw new Error("Missing env SUPABASE_URL");
  if (!serviceRoleKey) throw new Error("Missing env SUPABASE_SERVICE_ROLE_KEY");

  return createClient(url, serviceRoleKey, { auth: { persistSession: false } });
}

function sha256Hex(input: string) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function getSiteUrl(req: Request) {
  // Best: set NEXT_PUBLIC_SITE_URL in Vercel env to https://www.getreformd.com
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (envUrl) return envUrl.replace(/\/+$/, "");

  // Fallback: infer from request
  const url = new URL(req.url);
  return url.origin;
}

function makeVerifyLink(req: Request, token: string) {
  const base = getSiteUrl(req);
  return `${base}/api/waitlist/verify?token=${encodeURIComponent(token)}`;
}

function renderEmailHtml(verifyLink: string) {
  return `
  <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; line-height:1.5; color:#111;">
    <h2 style="margin:0 0 12px;">Confirm your Re:Formd waitlist spot</h2>
    <p style="margin:0 0 16px;">Click the button below to verify your email. You’re not added until you confirm.</p>
    <p style="margin:0 0 18px;">
      <a href="${verifyLink}"
         style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:12px 18px;border-radius:12px;font-weight:600;">
        Verify email
      </a>
    </p>
    <p style="margin:0 0 8px;font-size:12px;color:#555;">Link expires in 24 hours.</p>
    <p style="margin:0;font-size:12px;color:#777;">If you didn’t request this, ignore this email.</p>
  </div>`;
}

export async function GET() {
  return NextResponse.json({ ok: true, route: "waitlist" }, { status: 200 });
}

export async function POST(req: Request) {
  const ip = getClientIp(req);

  try {
    if (!rateLimit(ip).ok) {
      return NextResponse.json(
        { error: "Too many requests. Try again shortly." },
        { status: 429 },
      );
    }

    const body = (await req.json()) as Partial<WaitlistPayload>;

    const email = (body.email || "").trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 },
      );
    }
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email address." },
        { status: 400 },
      );
    }

    // Honeypot: quietly succeed (don’t store, don’t email)
    const hp = (body.website || "").trim();
    if (hp.length > 0) {
      return NextResponse.json(
        { ok: true, already: false, email_sent: false, verified: false },
        { status: 200 },
      );
    }

    // Log env + request context per-hit (this matters on Vercel)
    console.log("WAITLIST POST", {
      ip,
      email,
      host: req.headers.get("host"),
      origin: req.headers.get("origin"),
      referer: req.headers.get("referer"),
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
      hasResendKey: Boolean(process.env.RESEND_API_KEY),
      resendKeyPrefix: process.env.RESEND_API_KEY?.slice(0, 8),
      resendFrom: process.env.RESEND_FROM,
      hasSupabaseUrl: Boolean(process.env.SUPABASE_URL),
      hasServiceRole: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    });

    const supabase = getSupabaseAdmin();

    // Check existing (so we can avoid re-emailing verified addresses)
    const { data: existing, error: selErr } = await supabase
      .from("waitlist")
      .select("email, verified_at")
      .eq("email", email)
      .maybeSingle();

    if (selErr) {
      console.error("WAITLIST SELECT ERROR", selErr);
      return NextResponse.json({ error: selErr.message }, { status: 500 });
    }

    const already = Boolean(existing?.email);
    const alreadyVerified = Boolean(existing?.verified_at);

    // Generate verification token + hash + expiry (always refresh token unless already verified)
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = sha256Hex(token);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    // Build DB payload (only columns that exist in your screenshot + verification fields)
    const payload: Record<string, unknown> = {
      email,
      full_name: body.full_name ?? null,
      age_bracket: body.age_bracket ?? null,
      gender: body.gender ?? null,

      goal: body.goal ?? null,
      biggest_issue: body.biggest_issue ?? null,
      timeframe: body.timeframe ?? null,
      notes: body.notes ?? null,

      source:
        body.source ??
        req.headers.get("host") ??
        req.headers.get("origin") ??
        null,

      landing_url: body.landing_url ?? null,
      referrer: body.referrer ?? req.headers.get("referer") ?? null,
      utm_source: body.utm_source ?? null,
      utm_medium: body.utm_medium ?? null,
      utm_campaign: body.utm_campaign ?? null,
      utm_content: body.utm_content ?? null,
      utm_term: body.utm_term ?? null,
    };

    if (!alreadyVerified) {
      payload.verification_token_hash = tokenHash;
      payload.verification_expires_at = expiresAt;
      // do NOT set verified_at here
    }

    // Upsert
    const { error: upErr } = await supabase
      .from("waitlist")
      .upsert(payload, { onConflict: "email", ignoreDuplicates: false });

    if (upErr) {
      console.error("WAITLIST UPSERT ERROR", upErr);
      return NextResponse.json({ error: upErr.message }, { status: 500 });
    }

    // Send verification email (unless already verified)
    let email_sent = false;

    if (!alreadyVerified) {
      const resendKey = process.env.RESEND_API_KEY;
      const from = process.env.RESEND_FROM;

      if (!resendKey) throw new Error("Missing env RESEND_API_KEY");
      if (!from) throw new Error("Missing env RESEND_FROM");

      const resend = new Resend(resendKey);
      const verifyLink = makeVerifyLink(req, token);

      //Send the email and log the response (or error)
      try {
        const resp = await resend.emails.send({
          from,
          to: email,
          subject: "Confirm your Re:Formd waitlist spot",
          html: renderEmailHtml(verifyLink),
        });

        console.log("RESEND RESPONSE", resp);

        // Narrow safely without `any`
        if (resp && typeof resp === "object" && "id" in resp) {
          email_sent = Boolean(resp.id);
        } else {
          email_sent = false;
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error("RESEND ERROR", err.message);
        } else {
          console.error("RESEND ERROR", err);
        }
        email_sent = false;
      }
    }

    return NextResponse.json(
      {
        ok: true,
        already,
        email_sent,
        verified: alreadyVerified,
      },
      { status: 200 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("WAITLIST FATAL", { ip, message });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
