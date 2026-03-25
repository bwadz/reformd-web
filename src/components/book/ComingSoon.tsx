"use client";

import Link from "next/link";
import { useState, useEffect, type FormEvent, type ReactNode } from "react";

// ─── Design tokens (fonts: next/font via app/book/layout.tsx) ───────────────
const C = {
  bg:       "#0E0E0E",
  bgCard:   "#161616",
  bgInput:  "#1C1C1C",
  border:   "#2A2A2A",
  cream:    "#F0EBE0",
  creamMid: "#B8B0A4",
  creamDim: "#6E675E",
  gold:     "#C8A96E",
  goldDim:  "#8A6F3E",
};

// ─── Launch target ───────────────────────────────────────────────────────────
const LAUNCH_DATE = new Date("2026-05-05T00:00:00");

function getCountdown() {
  const now = new Date();
  const diff = LAUNCH_DATE.getTime() - now.getTime();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours:   Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      minWidth: 72,
    }}>
      <span style={{
        fontFamily: "var(--font-book-serif), Georgia, serif",
        fontSize: "clamp(48px, 8vw, 80px)",
        fontWeight: 300,
        color: C.cream,
        lineHeight: 1,
        letterSpacing: "-0.02em",
      }}>
        {String(value).padStart(2, "0")}
      </span>
      <span style={{
        fontFamily: "var(--font-book-sans), system-ui, sans-serif",
        fontSize: 10,
        fontWeight: 500,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: C.creamDim,
        marginTop: 8,
      }}>
        {label}
      </span>
    </div>
  );
}

function Divider({ color = C.border, margin = "0" }) {
  return <div style={{ height: 1, background: color, margin }} />;
}

function GoldAccent() {
  return (
    <div style={{
      width: 40, height: 2, background: C.gold, marginBottom: 20,
    }} />
  );
}

// ─── Book cover placeholder ──────────────────────────────────────────────────
function BookCoverPlaceholder() {
  return (
    <div style={{
      width: "100%",
      maxWidth: 320,
      aspectRatio: "6 / 9",
      background: `linear-gradient(160deg, #1A1610 0%, #0E0C09 100%)`,
      border: `1px solid ${C.goldDim}`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 32px",
      position: "relative",
      boxShadow: "0 24px 80px rgba(0,0,0,0.7), 0 8px 24px rgba(200,169,110,0.08)",
    }}>
      {/* Corner marks */}
      {["top:12px;left:12px", "top:12px;right:12px", "bottom:12px;left:12px", "bottom:12px;right:12px"].map((pos, i) => {
        const [v, h] = pos.split(";");
        const vKey = v.split(":")[0];
        const hKey = h.split(":")[0];
        return (
          <div key={i} style={{
            position: "absolute",
            [vKey]: 12, [hKey]: 12,
            width: 16, height: 16,
            borderTop: vKey === "top" ? `1px solid ${C.goldDim}` : "none",
            borderBottom: vKey === "bottom" ? `1px solid ${C.goldDim}` : "none",
            borderLeft: hKey === "left" ? `1px solid ${C.goldDim}` : "none",
            borderRight: hKey === "right" ? `1px solid ${C.goldDim}` : "none",
          }} />
        );
      })}

      <div style={{
        fontFamily: "var(--font-book-sans), system-ui, sans-serif",
        fontSize: 9,
        fontWeight: 600,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: C.gold,
        marginBottom: 24,
      }}>
        Re:Formd
      </div>

      <div style={{
        fontFamily: "var(--font-book-serif), Georgia, serif",
        fontSize: "clamp(26px, 5vw, 36px)",
        fontWeight: 400,
        color: C.cream,
        textAlign: "center",
        lineHeight: 1.15,
        marginBottom: 16,
      }}>
        You Are Not Dead Yet
      </div>

      <div style={{
        width: 32, height: 1, background: C.gold, marginBottom: 16,
      }} />

      <div style={{
        fontFamily: "var(--font-book-sans), system-ui, sans-serif",
        fontSize: 11,
        fontWeight: 300,
        color: C.creamMid,
        textAlign: "center",
        lineHeight: 1.5,
        letterSpacing: "0.03em",
      }}>
        A Body Repair Manual for People<br />Who Refuse to Feel Old
      </div>

      <div style={{
        position: "absolute",
        bottom: 28,
        fontFamily: "var(--font-book-sans), system-ui, sans-serif",
        fontSize: 9,
        fontWeight: 500,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: C.creamDim,
      }}>
        Brant Wadsworth
      </div>

      {/* Placeholder badge */}
      <div style={{
        position: "absolute",
        top: -10, right: -10,
        background: C.gold,
        color: "#0E0E0E",
        fontSize: 8,
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        padding: "3px 8px",
        fontFamily: "var(--font-book-sans), system-ui, sans-serif",
      }}>
        Cover TBD
      </div>
    </div>
  );
}

// ─── Email form (uses site waitlist API + verification email) ───────────────
function EmailForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [hp, setHp] = useState("");

  const inputStyle = (field: string) => ({
    width: "100%",
    background: C.bgInput,
    border: `1px solid ${focused === field ? C.gold : C.border}`,
    borderRadius: 2,
    padding: "14px 16px",
    fontFamily: "var(--font-book-sans), system-ui, sans-serif",
    fontSize: 15,
    color: C.cream,
    outline: "none",
    transition: "border-color 0.2s",
    boxSizing: "border-box" as const,
  });

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
          full_name: name.trim() || null,
          landing_url:
            typeof window !== "undefined" ? window.location.href : null,
          utm_campaign: "book_yandy_coming_soon",
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
      <div style={{
        textAlign: "center",
        padding: "48px 0",
      }}>
        <div style={{
          fontFamily: "var(--font-book-serif), Georgia, serif",
          fontSize: 28,
          fontWeight: 400,
          color: C.cream,
          marginBottom: 12,
        }}>
          Almost there.
        </div>
        <p style={{
          fontFamily: "var(--font-book-sans), system-ui, sans-serif",
          fontSize: 15,
          color: C.creamMid,
          lineHeight: 1.65,
          maxWidth: 380,
          margin: "0 auto",
        }}>
          We sent a confirmation link to your email. Click it to finish joining the launch
          list.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ width: "100%" }}>
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
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input
          type="text"
          placeholder="First name"
          value={name}
          required
          onChange={(e) => setName(e.target.value)}
          onFocus={() => setFocused("name")}
          onBlur={() => setFocused(null)}
          style={inputStyle("name")}
        />
        <input
          type="email"
          placeholder="Email address"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
          onFocus={() => setFocused("email")}
          onBlur={() => setFocused(null)}
          style={inputStyle("email")}
        />
        {error ? (
          <p style={{
            fontFamily: "var(--font-book-sans), system-ui, sans-serif",
            fontSize: 13,
            color: "#c98a7a",
            margin: 0,
          }}>
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          style={{
            width: "100%",
            background: C.gold,
            color: "#0E0E0E",
            border: "none",
            padding: "15px 24px",
            fontFamily: "var(--font-book-sans), system-ui, sans-serif",
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: "0.06em",
            cursor: pending ? "wait" : "pointer",
            borderRadius: 2,
            transition: "opacity 0.2s",
            opacity: pending ? 0.75 : 1,
          }}
          onMouseEnter={(e) => {
            if (!pending) e.currentTarget.style.opacity = "0.88";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = pending ? "0.75" : "1";
          }}
        >
          {pending ? "Sending…" : "Send me the first chapter →"}
        </button>
      </div>
      <p style={{
        fontFamily: "var(--font-book-sans), system-ui, sans-serif",
        fontSize: 11,
        color: C.creamDim,
        marginTop: 10,
        textAlign: "center",
      }}>
        No spam. Unsubscribe any time. Your information stays with Re:Formd.
      </p>
    </form>
  );
}

// ─── Incentive item ──────────────────────────────────────────────────────────
function Incentive({ children }: { children: ReactNode }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "flex-start",
      gap: 14,
      padding: "14px 0",
      borderBottom: `1px solid ${C.border}`,
    }}>
      <div style={{
        width: 18, height: 18,
        border: `1px solid ${C.gold}`,
        borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
        marginTop: 2,
      }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.gold }} />
      </div>
      <p style={{
        fontFamily: "var(--font-book-sans), system-ui, sans-serif",
        fontSize: 14,
        color: C.creamMid,
        lineHeight: 1.6,
        margin: 0,
      }}>
        {children}
      </p>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function ComingSoon() {
  const [countdown, setCountdown] = useState(getCountdown());
  const [listCount]  = useState(247); // update weekly

  useEffect(() => {
    const timer = setInterval(() => setCountdown(getCountdown()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{
      background: C.bg,
      minHeight: "100vh",
      color: C.cream,
      fontFamily: "var(--font-book-sans), system-ui, sans-serif",
    }}>

      {/* ── Nav bar ──────────────────────────────────────────────────────── */}
      <nav style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "24px 40px",
        borderBottom: `1px solid ${C.border}`,
        position: "sticky",
        top: 0,
        background: `${C.bg}ee`,
        backdropFilter: "blur(12px)",
        zIndex: 100,
      }}>
        <Link href="/" style={{
          fontFamily: "var(--font-book-sans), system-ui, sans-serif",
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: C.cream,
          textDecoration: "none",
        }}>
          Re:Formd
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link
            href="/book/you-are-not-dead-yet"
            style={{
              fontFamily: "var(--font-book-sans), system-ui, sans-serif",
              fontSize: 12,
              fontWeight: 400,
              letterSpacing: "0.06em",
              color: C.creamMid,
              textDecoration: "none",
            }}
          >
            About the book
          </Link>
          <a
            href="#notify"
            style={{
              fontFamily: "var(--font-book-sans), system-ui, sans-serif",
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: "0.08em",
              color: C.gold,
              textDecoration: "none",
              border: `1px solid ${C.goldDim}`,
              padding: "8px 18px",
              borderRadius: 2,
            }}
          >
            Get notified
          </a>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "80px 40px 60px",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 80,
        alignItems: "center",
      }}>
        {/* Left: text */}
        <div>
          <div style={{
            fontFamily: "var(--font-book-sans), system-ui, sans-serif",
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: C.gold,
            marginBottom: 24,
          }}>
            Coming May 2026
          </div>

          <h1 style={{
            fontFamily: "var(--font-book-serif), Georgia, serif",
            fontSize: "clamp(44px, 6vw, 72px)",
            fontWeight: 400,
            lineHeight: 1.05,
            color: C.cream,
            margin: "0 0 20px",
            letterSpacing: "-0.01em",
          }}>
            You Are Not<br />Dead Yet
          </h1>

          <p style={{
            fontFamily: "var(--font-book-sans), system-ui, sans-serif",
            fontSize: 16,
            fontWeight: 300,
            color: C.creamMid,
            lineHeight: 1.5,
            margin: "0 0 32px",
            letterSpacing: "0.01em",
          }}>
            A Body Repair Manual for People Who Refuse to Feel Old
          </p>

          <Divider color={C.border} margin="0 0 32px" />

          <blockquote style={{
            fontFamily: "var(--font-book-serif), Georgia, serif",
            fontSize: "clamp(18px, 2.5vw, 22px)",
            fontWeight: 400,
            fontStyle: "italic",
            color: C.cream,
            lineHeight: 1.55,
            margin: "0 0 8px",
            borderLeft: `2px solid ${C.gold}`,
            paddingLeft: 20,
          }}>
            "Your body is not failing you. It has been compensating for you — for years, sometimes decades."
          </blockquote>
          <p style={{
            fontFamily: "var(--font-book-sans), system-ui, sans-serif",
            fontSize: 11,
            color: C.creamDim,
            letterSpacing: "0.06em",
            paddingLeft: 22,
            margin: 0,
          }}>
            — Brant Wadsworth
          </p>
        </div>

        {/* Right: book cover */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          {/* Replace <BookCoverPlaceholder /> with your actual cover image:
              <img src="/images/book-cover.png" alt="You Are Not Dead Yet" style={{ maxWidth: 320, width: "100%" }} />
          */}
          <BookCoverPlaceholder />
        </div>
      </section>

      <Divider color={C.border} />

      {/* ── Countdown ────────────────────────────────────────────────────── */}
      <section style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "60px 40px",
        textAlign: "center",
      }}>
        <p style={{
          fontFamily: "var(--font-book-sans), system-ui, sans-serif",
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: C.creamDim,
          marginBottom: 32,
        }}>
          Launches in
        </p>

        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: "clamp(24px, 5vw, 60px)",
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}>
          <CountdownUnit value={countdown.days}    label="Days"    />
          <CountdownUnit value={countdown.hours}   label="Hours"   />
          <CountdownUnit value={countdown.minutes} label="Minutes" />
          <CountdownUnit value={countdown.seconds} label="Seconds" />
        </div>

        <p style={{
          fontFamily: "var(--font-book-sans), system-ui, sans-serif",
          fontSize: 13,
          color: C.creamDim,
          marginTop: 32,
        }}>
          May 5, 2026 · Amazon Kindle & Trade Paperback
        </p>
      </section>

      <Divider color={C.border} />

      {/* ── The pitch ────────────────────────────────────────────────────── */}
      <section style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "80px 40px",
        textAlign: "center",
      }}>
        <GoldAccent />

        <h2 style={{
          fontFamily: "var(--font-book-serif), Georgia, serif",
          fontSize: "clamp(28px, 4vw, 42px)",
          fontWeight: 400,
          color: C.cream,
          lineHeight: 1.25,
          margin: "0 0 24px",
        }}>
          Your labs are normal.<br />You're still not okay.
        </h2>

        <p style={{
          fontFamily: "var(--font-book-sans), system-ui, sans-serif",
          fontSize: 16,
          fontWeight: 300,
          color: C.creamMid,
          lineHeight: 1.75,
          margin: "0 0 20px",
        }}>
          The fatigue, the brain fog, the weight you can't move, the joints that didn't used
          to ache — none of this is random. None of it is just aging. It's a cascade, and it
          started years before anything showed up on a test.
        </p>

        <p style={{
          fontFamily: "var(--font-book-sans), system-ui, sans-serif",
          fontSize: 16,
          fontWeight: 300,
          color: C.creamMid,
          lineHeight: 1.75,
          margin: "0 0 20px",
        }}>
          <em style={{ fontStyle: "normal", color: C.cream }}>You Are Not Dead Yet</em> is
          a framework for understanding why your body fails — and how to fix it in the correct
          order, before the diagnosis arrives.
        </p>

        <p style={{
          fontFamily: "var(--font-book-sans), system-ui, sans-serif",
          fontSize: 15,
          fontWeight: 400,
          color: C.creamDim,
          lineHeight: 1.7,
        }}>
          Built on the Human Operating System — a seven-level hierarchy that maps how your
          biology actually fails and recovers. Written by an engineer who had a heart attack
          at 40 and spent the next decade figuring out what actually works, and in what order.
        </p>
      </section>

      <Divider color={C.border} />

      {/* ── Email capture ─────────────────────────────────────────────────── */}
      <section
        id="notify"
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "80px 40px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 80,
          alignItems: "start",
        }}
      >
        {/* Left: incentives */}
        <div>
          <GoldAccent />
          <h2 style={{
            fontFamily: "var(--font-book-serif), Georgia, serif",
            fontSize: "clamp(28px, 3.5vw, 38px)",
            fontWeight: 400,
            color: C.cream,
            lineHeight: 1.2,
            margin: "0 0 12px",
          }}>
            Get the first chapter free.
          </h2>
          <p style={{
            fontFamily: "var(--font-book-sans), system-ui, sans-serif",
            fontSize: 14,
            color: C.creamMid,
            lineHeight: 1.65,
            margin: "0 0 32px",
          }}>
            Join the launch list and get immediate access to Part One — plus everything below.
          </p>

          <div>
            <Incentive>
              <strong style={{ color: C.cream }}>First chapter delivered immediately</strong> — Part One of
              the book, formatted and ready to read.
            </Incentive>
            <Incentive>
              <strong style={{ color: C.cream }}>Launch day notification</strong> — so you can be among the
              first to post an Amazon review and help hit the best-seller list.
            </Incentive>
            <Incentive>
              <strong style={{ color: C.cream }}>Early access to the Re:Formd assessment</strong> — the
              digital tool that maps your Human Operating System before public release.
            </Incentive>
            <Incentive>
              <strong style={{ color: C.cream }}>Invitation to the ARC team</strong> — limited spots for
              advance readers who want the full manuscript before launch.
            </Incentive>
          </div>

          <div style={{
            marginTop: 32,
            padding: "16px 20px",
            border: `1px solid ${C.border}`,
            background: C.bgCard,
            borderRadius: 2,
          }}>
            <p style={{
              fontFamily: "var(--font-book-sans), system-ui, sans-serif",
              fontSize: 13,
              color: C.creamMid,
              margin: 0,
              lineHeight: 1.6,
            }}>
              <span style={{ color: C.gold, fontWeight: 600 }}>
                {listCount.toLocaleString()} people
              </span>{" "}
              are already on the launch list. We'll update this weekly.
            </p>
          </div>
        </div>

        {/* Right: form */}
        <div style={{
          background: C.bgCard,
          border: `1px solid ${C.border}`,
          borderRadius: 4,
          padding: "40px 36px",
        }}>
          <p style={{
            fontFamily: "var(--font-book-sans), system-ui, sans-serif",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: C.gold,
            margin: "0 0 8px",
          }}>
            Join the launch list
          </p>
          <h3 style={{
            fontFamily: "var(--font-book-serif), Georgia, serif",
            fontSize: 26,
            fontWeight: 400,
            color: C.cream,
            margin: "0 0 24px",
            lineHeight: 1.2,
          }}>
            Notify me at launch +<br />send the first chapter.
          </h3>
          <EmailForm />
        </div>
      </section>

      <Divider color={C.border} />

      {/* ── Author beat ───────────────────────────────────────────────────── */}
      <section style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "80px 40px",
        textAlign: "center",
      }}>
        {/* Author photo placeholder */}
        <div style={{
          width: 80, height: 80,
          borderRadius: "50%",
          background: "#1C1C1C",
          border: `1px solid ${C.border}`,
          margin: "0 auto 24px",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--font-book-sans), system-ui, sans-serif",
          fontSize: 10,
          color: C.creamDim,
          letterSpacing: "0.06em",
        }}>
          {/* Replace with: <img src="/images/brant.jpg" style={{ width:"100%", borderRadius:"50%" }} /> */}
          Photo
        </div>

        <p style={{
          fontFamily: "var(--font-book-sans), system-ui, sans-serif",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: C.gold,
          margin: "0 0 8px",
        }}>
          Brant Wadsworth
        </p>

        <p style={{
          fontFamily: "var(--font-book-sans), system-ui, sans-serif",
          fontSize: 13,
          color: C.creamDim,
          margin: "0 0 28px",
        }}>
          Founder, Re:Formd · Serial entrepreneur · Author
        </p>

        <p style={{
          fontFamily: "var(--font-book-serif), Georgia, serif",
          fontSize: "clamp(18px, 2.5vw, 22px)",
          fontStyle: "italic",
          color: C.creamMid,
          lineHeight: 1.65,
          margin: "0 0 24px",
        }}>
          "At 40, I had a heart attack. At 53, I move better than I did at 42. This book is
          the system that got me there — and the one I spent a decade building so you don't
          have to start from scratch."
        </p>

        <p style={{
          fontFamily: "var(--font-book-sans), system-ui, sans-serif",
          fontSize: 14,
          fontWeight: 300,
          color: C.creamDim,
          lineHeight: 1.7,
          maxWidth: 560,
          margin: "0 auto",
        }}>
          Serial founder. Former CEO of Twenty20 Construction Software. Built systems his whole
          career — software companies, platforms, enterprise ERP. At some point realized his
          own body was a broken system he'd been too busy to address.
        </p>
      </section>

      <Divider color={C.border} />

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "40px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 16,
      }}>
        <p style={{
          fontFamily: "var(--font-book-sans), system-ui, sans-serif",
          fontSize: 12,
          color: C.creamDim,
          margin: 0,
        }}>
          © 2026 Re:Formd · <a href="https://getreformd.com" style={{ color: C.creamDim, textDecoration: "none" }}>getreformd.com</a>
        </p>
        <p style={{
          fontFamily: "var(--font-book-serif), Georgia, serif",
          fontSize: 14,
          fontStyle: "italic",
          color: C.creamDim,
          margin: 0,
        }}>
          "You are not dead yet. The machinery is still here. The inputs can change today."
        </p>
      </footer>

    </div>
  );
}
