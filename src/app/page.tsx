"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";

type ToastType = "success" | "error" | "accent";

type WaitlistForm = {
  full_name: string;
  email: string;
  goal: string;
  biggest_issue: string;
  timeframe: string;
  notes: string;
  // Honeypot (bots fill; humans never see)
  website: string;
};

export default function HomePage() {
  const year = useMemo(() => new Date().getFullYear(), []);

  const [toast, setToast] = useState<{ msg: string; type: ToastType } | null>(
    null,
  );
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [emailInlineError, setEmailInlineError] = useState("");

  const [form, setForm] = useState<WaitlistForm>({
    full_name: "",
    email: "",
    goal: "",
    biggest_issue: "",
    timeframe: "",
    notes: "",
    website: "",
  });

  function showToast(msg: string, type: ToastType = "success", ms = 3000) {
    setToast({ msg, type });
    window.setTimeout(() => setToast(null), ms);
  }

  function onJoinWaitlist() {
    setEmailInlineError("");
    setWaitlistOpen(true);
  }

  function closeWaitlist() {
    setWaitlistOpen(false);
    setEmailInlineError("");
  }

  function updateField<K extends keyof WaitlistForm>(
    key: K,
    value: WaitlistForm[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function resetForm() {
    setForm({
      full_name: "",
      email: "",
      goal: "",
      biggest_issue: "",
      timeframe: "",
      notes: "",
      website: "",
    });
    setEmailInlineError("");
  }

  function isValidEmail(email: string) {
    // Practical validator (not perfect, but solid)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return emailRegex.test(email);
  }

  async function submitWaitlist() {
    const email = form.email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
      showToast("Enter a valid email address.", "accent", 2500);
      return;
    }

    // Inline validation (green accent)
    if (!email) {
      setEmailInlineError("Email is required.");
      showToast("Email is required.", "accent", 2500);
      return;
    }
    if (!isValidEmail(email)) {
      setEmailInlineError("Enter a valid email address.");
      showToast("Enter a valid email address.", "accent", 2500);
      return;
    }

    // Honeypot: silently succeed
    if (form.website.trim().length > 0) {
      closeWaitlist();
      resetForm();
      showToast("You’re in. Welcome to Re:Formd.", "success", 3000);
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: form.full_name || null,
          email,
          goal: form.goal || null,
          biggest_issue: form.biggest_issue || null,
          timeframe: form.timeframe || null,
          notes: form.notes || null,
          website: form.website || "",
        }),
      });

      const data: unknown = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errMsg =
          typeof data === "object" && data !== null && "error" in data
            ? String((data as { error?: unknown }).error || "Failed to submit.")
            : "Failed to submit.";
        throw new Error(errMsg);
      }

      const already =
        typeof data === "object" && data !== null && "already" in data
          ? Boolean((data as { already?: unknown }).already)
          : false;

      closeWaitlist();
      resetForm();

      showToast(
        already
          ? "You’re already on the list."
          : "You’re in. Welcome to Re:Formd.",
        "success",
        3000,
      );
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Something broke. Try again.";
      showToast(msg, "error", 3200);
    } finally {
      setSubmitting(false);
    }
  }

  const toastClass =
    toast?.type === "accent"
      ? "border-emerald-400/35 bg-emerald-500/15 text-emerald-200"
      : toast?.type === "error"
        ? "border-red-400/35 bg-red-500/15 text-red-200"
        : "border-white/15 bg-black/90 text-white/85";

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-4">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/04-horizontal-basic-white.png"
              alt="Re:Formd"
              width={140}
              height={32}
              priority
            />
          </Link>

          <button
            onClick={onJoinWaitlist}
            className="rounded-xl bg-white px-4 sm:px-6 py-2 text-sm font-semibold text-black transition hover:opacity-90"
          >
            Join the Waitlist
          </button>
        </div>
      </header>

      {/* HERO */}
      <section className="relative min-h-[100svh] overflow-hidden pt-20 sm:pt-24">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url(/images/reformd-hero-v3-1920x1080.webp)",
          }}
        />

        {/* Mobile: darker overall overlay */}
        <div className="absolute inset-0 bg-black/85 sm:hidden" />

        {/* Desktop+: directional overlay (keep phone visible) */}
        <div className="absolute inset-0 hidden sm:block bg-gradient-to-r from-black/80 via-black/45 to-black/10" />

        {/* Bottom fade (all sizes) */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/55" />

        <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-start sm:justify-center px-4 sm:px-6 pt-8 sm:pt-0 pb-12 sm:py-16">
          <div className="max-w-2xl">
            <div className="mb-4 text-[11px] sm:text-xs tracking-[0.24em] accent">
              RE:FORMD — THE HUMAN PERFORMANCE SYSTEM
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.05] tracking-tight">
              It’s Not Aging.
              <br />
              It’s Accumulation.
            </h1>

            <p className="mt-5 sm:mt-6 text-base sm:text-lg leading-relaxed text-white/80">
              Low energy. Brain fog. Hormone crashes.
              <br />
              Your body isn’t failing — it’s reacting to years of stress, poor
              recovery & neglect.
              <br />
              <br />
              <span className="text-white/80 font-semibold">
                Fix the machine to relieve the symptoms.
              </span>
            </p>

            <div
              id="waitlist"
              className="mt-7 sm:mt-8 flex flex-col sm:flex-row sm:items-center gap-3"
            >
              <button
                onClick={onJoinWaitlist}
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-white px-8 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
              >
                JOIN THE WAITLIST
              </button>
            </div>

            <p className="mt-5 sm:mt-6 text-sm leading-relaxed text-white/60">
              Re:Formd is an AI-driven health optimization system that analyzes
              your biology, identifies breakdowns in performance pathways, and
              rebuilds them with structured, accountable, data-backed protocols.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 2 — EMOTIONAL / YOU'RE NOT BROKEN */}
      <section
        id="problem"
        className="relative mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20 lg:py-24 overflow-hidden"
      >
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-black" />
          <div className="absolute left-1/2 top-16 h-[360px] w-[720px] -translate-x-1/2 rounded-full bg-gradient-to-r from-red-500/10 via-amber-400/5 to-transparent blur-3xl" />
        </div>

        <div className="mx-auto grid max-w-5xl items-start gap-10 lg:gap-14 lg:grid-cols-2">
          {/* LEFT */}
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight">
              You’re Not Broken.
            </h2>

            <p className="mt-5 sm:mt-6 text-base sm:text-lg leading-relaxed text-white/75">
              You don’t need to be “fixed.”
              <br />
              <br />
              You need maintenance & optimization.
              <br />
              You need protocols — and accountability.
              <br />
              <br />
              Your machine needs repair and upkeep.
              <br />
              <span className="accent font-semibold">
                We can help you rebuild.
              </span>
            </p>

            <div className="mt-8 sm:mt-10 h-px w-24 bg-white/15" />

            <div className="mt-8">
              <div className="text-xs uppercase tracking-widest text-white/50">
                Now you feel
              </div>

              <ul className="mt-5 space-y-3 max-w-md">
                {[
                  "Chronic Pain",
                  "No Energy",
                  "Foggy Thinking",
                  "No Drive",
                ].map((x) => (
                  <li
                    key={x}
                    className="flex items-center gap-3 text-base sm:text-lg text-white/80"
                  >
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                    {x}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* RIGHT: System Under Strain */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8">
            {(() => {
              const categories = [
                {
                  label: "Recovery",
                  score: 62,
                  note: "sleep, training load, stress, lifestyle",
                },
                {
                  label: "Metabolic",
                  score: 74,
                  note: "nutrition, body comp, glucose control",
                },
                {
                  label: "Hormonal",
                  score: 58,
                  note: "endocrine signaling, labs, thyroid/cortisol",
                },
                {
                  label: "Performance",
                  score: 81,
                  note: "strength, output, endurance, readiness",
                },
                {
                  label: "Compliance",
                  score: 69,
                  note: "execution, consistency, adherence",
                },
              ] as const;

              const overall =
                Math.round(
                  categories.reduce((sum, c) => sum + c.score, 0) /
                    categories.length,
                ) || 0;

              return (
                <>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-semibold tracking-wide text-white/70">
                        SYSTEM SCORE
                      </div>
                      <div className="mt-1 text-xs text-white/40">
                        Composite average across 5 categories
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-white/40">Overall</div>
                      <div className="text-2xl font-semibold text-white/85">
                        {overall}
                        <span className="text-sm font-medium text-white/50">
                          /100
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 h-3 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${overall}%`,
                        background:
                          "linear-gradient(to right, #ef4444, #facc15, #22c55e)",
                      }}
                    />
                  </div>

                  <div className="mt-8 space-y-6">
                    {categories.map((item) => (
                      <div key={item.label}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="text-sm text-white/80">
                              {item.label}
                              <span className="text-xs text-white/45">
                                {" "}
                                ({item.note})
                              </span>
                            </div>
                          </div>
                          <div className="shrink-0 text-sm font-semibold text-white/80">
                            {item.score}
                          </div>
                        </div>

                        <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${item.score}%`,
                              background:
                                "linear-gradient(to right, #ef4444, #facc15, #22c55e)",
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 rounded-xl border border-white/10 bg-black/40 p-4">
                    <p className="text-sm leading-relaxed text-white/60">
                      Scores reflect biomarker trends, recovery data, protocol
                      execution, and performance output. Improve the inputs —
                      the system rises.
                    </p>
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        <div className="mx-auto mt-14 sm:mt-16 max-w-4xl text-center">
          <p className="text-xl sm:text-2xl md:text-3xl font-light text-white/70">
            Most solutions patch symptoms.
          </p>
          <p className="mt-3 text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-white">
            Re:Formd rebuilds the system.
          </p>
          <p className="mt-3 text-sm sm:text-base text-white/60">
            We identify the breakdowns — then rebuild with personalized
            protocols.
          </p>
        </div>
      </section>

      {/* SECTION 3 — THE RE:FORMD SYSTEM */}
      <section
        id="method"
        className="relative mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20 lg:py-24 overflow-hidden"
      >
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-black" />
          <div className="absolute left-1/2 top-14 h-[360px] w-[760px] -translate-x-1/2 rounded-full bg-gradient-to-r from-white/6 via-white/3 to-transparent blur-3xl" />
        </div>

        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <div className="text-xs uppercase tracking-widest accent">
              The System
            </div>
            <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight">
              Diagnose. Explain. Optimize. Track. Adapt.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base sm:text-lg leading-relaxed text-white/70">
              A repeatable process for rebuilding performance — with protocols,
              accountability, and measurable outcomes.
            </p>
          </div>

          <div className="mt-12 space-y-6">
            {[
              {
                k: "01",
                title: "Diagnose",
                desc: "Baseline the truth. Identify signal before action.",
              },
              {
                k: "02",
                title: "Explain",
                desc: "Turn chaos into a clear upstream map.",
              },
              {
                k: "03",
                title: "Optimize",
                desc: "Build structured protocols that fit real life.",
              },
              {
                k: "04",
                title: "Track",
                desc: "Measure compliance and system responses daily.",
              },
              {
                k: "05",
                title: "Adapt",
                desc: "Recalibrate inputs until performance holds.",
              },
            ].map((s) => (
              <div
                key={s.k}
                className={`relative rounded-2xl border ${
                  s.k === "01"
                    ? "border-white/25 bg-black/40"
                    : "border-white/10 bg-black/30"
                } p-6`}
              >
                <div
                  className={`absolute top-4 right-6 text-7xl font-bold tracking-tight ${
                    s.k === "01" ? "text-white/25" : "text-white/15"
                  }`}
                >
                  {s.k}
                </div>

                <div className="relative">
                  <div
                    className={`text-xs uppercase tracking-[0.3em] ${
                      s.k === "01" ? "text-white/50" : "text-white/35"
                    }`}
                  >
                    Step {s.k}
                  </div>

                  <div
                    className={`mt-3 text-xl font-semibold ${s.k === "01" ? "text-white" : "text-white/85"}`}
                  >
                    {s.title}
                  </div>

                  <p className="mt-2 text-sm leading-relaxed text-white/60 max-w-md">
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-12 sm:mt-14 max-w-4xl text-center">
            <div className="text-xs uppercase tracking-[0.3em] accent">
              The Re:Formd Standard
            </div>
            <p className="mt-5 text-xl sm:text-2xl md:text-3xl font-light text-white/70 leading-relaxed">
              No hacks. No guesswork. No hype.
            </p>
            <p className="mt-4 text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-white">
              Just signal → protocol → accountability → results.
            </p>
            <p className="mt-6 text-sm sm:text-base leading-relaxed text-white/60">
              Diagnose the truth. Build the plan. Track what changes. Adapt
              until the system holds.
            </p>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section
        id="cta"
        className="relative mx-auto max-w-6xl px-4 sm:px-6 py-24 sm:py-28 lg:py-32 text-center overflow-hidden"
      >
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-black" />
          <div className="absolute left-1/2 top-10 h-[420px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-r from-white/10 via-white/5 to-transparent blur-3xl" />
        </div>

        <div className="mx-auto max-w-3xl">
          <p className="text-2xl sm:text-3xl md:text-4xl font-light text-white/70">
            You’re not broken.
          </p>
          <p className="mt-3 text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white">
            You just need a system.
          </p>

          <h2 className="mt-10 text-2xl sm:text-3xl md:text-5xl font-semibold tracking-tight leading-tight">
            Stop guessing.
            <br className="hidden sm:block" />
            Stop trying everything.
            <br />
            <span className="text-white">Start rebuilding.</span>
          </h2>

          <div className="mt-12">
            <button
              onClick={onJoinWaitlist}
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-2xl bg-white px-12 py-4 text-base font-semibold text-black transition hover:opacity-90"
            >
              Join the Waitlist
            </button>
          </div>

          <p className="mt-12 text-xs tracking-wide text-white/40">
            Structured health optimization. Built to Last.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-black">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-sm">
              <Image
                src="/images/04-horizontal-basic-white.png"
                alt="Re:Formd"
                width={180}
                height={40}
              />
              <p className="mt-4 text-sm leading-relaxed text-white/60">
                Structured health optimization.{" "}
                <span className="text-white/70">Built to Last.</span>
              </p>
              <p className="mt-3 text-xs text-white/40">
                Biomarkers • Protocols • Tracking • Accountability
              </p>
            </div>

            <div className="grid grid-cols-2 gap-x-10 gap-y-3 text-sm text-white/60 sm:grid-cols-3 lg:grid-cols-2">
              {[
                "About",
                "Research & Methodology",
                "Ethics",
                "Privacy Policy",
                "Terms of Service",
                "Contact",
              ].map((item) => (
                <div key={item} className="cursor-default text-white/60">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-white/40">
              © {year} Re:Formd. All rights reserved.
            </p>
            <p className="text-xs text-white/40">
              Built for performance-minded adults. Not medical advice.
            </p>
          </div>
        </div>
      </footer>

      {/* TOAST */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border px-4 py-2 text-sm ${toastClass}`}
        >
          {toast.msg}
        </div>
      )}

      {/* WAITLIST MODAL */}
      {waitlistOpen && (
        <div className="fixed inset-0 z-[60]">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={closeWaitlist}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="relative w-full max-w-xl rounded-3xl bg-white text-black shadow-2xl">
              <button
                onClick={closeWaitlist}
                aria-label="Close"
                className="absolute right-4 top-4 rounded-full p-2 text-black/60 hover:bg-black/5"
              >
                ✕
              </button>

              <div className="px-6 sm:px-8 pt-10 pb-8">
                <div className="flex items-start gap-3">
                  <Image
                    src="/images/01-swirl-black copy.png"
                    alt="Re:Formd"
                    width={28}
                    height={28}
                  />
                  <div>
                    <div className="text-[11px] tracking-[0.24em] text-black/50">
                      JOIN THE WAITLIST
                    </div>
                    <div className="mt-2 text-3xl font-semibold">
                      Built to Last.
                    </div>
                    <div className="mt-2 text-sm text-black/60">
                      Email is required. Everything else is optional.
                    </div>
                  </div>
                </div>

                <div className="mt-8 space-y-3">
                  <input
                    value={form.full_name}
                    onChange={(e) => updateField("full_name", e.target.value)}
                    placeholder="Full name (optional)"
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-black/40 outline-none ring-0 focus:border-black/25"
                  />

                  <div>
                    <input
                      value={form.email}
                      onChange={(e) => {
                        setEmailInlineError("");
                        updateField("email", e.target.value);
                      }}
                      placeholder="Email (required)"
                      className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-black/40 outline-none ring-0 focus:border-black/25"
                    />
                    {emailInlineError && (
                      <div className="mt-2 text-sm text-emerald-600">
                        {emailInlineError}
                      </div>
                    )}
                  </div>

                  <input
                    value={form.goal}
                    onChange={(e) => updateField("goal", e.target.value)}
                    placeholder="Primary goal (optional)"
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-black/40 outline-none ring-0 focus:border-black/25"
                  />

                  <input
                    value={form.biggest_issue}
                    onChange={(e) =>
                      updateField("biggest_issue", e.target.value)
                    }
                    placeholder="Biggest bottleneck right now? (optional)"
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-black/40 outline-none ring-0 focus:border-black/25"
                  />

                  <input
                    value={form.timeframe}
                    onChange={(e) => updateField("timeframe", e.target.value)}
                    placeholder="Timeframe (e.g., 30 / 90 days) (optional)"
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-black/40 outline-none ring-0 focus:border-black/25"
                  />

                  <textarea
                    value={form.notes}
                    onChange={(e) => updateField("notes", e.target.value)}
                    placeholder="Anything else? (optional)"
                    rows={3}
                    className="w-full resize-none rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-black/40 outline-none ring-0 focus:border-black/25"
                  />

                  {/* Honeypot */}
                  <input
                    value={form.website}
                    onChange={(e) => updateField("website", e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                    className="hidden"
                    aria-hidden="true"
                  />
                </div>

                <div className="mt-6 flex items-center justify-between gap-4">
                  <div className="text-xs text-black/50">
                    By submitting, you agree to receive waitlist updates.
                  </div>

                  <button
                    onClick={submitWaitlist}
                    disabled={submitting}
                    className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-black/90 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
