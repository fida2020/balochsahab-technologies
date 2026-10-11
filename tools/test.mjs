// Automated checks for the generated site. Run: node tools/test.mjs
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, posix } from "node:path";
import { fileURLToPath } from "node:url";
import { validateProjects, SITE } from "./lib.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
let pass = 0, fail = 0;
function t(name, fn) {
  try { fn(); pass++; console.log("PASS  " + name); }
  catch (e) { fail++; console.log("FAIL  " + name + "\n      " + e.message); }
}
function assert(cond, msg) { if (!cond) throw new Error(msg); }

function htmlFiles(dir = ROOT, rel = "") {
  let out = [];
  for (const f of readdirSync(dir)) {
    if ([".git", "node_modules", "tools", "content", ".github"].includes(f)) continue;
    const p = join(dir, f), r = rel ? rel + "/" + f : f;
    if (statSync(p).isDirectory()) out = out.concat(htmlFiles(p, r));
    else if (f.endsWith(".html")) out.push(r);
  }
  return out;
}
const pages = htmlFiles();
const read = f => readFileSync(join(ROOT, f), "utf8");
const attr = (html, re) => [...html.matchAll(re)].map(m => m[1]);

// ---- content validator unit tests ----
const good = JSON.parse(read("content/projects.json"));
t("validator accepts current content", () => assert(validateProjects(good, p => existsSync(join(ROOT, p))).length === 0, "unexpected errors"));
const clone = () => JSON.parse(JSON.stringify(good));
t("validator rejects bad slug", () => { const d = clone(); d.projects[0].slug = "Bad Slug"; assert(validateProjects(d).some(e => e.includes("slug")), "not rejected"); });
t("validator rejects duplicate slug", () => { const d = clone(); d.projects[1].slug = d.projects[0].slug; assert(validateProjects(d).some(e => e.includes("duplicate")), "not rejected"); });
t("validator rejects non-https link", () => { const d = clone(); d.projects[0].links[0].url = "javascript:alert(1)"; assert(validateProjects(d).some(e => e.includes("https")), "not rejected"); });
t("validator rejects unknown status", () => { const d = clone(); d.projects[0].status = "awesome"; assert(validateProjects(d).some(e => e.includes("status")), "not rejected"); });
t("validator rejects missing image file", () => { const d = clone(); d.projects[0].images = [{ src: "/assets/img/nope.png", alt: "x" }]; assert(validateProjects(d, () => false).some(e => e.includes("not found")), "not rejected"); });
t("validator blocks unauthorized client work", () => {
  const d = clone(); d.projects.push({ ...d.projects[0], slug: "acme-site", kind: "client", client: "Acme" });
  assert(validateProjects(d).some(e => e.includes("clientAuthorized")), "not blocked");
});

// ---- generated pages ----
const titles = new Map(), descs = new Map();
for (const f of pages) {
  const html = read(f);
  t(`${f}: has title, description, canonical, og tags, one h1`, () => {
    const title = attr(html, /<title>([^<]+)<\/title>/g);
    const desc = attr(html, /<meta name="description" content="([^"]+)"/g);
    const canon = attr(html, /<link rel="canonical" href="([^"]+)"/g);
    assert(title.length === 1 && desc.length === 1 && canon.length === 1, "missing/duplicate head tags");
    assert(html.includes('property="og:title"') && html.includes('property="og:image"'), "missing og tags");
    assert((html.match(/<h1[\s>]/g) || []).length === 1, "must have exactly one h1");
    assert(desc[0].length >= 50 && desc[0].length <= 170, `description length ${desc[0].length}`);
    const expected = SITE.origin + (f === "index.html" ? "/" : "/" + f);
    assert(canon[0] === expected, `canonical ${canon[0]} != ${expected}`);
    if (titles.has(title[0])) throw new Error("duplicate title with " + titles.get(title[0]));
    if (descs.has(desc[0])) throw new Error("duplicate description with " + descs.get(desc[0]));
    titles.set(title[0], f); descs.set(desc[0], f);
  });
  t(`${f}: JSON-LD parses`, () => {
    const blocks = attr(html, /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g);
    assert(blocks.length === 1, "expected one JSON-LD block");
    JSON.parse(blocks[0]);
  });
  t(`${f}: AdSense tag preserved`, () => assert(html.includes("client=ca-pub-6831828383879093") && html.includes('data-cfasync="false"'), "AdSense tag missing"));
  t(`${f}: all internal links and assets resolve`, () => {
    const refs = attr(html, /(?:href|src)="([^"#]+)/g).filter(u => !/^(https?:|mailto:|tel:)/.test(u));
    const missing = refs.map(u => u.split("?")[0]).filter(u => {
      const p = u.startsWith("/") ? u.slice(1) : posix.join(posix.dirname(f), u);
      return !existsSync(join(ROOT, decodeURI(p)));
    });
    assert(missing.length === 0, "missing: " + [...new Set(missing)].join(", "));
  });
  t(`${f}: images have alt text, external links are safe`, () => {
    const imgs = html.match(/<img\b[^>]*>/g) || [];
    assert(imgs.every(i => /\balt="/.test(i)), "img without alt");
    const blanks = html.match(/<a\b[^>]*target="_blank"[^>]*>/g) || [];
    assert(blanks.every(a => a.includes("noopener")), "target=_blank without noopener");
  });
}

// ---- legacy URLs kept ----
for (const u of ["index.html", "about.html", "projects.html", "client-work.html", "team.html", "contact.html", "ads.txt", "CNAME"]) {
  t(`legacy URL still exists: /${u}`, () => assert(existsSync(join(ROOT, u)), "missing"));
}
t("CNAME still balochsahab.com", () => assert(read("CNAME").trim() === "balochsahab.com", "changed"));
t("ads.txt unchanged publisher", () => assert(read("ads.txt").includes("pub-6831828383879093"), "changed"));

// ---- products vs client separation ----
t("products page lists only products; client page lists only client work", () => {
  const products = good.projects.filter(p => p.published && p.kind === "product");
  const prodHtml = read("projects.html"), clientHtml = read("client-work.html");
  for (const p of products) {
    assert(prodHtml.includes(`/products/${p.slug}.html`), `${p.slug} missing from products page`);
    assert(!clientHtml.includes(`/products/${p.slug}.html`), `${p.slug} leaked into client page`);
    assert(existsSync(join(ROOT, `products/${p.slug}.html`)), `detail page missing for ${p.slug}`);
  }
  assert(!prodHtml.includes("/work/"), "client work leaked into products page");
});
t("required products present: EarnBox, XnaksView, F88", () => {
  const html = read("projects.html");
  for (const n of ["EarnBox", "XnaksView", "F88 AI Auto Trading Bot"]) assert(html.includes(n), n + " missing");
});

// ---- sitemap / robots ----
t("sitemap.xml is valid and every URL maps to an indexable page with matching canonical", () => {
  const xml = read("sitemap.xml");
  assert(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>') && xml.includes("<urlset"), "bad header");
  const locs = attr(xml, /<loc>([^<]+)<\/loc>/g);
  assert(locs.length > 0 && new Set(locs).size === locs.length, "empty or duplicate locs");
  for (const loc of locs) {
    assert(loc.startsWith(SITE.origin + "/"), "wrong origin " + loc);
    const f = loc === SITE.origin + "/" ? "index.html" : loc.slice(SITE.origin.length + 1);
    assert(existsSync(join(ROOT, f)), "no file for " + loc);
    const html = read(f);
    assert(html.includes(`<link rel="canonical" href="${loc}">`), "canonical mismatch for " + loc);
    assert(!html.includes('name="robots" content="noindex"'), "noindex page in sitemap: " + loc);
  }
  const indexable = pages.filter(f => !read(f).includes('content="noindex"'));
  assert(indexable.length === locs.length, `sitemap has ${locs.length} URLs, site has ${indexable.length} indexable pages`);
});
t("robots.txt allows crawl and points to sitemap", () => {
  const r = read("robots.txt");
  assert(/User-agent: \*/.test(r) && /Allow: \//.test(r) && r.includes(`Sitemap: ${SITE.origin}/sitemap.xml`), "bad robots.txt");
});

// ---- forms ----
for (const [f, endpoint] of [["contact.html", SITE.forms.contact], ["quote.html", SITE.forms.quote]]) {
  t(`${f}: form wired to delivery endpoint with honeypot, required fields, status region`, () => {
    const html = read(f);
    assert(html.includes(`data-endpoint="${endpoint}"`), "endpoint missing");
    assert(html.includes('name="_honey"'), "honeypot missing");
    assert(html.includes('role="status"'), "status region missing");
    assert(/name="email"[^>]*required/.test(html) && /name="name"[^>]*required/.test(html), "required fields missing");
    assert(html.includes("/assets/js/forms.js"), "forms.js not loaded");
    assert(!/(api[_-]?key|secret|token)\s*[:=]/i.test(html), "possible secret in page");
  });
}
t("no secrets in repository files", () => {
  const files = [...pages, "assets/js/forms.js", "assets/js/nav.js", "content/projects.json", "tools/lib.mjs"];
  for (const f of files) assert(!/(sk_live|AIza[0-9A-Za-z_-]{30}|-----BEGIN|password\s*=)/.test(read(f)), "suspicious secret in " + f);
});

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
