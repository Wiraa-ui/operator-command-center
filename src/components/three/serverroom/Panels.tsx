import { Html } from "@react-three/drei";
import { site } from "@/content/site";
import { PALETTE, SIDE_X, type Station } from "./types";

/**
 * Panels — the rack-face screens of The Server Room (CONTRACT.md §Panels.tsx).
 *
 * One drei `<Html transform occlude>` per station, mounted just proud of the
 * rack's aisle-facing front so the rack body can't occlude its own screen:
 * side racks (x=±2.4) face the corridor center (x=0), center racks face +z
 * (the direction the camera walks in from). Screen band sits at y≈1.4–2.45
 * (center 1.9) — eye level for the y=1.7 camera dolly.
 *
 * Sizing: transform mode maps px→world at distanceFactor/400. With
 * distanceFactor=2 that's 0.005 world-units/px, so a 340px card spans 1.7
 * units — legible from the ~1.75–2.4 unit pass-by distance without swallowing
 * the corridor.
 *
 * Content links use plain <a href> on purpose: Html portals render outside
 * the router provider, so router <Link> would throw. Internal hrefs still
 * work via full-page navigation.
 *
 * kind="status" renders null — StatusRack.tsx owns that screen.
 */

/** How far the screen sits in front of the rack's center line. */
const FACE_OFFSET = 0.65;

/* ------------------------------------------------------------------ */
/* Shared style fragments (inline — site tokens are currently green,   */
/* which the room palette forbids, so colors come from PALETTE)        */
/* ------------------------------------------------------------------ */

const TEXT = "#e2e8f0"; // ≥12:1 on the glass bg
const TEXT_DIM = "#9fb0cc"; // ≥5:1 on the glass bg
const AMBER_BORDER = "rgba(245, 158, 11, 0.35)";

/** Card base width, clamped so near-camera panels fit narrow phone
    viewports (Html transform scale ≈1 at reading distance — a 420px card
    overflows a 390px screen). No-op on desktop widths. */
function cardW(px: number): number {
  return typeof window === "undefined" ? px : Math.min(px, Math.round(window.innerWidth * 0.86));
}

const cardStyle: React.CSSProperties = {
  boxSizing: "border-box",
  background: "rgba(15, 23, 42, 0.85)",
  border: `1px solid ${AMBER_BORDER}`,
  borderRadius: 14,
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  boxShadow: "0 12px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(226, 232, 240, 0.06)",
  color: TEXT,
  fontFamily: "var(--font-op-sans, Inter, system-ui, sans-serif)",
  textAlign: "left",
  pointerEvents: "auto",
  userSelect: "none",
};

const kickerStyle: React.CSSProperties = {
  fontFamily: "var(--font-op-mono, monospace)",
  fontSize: 10,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: PALETTE.accentBright,
};

const linkStyle: React.CSSProperties = {
  display: "inline-block",
  marginTop: 14,
  fontFamily: "var(--font-op-mono, monospace)",
  fontSize: 13,
  fontWeight: 600,
  color: PALETTE.accentBright,
  textDecoration: "none",
  borderBottom: `1px solid ${AMBER_BORDER}`,
  paddingBottom: 2,
};

const pillStyle: React.CSSProperties = {
  fontFamily: "var(--font-op-mono, monospace)",
  fontSize: 10.5,
  padding: "3px 9px",
  borderRadius: 999,
  color: "#7dd3fc",
  background: "rgba(56, 189, 248, 0.12)",
  border: "1px solid rgba(56, 189, 248, 0.35)",
  whiteSpace: "nowrap",
};

/* ------------------------------------------------------------------ */
/* Per-kind screens                                                    */
/* ------------------------------------------------------------------ */

function EntranceScreen({ station, reduced }: { station: Station; reduced: boolean }) {
  return (
    <div style={{ ...cardStyle, width: cardW(420), padding: "26px 30px", textAlign: "center" }}>
      {!reduced && (
        // Scoped keyframes for the scroll hint — injected here (not styles.css)
        // because this module may not edit shared files.
        <style>{`@keyframes sr-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(5px); } }`}</style>
      )}
      <div style={kickerStyle}>// server room · online</div>
      <h1
        style={{
          margin: "10px 0 0",
          fontFamily: "var(--font-op-display, Inter, sans-serif)",
          fontSize: 40,
          lineHeight: 1.08,
          fontWeight: 700,
          color: "#f8fafc",
        }}
      >
        {station.title}
      </h1>
      {station.subtitle && (
        <p style={{ margin: "10px 0 0", fontSize: 14, lineHeight: 1.5, color: TEXT_DIM }}>
          {station.subtitle}
        </p>
      )}
      <div
        style={{
          marginTop: 18,
          fontFamily: "var(--font-op-mono, monospace)",
          fontSize: 12,
          letterSpacing: "0.08em",
          color: PALETTE.secondary,
          animation: reduced ? undefined : "sr-bob 1.8s ease-in-out infinite",
        }}
      >
        scroll to walk in ↓
      </div>
    </div>
  );
}

function ProjectScreen({ station }: { station: Station }) {
  const stack = station.project?.stack.slice(0, 4) ?? [];
  return (
    <div style={{ ...cardStyle, width: cardW(340), padding: "18px 22px" }}>
      <div style={kickerStyle}>// project</div>
      <h2
        style={{
          margin: "8px 0 0",
          fontFamily: "var(--font-op-display, Inter, sans-serif)",
          fontSize: 21,
          lineHeight: 1.2,
          fontWeight: 700,
          color: "#f8fafc",
        }}
      >
        {station.title}
      </h2>
      {station.project?.tagline && (
        <p style={{ margin: "8px 0 0", fontSize: 13, lineHeight: 1.5, color: TEXT_DIM }}>
          {station.project.tagline}
        </p>
      )}
      {stack.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
          {stack.map((tech) => (
            <span key={tech} style={pillStyle}>
              {tech}
            </span>
          ))}
        </div>
      )}
      {station.href && (
        <a href={station.href} style={linkStyle}>
          Open case study →
        </a>
      )}
    </div>
  );
}

function SkillsScreen({ station }: { station: Station }) {
  return (
    <div style={{ ...cardStyle, width: cardW(340), padding: "18px 22px" }}>
      <div style={kickerStyle}>// capabilities</div>
      <h2
        style={{
          margin: "8px 0 0",
          fontFamily: "var(--font-op-display, Inter, sans-serif)",
          fontSize: 21,
          lineHeight: 1.2,
          fontWeight: 700,
          color: "#f8fafc",
        }}
      >
        {station.title}
      </h2>
      {station.subtitle && (
        <p style={{ margin: "8px 0 0", fontSize: 13, lineHeight: 1.5, color: TEXT_DIM }}>
          {station.subtitle}
        </p>
      )}
      {station.href && (
        <a href={station.href} style={linkStyle}>
          Full breakdown →
        </a>
      )}
    </div>
  );
}

// Contact is the one station allowed to import site content (CONTRACT.md):
// the CTA needs real WhatsApp/email targets, not routing metadata.
function ContactScreen({ station }: { station: Station }) {
  const ctaBase: React.CSSProperties = {
    display: "block",
    boxSizing: "border-box",
    width: "100%",
    padding: "12px 16px",
    borderRadius: 10,
    fontFamily: "var(--font-op-mono, monospace)",
    fontSize: 14,
    fontWeight: 700,
    textAlign: "center",
    textDecoration: "none",
  };
  return (
    <div style={{ ...cardStyle, width: cardW(380), padding: "24px 28px", textAlign: "center" }}>
      <div style={kickerStyle}>// end of corridor</div>
      <h2
        style={{
          margin: "10px 0 0",
          fontFamily: "var(--font-op-display, Inter, sans-serif)",
          fontSize: 30,
          lineHeight: 1.15,
          fontWeight: 700,
          color: "#f8fafc",
        }}
      >
        {station.title}
      </h2>
      {station.subtitle && (
        <p style={{ margin: "8px 0 0", fontSize: 13, lineHeight: 1.5, color: TEXT_DIM }}>
          {station.subtitle}
        </p>
      )}
      <div style={{ display: "grid", gap: 10, marginTop: 18 }}>
        <a
          href={site.whatsapp.href}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            ...ctaBase,
            // Dark text on amber ≈ 9:1 — the loudest button in the room.
            background: PALETTE.accent,
            color: PALETTE.bg,
            border: `1px solid ${PALETTE.accentBright}`,
          }}
        >
          {site.whatsapp.label} · {site.whatsapp.display}
        </a>
        <a
          href={site.email.href}
          style={{
            ...ctaBase,
            background: "rgba(56, 189, 248, 0.1)",
            color: "#7dd3fc",
            border: "1px solid rgba(56, 189, 248, 0.4)",
          }}
        >
          {site.email.label} · {site.email.display}
        </a>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Placement                                                           */
/* ------------------------------------------------------------------ */

/**
 * Screen anchor + yaw per station. Side racks rotate to face the aisle
 * (default Html plane faces +z; yaw +π/2 → faces +x). Center racks face +z,
 * toward the approaching camera.
 */
function screenPlacement(station: Station): {
  position: [number, number, number];
  rotationY: number;
} {
  const y = 1.9; // screen center — band ~1.4–2.45 for card heights up to ~1.1u
  if (station.side === "left") {
    return { position: [SIDE_X.left + FACE_OFFSET, y, station.z], rotationY: Math.PI / 2 };
  }
  if (station.side === "right") {
    return { position: [SIDE_X.right - FACE_OFFSET, y, station.z], rotationY: -Math.PI / 2 };
  }
  return { position: [0, y, station.z + FACE_OFFSET], rotationY: 0 };
}

function StationPanel({ station, reduced }: { station: Station; reduced: boolean }) {
  // StatusRack.tsx owns the telemetry screen.
  if (station.kind === "status") return null;

  const { position, rotationY } = screenPlacement(station);
  return (
    <Html
      transform
      occlude
      position={position}
      rotation={[0, rotationY, 0]}
      distanceFactor={2}
      // Only the card itself catches the pointer; the rest of the plane
      // stays transparent to scroll/drag on the canvas.
      style={{ pointerEvents: "none" }}
    >
      {station.kind === "entrance" && <EntranceScreen station={station} reduced={reduced} />}
      {station.kind === "project" && <ProjectScreen station={station} />}
      {station.kind === "skills" && <SkillsScreen station={station} />}
      {station.kind === "contact" && <ContactScreen station={station} />}
    </Html>
  );
}

export function Panels({ stations, reduced }: { stations: Station[]; reduced: boolean }) {
  return (
    <>
      {stations.map((station) => (
        <StationPanel key={station.id} station={station} reduced={reduced} />
      ))}
    </>
  );
}
