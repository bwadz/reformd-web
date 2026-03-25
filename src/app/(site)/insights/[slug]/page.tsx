import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { getAllInsights, getInsightBySlug } from "@/lib/insights";
import ShareButtons from "@/components/share-buttons";

export function generateStaticParams() {
  return getAllInsights().map((p) => ({ slug: p.slug }));
}

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
      openGraph: {
        title: meta.title,
        description: meta.description,
        url: `https://reformd.ai/insights/${slug}`,
        siteName: "Re:Formd",
        type: "article",
        images: [
          {
            url: "/images/social-preview.png",
            width: 1200,
            height: 630,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: meta.title,
        description: meta.description,
        images: ["/images/social-preview.png"],
      },
    };
  } catch {
    return { title: "Insight | Re:Formd" };
  }
}

function pickRelatedInsights({
  currentSlug,
  tags,
}: {
  currentSlug: string;
  tags?: string[];
}) {
  const all = getAllInsights().filter((p) => p.slug !== currentSlug);

  // Score by overlapping tags (simple + effective)
  const tagSet = new Set((tags ?? []).map((t) => t.toLowerCase()));
  const scored = all.map((p) => {
    const pTags = (p.tags ?? []).map((t: string) => t.toLowerCase());
    const overlap = pTags.reduce(
      (acc: number, t: string) => acc + (tagSet.has(t) ? 1 : 0),
      0,
    );
    return { p, overlap };
  });

  scored.sort((a, b) => {
    if (b.overlap !== a.overlap) return b.overlap - a.overlap;
    // newest first
    return (b.p.date ?? "").localeCompare(a.p.date ?? "");
  });

  return scored.slice(0, 2).map((x) => x.p);
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

  const related = pickRelatedInsights({
    currentSlug: slug,
    tags: meta.tags,
  });

  const defaultThumb = "/images/insight-thumb-default.jpg";

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="relative">
        {/* subtle glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.07),transparent_60%)]" />

        <div className="relative mx-auto max-w-6xl px-6 py-24">
          {/* Back row */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/insights"
              className="text-sm text-white/60 hover:text-white"
            >
              ← Back to Insights
            </Link>

            <div className="flex items-center gap-4">
              {meta.date ? (
                <div className="text-xs text-white/50">{meta.date}</div>
              ) : null}
              <ShareButtons
                title={meta.title}
                text={meta.description ?? meta.title}
              />
            </div>
          </div>

          {/* Header */}
          <header className="mt-10 border-b border-white/10 pb-10">
            <div className="text-xs uppercase tracking-[0.22em] text-white/40">
              Insight
            </div>

            <h1 className="mt-3 text-4xl font-semibold tracking-tight leading-tight md:text-5xl">
              {meta.title}
            </h1>

            {meta.description ? (
              <p className="mt-6 max-w-2xl text-xl leading-8 text-white/70">
                {meta.description}
              </p>
            ) : null}

            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-white/50">
              {meta.date ? <span>{meta.date}</span> : null}
              <span className="text-white/30">•</span>
              <span>5 min read</span>
            </div>
          </header>

          {/* Two-column layout */}
          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_340px]">
            {/* MAIN */}
            <div>
              {/* Context block */}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
                This piece is part of the Re:Formd framework — diagnosing
                upstream systems instead of managing downstream symptoms.
              </div>

              {/* Article body */}
              <article className="mt-10">
                <div
                  className="
                    prose prose-invert max-w-none
                    prose-p:my-6 prose-p:leading-8 prose-p:text-white/85
                    prose-headings:tracking-tight prose-headings:text-white
                    prose-h2:mt-14 prose-h2:mb-5 prose-h2:text-2xl
                    prose-h3:mt-10 prose-h3:mb-4
                    prose-hr:my-12 prose-hr:border-white/10
                    prose-strong:text-white
                    prose-a:text-white prose-a:underline prose-a:underline-offset-4
                    prose-ul:my-6 prose-ol:my-6
                    prose-li:my-1 prose-li:text-white/85
                    prose-blockquote:border-l-2 prose-blockquote:border-white/20
                    prose-blockquote:pl-6 prose-blockquote:text-white/75
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
                  Re:Formd is built on physiology and backed by data — a
                  structured way to diagnose, explain, optimize, track, and
                  adapt.
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

              <footer className="mt-10 text-xs text-white/40">
                Built to Last.
              </footer>
            </div>

            {/* SIDEBAR */}
            <aside className="lg:sticky lg:top-28 h-fit">
              {/* Tags */}
              {meta.tags?.length ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <div className="text-sm font-semibold text-white">Tags</div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {meta.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs text-white/70"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Related */}
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="text-sm font-semibold text-white">
                  Read More Insights
                </div>

                <div className="mt-4 grid gap-4">
                  {related.map((p) => (
                    <Link
                      key={p.slug}
                      href={`/insights/${p.slug}`}
                      className="group rounded-2xl border border-white/10 bg-black/40 p-4 hover:bg-white/10 transition"
                    >
                      <div className="flex gap-4">
                        <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                          <Image
                            src={p.image || defaultThumb}
                            alt={p.title}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>

                        <div className="min-w-0">
                          <div className="text-sm text-white/60">
                            {p.date ?? ""}
                          </div>
                          <div className="mt-1 font-semibold text-white group-hover:text-white">
                            {p.title}
                          </div>
                          {p.description ? (
                            <div className="mt-2 text-sm text-white/70 line-clamp-3">
                              {p.description}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
