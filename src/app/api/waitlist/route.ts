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
};

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
    const body = (await req.json()) as Partial<WaitlistPayload>;

    const email = (body.email || "").trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    const payload: WaitlistPayload = {
      email,
      full_name: body.full_name ?? null,
      goal: body.goal ?? null,
      biggest_issue: body.biggest_issue ?? null,
      timeframe: body.timeframe ?? null,
      notes: body.notes ?? null,
    };

    const { error } = await supabase
      .from("waitlist")
      .upsert(payload, { onConflict: "email", ignoreDuplicates: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
