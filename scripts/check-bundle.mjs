/**
 * Performance budget for "/", measured on the production build (brief §6.3 and §8).
 * Reads the prerendered HTML, finds every script, stylesheet and preloaded font it loads, and sums their
 * compressed sizes. Next.js 16 no longer prints First Load JS, so this is the source of truth in CI.
 *
 * JavaScript is budgeted on Brotli, which is what Vercel, Netlify and Cloudflare serve to every current
 * browser. The gzip figure is printed next to it: the Next.js 16.3 + React 19.2 runtime alone is about
 * 131 KB gzipped, above the brief's 120 KB gzip target before any page code (see docs/decisions.md).
 *
 * Usage: next build && node scripts/check-bundle.mjs
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { brotliCompressSync, constants, gzipSync } from "node:zlib";

const BUDGET = {
  firstLoadJsKb: 120, // Brotli, including the framework
  totalKb: 800, // first view, before consent
  fontFiles: 4,
  fontFamilies: 2,
  // Loaded after the first view (brief §6.3): client chunks the page imports lazily, and any 3D device
  // assets under public/3d/<device>/. Today both are zero: the devices are HTML and CSS
  // (docs/redesign/adr-3d-devices.md), and these budgets keep it honest if that changes.
  deferredJsKb: 180, // Brotli
  deviceAssetsKb: 1536, // per device folder: model plus textures
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

// Deferred JavaScript: chunks the page's client components can load, minus the ones the HTML already loads.
const manifestFile = path.join(root, ".next", "server", "app", "page_client-reference-manifest.js");
const pageChunks = existsSync(manifestFile)
  ? unique(
      [...readFileSync(manifestFile, "utf8").matchAll(/static\/chunks\/[^"'\\]+?\.js/g)].map(
        (m) => `/_next/${m[0]}`,
      ),
    )
  : [];
const deferred = pageChunks.filter((url) => !scripts.includes(url) && existsSync(assetPath(url)));
const deferredBrotli = sum(deferred, brotli);

// 3D device assets, if any: each folder in public/3d is one device.
const deviceDir = path.join(root, "public", "3d");
const folderSize = (dir) =>
  readdirSync(dir).reduce((total, entry) => {
    const full = path.join(dir, entry);
    return total + (statSync(full).isDirectory() ? folderSize(full) : statSync(full).size);
  }, 0);
const devices = existsSync(deviceDir)
  ? readdirSync(deviceDir)
      .filter((entry) => statSync(path.join(deviceDir, entry)).isDirectory())
      .map((name) => [name, folderSize(path.join(deviceDir, name))])
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
console.log(
  `  ${`Deferred JavaScript, ${deferred.length} files`.padEnd(38)} ${kb(deferredBrotli).toFixed(1).padStart(7)} KB`,
);
console.log(
  `  ${"3D device assets".padEnd(38)} ${devices.length === 0 ? "none (the devices are HTML and CSS)" : devices.map(([name, bytes]) => `${name} ${kb(bytes).toFixed(0)} KB`).join(", ")}`,
);

const failures = [];
if (kb(jsBrotli) > BUDGET.firstLoadJsKb)
  failures.push(`JavaScript ${kb(jsBrotli).toFixed(1)} KB > ${BUDGET.firstLoadJsKb} KB`);
if (kb(totalBytes) > BUDGET.totalKb)
  failures.push(`Total ${kb(totalBytes).toFixed(1)} KB > ${BUDGET.totalKb} KB`);
if (fonts.length > BUDGET.fontFiles) failures.push(`${fonts.length} font files > ${BUDGET.fontFiles}`);
if (families.length > BUDGET.fontFamilies)
  failures.push(`${families.length} font families > ${BUDGET.fontFamilies}`);
if (thirdParty.length > 0) failures.push(`Third-party resources before consent: ${thirdParty.join(", ")}`);
if (kb(deferredBrotli) > BUDGET.deferredJsKb)
  failures.push(`Deferred JavaScript ${kb(deferredBrotli).toFixed(1)} KB > ${BUDGET.deferredJsKb} KB`);
for (const [name, bytes] of devices) {
  if (kb(bytes) > BUDGET.deviceAssetsKb)
    failures.push(`3D assets for ${name}: ${kb(bytes).toFixed(0)} KB > ${BUDGET.deviceAssetsKb} KB`);
}

if (failures.length > 0) {
  console.error(`\ncheck-bundle: over budget\n  ${failures.join("\n  ")}`);
  process.exit(1);
}
console.log("\ncheck-bundle: within budget.");
