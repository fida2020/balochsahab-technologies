// Shared helpers for the static site build. No external dependencies.

export const SITE = {
  origin: "https://balochsahab.com",
  name: "Baloch Sahab Technologies",
  legalName: "Baloch Sahab Technologies (SMC-Private) Limited",
  email: "info@balochsahab.com",
  salesEmail: "sales@balochsahab.com",
  careersEmail: "careers@balochsahab.com",
  phone: "+92 321 8818909",
  phoneHref: "tel:+923218818909",
  whatsapp: "https://wa.me/923218818909",
  cuin: "0352600",
  secpVerify: "https://leap.secp.gov.pk/#/verify-company-info/0352600",
  locality: "Mandi Bahauddin",
  region: "Punjab",
  country: "PK",
  adsenseClient: "ca-pub-6831828383879093",
  ogImage: "/assets/img/logo-mark-512.png",
  // Form delivery (FormSubmit AJAX endpoint). Each address must be activated once
  // from the activation email FormSubmit sends on the first submission.
  forms: {
    contact: "https://formsubmit.co/ajax/info@balochsahab.com",
    quote: "https://formsubmit.co/ajax/sales@balochsahab.com"
  }
};

export const KINDS = ["product", "client"];
export const STATUSES = {
  "live": "Live",
  "beta": "Beta",
  "in-development": "In development",
  "completed": "Completed",
  "maintained": "Maintained"
};

export function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HTTPS_RE = /^https:\/\/[^\s"'<>]+$/;

function str(v, max) {
  return typeof v === "string" && v.trim().length > 0 && v.length <= max;
}

// Validates content/projects.json. Returns a list of human-readable errors.
// `fileExists(path)` checks image paths relative to the site root.
export function validateProjects(data, fileExists = () => true) {
  const errors = [];
  if (!data || !Array.isArray(data.projects)) return ["projects.json: top-level \"projects\" array is required"];
  const seen = new Set();
  data.projects.forEach((p, i) => {
    const at = `projects[${i}]${p && p.slug ? ` (${p.slug})` : ""}`;
    if (!p || typeof p !== "object") { errors.push(`${at}: must be an object`); return; }
    if (!str(p.slug, 80) || !SLUG_RE.test(p.slug)) errors.push(`${at}: slug must be lowercase-kebab-case`);
    else if (seen.has(p.slug)) errors.push(`${at}: duplicate slug`);
    else seen.add(p.slug);
    if (!KINDS.includes(p.kind)) errors.push(`${at}: kind must be one of ${KINDS.join(", ")}`);
    if (typeof p.published !== "boolean") errors.push(`${at}: published must be true or false`);
    if (typeof p.featured !== "boolean") errors.push(`${at}: featured must be true or false`);
    if (!Number.isInteger(p.order)) errors.push(`${at}: order must be an integer`);
    if (!str(p.name, 80)) errors.push(`${at}: name is required (max 80 chars)`);
    if (!str(p.category, 40)) errors.push(`${at}: category is required (max 40 chars)`);
    if (!(p.status in STATUSES)) errors.push(`${at}: status must be one of ${Object.keys(STATUSES).join(", ")}`);
    if (!str(p.tagline, 160)) errors.push(`${at}: tagline is required (max 160 chars)`);
    if (!str(p.summary, 300)) errors.push(`${at}: summary is required (max 300 chars)`);
    if (!Array.isArray(p.overview) || p.overview.length === 0 || !p.overview.every(x => str(x, 1200)))
      errors.push(`${at}: overview must be a non-empty list of paragraphs`);
    for (const key of ["features", "technologies", "platforms", "notes"]) {
      if (!Array.isArray(p[key]) || !p[key].every(x => str(x, 400))) errors.push(`${at}: ${key} must be a list of strings`);
    }
    if (!Array.isArray(p.images)) errors.push(`${at}: images must be a list`);
    else p.images.forEach((img, j) => {
      if (!img || !str(img.src, 200) || !img.src.startsWith("/assets/")) errors.push(`${at}: images[${j}].src must be a path under /assets/`);
      else if (!fileExists(img.src)) errors.push(`${at}: images[${j}].src file not found: ${img.src}`);
      if (!img || !str(img.alt, 200)) errors.push(`${at}: images[${j}].alt text is required`);
    });
    if (!Array.isArray(p.links)) errors.push(`${at}: links must be a list`);
    else p.links.forEach((l, j) => {
      if (!l || !str(l.label, 60)) errors.push(`${at}: links[${j}].label is required`);
      if (!l || !HTTPS_RE.test(l.url || "")) errors.push(`${at}: links[${j}].url must be an https:// URL`);
    });
    if (p.kind === "client") {
      if (!str(p.client, 80)) errors.push(`${at}: client name is required for client work`);
      if (p.published && p.clientAuthorized !== true)
        errors.push(`${at}: client work can only be published with "clientAuthorized": true (written client permission)`);
    }
  });
  return errors;
}

export function sortProjects(list) {
  return [...list].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
}

// ---- Blog articles (content/articles/<slug>.md) ----
// Each file starts with a front-matter block:
//   ---
//   title: ...
//   description: ...        (50-160 chars, used as meta description)
//   date: 2026-10-02        (YYYY-MM-DD, not in the future)
//   category: Android
//   ---
// followed by the body in a small Markdown subset: "## " / "### " headings,
// paragraphs, "- " bullet lists, "1. " numbered lists, **bold**, `code` and
// [links](https://...), plus fenced code blocks (``` ... ```, no blank lines
// inside). Raw HTML is not allowed (it is escaped).
const FENCE_RE = /^```[a-z]*\n[\s\S]*?\n```$/gm;

export const ARTICLE_AUTHOR = "Baloch Sahab Technologies team";
export const ARTICLE_MIN_WORDS = 900;
export const ARTICLE_MAX_WORDS = 1400;

export function parseArticle(slug, src) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(src);
  const meta = {};
  if (m) for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(":");
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { slug, ...meta, body: m ? m[2].trim() : "" };
}

// Counts prose words; code blocks are not counted.
export function wordCount(md) {
  return md.replace(/\r\n/g, "\n").replace(FENCE_RE, " ").replace(/`[^`]*`/g, " x ").replace(/\]\([^)]*\)/g, "]").replace(/[#*\[\]_>-]/g, " ")
    .split(/\s+/).filter(w => /[A-Za-z0-9]/.test(w)).length;
}

function inline(text) {
  return esc(text)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (all, label, url) => {
      if (url.startsWith("/")) return `<a href="${url}">${label}</a>`;
      if (/^https:\/\//.test(url)) return `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`;
      return all;
    });
}

export function markdownToHtml(md) {
  const out = [];
  const blocks = md.replace(/\r\n/g, "\n").split(/\n\s*\n/);
  for (const raw of blocks) {
    const block = raw.trim();
    if (!block) continue;
    const lines = block.split("\n");
    let h;
    if (/^```/.test(block) && /```$/.test(block) && lines.length >= 3) {
      const lang = lines[0].slice(3).trim();
      out.push(`<pre><code${lang ? ` class="language-${esc(lang)}"` : ""}>${esc(lines.slice(1, -1).join("\n"))}</code></pre>`);
    } else if ((h = /^(#{2,3}) (.+)$/.exec(block)) && lines.length === 1) {
      const tag = h[1].length === 2 ? "h2" : "h3";
      out.push(`<${tag}>${inline(h[2])}</${tag}>`);
    } else if (lines.every(l => /^- /.test(l))) {
      out.push(`<ul>\n${lines.map(l => `  <li>${inline(l.slice(2))}</li>`).join("\n")}\n</ul>`);
    } else if (lines.every(l => /^\d+\. /.test(l))) {
      out.push(`<ol>\n${lines.map(l => `  <li>${inline(l.replace(/^\d+\. /, ""))}</li>`).join("\n")}\n</ol>`);
    } else {
      out.push(`<p>${inline(lines.join(" "))}</p>`);
    }
  }
  return out.join("\n");
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function validateArticles(list, today = new Date().toISOString().slice(0, 10)) {
  const errors = [];
  const seen = new Set(), titles = new Set();
  for (const a of list) {
    const at = `articles/${a.slug}.md`;
    if (!SLUG_RE.test(a.slug)) errors.push(`${at}: file name must be lowercase-kebab-case`);
    if (seen.has(a.slug)) errors.push(`${at}: duplicate slug`); seen.add(a.slug);
    if (!str(a.title, 110)) errors.push(`${at}: title is required (max 110 chars)`);
    else if (titles.has(a.title)) errors.push(`${at}: duplicate title`); titles.add(a.title);
    if (!str(a.description, 160) || a.description.length < 50) errors.push(`${at}: description must be 50-160 chars`);
    if (!str(a.category, 40)) errors.push(`${at}: category is required (max 40 chars)`);
    if (!DATE_RE.test(a.date || "") || isNaN(Date.parse(a.date))) errors.push(`${at}: date must be YYYY-MM-DD`);
    else if (a.date > today) errors.push(`${at}: date ${a.date} is in the future`);
    if (/<[a-z!\/]/i.test((a.body || "").replace(/\r\n/g, "\n").replace(FENCE_RE, "").replace(/`[^`]*`/g, ""))) errors.push(`${at}: raw HTML is not allowed in the body`);
    const words = wordCount(a.body || "");
    if (words < ARTICLE_MIN_WORDS || words > ARTICLE_MAX_WORDS) errors.push(`${at}: ${words} words (must be ${ARTICLE_MIN_WORDS}-${ARTICLE_MAX_WORDS})`);
  }
  return errors;
}

export function sortArticles(list) {
  return [...list].sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
}
