import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { hostingRegions } from "@/content/site";
import { arcPath, focusOn, homeCentre, nearestTurn, pinAt, viewOf, type LatLng } from "./globe-math";

/** The points an SVG path visits, from its M and L commands. */
function pathPoints(path: string): { x: number; y: number }[] {
  return [...path.matchAll(/[ML](-?[\d.]+) (-?[\d.]+)/g)].map((match) => ({
    x: Number(match[1]),
    y: Number(match[2]),
  }));
}

const place = (id: string): LatLng => {
  const region = hostingRegions.find((item) => item.id === id);
  if (!region) throw new Error(`No region ${id}`);
  return region.point;
};

describe("the globe's projection", () => {
  it("puts the place a view is centred on (cobe's formula) at the middle of the canvas, facing the viewer", () => {
    const places: LatLng[] = [
      [0, 0],
      [51.5, -0.1],
      [24, 54],
      [-33.9, 151.2],
      [64.1, -21.9],
    ];
    for (const centre of places) {
      const point = pinAt(centre, viewOf(centre));
      expect(point.x).toBeCloseTo(0.5, 6);
      expect(point.y).toBeCloseTo(0.5, 6);
      expect(point.facing).toBeCloseTo(1, 6);
      expect(point.hidden).toBe(false);
    }
  });

  it("puts north up and east to the right", () => {
    const view = viewOf([30, 24]);
    const north = pinAt([40, 24], view);
    const east = pinAt([30, 34], view);
    expect(north.y).toBeLessThan(0.5);
    expect(north.x).toBeCloseTo(0.5, 6);
    expect(east.x).toBeGreaterThan(0.5);
  });

  it("hides the far side of the planet", () => {
    const point = pinAt([-30, 24 - 180], viewOf([30, 24]));
    expect(point.hidden).toBe(true);
    expect(point.facing).toBeLessThan(0);
  });

  it("shows every region in the resting view, facing the viewer", () => {
    for (const region of hostingRegions) {
      const point = pinAt(region.point, viewOf(homeCentre));
      expect(point.hidden, region.id).toBe(false);
      expect(point.facing, region.id).toBeGreaterThan(0.6);
    }
  });
});

describe("the arcs", () => {
  const home = viewOf(homeCentre);

  it("run from one region's point to the other's", () => {
    const points = pathPoints(arcPath(place("eu"), place("ae"), home));
    const from = pinAt(place("eu"), home);
    const to = pinAt(place("ae"), home);
    expect(points.at(0)?.x).toBeCloseTo(from.x * 1000, 0);
    expect(points.at(0)?.y).toBeCloseTo(from.y * 1000, 0);
    expect(points.at(-1)?.x).toBeCloseTo(to.x * 1000, 0);
    expect(points.at(-1)?.y).toBeCloseTo(to.y * 1000, 0);
  });

  it("arch in every view the globe settles in, from a low bridge between neighbours to a long curve", () => {
    // How far each arc bows away from the straight line between its ends, as a share of that line: enough
    // to read as an arc, never so much that it loops.
    const bow = (from: LatLng, to: LatLng, view: ReturnType<typeof viewOf>) => {
      const points = pathPoints(arcPath(from, to, view));
      const start = points.at(0) ?? { x: 0, y: 0 };
      const end = points.at(-1) ?? { x: 0, y: 0 };
      const span = Math.hypot(end.x - start.x, end.y - start.y);
      const offLine = points.map(
        (point) =>
          Math.abs((end.x - start.x) * (start.y - point.y) - (start.x - point.x) * (end.y - start.y)) / span,
      );
      return Math.max(...offLine) / span;
    };
    const views = [home, ...hostingRegions.map((region) => focusOn(region.point))];
    for (const view of views) {
      for (const [from, to] of [
        ["gb", "eu"],
        ["eu", "ae"],
        ["ae", "gb"],
      ] as const) {
        const curve = bow(place(from), place(to), view);
        expect(curve, `${from}-${to}`).toBeGreaterThan(0.04);
        expect(curve, `${from}-${to}`).toBeLessThan(0.3);
      }
    }
  });

  it("end at the horizon instead of looping round the back", () => {
    // Turned so the UK is just past the horizon on the left: its arcs stop at the rim, with nothing drawn
    // beyond it where the places they join are hidden.
    const view = viewOf([54, -2 + 100]);
    for (const [from, to] of [
      ["gb", "eu"],
      ["ae", "gb"],
    ] as const) {
      for (const point of pathPoints(arcPath(place(from), place(to), view))) {
        const x = point.x / 500 - 1;
        const y = 1 - point.y / 500;
        expect(Math.hypot(x, y), `${from}-${to}`).toBeLessThan(0.86);
      }
    }
  });

  it("break off where the planet hides them", () => {
    // Seen from the far side of the globe, an arc across Europe is entirely hidden.
    expect(arcPath(place("gb"), place("ae"), viewOf([-30, -156]))).toBe("");
  });
});

describe("the pins' resting places in globe.css", () => {
  it("match the maths, so the poster's labels sit on its points", () => {
    const css = readFileSync(path.resolve(import.meta.dirname, "../../styles/globe.css"), "utf8");
    for (const region of hostingRegions) {
      const block = new RegExp(`@utility globe-pin-${region.id} \\{([^}]*)\\}`).exec(css)?.[1] ?? "";
      const x = Number(/--pin-home-x: ([\d.]+)%/.exec(block)?.[1]);
      const y = Number(/--pin-home-y: ([\d.]+)%/.exec(block)?.[1]);
      const point = pinAt(region.point, viewOf(homeCentre));
      expect(x, `${region.id}: --pin-home-x should be ${(point.x * 100).toFixed(2)}%`).toBeCloseTo(
        point.x * 100,
        1,
      );
      expect(y, `${region.id}: --pin-home-y should be ${(point.y * 100).toFixed(2)}%`).toBeCloseTo(
        point.y * 100,
        1,
      );
    }
  });
});

describe("turning to a region", () => {
  it("puts it front and centre, a little above the middle, with the other regions still in view", () => {
    for (const region of hostingRegions) {
      const view = focusOn(region.point);
      const point = pinAt(region.point, view);
      expect(point.x).toBeCloseTo(0.5, 6);
      expect(point.y).toBeLessThan(0.45);
      for (const other of hostingRegions) expect(pinAt(other.point, view).facing).toBeGreaterThan(0.4);
    }
  });

  it("goes the short way round", () => {
    const turn = 2 * Math.PI;
    expect(nearestTurn(0.1, turn - 0.1)).toBeCloseTo(-0.1, 9);
    expect(nearestTurn(3 * turn + 0.2, 0.3)).toBeCloseTo(3 * turn + 0.3, 9);
    expect(nearestTurn(-turn, Math.PI - 0.1)).toBeCloseTo(-Math.PI - 0.1, 9);
  });
});
