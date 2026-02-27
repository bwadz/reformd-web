"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";

const NAV = [
  { id: "problem", label: "Problem" },
  { id: "upstream", label: "Upstream" },
  { id: "framework", label: "Framework" },
  { id: "infrastructure", label: "Infrastructure" },
  { id: "who", label: "Who It’s For" },
];

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function HomePage() {
  const [email, setEmail] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const year = useMemo(() => new Date().getFullYear(), []);

  function onJoinWaitlist() {
    // Lightweight v1: mailto fallback (swap to real waitlist API later)
    const trimmed = email.trim();
    const subject = encodeURIComponent("Re:Formd Waitlist");
    const body = encodeURIComponent(
      `Please add me to the Re:Formd waitlist.\n\nEmail: ${trimmed || "(not provided)"}\n`,
    );
    window.location.href = `mailto:waitlist@getreformd.com?subject=${subject}&body=${body}`;
    setToast("Opening your email client to join the waitlist.");
    setTimeout(() => setToast(null), 3500);
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/images/04-horizontal-basic-white.png" // adjust if needed
              alt="Re:Formd"
              width={140}
              height={32}
              priority
            />
          </Link>

          {/* CTA Button */}
          <Link
            href="#waitlist"
            className="rounded-xl bg-white px-6 py-2 text-sm font-semibold text-black transition hover:opacity-90"
          >
            Join the Waitlist
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="relative min-h-[100svh] overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url(/images/reformd-hero-v3-1920x1080.webp)",
          }}
        />

        {/* Directional overlay: dark on left for text, clear on right for phone */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-black/10" />

        {/* Subtle bottom fade only */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50" />

        <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-center px-6 py-20">
          <div className="max-w-2xl">
            <div className="mb-4 text-xs tracking-[0.28em] text-white/70">
              RE:FORMD — THE HUMAN PERFORMANCE SYSTEM
            </div>

            <h1 className="text-5xl font-bold leading-[1.02] md:text-6xl">
              It’s Not Aging.
              <br />
              It’s Accumulation.
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-white/80">
              Low energy. Brain fog. Hormone crashes.
              <br />
              Your body isn’t failing.
              <br />
              It’s reacting.
              <br />
              <br />
              Years of stress. Poor recovery. Neglect.
              <br />
              <span className="accent">Fix the machine.</span>
              <br />
              Relieve the symptoms.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex w-full max-w-md items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 backdrop-blur">
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full bg-transparent text-sm text-white placeholder:text-white/40 outline-none"
                  type="email"
                />
              </div>

              <button
                onClick={onJoinWaitlist}
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
              >
                JOIN THE WAITLIST
              </button>

              {/* <button
                onClick={() => scrollToId("framework")}
                className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/40"
              >
                SEE THE FRAMEWORK
              </button> */}
            </div>

            <div className="mt-6 text-sm text-white/60">
              <p className="mt-6 text-sm leading-relaxed text-white/60">
                A structured health optimization platform built on biomarker
                tracking, hormone optimization, and data-driven performance
                systems.
              </p>
            </div>
          </div>
        </div>

        {toast && (
          <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-white/15 bg-black/90 px-4 py-2 text-sm text-white/80 backdrop-blur">
            {toast}
          </div>
        )}
      </section>

      {/* SECTION 2 — THE PROBLEM */}
      <section id="problem" className="relative mx-auto max-w-6xl px-6 py-28">
        {/* Background depth */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-black" />
          <div className="absolute left-1/2 top-20 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-gradient-to-r from-red-500/10 via-amber-400/5 to-transparent blur-3xl" />
        </div>

        <div className="mx-auto grid max-w-5xl items-start gap-16 md:grid-cols-2">
          {/* LEFT */}
          <div>
            <h2 className="text-5xl font-semibold tracking-tight">
              You’re Not Broken.
            </h2>

            <div className="mt-10 space-y-4 text-lg text-white/70">
              <div className="border-l-2 border-white/20 pl-4">
                You train harder.
              </div>
              <div className="border-l-2 border-white/20 pl-4">
                You sleep less.
              </div>
              <div className="border-l-2 border-white/20 pl-4">
                You push through.
              </div>
            </div>

            <div className="mt-12 h-px w-24 bg-white/20" />

            <div className="mt-10">
              <div className="text-sm uppercase tracking-widest text-white/50">
                Now you feel
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4 max-w-md">
                {["Slower", "Foggy", "Inflamed", "Drained"].map((x) => (
                  <div
                    key={x}
                    className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-white/80 backdrop-blur"
                  >
                    {x}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-14 space-y-4 text-lg">
              <p className="text-white/80">That’s not age.</p>
              <p className="text-white text-xl">
                That’s a system under strain.
              </p>
            </div>
          </div>

          {/* RIGHT */}
          <div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold tracking-wide text-white/70">
                  SYSTEM UNDER STRAIN
                </div>
                <div className="text-sm text-white/50">78%</div>
              </div>

              <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-red-500/70 via-amber-400/60 to-white/20" />
              </div>

              <div className="mt-8 space-y-4">
                {[
                  { label: "Sleep debt", dir: "↑" },
                  { label: "Inflammation", dir: "↑" },
                  { label: "Recovery", dir: "↓" },
                ].map((m) => (
                  <div
                    key={m.label}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 px-5 py-4"
                  >
                    <div className="text-sm text-white/70">{m.label}</div>
                    <div className="text-sm font-semibold text-white/70">
                      {m.dir}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-xl border border-white/10 bg-black/40 p-5">
                <p className="text-sm leading-relaxed text-white/60">
                  This is what “getting older” looks like when your inputs stay
                  chaotic and your recovery stops cashing the checks.
                </p>
              </div>
            </div>

            <p className="mt-6 text-xs text-white/40">
              No shame. No excuses. Just signal → system → solution.
            </p>
          </div>
        </div>

        {/* FULL WIDTH TAKEAWAY */}
        <div className="mx-auto mt-24 max-w-4xl text-center">
          <p className="text-2xl md:text-3xl font-light text-white/70">
            Most solutions patch symptoms.
          </p>
          <p className="mt-4 text-3xl md:text-4xl font-semibold tracking-tight text-white">
            Re:Formd rebuilds the system.
          </p>
        </div>
      </section>

      {/* SECTION 3 — EXPLAIN (UPSTREAM) */}
      <section id="explain" className="relative mx-auto max-w-6xl px-6 py-28">
        {/* Background depth (cooler tone than Problem) */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-black" />
          <div className="absolute left-1/2 top-20 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-gradient-to-r from-white/8 via-white/4 to-transparent blur-3xl" />
        </div>

        <div className="mx-auto grid max-w-5xl items-start gap-16 md:grid-cols-2">
          {/* LEFT */}
          <div>
            <div className="text-sm uppercase tracking-widest text-white/50">
              Explain
            </div>

            <h2 className="mt-4 text-5xl font-semibold tracking-tight">
              The real problem is upstream.
            </h2>

            <p className="mt-8 text-lg leading-relaxed text-white/70 max-w-xl">
              You don’t need more motivation. You need the right levers. When
              energy, recovery, and performance slide, it’s usually not one
              thing — it’s the system drifting out of alignment.
            </p>

            <div className="mt-10 space-y-4 text-lg text-white/70">
              <div className="border-l-2 border-white/20 pl-4">
                Inputs drive biology.
              </div>
              <div className="border-l-2 border-white/20 pl-4">
                Biology drives performance.
              </div>
              <div className="border-l-2 border-white/20 pl-4">
                Performance drives your life.
              </div>
            </div>

            <div className="mt-12 h-px w-24 bg-white/20" />

            <p className="mt-10 text-lg leading-relaxed text-white/80">
              Fix the inputs — and the downstream symptoms start to dissolve.
            </p>
          </div>

          {/* RIGHT: Cause Stack Card */}
          <div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold tracking-wide text-white/70">
                  THE CAUSE STACK
                </div>
                <div className="text-sm text-white/50">UPSTREAM</div>
              </div>

              <div className="mt-6 space-y-4">
                {[
                  {
                    title: "Sleep & recovery",
                    desc: "Debt builds quietly. Output drops loudly.",
                  },
                  {
                    title: "Training load",
                    desc: "Too much intensity + not enough repair.",
                  },
                  {
                    title: "Nutrition & consistency",
                    desc: "Macros matter. So does compliance.",
                  },
                  {
                    title: "Stress & nervous system",
                    desc: "Cortisol up. Adaptation down.",
                  },
                  {
                    title: "Biomarkers & hormones",
                    desc: "Signals don’t lie — they just get ignored.",
                  },
                ].map((x) => (
                  <div
                    key={x.title}
                    className="rounded-xl border border-white/10 bg-black/30 p-5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-white/80">
                        {x.title}
                      </div>
                      <div className="text-xs text-white/40">cause</div>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-white/60">
                      {x.desc}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-xl border border-white/10 bg-black/40 p-5">
                <p className="text-sm leading-relaxed text-white/60">
                  Re:Formd doesn’t guess. We identify which upstream levers are
                  off — then rebuild the system around the truth.
                </p>
              </div>
            </div>

            <p className="mt-6 text-xs text-white/40">
              Upstream work looks boring. It changes everything.
            </p>
          </div>
        </div>

        {/* Bottom bridge line into Optimize */}
        <div className="mx-auto mt-24 max-w-4xl text-center">
          <p className="text-2xl md:text-3xl font-light text-white/70">
            Once you understand the cause…
          </p>
          <p className="mt-4 text-3xl md:text-4xl font-semibold tracking-tight text-white">
            you can build the fix.
          </p>
        </div>
      </section>

      {/* SECTION 4 — THE FRAMEWORK */}
      <section id="method" className="relative mx-auto max-w-6xl px-6 py-28">
        {/* Subtle background */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-black" />
          <div className="absolute left-1/2 top-16 h-[420px] w-[760px] -translate-x-1/2 rounded-full bg-gradient-to-r from-white/6 via-white/3 to-transparent blur-3xl" />
        </div>

        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <div className="text-sm uppercase tracking-widest text-white/50">
              The System
            </div>
            <h2 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight">
              Diagnose. Explain. Optimize. Track. Adapt.
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/70">
              This is how we rebuild the human system — step by step,
              measurable, repeatable, and brutally effective.
            </p>
          </div>

          {/* Step Bar */}
          <div className="mt-14 rounded-3xl border border-white/10 bg-white/5 p-3 backdrop-blur">
            <div className="grid gap-3 md:grid-cols-5">
              {[
                {
                  k: "01",
                  title: "Diagnose",
                  desc: "Find the signal. Baseline the truth.",
                  accent: "from-cyan-400/30 via-white/10 to-transparent",
                },
                {
                  k: "02",
                  title: "Explain",
                  desc: "Map upstream cause → downstream symptom.",
                  accent: "from-indigo-400/30 via-white/10 to-transparent",
                },
                {
                  k: "03",
                  title: "Optimize",
                  desc: "Build protocols for training, sleep, nutrition.",
                  accent: "from-emerald-400/30 via-white/10 to-transparent",
                },
                {
                  k: "04",
                  title: "Track",
                  desc: "Measure compliance and outcomes weekly.",
                  accent: "from-amber-400/30 via-white/10 to-transparent",
                },
                {
                  k: "05",
                  title: "Adapt",
                  desc: "Adjust the system. Keep what works.",
                  accent: "from-red-400/30 via-white/10 to-transparent",
                },
              ].map((s) => (
                <div
                  key={s.k}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-5"
                >
                  {/* Accent glow */}
                  <div
                    className={`pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-r ${s.accent}`}
                  />
                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <div className="text-xs tracking-widest text-white/40">
                        {s.k}
                      </div>
                      <div className="text-xs text-white/30">step</div>
                    </div>

                    <div className="mt-4 text-lg font-semibold text-white/85">
                      {s.title}
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-white/60">
                      {s.desc}
                    </p>

                    <div className="mt-5 h-px w-10 bg-white/15" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Big takeaway row */}
          <div className="mx-auto mt-14 grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Not vibes. Variables.",
                body: "We work from signal: labs, sleep, training load, recovery, consistency.",
              },
              {
                title: "Protocols, not hacks.",
                body: "A system you can actually follow — built around your real life.",
              },
              {
                title: "Feedback loop.",
                body: "Track → adapt → repeat. That’s how results become permanent.",
              },
            ].map((b) => (
              <div
                key={b.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
              >
                <div className="text-lg font-semibold text-white/80">
                  {b.title}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-white/60">
                  {b.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5 — INFRASTRUCTURE */}
      {/* SECTION 5 — TRACK */}
      <section id="track" className="relative mx-auto max-w-6xl px-6 py-28">
        {/* Background depth */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-black" />
          <div className="absolute left-1/2 top-16 h-[420px] w-[760px] -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-400/10 via-white/4 to-transparent blur-3xl" />
        </div>

        <div className="mx-auto grid max-w-5xl items-start gap-16 md:grid-cols-2">
          {/* LEFT */}
          <div>
            <div className="text-sm uppercase tracking-widest text-white/50">
              Step 4
            </div>

            <h2 className="mt-4 text-5xl font-semibold tracking-tight">
              Track what matters.
            </h2>

            <p className="mt-8 max-w-xl text-lg leading-relaxed text-white/70">
              Most people “try harder” and hope it works. We measure the inputs,
              watch the signals, and adjust with proof.
            </p>

            <div className="mt-10 space-y-4 text-lg text-white/70">
              <div className="border-l-2 border-white/20 pl-4">
                Compliance drives outcomes.
              </div>
              <div className="border-l-2 border-white/20 pl-4">
                Signals reveal what’s working.
              </div>
              <div className="border-l-2 border-white/20 pl-4">
                Trends beat opinions.
              </div>
            </div>

            <div className="mt-12 h-px w-24 bg-white/20" />

            <p className="mt-10 text-lg leading-relaxed text-white/80">
              If you can’t track it, you can’t own it.
            </p>
          </div>

          {/* RIGHT — TRACKING CARD */}
          <div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold tracking-wide text-white/70">
                  WEEKLY SCORECARD
                </div>
                <div className="text-sm text-white/50">Week 3</div>
              </div>

              {/* Overall score */}
              <div className="mt-6 rounded-xl border border-white/10 bg-black/30 p-5">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-white/60">System Score</div>
                  <div className="text-sm font-semibold text-white/80">82</div>
                </div>
                <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[82%] rounded-full bg-gradient-to-r from-amber-400/70 via-white/20 to-white/10" />
                </div>
                <div className="mt-3 text-xs text-white/40">
                  Up 11 points from baseline
                </div>
              </div>

              {/* Metrics grid */}
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {[
                  { label: "Sleep", val: "7.2h", note: "avg", trend: "↑" },
                  {
                    label: "Training",
                    val: "4/5",
                    note: "sessions",
                    trend: "→",
                  },
                  {
                    label: "Nutrition",
                    val: "83%",
                    note: "compliance",
                    trend: "↑",
                  },
                  {
                    label: "Recovery",
                    val: "Good",
                    note: "readiness",
                    trend: "↑",
                  },
                ].map((m) => (
                  <div
                    key={m.label}
                    className="rounded-xl border border-white/10 bg-black/30 p-5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-white/60">{m.label}</div>
                      <div className="text-sm font-semibold text-white/70">
                        {m.trend}
                      </div>
                    </div>
                    <div className="mt-3 text-xl font-semibold text-white/80">
                      {m.val}
                    </div>
                    <div className="mt-1 text-xs text-white/40">{m.note}</div>
                  </div>
                ))}
              </div>

              {/* Insight block */}
              <div className="mt-6 rounded-xl border border-white/10 bg-black/40 p-5">
                <div className="text-xs uppercase tracking-widest text-white/40">
                  Insight
                </div>
                <p className="mt-3 text-sm leading-relaxed text-white/60">
                  Your recovery improved as sleep consistency stabilized. Keep
                  the same training load for 7 more days — then we increase.
                </p>
              </div>
            </div>

            <p className="mt-6 text-xs text-white/40">
              Track → learn → adjust. That’s how results become permanent.
            </p>
          </div>
        </div>

        {/* Full-width takeaway */}
        <div className="mx-auto mt-24 max-w-4xl text-center">
          <p className="text-2xl md:text-3xl font-light text-white/70">
            Data doesn’t judge you.
          </p>
          <p className="mt-4 text-3xl md:text-4xl font-semibold tracking-tight text-white">
            It shows you exactly what to do next.
          </p>
        </div>
      </section>

      {/* SECTION 6 — WHO IT’S FOR */}
      {/* SECTION 6 — WHO IT’S BUILT FOR */}
      <section id="who" className="relative mx-auto max-w-6xl px-6 py-28">
        {/* Background shift (cleaner, neutral tone) */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-black" />
          <div className="absolute left-1/2 top-20 h-[420px] w-[760px] -translate-x-1/2 rounded-full bg-gradient-to-r from-white/8 via-white/3 to-transparent blur-3xl" />
        </div>

        <div className="mx-auto max-w-5xl text-center">
          <div className="text-sm uppercase tracking-widest text-white/50">
            Who It’s Built For
          </div>

          <h2 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight">
            Not for everyone.
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/70">
            Re:Formd is for people who are done guessing — and ready to treat
            their body like a system worth optimizing.
          </p>
        </div>

        {/* Audience Cards */}
        <div className="mx-auto mt-16 grid max-w-5xl gap-6 md:grid-cols-3">
          {[
            {
              title: "High Performers",
              body: "You train. You build. You carry responsibility. You don’t accept average — but lately something feels off.",
            },
            {
              title: "Busy Operators",
              body: "Work is demanding. Family is real. Time is tight. You need structure — not another health hobby.",
            },
            {
              title: "Aging Competitors",
              body: "You still want strength, clarity, and energy — but recovery doesn’t hit like it used to.",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur transition duration-300 hover:border-white/20"
            >
              <div className="text-xl font-semibold text-white/85">
                {card.title}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-white/60">
                {card.body}
              </p>
              <div className="mt-6 h-px w-12 bg-white/15 transition-all duration-300 group-hover:w-20" />
            </div>
          ))}
        </div>

        {/* Not For Block */}
        <div className="mx-auto mt-20 max-w-4xl rounded-2xl border border-white/10 bg-black/40 p-8 text-center">
          <div className="text-sm uppercase tracking-widest text-white/40">
            Not For
          </div>
          <p className="mt-6 text-lg leading-relaxed text-white/70">
            People looking for quick hacks, magic supplements, or someone else
            to do the work for them.
          </p>
          <p className="mt-6 text-2xl font-semibold tracking-tight text-white">
            This is ownership.
          </p>
        </div>

        {/* Closing Statement */}
        <div className="mx-auto mt-24 max-w-4xl text-center">
          <p className="text-2xl md:text-3xl font-light text-white/70">
            If you want real structure —
          </p>
          <p className="mt-4 text-3xl md:text-4xl font-semibold tracking-tight text-white">
            this was built for you.
          </p>
        </div>
      </section>

      {/* FINAL SECTION — CALL TO ACTION */}
      <section
        id="cta"
        className="relative mx-auto max-w-6xl px-6 py-36 text-center"
      >
        {/* Deep contrast background */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-black" />
          <div className="absolute left-1/2 top-10 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-r from-white/10 via-white/5 to-transparent blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl">
          <div className="text-sm uppercase tracking-widest text-white/40">
            The Decision
          </div>

          <h2 className="mt-6 text-4xl md:text-6xl font-semibold tracking-tight leading-tight">
            Stop guessing.
            <br />
            Start rebuilding.
          </h2>

          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-white/70">
            Diagnose the truth. Build the protocol. Track the signal. Adapt
            until your system performs the way it was designed to.
          </p>

          {/* Buttons */}
          <div className="mt-12 flex flex-col items-center justify-center gap-6 sm:flex-row">
            <a
              href="#get-started"
              className="rounded-2xl bg-white px-10 py-4 text-base font-semibold text-black transition hover:opacity-90"
            >
              Start Your System
            </a>

            <a
              href="#learn-more"
              className="rounded-2xl border border-white/20 px-10 py-4 text-base font-semibold text-white transition hover:border-white/40"
            >
              See How It Works
            </a>
          </div>

          {/* Final Statement */}
          <div className="mt-20">
            <p className="text-2xl md:text-3xl font-light text-white/60">
              You’re not broken.
            </p>
            <p className="mt-4 text-3xl md:text-5xl font-semibold tracking-tight text-white">
              You just need a system.
            </p>
          </div>

          {/* Micro trust line */}
          <p className="mt-10 text-xs text-white/40">
            Structured health optimization. Built to Last.
          </p>
        </div>
      </section>
      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-black">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid gap-3 text-sm text-white/60 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "About",
              "Health Optimization Framework",
              "Biomarker Tracking",
              "Hormone Optimization",
              "Research & Methodology",
              "Ethics",
              "Privacy Policy",
              "Terms of Service",
            ].map((x) => (
              <div key={x} className="py-1">
                {x}
              </div>
            ))}
          </div>

          <div className="mt-10 text-xs text-white/40">
            © {year} Re:Formd. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
