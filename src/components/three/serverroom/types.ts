/**
 * Shared contract for The Server Room modules (see CONTRACT.md).
 * Every module imports palette/layout/types from here — no local color values.
 */

export const RACK_SPACING = 7; // z-units between stations along the corridor
export const CORRIDOR = { width: 6, height: 4.2 } as const;

// User mandate: NO green, NO purple. Amber = rack warning-light accent.
export const PALETTE = {
  bg: "#0f172a",
  accent: "#f59e0b",
  accentBright: "#fbbf24",
  secondary: "#38bdf8",
  metal: "#16213c",
  slate: "#7c8db0",
} as const;

export type StationKind = "entrance" | "project" | "skills" | "status" | "contact";

export interface StationProject {
  slug: string;
  title: string;
  tagline: string;
  stack: string[];
}

export interface Station {
  id: string;
  kind: StationKind;
  /** World z of the rack (negative = deeper into the room). */
  z: number;
  /** Which side of the corridor the rack sits on; center = spans the aisle. */
  side: "left" | "right" | "center";
  title: string;
  subtitle?: string;
  /** Route the panel links to (undefined = non-navigable panel). */
  href?: string;
  project?: StationProject;
}

/** Rack x-offset per side (front face toward the aisle). */
export const SIDE_X = { left: -2.4, right: 2.4, center: 0 } as const;
