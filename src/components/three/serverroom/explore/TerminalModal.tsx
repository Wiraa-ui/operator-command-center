import { useEffect, useMemo, useRef, useState } from "react";
import { site } from "@/content/site";
import { PALETTE } from "../types";
import { roomAudio } from "./audio";
import { loadAuth } from "./online";
import { completions, runShell, type Line, type ShellCtx } from "./shell/commands";
import { HOME } from "./shell/vfs";
import { addToast, beginNightShift, emitQuestEvent, setModal, useExplore } from "./store";

/**
 * TerminalModal — the CORE's interactive shell UI. All command logic lives
 * in shell/commands.ts (registry dispatch over the vfs sandbox); this file
 * only owns the DOM: scrollback, prompt, ↑/↓ history and TAB completion.
 * Still a strict simulation — no user input reaches the real server except
 * the pre-existing hardened wall POST.
 */

const mono = "var(--font-op-mono, monospace)";

const BANNER: Line[] = [
  { text: "╭──────────────────────────────────────────╮", kind: "banner" },
  { text: "│   ✳  Welcome to SERVER ROOM CLI!         │", kind: "banner" },
  { text: "╰──────────────────────────────────────────╯", kind: "banner" },
  { text: "", kind: "out" },
  { text: "  shell tersimulasi penuh — sandbox, bukan mesin asli", kind: "dim" },
  { text: "  `help` daftar perintah · TAB lengkapi · ↑/↓ riwayat", kind: "dim" },
  { text: "", kind: "out" },
];

export function TerminalModal() {
  const privilege = useExplore((s) => s.privilege);
  const [lines, setLines] = useState<Line[]>(BANNER);
  const [cmd, setCmd] = useState("");
  const [cwd, setCwd] = useState(HOME);
  const scroller = useRef<HTMLDivElement>(null);
  const histIdx = useRef(-1);

  // One mutable shell context for the modal's lifetime (cwd/history live
  // here); created via useMemo so render never touches a ref.
  const shell = useMemo<ShellCtx>(
    () => ({
      cwd: HOME,
      history: [],
      user: privilege,
      contact: { wa: site.whatsapp.display, email: site.email.display },
      openUrl: (url) => window.open(url, "_blank", "noopener"),
      nightShift: () => {
        window.setTimeout(() => {
          setModal(null);
          beginNightShift();
        }, 1600);
      },
      wallPost: async (msg) => {
        const auth = loadAuth();
        if (!auth) {
          roomAudio.sfx("deny");
          return [
            { text: "wall: butuh identitas — siapa yang menempel?", kind: "accent" as const },
            { text: "  login dulu lewat tombol `LOGIN — TAMPIL ONLINE`.", kind: "out" as const },
          ];
        }
        try {
          const res = await fetch("/api/room/wall", {
            method: "POST",
            headers: {
              "content-type": "application/json",
              authorization: `Bearer ${auth.token}`,
            },
            body: JSON.stringify({ text: msg }),
          });
          const body = (await res.json()) as { ok?: boolean; error?: string };
          if (res.ok && body.ok) {
            addToast("pesanmu tertempel di papan tamu NOC");
            return [
              { text: `  tertempel. — @${auth.name}`, kind: "accent" as const },
              { text: "  (lihat papan tamu di ruang NOC)", kind: "dim" as const },
            ];
          }
          roomAudio.sfx("deny");
          return [{ text: `wall: ${body.error ?? "gagal — coba lagi"}`, kind: "out" as const }];
        } catch {
          return [{ text: "wall: papan tak terjangkau — coba lagi nanti", kind: "out" as const }];
        }
      },
      clear: () => setLines([]),
      close: () => setModal(null),
      quest: (e) => emitQuestEvent(e),
      sfx: (k) => roomAudio.sfx(k),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one context per modal lifetime
    [],
  );

  useEffect(() => {
    shell.user = privilege;
  }, [shell, privilege]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [lines]);

  const print = (add: Line[]) => setLines((l) => [...l, ...add]);

  const run = async (raw: string) => {
    print([{ text: `${cwd} ❯ ${raw}`, kind: "cmd" }]);
    if (!raw.trim()) return;
    roomAudio.sfx("toast");
    histIdx.current = -1;
    const result = await runShell(raw, shell);
    setCwd(shell.cwd);
    print(result);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const hist = shell.history;
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      if (hist.length === 0) return;
      const dir = e.key === "ArrowUp" ? 1 : -1;
      const next = Math.min(hist.length - 1, Math.max(-1, histIdx.current + dir));
      histIdx.current = next;
      setCmd(next === -1 ? "" : hist[hist.length - 1 - next]);
    } else if (e.key === "Tab") {
      e.preventDefault();
      const opts = completions(cmd, shell);
      if (opts.length === 1) {
        const tokens = cmd.split(/\s+/);
        tokens[tokens.length - 1] = opts[0];
        setCmd(tokens.join(" ") + (opts[0].endsWith("/") ? "" : " "));
      } else if (opts.length > 1) {
        print([{ text: "  " + opts.join("   "), kind: "dim" }]);
      }
    }
  };

  const colorOf = (k: Line["kind"]) =>
    k === "banner" || k === "accent"
      ? PALETTE.accentBright
      : k === "dim"
        ? "#7c8db0"
        : k === "cmd"
          ? "#f8fafc"
          : "#cbd5e1";

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Terminal CORE"
        className="flex h-[460px] w-full max-w-xl flex-col rounded-xl border"
        style={{
          borderColor: "rgba(245,158,11,0.4)",
          background: "#0b1120",
          boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
          fontFamily: mono,
        }}
      >
        {/* Window bar */}
        <div
          className="flex items-center justify-between border-b px-4 py-2"
          style={{ borderColor: "rgba(245,158,11,0.2)" }}
        >
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#f87171" }} />
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: PALETTE.accentBright }}
            />
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: PALETTE.secondary }} />
          </div>
          <span className="text-[10px] uppercase tracking-[0.22em]" style={{ color: "#7c8db0" }}>
            server-room cli — {privilege}
          </span>
          <button
            onClick={() => setModal(null)}
            className="text-[12px] hover:opacity-70"
            style={{ color: "#9fb0cc" }}
            aria-label="Tutup terminal"
          >
            ✕
          </button>
        </div>

        {/* Scrollback */}
        <div
          ref={scroller}
          className="flex-1 overflow-y-auto px-4 py-3 text-[12.5px] leading-relaxed"
        >
          {lines.map((l, i) => (
            <div key={i} style={{ color: colorOf(l.kind), whiteSpace: "pre-wrap" }}>
              {l.text || " "}
            </div>
          ))}
        </div>

        {/* Boxed prompt, agent-CLI style */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const v = cmd;
            setCmd("");
            void run(v);
          }}
          className="px-3 pb-3"
        >
          <div
            className="flex items-center gap-2 rounded-lg border px-3 py-2.5"
            style={{ borderColor: "rgba(245,158,11,0.45)", background: "rgba(15,23,42,0.6)" }}
          >
            <span
              className="max-w-[40%] truncate text-[10px]"
              style={{ color: "#7c8db0" }}
              title={cwd}
            >
              {cwd}
            </span>
            <span style={{ color: PALETTE.accentBright, fontWeight: 700 }}>❯</span>
            <input
              autoFocus
              value={cmd}
              onChange={(e) => setCmd(e.target.value)}
              onKeyDown={onKeyDown}
              aria-label="Perintah terminal"
              placeholder="ketik perintah… (help)"
              className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:opacity-40"
              style={{ color: "#e2e8f0", fontFamily: mono }}
              spellCheck={false}
              autoComplete="off"
            />
            <span className="text-[9px] uppercase tracking-[0.2em]" style={{ color: "#7c8db0" }}>
              sandbox
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
