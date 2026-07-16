import { Html } from "@react-three/drei";
import { useEffect, useState } from "react";
import { PALETTE } from "../types";

/**
 * Wallboard — the NOC guest board. Sticky notes are real messages visitors
 * left via `wall <pesan>` in the CORE terminal (GET /api/room/wall,
 * login-gated writes; see room-server.ts). Endpoint only exists on the
 * production host — anywhere else the board just shows its invite text.
 */

const POLL_MS = 30_000;

interface WallNote {
  author: string;
  text: string;
  at: number;
}

const mono = "var(--font-op-mono, monospace)";

/** Deterministic sticky-note tilt so the board looks hand-pinned. */
const tilt = (i: number) => ((i * 37) % 7) - 3;

export function Wallboard({ reduced }: { reduced: boolean }) {
  const [notes, setNotes] = useState<WallNote[]>([]);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch("/api/room/wall");
        if (!res.ok) return;
        const data = (await res.json()) as { notes?: WallNote[] };
        if (alive && Array.isArray(data.notes)) setNotes(data.notes);
      } catch {
        /* dev host / blip */
      }
    };
    load();
    if (reduced) {
      return () => {
        alive = false;
      };
    }
    const id = setInterval(load, POLL_MS);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [reduced]);

  return (
    <group position={[6.18, 0, -4.6]} rotation-y={Math.PI / 2}>
      {/* Board slab on the NOC west wall. */}
      <mesh position={[0, 1.85, -0.04]}>
        <boxGeometry args={[3.4, 2.1, 0.08]} />
        <meshStandardMaterial color={PALETTE.slate} metalness={0.2} roughness={0.85} />
      </mesh>
      <mesh position={[0, 1.85, 0]}>
        <planeGeometry args={[3.2, 1.9]} />
        <meshStandardMaterial color="#dbe3f0" roughness={0.9} />
      </mesh>

      <Html
        transform
        position={[0, 1.85, 0.03]}
        distanceFactor={2}
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        <div
          style={{
            width: 600,
            height: 356,
            boxSizing: "border-box",
            padding: "14px 16px",
            fontFamily: mono,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              fontSize: 12,
              letterSpacing: "0.2em",
              color: "#334155",
              fontWeight: 700,
            }}
          >
            // PAPAN TAMU — NOC
            <span style={{ float: "right", fontWeight: 400, color: "#64748b", fontSize: 10 }}>
              tulis: `wall &lt;pesan&gt;` di terminal CORE
            </span>
          </div>
          <div
            style={{
              marginTop: 10,
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 8,
            }}
          >
            {notes.length === 0 && (
              <div
                style={{
                  gridColumn: "1 / -1",
                  textAlign: "center",
                  color: "#64748b",
                  fontSize: 12,
                  padding: "40px 0",
                }}
              >
                papan masih kosong — jadilah pengunjung pertama yang menempel pesan.
              </div>
            )}
            {notes.map((n, i) => (
              <div
                key={`${n.at}-${i}`}
                style={{
                  transform: `rotate(${tilt(i)}deg)`,
                  background: i % 3 === 1 ? "#bae6fd" : "#fde68a",
                  color: "#1e293b",
                  borderRadius: 3,
                  padding: "7px 8px",
                  minHeight: 64,
                  boxShadow: "0 3px 6px rgba(15,23,42,0.35)",
                  fontSize: 10.5,
                  lineHeight: 1.35,
                  overflowWrap: "break-word",
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 9, color: "#475569" }}>@{n.author}</div>
                <div style={{ marginTop: 3 }}>{n.text}</div>
              </div>
            ))}
          </div>
        </div>
      </Html>

      {/* Warm pin light so the board reads from across the NOC. */}
      <pointLight position={[0, 2.3, 1.2]} intensity={2.5} color={PALETTE.accent} distance={5} />
    </group>
  );
}
