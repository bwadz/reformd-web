import fs from "fs";
import path from "path";
import matter from "gray-matter";

const INSIGHTS_DIR = path.join(process.cwd(), "src", "content", "insights");

export type InsightMeta = {
  slug: string;
  title: string;
  description?: string;
  date?: string; // YYYY-MM-DD
  tags?: string[];
  image?: string; // ✅ add thumbnail support
};

export type InsightPost = {
  meta: InsightMeta;
  content: string;
};

function normalizeMeta(
  slug: string,
  data: Record<string, unknown>,
): InsightMeta {
  return {
    slug,
    title: String(data.title ?? slug),
    description: data.description ? String(data.description) : undefined,
    date: data.date ? String(data.date) : undefined,
    tags: Array.isArray(data.tags) ? data.tags.map(String) : undefined,
    image: data.image ? String(data.image) : undefined,
  };
}

export function getAllInsights(): InsightMeta[] {
  const files = fs.readdirSync(INSIGHTS_DIR).filter((f) => f.endsWith(".mdx"));

  const posts = files.map((file) => {
    // strip numeric prefix like "01-" for clean URLs
    const slug = file.replace(/^\d+-/, "").replace(/\.mdx$/, "");

    const fullPath = path.join(INSIGHTS_DIR, file);
    const raw = fs.readFileSync(fullPath, "utf8");
    const { data } = matter(raw);

    return normalizeMeta(slug, data as Record<string, unknown>);
  });

  // newest first (YYYY-MM-DD sorts correctly as strings)
  return posts.sort((a, b) =>
    String(a.date ?? "") < String(b.date ?? "") ? 1 : -1,
  );
}

export function getInsightBySlug(slug: string): InsightPost {
  const files = fs.readdirSync(INSIGHTS_DIR).filter((f) => f.endsWith(".mdx"));

  const match = files.find(
    (file) => file.replace(/^\d+-/, "").replace(/\.mdx$/, "") === slug,
  );

  if (!match) throw new Error(`Insight not found: ${slug}`);

  const fullPath = path.join(INSIGHTS_DIR, match);
  const raw = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(raw);

  return {
    meta: normalizeMeta(slug, data as Record<string, unknown>),
    content,
  };
}
