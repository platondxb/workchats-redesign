import type { PlatformId } from "@/content/site";

/**
 * The visitor's platform, from what the browser reports. Pure and self-contained (no imports, no outer
 * variables), because the same function is serialised into the inline script below; the unit tests call it
 * directly and also run the script.
 *
 * iPadOS reports itself as a Mac, so a "Mac" with a touch screen is an iPad. Chromebooks get the web app.
 * Anything unrecognised returns null, and the page keeps its device-neutral labels.
 */
export function detectPlatform(
  userAgent: string,
  platform: string,
  maxTouchPoints: number,
): PlatformId | null {
  if (/iPhone|iPad|iPod/.test(userAgent) || /^(?:iPhone|iPad|iPod|iOS)/.test(platform)) return "ios";
  if (userAgent.includes("Android") || platform === "Android") return "android";
  if (userAgent.includes("CrOS") || platform === "Chrome OS") return "web";
  // navigator.platform says "MacIntel"; userAgentData.platform says "macOS".
  if (/^mac/i.test(platform) || userAgent.includes("Macintosh")) return maxTouchPoints > 1 ? "ios" : "macos";
  if (platform.includes("Win") || userAgent.includes("Windows")) return "windows";
  if (platform.includes("Linux") || /Linux|X11/.test(userAgent)) return "linux";
  return null;
}

/**
 * Runs in <head>, before anything is painted: sets data-os on <html>, and CSS then shows the matching
 * download label and marks "This device" (globals.css, the os-* variants). Nothing moves after the first
 * paint, so there is no layout shift, and with JavaScript off the neutral labels stay.
 */
export const platformScript = `(function(){try{var n=navigator,p=(n.userAgentData&&n.userAgentData.platform)||n.platform||"",os=(${detectPlatform.toString()})(n.userAgent||"",p,n.maxTouchPoints||0);if(os)document.documentElement.setAttribute("data-os",os)}catch(e){}})()`;
