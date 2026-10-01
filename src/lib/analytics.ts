/**
 * Analytics is off unless a GA4 measurement ID is configured. When it is on, nothing loads until
 * the visitor accepts: no Google request and no cookie before consent.
 */
const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ?? "";
export const gaMeasurementId: string | null = measurementId === "" ? null : measurementId;

export const analyticsEnabled = gaMeasurementId !== null;

/** Origins the Content Security Policy must allow once analytics is enabled. */
export const analyticsOrigins = {
  script: ["https://www.googletagmanager.com"],
  connect: [
    "https://www.google-analytics.com",
    "https://*.google-analytics.com",
    "https://*.analytics.google.com",
    "https://www.googletagmanager.com",
  ],
  img: ["https://www.google-analytics.com", "https://www.googletagmanager.com"],
} as const;
