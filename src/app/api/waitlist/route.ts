import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { ok: false, error: "Email is required." },
        { status: 400 }
      );
    }

    const payload = {
      email,
      full_name: (body.full_name ?? "").trim() || null,
      goal: (body.goal ?? "").trim() || null,
      biggest_issue: (body.biggest_issue ?? "").trim() || null,
      timeframe: (body.timeframe ?? "").trim() || null,
      notes: (body.notes ?? "").trim() || null,
      source: "website",
      user_agent: req.headers.get("user-agent") ?? null,
    };

    const { error } = await supabase.from("waitlist_signups").insert(payload);

    if (error) {
      if (error.message.toLowerCase().includes("duplicate")) {
        return NextResponse.json({ ok: true, already: true });
      }
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request." },
      { status: 400 }
    );
  }
}
