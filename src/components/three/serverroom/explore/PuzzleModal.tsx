import { useState } from "react";
import { PALETTE } from "../types";
import { roomAudio } from "./audio";
import type { DoorDef } from "./layout";
import { setModal, unlockDoor } from "./store";

/**
 * PuzzleModal — the access terminal that guards a door. Pure DOM (renders
 * above the canvas), amber-on-glass terminal look. Answers are checked
 * case-insensitively against the door's allowlist; a wrong try shakes the
 * card and burns one hint reveal.
 */

const mono = "var(--font-op-mono, monospace)";

export function PuzzleModal({ door }: { door: DoorDef }) {
  const [value, setValue] = useState("");
  const [tries, setTries] = useState(0);
  const [shake, setShake] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = value.trim().toLowerCase();
    if (door.answers.some((a) => a.toLowerCase() === clean)) {
      roomAudio.sfx("unlock");
      unlockDoor(door.id); // also closes the modal via store
    } else {
      roomAudio.sfx("deny");
      setTries((t) => t + 1);
      setShake(true);
      setTimeout(() => setShake(false), 350);
      setValue("");
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
      <style>{`@keyframes ra-shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-7px)} 75%{transform:translateX(7px)} }`}</style>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={door.label}
        className="w-full max-w-md rounded-xl border p-6"
        style={{
          borderColor: "rgba(245,158,11,0.45)",
          background: "rgba(15,23,42,0.94)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 40px rgba(245,158,11,0.12)",
          fontFamily: mono,
          animation: shake ? "ra-shake 0.32s" : undefined,
        }}
      >
        <div
          className="text-[10px] uppercase tracking-[0.24em]"
          style={{ color: PALETTE.accentBright }}
        >
          {door.label}
        </div>
        <div className="mt-4 space-y-1 text-[13px] leading-relaxed" style={{ color: "#e2e8f0" }}>
          {door.prompt.map((line, i) => (
            <p key={i}>
              <span style={{ color: PALETTE.secondary }}>&gt;</span> {line}
            </p>
          ))}
        </div>

        {tries >= 1 && (
          <p className="mt-3 text-[12px]" style={{ color: PALETTE.secondary }}>
            {door.hint}
          </p>
        )}
        {tries >= 1 && (
          <p className="mt-1 text-[11px]" style={{ color: "#f87171" }}>
            ACCESS DENIED ×{tries}
          </p>
        )}

        <form onSubmit={submit} className="mt-5 flex gap-2">
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="jawaban…"
            aria-label="Jawaban teka-teki"
            className="min-w-0 flex-1 rounded-md border bg-transparent px-3 py-2 text-[14px] outline-none"
            style={{
              borderColor: "rgba(245,158,11,0.4)",
              color: PALETTE.accentBright,
              fontFamily: mono,
            }}
          />
          <button
            type="submit"
            className="rounded-md px-4 py-2 text-[12px] font-bold uppercase tracking-wider"
            style={{ background: PALETTE.accent, color: PALETTE.bg }}
          >
            auth
          </button>
        </form>

        <button
          onClick={() => setModal(null)}
          className="mt-4 text-[11px] uppercase tracking-[0.18em] underline-offset-4 hover:underline"
          style={{ color: "#9fb0cc" }}
        >
          ← mundur (ESC)
        </button>
      </div>
    </div>
  );
}
