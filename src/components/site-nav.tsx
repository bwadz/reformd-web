"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

function NavItem({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active =
    pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={[
        "text-sm tracking-wide transition-colors",
        active ? "text-white" : "text-white/65 hover:text-white",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}

export default function SiteNav() {
  const router = useRouter();

  function onJoinWaitlist() {
    // If already on home, just scroll. Otherwise navigate to home anchor.
    if (typeof window !== "undefined" && window.location.pathname === "/") {
      const el = document.getElementById("waitlist");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }
    router.push("/#waitlist");
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-black/80 backdrop-blur border-b border-white/10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-4">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/images/04-horizontal-basic-white.svg"
            alt="Re:Formd"
            width={140}
            height={32}
            priority
          />
        </Link>

        {/* Middle: Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <NavItem href="/" label="Home" />
          <NavItem href="/insights" label="Insights" />
          <NavItem href="/book" label="Book" />
        </nav>

        {/* Right: CTA */}
        <button
          onClick={onJoinWaitlist}
          className="rounded-xl bg-white px-4 sm:px-6 py-2 text-sm font-semibold text-black transition hover:opacity-90"
          type="button"
        >
          Join the Waitlist
        </button>
      </div>

      {/* Divider */}
      <div className="h-px w-full bg-white/10" />
    </header>
  );
}
