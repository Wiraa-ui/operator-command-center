// ascii-room — `curl ikadekwirawibawa.my.id` gets the server room as ANSI art
// with the same live digital-twin status the 3D CORE racks show (twinStatus,
// room-server.ts). Served by serve.ts for CLI user agents; zero new services,
// zero assets, one string response. Colors follow the site palette: amber
// accent, sky secondary, red only for faults (no green, no purple — mandate).
import { readFile } from "node:fs/promises";
import { twinStatus } from "./room-server";

const A = "\x1b[38;5;214m"; // amber
const AB = "\x1b[38;5;220m"; // amber bright
const S = "\x1b[38;5;117m"; // sky
const R = "\x1b[38;5;203m"; // fault red
const D = "\x1b[38;5;103m"; // slate dim
const W = "\x1b[38;5;253m"; // near-white
const X = "\x1b[0m";

/** Rack faceplate labels per twin service id (two 9-char lines). */
const RACK_LABEL: Record<string, [string, string]> = {
  "siku-backend": ["SIKU", "API"],
  "siku-frontend": ["SIKU", "WEB"],
  postgres: ["POSTGRES", "16"],
  n8n: ["N8N", "AUTOMASI"],
  portfolio: ["PORTFOLIO", "(ini)"],
};

const INNER = 9; // rack faceplate inner width

function center(text: string, width: number): string {
  const pad = Math.max(0, width - text.length);
  const left = Math.floor(pad / 2);
  return " ".repeat(left) + text + " ".repeat(pad - left);
}

/** One rack as faceplate lines; color varies by live state. */
function rackLines(id: string, up: boolean, color: boolean): string[] {
  const [l1, l2] = RACK_LABEL[id] ?? [id.slice(0, INNER), ""];
  const c = (code: string, s: string) => (color ? code + s + X : s);
  const frame = (s: string) => c(up ? A : D, s);
  const led = up ? c(AB, center("● ● ●", INNER)) : c(R, center("x DOWN", INNER));
  const state = up ? c(AB, center("ONLINE", INNER)) : c(R, center("OFFLINE", INNER));
  return [
    frame(`┌${"─".repeat(INNER)}┐`),
    frame("│") + led + frame("│"),
    frame("│") + c(W, center(l1, INNER)) + frame("│"),
    frame("│") + c(up ? W : D, center(l2, INNER)) + frame("│"),
    frame("│") + state + frame("│"),
    frame(`└${"─".repeat(INNER)}┘`),
  ];
}

function fmtUptime(sec: number): string {
  return `${Math.floor(sec / 86_400)}d ${Math.floor((sec % 86_400) / 3_600)}h ${Math.floor((sec % 3_600) / 60)}m`;
}

/** Same read-only /proc whitelist as src/lib/api/roomStatus.ts, CLI-side. */
async function hostLine(): Promise<string> {
  try {
    const [up, mem, load] = await Promise.all(
      ["/proc/uptime", "/proc/meminfo", "/proc/loadavg"].map((p) => readFile(p, "utf8")),
    );
    const totalKb = Number.parseInt(/^MemTotal:\s+(\d+)/m.exec(mem)?.[1] ?? "", 10);
    const availKb = Number.parseInt(/^MemAvailable:\s+(\d+)/m.exec(mem)?.[1] ?? "", 10);
    const usedMb = Math.round((totalKb - availKb) / 1024);
    const totalMb = Math.round(totalKb / 1024);
    return `uptime ${fmtUptime(Math.floor(Number.parseFloat(up)))} · ram ${usedMb}/${totalMb} MB · load ${Number.parseFloat(load).toFixed(2)}`;
  } catch {
    return "telemetri host tidak tersedia";
  }
}

export async function asciiRoom(color: boolean): Promise<string> {
  const twin = await twinStatus();
  const host = await hostLine();
  const c = (code: string, s: string) => (color ? code + s + X : s);

  const racks = twin.services.map((s) => rackLines(s.id, s.up, color));
  const bank = racks[0].map((_, row) => "  " + racks.map((r) => r[row]).join(" "));

  const lines = [
    "",
    c(A, "  ╔══════════════════════════════════════════════════════════╗"),
    c(A, "  ║") + c(AB, "  I KADEK WIRA WIBAWA — software engineer                 ") + c(A, "║"),
    c(A, "  ║") + c(W, "  THE SERVER ROOM · telemetri LIVE dari mesin ini         ") + c(A, "║"),
    c(A, "  ╚══════════════════════════════════════════════════════════╝"),
    "",
    c(D, "  // RAK CORE — digital twin: rak = service nyata, saat ini:"),
    "",
    ...bank,
    "",
    "  " + c(S, host),
    ...(twin.alert ? ["  " + c(R, "!! ALARM: RAM host menipis — beacon merah menyala di CORE")] : []),
    "",
    c(D, "  ────────────────────────────────────────────────────────────"),
    c(W, "  Ini cuma bayangan ASCII. Ruangan aslinya 3D dan bisa dijelajahi:"),
    "  " + c(AB, "→ https://ikadekwirawibawa.my.id") + c(D, "  (browser · tombol EXPLORE = FPS)"),
    c(D, "  di dalam: lorong rak 3D, game ROOT ACCESS, night shift MOKSA.CLOUD"),
    "",
    c(D, "  curl dengan pipa? tambah ") + c(S, "?plain") + c(D, " untuk tanpa warna."),
    "",
  ];

  return lines.join("\n") + "\n";
}
