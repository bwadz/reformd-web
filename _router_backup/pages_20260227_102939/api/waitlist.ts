import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SECRET_KEY as string
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const body = req.body || {};
    const email = String(body.email || "").trim().toLowerCase();

    if (!process.env.SUPABASE_URL) {
      return res.status(500).json({ ok: false, error: "SUPABASE_URL missing" });
    }
    if (!process.env.SUPABASE_SECRET_KEY) {
      return res.status(500).json({ ok: false, error: "SUPABASE_SECRET_KEY missing" });
    }
    if (!email) {
      return res.status(400).json({ ok: false, error: "Email is required." });
    }

    const payload = {
      email,
      full_name: (body.full_name ?? "").trim() || null,
      goal: (body.goal ?? "").trim() || null,
      biggest_issue: (body.biggest_issue ?? "").trim() || null,
      timeframe: (body.timeframe ?? "").trim() || null,
      notes: (body.notes ?? "").trim() || null,
      source: "website",
      user_agent: req.headers["user-agent"] ?? null,
    };

    const { error } = await supabase.from("waitlist_signups").insert(payload);

    if (error) {
      if (error.message.toLowerCase().includes("duplicate")) {
        return res.status(200).json({ ok: true, already: true });
      }
      return res.status(400).json({ ok: false, error: error.message });
    }

    return res.status(200).json({ ok: true });
  } catch {
    return res.status(400).json({ ok: false, error: "Invalid request." });
  }
}
