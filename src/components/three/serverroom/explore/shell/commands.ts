import { getRoomStatus } from "@/lib/api/roomStatus";
import { contentOf, HOME, nodeAt, pathString, resolvePath, type FsNode } from "./vfs";

/**
 * CORE terminal engine — a data-driven shell, not an if/else ladder:
 * every command is an entry in REGISTRY (plus ALIASES / SUDO_TABLE /
 * FILE_HOOKS lookup tables) and the dispatcher is a single map lookup.
 *
 * Security model: the shell is a pure client-side simulation over vfs.ts.
 * No user input ever leaves the browser except the two pre-existing,
 * hardened endpoints (GET roomStatus/services; POST wall via ctx). There
 * is no eval, no dynamic import, no server-side execution of any kind.
 */

export interface Line {
  text: string;
  kind: "banner" | "dim" | "cmd" | "out" | "accent";
}

export const out = (text: string): Line => ({ text, kind: "out" });
export const dim = (text: string): Line => ({ text, kind: "dim" });
export const accent = (text: string): Line => ({ text, kind: "accent" });

export interface ShellCtx {
  cwd: string;
  history: string[];
  user: string;
  contact: { wa: string; email: string };
  openUrl(url: string): void;
  nightShift(): void;
  wallPost(msg: string): Promise<Line[]>;
  clear(): void;
  close(): void;
  quest(event: string): void;
  sfx(kind: "unlock" | "deny" | "toast" | "achievement"): void;
}

interface Cmd {
  desc: string;
  usage: string;
  hidden?: boolean;
  run(args: string[], ctx: ShellCtx): Promise<Line[]> | Line[];
}

/* ------------------------------ helpers -------------------------------- */

const fmtUp = (s: number) =>
  `${Math.floor(s / 86400)} hari, ${Math.floor((s % 86400) / 3600)}:${String(
    Math.floor((s % 3600) / 60),
  ).padStart(2, "0")}`;

function lsNode(node: FsNode): Line[] {
  if (node.kind === "file") return [out("(file)")];
  const names = Object.keys(node.children).sort();
  return names.length === 0
    ? [dim("(kosong)")]
    : names.map((n) => {
        const child = node.children[n];
        return child.kind === "dir" ? accent(`${n}/`) : out(n);
      });
}

/** Special behaviors when cat-ing certain paths — a lookup, not a branch. */
const openCv = (ctx: ShellCtx): Line[] => {
  ctx.openUrl("/cv.pdf");
  return [dim("  membuka /cv.pdf di tab baru…")];
};

const FILE_HOOKS: Record<string, (ctx: ShellCtx) => Line[]> = {
  "/home/operator/cv.pdf": openCv,
  "/home/operator/cv.txt": openCv, // muscle memory dari CLI versi lama
};

async function services(): Promise<{ id: string; up: boolean }[]> {
  const res = await fetch("/api/room/services");
  if (!res.ok) return [];
  const data = (await res.json()) as { services?: { id: string; up: boolean }[] };
  return Array.isArray(data.services) ? data.services : [];
}

/** `sudo <verb>` outcomes — the only sanctioned escalations. */
const SUDO_TABLE: Record<string, (ctx: ShellCtx) => Line[]> = {
  "hire-me": (ctx) => {
    ctx.quest("hire");
    return [
      accent("eskalasi diterima. kontak operator:"),
      out(`  whatsapp : ${ctx.contact.wa}`),
      out(`  email    : ${ctx.contact.email}`),
      dim("  (atau tekan tombol sertifikat — bawa buktinya)"),
    ];
  },
  "open --night-shift": (ctx) => {
    ctx.nightShift();
    return [
      dim("mounting /dev/arsip … 7 volume ditemukan"),
      accent("PERINGATAN: retensi arsip = kebijakan Ibu Direktur."),
      out("  lampu lorong dialihkan ke mode malam."),
      dim("  selamat bertugas, operator shift tiga."),
    ];
  },
};

/* ------------------------------ registry ------------------------------- */

export const REGISTRY: Record<string, Cmd> = {
  help: {
    desc: "daftar perintah",
    usage: "help",
    run: () => [
      out("perintah tersedia (shell tersimulasi — sandbox penuh):"),
      ...Object.entries(REGISTRY)
        .filter(([, c]) => !c.hidden)
        .map(([name, c]) => out(`  ${name.padEnd(11)} ${c.desc}`)),
      dim("  ↑/↓ riwayat · TAB lengkapi · `man <cmd>` detail"),
    ],
  },
  man: {
    desc: "manual singkat perintah",
    usage: "man <cmd>",
    run: (a) => {
      const c = REGISTRY[a[0] ?? ""];
      return c
        ? [accent(`${a[0]} — ${c.desc}`), out(`  pemakaian: ${c.usage}`)]
        : [out(`man: tidak ada entri untuk '${a[0] ?? ""}'`)];
    },
  },
  ls: {
    desc: "daftar isi direktori",
    usage: "ls [path]",
    run: (a, ctx) => {
      const parts = resolvePath(ctx.cwd, a.find((x) => !x.startsWith("-")) ?? ".");
      const node = parts && nodeAt(parts);
      return node
        ? lsNode(node)
        : [out(`ls: tidak bisa mengakses '${a[0] ?? ""}': berkas tidak ada`)];
    },
  },
  cd: {
    desc: "pindah direktori",
    usage: "cd <path>",
    run: (a, ctx) => {
      const target = a[0] ?? HOME;
      const parts = resolvePath(ctx.cwd, target === "~" ? HOME : target);
      const node = parts && nodeAt(parts);
      if (!node || node.kind !== "dir") return [out(`cd: ${target}: direktori tidak ada`)];
      ctx.cwd = pathString(parts);
      return [];
    },
  },
  pwd: { desc: "direktori saat ini", usage: "pwd", run: (_a, ctx) => [out(ctx.cwd)] },
  cat: {
    desc: "baca isi berkas",
    usage: "cat <file>",
    run: (a, ctx) => {
      const parts = resolvePath(ctx.cwd, a[0] ?? "");
      const key = parts ? pathString(parts) : "";
      const hook = FILE_HOOKS[key];
      if (hook) return hook(ctx);
      const node = parts && nodeAt(parts);
      return node && node.kind === "file"
        ? contentOf(node).split("\n").map(out)
        : [out(`cat: ${a[0] ?? ""}: berkas tidak ada`)];
    },
  },
  grep: {
    desc: "cari teks dalam berkas",
    usage: "grep <pola> <file>",
    run: (a, ctx) => {
      const [pat, f] = a;
      const parts = pat && f ? resolvePath(ctx.cwd, f) : null;
      const node = parts && nodeAt(parts);
      if (!node || node.kind !== "file") return [out("grep: pemakaian: grep <pola> <file>")];
      const hits = contentOf(node)
        .split("\n")
        .filter((l) => l.toLowerCase().includes(pat.toLowerCase()));
      return hits.length ? hits.map(accent) : [dim("(tidak ada yang cocok)")];
    },
  },
  echo: { desc: "cetak teks", usage: "echo <teks>", run: (a) => [out(a.join(" "))] },
  date: {
    desc: "waktu server (WITA)",
    usage: "date",
    run: () => [
      out(
        new Intl.DateTimeFormat("id-ID", {
          timeZone: "Asia/Makassar",
          dateStyle: "full",
          timeStyle: "medium",
        }).format(new Date()) + " WITA",
      ),
    ],
  },
  whoami: {
    desc: "identitas sesi",
    usage: "whoami",
    run: (_a, ctx) => [out(`${ctx.user} — pengunjung resmi ikadekwirawibawa.my.id`)],
  },
  hostname: { desc: "nama mesin", usage: "hostname", run: () => [out("server-room")] },
  uname: {
    desc: "info sistem",
    usage: "uname [-a]",
    run: () => [out("Linux server-room 6.x-generic #1 SMP x86_64 GNU/Linux")],
  },
  uptime: {
    desc: "telemetri LIVE mesin ini",
    usage: "uptime",
    run: async () => {
      const s = await getRoomStatus();
      return [
        out(
          `  up ${s.uptimeSec === null ? "—" : fmtUp(s.uptimeSec)},  load average: ${s.load1 ?? "—"}`,
        ),
        accent("  (ya, ini live — Anda sedang berdiri di dalamnya)"),
      ];
    },
  },
  free: {
    desc: "RAM LIVE mesin ini",
    usage: "free [-h]",
    run: async () => {
      const s = await getRoomStatus();
      const used = s.memUsedMb ?? 0;
      const total = s.memTotalMb ?? 0;
      return [
        dim("               total        used        free"),
        out(
          `Mem:      ${String(total).padStart(6)} MB ${String(used).padStart(6)} MB ${String(
            Math.max(0, total - used),
          ).padStart(6)} MB`,
        ),
      ];
    },
  },
  df: {
    desc: "pemakaian disk (snapshot)",
    usage: "df -h",
    run: () => [
      dim("Filesystem      Size  Used Avail Use% Mounted on"),
      out("/dev/mapper/os   57G   24G   31G  44% /"),
      out("/dev/sdb1       466G  6.2G  460G   2% /mnt/backup"),
      dim("(snapshot sanitasi — angka live ada di rak STATUS)"),
    ],
  },
  top: {
    desc: "proses teratas (twin live)",
    usage: "top",
    run: async () => {
      const svc = await services();
      const s = await getRoomStatus();
      return [
        out(`top - load ${s.load1 ?? "—"} · mem ${s.memUsedMb ?? "—"}/${s.memTotalMb ?? "—"} MB`),
        dim("  PID  STATE     COMMAND"),
        ...svc.map((x, i) =>
          (x.up ? out : dim)(
            `  ${String(101 + i * 37).padStart(4)}  ${x.up ? "running " : "dead    "} ${x.id}`,
          ),
        ),
        dim("  (status proses = digital twin, probe port sungguhan)"),
      ];
    },
  },
  systemctl: {
    desc: "status service nyata (twin)",
    usage: "systemctl status [service]",
    run: async (a) => {
      const svc = await services();
      const q = a.find((x) => x !== "status");
      const rows = q ? svc.filter((x) => x.id.includes(q)) : svc;
      return rows.length
        ? rows.map((x) =>
            x.up ? accent(`● ${x.id} — active (running)`) : dim(`○ ${x.id} — inactive (dead)`),
          )
        : [out(`Unit ${q ?? ""} tidak ditemukan (whitelist twin).`)];
    },
  },
  ping: {
    desc: "uji jangkauan (simulasi)",
    usage: "ping <host>",
    run: (a) => {
      const host = a[0] ?? "";
      const ok = ["ikadekwirawibawa.my.id", "localhost", "server-room"].includes(host);
      return ok
        ? [
            out(`PING ${host}: 56 data bytes`),
            ...[0, 1, 2].map((i) =>
              out(`64 bytes: icmp_seq=${i} ttl=64 time=${(9 + Math.random() * 6).toFixed(1)} ms`),
            ),
            dim("(simulasi — shell ini tidak menyentuh jaringan)"),
          ]
        : [out(`ping: ${host || "?"}: Name or service not known (sandbox)`)];
    },
  },
  neofetch: {
    desc: "kartu identitas mesin",
    usage: "neofetch",
    run: async () => {
      const s = await getRoomStatus();
      return [
        accent("        ▄▄▄▄▄        operator@server-room"),
        accent("      ▄█▀▀▀▀▀█▄      -------------------"),
        out("     ██  ● ●  ██     OS: Ubuntu 24.04 LTS x86_64"),
        out("     ██   ▂   ██     Host: mesin fisik di Bali, ID"),
        out(`      ▀█▄▄▄▄▄█▀      Uptime: ${s.uptimeSec === null ? "—" : fmtUp(s.uptimeSec)}`),
        out(`        ▀▀▀▀▀        Memory: ${s.memUsedMb ?? "—"}/${s.memTotalMb ?? "—"} MB`),
        dim("                     Situs ini dilayani dari mesin di atas."),
      ];
    },
  },
  wall: {
    desc: "tempel pesan di papan tamu NOC (perlu login)",
    usage: "wall <pesan>",
    run: (a, ctx) => (a.length ? ctx.wallPost(a.join(" ")) : [out("pemakaian: wall <pesan>")]),
  },
  history: {
    desc: "riwayat perintah sesi ini",
    usage: "history",
    run: (_a, ctx) => ctx.history.map((h, i) => out(`  ${String(i + 1).padStart(3)}  ${h}`)),
  },
  leaderboard: {
    desc: "papan rekor ROOT speedrun",
    usage: "leaderboard",
    run: async () => {
      const res = await fetch("/api/room/speedrun");
      const data = (await res.json()) as { runs?: { name: string; ms: number }[] };
      const runs = Array.isArray(data.runs) ? data.runs : [];
      return runs.length === 0
        ? [dim("papan rekor kosong — login, lalu capai ROOT secepatnya.")]
        : [
            accent("⏱ ROOT SPEEDRUN — waktu masuk EXPLORE → akses root:"),
            ...runs.map((r, i) =>
              out(
                `  #${String(i + 1).padStart(2)}  ${r.name.padEnd(16)} ${(r.ms / 1000).toFixed(1)}s`,
              ),
            ),
          ];
    },
  },
  sudo: {
    desc: "eskalasi (terbatas)",
    usage: "sudo <hire-me>",
    run: (a, ctx) => {
      const verb = a.join(" ");
      const action = SUDO_TABLE[verb];
      if (action) return action(ctx);
      ctx.sfx("deny");
      return [
        accent(`${ctx.user} is not in the sudoers file.`),
        out("This incident will be reported. (ke papan tamu NOC, mungkin)"),
      ];
    },
  },
  rm: {
    desc: "hapus (jangan)",
    usage: "rm",
    hidden: true,
    run: (_a, ctx) => {
      ctx.sfx("deny");
      return [
        accent("PERMISSION DENIED — nice try 🙂"),
        out("operator mesin ini rajin backup. harian. teruji restore."),
      ];
    },
  },
  clear: {
    desc: "bersihkan layar",
    usage: "clear",
    run: (_a, ctx) => {
      ctx.clear();
      return [];
    },
  },
  exit: {
    desc: "tutup terminal",
    usage: "exit",
    run: (_a, ctx) => {
      ctx.close();
      return [];
    },
  },
};

const ALIASES: Record<string, string> = {
  "hire-me": "sudo",
  ll: "ls",
  dir: "ls",
  cls: "clear",
  quit: "exit",
  logout: "exit",
};

/* ------------------------------ dispatcher ----------------------------- */

export async function runShell(raw: string, ctx: ShellCtx): Promise<Line[]> {
  const tokens = raw.trim().split(/\s+/);
  const name = (tokens[0] ?? "").toLowerCase();
  if (!name) return [];
  ctx.history.push(raw.trim());

  const canonical = ALIASES[name] ?? name;
  // Aliased escalations keep their argument shape (`hire-me` → `sudo hire-me`).
  const args = ALIASES[name] === "sudo" ? [name, ...tokens.slice(1)] : tokens.slice(1);
  const cmd = REGISTRY[canonical];
  if (!cmd) return [out(`sh: ${name}: command not found (coba \`help\`)`)];
  try {
    return await cmd.run(args, ctx);
  } catch {
    return [out(`${name}: gagal — coba lagi`)];
  }
}

/** TAB completion: command names for token 0, VFS paths after that. */
export function completions(raw: string, ctx: ShellCtx): string[] {
  const tokens = raw.split(/\s+/);
  const last = tokens[tokens.length - 1] ?? "";
  if (tokens.length <= 1) {
    return Object.keys(REGISTRY)
      .filter((n) => !REGISTRY[n].hidden && n.startsWith(last))
      .sort();
  }
  const slash = last.lastIndexOf("/");
  const dirPart = slash >= 0 ? last.slice(0, slash + 1) : "";
  const stem = slash >= 0 ? last.slice(slash + 1) : last;
  const parts = resolvePath(ctx.cwd, dirPart || ".");
  const node = parts && nodeAt(parts);
  if (!node || node.kind !== "dir") return [];
  return Object.entries(node.children)
    .filter(([n]) => n.startsWith(stem))
    .map(([n, c]) => dirPart + n + (c.kind === "dir" ? "/" : ""))
    .sort();
}
