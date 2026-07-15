import { useState } from "react";
import { PALETTE } from "../types";
import { authRequest, connectPresence } from "./online";
import { setModal } from "./store";

/**
 * LoginModal — operator badge login for the SERVER ROOM. Same amber-on-glass
 * terminal look as PuzzleModal. On success it connects presence immediately,
 * so other online visitors appear without re-entering EXPLORE.
 */

const mono = "var(--font-op-mono, monospace)";

export function LoginModal() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [pass, setPass] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    const r = await authRequest(mode, name.trim().toLowerCase(), pass);
    setBusy(false);
    if (r.ok) {
      connectPresence();
      setModal(null);
    } else {
      setError(r.error);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Login operator"
        className="w-full max-w-md rounded-xl border p-6"
        style={{
          borderColor: "rgba(245,158,11,0.45)",
          background: "rgba(15,23,42,0.94)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 40px rgba(245,158,11,0.12)",
          fontFamily: mono,
        }}
      >
        <div
          className="text-[10px] uppercase tracking-[0.24em]"
          style={{ color: PALETTE.accentBright }}
        >
          // OPERATOR BADGE · {mode === "login" ? "MASUK" : "DAFTAR"}
        </div>
        <p className="mt-3 text-[13px] leading-relaxed" style={{ color: "#e2e8f0" }}>
          <span style={{ color: PALETTE.secondary }}>&gt;</span> Masuk untuk tampil online —
          operator lain yang sedang menjelajah ruangan ini akan melihatmu berjalan (dan sebaliknya).
        </p>

        <form onSubmit={submit} className="mt-5 space-y-3">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="nama (3–16, a–z 0–9 _)"
            aria-label="Nama"
            autoComplete="username"
            className="w-full rounded-md border bg-transparent px-3 py-2 text-[14px] outline-none"
            style={{ borderColor: "rgba(245,158,11,0.4)", color: PALETTE.accentBright }}
          />
          <input
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="password (min 6)"
            aria-label="Password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            className="w-full rounded-md border bg-transparent px-3 py-2 text-[14px] outline-none"
            style={{ borderColor: "rgba(245,158,11,0.4)", color: PALETTE.accentBright }}
          />
          {error && (
            <p className="text-[11px]" style={{ color: "#f87171" }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-md px-4 py-2 text-[12px] font-bold uppercase tracking-wider disabled:opacity-60"
            style={{ background: PALETTE.accent, color: PALETTE.bg }}
          >
            {busy ? "menghubungi server…" : mode === "login" ? "masuk" : "daftar"}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError(null);
            }}
            className="text-[11px] uppercase tracking-[0.18em] underline-offset-4 hover:underline"
            style={{ color: PALETTE.secondary }}
          >
            {mode === "login" ? "belum punya badge? daftar" : "sudah punya badge? masuk"}
          </button>
          <button
            onClick={() => setModal(null)}
            className="text-[11px] uppercase tracking-[0.18em] underline-offset-4 hover:underline"
            style={{ color: "#9fb0cc" }}
          >
            ← batal
          </button>
        </div>
      </div>
    </div>
  );
}
