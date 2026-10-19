#!/usr/bin/env node
/* spinfish.app — builds the website (17.10.2026): site-src/ → site/ (what Netlify publishes; no build step there).
 *   node tools/build-site.js
 * Pages: site-src/pages/<page>.<lang>.html (the body only), the frame (header, footer, languages) — here.
 * Ukrainian at /, English at /en/. Images, fonts — site/assets/ (copies of the game's; put in by hand).
 * Repo: andriiteslia/spinfish-website (separate from the game, 17.10). Netlify publishes site/ (netlify.toml).
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'site-src');
const OUT = path.join(ROOT, 'site');
const V = '20261019b';                      // cache-busting for site.css
const ORIGIN = 'https://spinfish.app';
const EMAIL = 'support@spinfish.app';

const PAGES = {
  home:      { path: '',               uk: 'Spin Fish — спінінгова риболовля', en: 'Spin Fish — spinning fishing game' },
  privacy:   { path: 'privacy/',       uk: 'Політика конфіденційності', en: 'Privacy Policy' },
  terms:     { path: 'terms/',         uk: 'Умови користування', en: 'Terms of Use' },
  delete:    { path: 'delete-account/', uk: 'Видалити акаунт', en: 'Delete your account' },
  support:   { path: 'support/',       uk: 'Підтримка', en: 'Support' },
  thanks:    { path: 'support/thanks/', uk: 'Дякуємо!', en: 'Thank you!', noindex: true },
};
const NAV = ['support', 'privacy', 'terms', 'delete'];
const T = {
  uk: { desc: 'Spin Fish — мобільна гра про спінінгову риболовлю: закид свайпом, проводка, підсічка й виважування на водоймах України.',
    home: 'Головна', copy: '© 2026 Spin Fish · Andrii Teslia, Івано-Франківськ, Україна', write: 'Пишіть нам', skip: 'До змісту' },
  en: { desc: 'Spin Fish is a mobile spinning fishing game: swipe to cast, retrieve, strike and play the fish on Ukrainian waters.',
    home: 'Home', copy: '© 2026 Spin Fish · Andrii Teslia, Ivano-Frankivsk, Ukraine', write: 'Write to us', skip: 'Skip to content' },
};
const url = (lang, p) => `/${lang === 'en' ? 'en/' : ''}${PAGES[p].path}`;

function frame(lang, page, body) {
  const t = T[lang], P = PAGES[page];
  const other = lang === 'uk' ? 'en' : 'uk';
  const isHome = page === 'home';
  const nav = NAV.map((p) => `<a href="${url(lang, p)}"${p === page ? ' aria-current="true"' : ''}>${PAGES[p][lang]}</a>`).join('');
  const title = isHome ? P[lang] : `${P[lang]} — Spin Fish`;
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${title}</title>
<meta name="description" content="${t.desc}">
<meta name="theme-color" content="#eff2f6" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0d1424" media="(prefers-color-scheme: dark)">
${P.noindex ? '<meta name="robots" content="noindex">\n' : ''}<link rel="canonical" href="${ORIGIN}${url(lang, page)}">
<link rel="alternate" hreflang="uk" href="${ORIGIN}${url('uk', page)}">
<link rel="alternate" hreflang="en" href="${ORIGIN}${url('en', page)}">
<link rel="icon" type="image/png" sizes="192x192" href="/assets/icon-192.png">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<link rel="preload" href="/assets/fixel-display-regular.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fixel-display-bold.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/site.css?v=${V}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${t.desc}">
<meta property="og:image" content="${ORIGIN}/assets/shot-lakes-2.webp">
</head>
<body class="${isHome ? 'is-hero' : ''}">
<header class="top"><div class="wrap">
  <a class="top__logo" href="${url(lang, 'home')}" aria-label="Spin Fish — ${t.home}"><img src="/assets/logo.webp" alt="Spin Fish" width="72" height="40"></a>
  <nav class="top__nav" aria-label="${t.home}"><span class="top__links">${nav}</span><span class="lang"><a href="${url('uk', page)}" hreflang="uk" lang="uk"${lang === 'uk' ? ' aria-current="true"' : ''}>УКР</a><a href="${url('en', page)}" hreflang="en" lang="en"${lang === 'en' ? ' aria-current="true"' : ''}>ENG</a></span></nav>
</div></header>
<main id="main">
${body.trim()}
</main>
<footer class="foot"><div class="wrap">
  <nav>${NAV.map((p) => `<a href="${url(lang, p)}">${PAGES[p][lang]}</a>`).join('')}</nav>
  <p>${t.write}: <a href="mailto:${EMAIL}">${EMAIL}</a></p>
  <p>${t.copy}</p>
</div></footer>
<script>(function () { var a = document.querySelector('.top__links [aria-current="true"]'); var l = a && a.parentNode; if (l && l.scrollWidth > l.clientWidth) l.scrollLeft = a.offsetLeft - (l.clientWidth - a.offsetWidth) / 2; })();</script>
</body>
</html>
`;
}

let n = 0;
for (const page of Object.keys(PAGES)) {
  for (const lang of ['uk', 'en']) {
    const src = path.join(SRC, 'pages', `${page}.${lang}.html`);
    if (!fs.existsSync(src)) throw new Error(`missing ${src}`);
    const body = fs.readFileSync(src, 'utf8').replace(/\{\{EMAIL\}\}/g, EMAIL).replace(/\{\{(uk|en):(\w+)\}\}/g, (m, l, p) => url(l, p));
    const dir = path.join(OUT, lang === 'en' ? 'en' : '', PAGES[page].path);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), frame(lang, page, body));
    n++;
  }
}
// 404 (Netlify serves /404.html for any missing path)
fs.writeFileSync(path.join(OUT, '404.html'), frame('uk', 'thanks', fs.readFileSync(path.join(SRC, 'pages', '404.html'), 'utf8')).replace(/<title>[^<]*<\/title>/, '<title>404 — Spin Fish</title>'));
fs.copyFileSync(path.join(SRC, 'site.css'), path.join(OUT, 'assets', 'site.css'));
fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${ORIGIN}/sitemap.xml\n`);
const pages = Object.keys(PAGES).filter((p) => !PAGES[p].noindex);
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${
  pages.flatMap((p) => ['uk', 'en'].map((l) => `  <url><loc>${ORIGIN}${url(l, p)}</loc></url>`)).join('\n')}\n</urlset>\n`);
// security headers + long cache for assets (Netlify reads site/_headers)
fs.writeFileSync(path.join(OUT, '_headers'), `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: DENY
  Permissions-Policy: camera=(), microphone=(), geolocation=()
`);
// Netlify config — netlify.toml at the repo root (publish = "site", no build step)
console.log(`site/: ${n} pages + 404, robots.txt, sitemap.xml, _headers`);
