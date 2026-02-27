import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

type WaitlistPayload = {
  email: string;
  full_name?: string | null;
  goal?: string | null;
  biggest_issue?: string | null;
  timeframe?: string | null;
  notes?: string | null;
  website?: string | null; // honeypot
};

// super-light in-memory rate limit (per lambda instance)
const RATE_WINDOW_MS = 60_000; // 1 min
const RATE_MAX = 8; // 8 submissions/min per IP per instance
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
  // Vercel provides x-forwarded-for: "client, proxy1, proxy2"
  const xff = req.headers.get("x-forwarded-for");
  if (!xff) return null;
  return xff.split(",")[0]?.trim() || null;
}

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) throw new Error("Missing env SUPABASE_URL");
  if (!serviceRoleKey) throw new Error("Missing env SUPABASE_SERVICE_ROLE_KEY");

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
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

    // Honeypot: if filled, act like success (don’t store)
    const hp = (body.website || "").trim();
    if (hp.length > 0) {
      return NextResponse.json({ ok: true, already: false }, { status: 200 });
    }

    const supabase = getSupabaseAdmin();

    const payload: Omit<WaitlistPayload, "website"> = {
      email,
      full_name: body.full_name ?? null,
      goal: body.goal ?? null,
      biggest_issue: body.biggest_issue ?? null,
      timeframe: body.timeframe ?? null,
      notes: body.notes ?? null,
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
