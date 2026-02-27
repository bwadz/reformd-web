"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";

type WaitlistResponse = {
  already?: boolean;
  error?: string;
};

export default function HomePage() {
  const year = useMemo(() => new Date().getFullYear(), []);

  const [toast, setToast] = useState<string | null>(null);
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    goal: "",
    biggest_issue: "",
    timeframe: "",
    notes: "",
  });

  function onJoinWaitlist() {
    setWaitlistOpen(true);
  }

  function closeWaitlist() {
    setWaitlistOpen(false);
  }

  async function submitWaitlist() {
    const email = form.email.trim().toLowerCase();

    if (!email) {
      setToast("Email is required.");
      setTimeout(() => setToast(null), 2500);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, email }),
      });

      let data: WaitlistResponse | null = null;
      try {
        data = (await res.json()) as WaitlistResponse;
      } catch {
        data = null;
      }

      if (!res.ok) {
        throw new Error(data?.error ?? "Failed to submit.");
      }

      closeWaitlist();
      setForm({
        full_name: "",
        email: "",
        goal: "",
        biggest_issue: "",
        timeframe: "",
        notes: "",
      });

      const msg = data?.already
        ? "You’re already on the list."
        : "You’re in. Welcome to Re:Formd.";

      setToast(msg);
      setTimeout(() => setToast(null), 3000);
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : "Something broke. Try again.";
      setToast(message);
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <div className="min-h-screen bg-black text-white">
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

          <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-center px-4 sm:px-6 py-10 sm:py-16">
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
                Your body isn’t failing.
                <br />
                It’s reacting.
                <br />
                <br />
                Years of stress. Poor recovery. Neglect.
                <br />
                <br />
                <span className="text-white/80 font-semibold">
                  Fix the machine to relieve the symptoms.
                </span>
              </p>

              {/* WAITLIST (button-only) */}
              <div className="mt-7 sm:mt-8 flex flex-col sm:flex-row sm:items-center gap-3">
                <button
                  onClick={onJoinWaitlist}
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-white px-8 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
                >
                  JOIN THE WAITLIST
                </button>

                <p className="text-xs text-white/50">
                  Early access invites. No spam.
                </p>
              </div>

              <p className="mt-5 sm:mt-6 text-sm leading-relaxed text-white/60">
                Re:Formd is an AI structured health optimization platform built
                on biomarker tracking, evaluation of pathway failures, protocol
                design, accountability, and data-driven performance systems.
              </p>
            </div>
          </div>
        </section>

        {/* WAITLIST MODAL */}
        {waitlistOpen && (
          <div className="fixed inset-0 z-[60]">
            {/* Backdrop */}
            <button
              onClick={closeWaitlist}
              className="absolute inset-0 bg-black/70"
              aria-label="Close waitlist modal"
            />

            {/* Modal */}
            <div
              className="absolute left-1/2 top-1/2 w-[92%] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-black/10 bg-white p-6 sm:p-8 text-black shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-label="Join the waitlist"
            >
              <div className="flex items-start justify-between gap-6">
                <div>
                  <div className="text-xs uppercase tracking-widest text-black/50">
                    Join the Waitlist
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <Image
                      src="/images/01-swirl-white.png"
                      alt="Re:Formd mark"
                      width={28}
                      height={28}
                      className="invert"
                    />
                    <h3 className="text-2xl font-semibold text-black">
                      Built to Last.
                    </h3>
                  </div>

                  <p className="mt-2 text-sm text-black/60">
                    Email is required. Everything else is optional.
                  </p>
                </div>

                <button
                  onClick={closeWaitlist}
                  className="text-black/50 hover:text-black"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <div className="mt-6 grid gap-3">
                <input
                  value={form.full_name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, full_name: e.target.value }))
                  }
                  placeholder="Full name (optional)"
                  className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-black/40 outline-none ring-0 focus:border-black/25 focus:outline-none"
                />

                <input
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  placeholder="Email (required)"
                  type="email"
                  className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-black/40 outline-none ring-0 focus:border-black/25 focus:outline-none"
                />

                <input
                  value={form.goal}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, goal: e.target.value }))
                  }
                  placeholder="Primary goal (optional)"
                  className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-black/40 outline-none ring-0 focus:border-black/25 focus:outline-none"
                />

                <input
                  value={form.biggest_issue}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, biggest_issue: e.target.value }))
                  }
                  placeholder="Biggest bottleneck right now? (optional)"
                  className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-black/40 outline-none ring-0 focus:border-black/25 focus:outline-none"
                />

                <input
                  value={form.timeframe}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, timeframe: e.target.value }))
                  }
                  placeholder="Timeframe (e.g., 30 days / 90 days) (optional)"
                  className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-black/40 outline-none ring-0 focus:border-black/25 focus:outline-none"
                />

                <textarea
                  value={form.notes}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, notes: e.target.value }))
                  }
                  placeholder="Anything else? (optional)"
                  rows={3}
                  className="resize-none rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-black/40 outline-none ring-0 focus:border-black/25 focus:outline-none"
                />
              </div>

              <div className="mt-6 flex items-center justify-between gap-4">
                <p className="text-xs text-black/50">
                  By submitting, you agree to receive waitlist updates.
                </p>

                <button
                  onClick={submitWaitlist}
                  disabled={submitting}
                  className="rounded-2xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                >
                  {submitting ? "Submitting…" : "Submit"}
                </button>
              </div>
            </div>
          </div>
        )}

        {toast && (
          <div className="fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 rounded-full border border-white/15 bg-black/90 px-4 py-2 text-sm text-white/80">
            {toast}
          </div>
        )}

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
      </div>
    </div>
  );
}
