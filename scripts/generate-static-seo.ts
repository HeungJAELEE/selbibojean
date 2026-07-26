import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import practical from "../src/data/generated/practical-content.json";
import written from "../src/data/generated/content.json";
import { UNIFIED_LEARNING_CONCEPTS } from "../src/data/source/unified-learning-concepts";
import {
  getPublicSitemapPaths,
  normalizeSiteUrl,
  renderRobotsTxt,
  renderSitemapXml,
} from "../src/lib/seo/static-seo";

const rawSiteUrl = process.env.SITE_URL;
if (!rawSiteUrl) {
  throw new Error("SITE_URL is required, for example: SITE_URL=https://example.pages.dev npm run generate:static-seo");
}

const siteUrl = normalizeSiteUrl(rawSiteUrl);
const entries = getPublicSitemapPaths(
  written,
  practical,
  UNIFIED_LEARNING_CONCEPTS,
);
const publicDir = resolve(process.cwd(), "public");

async function writeUtf8(path: string, contents: string) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, contents, "utf8");
}

await Promise.all([
  writeUtf8(resolve(publicDir, "robots.txt"), renderRobotsTxt(siteUrl)),
  writeUtf8(resolve(publicDir, "sitemap.xml"), renderSitemapXml(siteUrl, entries)),
]);

console.log(`Generated ${entries.length} sitemap URLs for ${siteUrl.origin}.`);
