import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import crypto from "crypto";

export const runtime = "nodejs";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) throw new Error("Missing env SUPABASE_URL");
  if (!serviceRoleKey) throw new Error("Missing env SUPABASE_SERVICE_ROLE_KEY");

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const email = (body.email || "").trim().toLowerCase();
    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address." },
        { status: 400 },
      );
    }

    // honeypot
    if ((body.website || "").trim().length > 0) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const supabase = getSupabaseAdmin();
    const resend = new Resend(process.env.RESEND_API_KEY);

    const token = generateToken();

    const payload = {
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
      verification_token: token,
      verified: false,
      verified_at: null,
    };

    const { error } = await supabase
      .from("waitlist")
      .upsert(payload, { onConflict: "email" });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const verifyUrl = `${process.env.SITE_URL}/api/waitlist/verify?token=${token}`;

    await resend.emails.send({
      from: process.env.RESEND_FROM as string,
      to: email,
      subject: "Confirm your spot on the Re:Formd waitlist",
      html: `
        <div style="font-family: sans-serif; line-height:1.5">
          <h2>Confirm your spot</h2>
          <p>You requested access to the Re:Formd waitlist.</p>
          <p>Click below to confirm your email:</p>
          <p>
            <a href="${verifyUrl}" 
               style="display:inline-block;padding:12px 20px;background:#000;color:#fff;text-decoration:none;border-radius:8px;">
              Confirm Email
            </a>
          </p>
          <p>If you didn’t request this, ignore this email.</p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
