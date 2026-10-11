// Builds the static site from content/projects.json and tools/pages.mjs.
//   node tools/build.mjs          -> validate content and write all generated files
//   node tools/build.mjs --check  -> validate and fail if generated files are out of date
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, unlinkSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { SITE, validateProjects, sortProjects } from "./lib.mjs";
import { layout, canonicalFor } from "./layout.mjs";
import { staticPages, detailPage } from "./pages.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const check = process.argv.includes("--check");
const GENERATED_DIRS = ["products", "work"];

const data = JSON.parse(readFileSync(join(ROOT, "content/projects.json"), "utf8"));
const errors = validateProjects(data, p => existsSync(join(ROOT, p)));
if (errors.length) {
  console.error("Content validation failed:\n- " + errors.join("\n- "));
  process.exit(1);
}

const published = sortProjects(data.projects.filter(p => p.published));
const assetVersion = createHash("sha1")
  .update(["assets/css/style.css", "assets/js/nav.js", "assets/js/forms.js", "assets/js/filter.js"]
    .map(f => readFileSync(join(ROOT, f), "utf8")).join("\n"))
  .digest("hex").slice(0, 8);

const pages = [...staticPages(published), ...published.map(detailPage)];
const out = new Map();
for (const page of pages) out.set(page.path.slice(1), layout(page, assetVersion));

const indexable = pages.filter(p => !p.noindex);
out.set("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexable.map(p => `  <url><loc>${canonicalFor(p.path)}</loc></url>`).join("\n")}
</urlset>
`);
out.set("robots.txt", `User-agent: *
Allow: /

Sitemap: ${SITE.origin}/sitemap.xml
`);

// Detail pages for unpublished/deleted entries must disappear.
const stale = [];
for (const dir of GENERATED_DIRS) {
  if (!existsSync(join(ROOT, dir))) continue;
  for (const f of readdirSync(join(ROOT, dir))) {
    if (f.endsWith(".html") && !out.has(`${dir}/${f}`)) stale.push(`${dir}/${f}`);
  }
}

if (check) {
  const outdated = [...out].filter(([f, html]) => !existsSync(join(ROOT, f)) || readFileSync(join(ROOT, f), "utf8") !== html).map(([f]) => f);
  if (outdated.length || stale.length) {
    console.error("Generated files are out of date. Run: node tools/build.mjs\n- " + [...outdated, ...stale.map(s => s + " (stale)")].join("\n- "));
    process.exit(1);
  }
  console.log(`OK: ${out.size} generated files are up to date.`);
} else {
  for (const [f, html] of out) {
    mkdirSync(dirname(join(ROOT, f)), { recursive: true });
    writeFileSync(join(ROOT, f), html);
  }
  for (const s of stale) unlinkSync(join(ROOT, s));
  console.log(`Built ${out.size} files (${published.length} published projects)${stale.length ? `, removed ${stale.length} stale page(s)` : ""}.`);
}
