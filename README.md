# Summer Homes — Luxury Real Estate Template

A multilingual, single-property landing page template built for a boutique luxury real estate advisory. Deployed at **[summer-homes-demo.netlify.app](https://summer-homes-demo.netlify.app)**.

Built as a portfolio piece to demonstrate a complete freelance web delivery: data-driven content, four-language i18n, responsive layout with mobile menu, SEO, analytics, and a working contact form — no build step, no framework.

## Features

- **Four languages** (EN / TR / DE / RU) with automatic browser-language detection and `localStorage` persistence. Content swap is instant, no page reload.
- **Data-driven** — all copy lives in `data.json`, rendered into the page via `data-bind` and `data-i18n` attributes. The markup has no hard-coded strings.
- **Responsive** with a mobile hamburger menu below 900px.
- **Contact form** powered by Netlify Forms (AJAX submit, localized success message, honeypot anti-spam).
- **Interactive gallery** with a keyboard-navigable lightbox.
- **Embedded Google Map** and click-to-call / WhatsApp deep-link buttons.
- **FAQ accordion** built with Tailwind utility classes (hybrid CDN + custom CSS).
- **SEO**: hreflang tags for four languages, JSON-LD `RealEstateListing` structured data, Open Graph & Twitter Card meta, sitemap, and `robots.txt`.
- **Google Analytics 4** integrated.
- **404 page** with consistent branding.

## Stack

- **HTML5 + CSS3** (custom properties, CSS Grid, container queries)
- **Vanilla JavaScript** — no framework, no build
- **Tailwind CSS** via CDN (FAQ section only)
- **Netlify** for hosting, forms, and 404 routing

## Project Structure

```
index.html       — main landing page
about.html       — company information
privacy.html     — privacy policy
404.html         — not-found page
styles.css       — all custom styles
app.js           — data loading, i18n, UI interactions
data.json        — all copy + property data (4 languages)
sitemap.xml      — SEO sitemap
robots.txt       — crawler directives
images/          — gallery photos
```

## Run Locally

Because the site loads `data.json` via `fetch`, opening `index.html` directly from the filesystem won't work (CORS). Serve it with any static server:

```bash
# Python
python3 -m http.server 8000

# Node
npx serve .

# VS Code
# Install "Live Server" extension and click "Go Live"
```

Then visit `http://localhost:8000`.

## Deploy

Push to `main` — Netlify auto-deploys. Forms work automatically once **Forms** is enabled in the Netlify dashboard.

## Customising

To reuse for a different project, edit `data.json`:

- `brand`, `project`, `features`, `highlights` — hero, specs, amenities
- `gallery` — image paths and alt text
- `location` — map coordinates
- `contact` — phone, email, WhatsApp number
- `faq` — Q&A pairs

Every string is an object keyed by language code (`en`, `tr`, `de`, `ru`). Missing translations fall back to English.
