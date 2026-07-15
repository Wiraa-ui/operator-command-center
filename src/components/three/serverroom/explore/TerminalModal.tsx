import { useEffect, useRef, useState } from "react";
import { projects } from "@/content/projects";
import { site } from "@/content/site";
import { getRoomStatus } from "@/lib/api/roomStatus";
import { PALETTE } from "../types";
import { roomAudio } from "./audio";
import { beginNightShift, setModal, useExplore } from "./store";

/**
 * TerminalModal — the CORE's interactive shell, styled after a modern
 * agent-CLI session (boxed welcome banner, `❯` prompt, dim meta lines).
 * Strictly a client-side whitelist; `uptime` is the only network call and it
 * only hits the existing getRoomStatus server fn (sanitized /proc fields).
 * Deliberately no version string, no real usernames, no real paths.
 */

const mono = "var(--font-op-mono, monospace)";

interface Line {
  text: string;
  kind: "banner" | "dim" | "cmd" | "out" | "accent";
}

const out = (text: string): Line => ({ text, kind: "out" });

const BANNER: Line[] = [
  { text: "╭──────────────────────────────────────────╮", kind: "banner" },
  { text: "│   ✳  Welcome to SERVER ROOM CLI!         │", kind: "banner" },
  { text: "╰──────────────────────────────────────────╯", kind: "banner" },
  { text: "", kind: "out" },
  { text: "  cwd: /home/operator/server-room  (akses terbatas — sandbox)", kind: "dim" },
  { text: "  tips: ketik `help` untuk daftar perintah", kind: "dim" },
  { text: "", kind: "out" },
];

const HELP: Line[] = [
  out("perintah tersedia (whitelist):"),
  out("  help            daftar ini"),
  out("  whoami          siapa Anda di mesin ini"),
  out("  uptime          telemetri LIVE server ini"),
  out("  ls projects/    daftar proyek"),
  out("  cat cv.txt      curriculum vitae"),
  out("  sudo hire-me    langkah paling logis"),
  out("  clear · exit"),
];

export function TerminalModal() {
  const privilege = useExplore((s) => s.privilege);
  const [lines, setLines] = useState<Line[]>(BANNER);
  const [cmd, setCmd] = useState("");
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [lines]);

  const print = (add: Line[]) => setLines((l) => [...l, ...add]);

  const run = async (raw: string) => {
    const c = raw.trim().toLowerCase().replace(/\s+/g, " ");
    print([{ text: `❯ ${raw}`, kind: "cmd" }]);
    if (!c) return;
    roomAudio.sfx("toast");

    if (c === "help") print(HELP);
    else if (c === "whoami") print([out(`${privilege} — pengunjung resmi ikadekwirawibawa.my.id`)]);
    else if (c === "uptime") {
      print([{ text: "  query /proc di mesin asli…", kind: "dim" }]);
      try {
        const s = await getRoomStatus();
        const d =
          s.uptimeSec === null
            ? "—"
            : `${Math.floor(s.uptimeSec / 86400)}d ${Math.floor((s.uptimeSec % 86400) / 3600)}h`;
        print([
          out(`  uptime : ${d}`),
          out(`  ram    : ${s.memUsedMb ?? "—"} / ${s.memTotalMb ?? "—"} MB`),
          out(`  load1m : ${s.load1 ?? "—"}`),
          { text: "  (ya, ini live — Anda sedang berdiri di dalamnya)", kind: "accent" },
        ]);
      } catch {
        print([out("  telemetry offline — coba lagi")]);
      }
    } else if (c === "ls projects/" || c === "ls projects" || c === "ls") {
      print([
        ...projects.map((p) => out(`  ${p.slug}/`)),
        // Breadcrumb to the hidden MOKSA.CLOUD door (command stays out of help).
        { text: "  arsip/   (7 volume · terkunci · coba: sudo open --night-shift)", kind: "dim" },
      ]);
    } else if (c === "cat cv.txt") {
      print([{ text: "  membuka /cv.pdf …", kind: "dim" }]);
      window.open("/cv.pdf", "_blank", "noopener");
    } else if (c === "sudo hire-me" || c === "hire-me") {
      print([
        { text: "eskalasi diterima. kontak operator:", kind: "accent" },
        out(`  whatsapp : ${site.whatsapp.display}`),
        out(`  email    : ${site.email.display}`),
        { text: "  (atau tekan tombol sertifikat — bawa buktinya)", kind: "dim" },
      ]);
    } else if (c === "sudo open --night-shift" || c === "open --night-shift") {
      // Hidden on purpose (not in help): the MOKSA.CLOUD door.
      print([
        { text: "mounting /dev/arsip … 7 volume ditemukan", kind: "dim" },
        { text: "PERINGATAN: retensi arsip = kebijakan Ibu Direktur.", kind: "accent" },
        out("  lampu lorong dialihkan ke mode malam."),
        { text: "  selamat bertugas, operator shift tiga.", kind: "dim" },
      ]);
      window.setTimeout(() => {
        setModal(null);
        beginNightShift();
      }, 1600);
    } else if (c === "rm -rf /" || c.startsWith("rm -rf")) {
      print([
        { text: "PERMISSION DENIED — nice try 🙂", kind: "accent" },
        out("operator mesin ini rajin backup. harian. teruji restore."),
      ]);
      roomAudio.sfx("deny");
    } else if (c === "clear") setLines([]);
    else if (c === "exit") setModal(null);
    else print([out(`sh: ${c.split(" ")[0]}: command not found (coba \`help\`)`)]);
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
              {l.text || " "}
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
            <span style={{ color: PALETTE.accentBright, fontWeight: 700 }}>❯</span>
            <input
              autoFocus
              value={cmd}
              onChange={(e) => setCmd(e.target.value)}
              aria-label="Perintah terminal"
              placeholder="ketik perintah…"
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
