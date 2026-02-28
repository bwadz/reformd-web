"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";

type ToastType = "success" | "error" | "accent";

type WaitlistForm = {
  // required
  full_name: string;
  email: string;
  age_bracket: string;
  gender: string;

  // optional
  goal: string; // pipe-separated checkbox values
  biggest_issue: string; // pipe-separated checkbox values
  notes: string; // pipe-separated checkbox values
  timeframe: string;

  // anti-spam
  website: string; // honeypot

  // attribution
  landing_url: string;
  referrer: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function isValidEmail(email: string) {
  return EMAIL_REGEX.test(email.trim().toLowerCase());
}

function splitPipe(s: string) {
  return s
    .split("|")
    .map((x) => x.trim())
    .filter(Boolean);
}

function togglePipeValue(current: string, value: string, checked: boolean) {
  const set = new Set(splitPipe(current));
  if (checked) set.add(value);
  else set.delete(value);
  return Array.from(set).join(" | ");
}

const initialForm: WaitlistForm = {
  full_name: "",
  email: "",
  age_bracket: "",
  gender: "",

  goal: "",
  biggest_issue: "",
  notes: "",
  timeframe: "",

  website: "",

  landing_url: "",
  referrer: "",
  utm_source: "",
  utm_medium: "",
  utm_campaign: "",
  utm_content: "",
  utm_term: "",
};

export default function HomePage() {
  const year = useMemo(() => new Date().getFullYear(), []);

  const [toast, setToast] = useState<{ msg: string; type: ToastType } | null>(
    null,
  );
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState<WaitlistForm>(initialForm);

  // Populate attribution safely on client after mount
  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      setForm((prev) => ({
        ...prev,
        landing_url: window.location.href || "",
        referrer: document.referrer || "",
        utm_source: sp.get("utm_source") || "",
        utm_medium: sp.get("utm_medium") || "",
        utm_campaign: sp.get("utm_campaign") || "",
        utm_content: sp.get("utm_content") || "",
        utm_term: sp.get("utm_term") || "",
      }));
    } catch {
      // ignore
    }
  }, []);

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

  function resetForm() {
    // Keep attribution fields (so they survive a submit)
    setForm((prev) => ({
      ...initialForm,
      landing_url: prev.landing_url,
      referrer: prev.referrer,
      utm_source: prev.utm_source,
      utm_medium: prev.utm_medium,
      utm_campaign: prev.utm_campaign,
      utm_content: prev.utm_content,
      utm_term: prev.utm_term,
    }));
  }

  async function submitWaitlist() {
    const email = form.email.trim().toLowerCase();

    // Required validation
    if (!form.full_name.trim()) {
      showToast("Name is required.", "accent", 2500);
      return;
    }
    if (!email) {
      showToast("Email is required.", "accent", 2500);
      return;
    }
    if (!isValidEmail(email)) {
      showToast("Enter a valid email address.", "accent", 2500);
      return;
    }
    if (!form.age_bracket) {
      showToast("Age bracket is required.", "accent", 2500);
      return;
    }
    if (!form.gender) {
      showToast("Gender is required.", "accent", 2500);
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
          full_name: form.full_name.trim() || null,
          email,
          age_bracket: form.age_bracket || null,
          gender: form.gender || null,

          goal: form.goal || null,
          biggest_issue: form.biggest_issue || null,
          timeframe: form.timeframe || null,
          notes: form.notes || null,

          // attribution
          landing_url: form.landing_url || null,
          referrer: form.referrer || null,
          utm_source: form.utm_source || null,
          utm_medium: form.utm_medium || null,
          utm_campaign: form.utm_campaign || null,
          utm_content: form.utm_content || null,
          utm_term: form.utm_term || null,

          // honeypot
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
        already ? "You’re already on the list." : "Check your email to verify.",
        "success",
        3200,
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
            type="button"
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
        <div className="absolute inset-0 bg-black/85 sm:hidden" />
        <div className="absolute inset-0 hidden sm:block bg-gradient-to-r from-black/80 via-black/45 to-black/10" />
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

            <div className="mt-7 sm:mt-8 flex flex-col sm:flex-row sm:items-center gap-3">
              <button
                onClick={onJoinWaitlist}
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-white px-8 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
                type="button"
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

      {/* SECTION 2 (kept as-is from your version) */}
      <section
        id="problem"
        className="relative mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20 lg:py-24 overflow-hidden"
      >
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-black" />
          <div className="absolute left-1/2 top-16 h-[360px] w-[720px] -translate-x-1/2 rounded-full bg-gradient-to-r from-red-500/10 via-amber-400/5 to-transparent blur-3xl" />
        </div>

        <div className="mx-auto grid max-w-5xl items-start gap-10 lg:gap-14 lg:grid-cols-2">
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
              type="button"
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
          role="status"
          aria-live="polite"
        >
          {toast.msg}
        </div>
      )}

      {/* WAITLIST MODAL */}
      {waitlistOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center px-4"
          aria-modal="true"
          role="dialog"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeWaitlist();
          }}
        >
          <div className="absolute inset-0 bg-black/70" />

          <div className="relative w-full max-w-2xl rounded-3xl border border-black/10 bg-white text-black shadow-2xl max-h-[90svh] flex flex-col">
            {/* TOP: Brand */}
            <div className="flex items-center justify-between gap-4 border-b border-black/10 px-6 py-5 sm:px-8">
              <div className="flex items-center gap-3">
                <Image
                  src="/images/05-vertical-complete-black.png"
                  alt="Re:Formd"
                  width={130}
                  height={52}
                  priority
                />
              </div>

              <button
                onClick={closeWaitlist}
                className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-sm text-black/70 hover:bg-black/5"
                aria-label="Close"
                type="button"
              >
                ✕
              </button>
            </div>

            {(() => {
              const email = form.email.trim().toLowerCase();
              const emailValid = isValidEmail(email);

              const canSubmit =
                emailValid &&
                form.full_name.trim().length > 0 &&
                form.age_bracket.trim().length > 0 &&
                form.gender.trim().length > 0 &&
                !submitting;

              const emailColor =
                form.email.trim().length === 0
                  ? "text-black/45"
                  : emailValid
                    ? "text-emerald-700"
                    : "text-red-600";

              const emailHelp =
                form.email.trim().length === 0
                  ? "We’ll send a verification link."
                  : emailValid
                    ? "Valid email. Ready to send."
                    : "That doesn’t look like a real email — fix it to continue.";

              return (
                <div className="px-6 py-6 sm:px-8 sm:py-7 overflow-y-auto overscroll-contain flex-1">
                  {/* REQUIRED */}
                  <div>
                    <div className="text-[13px] font-extrabold tracking-[0.22em] text-black/75">
                      REQUIRED DETAILS
                    </div>
                    <p className="mt-2 text-xs text-black/55">
                      You’re not on the list until you confirm via email.
                    </p>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      {/* Name */}
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-black/60">
                          Name <span className="text-red-600">*</span>
                        </label>
                        <input
                          value={form.full_name}
                          onChange={(e) =>
                            setForm({ ...form, full_name: e.target.value })
                          }
                          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-black/40 outline-none focus:border-black/25"
                          placeholder="Brant"
                          autoComplete="name"
                        />
                        {form.full_name.trim().length === 0 ? (
                          <div className="mt-2 text-xs font-semibold text-red-600">
                            Name is required.
                          </div>
                        ) : (
                          <div className="mt-2 text-xs font-semibold text-emerald-700">
                            Solid. ✅
                          </div>
                        )}
                      </div>

                      {/* Email */}
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-black/60">
                          Email <span className="text-red-600">*</span>
                        </label>
                        <input
                          value={form.email}
                          onChange={(e) =>
                            setForm({ ...form, email: e.target.value })
                          }
                          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black placeholder:text-black/40 outline-none focus:border-black/25"
                          placeholder="you@domain.com"
                          autoComplete="email"
                          inputMode="email"
                        />
                        <div
                          className={`mt-2 text-xs font-semibold ${emailColor}`}
                        >
                          {emailHelp}
                        </div>
                      </div>

                      {/* Age bracket */}
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-black/60">
                          Age bracket <span className="text-red-600">*</span>
                        </label>
                        <select
                          value={form.age_bracket}
                          onChange={(e) =>
                            setForm({ ...form, age_bracket: e.target.value })
                          }
                          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none focus:border-black/25"
                        >
                          <option value="" disabled>
                            Select…
                          </option>
                          <option value="18-24">18–24</option>
                          <option value="25-34">25–34</option>
                          <option value="35-44">35–44</option>
                          <option value="45-54">45–54</option>
                          <option value="55-64">55–64</option>
                          <option value="65+">65+</option>
                        </select>
                        {!form.age_bracket ? (
                          <div className="mt-2 text-xs font-semibold text-red-600">
                            Age bracket is required.
                          </div>
                        ) : null}
                      </div>

                      {/* Gender */}
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-black/60">
                          Gender <span className="text-red-600">*</span>
                        </label>
                        <select
                          value={form.gender}
                          onChange={(e) =>
                            setForm({ ...form, gender: e.target.value })
                          }
                          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none focus:border-black/25"
                        >
                          <option value="" disabled>
                            Select…
                          </option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="nonbinary">Non-binary</option>
                          <option value="prefer_not_say">
                            Prefer not to say
                          </option>
                        </select>
                        {!form.gender ? (
                          <div className="mt-2 text-xs font-semibold text-red-600">
                            Gender is required.
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {/* OPTIONAL */}
                  <div className="mt-7 border-t border-black/10 pt-6">
                    <div className="text-[13px] font-extrabold tracking-[0.22em] text-black/75">
                      OPTIONAL DETAILS
                    </div>
                    <p className="mt-2 text-xs text-black/55">
                      Pick what fits. This improves what we send you.
                    </p>

                    {/* Primary goals */}
                    <div className="mt-5">
                      <div className="text-xs font-semibold text-black/60">
                        Primary goals
                      </div>
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {[
                          "Lose fat + keep muscle",
                          "Fix energy + focus",
                          "Build strength + performance",
                          "Balance hormones + recovery",
                          "Improve labs + longevity",
                          "Build better health habits",
                        ].map((label) => (
                          <label
                            key={label}
                            className="flex cursor-pointer items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black/75 hover:bg-black/5"
                          >
                            <input
                              type="checkbox"
                              className="h-4 w-4"
                              checked={splitPipe(form.goal).includes(label)}
                              onChange={(e) =>
                                setForm((prev) => ({
                                  ...prev,
                                  goal: togglePipeValue(
                                    prev.goal,
                                    label,
                                    e.target.checked,
                                  ),
                                }))
                              }
                            />
                            {label}
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Issues */}
                    <div className="mt-6">
                      <div className="text-xs font-semibold text-black/60">
                        Biggest issues
                      </div>
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {[
                          "Low energy / fatigue",
                          "Brain fog / focus",
                          "Poor sleep",
                          "Weight gain / stalled",
                          "Low drive / motivation",
                          "Chronic aches / inflammation",
                        ].map((label) => (
                          <label
                            key={label}
                            className="flex cursor-pointer items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black/75 hover:bg-black/5"
                          >
                            <input
                              type="checkbox"
                              className="h-4 w-4"
                              checked={splitPipe(form.biggest_issue).includes(
                                label,
                              )}
                              onChange={(e) =>
                                setForm((prev) => ({
                                  ...prev,
                                  biggest_issue: togglePipeValue(
                                    prev.biggest_issue,
                                    label,
                                    e.target.checked,
                                  ),
                                }))
                              }
                            />
                            {label}
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Interests */}
                    <div className="mt-6">
                      <div className="text-xs font-semibold text-black/60">
                        Interests
                      </div>
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {[
                          "Health optimization",
                          "Diagnosis + biomarkers",
                          "Tracking + dashboards",
                          "Education library",
                          "Coaching + accountability",
                          "Peptides (research only)",
                        ].map((label) => (
                          <label
                            key={label}
                            className="flex cursor-pointer items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black/75 hover:bg-black/5"
                          >
                            <input
                              type="checkbox"
                              className="h-4 w-4"
                              checked={splitPipe(form.notes).includes(label)}
                              onChange={(e) =>
                                setForm((prev) => ({
                                  ...prev,
                                  notes: togglePipeValue(
                                    prev.notes,
                                    label,
                                    e.target.checked,
                                  ),
                                }))
                              }
                            />
                            {label}
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Footer actions */}
                    <div className="mt-7 flex flex-col items-center gap-3">
                      <button
                        onClick={submitWaitlist}
                        disabled={!canSubmit}
                        className={`w-full sm:w-auto rounded-2xl px-10 py-3 text-sm font-semibold transition ${
                          canSubmit
                            ? "bg-black text-white hover:opacity-90"
                            : "bg-black/10 text-black/35 cursor-not-allowed"
                        }`}
                        type="button"
                      >
                        {submitting
                          ? "Submitting..."
                          : "Send verification email"}
                      </button>

                      <p className="text-center text-xs text-black/55">
                        We’ll email you a verification link. You’re not added
                        until you confirm.
                      </p>

                      {/* honeypot (hidden) */}
                      <input
                        tabIndex={-1}
                        autoComplete="off"
                        value={form.website}
                        onChange={(e) =>
                          setForm({ ...form, website: e.target.value })
                        }
                        className="hidden"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
