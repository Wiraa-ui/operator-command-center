/**
 * LOG OPERATOR — the day-shift story layer: seven datapads scattered
 * through the zones, telling this machine's real (in-universe) history.
 * Collect all seven for the SEJARAWAN badge. Keep LOG_COUNT in store.ts
 * equal to this list's length.
 */

export interface StoryLog {
  id: `log:${string}`;
  chapter: string;
  title: string;
  x: number;
  z: number;
  /** Card body — short paragraphs, personal voice, no secrets. */
  body: string[];
}

export const STORY_LOGS: StoryLog[] = [
  {
    id: "log:genesis",
    chapter: "LOG 01 · GENESIS",
    title: "Mesin bekas yang menolak mati",
    x: -1.4,
    z: 2.2,
    body: [
      "Semua ini dimulai dari satu mesin tua: dua core, RAM secukupnya, dan tekad.",
      "Orang bilang beli VPS saja. Tapi rasanya beda — mendengar kipasnya sendiri, tahu setiap prosesnya, itu rumah.",
      "Lorong yang kamu lewati ini adalah isi perutnya. Selamat datang.",
    ],
  },
  {
    id: "log:eksperimen",
    chapter: "LOG 02 · EKSPERIMEN",
    title: "Bot-bot yang lahir di LAB",
    x: 5.2,
    z: -9.2,
    body: [
      "Di ruangan ini lahir bot-bot kecil: pembuat poster, penganalisa pasar, pencatat cuti.",
      "Beberapa hidup, beberapa tidur menunggu waktunya. Rak arsip menyimpan yang belum siap kutunjukkan.",
      "Eksperimen gagal tidak dihapus di sini. Mereka diistirahatkan dengan hormat.",
    ],
  },
  {
    id: "log:mata",
    chapter: "LOG 03 · MATA",
    title: "Nol port terbuka",
    x: 12.6,
    z: -2.6,
    body: [
      "NOC ini punya satu aturan: tidak ada pintu yang menghadap internet secara langsung.",
      "Semua tamu masuk lewat terowongan terenkripsi. Firewall menutup semuanya kecuali jalur pulang.",
      "Kalau kamu bisa membaca ini, kamu sudah melewati jalur itu — sebagai tamu terhormat, tentu.",
    ],
  },
  {
    id: "log:tangan",
    chapter: "LOG 04 · TANGAN",
    title: "Bengkel jam dua pagi",
    x: -10.6,
    z: -18.3,
    body: [
      "Sebagian besar ruangan ini dibangun lewat tengah malam — layanan dipindah, unit systemd ditulis, dan kopi mendingin dua kali.",
      "Meja kerja ini pernah menyelamatkan produksi jam 3 pagi. Jangan tanya detailnya.",
      "Pesan untuk operator berikutnya: selalu cek RAM dulu. Selalu.",
    ],
  },
  {
    id: "log:jantung",
    chapter: "LOG 05 · JANTUNG",
    title: "Detak yang kamu dengar itu nyata",
    x: 15.2,
    z: -19.8,
    body: [
      "Bola berdenyut di tengah ruangan ini bukan hiasan. Itu proses yang sedang melayani halaman yang kamu buka.",
      "Kalau ia berhenti berdetak, halaman ini ikut gelap. Kita hidup di kalimat yang sama.",
      "Dengarkan — thump-nya menguat kalau kamu mendekat.",
    ],
  },
  {
    id: "log:ingatan",
    chapter: "LOG 06 · INGATAN",
    title: "Tiga salinan, dua media, satu di tempat lain",
    x: 20.2,
    z: -29.8,
    body: [
      "Ruangan paling dingin untuk barang paling berharga: ingatan.",
      "Setiap malam mesin ini menyalin dirinya sendiri. Retensi tiga puluh hari, uji-restore lulus.",
      "Tape emas di kotak kaca itu penghormatan untuk semua data yang pernah diselamatkan backup.",
    ],
  },
  {
    id: "log:mimpi",
    chapter: "LOG 07 · MIMPI",
    title: "Suatu hari, semua rak ini menyala",
    x: -24.1,
    z: -23.2,
    body: [
      "Aula ini lebih besar dari kebutuhanku hari ini. Sengaja.",
      "Sebagian rak menyala, sebagian gelap — persis seperti daftar mimpiku: sebagian jalan, sebagian menunggu giliran.",
      "Terima kasih sudah berjalan sejauh ini. Ruangan ini dibangun untuk dilihat — dan kamu melihatnya.",
      "— operator",
    ],
  },
];
