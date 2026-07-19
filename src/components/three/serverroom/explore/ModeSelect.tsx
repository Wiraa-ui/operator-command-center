import { useEffect } from "react";
import { PALETTE } from "../types";
import { tr } from "./i18n";
import { setLang, useExplore } from "./store";

/**
 * ModeSelect — the first-visit boot menu (user mandate 2026-07-19). It offers
 * the site as a portfolio first: dismiss (ESC / click outside) keeps the calm
 * scroll-walk, so a recruiter is never forced into the game. Two doors:
 *   - MAIN SANTAI  → stay in walk mode, explore freely, no horror.
 *   - MODE STORY   → jump straight into the ARSIP 167 night shift.
 * Plus a language picker (ID/EN). DOM-only, no three deps; transform-only
 * animation (opacity-from-0 has stalled elements before — see explore memory).
 */

const mono = "var(--font-op-mono, monospace)";

export function ModeSelect({ onSantai, onStory }: { onSantai: () => void; onStory: () => void }) {
  // Subscribe to lang so the copy re-renders when the picker flips it.
  const lang = useExplore((s) => s.settings.lang);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onSantai();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onSantai]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-5"
      style={{ background: "rgba(5,8,16,0.88)", fontFamily: mono }}
      onClick={onSantai}
      role="dialog"
      aria-modal="true"
      aria-label={tr("Pilih mode", "Choose a mode")}
    >
      <style>{`@keyframes ms-rise { from { transform: translateY(14px) scale(0.985); } to { transform: none; } }`}</style>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border p-7"
        style={{
          borderColor: "rgba(245,158,11,0.4)",
          background: "rgba(11,17,32,0.98)",
          boxShadow: "0 30px 90px rgba(0,0,0,0.65), 0 0 60px rgba(245,158,11,0.08)",
          animation: "ms-rise 360ms cubic-bezier(0.22,1,0.36,1) both",
        }}
      >
        {/* Language picker */}
        <div className="flex items-center justify-between">
          <div className="text-[9px] uppercase tracking-[0.3em]" style={{ color: "#7c8db0" }}>
            {tr("Bahasa", "Language")}
          </div>
          <div className="flex gap-1.5">
            {(["id", "en"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className="rounded-md border px-2.5 py-1 text-[10px] font-bold tracking-[0.14em]"
                style={{
                  borderColor: lang === l ? PALETTE.accentBright : "rgba(124,141,176,0.35)",
                  background: lang === l ? "rgba(245,158,11,0.16)" : "transparent",
                  color: lang === l ? PALETTE.accentBright : "#9fb0cc",
                }}
              >
                {l === "id" ? "ID" : "EN"}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <div
            className="text-[10px] uppercase tracking-[0.34em]"
            style={{ color: PALETTE.accentBright }}
          >
            MOKSA.CLOUD · SERVER ROOM
          </div>
          <div className="mt-1.5 text-[13px] leading-relaxed" style={{ color: "#cbd5e1" }}>
            {tr(
              "Kamu berdiri di dalam server yang menyajikan situs ini. Mau menjelajah santai, atau masuk ke cerita shift malamnya?",
              "You're standing inside the server that runs this site. Explore at your own pace, or step into its night-shift story?",
            )}
          </div>
        </div>

        {/* Two doors */}
        <div className="mt-6 space-y-3">
          <button
            onClick={onSantai}
            className="block w-full rounded-lg border p-4 text-left transition-transform hover:-translate-y-0.5"
            style={{ borderColor: "rgba(124,141,176,0.4)", background: "rgba(15,23,42,0.6)" }}
          >
            <div className="text-[13px] font-bold tracking-[0.12em]" style={{ color: "#e2e8f0" }}>
              ▷ {tr("MAIN SANTAI", "FREE EXPLORE")}
            </div>
            <div className="mt-1 text-[10.5px]" style={{ color: "#7c8db0" }}>
              {tr(
                "Jelajah bebas ruang server + proyek. Tanpa horor.",
                "Roam the server room + projects freely. No horror.",
              )}
            </div>
          </button>
          <button
            onClick={onStory}
            className="block w-full rounded-lg border p-4 text-left transition-transform hover:-translate-y-0.5"
            style={{
              borderColor: PALETTE.accentBright,
              background: "rgba(245,158,11,0.1)",
            }}
          >
            <div
              className="text-[13px] font-bold tracking-[0.12em]"
              style={{ color: PALETTE.accentBright }}
            >
              ◆ {tr("MODE STORY — SHIFT MALAM", "STORY MODE — NIGHT SHIFT")}
            </div>
            <div className="mt-1 text-[10.5px]" style={{ color: "#c8b78a" }}>
              {tr(
                "“ARSIP 167” — horor psikologis. Ada yang tahu kamu di sini.",
                "“ARCHIVE 167” — psychological horror. Something knows you're here.",
              )}
            </div>
          </button>
        </div>

        <div className="mt-5 text-center text-[9px] tracking-[0.16em]" style={{ color: "#5b6b8c" }}>
          {tr("ESC / klik luar = main santai", "ESC / click outside = free explore")}
        </div>
      </div>
    </div>
  );
}
