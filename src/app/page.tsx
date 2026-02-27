"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";

type ToastType = "success" | "error" | "accent";

export default function HomePage() {
  const year = useMemo(() => new Date().getFullYear(), []);

  const [toast, setToast] = useState<{ msg: string; type: ToastType } | null>(
    null,
  );
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    goal: "",
    biggest_issue: "",
    timeframe: "",
    notes: "",
    // Honeypot (bots will fill; humans won't see)
    website: "",
  });

  function showToast(msg: string, type: ToastType = "success", ms = 3000) {
    setToast({ msg, type });
    window.setTimeout(() => setToast(null), ms);
  }

  function onJoinWaitlist() {
    setWaitlistOpen(true);
  }

  function closeWaitlist() {
    setWaitlistOpen(false);
  }

  async function submitWaitlist() {
    const email = form.email.trim().toLowerCase();

    // Green accent callout
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (!emailRegex.test(email)) {
      showToast("Enter a valid email address.", "accent", 2500);
      return;
    }

    // Honeypot check (quietly succeed so bots think it worked)
    if (form.website.trim().length > 0) {
      closeWaitlist();
      showToast("You’re in. Welcome to Re:Formd.", "success", 3000);
      setForm({
        full_name: "",
        email: "",
        goal: "",
        biggest_issue: "",
        timeframe: "",
        notes: "",
        website: "",
      });
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
          website: form.website || "", // honeypot
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

      closeWaitlist();
      setForm({
        full_name: "",
        email: "",
        goal: "",
        biggest_issue: "",
        timeframe: "",
        notes: "",
        website: "",
      });

      const already =
        typeof data === "object" && data !== null && "already" in data
          ? Boolean((data as { already?: unknown }).already)
          : false;

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

        {/* Desktop+: directional overlay */}
        <div className="absolute inset-0 hidden sm:block bg-gradient-to-r from-black/80 via-black/45 to-black/10" />

        {/* Bottom fade */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/55" />

        <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-center px-4 sm:px-6 py-12 sm:py-16">
          <div className="max-w-2xl">
            <div className="mb-4 text-[11px] sm:text-xs tracking-[0.24em] text-white/60">
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

            {/* Waitlist button */}
            <div className="mt-7 sm:mt-8">
              <button
                onClick={onJoinWaitlist}
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-white px-8 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
              >
                JOIN THE WAITLIST
              </button>
              <p className="mt-3 text-xs text-white/50">
                Early access invites. No spam.
              </p>
            </div>

            <p className="mt-5 sm:mt-6 text-sm leading-relaxed text-white/60">
              Re:Formd is an AI-driven health optimization system that analyzes
              your biology, identifies breakdowns in performance pathways, and
              rebuilds them with structured, accountable, data-backed protocols.
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
            className="absolute left-1/2 top-1/2 w-[94%] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-[28px] border border-black/10 bg-white p-6 sm:p-8 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Join the waitlist"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-6">
              <div className="flex items-start gap-3">
                <Image
                  src="/images/01-swirl-black copy.png"
                  alt="Re:Formd"
                  width={26}
                  height={26}
                />
                <div>
                  <div className="text-[11px] uppercase tracking-[0.24em] text-black/45">
                    Join the Waitlist
                  </div>
                  <h3 className="mt-2 text-2xl font-semibold text-black">
                    Built to Last.
                  </h3>
                  <p className="mt-2 text-sm text-black/60">
                    Email is required. Everything else is optional.
                  </p>
                </div>
              </div>

              <button
                onClick={closeWaitlist}
                className="text-black/40 hover:text-black/70"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Fields */}
            <div className="mt-6 grid gap-3">
              {/* Honeypot: hidden from humans */}
              <input
                value={form.website}
                onChange={(e) =>
                  setForm((f) => ({ ...f, website: e.target.value }))
                }
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
              />

              <input
                value={form.full_name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, full_name: e.target.value }))
                }
                placeholder="Full name (optional)"
                className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-black/40 outline-none ring-0 focus:border-black/25"
              />

              <input
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                placeholder="Email (required)"
                type="email"
                className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-black/40 outline-none ring-0 focus:border-black/25"
              />

              <input
                value={form.goal}
                onChange={(e) =>
                  setForm((f) => ({ ...f, goal: e.target.value }))
                }
                placeholder="Primary goal (optional)"
                className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-black/40 outline-none ring-0 focus:border-black/25"
              />

              <input
                value={form.biggest_issue}
                onChange={(e) =>
                  setForm((f) => ({ ...f, biggest_issue: e.target.value }))
                }
                placeholder="Biggest bottleneck right now? (optional)"
                className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-black/40 outline-none ring-0 focus:border-black/25"
              />

              <input
                value={form.timeframe}
                onChange={(e) =>
                  setForm((f) => ({ ...f, timeframe: e.target.value }))
                }
                placeholder="Timeframe (e.g., 30 days / 90 days) (optional)"
                className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-black/40 outline-none ring-0 focus:border-black/25"
              />

              <textarea
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
                placeholder="Anything else? (optional)"
                rows={3}
                className="resize-none rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-black/40 outline-none ring-0 focus:border-black/25"
              />
            </div>

            {/* Footer */}
            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-black/45">
                By submitting, you agree to receive waitlist updates.
              </p>

              <button
                onClick={submitWaitlist}
                disabled={submitting}
                className="inline-flex items-center justify-center rounded-2xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {submitting ? "Submitting…" : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 rounded-full border px-4 py-2 text-sm ${toastClass}`}
        >
          {toast.msg}
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
  );
}
