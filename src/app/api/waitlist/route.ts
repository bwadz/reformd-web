import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

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
  website?: string | null; // honeypot

  // attribution
  landing_url?: string | null;
  referrer?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// super-light in-memory rate limit (per lambda instance)
const RATE_WINDOW_MS = 60_000; // 1 min
const RATE_MAX = 8; // 8 submissions/min per IP per instance
const rateMap = new Map<string, { count: number; resetAt: number }>();

function getClientIp(req: Request) {
  // Vercel: "client, proxy1, proxy2"
  const xff = req.headers.get("x-forwarded-for");
  return xff ? xff.split(",")[0]?.trim() || null : null;
}

function rateLimit(ip: string | null) {
  if (!ip) return { ok: true as const };

  const now = Date.now();
  const cur = rateMap.get(ip);

  if (!cur || now > cur.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return { ok: true as const };
  }

  if (cur.count >= RATE_MAX) return { ok: false as const };

  cur.count += 1;
  rateMap.set(ip, cur);
  return { ok: true as const };
}

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) throw new Error("Missing env SUPABASE_URL");
  if (!serviceRoleKey) throw new Error("Missing env SUPABASE_SERVICE_ROLE_KEY");

  return createClient(url, serviceRoleKey, { auth: { persistSession: false } });
}

function isValidEmail(email: string) {
  return EMAIL_REGEX.test(email);
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rl = rateLimit(ip);
    if (!rl.ok) {
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

    // Honeypot: if filled, act like success (don’t store)
    const hp = (body.website || "").trim();
    if (hp.length > 0) {
      return NextResponse.json({ ok: true, already: false }, { status: 200 });
    }

    const supabase = getSupabaseAdmin();

    const payload: Omit<WaitlistPayload, "website"> = {
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
    };

    // detect "already" by checking first
    const { data: existing, error: selErr } = await supabase
      .from("waitlist")
      .select("email")
      .eq("email", email)
      .maybeSingle();

    if (selErr) {
      return NextResponse.json({ error: selErr.message }, { status: 500 });
    }

    const already = Boolean(existing?.email);

    const { error } = await supabase
      .from("waitlist")
      .upsert(payload, { onConflict: "email", ignoreDuplicates: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, already }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
