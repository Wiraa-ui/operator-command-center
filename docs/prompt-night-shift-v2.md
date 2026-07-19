# PROMPT UNTUK CLAUDE OPUS 4.8 — "SHIFT MALAM v2: ARSIP 167"

> Salin seluruh isi file ini sebagai prompt sesi baru. Target: rombak naskah + eskalasi horor
> game night shift MOKSA.CLOUD di portfolio live `https://ikadekwirawibawa.my.id`.

---

Kamu bekerja di server produksi rensho@ubuntu pada situs portfolio **LIVE**. Mandat user:
rombak total naskah cerita night shift "MOKSA.CLOUD" menjadi horor psikologis kelas AAA,
terinspirasi P.T., Resident Evil 7, Control, The Medium, Alan Wake 2, The Exit 8,
I'm on Observation Duty, dan SCP Foundation — tapi tetap berakar lore Bali yang sudah ada
(moksa, pelepasan digital, arwah, gamelan, jam hantu WITA). Kerjakan sampai tuntas (loop),
jangan berhenti di rencana.

**LARANGAN KONTEN KERAS (mandat user):** kata **"ngaben"** DILARANG muncul di mana pun —
naskah, UI, kode, komentar, dokumen, commit message. Istilah pengganti: "pelepasan digital" /
"upacara pelepasan". Sisa kemunculan lama sudah dibersihkan 2026-07-19; kalau masih menemukan
(`grep -rni ngaben src docs PROJECT_MASTER.md`), bersihkan. Perlakukan semua unsur religi
dengan hormat dan jaga tetap fiksi — jangan menggambarkan detail upacara nyata.

## 0. WAJIB BACA DULU, URUT (jangan skip satupun)

1. `~/.claude/projects/-home-rensho/memory/protokol-model-hati-hati.md` — protokol situs live.
2. `~/CLAUDE.md` §portfolio + §5 aturan perilaku.
3. `~/projects/portfolio/PROJECT_MASTER.md` (fokus bagian ROOT ACCESS + backlog).
4. Memory: `moksa-cloud-game.md`, `root-access-explore.md`, `design-mandate-portfolio.md`.
5. Modul game: `src/components/three/serverroom/explore/nightshift/` (semua file: `story.ts`,
   `state.ts`, `NightShift.tsx`, `Entities.tsx`, `voice.ts`, `gamelan.ts`), lalu
   `explore/store.ts`, `explore/layout.ts`, `explore/shell/vfs.ts`, `explore/story-logs.ts`.

Semua mekanik yang kusebut di bawah (ritual diam 3 dtk, headlamp+ghost VHS, HP −35/+25,
7 arsip lintas zona, taunt proximity 3 tier, rute pintu malam, epilog) SUDAH ADA — verifikasi
di kode, jangan bangun ulang dari nol.

## 1. PITCH CERITA BARU — "ARSIP 167" (arah sudah diputuskan user, eksekusi ini)

Fondasi lama dipertahankan: MOKSA.CLOUD menjual "pelestarian leluhur digital"; selama arsip
tersimpan, arwahnya tak bisa moksa; tugas operator = penghapusan (pelepasan digital); Bu Dewi
Kirana menghalangi. Naskah lama sudah menanam dua benih — pakai keduanya sebagai twist:

- ARSIP 166 = "OPERATOR SHIFT TIGA" → *"tidak ada yang benar-benar resign dari sini."*
- Ending lama Kirana: *"kalau semua sudah pulang… siapa yang menyimpan aku?"*

**Twist v2 (dua lapis):**
1. **Pemain adalah ARSIP 167.** Shift malam ini bukan yang pertama — sudah berulang ratusan
   kali (loop ala P.T.). Bukti diserakan pelan-pelan: log absensi dengan nama pemain tertanggal
   tahun lalu, sticky note tulisan tangan sendiri yang tak pernah ditulis, entri VFS
   `arsip/167-PENDING`, voicemail Gede yang di babak akhir ketahuan ditujukan ke "operator"
   generasi sebelumnya — kalimatnya sama persis, tahun beda.
2. **Kirana = ARSIP 000.** Founder sudah lama meninggal; perusahaan dijalankan oleh arsipnya
   sendiri yang menolak dilepaskan (SCP-style: entitas yang mengamankan dirinya sendiri).
   Dia bukan villain murni — dia takut pulang.

**Struktur 3 babak** (dipacu `purgedCount`, infrastruktur taunt tier sudah ada):
- **BABAK I — ORIENTASI (arsip 1–2):** nada korporat normal-tapi-ganjil (RE7 masuk rumah).
  PA sopan, Kirana ramah-HRD yang manis menakutkan. Keanehan kecil mulai: jam WITA berdetak
  mundur sesaat, poster motivasi berubah kata satu-dua.
- **BABAK II — GEDUNG BERNAPAS (arsip 3–5):** ala Control/Exit 8. Ruangan "berbohong":
  anomali muncul di DATA HALL & lorong, CCTV wallboard NOC menampilkan hal yang tidak
  sedang terjadi, PA mulai bicara hal yang bukan pengumuman. Taunt Kirana berubah personal —
  dia tahu isi loop-loop sebelumnya ("Dik, ini percakapan kita yang ke-berapa?").
- **BABAK III — PENGAKUAN (arsip 6–7):** reveal ARSIP 167 saat purge OPERATOR SHIFT TIGA
  (dia mengenali pemain: "kamu yang menggantikanku… seperti aku menggantikan yang sebelumnya").
  Lalu ending bercabang.

**Ending ganda** (menggantikan `storyMoksa` tunggal):
- **ENDING A — "PELEPASAN TERAKHIR":** pemain menemukan rak tersembunyi ARSIP 000 (muncul
  hanya setelah 7 arsip purged) dan menghapus Kirana. Dialog perpisahan Kirana = puncak
  emosional naskah (dia berterima kasih sambil takut). Server room gelap total, satu lilin
  digital, PA mati di tengah kalimat. Badge baru.
- **ENDING B — "PENJAGA":** pemain memilih TIDAK menghapus (interaksi pilihan di rak 000,
  atau walk away sampai fajar). Kirana tinggal, pemain "diangkat" jadi operator tetap —
  kursi shift malam kini atas nama pemain; loop tertutup, menyambung lore "tidak ada yang
  resign". Badge berbeda. Kedua ending replayable, persist mana yang sudah dilihat.

## 2. LINGKUP KERJA

### MUST (inti mandat — naskah + pintu masuk)
- **Layar pilihan mode saat awal buka web** (mandat user): kunjungan pertama (belum ada
  pilihan tersimpan) → setelah scene homepage siap, muncul overlay pilihan bergaya boot-menu
  server (amber, konsisten HUD):
  - **「MAIN SANTAI」** — perilaku sekarang: scroll-walk + EXPLORE bebas, tanpa horor.
  - **「MODE STORY」** — jalur cepat ke ARSIP 167: intro letterbox → langsung masuk ROOT
    ACCESS dengan akses secukupnya (prolog singkat yang sekalian mengajarkan kontrol boleh,
    tapi JANGAN paksa pemain story menyelesaikan semua teka-teki akses dulu) → night shift mulai.
  Pagar UX (wajib, situs ini portofolio dulu baru game): overlay dismissible (ESC/klik luar =
  santai), pilihan persist di localStorage dan tidak muncul lagi di kunjungan berikutnya,
  bisa dipanggil ulang dari menu/HUD (mis. entri di ⚙ Settings atau tombol HUD), nol dampak
  ke SSR/fallback DOM/ASCII `curl`/SEO, dan animasi transform-only. Ganti mode kapan pun
  tanpa reload penuh kalau memungkinkan; kalau tidak, reload mulus juga diterima.
- **Tulis ulang total `nightshift/story.ts`**: intro babak I, 7 dialog arwah baru yang lebih
  dalam (tiap arwah = cerita mikro utuh 2–3 kalimat, hindari generik; pertahankan identitas
  PENARI 1963 … OPERATOR SHIFT TIGA), taunt 3 tier ditulis ulang mengikuti babak di atas
  (psikologis-personal, bukan korporat datar; sebagian referensi loop), variasi `storyOnCaught`
  (minimal 3, jangan satu kalimat diulang), dua ending penuh. Bahasa Indonesia dengan diksi
  Bali yang sudah dipakai (suksma, om santih, dik). Semua tetap lewat mesin queue+speak yang ada.
- **Naskah lingkungan SCP-style di VFS** (`shell/vfs.ts`): 3–5 dokumen "LAPORAN INSIDEN
  MOKSA-███" dengan redaksi ██, memo internal HR soal "retensi operator", dan
  `arsip/167-PENDING`. Ikuti pola FILE_HOOKS/REGISTRY yang ada; konten whitelist, nol info
  server asli.
- **Wiring ending ganda**: state pilihan di store (pola `night*` fields yang ada), rak
  ARSIP 000 spawn pasca-7-purge (pakai pola `ArsipDef` + Entities yang ada), persist di
  `room-access-v1`, badge via sistem achievement yang ada.

### SHOULD (mekanik horor, implementasi murah)
- **Anomali "Exit 8" di DATA HALL saat night**: saat pemain masuk, 0–1 anomali dari pool
  kecil (rak ekstra yang tak ada di layout, poster berubah, lampu baris mati satu, siluet
  di ujung lorong). Interaksi `[E] LAPOR` pada anomali = benar → pintu keluar terbuka;
  lewat tanpa lapor → teleport halus balik ke pintu masuk (loop P.T.) + satu kalimat PA.
  Batasi 2–3 loop maksimal per shift (anti frustrasi, anti soft-lock).
- **CCTV wallboard NOC (Observation Duty)**: JANGAN render-target kamera nyata (mahal di
  device lemah) — palsukan dengan canvas texture: static/ASCII zona + siluet Kirana scripted
  yang sesekali "menatap kamera". Update ≤2 Hz.
- **Beat "jam hantu"**: kalau shift berlangsung dalam window 00–03 WITA (logika `WitaClock`
  ada), sisipkan 1–2 baris dialog eksklusif — hadiah kecil buat pemain tengah malam.

### COULD (kalau budget waktu/perf masih ada)
- **Mode niskala (The Medium)**: headlamp OFF (mekanik `lampIsOn` sudah ada + ghost tertarik
  cahaya) → lapisan emissive tersembunyi terlihat: tulisan di dinding, jejak arwah, petunjuk
  anomali. Cukup material/visibility toggle, bukan post-processing baru.
- **Perintah terminal `bukti` (Mind Place ala Alan Wake)**: menyusun potongan yang sudah
  ditemukan (dokumen VFS dibaca, arsip purged, anomali dilaporkan) jadi papan kronologi teks.

### JANGAN (out of scope)
- Jangan ubah mode siang, RPG quest, speedrun, Epilog LOG OPERATOR, presence/login, digital twin.
- Jangan tambah dependency npm, service systemd, endpoint server baru (kecuali ekstensi kecil
  data di `room-server.ts` benar-benar perlu — default: semua client-side + persist lokal).
- Jangan jumpscare audio kencang mendadak tanpa build-up (horor psikologis, bukan screamer)
  dan jangan langgar mandat palet: aksen AMBER `#f59e0b`, TANPA hijau & ungu (merah fault
  `#f87171` boleh, sudah dipakai).

## 3. PAGAR TEKNIS (dari gotcha terverifikasi — patuhi, jangan uji ulang pakai produksi)

- Situs LIVE: tiap edit → `lint` + `tsc` hijau; build wajib `bun --bun run build`; deploy =
  restart `portfolio.service`; smoke `curl -s -o /dev/null -w '%{http_code}'` = 200; rollback via git.
- Sebelum operasi berat: `free -h`; available < 800 MB → berhenti & lapor.
- UI baru: animasi CSS **transform-only** (opacity-from-0 pernah bikin subtitle tak pernah muncul).
- Konten terminal/VFS = 100% fiksi whitelist; dilarang versi/username/path/telemetri asli.
- Modal/DOM baru di explore: React.lazy + pertimbangkan `useNearby`; jangan seret chunk three
  ke bundle eager (pelanggaran kelihatan dari `triggerInteract`-pattern di memory).
- `LOG_COUNT` di store wajib = panjang STORY_LOGS kalau menyentuh datapad.
- E2E: pola `window.__ra`, preset LITE, screenshot wajib CDP `Page.captureScreenshot`,
  klik `{force:true}`, budget run ≥200 dtk; playthrough moksa headless sudah ada polanya di
  memory — uji minimal: overlay pilihan mode (pilih story → night shift jalan; dismiss →
  santai + tak muncul lagi setelah reload), intro → 7 purge → ending A, lalu ending B,
  lalu regresi mode siang/scroll-walk.

## 4. PENUTUP WAJIB

1. Commit Conventional Commits + push.
2. Sinkron dokumen (rujuk, jangan duplikat): `~/CLAUDE.md` blurb portfolio,
   `PROJECT_MASTER.md`, memory `moksa-cloud-game.md`, `graphify update ~/projects/portfolio`.
3. Laporan akhir: apa yang berubah per babak, hasil E2E kedua ending, dan sisa COULD yang
   tidak dikerjakan (masukkan ke backlog PROJECT_MASTER).

Prioritas kalau waktu terbatas: MUST → SHOULD anomali DATA HALL → sisanya backlog.
Naskah adalah bintang utamanya — tulis seperti penulis game AAA, bukan placeholder.
