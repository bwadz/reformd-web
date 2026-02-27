import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type WaitlistPayload = {
  email?: string;
  full_name?: string;
  goal?: string;
  biggest_issue?: string;
  timeframe?: string;
  notes?: string;
};

function getEnv(name: string): string | null {
  const v = process.env[name];
  if (!v) return null;
  const t = v.trim();
  return t.length ? t : null;
}

export async function POST(req: Request) {
  try {
    const SUPABASE_URL = getEnv("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = getEnv("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        {
          error:
            "Server is missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables.",
        },
        { status: 500 },
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body = (await req.json().catch(() => ({}))) as WaitlistPayload;

    const email = (body.email || "").trim().toLowerCase();
    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 },
      );
    }

    const row = {
      email,
      full_name: (body.full_name || "").trim() || null,
      goal: (body.goal || "").trim() || null,
      biggest_issue: (body.biggest_issue || "").trim() || null,
      timeframe: (body.timeframe || "").trim() || null,
      notes: (body.notes || "").trim() || null,
    };

    // Assumes table: waitlist with unique(email)
    const { data, error } = await supabase
      .from("waitlist")
      .upsert(row, { onConflict: "email" })
      .select("email")
      .maybeSingle();

    // If your project returns conflict errors instead of upsert updating, you can
    // swap to: insert + handle 23505. But upsert should be clean.

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { ok: true, already: !!data, email },
      { status: 200 },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
