---
title: Web Performance for Small Business Websites: A Practical Checklist
description: Core Web Vitals explained simply, plus practical fixes for images, fonts, scripts and caching that make a small business website load fast.
date: 2026-11-02
category: Web Development
---
A slow website costs a small business quietly. Visitors on mobile data give up before the page appears, contact forms never get filled in, and search engines take page experience into account. The encouraging part is that most small business sites are slow for the same few reasons, and fixing them rarely needs a redesign.

We build websites for clients and run our own, so this guide is the checklist we actually use: what to measure, what usually goes wrong, and how to fix it.

## Understand Core Web Vitals in plain terms

Google's Core Web Vitals are three measurements of how a page feels to a real visitor. You do not need to memorise the thresholds, but you should know what each one means.

- **Largest Contentful Paint (LCP)** measures loading. It is the time until the biggest thing in the visible area, usually a hero image or main heading, appears. Slow LCP feels like a blank or half-built page.
- **Interaction to Next Paint (INP)** measures responsiveness. It looks at how quickly the page visibly reacts when someone taps a button, opens a menu or types. Poor INP feels like the page is frozen.
- **Cumulative Layout Shift (CLS)** measures visual stability. It captures content jumping around while the page loads, such as text moving down when an image or banner appears, causing people to tap the wrong thing.

Google publishes the current "good" thresholds on [web.dev](https://web.dev/), and they occasionally change, so check there rather than relying on numbers in older articles.

## Measure before you change anything

Start by measuring so you know which problem you actually have.

1. **Run PageSpeed Insights.** Enter your address at [PageSpeed Insights](https://pagespeed.web.dev/). If your site has enough traffic, the top section shows field data from real Chrome users. Below it is a lab test (Lighthouse) with a list of specific opportunities.
2. **Test the mobile result.** The mobile test simulates a mid-range phone on a slower network. That is closer to many real visitors than your office computer on fast broadband.
3. **Use Lighthouse in Chrome DevTools** for quick checks while you work. Open DevTools, choose the Lighthouse panel and run a mobile report.
4. **Check on a real phone.** Load your site on an ordinary phone over mobile data. Your own impression matters.
5. **Write the results down** so you can compare after each change.

Test your most important pages, typically the homepage, a service or product page and the contact page, not just the homepage.

## Fix images first

On most small business sites, images are the largest part of the page and the most common cause of slow LCP.

- **Resize to the size actually displayed.** A photo straight from a camera can be thousands of pixels wide, while it shows at perhaps 800 pixels. Export images close to the largest size they appear.
- **Use modern formats.** WebP and AVIF are usually much smaller than JPEG or PNG at similar quality, and all current major browsers support WebP. Keep PNG for images that need sharp edges or transparency, such as logos, or use SVG for simple logos and icons.
- **Compress.** Image tools and online compressors let you reduce quality slightly with little visible difference.
- **Lazy-load images below the fold.** Add the `loading="lazy"` attribute to images further down the page so the browser loads them only when needed.
- **Do not lazy-load the main hero image.** It is usually the LCP element and should load immediately.
- **Always set width and height** on images, or reserve space with CSS. This lets the browser keep space for the image before it loads and prevents layout shift.

```html
<img src="/assets/img/shop-front.webp" alt="Our shop front on Main Road"
     width="1200" height="800" loading="lazy">
```

## Be careful with fonts

Custom fonts make a site look polished, but every weight and style is another file to download.

- Use one or two font families and only the weights you actually use.
- Use the `font-display: swap` setting (Google Fonts adds it with `display=swap` in the URL) so text appears immediately in a fallback font instead of staying invisible.
- Preconnect to the font provider, or host the font files on your own domain.
- Consider a system font stack for body text. It loads instantly and looks native on every device.

## Cut third-party scripts

Chat widgets, social media embeds, multiple analytics tools, heatmaps, pop-ups and old tracking tags add up fast. Each one can download large amounts of JavaScript and compete for the phone's processor, which hurts INP.

Go through every script on the site and ask whether it earns its place. Remove tools nobody looks at anymore. Load scripts with `async` or `defer` so they do not block the page from rendering. Replace heavy embeds, such as a video player, with a lightweight preview image that loads the real player only when clicked. A Google Map embed on the contact page can often be replaced with a simple link to the map.

## Use caching and a CDN

When someone visits a second page, their browser should not download your logo and stylesheet again.

- **Set long cache lifetimes for static files** such as CSS, JavaScript, images and fonts.
- **Version your asset URLs** (for example `style.css?v=3f2a91` or a hashed filename) so that when you change a file, browsers fetch the new one immediately despite the long cache.
- **Use a content delivery network (CDN).** A CDN stores copies of your files on servers close to your visitors. Many hosts include one, and services like Cloudflare offer free plans.
- **Enable compression** (gzip or Brotli) for text files. Most hosts and CDNs do this automatically; Lighthouse will tell you if not.

If your site runs on a heavy content management system with many plugins, a caching plugin or a simpler static setup can make a dramatic difference. We describe our own static setup in [hosting a fast static website with GitHub Pages and Cloudflare](/blog/static-site-github-pages-cloudflare.html).

## Prevent layout shift

Besides missing image dimensions, the usual causes of layout shift are banners and cookie notices that push content down, ads or embeds without reserved space, and fonts that change size when they load. Reserve space for anything that appears later, show notices as overlays rather than inserting them above content, and pick fallback fonts with similar proportions.

## The checklist

- Measured homepage, a key service page and the contact page on mobile
- Images resized, compressed and in WebP or AVIF where suitable
- Width and height set on every image; lazy loading below the fold only
- Hero image loads immediately
- One or two font families, few weights, `display=swap`
- Unused scripts and plugins removed; the rest loaded with `async` or `defer`
- Heavy embeds replaced with click-to-load previews
- Long caching on static files with versioned URLs
- CDN and compression enabled
- Re-measured and results recorded

## Conclusion

Website performance is not a one-off project. Every new plugin, photo and widget can slow a site down again, so re-run PageSpeed Insights after significant changes and every few months. Start with images and third-party scripts, since they cause most problems, then work through caching and fonts. A fast, simple site respects your visitors' time and data, and it makes everything else you do online work better.
