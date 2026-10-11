import { SITE, esc } from "./lib.mjs";

const NAV = [
  ["/index.html", "Home"],
  ["/about.html", "About"],
  ["/projects.html", "Products"],
  ["/client-work.html", "Client Work"],
  ["/team.html", "Team"],
  ["/contact.html", "Contact"]
];

export function canonicalFor(path) {
  return SITE.origin + (path === "/index.html" ? "/" : path);
}

function orgJsonLd() {
  return {
    "@type": "Organization",
    "@id": SITE.origin + "/#organization",
    name: SITE.name,
    legalName: SITE.legalName,
    url: SITE.origin + "/",
    logo: SITE.origin + SITE.ogImage,
    email: SITE.email,
    telephone: SITE.phone.replace(/\s/g, ""),
    foundingDate: "2026-08-27",
    address: { "@type": "PostalAddress", addressLocality: SITE.locality, addressRegion: SITE.region, addressCountry: SITE.country },
    identifier: { "@type": "PropertyValue", propertyID: "SECP CUIN", value: SITE.cuin },
    sameAs: [SITE.secpVerify]
  };
}

export function layout(page, cssVersion) {
  const canonical = canonicalFor(page.path);
  const title = page.path === "/index.html" ? page.title : `${page.title} | ${SITE.name}`;
  const graph = [orgJsonLd(), ...(page.jsonLd || [])];
  const ld = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");
  const robots = page.noindex ? `\n<meta name="robots" content="noindex">` : "";
  const nav = NAV.map(([href, label]) =>
    `<a href="${href}"${page.nav === href ? ' class="active" aria-current="page"' : ""}>${label}</a>`).join("\n      ");
  const scripts = (page.scripts || []).map(s => `<script src="${s}?v=${cssVersion}" defer></script>`).join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(page.description)}">${robots}
<link rel="canonical" href="${canonical}">
<meta name="theme-color" content="#14144a">
<meta property="og:type" content="${page.ogType || "website"}">
<meta property="og:site_name" content="${esc(SITE.name)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(page.description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${SITE.origin}${SITE.ogImage}">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(page.description)}">
<meta name="twitter:image" content="${SITE.origin}${SITE.ogImage}">
<link rel="icon" href="/assets/img/favicon.ico" sizes="any">
<link rel="icon" href="/assets/img/favicon-32x32.png" sizes="32x32" type="image/png">
<link rel="icon" href="/assets/img/favicon-16x16.png" sizes="16x16" type="image/png">
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/css/style.css?v=${cssVersion}">
<script async data-cfasync="false" src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${SITE.adsenseClient}"
     crossorigin="anonymous"></script>
<script type="application/ld+json">${ld}</script>
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header">
  <div class="container nav">
    <a href="/index.html" class="brand" aria-label="${esc(SITE.name)} home">
      <span class="mark"><img src="/assets/img/logo-mark-256.png" alt="" width="108" height="108"></span>
      <span class="name-stack"><span class="name-main">BALOCH SAHAB</span><span class="name-sub">Technologies (SMC-Private) Limited</span></span>
    </a>
    <button class="nav-toggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="site-nav"><span></span><span></span><span></span></button>
    <nav class="nav-links" id="site-nav" aria-label="Main">
      ${nav}
      <a href="/quote.html" class="nav-cta${page.nav === "/quote.html" ? " active" : ""}">Request a Quote</a>
    </nav>
  </div>
</header>

<main id="main">
${page.body.trim()}
</main>

<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div>
        <div class="footer-brand">
          <span class="mark"><img src="/assets/img/logo-mark-128.png" alt="" width="64" height="64" loading="lazy"></span>
          <strong>BALOCH SAHAB TECHNOLOGIES (SMC-PRIVATE) LIMITED</strong>
        </div>
        <p>An SECP-registered software company in Pakistan building its own digital products and engineering software for clients.</p>
      </div>
      <div>
        <h2 class="footer-h">Company</h2>
        <ul>
          <li><a href="/about.html">About Us</a></li>
          <li><a href="/team.html">Team</a></li>
          <li><a href="/contact.html">Contact</a></li>
        </ul>
      </div>
      <div>
        <h2 class="footer-h">Work</h2>
        <ul>
          <li><a href="/projects.html">Our Products</a></li>
          <li><a href="/client-work.html">Client Work</a></li>
          <li><a href="/quote.html">Request a Quote</a></li>
        </ul>
      </div>
      <div>
        <h2 class="footer-h">Contact</h2>
        <ul>
          <li><a href="mailto:${SITE.email}">${SITE.email}</a></li>
          <li><a href="mailto:${SITE.salesEmail}">${SITE.salesEmail}</a></li>
          <li><a href="${SITE.phoneHref}">${SITE.phone}</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>&copy; 2026 ${esc(SITE.legalName)}. All rights reserved.</span>
      <span class="footer-legal"><a href="/privacy.html">Privacy Policy</a> &middot; <a href="/terms.html">Terms</a> &middot; CUIN ${SITE.cuin} &middot; <a href="${SITE.secpVerify}" target="_blank" rel="noopener noreferrer">Verify with SECP &#8599;</a></span>
    </div>
  </div>
</footer>

<script src="/assets/js/nav.js?v=${cssVersion}" defer></script>
${scripts}
</body>
</html>
`;
}
