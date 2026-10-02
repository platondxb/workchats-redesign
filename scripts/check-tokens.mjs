/**
 * Design-token guard.
 *
 * 1. Source check: components may not hard-code colours or use Tailwind arbitrary values with raw sizes
 *    (e.g. text-[13px], bg-[#fff], rounded-[7px]). Everything must come from src/styles/tokens.css.
 * 2. Build check (after `next build`): every class used in a className must exist in the generated CSS.
 *    With Tailwind's default scales removed, a class like `max-w-sm` or `font-normal` silently produces
 *    nothing, so this catches both typos and reaches for non-token values.
 *
 * Usage: node scripts/check-tokens.mjs            (source check, plus build check if .next exists)
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const srcDir = path.join(root, "src");

// The link preview image renders in Satori, outside the browser, and has to use literal colours.
const LITERAL_COLOUR_ALLOWED = new Set([
  "src/app/opengraph-image.tsx",
  "src/app/twitter-image.tsx",
  "src/styles/tokens.css",
]);
// Class-like words that intentionally produce no CSS of their own.
// (.pricing, .features and .comparison scope the radio-driven variants in globals.css; group and peer
// are Tailwind hooks.)
const MARKER_CLASSES = new Set(["group", "group/button", "peer", "pricing", "features", "comparison"]);

function walk(dir, exts) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full, exts));
    else if (exts.some((ext) => full.endsWith(ext))) out.push(full);
  }
  return out;
}

const problems = [];
const files = walk(srcDir, [".ts", ".tsx", ".css"]);

const HEX = /#[0-9a-fA-F]{3,8}\b/g;
const COLOUR_FN = /\b(?:rgb|rgba|hsl|hsla|oklch|oklab)\(/g;
const ARBITRARY_RAW =
  /\b[\w:/-]+-\[[^\]\s]*?(?:#[0-9a-fA-F]{3,8}|\d(?:px|rem|em|vh|vw|%)|rgb|hsl|oklch)[^\]\s]*\]/g;

for (const file of files) {
  const rel = path.relative(root, file);
  const text = readFileSync(file, "utf8");
  const lines = text.split("\n");
  lines.forEach((line, index) => {
    const where = `${rel}:${index + 1}`;
    if (!LITERAL_COLOUR_ALLOWED.has(rel)) {
      // Hex colours: only flag six/three-digit hex that isn't part of an id or anchor like #main.
      for (const match of line.matchAll(HEX)) {
        const before = line[match.index - 1] ?? "";
        if (/[\w-]/.test(before)) continue;
        if (/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(match[0])) {
          problems.push(`${where}  hard-coded colour ${match[0]}`);
        }
      }
      if (COLOUR_FN.test(line)) problems.push(`${where}  hard-coded colour function`);
      COLOUR_FN.lastIndex = 0;
    }
    for (const match of line.matchAll(ARBITRARY_RAW)) {
      problems.push(`${where}  arbitrary value "${match[0]}" (use a token)`);
    }
  });
}

// ── Build check ────────────────────────────────────────────────────────────────
const cssDir = path.join(root, ".next", "static");
if (existsSync(cssDir)) {
  const css = walk(cssDir, [".css"])
    .map((file) => readFileSync(file, "utf8"))
    .join("\n");

  const escapeClass = (name) => name.replace(/[^a-zA-Z0-9_-]/g, (char) => `\\${char}`);
  const classStrings = [];
  for (const file of walk(srcDir, [".tsx", ".ts"])) {
    const rel = path.relative(root, file);
    if (LITERAL_COLOUR_ALLOWED.has(rel)) continue;
    const text = readFileSync(file, "utf8");
    // className="…" attributes and string literals passed to cx(), buttonClasses() or class maps.
    for (const match of text.matchAll(/className="([^"]+)"/g)) classStrings.push([rel, match[1]]);
    for (const block of text.matchAll(/(?:cx|buttonClasses)\(([\s\S]*?)\)\s*[;}]/g)) {
      for (const literal of block[1].matchAll(/"([^"]*)"/g)) classStrings.push([rel, literal[1]]);
    }
    for (const block of text.matchAll(/const \w+(?:Sizes|Classes) = \{([\s\S]*?)\}/g)) {
      for (const literal of block[1].matchAll(/"([^"]*)"/g)) classStrings.push([rel, literal[1]]);
    }
  }

  const unknown = new Map();
  for (const [rel, value] of classStrings) {
    for (const token of value.split(/\s+/).filter(Boolean)) {
      if (MARKER_CLASSES.has(token) || !/^[a-z0-9!-]/.test(token) || /[{}$]/.test(token)) continue;
      if (["primary", "secondary", "ghost", "inverse", "inverse-outline", "sm", "md", "lg"].includes(token))
        continue;
      if (!css.includes(`.${escapeClass(token)}`)) {
        const list = unknown.get(token) ?? new Set();
        list.add(rel);
        unknown.set(token, list);
      }
    }
  }
  for (const [token, where] of unknown) {
    problems.push(`${[...where].join(", ")}  class "${token}" produces no CSS (typo or non-token value?)`);
  }
} else {
  console.log("check-tokens: no .next build found, skipping the generated-CSS check.");
}

if (problems.length > 0) {
  console.error(`check-tokens: ${problems.length} problem(s)\n${problems.map((p) => `  ${p}`).join("\n")}`);
  process.exit(1);
}
console.log("check-tokens: components use design tokens only.");
