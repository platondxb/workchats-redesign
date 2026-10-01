import type { NextConfig } from "next";
import { analyticsEnabled, analyticsOrigins } from "./src/lib/analytics";

const isDev = process.env.NODE_ENV === "development";
const legacyOriginValue = process.env.LEGACY_SITE_ORIGIN?.trim().replace(/\/$/, "") ?? "";
const legacyOrigin = legacyOriginValue === "" ? null : legacyOriginValue;

/**
 * Content Security Policy for a statically rendered site. Nonces would force dynamic rendering, so this
 * follows the "without nonces" approach: scripts only from this origin (plus Google's tag origin once
 * analytics is enabled). 'unsafe-inline' is needed for the inline scripts Next.js adds to static pages
 * and for the page's two small inline scripts (hero demo pause, pricing currency); the page has no
 * user-generated content.
 */
function contentSecurityPolicy(): string {
  const ga = analyticsEnabled;
  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": [
      "'self'",
      "'unsafe-inline'",
      ...(isDev ? ["'unsafe-eval'"] : []),
      ...(ga ? analyticsOrigins.script : []),
    ],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", ...(ga ? analyticsOrigins.img : [])],
    "font-src": ["'self'"],
    "connect-src": ["'self'", ...(isDev ? ["ws:"] : []), ...(ga ? analyticsOrigins.connect : [])],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
  };
  return Object.entries(directives)
    .map(([name, values]) => `${name} ${values.join(" ")}`)
    .join("; ");
}

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy() },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,

  headers() {
    return Promise.resolve([{ source: "/:path*", headers: securityHeaders }]);
  },

  /**
   * During the migration only "/" lives in this app. With LEGACY_SITE_ORIGIN set, every other path
   * (/pricing, /features/…, /blog/…) is served from the current site, so no existing URL breaks.
   * Fallback rewrites run only after this app's own routes, so they never affect "/".
   */
  rewrites() {
    if (!legacyOrigin) return Promise.resolve([]);
    return Promise.resolve({
      beforeFiles: [],
      afterFiles: [],
      fallback: [{ source: "/:path*", destination: `${legacyOrigin}/:path*` }],
    });
  },
};

export default nextConfig;
