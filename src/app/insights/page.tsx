import Link from "next/link";
import { getAllInsights } from "@/lib/insights";

export const metadata = {
  title: "Insights | Re:Formd",
  description: "Systems-based health, physiology, performance, and real talk.",
};

export default function InsightsPage() {
  const posts = getAllInsights();

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-5xl px-6 py-20">
        <h1 className="text-4xl font-semibold tracking-tight">Insights</h1>
        <p className="mt-4 max-w-2xl text-white/70">
          Systems-based health, physiology, performance, and real talk.
        </p>

        <div className="mt-12 space-y-10">
          {posts.map((p) => (
            <article key={p.slug} className="border-b border-white/10 pb-10">
              <div className="flex flex-wrap items-center gap-3 text-sm text-white/60">
                {p.date ? <span>{p.date}</span> : null}
                {p.tags?.length ? (
                  <span className="text-white/40">•</span>
                ) : null}
                {p.tags?.length ? <span>{p.tags.join(" · ")}</span> : null}
              </div>

              <h2 className="mt-3 text-2xl font-semibold">
                <Link className="hover:underline" href={`/insights/${p.slug}`}>
                  {p.title}
                </Link>
              </h2>

              {p.description ? (
                <p className="mt-3 max-w-3xl text-white/70">{p.description}</p>
              ) : null}

              <div className="mt-4">
                <Link
                  className="text-white/80 hover:text-white"
                  href={`/insights/${p.slug}`}
                >
                  Read →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
