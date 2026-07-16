import { useEffect, useState } from "react";
import { site } from "@/content/site";
import { PALETTE } from "../types";
import { STORY_LOGS } from "./story-logs";
import { dismissEnding, useExplore } from "./store";

/**
 * EndingOverlay — the story epilogue. Plays once when the seventh LOG
 * OPERATOR card is closed (replayable from LOG 07): letterbox bars, the
 * operator's closing letter, the visitor's own journey stats, and credits.
 * All transitions are state-driven (never keyframe opacity — story.ts
 * gotcha: slow devices stall keyframes at the from-frame).
 */

const mono = "var(--font-op-mono, monospace)";

export function EndingOverlay() {
  const visited = useExplore((s) => s.visited);
  const achievements = useExplore((s) => s.achievements);
  const collected = useExplore((s) => s.collectedLogs);
  const startedAt = useExplore((s) => s.startedAt);
  const [phase, setPhase] = useState<"in" | "letter">("in");

  useEffect(() => {
    const t = setTimeout(() => setPhase("letter"), 1400);
    return () => clearTimeout(t);
  }, []);

  const minutes = Math.max(1, Math.round((Date.now() - startedAt) / 60000));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" aria-live="polite">
      {/* Backdrop dims in via state-driven transition. */}
      <div
        className="absolute inset-0 bg-black"
        style={{ opacity: phase === "in" ? 0.4 : 0.86, transition: "opacity 1200ms ease" }}
      />
      {/* Letterbox bars. */}
      <div className="absolute left-0 right-0 top-0 h-[10vh] bg-black" />
      <div className="absolute bottom-0 left-0 right-0 h-[10vh] bg-black" />

      <div
        className="relative w-full max-w-lg overflow-y-auto rounded-xl border p-7"
        style={{
          maxHeight: "76vh",
          borderColor: "rgba(245,158,11,0.5)",
          background: "rgba(11,17,32,0.97)",
          fontFamily: mono,
          boxShadow: "0 0 80px rgba(245,158,11,0.25)",
          opacity: phase === "letter" ? 1 : 0,
          transform: phase === "letter" ? "translateY(0)" : "translateY(14px)",
          transition: "opacity 900ms ease, transform 900ms ease",
        }}
      >
        <div
          className="text-[10px] uppercase tracking-[0.4em]"
          style={{ color: PALETTE.secondary }}
        >
          Epilog
        </div>
        <div className="mt-2 text-2xl font-bold" style={{ color: PALETTE.accentBright }}>
          Ruang yang mengenalmu
        </div>

        <div className="mt-5 space-y-3 text-[13px] leading-relaxed" style={{ color: "#cbd5e1" }}>
          <p>
            Tujuh log. Kamu membaca semuanya — artinya kamu tahu mesin ini lebih baik dari siapa pun
            yang pernah mampir.
          </p>
          <p>
            Situs lain menceritakan pembuatnya lewat daftar keahlian. Yang ini memilih cara lebih
            jujur: membuka pintu servernya dan membiarkanmu berjalan di dalamnya — detak jantung,
            debu, backup, mimpi-mimpinya yang belum menyala.
          </p>
          <p>
            Kalau kamu membangun sesuatu dan butuh orang yang memperlakukan servermu seperti ruangan
            ini — pintunya selalu terbuka.
          </p>
          <p style={{ color: PALETTE.accentBright }}>— operator</p>
        </div>

        {/* Journey stats */}
        <div
          className="mt-6 grid grid-cols-2 gap-2 rounded-md border p-3 text-[11px]"
          style={{ borderColor: "rgba(124,141,176,0.3)", color: "#9fb0cc" }}
        >
          <div>
            zona dijelajahi <span style={{ color: PALETTE.accentBright }}>{visited.length}/8</span>
          </div>
          <div>
            log terkumpul{" "}
            <span style={{ color: PALETTE.accentBright }}>
              {collected.length}/{STORY_LOGS.length}
            </span>
          </div>
          <div>
            achievement <span style={{ color: PALETTE.accentBright }}>{achievements.length}</span>
          </div>
          <div>
            durasi sesi <span style={{ color: PALETTE.accentBright }}>±{minutes} menit</span>
          </div>
        </div>

        <div
          className="mt-6 text-center text-[9.5px] tracking-[0.3em]"
          style={{ color: "#7c8db0" }}
        >
          THE SERVER ROOM · ditulis, dibangun & di-host sendiri
          <br />
          oleh I Kadek Wira Wibawa · Bali, Indonesia
        </div>

        <div className="mt-6 flex gap-2">
          <button
            onClick={() => dismissEnding()}
            className="flex-1 rounded-md border px-3 py-2 text-[11px] font-bold uppercase tracking-[0.2em]"
            style={{
              borderColor: PALETTE.accentBright,
              background: "rgba(245,158,11,0.14)",
              color: PALETTE.accentBright,
            }}
          >
            Kembali ke ruangan
          </button>
          <a
            href={site.email.href}
            className="flex-1 rounded-md border px-3 py-2 text-center text-[11px] font-bold uppercase tracking-[0.2em]"
            style={{ borderColor: "rgba(56,189,248,0.5)", color: PALETTE.secondary }}
          >
            Hubungi operator
          </a>
        </div>
      </div>
    </div>
  );
}
