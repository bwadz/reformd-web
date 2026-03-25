"use client";

import Link from "next/link";
import { useState, type FormEvent, type ReactNode } from "react";

// ─── Design tokens (fonts: next/font via app/book/layout.tsx) ─────────────────
const C = {
  bg:       "#0E0E0E",
  bgCard:   "#161616",
  bgInput:  "#1C1C1C",
  bgSection:"#111111",
  border:   "#2A2A2A",
  cream:    "#F0EBE0",
  creamMid: "#B8B0A4",
  creamDim: "#6E675E",
  gold:     "#C8A96E",
  goldDim:  "#8A6F3E",
};

// ─── Shared components ───────────────────────────────────────────────────────

function Divider({ color = C.border, margin = "0" }: { color?: string; margin?: string }) {
  return <div style={{ height: 1, background: color, margin }} />;
}

function GoldAccent({ center = false }: { center?: boolean }) {
  return (
    <div style={{
      width: 40, height: 2, background: C.gold,
      marginBottom: 20,
      marginLeft: center ? "auto" : 0,
      marginRight: center ? "auto" : 0,
    }} />
  );
}

function EyebrowLabel({ children, center = false }: { children: ReactNode; center?: boolean }) {
  return (
    <p style={{
      fontFamily: "var(--font-book-sans), system-ui, sans-serif",
      fontSize: 10,
      fontWeight: 600,
      letterSpacing: "0.2em",
      textTransform: "uppercase",
      color: C.gold,
      margin: "0 0 16px",
      textAlign: center ? "center" : "left",
    }}>
      {children}
    </p>
  );
}

// ─── Book cover placeholder ──────────────────────────────────────────────────
function BookCoverPlaceholder({ size = 360 }: { size?: number }) {
  return (
    <div style={{
      width: "100%",
      maxWidth: size,
      aspectRatio: "6 / 9",
      background: "linear-gradient(160deg, #1A1610 0%, #0E0C09 100%)",
      border: `1px solid ${C.goldDim}`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "48px 36px",
      position: "relative",
      boxShadow: "0 32px 100px rgba(0,0,0,0.8), 0 8px 32px rgba(200,169,110,0.1)",
    }}>
      <div style={{
        fontFamily: "var(--font-book-sans), system-ui, sans-serif",
        fontSize: 9,
        fontWeight: 600,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color: C.gold,
        marginBottom: 28,
      }}>Re:Formd</div>

      <div style={{
        fontFamily: "var(--font-book-serif), Georgia, serif",
        fontSize: "clamp(28px, 4vw, 40px)",
        fontWeight: 400,
        color: C.cream,
        textAlign: "center",
        lineHeight: 1.1,
        marginBottom: 20,
      }}>
        You Are Not<br />Dead Yet
      </div>

      <div style={{ width: 32, height: 1, background: C.gold, marginBottom: 18 }} />

      <div style={{
        fontFamily: "var(--font-book-sans), system-ui, sans-serif",
        fontSize: 11,
        fontWeight: 300,
        color: C.creamMid,
        textAlign: "center",
        lineHeight: 1.5,
      }}>
        A Body Repair Manual for People<br />Who Refuse to Feel Old
      </div>

      <div style={{
        position: "absolute",
        bottom: 30,
        fontFamily: "var(--font-book-sans), system-ui, sans-serif",
        fontSize: 9,
        fontWeight: 500,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: C.creamDim,
      }}>
        Brant Wadsworth
      </div>

      <div style={{
        position: "absolute", top: -10, right: -10,
        background: C.gold, color: "#0E0E0E",
        fontSize: 8, fontWeight: 700, letterSpacing: "0.08em",
        textTransform: "uppercase", padding: "3px 8px",
        fontFamily: "var(--font-book-sans), system-ui, sans-serif",
      }}>
        Cover TBD
      </div>
    </div>
  );
}

// ─── Email form (site waitlist API) ───────────────────────────────────────────
function EmailForm({ variant = "default" }: { variant?: "default" | "inline" }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [hp, setHp] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          full_name: null,
          landing_url:
            typeof window !== "undefined" ? window.location.href : null,
          utm_campaign: "book_yandy_landing",
          website: hp,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  };

  if (submitted) {
    return (
      <p style={{
        fontFamily: "var(--font-book-sans), system-ui, sans-serif",
        fontSize: 15,
        color: C.gold,
        lineHeight: 1.65,
        textAlign: variant === "inline" ? "left" : "center",
      }}>
        ✓ Check your inbox for a confirmation link to finish joining the list.
      </p>
    );
  }

  const honeypot = (
    <input
      type="text"
      name="website"
      tabIndex={-1}
      autoComplete="off"
      value={hp}
      onChange={(e) => setHp(e.target.value)}
      style={{
        position: "absolute",
        left: -9999,
        width: 1,
        height: 1,
        opacity: 0,
      }}
      aria-hidden
    />
  );

  if (variant === "inline") {
    return (
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, flexWrap: "wrap", position: "relative" }}>
        {honeypot}
        <input
          type="email" required placeholder="Your email address" value={email}
          onChange={(e) => setEmail(e.target.value)}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            flex: "1 1 220px", background: C.bgInput,
            border: `1px solid ${focused ? C.gold : C.border}`,
            borderRadius: 2, padding: "13px 16px",
            fontFamily: "var(--font-book-sans), system-ui, sans-serif", fontSize: 14,
            color: C.cream, outline: "none",
          }}
        />
        {error ? (
          <span style={{
            fontFamily: "var(--font-book-sans), system-ui, sans-serif",
            fontSize: 12,
            color: "#c98a7a",
            width: "100%",
          }}>
            {error}
          </span>
        ) : null}
        <button type="submit" disabled={pending} style={{
          background: C.gold, color: "#0E0E0E", border: "none",
          padding: "13px 24px", borderRadius: 2,
          fontFamily: "var(--font-book-sans), system-ui, sans-serif", fontSize: 13,
          fontWeight: 600, letterSpacing: "0.04em", cursor: pending ? "wait" : "pointer",
          whiteSpace: "nowrap",
          opacity: pending ? 0.75 : 1,
        }}>
          {pending ? "…" : "Notify me at launch →"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10, position: "relative" }}>
      {honeypot}
      <input
        type="email" required placeholder="Your email address" value={email}
        onChange={(e) => setEmail(e.target.value)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          background: C.bgInput,
          border: `1px solid ${focused ? C.gold : C.border}`,
          borderRadius: 2, padding: "14px 16px",
          fontFamily: "var(--font-book-sans), system-ui, sans-serif", fontSize: 15,
          color: C.cream, outline: "none",
        }}
      />
      {error ? (
        <p style={{
          fontFamily: "var(--font-book-sans), system-ui, sans-serif",
          fontSize: 12,
          color: "#c98a7a",
          margin: 0,
        }}>
          {error}
        </p>
      ) : null}
      <button type="submit" disabled={pending} style={{
        background: C.gold, color: "#0E0E0E", border: "none",
        padding: "15px 24px", borderRadius: 2,
        fontFamily: "var(--font-book-sans), system-ui, sans-serif", fontSize: 14,
        fontWeight: 600, letterSpacing: "0.06em", cursor: pending ? "wait" : "pointer",
        opacity: pending ? 0.75 : 1,
      }}>
        {pending ? "Sending…" : "Send me the first chapter →"}
      </button>
      <p style={{
        fontFamily: "var(--font-book-sans), system-ui, sans-serif", fontSize: 11,
        color: C.creamDim, textAlign: "center",
      }}>
        No spam. Unsubscribe any time.
      </p>
    </form>
  );
}

// ─── Section: Hero ───────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section style={{
      maxWidth: 1100, margin: "0 auto",
      padding: "80px 40px 60px",
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 80, alignItems: "center",
    }}>
      <div>
        <EyebrowLabel>Available May 2026 · Amazon KDP</EyebrowLabel>
        <h1 style={{
          fontFamily: "var(--font-book-serif), Georgia, serif",
          fontSize: "clamp(48px, 6vw, 76px)",
          fontWeight: 400, lineHeight: 1.02,
          color: C.cream, margin: "0 0 16px",
          letterSpacing: "-0.015em",
        }}>
          You Are Not<br />Dead Yet
        </h1>
        <p style={{
          fontFamily: "var(--font-book-serif), Georgia, serif",
          fontSize: "clamp(18px, 2vw, 22px)",
          fontWeight: 300, fontStyle: "italic",
          color: C.creamMid, margin: "0 0 8px",
        }}>
          A Body Repair Manual for People Who Refuse to Feel Old
        </p>
        <p style={{
          fontFamily: "var(--font-book-sans), system-ui, sans-serif",
          fontSize: 12, fontWeight: 500,
          letterSpacing: "0.12em", textTransform: "uppercase",
          color: C.gold, margin: "0 0 32px",
        }}>
          Introducing the Human Operating System
        </p>

        <Divider color={C.border} margin="0 0 32px" />

        <p style={{
          fontFamily: "var(--font-book-sans), system-ui, sans-serif",
          fontSize: 15, fontWeight: 300,
          color: C.creamMid, lineHeight: 1.7,
          margin: "0 0 32px", maxWidth: 440,
        }}>
          A framework for understanding why your body fails — and how to repair it in the
          correct order, before the diagnosis arrives. By Brant Wadsworth.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Primary CTA — replace href with real Amazon URL */}
          <a href="#" style={{
            display: "inline-block",
            background: C.gold, color: "#0E0E0E",
            padding: "16px 32px", borderRadius: 2,
            fontFamily: "var(--font-book-sans), system-ui, sans-serif",
            fontSize: 14, fontWeight: 600,
            letterSpacing: "0.06em", textDecoration: "none",
            textAlign: "center",
          }}>
            Pre-Order on Amazon →
          </a>
          {/* Secondary CTA */}
          <a href="#capture" style={{
            display: "inline-block",
            border: `1px solid ${C.border}`, color: C.creamMid,
            padding: "15px 32px", borderRadius: 2,
            fontFamily: "var(--font-book-sans), system-ui, sans-serif",
            fontSize: 14, fontWeight: 400,
            letterSpacing: "0.04em", textDecoration: "none",
            textAlign: "center",
          }}>
            Get the first chapter free
          </a>
        </div>

        <p style={{
          fontFamily: "var(--font-book-sans), system-ui, sans-serif", fontSize: 11,
          color: C.creamDim, margin: "16px 0 0",
        }}>
          6×9 Trade Paperback · ~188 pages · Kindle/eBook · Amazon KDP
        </p>
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        {/*
          Replace BookCoverPlaceholder with your actual cover image:
          <img src="/images/book-cover.png" alt="You Are Not Dead Yet"
               style={{ maxWidth: 360, width: "100%",
                        boxShadow: "0 32px 100px rgba(0,0,0,0.8)" }} />
        */}
        <BookCoverPlaceholder size={360} />
      </div>
    </section>
  );
}

// ─── Section: The Hook ───────────────────────────────────────────────────────
function HookSection() {
  return (
    <section style={{ background: C.bgSection }}>
      <div style={{
        maxWidth: 760, margin: "0 auto",
        padding: "80px 40px", textAlign: "center",
      }}>
        <h2 style={{
          fontFamily: "var(--font-book-serif), Georgia, serif",
          fontSize: "clamp(32px, 5vw, 52px)",
          fontWeight: 400, color: C.cream,
          lineHeight: 1.15, margin: "0 0 28px",
        }}>
          Your labs are normal.<br />You're still not okay.
        </h2>
        <p style={{
          fontFamily: "var(--font-book-sans), system-ui, sans-serif",
          fontSize: 16, fontWeight: 300,
          color: C.creamMid, lineHeight: 1.8,
          margin: "0 0 20px",
        }}>
          The fatigue, the brain fog, the weight you can't move, the joints that didn't used
          to ache, the drive that's gone quiet — none of this is random. None of it is just
          aging. It's a cascade, and it started years before anything showed up on a test.
        </p>
        <p style={{
          fontFamily: "var(--font-book-sans), system-ui, sans-serif",
          fontSize: 16, fontWeight: 300,
          color: C.creamMid, lineHeight: 1.8,
          margin: "0",
        }}>
          <em style={{ fontStyle: "normal", color: C.cream }}>You Are Not Dead Yet</em> is
          the body repair manual nobody handed you. Built on the Human Operating System
          framework — a seven-level hierarchy that maps how your biology actually fails and
          recovers — it gives you the map, the repair sequence, and the tools to start
          upstream instead of chasing symptoms downstream.
        </p>
      </div>
    </section>
  );
}

// ─── Section: What You'll Learn ──────────────────────────────────────────────
function BenefitsSection() {
  const benefits = [
    "Understand why your body fails in a predictable, traceable order — and where you are in that sequence right now.",
    "Learn why \"your labs are normal\" doesn't mean you're fine — and what to actually look for.",
    "Get a complete system map of your biology and the correct repair sequence, so you stop treating symptoms and start fixing causes.",
    "Know why most health protocols fail — and the single upstream factor that determines whether any of them actually work.",
    "See exactly how chronic disease develops years before any diagnosis — and how to interrupt the cascade.",
    "Walk away with a framework no doctor's appointment ever gave you: your own Human Operating System, mapped.",
  ];

  return (
    <section style={{
      maxWidth: 1100, margin: "0 auto",
      padding: "80px 40px",
    }}>
      <GoldAccent />
      <EyebrowLabel>What you'll learn</EyebrowLabel>
      <h2 style={{
        fontFamily: "var(--font-book-serif), Georgia, serif",
        fontSize: "clamp(28px, 3.5vw, 40px)",
        fontWeight: 400, color: C.cream,
        lineHeight: 1.2, margin: "0 0 48px",
        maxWidth: 560,
      }}>
        This is not a list of things to do.<br />It's a map of why your body fails.
      </h2>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: 1, background: C.border,
        border: `1px solid ${C.border}`,
      }}>
        {benefits.map((b, i) => (
          <div key={i} style={{
            background: C.bg, padding: "28px 32px",
            display: "flex", gap: 16, alignItems: "flex-start",
          }}>
            <div style={{
              fontFamily: "var(--font-book-serif), Georgia, serif",
              fontSize: 28, fontWeight: 300,
              color: C.goldDim, lineHeight: 1,
              flexShrink: 0, width: 28, marginTop: 4,
            }}>
              {String(i + 1).padStart(2, "0")}
            </div>
            <p style={{
              fontFamily: "var(--font-book-sans), system-ui, sans-serif",
              fontSize: 14, fontWeight: 300,
              color: C.creamMid, lineHeight: 1.7,
              margin: 0,
            }}>
              {b}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Section: Five Myths ─────────────────────────────────────────────────────
function MythsSection() {
  const myths = [
    {
      myth: "More exercise is better.",
      truth: "More exercise applied to a depleted system produces breakdown, not adaptation. The ceiling isn't effort — it's upstream capacity.",
    },
    {
      myth: "Low fat is healthy.",
      truth: "The dogma that drove an insulin resistance epidemic. Thoroughly dismantled by the same research community that created it.",
    },
    {
      myth: "Your labs are normal, so you're fine.",
      truth: "Normal means average. Lab panels detect disease — not the early loss of regulation that precedes it by a decade.",
    },
    {
      myth: "Testosterone (or hormones) will fix low energy.",
      truth: "Hormones are amplifiers, not foundations. Adding signal to a broken system amplifies the breakdown.",
    },
    {
      myth: "Aging causes this.",
      truth: "Some things are time-related. Most of what gets written off as aging is accumulated, addressable system dysfunction. Your biological age and chronological age are not the same number.",
    },
  ];

  return (
    <section style={{ background: C.bgSection }}>
      <div style={{
        maxWidth: 1100, margin: "0 auto",
        padding: "80px 40px",
      }}>
        <GoldAccent />
        <EyebrowLabel>Five things you've been told that are wrong</EyebrowLabel>
        <h2 style={{
          fontFamily: "var(--font-book-serif), Georgia, serif",
          fontSize: "clamp(28px, 3.5vw, 40px)",
          fontWeight: 400, color: C.cream,
          lineHeight: 1.2, margin: "0 0 48px",
          maxWidth: 560,
        }}>
          The conventional wisdom<br />that's keeping you stuck.
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {myths.map((m, i) => (
            <div key={i} style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 1, background: C.border,
            }}>
              <div style={{
                background: "#161410", padding: "28px 32px",
              }}>
                <p style={{
                  fontFamily: "var(--font-book-sans), system-ui, sans-serif",
                  fontSize: 10, fontWeight: 600,
                  letterSpacing: "0.14em", textTransform: "uppercase",
                  color: C.creamDim, margin: "0 0 10px",
                }}>
                  Myth {i + 1}
                </p>
                <p style={{
                  fontFamily: "var(--font-book-serif), Georgia, serif",
                  fontSize: 20, fontStyle: "italic",
                  color: C.creamDim, lineHeight: 1.4,
                  margin: 0,
                }}>
                  "{m.myth}"
                </p>
              </div>
              <div style={{
                background: C.bg, padding: "28px 32px",
              }}>
                <p style={{
                  fontFamily: "var(--font-book-sans), system-ui, sans-serif",
                  fontSize: 10, fontWeight: 600,
                  letterSpacing: "0.14em", textTransform: "uppercase",
                  color: C.gold, margin: "0 0 10px",
                }}>
                  The truth
                </p>
                <p style={{
                  fontFamily: "var(--font-book-sans), system-ui, sans-serif",
                  fontSize: 14, fontWeight: 300,
                  color: C.cream, lineHeight: 1.7,
                  margin: 0,
                }}>
                  {m.truth}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section: About the Author ───────────────────────────────────────────────
function AuthorSection() {
  return (
    <section style={{
      maxWidth: 1100, margin: "0 auto",
      padding: "80px 40px",
      display: "grid",
      gridTemplateColumns: "200px 1fr",
      gap: 60, alignItems: "start",
    }}>
      {/* Photo */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <div style={{
          width: 160, height: 160, borderRadius: "50%",
          background: "#1C1C1C",
          border: `1px solid ${C.border}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--font-book-sans), system-ui, sans-serif", fontSize: 10,
          color: C.creamDim, letterSpacing: "0.08em",
        }}>
          {/* Replace with: <img src="/images/brant.jpg" style={{width:"100%",borderRadius:"50%"}} /> */}
          Photo
        </div>
        <div style={{ textAlign: "center" }}>
          <p style={{
            fontFamily: "var(--font-book-sans), system-ui, sans-serif", fontSize: 13,
            fontWeight: 600, color: C.cream, margin: "0 0 4px",
          }}>
            Brant Wadsworth
          </p>
          <p style={{
            fontFamily: "var(--font-book-sans), system-ui, sans-serif", fontSize: 11,
            color: C.creamDim, margin: 0, lineHeight: 1.5,
          }}>
            Founder, Re:Formd<br />Greater Phoenix Area
          </p>
        </div>
      </div>

      {/* Bio */}
      <div>
        <GoldAccent />
        <EyebrowLabel>About the author</EyebrowLabel>
        <h2 style={{
          fontFamily: "var(--font-book-serif), Georgia, serif",
          fontSize: "clamp(28px, 3.5vw, 38px)",
          fontWeight: 400, color: C.cream,
          lineHeight: 1.2, margin: "0 0 24px",
        }}>
          An engineer who rebuilt<br />himself from the inside out.
        </h2>

        <p style={{
          fontFamily: "var(--font-book-sans), system-ui, sans-serif",
          fontSize: 15, fontWeight: 300,
          color: C.creamMid, lineHeight: 1.8,
          margin: "0 0 16px",
        }}>
          Brant Wadsworth has spent his career building systems — software companies,
          platforms, and solutions that take something complex and make it work the way it
          should. He co-founded hh2 Web Services, founded Digitek Solutions, and spent
          eleven years as CEO of Twenty20 Construction Software, a full-stack construction
          ERP he built from the ground up.
        </p>

        <p style={{
          fontFamily: "var(--font-book-sans), system-ui, sans-serif",
          fontSize: 15, fontWeight: 300,
          color: C.creamMid, lineHeight: 1.8,
          margin: "0 0 16px",
        }}>
          At some point he realized his own body was a broken system he'd been too busy to
          address. The story in this book is his. The heart attack at 40. The years of
          grinding through stress, poor sleep, and habits rationalized as the cost of
          building things.
        </p>

        <p style={{
          fontFamily: "var(--font-book-sans), system-ui, sans-serif",
          fontSize: 15, fontWeight: 300,
          color: C.creamMid, lineHeight: 1.8,
          margin: "0 0 24px",
        }}>
          What changed everything was applying the same engineering mindset to his own
          biology: stop treating symptoms, find the upstream failure, fix it in the right
          order. At 53, he moves better than he did at 42.
        </p>

        <div style={{
          display: "flex", gap: 24, flexWrap: "wrap",
        }}>
          {[
            ["Heart attack", "at 40"],
            ["10 years", "of research"],
            ["27 citations", "peer-reviewed"],
            ["53 years old", "fitter than 42"],
          ].map(([stat, label]) => (
            <div key={stat} style={{ borderLeft: `2px solid ${C.gold}`, paddingLeft: 12 }}>
              <p style={{
                fontFamily: "var(--font-book-serif), Georgia, serif",
                fontSize: 22, fontWeight: 500,
                color: C.cream, margin: "0 0 2px",
              }}>{stat}</p>
              <p style={{
                fontFamily: "var(--font-book-sans), system-ui, sans-serif",
                fontSize: 11, color: C.creamDim, margin: 0,
              }}>{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section: What's Inside ──────────────────────────────────────────────────
function ContentsSection() {
  const [open, setOpen] = useState<number | null>(null);

  const parts = [
    { num: "01", title: "What Nobody Explains", pages: "pp. 8–21", chapters: "It Is Hard to Fix What You Don't Understand · My Story — My Why · What I Didn't Know Then · Core Principles · Who This Book Is For" },
    { num: "02", title: "Where We Go Wrong", pages: "pp. 22–37", chapters: "Stop Treating Your Body Like a Rental Car · Machine Repair vs Symptom Suppression · Why We Ignore Our Body's Alarms · Why Mainstream Healthcare Defaults to Shortcuts · Five Things You've Been Told That Are Wrong" },
    { num: "03", title: "You Didn't Wake Up Broken", pages: "pp. 38–68", chapters: "How Small Neglects Become Big Failures · The Four-Step Cascade · What's Actually Feeding the Failure · The Six Systems That Are Failing · Why Everything Affects Everything · The Order That Changes Everything" },
    { num: "04", title: "The Failure Pathways", pages: "pp. 69–89", chapters: "Chronic Inflammatory Signaling · Cellular Redox & Repair · Energy Production · Glucose & Insulin Dysregulation · Structural Dysfunction" },
    { num: "05", title: "The Root Systems, Going Deeper", pages: "pp. 90–122", chapters: "The Gut · Sleep · The Hormonal System · The Nervous System · Cellular Redox & Repair · Energy & Metabolism · The Immune System" },
    { num: "06", title: "The Complete Hierarchy", pages: "pp. 123–131", chapters: "How the Human Operating System Actually Works · The Seven-Level Stack · How Failure Actually Travels · Why Most People Work Backwards · What Correct Order Actually Produces" },
    { num: "07", title: "Your Baseline & Reference Tools", pages: "pp. 133–137", chapters: "Establishing Your Health Baseline · Required Tests by System · Physician-Friendly Lab Order" },
    { num: "08", title: "Advanced Tools", pages: "pp. 138–168", chapters: "Peptides, Bioregulators & Advanced Tools · Stimulants · Cannabis · Psilocybin, MDMA & Ketamine · Master Repair Order · Universal Daily Baseline" },
  ];

  return (
    <section style={{ background: C.bgSection }}>
      <div style={{
        maxWidth: 1100, margin: "0 auto",
        padding: "80px 40px",
      }}>
        <GoldAccent />
        <EyebrowLabel>What's inside · 8 parts · 27 chapters</EyebrowLabel>
        <h2 style={{
          fontFamily: "var(--font-book-serif), Georgia, serif",
          fontSize: "clamp(28px, 3.5vw, 40px)",
          fontWeight: 400, color: C.cream,
          lineHeight: 1.2, margin: "0 0 48px",
          maxWidth: 560,
        }}>
          A complete system map —<br />in the order that actually matters.
        </h2>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {parts.map((p, i) => (
            <div key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{
                  width: "100%", display: "grid",
                  gridTemplateColumns: "52px 1fr auto auto",
                  gap: 20, alignItems: "center",
                  padding: "20px 0", background: "none",
                  border: "none", cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <span style={{
                  fontFamily: "var(--font-book-serif), Georgia, serif",
                  fontSize: 32, fontWeight: 300,
                  color: C.goldDim, lineHeight: 1,
                }}>
                  {p.num}
                </span>
                <span style={{
                  fontFamily: "var(--font-book-sans), system-ui, sans-serif",
                  fontSize: 15, fontWeight: 500,
                  color: C.cream,
                }}>
                  {p.title}
                </span>
                <span style={{
                  fontFamily: "var(--font-book-sans), system-ui, sans-serif",
                  fontSize: 11, color: C.creamDim,
                }}>
                  {p.pages}
                </span>
                <span style={{
                  fontFamily: "var(--font-book-sans), system-ui, sans-serif",
                  fontSize: 18, color: C.gold,
                  lineHeight: 1,
                }}>
                  {open === i ? "−" : "+"}
                </span>
              </button>
              {open === i && (
                <p style={{
                  fontFamily: "var(--font-book-sans), system-ui, sans-serif",
                  fontSize: 13, fontWeight: 300,
                  color: C.creamMid, lineHeight: 1.7,
                  padding: "0 0 20px 72px",
                  margin: 0,
                }}>
                  {p.chapters}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section: Pull Quotes ────────────────────────────────────────────────────
function QuotesSection() {
  const quotes = [
    { text: "Diagnosis is not the cause. It's the receipt.", src: "How Small Neglects Become Big Failures" },
    { text: "Your body is not failing you. It has been compensating for you — for years, sometimes decades.", src: "Continue the Work" },
    { text: "Normal means average. It's what happens to most people who've been running the same patterns for twenty or thirty years. Average is a low bar.", src: "Why We Ignore Our Body's Alarms" },
  ];

  return (
    <section style={{
      maxWidth: 1100, margin: "0 auto",
      padding: "80px 40px",
    }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 2, background: C.border,
        border: `1px solid ${C.border}`,
      }}>
        {quotes.map((q, i) => (
          <div key={i} style={{
            background: C.bg, padding: "40px 36px",
            display: "flex", flexDirection: "column",
            justifyContent: "space-between",
          }}>
            <div style={{
              fontFamily: "var(--font-book-serif), Georgia, serif",
              fontSize: 22, fontStyle: "italic",
              fontWeight: 400, color: C.cream,
              lineHeight: 1.5, marginBottom: 24,
            }}>
              "{q.text}"
            </div>
            <p style={{
              fontFamily: "var(--font-book-sans), system-ui, sans-serif",
              fontSize: 10, fontWeight: 600,
              letterSpacing: "0.12em", textTransform: "uppercase",
              color: C.gold, margin: 0,
            }}>
              — {q.src}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Section: Pre-order CTA ───────────────────────────────────────────────────
function PreorderSection() {
  return (
    <section
      id="capture"
      style={{
        background: `linear-gradient(180deg, #0E0E0E 0%, #111008 100%)`,
        borderTop: `1px solid ${C.border}`,
        borderBottom: `1px solid ${C.border}`,
      }}
    >
      <div style={{
        maxWidth: 720, margin: "0 auto",
        padding: "80px 40px",
        textAlign: "center",
      }}>
        <GoldAccent center />

        <h2 style={{
          fontFamily: "var(--font-book-serif), Georgia, serif",
          fontSize: "clamp(32px, 5vw, 52px)",
          fontWeight: 400, color: C.cream,
          lineHeight: 1.15, margin: "0 0 16px",
        }}>
          Available May 2026 on Amazon.
        </h2>

        <p style={{
          fontFamily: "var(--font-book-sans), system-ui, sans-serif",
          fontSize: 15, fontWeight: 300,
          color: C.creamMid, lineHeight: 1.75,
          margin: "0 0 40px",
        }}>
          Kindle + Trade Paperback. Pre-order link goes live in April.
          Join the launch list to be notified the moment it's available —
          and get the first chapter immediately.
        </p>

        {/* Pre-order button placeholder */}
        <a href="#" style={{
          display: "inline-block",
          background: C.gold, color: "#0E0E0E",
          padding: "16px 40px", borderRadius: 2,
          fontFamily: "var(--font-book-sans), system-ui, sans-serif",
          fontSize: 14, fontWeight: 600,
          letterSpacing: "0.06em", textDecoration: "none",
          marginBottom: 40,
        }}>
          Pre-Order on Amazon → {/* swap href with real KDP URL */}
        </a>

        <Divider color={C.border} margin="0 0 40px" />

        <p style={{
          fontFamily: "var(--font-book-sans), system-ui, sans-serif",
          fontSize: 13, fontWeight: 500,
          letterSpacing: "0.08em", color: C.creamDim,
          margin: "0 0 20px",
        }}>
          Or join the launch list:
        </p>

        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <EmailForm />
        </div>
      </div>
    </section>
  );
}

// ─── Section: Re:Formd connection ────────────────────────────────────────────
function PlatformSection() {
  return (
    <section style={{
      maxWidth: 1100, margin: "0 auto",
      padding: "60px 40px",
    }}>
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: 1, background: C.border,
        border: `1px solid ${C.border}`,
      }}>
        <div style={{ background: C.bg, padding: "40px 36px" }}>
          <p style={{
            fontFamily: "var(--font-book-sans), system-ui, sans-serif", fontSize: 10,
            fontWeight: 600, letterSpacing: "0.18em",
            textTransform: "uppercase", color: C.gold,
            margin: "0 0 12px",
          }}>
            The book
          </p>
          <p style={{
            fontFamily: "var(--font-book-serif), Georgia, serif",
            fontSize: 22, fontWeight: 400, color: C.cream,
            lineHeight: 1.35, margin: "0 0 12px",
          }}>
            The map.
          </p>
          <p style={{
            fontFamily: "var(--font-book-sans), system-ui, sans-serif",
            fontSize: 14, fontWeight: 300,
            color: C.creamMid, lineHeight: 1.7, margin: 0,
          }}>
            <em>You Are Not Dead Yet</em> gives you the framework, the failure hierarchy,
            and the repair sequence. It teaches you how to read what your body is telling you.
          </p>
        </div>
        <div style={{ background: C.bgCard, padding: "40px 36px" }}>
          <p style={{
            fontFamily: "var(--font-book-sans), system-ui, sans-serif", fontSize: 10,
            fontWeight: 600, letterSpacing: "0.18em",
            textTransform: "uppercase", color: C.gold,
            margin: "0 0 12px",
          }}>
            Re:Formd
          </p>
          <p style={{
            fontFamily: "var(--font-book-serif), Georgia, serif",
            fontSize: 22, fontWeight: 400, color: C.cream,
            lineHeight: 1.35, margin: "0 0 12px",
          }}>
            The navigation.
          </p>
          <p style={{
            fontFamily: "var(--font-book-sans), system-ui, sans-serif",
            fontSize: 14, fontWeight: 300,
            color: C.creamMid, lineHeight: 1.7, margin: "0 0 20px",
          }}>
            Re:Formd is the platform that runs the Human Operating System framework —
            personalized assessments, protocol guidance, and tools that turn the map into action.
          </p>
          <a href="https://getreformd.com" style={{
            fontFamily: "var(--font-book-sans), system-ui, sans-serif",
            fontSize: 13, fontWeight: 500,
            letterSpacing: "0.06em", color: C.gold,
            textDecoration: "none",
          }}>
            getreformd.com →
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function BookPage() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.cream }}>

      {/* Nav */}
      <nav style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        padding: "24px 40px",
        borderBottom: `1px solid ${C.border}`,
        position: "sticky", top: 0,
        background: `${C.bg}ee`,
        backdropFilter: "blur(12px)",
        zIndex: 100,
      }}>
        <Link href="/" style={{
          fontFamily: "var(--font-book-sans), system-ui, sans-serif",
          fontSize: 12, fontWeight: 600,
          letterSpacing: "0.16em", textTransform: "uppercase",
          color: C.cream, textDecoration: "none",
        }}>
          Re:Formd
        </Link>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link href="/book" style={{
            fontFamily: "var(--font-book-sans), system-ui, sans-serif",
            fontSize: 12, fontWeight: 400,
            color: C.creamMid, textDecoration: "none",
          }}>
            Countdown
          </Link>
          <a href="#capture" style={{
            fontFamily: "var(--font-book-sans), system-ui, sans-serif",
            fontSize: 12, fontWeight: 400,
            color: C.creamMid, textDecoration: "none",
          }}>
            First chapter free
          </a>
          <a href="#" style={{
            fontFamily: "var(--font-book-sans), system-ui, sans-serif",
            fontSize: 12, fontWeight: 500,
            letterSpacing: "0.06em", color: C.gold,
            textDecoration: "none",
            border: `1px solid ${C.goldDim}`,
            padding: "8px 18px", borderRadius: 2,
          }}>
            Pre-Order
          </a>
        </div>
      </nav>

      <HeroSection />
      <Divider />
      <HookSection />
      <Divider />
      <BenefitsSection />
      <Divider />
      <MythsSection />
      <Divider />
      <AuthorSection />
      <Divider />
      <ContentsSection />
      <Divider />
      <QuotesSection />
      <Divider />
      <PreorderSection />
      <PlatformSection />

      {/* Footer */}
      <footer style={{
        borderTop: `1px solid ${C.border}`,
        maxWidth: 1100, margin: "0 auto",
        padding: "32px 40px",
        display: "flex", justifyContent: "space-between",
        alignItems: "center", flexWrap: "wrap", gap: 16,
      }}>
        <p style={{
          fontFamily: "var(--font-book-sans), system-ui, sans-serif",
          fontSize: 12, color: C.creamDim, margin: 0,
        }}>
          © 2026 Re:Formd · <a href="https://getreformd.com" style={{ color: C.creamDim, textDecoration: "none" }}>getreformd.com</a>
        </p>
        <p style={{
          fontFamily: "var(--font-book-serif), Georgia, serif",
          fontSize: 14, fontStyle: "italic",
          color: C.creamDim, margin: 0,
        }}>
          "Go get it."
        </p>
      </footer>

    </div>
  );
}
