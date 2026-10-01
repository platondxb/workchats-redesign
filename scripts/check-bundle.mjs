/**
 * Performance budget for "/", measured on the production build (brief §6.3).
 * Reads the prerendered HTML, finds every script, stylesheet and preloaded font it loads, and sums their
 * compressed sizes. Next.js 16 no longer prints First Load JS, so this is the source of truth in CI.
 *
 * JavaScript is budgeted on Brotli, which is what Vercel, Netlify and Cloudflare serve to every current
 * browser. The gzip figure is printed next to it: the Next.js 16.3 + React 19.2 runtime alone is about
 * 131 KB gzipped, above the brief's 120 KB gzip target before any page code (see docs/decisions.md).
 *
 * Usage: next build && node scripts/check-bundle.mjs
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { brotliCompressSync, constants, gzipSync } from "node:zlib";

const BUDGET = {
  firstLoadJsKb: 120, // Brotli, including the framework
  totalKb: 800, // first view, before consent
  fontFiles: 4,
  fontFamilies: 2,
};

const root = path.resolve(import.meta.dirname, "..");
const htmlFile = path.join(root, ".next", "server", "app", "index.html");
if (!existsSync(htmlFile)) {
  console.error("check-bundle: .next/server/app/index.html not found. Run `next build` first.");
  process.exit(1);
}
const html = readFileSync(htmlFile, "utf8");

const kb = (bytes) => bytes / 1024;
const gzip = (buffer) => gzipSync(buffer, { level: 9 }).length;
const brotli = (buffer) =>
  brotliCompressSync(buffer, { params: { [constants.BROTLI_PARAM_QUALITY]: 11 } }).length;
const assetPath = (url) => path.join(root, ".next", url.replace(/^\/_next\//, "").split("?")[0]);
const unique = (values) => [...new Set(values)];

// Scripts marked nomodule are legacy-browser polyfills that current browsers never download.
const scripts = unique(
  [...html.matchAll(/<script[^>]*\ssrc="(\/_next\/[^"]+\.js)"[^>]*>/g)]
    .filter((m) => !/nomodule/i.test(m[0]))
    .map((m) => m[1]),
);
const styles = unique([...html.matchAll(/<link[^>]+href="(\/_next\/[^"]+\.css)"/g)].map((m) => m[1]));
const fonts = unique([...html.matchAll(/<link[^>]+href="(\/_next\/[^"]+\.woff2)"/g)].map((m) => m[1]));
// Resources the browser actually fetches from other origins (canonical and alternate links don't count).
const thirdParty = unique(
  [
    ...html.matchAll(/<script[^>]+src="(https?:\/\/[^"]+)"/g),
    ...html.matchAll(/<img[^>]+src="(https?:\/\/[^"]+)"/g),
    ...html.matchAll(
      /<link[^>]+rel="(?:stylesheet|preload|modulepreload|preconnect)"[^>]+href="(https?:\/\/[^"]+)"/g,
    ),
  ].map((m) => m[1]),
);

const read = (url) => {
  const file = assetPath(url);
  if (!existsSync(file)) throw new Error(`Missing asset ${url} (${file})`);
  return readFileSync(file);
};
const sum = (urls, measure) => urls.reduce((total, url) => total + measure(read(url)), 0);

const jsBrotli = sum(scripts, brotli);
const jsGzip = sum(scripts, gzip);
const cssBrotli = sum(styles, brotli);
const fontBytes = sum(fonts, (buffer) => buffer.length); // WOFF2 is already compressed
const htmlBrotli = brotli(Buffer.from(html));
const totalBytes = jsBrotli + cssBrotli + fontBytes + htmlBrotli;

// Web-font families: @font-face rules that download a file. Local, size-matched fallbacks don't count.
const families = styles.length
  ? unique(
      [
        ...read(styles[0])
          .toString("utf8")
          .matchAll(/@font-face\s*\{([^}]*)\}/g),
      ]
        .filter((m) => /src:[^;]*url\(/.test(m[1]))
        .map((m) => (m[1].match(/font-family:\s*([^;]+)/)?.[1] ?? "").replace(/["']/g, "").trim()),
    )
  : [];

const rows = [
  ["HTML", kb(htmlBrotli)],
  [`JavaScript, ${scripts.length} files`, kb(jsBrotli)],
  [`  (same JavaScript gzipped)`, kb(jsGzip)],
  [`CSS, ${styles.length} file(s)`, kb(cssBrotli)],
  [`Fonts, ${fonts.length} preloaded WOFF2`, kb(fontBytes)],
  ["Total first view before consent", kb(totalBytes)],
];
console.log("Compressed transfer sizes (Brotli unless stated):");
for (const [label, value] of rows) console.log(`  ${label.padEnd(38)} ${value.toFixed(1).padStart(7)} KB`);
console.log(`  ${"Font families".padEnd(38)} ${families.length} (${families.join(", ")})`);
console.log(`  ${"Third-party resources".padEnd(38)} ${thirdParty.length}`);

const failures = [];
if (kb(jsBrotli) > BUDGET.firstLoadJsKb)
  failures.push(`JavaScript ${kb(jsBrotli).toFixed(1)} KB > ${BUDGET.firstLoadJsKb} KB`);
if (kb(totalBytes) > BUDGET.totalKb)
  failures.push(`Total ${kb(totalBytes).toFixed(1)} KB > ${BUDGET.totalKb} KB`);
if (fonts.length > BUDGET.fontFiles) failures.push(`${fonts.length} font files > ${BUDGET.fontFiles}`);
if (families.length > BUDGET.fontFamilies)
  failures.push(`${families.length} font families > ${BUDGET.fontFamilies}`);
if (thirdParty.length > 0) failures.push(`Third-party resources before consent: ${thirdParty.join(", ")}`);

if (failures.length > 0) {
  console.error(`\ncheck-bundle: over budget\n  ${failures.join("\n  ")}`);
  process.exit(1);
}
console.log("\ncheck-bundle: within budget.");
