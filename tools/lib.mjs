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
