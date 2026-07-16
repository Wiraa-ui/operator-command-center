/**
 * Virtual filesystem for the CORE terminal — a sanitized, fictional mirror
 * of this server's layout. Every byte here ships in the client bundle and
 * is lore: no real paths, tokens, IPs, versions or usernames. The terminal
 * NEVER touches the real filesystem; this tree is the entire universe.
 */

export type FsNode =
  { kind: "dir"; children: Record<string, FsNode> } | { kind: "file"; content: string };

const dir = (children: Record<string, FsNode>): FsNode => ({ kind: "dir", children });
const file = (content: string): FsNode => ({ kind: "file", content });

export const HOME = "/home/operator";

export const VFS: FsNode = dir({
  home: dir({
    operator: dir({
      "README.txt": file(
        [
          "Selamat datang di server-room, operator.",
          "Mesin ini nyata — situs yang sedang kamu buka dilayani dari sini.",
          "Coba: neofetch · free -h · systemctl status · ls projects",
        ].join("\n"),
      ),
      ".bashrc": file(
        [
          "# alias pribadi operator",
          "alias gas='git add -A && git commit'",
          "alias jangan='rm -rf'   # jangan.",
          "export TZ=Asia/Makassar",
        ].join("\n"),
      ),
      "cv.pdf": file("(binary — gunakan `cat cv.pdf` untuk membuka)"),
      "catatan-shift-malam.txt": file(
        [
          "Kalau lampu mulai redup lewat tengah malam,",
          "jangan panik. Itu bukan listrik.",
          "",
          "  sudo open --night-shift",
          "",
          "— operator shift dua",
        ].join("\n"),
      ),
      arsip: dir({
        README: file(
          "7 volume · terkunci · retensi = kebijakan Ibu Direktur.\ncoba: sudo open --night-shift",
        ),
      }),
      projects: dir({
        portfolio: dir({
          "README.md": file(
            [
              "# portfolio — The Server Room",
              "Situs 3D yang sedang kamu jelajahi. React Three Fiber,",
              "telemetri live, digital twin, dan game tersembunyi.",
              "Kamu berdiri DI DALAM repo ini sekarang.",
            ].join("\n"),
          ),
        }),
        siku: dir({
          "README.md": file(
            [
              "# siku — sistem informasi kursus",
              "Express + PostgreSQL + React. Status: dinonaktifkan",
              "sementara oleh operator (lihat rak twin di CORE).",
            ].join("\n"),
          ),
        }),
        "kumon-bot": dir({
          "README.md": file(
            [
              "# kumon-bot",
              "Bot Telegram pembuat carousel Instagram — n8n + Gemini,",
              "desain poster deterministik saat AI kehabisan kuota.",
            ].join("\n"),
          ),
        }),
      }),
    }),
  }),
  etc: dir({
    motd: file(
      [
        "  ╔════════════════════════════════════╗",
        "  ║  server-room · Ubuntu 24.04 LTS    ║",
        "  ║  2 vCPU · 3.7 GiB RAM · Bali, ID   ║",
        "  ╚════════════════════════════════════╝",
        "  Semua yang kamu lihat dilayani dari mesin ini.",
      ].join("\n"),
    ),
    hostname: file("server-room"),
  }),
  var: dir({
    log: dir({
      "room.log": file(
        [
          "[02:00] backup harian selesai · uji-restore LULUS",
          "[02:31] crypto-db dump selesai (ohlcv di-exclude)",
          "[03:12] anomali suhu lorong B — diabaikan (?)",
          "[03:13] anomali suhu lorong B — diabaikan (??)",
          "[04:44] pintu VAULT terbuka sendiri. dicatat saja.",
        ].join("\n"),
      ),
    }),
  }),
});

/** Resolve a path (absolute or relative to cwd) to ["home","operator",…]. */
export function resolvePath(cwd: string, input: string): string[] | null {
  const raw = input.startsWith("/") ? input : `${cwd}/${input}`;
  const parts: string[] = [];
  for (const seg of raw.split("/")) {
    if (seg === "" || seg === ".") continue;
    if (seg === "..") {
      if (parts.length === 0) return null;
      parts.pop();
    } else parts.push(seg);
  }
  return parts;
}

export function nodeAt(parts: string[]): FsNode | null {
  let node: FsNode = VFS;
  for (const p of parts) {
    if (node.kind !== "dir") return null;
    const next: FsNode | undefined = node.children[p];
    if (!next) return null;
    node = next;
  }
  return node;
}

export const pathString = (parts: string[]) => "/" + parts.join("/");
