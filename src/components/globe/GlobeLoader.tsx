"use client";

import { useEffect } from "react";

/** cobe's own WebGL settings. The planet reuses the context this asks for, so checking costs nothing extra. */
const contextAttributes: WebGLContextAttributes = {
  alpha: true,
  antialias: true,
  depth: false,
  stencil: false,
  preserveDrawingBuffer: false,
};

/**
 * Swaps the region globe's poster for the live planet once it comes within a screen of view. The planet
 * (cobe and the code that turns it, globe-runtime.ts) is a separate chunk, fetched only then, and only on
 * devices it suits: WebGL 2, no reduced motion, no Save-Data and at least 4 GB of memory (brief §6). Any
 * other device keeps the poster, which shows the same view with the same arcs and labels.
 *
 * Renders nothing: the globe itself is server-rendered, and this finds it by id.
 */
export function GlobeLoader({ target }: { target: string }) {
  useEffect(() => {
    const root = document.getElementById(target);
    if (!root || !("IntersectionObserver" in window) || !suited()) return;
    let controller: { destroy: () => void } | undefined;
    let cancelled = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        const canvas = document.createElement("canvas");
        if (!canvas.getContext("webgl2", contextAttributes)) return;
        import("./globe-runtime")
          .then(({ mountGlobe }) => {
            if (!cancelled) controller = mountGlobe(root, canvas);
          })
          .catch(() => {
            // The poster stays: it is the same picture, standing still.
          });
      },
      { rootMargin: "100% 0px" },
    );
    observer.observe(root);
    return () => {
      cancelled = true;
      observer.disconnect();
      controller?.destroy();
    };
  }, [target]);
  return null;
}

function suited(): boolean {
  const device = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
  return (
    !matchMedia("(prefers-reduced-motion: reduce)").matches &&
    device.connection?.saveData !== true &&
    (device.deviceMemory ?? 8) >= 4
  );
}
