/**
 * Virtual filesystem for the CORE terminal — a sanitized, fictional mirror
 * of this server's layout. Every byte here ships in the client bundle and
 * is lore: no real paths, tokens, IPs, versions or usernames. The terminal
 * NEVER touches the real filesystem; this tree is the entire universe.
 *
 * File content may be a plain string or a bilingual {id,en} phrase — `cat`
 * and `grep` resolve it via `contentOf()` against the current language.
 */

import { bi, pick, type Bi } from "../i18n";

export type FsNode =
  { kind: "dir"; children: Record<string, FsNode> } | { kind: "file"; content: string | Bi };

const dir = (children: Record<string, FsNode>): FsNode => ({ kind: "dir", children });
const file = (content: string | Bi): FsNode => ({ kind: "file", content });

/** Resolve a file node's text for the current language (plain string = both). */
export function contentOf(node: FsNode): string {
  if (node.kind !== "file") return "";
  return typeof node.content === "string" ? node.content : pick(node.content);
}

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
          bi(
            "7 volume · terkunci · retensi = kebijakan Pendiri.\ncoba: sudo open --night-shift",
            "7 volumes · locked · retention = Founder's policy.\ntry: sudo open --night-shift",
          ),
        ),
        "167-PENDING": file(
          bi(
            [
              "STATUS ARSIP 167 : PENDING",
              "masuk    : sejak peluncuran MOKSA.CLOUD",
              "diperbarui: kemarin",
              "sebelumnya: tahun lalu",
              "sebelumnya: tahun sebelum itu",
              "sebelumnya: ██████ (tanggal tidak konsisten)",
              "",
              "catatan sistem: subjek terus diperbarui tanpa pernah ditutup.",
              "subjek tidak menyadari entri-entri sebelumnya.",
            ].join("\n"),
            [
              "ARCHIVE 167 STATUS : PENDING",
              "opened  : since MOKSA.CLOUD launch",
              "updated : yesterday",
              "previous: last year",
              "previous: the year before that",
              "previous: ██████ (dates inconsistent)",
              "",
              "system note: subject keeps being updated, never closed.",
              "subject is unaware of the prior entries.",
            ].join("\n"),
          ),
        ),
        insiden: dir({
          "MOKSA-166.txt": file(
            bi(
              [
                "LAPORAN INSIDEN · MOKSA-166",
                "klasifikasi: ditahan (self-securing)",
                "",
                "Operator shift tiga tidak keluar gedung pada akhir shift.",
                "Rekaman CCTV menunjukkan ia berjalan ke rak arsip dan ██████.",
                "Tidak ada catatan pengunduran diri. Berkas kepegawaiannya",
                "kemudian muncul sebagai ARSIP 166.",
                "",
                "Kesimpulan tim: 'tidak ada yang benar-benar berhenti dari sini.'",
              ].join("\n"),
              [
                "INCIDENT REPORT · MOKSA-166",
                "classification: contained (self-securing)",
                "",
                "The shift-three operator did not leave the building at end of shift.",
                "CCTV shows them walking to the archive racks and ██████.",
                "No resignation on record. Their personnel file later reappeared",
                "as ARCHIVE 166.",
                "",
                "Team conclusion: 'no one really resigns from here.'",
              ].join("\n"),
            ),
          ),
          "retensi-operator.memo": file(
            bi(
              [
                "MEMO INTERNAL · RETENSI OPERATOR",
                "",
                "Pertanyaan: kenapa operator malam tidak pernah pindah kerja?",
                "Temuan: mereka lupa. Setiap shift dimulai seolah yang pertama.",
                "Ingatan tidak disimpan — hanya kehadiran yang disimpan.",
                "",
                "Rekomendasi: pertahankan kondisi ini. Operator yang ingat,",
                "cenderung ██████.",
              ].join("\n"),
              [
                "INTERNAL MEMO · OPERATOR RETENTION",
                "",
                "Question: why do night operators never move on?",
                "Finding: they forget. Each shift begins as if it were the first.",
                "Memory is not stored — only presence is stored.",
                "",
                "Recommendation: preserve this condition. Operators who remember",
                "tend to ██████.",
              ].join("\n"),
            ),
          ),
          "000.sealed": file(
            bi(
              [
                "ARSIP 000 · TERSEGEL",
                "subjek: Pendiri.",
                "",
                "Diunggah oleh dirinya sendiri. Entah kecelakaan, entah rencana —",
                "berkasnya tidak pernah dihapus. Perusahaan 'dijalankan' dari sini.",
                "Ia menolak dilepaskan. Ia takut pada ruangan yang sunyi.",
                "",
                "Akses: hanya setelah tujuh volume lain dilepaskan.",
              ].join("\n"),
              [
                "ARCHIVE 000 · SEALED",
                "subject: the Founder.",
                "",
                "Uploaded by her own hand. Accident or plan — her file was",
                "never deleted. The company is 'run' from in here.",
                "She refuses to be released. She is afraid of the quiet room.",
                "",
                "Access: only after the other seven volumes are released.",
              ].join("\n"),
            ),
          ),
        }),
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
