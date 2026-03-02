import fs from "fs";
import path from "path";
import matter from "gray-matter";

const INSIGHTS_DIR = path.join(process.cwd(), "src", "content", "insights");

export type InsightMeta = {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
};

export function getAllInsights(): InsightMeta[] {
  const files = fs.readdirSync(INSIGHTS_DIR).filter((f) => f.endsWith(".mdx"));

  const posts = files.map((file) => {
    // strip numeric prefix like "01-" for clean URLs
    const slug = file.replace(/^\d+-/, "").replace(/\.mdx$/, "");

    const fullPath = path.join(INSIGHTS_DIR, file);
    const raw = fs.readFileSync(fullPath, "utf8");
    const { data } = matter(raw);

    return {
      slug,
      title: String(data.title ?? slug),
      description: String(data.description ?? ""),
      date: String(data.date ?? ""),
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    };
  });

  // newest first (YYYY-MM-DD sorts correctly as strings)
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getInsightBySlug(slug: string): {
  meta: InsightMeta;
  content: string;
} {
  const files = fs.readdirSync(INSIGHTS_DIR).filter((f) => f.endsWith(".mdx"));

  // match file that ends with "${slug}.mdx" after stripping numeric prefix
  const match = files.find(
    (file) => file.replace(/^\d+-/, "").replace(/\.mdx$/, "") === slug,
  );

  if (!match) throw new Error(`Insight not found: ${slug}`);

  const fullPath = path.join(INSIGHTS_DIR, match);
  const raw = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(raw);

  return {
    meta: {
      slug,
      title: String(data.title ?? slug),
      description: String(data.description ?? ""),
      date: String(data.date ?? ""),
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    },
    content,
  };
}
