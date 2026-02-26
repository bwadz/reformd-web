"use client";

import { useMemo, useState } from "react";

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
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full border border-white/15" />
            <div className="leading-tight">
              <div className="text-sm tracking-[0.22em] text-white/70">
                RE:FORMD
              </div>
              <div className="text-xs text-white/50">Built to Last</div>
            </div>
          </div>

          <nav className="hidden items-center gap-6 md:flex">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => scrollToId(n.id)}
                className="text-sm text-white/70 hover:text-white"
              >
                {n.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={onJoinWaitlist}
              className="rounded-full border border-white/20 px-4 py-2 text-sm text-white hover:border-white/40"
            >
              Join the Waitlist
            </button>
          </div>
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
              Years of stress. Poor recovery. Inflammation. Neglect.
              <br />
              Fix the machine.
              <br />
              Relieve the symptoms.
            </p>

            <p className="mt-6 text-sm leading-relaxed text-white/60">
              A structured health optimization platform built on biomarker
              tracking, hormone optimization, and data-driven performance
              systems.
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
              Built for people done guessing.
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

      {/* SECTION 3 — UPSTREAM HEALTH */}
      <section
        id="upstream"
        className="border-y border-white/10 bg-white/[0.03]"
      >
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold md:text-4xl">
              Fix the Root.
            </h2>
            <p className="mt-8 text-lg leading-relaxed text-white/80">
              Energy, recovery, hormone balance, inflammation, metabolic health
              — they are connected.
            </p>
            <p className="mt-6 text-lg leading-relaxed text-white/80">
              We use structured assessment and biomarker tracking to identify
              upstream drivers and correct them.
            </p>
            <div className="mt-10 space-y-2 text-lg text-white/70">
              <div>No hacks.</div>
              <div>No surface fixes.</div>
              <div>Data-driven longevity.</div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 — THE FRAMEWORK */}
      <section id="framework" className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="text-3xl font-semibold md:text-4xl">
          Diagnose. Explain. Optimize. Track. Adapt.
        </h2>

        <div className="mt-12 grid gap-4 md:grid-cols-5">
          {[
            {
              t: "Diagnose",
              b: "Know your baseline. Biomarkers. Performance inputs.",
            },
            { t: "Explain", b: "Identify upstream bottlenecks." },
            {
              t: "Optimize",
              b: "Structured protocols across training, recovery, nutrition, and hormone optimization.",
            },
            {
              t: "Track",
              b: "Daily performance scoring and measurable change.",
            },
            { t: "Adapt", b: "Refine based on real data." },
          ].map((x) => (
            <div
              key={x.t}
              className="rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <div className="text-sm tracking-[0.22em] text-white/60">
                {x.t.toUpperCase()}
              </div>
              <div className="mt-3 text-base leading-relaxed text-white/85">
                {x.b}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-lg text-white/70">
          No guessing.
          <br />
          No biohacking roulette.
        </div>
      </section>

      {/* SECTION 5 — INFRASTRUCTURE */}
      <section
        id="infrastructure"
        className="border-y border-white/10 bg-white/[0.03]"
      >
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold md:text-4xl">
              This Isn’t Wellness.
            </h2>
            <p className="mt-8 text-lg leading-relaxed text-white/80">
              It’s infrastructure.
            </p>
            <p className="mt-6 text-lg leading-relaxed text-white/80">
              A health optimization platform designed for measurable
              performance.
            </p>

            <ul className="mt-10 grid gap-3 sm:grid-cols-2">
              {[
                "Biomarker tracking",
                "Hormone optimization",
                "Structured protocols",
                "Performance analytics",
                "Longevity modeling",
              ].map((x) => (
                <li
                  key={x}
                  className="rounded-xl border border-white/10 bg-black/30 px-5 py-3 text-white/80"
                >
                  {x}
                </li>
              ))}
            </ul>

            <p className="mt-10 text-lg leading-relaxed text-white/70">
              Built for long-term function — not short-term hype.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 6 — WHO IT’S FOR */}
      <section id="who" className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="text-3xl font-semibold md:text-4xl">
          Built for People Who Refuse to Drift.
        </h2>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {["Entrepreneurs", "Athletes", "Parents", "Leaders"].map((x) => (
            <div
              key={x}
              className="rounded-2xl border border-white/10 bg-white/5 p-6"
            >
              <div className="text-lg font-semibold">{x}</div>
            </div>
          ))}
        </div>

        <p className="mt-10 text-lg leading-relaxed text-white/80">
          If you want your edge back — and proof it’s working — this is your
          system.
        </p>
      </section>

      {/* FINAL CTA */}
      <section className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="max-w-3xl">
            <h2 className="text-4xl font-semibold leading-tight md:text-5xl">
              Stop Managing Symptoms.
              <br />
              Start Rebuilding the Machine.
            </h2>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                onClick={onJoinWaitlist}
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black hover:bg-white/90"
              >
                JOIN THE WAITLIST
              </button>
              <div className="text-sm text-white/60">
                Structured health optimization for energy, performance, and
                longevity.
              </div>
            </div>
          </div>
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
