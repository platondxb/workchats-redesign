import { afterEach, describe, expect, it } from "vitest";
import { detectPlatform, platformScript } from "./platform";

const ua = {
  mac: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36",
  windows:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36",
  linux: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36",
  iphone:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
  android:
    "Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36",
  chromebook:
    "Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36",
  bot: "curl/8.7.1",
};

describe("detectPlatform", () => {
  it("recognises each desktop platform", () => {
    expect(detectPlatform(ua.mac, "MacIntel", 0)).toBe("macos");
    expect(detectPlatform(ua.windows, "Win32", 0)).toBe("windows");
    expect(detectPlatform(ua.linux, "Linux x86_64", 0)).toBe("linux");
  });

  it("recognises phones, including Android's Linux user agent", () => {
    expect(detectPlatform(ua.iphone, "iPhone", 5)).toBe("ios");
    expect(detectPlatform(ua.android, "Linux armv8l", 5)).toBe("android");
  });

  it("treats a Mac with a touch screen as an iPad, as iPadOS reports itself as a Mac", () => {
    expect(detectPlatform(ua.mac, "MacIntel", 5)).toBe("ios");
  });

  it("reads the newer userAgentData platform names too", () => {
    expect(detectPlatform("", "macOS", 0)).toBe("macos");
    expect(detectPlatform("", "Windows", 0)).toBe("windows");
    expect(detectPlatform("", "Android", 5)).toBe("android");
    expect(detectPlatform("", "Chrome OS", 0)).toBe("web");
  });

  it("sends Chromebooks to the web app and leaves anything unknown neutral", () => {
    expect(detectPlatform(ua.chromebook, "Linux x86_64", 0)).toBe("web");
    expect(detectPlatform(ua.bot, "", 0)).toBeNull();
  });
});

describe("the inline platform script", () => {
  const run = (userAgent: string, platform: string, maxTouchPoints = 0) => {
    Object.defineProperty(window.navigator, "userAgent", { value: userAgent, configurable: true });
    Object.defineProperty(window.navigator, "platform", { value: platform, configurable: true });
    Object.defineProperty(window.navigator, "maxTouchPoints", { value: maxTouchPoints, configurable: true });
    // The same string the layout puts in <head>; running that exact string is the point of this test.
    // eslint-disable-next-line @typescript-eslint/no-implied-eval, @typescript-eslint/no-unsafe-call
    new Function(platformScript)();
    return document.documentElement.getAttribute("data-os");
  };

  afterEach(() => document.documentElement.removeAttribute("data-os"));

  it("marks <html> with the visitor's platform before anything paints", () => {
    expect(run(ua.windows, "Win32")).toBe("windows");
  });

  it("leaves <html> unmarked when the platform can't be told, so the neutral labels stay", () => {
    expect(run(ua.bot, "")).toBeNull();
  });
});
