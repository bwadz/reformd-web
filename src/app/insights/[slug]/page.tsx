import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { getAllInsights, getInsightBySlug } from "@/lib/insights";

export function generateStaticParams() {
  return getAllInsights().map((p) => ({ slug: p.slug }));
}

// Next.js in your setup passes params as a Promise — await it.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  try {
    const { meta } = getInsightBySlug(slug);
    return {
      title: `${meta.title} | Re:Formd`,
      description: meta.description,
    };
  } catch {
    return { title: "Insight | Re:Formd" };
  }
}

export default async function InsightPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let post;
  try {
    post = getInsightBySlug(slug);
  } catch {
    notFound();
  }

  const { meta, content } = post;

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-3xl px-6 py-20">
        {/* Top nav */}
        <div className="flex items-center justify-between">
          <Link
            href="/insights"
            className="text-sm text-white/60 hover:text-white"
          >
            ← Back to Insights
          </Link>
          <div className="text-xs text-white/50">
            {meta.date ? <span>{meta.date}</span> : null}
          </div>
        </div>

        {/* Title block */}
        <header className="mt-8">
          <h1 className="text-4xl font-semibold tracking-tight">
            {meta.title}
          </h1>

          {meta.description ? (
            <p className="mt-4 text-lg leading-7 text-white/75">
              {meta.description}
            </p>
          ) : null}

          {meta.tags?.length ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {meta.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70"
                >
                  {t}
                </span>
              ))}
            </div>
          ) : null}
        </header>

        {/* Article body */}
        <article className="mt-10">
          {/* This wrapper uses Tailwind Typography if enabled; otherwise it still looks good. */}
          <div
            className="
              prose prose-invert max-w-none
              prose-p:my-5 prose-p:leading-7 prose-p:text-white/80
              prose-headings:tracking-tight prose-headings:text-white
              prose-h2:mt-10 prose-h2:mb-4
              prose-hr:my-10 prose-hr:border-white/10
              prose-strong:text-white
              prose-a:text-white prose-a:underline prose-a:underline-offset-4
              prose-ul:my-6 prose-ol:my-6
              prose-li:my-1 prose-li:text-white/80
              prose-blockquote:border-white/15 prose-blockquote:text-white/80
            "
          >
            <MDXRemote
              source={content}
              options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
            />
          </div>
        </article>

        {/* CTA */}
        <section className="mt-16 rounded-2xl border border-white/10 bg-white/5 p-8">
          <h3 className="text-xl font-semibold tracking-tight text-white">
            Fix the system. The symptoms follow.
          </h3>
          <p className="mt-3 text-white/70">
            Re:Formd is built on physiology and backed by data — a structured
            way to diagnose, explain, optimize, track, and adapt.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/#waitlist"
              className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-white/90"
            >
              Join the Waitlist →
            </Link>
            <Link
              href="/insights"
              className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-transparent px-5 py-3 text-sm font-semibold text-white/85 hover:bg-white/5 hover:text-white"
            >
              Read more insights
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-10 text-xs text-white/40">Built to Last.</footer>
      </div>
    </main>
  );
}
