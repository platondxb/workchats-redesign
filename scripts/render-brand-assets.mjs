/**
 * Renders the icon files from the logo mark in src/components/layout/Logo.tsx:
 *   src/app/icon.svg            favicon (SVG)
 *   src/app/favicon.ico         16px and 32px PNGs in an ICO container, for browsers that ask for /favicon.ico
 *   src/app/apple-icon.png      180 × 180 home-screen icon
 *   public/brand/workchats-logo.png  512 × 512 logo for structured data
 *
 * Usage: node scripts/render-brand-assets.mjs   (needs Playwright's Chromium: npx playwright install chromium)
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { chromium } from "@playwright/test";

const BRAND_BLUE = "#0077ff"; // --color-brand in src/styles/tokens.css

const logoSource = await readFile(new URL("../src/components/layout/Logo.tsx", import.meta.url), "utf8");
const markPath = logoSource.match(/const MARK_PATH =\s*"([^"]+)"/)?.[1];
const wordmarkPath = logoSource.match(/const WORDMARK_PATH =\s*"([^"]+)"/)?.[1];
if (!markPath || !wordmarkPath) throw new Error("Logo paths not found in Logo.tsx");
const INK = "#0e1626"; // --color-ink

const markSvg = (fill) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 126 126"><path fill="${fill}" d="${markPath}"/></svg>`;

await writeFile(new URL("../src/app/icon.svg", import.meta.url), `${markSvg(BRAND_BLUE)}\n`);

// Cacheable logo files for places where an inline SVG would repeat the path data in every page.
await mkdir(new URL("../public/brand/", import.meta.url), { recursive: true });
await writeFile(
  new URL("../public/brand/workchats-logo.svg", import.meta.url),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 586 126"><path fill="${BRAND_BLUE}" d="${markPath}"/><path fill="${INK}" d="${wordmarkPath}"/></svg>\n`,
);

const browser = await chromium.launch();
const page = await browser.newPage();

async function renderPng(size, markSize, background) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(
    `<html><body style="margin:0;display:grid;place-items:center;width:${size}px;height:${size}px;background:${background}">
      <div style="width:${markSize}px;height:${markSize}px">${markSvg(BRAND_BLUE).replace("<svg ", '<svg width="100%" height="100%" ')}</div>
    </body></html>`,
  );
  return page.screenshot({ type: "png", omitBackground: background === "transparent" });
}

/** Minimal ICO container holding PNG images (supported by every current browser). */
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = 6 + images.length * 16;
  const entries = images.map(({ size, png }) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += png.length;
    return entry;
  });
  return Buffer.concat([header, ...entries, ...images.map((image) => image.png)]);
}

const favicon16 = await renderPng(16, 16, "transparent");
const favicon32 = await renderPng(32, 32, "transparent");
await writeFile(
  new URL("../src/app/favicon.ico", import.meta.url),
  ico([
    { size: 16, png: favicon16 },
    { size: 32, png: favicon32 },
  ]),
);

await writeFile(new URL("../src/app/apple-icon.png", import.meta.url), await renderPng(180, 120, "#ffffff"));

await writeFile(
  new URL("../public/brand/workchats-logo.png", import.meta.url),
  await renderPng(512, 360, "#ffffff"),
);

await browser.close();
console.log("Brand assets written.");
