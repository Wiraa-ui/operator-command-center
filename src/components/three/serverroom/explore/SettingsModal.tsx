import { PALETTE } from "../types";
import { setModal, updateSettings, useExplore, type GameSettings } from "./store";

/**
 * SettingsModal — story-game style options: graphics preset (bloom/dust),
 * brightness (tone-mapping exposure) and master volume. Everything applies
 * live and persists; RoomCanvas & BrightnessApplier react through the store.
 */

const mono = "var(--font-op-mono, monospace)";

const PRESETS: { id: GameSettings["graphics"]; label: string; hint: string }[] = [
  { id: "auto", label: "AUTO", hint: "deteksi perangkat (default)" },
  { id: "ultra", label: "ULTRA", hint: "bloom + debu selalu nyala" },
  { id: "lite", label: "LITE", hint: "tanpa efek — paling ringan" },
];

export function SettingsModal() {
  const settings = useExplore((s) => s.settings);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Pengaturan"
        className="w-full max-w-sm rounded-xl border p-6"
        style={{
          borderColor: "rgba(245,158,11,0.4)",
          background: "rgba(11,17,32,0.97)",
          fontFamily: mono,
        }}
      >
        <div className="flex items-center justify-between">
          <div
            className="text-[11px] font-bold uppercase tracking-[0.3em]"
            style={{ color: PALETTE.accentBright }}
          >
            ⚙ Pengaturan
          </div>
          <button
            onClick={() => setModal(null)}
            className="text-[12px] hover:opacity-70"
            style={{ color: "#9fb0cc" }}
            aria-label="Tutup pengaturan"
          >
            ✕
          </button>
        </div>

        {/* Graphics preset */}
        <div className="mt-5">
          <div className="text-[10px] uppercase tracking-[0.24em]" style={{ color: "#7c8db0" }}>
            Grafis
          </div>
          <div className="mt-2 flex gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => updateSettings({ graphics: p.id })}
                className="flex-1 rounded-md border px-2 py-2 text-[11px] font-bold tracking-[0.14em]"
                style={{
                  borderColor:
                    settings.graphics === p.id ? PALETTE.accentBright : "rgba(124,141,176,0.35)",
                  background: settings.graphics === p.id ? "rgba(245,158,11,0.16)" : "transparent",
                  color: settings.graphics === p.id ? PALETTE.accentBright : "#9fb0cc",
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="mt-1.5 text-[9.5px]" style={{ color: "#7c8db0" }}>
            {PRESETS.find((p) => p.id === settings.graphics)?.hint}
          </div>
        </div>

        {/* Brightness */}
        <div className="mt-5">
          <div
            className="flex justify-between text-[10px] uppercase tracking-[0.24em]"
            style={{ color: "#7c8db0" }}
          >
            <span>Kecerahan</span>
            <span style={{ color: PALETTE.accentBright }}>
              {Math.round(settings.brightness * 100)}%
            </span>
          </div>
          <input
            type="range"
            min={0.6}
            max={1.6}
            step={0.05}
            value={settings.brightness}
            onChange={(e) => updateSettings({ brightness: Number(e.target.value) })}
            className="mt-2 w-full accent-amber-500"
            aria-label="Kecerahan"
          />
        </div>

        {/* Volume */}
        <div className="mt-5">
          <div
            className="flex justify-between text-[10px] uppercase tracking-[0.24em]"
            style={{ color: "#7c8db0" }}
          >
            <span>Volume</span>
            <span style={{ color: PALETTE.accentBright }}>
              {Math.round(settings.volume * 100)}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={settings.volume}
            onChange={(e) => updateSettings({ volume: Number(e.target.value) })}
            className="mt-2 w-full accent-amber-500"
            aria-label="Volume"
          />
        </div>

        <div className="mt-6 text-[9.5px]" style={{ color: "#7c8db0" }}>
          semua perubahan langsung aktif & tersimpan di peramban ini.
        </div>
      </div>
    </div>
  );
}
