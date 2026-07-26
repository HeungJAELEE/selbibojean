export type SitemapEntry = {
  path: string;
};

type WrittenContent = {
  lessons: Array<{ id: string; contentStatus: string }>;
  questions: Array<{ id: string; contentStatus: string }>;
};

type PracticalContent = {
  concepts: Array<{ id: string; contentStatus: string }>;
  questions: Array<{ id: string; contentStatus: string }>;
  studyCategories: Array<{ id: string }>;
};

const STATIC_PUBLIC_PATHS = [
  "/",
  "/library",
  "/privacy",
  "/theory",
  "/written/theory",
  "/written/practice",
  "/written/practice/random",
  "/written/mock",
  "/written/review",
  "/practical",
  "/practical/mock",
  "/practical/info",
  "/practical/work",
  "/practical/written",
  "/practical/written/past",
  "/practical/written/predicted",
  "/practical/written/theory",
] as const;

function publishedPaths<T extends { id: string; contentStatus: string }>(
  items: T[],
  prefix: string,
) {
  return items
    .filter((item) => item.contentStatus === "published")
    .map((item) => `${prefix}/${encodeURIComponent(item.id)}`);
}

export function getPublicSitemapPaths(
  written: WrittenContent,
  practical: PracticalContent,
): SitemapEntry[] {
  const paths = new Set<string>(STATIC_PUBLIC_PATHS);

  for (const path of publishedPaths(written.lessons, "/written/theory")) paths.add(path);
  for (const path of publishedPaths(written.questions, "/written/practice")) paths.add(path);
  for (const path of publishedPaths(practical.concepts, "/practical/written/theory")) paths.add(path);
  for (const path of publishedPaths(practical.questions, "/practical/written/question")) paths.add(path);
  for (const category of practical.studyCategories) {
    paths.add(`/practical/written/theory/category/${encodeURIComponent(category.id)}`);
  }
  return [...paths]
    .sort((left, right) => left.localeCompare(right))
    .map((path) => ({ path }));
}

export function normalizeSiteUrl(value: string): URL {
  const siteUrl = new URL(value);
  if (siteUrl.protocol !== "https:" && siteUrl.protocol !== "http:") {
    throw new Error("SITE_URL must start with http:// or https://.");
  }
  if (siteUrl.pathname !== "/" || siteUrl.search || siteUrl.hash) {
    throw new Error("SITE_URL must be an origin only, without a path, query, or hash.");
  }
  return siteUrl;
}

function escapeXml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function renderSitemapXml(siteUrl: URL, entries: SitemapEntry[]) {
  const urls = entries
    .map(({ path }) => `  <url><loc>${escapeXml(new URL(path, siteUrl).href)}</loc></url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export function renderRobotsTxt(siteUrl: URL) {
  return `User-agent: *\nAllow: /\n\nSitemap: ${new URL("/sitemap.xml", siteUrl).href}\n`;
}
