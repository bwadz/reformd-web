"use client";

import { useEffect, useRef, useState } from "react";

export default function ShareButtons({
  title,
  text,
}: {
  title: string;
  text?: string;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  function getUrl() {
    return typeof window !== "undefined" ? window.location.href : "";
  }

  function openPopup(url: string) {
    window.open(url, "_blank", "noopener,noreferrer");
  }

  async function nativeShare() {
    const url = getUrl();
    if (!url) return;

    // Prefer native share on mobile when available
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        if (typeof navigator !== "undefined" && navigator.share) {
          try {
            await navigator.share({ title, text: text ?? title, url });
            setOpen(false);
            return;
          } catch {
            // user canceled
          }
        }
        setOpen(false);
        return;
      } catch {
        // user canceled or unsupported payload — fall back to menu
      }
    }

    setOpen((v) => !v);
  }

  async function copyLink() {
    const url = getUrl();
    if (!url) return;

    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
    setOpen(false);
  }

  function shareLinkedIn() {
    const url = getUrl();
    if (!url) return;
    openPopup(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        url,
      )}`,
    );
    setOpen(false);
  }

  function shareX() {
    const url = getUrl();
    if (!url) return;
    openPopup(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        url,
      )}&text=${encodeURIComponent(title)}`,
    );
    setOpen(false);
  }

  function shareFacebook() {
    const url = getUrl();
    if (!url) return;
    openPopup(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    );
    setOpen(false);
  }

  function shareEmail() {
    const url = getUrl();
    if (!url) return;
    const subject = encodeURIComponent(title);
    const body = encodeURIComponent(`${text ?? title}\n\n${url}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setOpen(false);
  }

  // Close menu on outside click / Esc
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!open) return;
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative flex items-center gap-3">
      <button
        type="button"
        onClick={nativeShare}
        className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        Share
        <span className="text-white/40">↗</span>
      </button>

      {copied ? <span className="text-xs text-white/60">Copied</span> : null}

      {open ? (
        <div
          className="absolute right-0 top-12 z-50 w-48 overflow-hidden rounded-2xl border border-white/10 bg-black/95 shadow-lg backdrop-blur"
          role="menu"
        >
          <MenuItem onClick={copyLink} label="Copy link" />
          <div className="h-px bg-white/10" />
          <MenuItem onClick={shareLinkedIn} label="LinkedIn" />
          <MenuItem onClick={shareX} label="X" />
          <MenuItem onClick={shareFacebook} label="Facebook" />
          <MenuItem onClick={shareEmail} label="Email" />
        </div>
      ) : null}
    </div>
  );
}

function MenuItem({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="menuitem"
      className="w-full px-4 py-3 text-left text-sm text-white/75 hover:bg-white/10 hover:text-white"
    >
      {label}
    </button>
  );
}
