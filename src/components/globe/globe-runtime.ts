import createGlobe from "cobe";
import {
  arcPath,
  focusOn,
  homeCentre,
  nearestTurn,
  pinAt,
  viewOf,
  type LatLng,
  type View,
} from "./globe-math";

/*
 * The live region globe. cobe draws the planet in a canvas; this turns it (by dragging, with a little
 * momentum, and to a region when one is chosen in the list beside it) and keeps the server-rendered arcs
 * and labels (RegionGlobe.tsx) on the planet as it turns. It draws only while something moves: a globe at
 * rest costs nothing.
 *
 * Loaded on demand by GlobeLoader, which has already checked the device and made the WebGL context.
 *
 * The first time the globe comes into view it turns in from the east and the arcs draw in between the
 * regions, once, in under two seconds. If the visitor is already looking at it when it loads, it simply
 * takes over from the poster, which shows the same view.
 */

type Rgb = [number, number, number];

const planet = { mapSamples: 20000, diffuse: 1.2 };
/** The canvas is drawn at up to twice its size: past that, sharper costs more and shows nothing. */
const maxPixelRatio = 2;
/** How far the globe tilts, in radians from the equator: about 20° south to 72° north. */
const tilt = { min: -0.35, max: 1.25 };
/** Turning to a region: a spring that settles in about three quarters of a second. */
const stiffness = 36;
const damping = 2 * Math.sqrt(stiffness) * 0.9;
/** After a fling the globe glides on, slowing with this time constant (seconds). */
const glide = 0.32;
/** The intro starts this far east of and above the resting view (degrees) and turns into it. */
const introFrom: LatLng = [homeCentre[0] + 12, homeCentre[1] + 70];
/** How long the intro's arcs take to draw in (globe.css, globe-arc: two 600ms draws, staggered). */
const drawIn = 1600;
/** cobe loads its world map after the globe is made; past this the globe shows anyway (milliseconds). */
const mapTimeout = 2500;

export interface GlobeController {
  destroy: () => void;
}

interface Pin {
  element: HTMLElement;
  id: string;
  place: LatLng;
}

interface Drag {
  pointer: number;
  x: number;
  y: number;
  startX: number;
  startY: number;
  time: number;
  moved: boolean;
  pin: string | null;
}

export function mountGlobe(
  root: HTMLElement,
  canvas: HTMLCanvasElement,
  { intro = true }: { intro?: boolean } = {},
): GlobeController {
  const host = root.querySelector<HTMLElement>("[data-globe-canvas]");
  const gl = canvas.getContext("webgl2");
  if (!host || !gl) return { destroy: () => undefined };

  const pins: Pin[] = [...root.querySelectorAll<HTMLElement>("[data-pin]")].map((element) => ({
    element,
    id: element.dataset.pin ?? "",
    place: [Number(element.dataset.lat), Number(element.dataset.lng)],
  }));
  const placeOf = (id: string | undefined) => pins.find((pin) => pin.id === id)?.place;
  const arcs = [...root.querySelectorAll<SVGPathElement>("path[data-from]")].flatMap((element) => {
    const from = placeOf(element.dataset.from);
    const to = placeOf(element.dataset.to);
    return from && to ? [{ element, from, to }] : [];
  });
  const scope = root.closest("section") ?? document.body;

  const home = viewOf(homeCentre);
  const view: View = { ...home };
  const velocity = { phi: 0, theta: 0 };
  let target: View | null = null;
  let drag: Drag | null = null;
  let frame = 0;
  let last = 0;
  let size = Math.max(1, Math.round(root.clientWidth));
  let waiting = false;
  let destroyed = false;
  let introStart = 0;
  let introTimer = 0;
  let introObserver: IntersectionObserver | null = null;

  canvas.className = "block size-full";
  host.append(canvas);
  const mapReady = mapUploaded(gl);
  const globe = createGlobe(canvas, {
    ...planet,
    ...palette(root),
    width: size,
    height: size,
    devicePixelRatio: Math.min(maxPixelRatio, window.devicePixelRatio || 1),
    phi: view.phi,
    theta: view.theta,
    markerColor: [0, 0, 0],
    markers: [],
    arcs: [],
  });
  // cobe wraps the canvas in a <div> of its own; without one it couldn't build its shaders and drew nothing.
  if (canvas.parentElement === host) {
    canvas.remove();
    return { destroy: () => undefined };
  }

  function draw() {
    globe.update({ phi: view.phi, theta: view.theta });
    for (const arc of arcs) arc.element.setAttribute("d", arcPath(arc.from, arc.to, view));
    for (const pin of pins) {
      const point = pinAt(pin.place, view);
      // Labels fade out as their point nears the rim, before it slips behind the planet.
      const facing = point.hidden ? 0 : Math.min(1, Math.max(0, (point.facing - 0.05) / 0.25));
      pin.element.style.setProperty("--pin-x", `${(point.x * 100).toFixed(2)}%`);
      pin.element.style.setProperty("--pin-y", `${(point.y * 100).toFixed(2)}%`);
      pin.element.style.setProperty("--pin-facing", facing.toFixed(3));
    }
  }

  function request() {
    if (frame || destroyed) return;
    last = performance.now();
    frame = requestAnimationFrame(tick);
  }

  function tick(now: number) {
    frame = 0;
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;
    let moving = false;
    if (target && !drag) {
      for (const axis of ["phi", "theta"] as const) {
        const pull = stiffness * (target[axis] - view[axis]) - damping * velocity[axis];
        velocity[axis] += pull * dt;
        view[axis] += velocity[axis] * dt;
      }
      const offBy = Math.abs(target.phi - view.phi) + Math.abs(target.theta - view.theta);
      if (offBy < 1e-4 && Math.abs(velocity.phi) + Math.abs(velocity.theta) < 1e-3) {
        Object.assign(view, target);
        velocity.phi = velocity.theta = 0;
        target = null;
      } else {
        moving = true;
      }
    } else if (!drag && Math.abs(velocity.phi) + Math.abs(velocity.theta) > 0.01) {
      view.phi += velocity.phi * dt;
      view.theta = clampTilt(view.theta + velocity.theta * dt);
      if (view.theta === tilt.min || view.theta === tilt.max) velocity.theta = 0;
      const fade = Math.exp(-dt / glide);
      velocity.phi *= fade;
      velocity.theta *= fade;
      moving = true;
    }
    draw();
    if (moving) request();
    // The intro is over once the globe has come to rest and the arcs have finished drawing in.
    else if (root.dataset.intro === "playing" && !introTimer) {
      introTimer = window.setTimeout(
        () => delete root.dataset.intro,
        Math.max(0, introStart + drawIn - performance.now()),
      );
    }
  }

  /** Turns the globe to a region (globe-math.ts, focusOn). */
  function turnTo(id: string) {
    const place = placeOf(id);
    if (!place) return;
    const to = focusOn(place);
    target = { phi: nearestTurn(view.phi, to.phi), theta: clampTilt(to.theta) };
    // Before the intro has played, this becomes where the intro ends.
    if (!waiting) request();
  }

  function onRegion(event: Event) {
    const input = event.target;
    if (input instanceof HTMLInputElement && input.name === "region" && input.checked) turnTo(input.value);
  }

  function onPointerDown(event: PointerEvent) {
    if (!event.isPrimary || event.button !== 0 || waiting) return;
    const pin = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-pin]") : null;
    drag = {
      pointer: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      startX: event.clientX,
      startY: event.clientY,
      time: event.timeStamp,
      moved: false,
      pin: pin && Number(pin.style.getPropertyValue("--pin-facing")) > 0.5 ? (pin.dataset.pin ?? null) : null,
    };
    target = null;
    velocity.phi = velocity.theta = 0;
    root.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: PointerEvent) {
    if (drag?.pointer !== event.pointerId) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    drag.x = event.clientX;
    drag.y = event.clientY;
    if (!drag.moved) {
      if (Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) < 4) return;
      drag.moved = true;
      root.dataset.dragging = "";
    }
    // Half a turn across the globe's width: the planet's surface keeps up with the pointer.
    const perPixel = Math.PI / size;
    view.phi += dx * perPixel;
    view.theta = clampTilt(view.theta + dy * perPixel);
    const elapsed = Math.max(8, event.timeStamp - drag.time) / 1000;
    drag.time = event.timeStamp;
    velocity.phi = (velocity.phi + (dx * perPixel) / elapsed) / 2;
    velocity.theta = (velocity.theta + (dy * perPixel) / elapsed) / 2;
    request();
  }

  function onPointerUp(event: PointerEvent) {
    if (drag?.pointer !== event.pointerId) return;
    const { moved, pin, time } = drag;
    drag = null;
    delete root.dataset.dragging;
    // Held still before letting go, or never moved: no fling.
    if (!moved || event.timeStamp - time > 90) velocity.phi = velocity.theta = 0;
    if (!moved && pin && event.type === "pointerup") {
      // A press on a label chooses that region in the list, which turns the globe to it.
      scope.querySelector<HTMLInputElement>(`input[name="region"][value="${pin}"]`)?.click();
    }
    request();
  }

  function onResize() {
    const next = Math.max(1, Math.round(root.clientWidth));
    if (next === size) return;
    size = next;
    globe.update({ width: size, height: size });
    request();
  }

  function onTheme() {
    globe.update(palette(root));
    request();
  }

  const resizeObserver = new ResizeObserver(onResize);
  const themeObserver = new MutationObserver(onTheme);

  function destroy() {
    if (destroyed) return;
    destroyed = true;
    cancelAnimationFrame(frame);
    window.clearTimeout(introTimer);
    introObserver?.disconnect();
    resizeObserver.disconnect();
    themeObserver.disconnect();
    canvas.removeEventListener("webglcontextlost", destroy);
    root.removeEventListener("pointerdown", onPointerDown);
    root.removeEventListener("pointermove", onPointerMove);
    root.removeEventListener("pointerup", onPointerUp);
    root.removeEventListener("pointercancel", onPointerUp);
    scope.removeEventListener("change", onRegion);
    scope.removeEventListener("click", onRegion);
    globe.destroy();
    canvas.parentElement?.remove();
    for (const key of ["globe", "intro", "dragging"]) delete root.dataset[key];
    // Back to the poster's view.
    for (const arc of arcs) arc.element.setAttribute("d", arcPath(arc.from, arc.to, home));
    for (const pin of pins) pin.element.removeAttribute("style");
  }

  function start() {
    if (destroyed) return;
    resizeObserver.observe(root);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    canvas.addEventListener("webglcontextlost", destroy);
    root.addEventListener("pointerdown", onPointerDown);
    root.addEventListener("pointermove", onPointerMove);
    root.addEventListener("pointerup", onPointerUp);
    root.addEventListener("pointercancel", onPointerUp);
    scope.addEventListener("change", onRegion);
    scope.addEventListener("click", onRegion);
    const chosen = scope.querySelector<HTMLInputElement>('input[name="region"]:checked');

    if (intro && !inView(root)) {
      // Out of sight, so the swap from the poster isn't seen: wait, turned away, for the globe to come
      // into view, then turn in while the arcs draw.
      waiting = true;
      Object.assign(view, viewOf(introFrom));
      root.dataset.intro = "waiting";
      introObserver = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          introObserver?.disconnect();
          waiting = false;
          root.dataset.intro = "playing";
          introStart = performance.now();
          target ??= { phi: nearestTurn(view.phi, home.phi), theta: home.theta };
          request();
        },
        { threshold: 0.35 },
      );
      introObserver.observe(root);
    }
    if (chosen) turnTo(chosen.value);
    draw();
    root.dataset.globe = "live";
  }

  void Promise.race([mapReady, new Promise((resolve) => setTimeout(resolve, mapTimeout))]).then(start);
  return { destroy };
}

/**
 * cobe uploads its world map from an image that loads after the globe is made, and doesn't say when. Until
 * then the planet has no land, so the live globe waits for that upload before it takes over from the
 * poster. This watches the context's texture uploads for the image, then steps aside.
 */
function mapUploaded(gl: WebGL2RenderingContext): Promise<void> {
  return new Promise((resolve) => {
    const upload = gl.texImage2D.bind(gl) as unknown as (...args: unknown[]) => void;
    gl.texImage2D = (...args: unknown[]) => {
      upload(...args);
      if (args.some((arg) => arg instanceof HTMLImageElement)) {
        Reflect.deleteProperty(gl, "texImage2D");
        resolve();
      }
    };
  });
}

/** The planet's colours for cobe, from the CSS custom properties of the `globe-palette` utility (globe.css). */
function palette(root: HTMLElement) {
  const style = getComputedStyle(root);
  const dark = Number(style.getPropertyValue("--globe-dark")) >= 0.5;
  const ocean = toRgb(style.getPropertyValue("--globe-ocean"));
  const rim = toRgb(style.getPropertyValue("--globe-rim"));
  return {
    dark: dark ? 1 : 0,
    // cobe shades a dark planet's surface at a tenth of its base colour, and a light one's at up to 1.1×.
    baseColor: each(ocean, (channel) => (dark ? channel * 10 : channel / 1.1)),
    // On a pale page the rim light is softened towards white, or it reads as a hard blue line.
    glowColor: dark ? rim : each(rim, (channel) => channel + (1 - channel) * 0.4),
    mapBrightness: Number(style.getPropertyValue("--globe-land")) || 1,
  };
}

let probe: CanvasRenderingContext2D | null = null;

/** Any CSS colour as red, green and blue from 0 to 1, by painting it onto a one-pixel canvas. */
function toRgb(colour: string): Rgb {
  probe ??= document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  if (!probe) return [0, 0, 0];
  probe.clearRect(0, 0, 1, 1);
  probe.fillStyle = "transparent";
  probe.fillStyle = colour.trim();
  probe.fillRect(0, 0, 1, 1);
  const [red = 0, green = 0, blue = 0] = probe.getImageData(0, 0, 1, 1).data;
  return [red / 255, green / 255, blue / 255];
}

const each = ([red, green, blue]: Rgb, change: (channel: number) => number): Rgb => [
  change(red),
  change(green),
  change(blue),
];

const clampTilt = (theta: number) => Math.min(tilt.max, Math.max(tilt.min, theta));

function inView(element: HTMLElement): boolean {
  const box = element.getBoundingClientRect();
  return box.bottom > 0 && box.top < window.innerHeight;
}
