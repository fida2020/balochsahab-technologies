import { SITE, STATUSES, esc } from "./lib.mjs";

const productUrl = p => `/${p.kind === "product" ? "products" : "work"}/${p.slug}.html`;
const initials = name => name.split(/\s+/).filter(w => /^[A-Za-z0-9]/.test(w)).slice(0, 2).map(w => w[0]).join("").toUpperCase();

function statusBadge(status) {
  return `<span class="status status-${status}">${esc(STATUSES[status])}</span>`;
}

function projectCard(p) {
  return `<article class="project-card" data-category="${esc(p.category)}">
  <div class="project-card-top">
    <span class="product-mark" aria-hidden="true">${esc(initials(p.name))}</span>
    ${statusBadge(p.status)}
  </div>
  <h3><a href="${productUrl(p)}" class="stretched">${esc(p.name)}</a></h3>
  <p>${esc(p.summary)}</p>
  <div class="tag-row"><span class="tag">${esc(p.category)}</span>${p.platforms.map(x => `<span class="tag">${esc(x)}</span>`).join("")}</div>
  <span class="project-link">View details <span aria-hidden="true">&rarr;</span></span>
</article>`;
}

function pageHero({ eyebrow, title, lead, actions = "" }) {
  return `<section class="hero hero-page">
  <div class="container">
    <span class="eyebrow">${eyebrow}</span>
    <h1>${title}</h1>
    ${lead ? `<p class="lead">${lead}</p>` : ""}
    ${actions}
  </div>
</section>`;
}

const ctaBanner = (h, p, href, label) => `<section>
  <div class="container">
    <div class="cta-banner">
      <h2>${h}</h2>
      <p>${p}</p>
      <a href="${href}" class="btn btn-primary">${label}</a>
    </div>
  </div>
</section>`;

const SERVICES = [
  ["&#127760;", "Web Development", "Marketing sites, dashboards and full web platforms: designed, built and deployed."],
  ["&#128241;", "Mobile App Development", "Android applications, from idea through to release on Google Play."],
  ["&#128176;", "Earning Platform &amp; Ad-Tech Consulting", "Offerwalls, PTC ad networks, postback integrations and reward systems, drawn from running our own platform."],
  ["&#128203;", "Admin Panels &amp; Dashboards", "Internal tools to manage users, payments and content, built around how your team works."],
  ["&#128737;", "Backend &amp; API Development", "APIs, databases and backend services that power web and mobile apps."],
  ["&#128295;", "Maintenance &amp; Support", "Ongoing updates, bug fixes and support for products already in production."]
];

const serviceGrid = () => `<div class="grid grid-3">
${SERVICES.map(([i, h, p]) => `  <div class="card"><div class="icon" aria-hidden="true">${i}</div><h3>${h}</h3><p>${p}</p></div>`).join("\n")}
</div>`;

const SERVICE_OPTIONS = ["Web Development", "Mobile App Development", "Earning Platform / Ad-Tech", "Admin Panel / Dashboard", "Backend / API", "Maintenance & Support", "Other"];

function field(id, label, input, hint = "") {
  return `<div class="field">
  <label for="${id}">${label}</label>
  ${input}
  ${hint ? `<small class="hint">${hint}</small>` : ""}
  <small class="error" id="${id}-error" aria-live="polite"></small>
</div>`;
}

const honeypot = `<div class="hp" aria-hidden="true"><label for="hp-website">Leave this field empty</label><input type="text" id="hp-website" name="_honey" tabindex="-1" autocomplete="off"></div>`;

function contactForm() {
  return `<form class="js-form form-card" data-endpoint="${SITE.forms.contact}" data-subject="Website contact message" data-fallback="${SITE.email}" novalidate>
  <h2>Send us a message</h2>
  <div class="form-row">
    ${field("c-name", "Full name *", `<input id="c-name" name="name" type="text" autocomplete="name" required minlength="2" maxlength="80">`)}
    ${field("c-email", "Email address *", `<input id="c-email" name="email" type="email" autocomplete="email" required maxlength="120">`)}
  </div>
  ${field("c-subject", "Subject", `<input id="c-subject" name="topic" type="text" maxlength="120">`)}
  ${field("c-message", "Message *", `<textarea id="c-message" name="message" rows="6" required minlength="10" maxlength="5000"></textarea>`)}
  ${honeypot}
  <p class="form-note">By sending this form you agree that we process your details to reply to you, as described in our <a href="/privacy.html">Privacy Policy</a>.</p>
  <button type="submit" class="btn btn-primary">Send message</button>
  <div class="form-status" role="status" aria-live="polite" hidden></div>
</form>`;
}

function quoteForm() {
  const opts = list => list.map(o => `<option>${esc(o)}</option>`).join("");
  return `<form class="js-form form-card" data-endpoint="${SITE.forms.quote}" data-subject="Quote request" data-fallback="${SITE.salesEmail}" novalidate>
  <h2>Tell us about your project</h2>
  <div class="form-row">
    ${field("q-name", "Full name *", `<input id="q-name" name="name" type="text" autocomplete="name" required minlength="2" maxlength="80">`)}
    ${field("q-email", "Email address *", `<input id="q-email" name="email" type="email" autocomplete="email" required maxlength="120">`)}
  </div>
  <div class="form-row">
    ${field("q-company", "Company", `<input id="q-company" name="company" type="text" autocomplete="organization" maxlength="120">`)}
    ${field("q-phone", "Phone / WhatsApp", `<input id="q-phone" name="phone" type="tel" autocomplete="tel" maxlength="30" pattern="[0-9+()\\-\\s]{7,30}">`)}
  </div>
  <div class="form-row">
    ${field("q-service", "Service needed *", `<select id="q-service" name="service" required><option value="">Choose a service</option>${opts(SERVICE_OPTIONS)}</select>`)}
    ${field("q-budget", "Estimated budget", `<select id="q-budget" name="budget"><option value="">Prefer not to say</option>${opts(["Under US$1,000", "US$1,000 – 5,000", "US$5,000 – 15,000", "Over US$15,000"])}</select>`)}
  </div>
  ${field("q-timeline", "Timeline", `<select id="q-timeline" name="timeline"><option value="">Not sure yet</option>${opts(["As soon as possible", "Within 1 month", "1–3 months", "3+ months"])}</select>`)}
  ${field("q-details", "Project details *", `<textarea id="q-details" name="details" rows="7" required minlength="20" maxlength="5000"></textarea>`, "What should it do, who is it for, and is there anything already built?")}
  <div class="field field-check">
    <label><input type="checkbox" id="q-consent" name="consent" value="yes" required> I agree that my details are processed to prepare a quote, as described in the <a href="/privacy.html">Privacy Policy</a>. *</label>
    <small class="error" id="q-consent-error" aria-live="polite"></small>
  </div>
  ${honeypot}
  <button type="submit" class="btn btn-primary">Request quote</button>
  <div class="form-status" role="status" aria-live="polite" hidden></div>
</form>`;
}

function breadcrumbLd(items) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: SITE.origin + path }))
  };
}

export function staticPages(projects) {
  const products = projects.filter(p => p.kind === "product");
  const clients = projects.filter(p => p.kind === "client");
  const featured = products.filter(p => p.featured);
  const categories = [...new Set(products.map(p => p.category))];

  const home = {
    path: "/index.html", nav: "/index.html",
    title: "Baloch Sahab Technologies — Software Products & Development, Pakistan",
    description: "SECP-registered software company in Pakistan building its own apps and platforms, and developing web and mobile software for clients.",
    jsonLd: [{ "@type": "WebSite", "@id": SITE.origin + "/#website", url: SITE.origin + "/", name: SITE.name, publisher: { "@id": SITE.origin + "/#organization" } }],
    body: `<section class="hero hero-home">
  <div class="container">
    <span class="eyebrow">SECP-registered software company &middot; Pakistan</span>
    <h1>We build digital products <span>that people actually use.</span></h1>
    <p class="lead">From earning platforms and social video apps to automated trading software, we design, build and run our own products, and we bring the same engineering to client projects.</p>
    <div class="hero-actions">
      <a href="/projects.html" class="btn btn-primary">Explore our products</a>
      <a href="/quote.html" class="btn btn-ghost">Request a quote</a>
    </div>
  </div>
</section>

<section class="tight stats-band">
  <div class="container">
    <div class="stats">
      <div><div class="num">2026</div><div class="label">Year founded</div></div>
      <div><div class="num">${products.length}</div><div class="label">Company-owned products</div></div>
      <div><div class="num">SECP</div><div class="label">Registered &middot; CUIN ${SITE.cuin}</div></div>
      <div><div class="num">PK</div><div class="label">Headquartered in Pakistan</div></div>
    </div>
  </div>
</section>

<section>
  <div class="container">
    <div class="section-head">
      <span class="kicker">Our Products</span>
      <h2>Products we own and operate</h2>
      <p>Built, launched and supported in-house by Baloch Sahab Technologies.</p>
    </div>
    <div class="grid grid-2">
${featured.map(projectCard).join("\n")}
    </div>
    <div class="center-actions"><a href="/projects.html" class="btn btn-secondary">All products</a></div>
  </div>
</section>

<section class="alt">
  <div class="container">
    <div class="section-head">
      <span class="kicker">Services</span>
      <h2>What we build for clients</h2>
      <p>The same skills we use on our own products, available for your project.</p>
    </div>
    ${serviceGrid()}
    <div class="center-actions"><a href="/client-work.html" class="btn btn-secondary">Client work &amp; services</a></div>
  </div>
</section>

<section>
  <div class="container">
    <div class="section-head">
      <span class="kicker">Why us</span>
      <h2>Why work with us</h2>
    </div>
    <div class="grid grid-3">
      <div class="card"><div class="icon" aria-hidden="true">&#127919;</div><h3>We run our own products</h3><p>We operate live platforms and apps ourselves, so we know what production actually demands.</p></div>
      <div class="card"><div class="icon" aria-hidden="true">&#128274;</div><h3>Registered company</h3><p>${esc(SITE.legalName)} is registered with SECP, Pakistan &mdash; not an informal freelance setup.</p></div>
      <div class="card"><div class="icon" aria-hidden="true">&#128172;</div><h3>Direct communication</h3><p>You talk directly to the people building your project, with no account managers in between.</p></div>
    </div>
  </div>
</section>

${ctaBanner("Have a project in mind?", "Whether it&rsquo;s a web platform, a mobile app or something custom, tell us about it and we&rsquo;ll reply with an honest read on scope and cost.", "/quote.html", "Request a quote")}`
  };

  const about = {
    path: "/about.html", nav: "/about.html",
    title: "About Us",
    description: "The story and company facts of Baloch Sahab Technologies (SMC-Private) Limited, an SECP-registered software company in Mandi Bahauddin, Pakistan.",
    jsonLd: [breadcrumbLd([["Home", "/"], ["About", "/about.html"]])],
    body: `${pageHero({ eyebrow: "About Us", title: "A technology company, <span>built product by product.</span>", lead: "Baloch Sahab Technologies started with a single earning website and grew into a company building web platforms, mobile apps and software for clients." })}

<section>
  <div class="container">
    <div class="grid grid-2 align-start">
      <div class="prose">
        <h2>Our story</h2>
        <p>Baloch Sahab Technologies began as a single web project: an earning platform for everyday users. As that platform grew, so did the need for a proper company behind it, one that could take on mobile apps, take on client projects, and be accountable under its own legal name.</p>
        <p>In August 2026 the company was formally incorporated in Pakistan with the Securities and Exchange Commission of Pakistan (SECP) as an SMC-Private Limited company, a single-member company limited by shares. Today it is the parent company behind the Baloch Sahab Earning Platform, the EarnBox Android app, XnaksView, the F88 AI Auto Trading Bot, and the web and app development work we take on for clients.</p>
      </div>
      <div>
        <h2>Company facts</h2>
        <ul class="fact-list">
          <li><span>Legal name</span><span>${esc(SITE.legalName)}</span></li>
          <li><span>Company type</span><span>Single Member Company, Limited by Shares</span></li>
          <li><span>Corporate Unique ID (CUIN)</span><span><a href="${SITE.secpVerify}" target="_blank" rel="noopener noreferrer">${SITE.cuin} &#8599;</a></span></li>
          <li><span>National Tax Number (NTN)</span><span>J778727</span></li>
          <li><span>Incorporated under</span><span>Companies Act, 2017</span></li>
          <li><span>Regulator</span><span>SECP Pakistan</span></li>
          <li><span>Date of incorporation</span><span>27 August 2026</span></li>
          <li><span>Registered at</span><span>Mandi Bahauddin, Punjab, Pakistan</span></li>
        </ul>
      </div>
    </div>
  </div>
</section>

<section class="alt">
  <div class="container">
    <div class="section-head"><span class="kicker">Values</span><h2>What we believe</h2></div>
    <div class="grid grid-3">
      <div class="card"><div class="icon" aria-hidden="true">&#9889;</div><h3>Ship, then improve</h3><p>We put real products in front of real users early, then iterate based on what actually happens.</p></div>
      <div class="card"><div class="icon" aria-hidden="true">&#128274;</div><h3>Do it properly</h3><p>Formal incorporation, real compliance and real accountability &mdash; not a side project pretending to be a company.</p></div>
      <div class="card"><div class="icon" aria-hidden="true">&#129309;</div><h3>Stay close to users</h3><p>Every product we run, we run ourselves: support, payouts and feedback included.</p></div>
    </div>
  </div>
</section>

${ctaBanner("Want to know more?", "Read about our team, browse our products, or reach out directly.", "/contact.html", "Contact us")}`
  };

  const team = {
    path: "/team.html", nav: "/team.html",
    title: "Team",
    description: "Meet the team behind Baloch Sahab Technologies, led by founder and CEO Fida Hussain.",
    jsonLd: [breadcrumbLd([["Home", "/"], ["Team", "/team.html"]]), { "@type": "Person", name: "Fida Hussain", jobTitle: "Founder & CEO", worksFor: { "@id": SITE.origin + "/#organization" } }],
    body: `${pageHero({ eyebrow: "Team", title: "The people <span>behind the work.</span>", lead: "A small, focused team building and running every product ourselves." })}

<section>
  <div class="container">
    <div class="team-card">
      <div class="avatar" aria-hidden="true">FH</div>
      <div>
        <h2>Fida Hussain</h2>
        <div class="role">Founder &amp; CEO</div>
        <p>Founded Baloch Sahab Technologies after building and growing the Baloch Sahab Earning Platform from the ground up. Leads product, engineering and operations across the company&rsquo;s products and its client development work.</p>
      </div>
    </div>
  </div>
</section>

${ctaBanner("Want to work with us?", "We&rsquo;re always open to conversations about interesting projects and opportunities. For careers, email <a href=\"mailto:" + SITE.careersEmail + "\">" + SITE.careersEmail + "</a>.", "/contact.html", "Get in touch")}`
  };

  const productsPage = {
    path: "/projects.html", nav: "/projects.html",
    title: "Our Products",
    description: "Company-owned products by Baloch Sahab Technologies: the Baloch Sahab Earning Platform, EarnBox, XnaksView and the F88 AI Auto Trading Bot.",
    jsonLd: [breadcrumbLd([["Home", "/"], ["Our Products", "/projects.html"]]), {
      "@type": "ItemList", itemListElement: products.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: SITE.origin + productUrl(p), name: p.name }))
    }],
    scripts: ["/assets/js/filter.js"],
    body: `${pageHero({ eyebrow: "Our Products", title: "Products we <span>own and operate.</span>", lead: "Every product on this page is owned, built and run by Baloch Sahab Technologies. Work we do for clients is listed separately under <a href=\"/client-work.html\">Client Work</a>." })}

<section>
  <div class="container">
    ${categories.length > 1 ? `<div class="filter-bar" role="group" aria-label="Filter products by category">
      <button type="button" class="chip is-active" data-filter="all" aria-pressed="true">All</button>
      ${categories.map(c => `<button type="button" class="chip" data-filter="${esc(c)}" aria-pressed="false">${esc(c)}</button>`).join("\n      ")}
    </div>` : ""}
    <div class="grid grid-2 js-filter-grid">
${products.map(projectCard).join("\n")}
    </div>
  </div>
</section>

${ctaBanner("Want something built for your company?", "These are our own products. If you want us to build something for you, see our client services.", "/client-work.html", "Client work &amp; services")}`
  };

  const clientPage = {
    path: "/client-work.html", nav: "/client-work.html",
    title: "Client Work & Services",
    description: "Web, mobile, backend and ad-tech development services from Baloch Sahab Technologies, and the client projects we are authorized to show.",
    jsonLd: [breadcrumbLd([["Home", "/"], ["Client Work", "/client-work.html"]])],
    body: `${pageHero({ eyebrow: "For Companies &amp; Clients", title: "Want us to <span>build something for you?</span>", lead: "Websites, apps and full platforms for companies that want a reliable engineering partner.", actions: `<div class="hero-actions"><a href="/quote.html" class="btn btn-primary">Request a quote</a><a href="/contact.html" class="btn btn-ghost">Ask a question</a></div>` })}

<section>
  <div class="container">
    <div class="section-head"><span class="kicker">Services</span><h2>What we can build</h2><p>The same things we build for ourselves, available to hire.</p></div>
    ${serviceGrid()}
  </div>
</section>

<section class="alt">
  <div class="container">
    <div class="section-head"><span class="kicker">Process</span><h2>How a project works</h2></div>
    <ol class="steps">
      <li><h3>Brief</h3><p>You send the details through the quote form. We reply with questions and an honest read on scope.</p></li>
      <li><h3>Proposal</h3><p>We agree on scope, milestones, timeline and cost in writing before work starts.</p></li>
      <li><h3>Build</h3><p>We build in milestones and share progress you can test as we go.</p></li>
      <li><h3>Launch &amp; support</h3><p>We deploy, hand over, and offer ongoing maintenance if you need it.</p></li>
    </ol>
  </div>
</section>

<section>
  <div class="container">
    <div class="section-head"><span class="kicker">Client Projects</span><h2>Selected client work</h2></div>
    ${clients.length ? `<div class="grid grid-2">\n${clients.map(projectCard).join("\n")}\n</div>` :
      `<div class="empty-state"><p>We only publish client projects with the client&rsquo;s written permission. Case studies will appear here as they are approved. In the meantime, see the <a href="/projects.html">products we build and run ourselves</a>.</p></div>`}
  </div>
</section>

${ctaBanner("Have a project brief?", "Send us the details and we&rsquo;ll get back to you with an honest read on scope and cost.", "/quote.html", "Request a quote")}`
  };

  const contact = {
    path: "/contact.html", nav: "/contact.html",
    title: "Contact Us",
    description: "Contact Baloch Sahab Technologies for business, projects or careers: email, WhatsApp, phone, or the contact form.",
    jsonLd: [breadcrumbLd([["Home", "/"], ["Contact", "/contact.html"]])],
    scripts: ["/assets/js/forms.js"],
    body: `${pageHero({ eyebrow: "Contact", title: "Let&rsquo;s <span>talk.</span>", lead: "Reach out for business, projects or careers. We read every message ourselves." })}

<section>
  <div class="container">
    <div class="contact-layout">
      ${contactForm()}
      <div class="contact-list">
        <div class="contact-card"><div class="icon" aria-hidden="true">&#9993;</div><div><h3>General inquiries</h3><a href="mailto:${SITE.email}">${SITE.email}</a></div></div>
        <div class="contact-card"><div class="icon" aria-hidden="true">&#128188;</div><div><h3>Business &amp; sales</h3><a href="mailto:${SITE.salesEmail}">${SITE.salesEmail}</a></div></div>
        <div class="contact-card"><div class="icon" aria-hidden="true">&#128241;</div><div><h3>WhatsApp</h3><a href="${SITE.whatsapp}" target="_blank" rel="noopener noreferrer">${SITE.phone}</a></div></div>
        <div class="contact-card"><div class="icon" aria-hidden="true">&#128222;</div><div><h3>Phone</h3><a href="${SITE.phoneHref}">${SITE.phone}</a></div></div>
        <div class="contact-card"><div class="icon" aria-hidden="true">&#127891;</div><div><h3>Careers</h3><a href="mailto:${SITE.careersEmail}">${SITE.careersEmail}</a></div></div>
        <div class="contact-card"><div class="icon" aria-hidden="true">&#128205;</div><div><h3>Headquarters</h3><span class="value">Mandi Bahauddin, Punjab, Pakistan</span></div></div>
      </div>
    </div>
    <div class="note-banner">
      <p><strong>Already a Baloch Sahab Earning Platform or EarnBox user?</strong> For account, wallet or withdrawal support, please contact us through the platform itself.</p>
      <a href="https://earn.balochsahab.com" class="btn btn-secondary">Go to Earning Platform</a>
    </div>
  </div>
</section>`
  };

  const quote = {
    path: "/quote.html", nav: "/quote.html",
    title: "Request a Quote",
    description: "Request a quote from Baloch Sahab Technologies for web development, mobile apps, backend/API work, dashboards or ad-tech integrations.",
    jsonLd: [breadcrumbLd([["Home", "/"], ["Request a Quote", "/quote.html"]])],
    scripts: ["/assets/js/forms.js"],
    body: `${pageHero({ eyebrow: "Request a Quote", title: "Tell us what you <span>want to build.</span>", lead: "Share a few details and we&rsquo;ll reply by email with questions, an approach, and an estimate. There&rsquo;s no obligation." })}

<section>
  <div class="container narrow">
    ${quoteForm()}
  </div>
</section>`
  };

  const legalUpdated = "11 October 2026";
  const privacy = {
    path: "/privacy.html", nav: "",
    title: "Privacy Policy",
    description: "How Baloch Sahab Technologies collects, uses and protects personal information on balochsahab.com.",
    jsonLd: [breadcrumbLd([["Home", "/"], ["Privacy Policy", "/privacy.html"]])],
    body: `${pageHero({ eyebrow: "Legal", title: "Privacy Policy", lead: `Last updated: ${legalUpdated}` })}
<section>
  <div class="container narrow prose">
    <p>This policy explains how ${esc(SITE.legalName)} (&ldquo;we&rdquo;, &ldquo;us&rdquo;) handles personal information on this website, balochsahab.com. Our individual products (such as the Baloch Sahab Earning Platform, EarnBox and XnaksView) have their own privacy policies, which apply when you use them.</p>
    <h2>Information we collect</h2>
    <ul>
      <li><strong>Information you send us.</strong> When you use the contact or quote form, or email us, we receive the details you provide, such as your name, email address, company, phone number and message.</li>
      <li><strong>Technical information.</strong> Like most websites, our hosting and security providers process technical data such as IP address, browser type and pages requested, to deliver and protect the site.</li>
      <li><strong>Advertising cookies.</strong> This website uses Google AdSense. Google and its partners may use cookies or similar technologies to serve and measure ads, including personalised ads where permitted. You can learn more at <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">How Google uses information from sites that use its services</a> and manage ad personalisation at <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">Google Ad Settings</a>. Where required by law (for example in the EEA, UK and Switzerland), a consent message is shown before such cookies are used.</li>
    </ul>
    <p>We do not use separate analytics tracking on this website.</p>
    <h2>How we use information</h2>
    <ul>
      <li>To reply to your message or prepare a quote you requested.</li>
      <li>To operate, secure and improve this website.</li>
      <li>To meet legal, tax and regulatory obligations.</li>
    </ul>
    <p>We do not sell your personal information.</p>
    <h2>Service providers</h2>
    <p>We use trusted providers to run this website: GitHub Pages (hosting), Cloudflare (network and security), FormSubmit (delivering form submissions to our email inbox), Google Fonts (web fonts) and Google AdSense (advertising). They process data on our behalf or under their own policies, and may process it outside Pakistan.</p>
    <h2>Retention</h2>
    <p>We keep inquiry emails for as long as needed to respond and to maintain a business record, and then delete them. You can ask us to delete your inquiry at any time.</p>
    <h2>Your choices and rights</h2>
    <p>You may ask to access, correct or delete the personal information you have sent us, or object to its use, by emailing <a href="mailto:${SITE.email}">${SITE.email}</a>. You can also block or delete cookies in your browser settings.</p>
    <h2>Children</h2>
    <p>This website is intended for businesses and adults. We do not knowingly collect information from children under 13.</p>
    <h2>Changes</h2>
    <p>We may update this policy. The date at the top shows when it was last changed.</p>
    <h2>Contact</h2>
    <p>${esc(SITE.legalName)}, Mandi Bahauddin, Punjab, Pakistan. Email: <a href="mailto:${SITE.email}">${SITE.email}</a>.</p>
  </div>
</section>`
  };

  const terms = {
    path: "/terms.html", nav: "",
    title: "Terms and Conditions",
    description: "Terms and conditions for using the balochsahab.com website of Baloch Sahab Technologies (SMC-Private) Limited.",
    jsonLd: [breadcrumbLd([["Home", "/"], ["Terms and Conditions", "/terms.html"]])],
    body: `${pageHero({ eyebrow: "Legal", title: "Terms and Conditions", lead: `Last updated: ${legalUpdated}` })}
<section>
  <div class="container narrow prose">
    <p>These terms apply to your use of balochsahab.com, operated by ${esc(SITE.legalName)}, a company registered with SECP, Pakistan (CUIN ${SITE.cuin}). By using this website you agree to them.</p>
    <h2>Use of this website</h2>
    <p>You may browse and use this website for lawful purposes only. You must not attempt to disrupt it, gain unauthorised access to it, or send spam or harmful content through its forms.</p>
    <h2>Our products</h2>
    <p>Information about our products is provided for general information. Each product (for example the Baloch Sahab Earning Platform, EarnBox, XnaksView and the F88 AI Auto Trading Bot) is governed by its own terms when you use it. Products marked &ldquo;In development&rdquo; are not yet generally available and their features may change.</p>
    <h2>No financial advice</h2>
    <p>Nothing on this website is financial, investment or trading advice. Trading foreign exchange, metals and CFDs carries a high level of risk, and automated trading software does not guarantee profit. You can lose all of your capital.</p>
    <h2>Quotes and client work</h2>
    <p>A quote or estimate sent in reply to an inquiry is not a binding contract. Client projects are governed by a separate written agreement covering scope, price, timelines and ownership.</p>
    <h2>Intellectual property</h2>
    <p>The content, logos and product names on this website belong to ${esc(SITE.legalName)} or their respective owners. You may not copy or reuse them without permission, except as allowed by law.</p>
    <h2>External links</h2>
    <p>This website links to other websites and services. We are not responsible for their content or practices.</p>
    <h2>Disclaimer and liability</h2>
    <p>This website is provided &ldquo;as is&rdquo;. To the extent permitted by law, we are not liable for any loss arising from your use of it or reliance on its content.</p>
    <h2>Governing law</h2>
    <p>These terms are governed by the laws of Pakistan.</p>
    <h2>Contact</h2>
    <p>Questions about these terms: <a href="mailto:${SITE.email}">${SITE.email}</a>.</p>
  </div>
</section>`
  };

  const notFound = {
    path: "/404.html", nav: "", noindex: true,
    title: "Page not found",
    description: "The page you were looking for could not be found on balochsahab.com.",
    body: `${pageHero({ eyebrow: "404", title: "Page <span>not found.</span>", lead: "The page you were looking for doesn&rsquo;t exist or has moved.", actions: `<div class="hero-actions"><a href="/index.html" class="btn btn-primary">Go to homepage</a><a href="/projects.html" class="btn btn-ghost">Our products</a></div>` })}`
  };

  return [home, about, team, productsPage, clientPage, contact, quote, privacy, terms, notFound];
}

export function detailPage(p) {
  const isProduct = p.kind === "product";
  const listPath = isProduct ? "/projects.html" : "/client-work.html";
  const listName = isProduct ? "Our Products" : "Client Work";
  const primary = p.links.filter(l => l.primary);
  const ext = 'target="_blank" rel="noopener noreferrer"';
  const ld = [{
    "@type": "BreadcrumbList",
    itemListElement: [["Home", "/"], [listName, listPath], [p.name, productUrl(p)]].map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: SITE.origin + path }))
  }];
  if (isProduct) {
    const app = {
      "@type": "SoftwareApplication",
      name: p.name,
      description: p.summary,
      applicationCategory: p.category === "Trading Software" ? "FinanceApplication" : p.category === "Web Platform" ? "WebApplication" : "MobileApplication",
      operatingSystem: p.platforms.join(", "),
      url: SITE.origin + productUrl(p),
      publisher: { "@id": SITE.origin + "/#organization" }
    };
    ld.push(app);
  }

  return {
    path: productUrl(p), nav: isProduct ? "/projects.html" : "/client-work.html",
    title: `${p.name} — ${p.category}`,
    description: p.summary.length > 158 ? p.summary.slice(0, 155).replace(/\s+\S*$/, "") + "..." : p.summary,
    ogType: "article",
    jsonLd: ld,
    body: `<section class="hero hero-page hero-detail">
  <div class="container">
    <nav class="breadcrumb" aria-label="Breadcrumb"><a href="/index.html">Home</a> <span aria-hidden="true">/</span> <a href="${listPath}">${listName}</a> <span aria-hidden="true">/</span> <span aria-current="page">${esc(p.name)}</span></nav>
    <div class="detail-head">
      <span class="product-mark lg" aria-hidden="true">${esc(initials(p.name))}</span>
      <div>
        <div class="detail-meta">${statusBadge(p.status)}<span class="tag tag-dark">${esc(p.category)}</span>${!isProduct ? `<span class="tag tag-dark">Client: ${esc(p.client)}</span>` : ""}</div>
        <h1>${esc(p.name)}</h1>
        <p class="lead">${esc(p.tagline)}</p>
        ${primary.length ? `<div class="hero-actions left">${primary.map(l => `<a href="${esc(l.url)}" class="btn btn-primary" ${ext}>${esc(l.label)} <span aria-hidden="true">&#8599;</span></a>`).join("")}</div>` : ""}
      </div>
    </div>
  </div>
</section>

<section>
  <div class="container">
    <div class="detail-layout">
      <div class="prose">
        <h2>Overview</h2>
        ${p.overview.map(x => `<p>${esc(x)}</p>`).join("\n        ")}
        ${p.features.length ? `<h2>Key features</h2>
        <ul class="check-list">
          ${p.features.map(x => `<li>${esc(x)}</li>`).join("\n          ")}
        </ul>` : ""}
        ${p.images.length ? `<h2>Screenshots</h2>
        <div class="gallery">
          ${p.images.map(img => `<figure><a href="${esc(img.src)}" target="_blank" rel="noopener"><img src="${esc(img.src)}" alt="${esc(img.alt)}" loading="lazy"></a>${img.caption ? `<figcaption>${esc(img.caption)}</figcaption>` : ""}</figure>`).join("\n          ")}
        </div>` : ""}
        ${p.notes.map(n => `<div class="notice"><p>${esc(n)}</p></div>`).join("\n        ")}
      </div>
      <aside class="detail-side">
        <div class="side-card">
          <h2>At a glance</h2>
          <dl>
            <dt>Status</dt><dd>${esc(STATUSES[p.status])}</dd>
            <dt>Category</dt><dd>${esc(p.category)}</dd>
            ${p.platforms.length ? `<dt>Platforms</dt><dd>${p.platforms.map(esc).join(", ")}</dd>` : ""}
            <dt>${isProduct ? "Owner" : "Built by"}</dt><dd>${esc(SITE.name)}</dd>
          </dl>
          ${p.technologies.length ? `<h3>Technology stack</h3><div class="tag-row">${p.technologies.map(t => `<span class="tag">${esc(t)}</span>`).join("")}</div>` : ""}
          ${p.links.length ? `<h3>Links</h3><ul class="link-list">${p.links.map(l => `<li><a href="${esc(l.url)}" ${ext}>${esc(l.label)} &#8599;</a></li>`).join("")}</ul>` : ""}
        </div>
      </aside>
    </div>
    <div class="back-row"><a href="${listPath}" class="btn btn-secondary">&larr; Back to ${listName}</a></div>
  </div>
</section>

${ctaBanner("Interested in working with us?", "Ask about this " + (isProduct ? "product" : "project") + ", or tell us what you&rsquo;d like built.", "/contact.html", "Contact us")}`
  };
}
