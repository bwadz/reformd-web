import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { Resend } from "resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type WaitlistPayload = {
  email: string;
  full_name?: string | null;
  age_bracket?: string | null;
  gender?: string | null;

  goal?: string | null;
  biggest_issue?: string | null;
  timeframe?: string | null;
  notes?: string | null;

  // anti-spam
  website?: string | null;

  // attribution
  landing_url?: string | null;
  referrer?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
};

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
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (envUrl) return envUrl.replace(/\/+$/, "");

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

type ResendSendResult = {
  data?: { id?: string };
  error?: { message?: string };
};

function normalizeResendResult(resp: unknown): ResendSendResult {
  if (typeof resp !== "object" || resp === null) return {};
  const o = resp as Record<string, unknown>;

  const dataVal = o["data"];
  const errorVal = o["error"];

  const out: ResendSendResult = {};

  if (typeof dataVal === "object" && dataVal !== null) {
    const d = dataVal as Record<string, unknown>;
    out.data = { id: typeof d["id"] === "string" ? d["id"] : undefined };
  }

  if (typeof errorVal === "object" && errorVal !== null) {
    const e = errorVal as Record<string, unknown>;
    out.error = {
      message: typeof e["message"] === "string" ? e["message"] : undefined,
    };
  }

  return out;
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
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

    // Honeypot: silently succeed
    const hp = (body.website || "").trim();
    if (hp.length > 0) {
      return NextResponse.json(
        { ok: true, already: false, email_sent: false, verified: false },
        { status: 200 },
      );
    }

    const supabase = getSupabaseAdmin();

    // check existing + verified
    const { data: existing, error: selErr } = await supabase
      .from("waitlist")
      .select("email, verified_at")
      .eq("email", email)
      .maybeSingle();

    if (selErr) {
      return NextResponse.json({ error: selErr.message }, { status: 500 });
    }

    const already = Boolean(existing?.email);
    const alreadyVerified = Boolean(existing?.verified_at);

    // token for new verify link (even if "already" exists but not verified)
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = sha256Hex(token);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const payload: Record<string, unknown> = {
      email,
      full_name: body.full_name ?? null,
      age_bracket: body.age_bracket ?? null,
      gender: body.gender ?? null,
      goal: body.goal ?? null,
      biggest_issue: body.biggest_issue ?? null,
      timeframe: body.timeframe ?? null,
      notes: body.notes ?? null,

      landing_url: body.landing_url ?? null,
      referrer: body.referrer ?? null,
      utm_source: body.utm_source ?? null,
      utm_medium: body.utm_medium ?? null,
      utm_campaign: body.utm_campaign ?? null,
      utm_content: body.utm_content ?? null,
      utm_term: body.utm_term ?? null,

      verification_token_hash: tokenHash,
      verification_expires_at: expiresAt,
    };

    const { error: upErr } = await supabase
      .from("waitlist")
      .upsert(payload, { onConflict: "email", ignoreDuplicates: false });

    if (upErr) {
      return NextResponse.json({ error: upErr.message }, { status: 500 });
    }

    // If already verified, don’t email
    if (alreadyVerified) {
      return NextResponse.json(
        { ok: true, already, email_sent: false, verified: true },
        { status: 200 },
      );
    }

    const resendKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM;

    if (!resendKey) {
      return NextResponse.json(
        { error: "Missing env RESEND_API_KEY (production)." },
        { status: 500 },
      );
    }
    if (!from) {
      return NextResponse.json(
        { error: "Missing env RESEND_FROM (production)." },
        { status: 500 },
      );
    }

    const resend = new Resend(resendKey);
    const verifyLink = makeVerifyLink(req, token);

    const raw = await resend.emails.send({
      from,
      to: email,
      subject: "Confirm your Re:Formd waitlist spot",
      html: renderEmailHtml(verifyLink),
    });

    const resp = normalizeResendResult(raw);

    // If Resend rejected it, FAIL LOUDLY so you can see why.
    if (resp.error?.message) {
      return NextResponse.json(
        { error: `Resend error: ${resp.error.message}` },
        { status: 502 },
      );
    }

    const sentId = resp.data?.id;
    if (!sentId) {
      return NextResponse.json(
        { error: "Resend did not return a message id." },
        { status: 502 },
      );
    }

    return NextResponse.json(
      { ok: true, already, email_sent: true, verified: false },
      { status: 200 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
