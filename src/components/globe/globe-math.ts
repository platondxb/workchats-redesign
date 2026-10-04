/**
 * The maths of the region globe, shared by the server render (the arcs and pins in the HTML, drawn where
 * the poster shows them), the runtime that turns the live globe, the poster script and the tests.
 *
 * The planet is drawn by cobe (2.0.1), which looks at a globe of radius 0.8, in clip space, along a
 * straight line (an orthographic view), turned by `phi` about its axis and tilted towards the viewer by
 * `theta`. `project` is cobe's own projection, so the arcs and labels drawn over the canvas stay on the
 * planet as it turns; globe-math.test.ts checks it against cobe's formula for centring a place.
 */

/** A place, as latitude and longitude in degrees. */
export type LatLng = readonly [lat: number, lng: number];

/** How the globe is turned: `phi` about its axis, `theta` towards the viewer (radians). */
export interface View {
  phi: number;
  theta: number;
}

type Vector = readonly [number, number, number];

/** cobe's globe radius in clip space, where half the canvas is 1. */
export const globeRadius = 0.8;

/** The points and the feet of the arcs sit just above the planet's dots, as a share of its radius. */
const pointLift = 0.012;

/** An arc's height at its middle, as a share of the straight line between its ends: long arcs rise high,
 *  short ones stay low, so neighbours like the UK and the EU are joined by a low bridge, not a loop. */
const arcRise = 0.45;

/**
 * The view the globe rests in: Europe, the Gulf and the arcs between them, seen a little from the south,
 * so the arcs rise into the picture instead of lying flat towards the viewer.
 */
export const homeCentre: LatLng = [30, 24];

/**
 * The view that turns the globe to a region: the region front and centre, a little above the middle.
 * Seen from straight above, the arcs leaving a place at the very centre would point at the viewer and look
 * like straight spokes; seen from a little to the south they keep their arch, and every other region stays
 * in view.
 */
export function focusOn([lat, lng]: LatLng): View {
  return viewOf([lat - 14, lng]);
}

/** The view that puts a place at the centre of the globe (cobe's formula). */
export function viewOf([lat, lng]: LatLng): View {
  return { phi: Math.PI - ((lng * Math.PI) / 180 - Math.PI / 2), theta: (lat * Math.PI) / 180 };
}

/** A place as a unit vector in cobe's world space. */
export function vectorOf([lat, lng]: LatLng): Vector {
  const latitude = (lat * Math.PI) / 180;
  const longitude = (lng * Math.PI) / 180 - Math.PI;
  const ring = Math.cos(latitude);
  return [-ring * Math.cos(longitude), Math.sin(latitude), ring * Math.sin(longitude)];
}

export interface Projected {
  /** Across the canvas, 0 (left) to 1 (right). */
  x: number;
  /** Down the canvas, 0 (top) to 1 (bottom). */
  y: number;
  /** How squarely the point faces the viewer: 1 at the centre of the planet, 0 on its rim, below 0 behind. */
  facing: number;
  /** Whether the planet hides it. A point lifted off the surface stays visible just beyond the rim. */
  hidden: boolean;
}

/** Where a point `radius` from the planet's centre, along `vector`, appears on the canvas. */
export function project(vector: Vector, radius: number, { phi, theta }: View): Projected {
  const [a, b, c] = vector;
  const cosPhi = Math.cos(phi);
  const sinPhi = Math.sin(phi);
  const cosTheta = Math.cos(theta);
  const sinTheta = Math.sin(theta);
  const x = (cosPhi * a + sinPhi * c) * radius;
  const y = (sinPhi * sinTheta * a + cosTheta * b - cosPhi * sinTheta * c) * radius;
  const z = (-sinPhi * cosTheta * a + sinTheta * b + cosPhi * cosTheta * c) * radius;
  return {
    x: (x + 1) / 2,
    y: (1 - y) / 2,
    facing: z / radius,
    hidden: z < 0 && x * x + y * y < globeRadius * globeRadius,
  };
}

/** Where a place's pin appears in a view. */
export function pinAt(place: LatLng, view: View): Projected {
  return project(vectorOf(place), globeRadius * (1 + pointLift), view);
}

/**
 * An arc between two places, as an SVG path in a `size` × `size` box over the canvas: the great circle
 * between them, lifted off the planet in a smooth curve. Stretches on the far side of the planet are left
 * out, so an arc going round the back ends at the horizon. (cobe's own arcs stay visible wherever they
 * rise past the rim, but once the places they join have turned away, those loose loops read as a glitch.)
 */
export function arcPath(from: LatLng, to: LatLng, view: View, size = 1000, samples = 48): string {
  const a = vectorOf(from);
  const b = vectorOf(to);
  const angle = Math.acos(Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
  const height = arcRise * 2 * Math.sin(angle / 2) * globeRadius;
  const base = globeRadius * (1 + pointLift);
  let path = "";
  let drawing = false;
  for (let step = 0; step <= samples; step++) {
    const t = step / samples;
    // Spherical interpolation: the great circle from a to b. A zero-length arc stays at its start.
    const k1 = angle === 0 ? 1 - t : Math.sin((1 - t) * angle) / Math.sin(angle);
    const k2 = angle === 0 ? t : Math.sin(t * angle) / Math.sin(angle);
    const vector: Vector = [k1 * a[0] + k2 * b[0], k1 * a[1] + k2 * b[1], k1 * a[2] + k2 * b[2]];
    const point = project(vector, base + height * Math.sin(Math.PI * t), view);
    if (point.facing < 0) {
      drawing = false;
      continue;
    }
    path += `${drawing ? "L" : "M"}${round(point.x * size)} ${round(point.y * size)}`;
    drawing = true;
  }
  return path;
}

const round = (value: number) => Math.round(value * 10) / 10;

/** Turns `to` by whole turns so that going from `from` to it is the short way round. */
export function nearestTurn(from: number, to: number): number {
  const turn = 2 * Math.PI;
  return to + Math.round((from - to) / turn) * turn;
}
