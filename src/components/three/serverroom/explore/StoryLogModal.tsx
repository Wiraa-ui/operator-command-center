import { PALETTE } from "../types";
import { STORY_LOGS } from "./story-logs";
import { setModal, useExplore } from "./store";

/** StoryLogModal — one LOG OPERATOR chapter as a datapad card. */

const mono = "var(--font-op-mono, monospace)";

export function StoryLogModal({ logId }: { logId: string }) {
  const collected = useExplore((s) => s.collectedLogs);
  const log = STORY_LOGS.find((l) => l.id === logId);
  if (!log) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={log.chapter}
        className="w-full max-w-md rounded-xl border p-6"
        style={{
          borderColor: "rgba(56,189,248,0.45)",
          background: "rgba(11,17,32,0.97)",
          fontFamily: mono,
          boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
        }}
      >
        <div
          className="text-[10px] uppercase tracking-[0.3em]"
          style={{ color: PALETTE.secondary }}
        >
          {log.chapter} · {collected.length}/{STORY_LOGS.length} terkumpul
        </div>
        <div className="mt-2 text-[17px] font-bold" style={{ color: PALETTE.accentBright }}>
          {log.title}
        </div>
        <div className="mt-4 space-y-3 text-[13px] leading-relaxed" style={{ color: "#cbd5e1" }}>
          {log.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <button
          onClick={() => setModal(null)}
          className="mt-6 w-full rounded-md border px-3 py-2 text-[11px] font-bold uppercase tracking-[0.2em]"
          style={{
            borderColor: PALETTE.accentBright,
            background: "rgba(245,158,11,0.14)",
            color: PALETTE.accentBright,
          }}
        >
          Tutup log
        </button>
      </div>
    </div>
  );
}
