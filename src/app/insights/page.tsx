import Link from "next/link";
import { getAllInsights } from "@/lib/insights";

export const metadata = {
  title: "Insights | Re:Formd",
  description: "Systems-based health optimization—without hype.",
};

export default function InsightsIndexPage() {
  const posts = getAllInsights()
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight">Insights</h1>
        <p className="mt-3 max-w-2xl text-white/70">
          Physiology-first. Data-backed. No hacks. No hype.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {posts.map((p) => (
            <Link
              key={p.slug}
              href={`/insights/${p.slug}`}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:bg-white/10"
            >
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-semibold">{p.title}</h2>
                {p.date ? (
                  <span className="text-sm text-white/60">{p.date}</span>
                ) : null}
              </div>

              {p.description ? (
                <p className="mt-3 text-white/70">{p.description}</p>
              ) : null}

              {p.tags?.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {p.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs text-white/70"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              ) : null}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
