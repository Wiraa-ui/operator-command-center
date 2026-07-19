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
- **Tiga pendalaman naskah (wajib — ini yang membedakan B+ dan AAA):**
  1. **Jejak dokumen Kirana** — tersebar di VFS/datapad: bagaimana founder mati, kenapa dia
     meng-upload dirinya, dan satu dokumen yang membuat pemain BERSIMPATI sebelum twist
     ARSIP 000 terbuka. Aturan foreshadowing: tiap twist minimal 3 petunjuk yang baru
     "kebaca" saat ditengok ulang.
  2. **Taruhan personal operator** — beri operator identitas yang ditemukan pemain sendiri
     (nama di log absensi, surat tak terkirim untuk keluarga, alasan dia ambil shift malam).
     Twist "kamu ARSIP 167" harus MENYAKITKAN, bukan sekadar pintar.
  3. **Reversal babak II — nasib Bli Gede.** Voicemail-nya dari mana sebenarnya? Jawaban
     ditemukan di tengah cerita (arsip 4–5) dan mengubah cara pemain membaca semua
     instruksinya sejak awal. Jangan biarkan babak II cuma anomali + taunt.
- **Naskah lingkungan SCP-style di VFS** (`shell/vfs.ts`): 3–5 dokumen "LAPORAN INSIDEN
  MOKSA-███" dengan redaksi ██, memo internal HR soal "retensi operator", dan
  `arsip/167-PENDING`. Ikuti pola FILE_HOOKS/REGISTRY yang ada; konten whitelist, nol info
  server asli.
- **Wiring ending ganda**: state pilihan di store (pola `night*` fields yang ada), rak
  ARSIP 000 spawn pasca-7-purge (pakai pola `ArsipDef` + Entities yang ada), persist di
  `room-access-v1`, badge via sistem achievement yang ada.

### MUST (audio — mandat user "perbanyak sound", semua prosedural WebAudio nol aset)
Mesin sudah ada (`explore/audio.ts` ambience morphing + `nightshift/gamelan.ts`) — perluas,
jangan bangun ulang:
- **Mixing 4 layer state**: ambience / stalked / chase / hiding — crossfade mengikuti jarak
  & line-of-sight Kirana (rencana lama PROJECT_MASTER §cerita, belum dieksekusi penuh).
- **Audio cue kedekatan**: langkah heels Kirana spasial (PannerNode, makin dekat makin
  kering/keras) + genta samar sebagai early-warning — pemain harus bisa "mendengar posisi"
  tanpa lihat minimap, ala RE7/P.T.
- **Bisikan arwah spasial per rak arsip** (panner per posisi rak, volume ∝ jarak, hilang
  setelah purge — sunyi pasca-purge adalah reward emosional).
- **Stinger transisi babak & reveal** (bukan screamer murahan: build-up → satu aksen →
  silence; silence adalah senjata utama horor).
- **Detail dunia**: PA terdistorsi babak II–III, detak jam WITA terdengar saat jam hantu,
  breaker/pintu/statis VHS, drone ruangan berubah saat lampu mati.
- ⚠️ chrome-headless + WebAudio = hang acak — verifikasi audio pakai run pendek + `__ra.audio()`.

### MUST (alat bertahan — mandat user "bisa ngambil senjata", gaya RE7 disesuaikan lore)
Pemain bisa MEMUNGUT alat di dunia (glint + `[E] AMBIL` + popup `showItemGet` yang sudah ada)
dan memakainya lewat sistem inventory yang sudah ada (`items.ts` + `InventoryModal` + HP bar).
BUKAN pistol/darah — hantu bukan musuh dan Kirana tidak bisa dibunuh (konsisten lore);
senjata = mengusir/memperlambat/mengungkap, dengan sumber daya terbatas ala survival horror:
- **Genta Bli Gede** (ditemukan di loker BENGKEL): dibunyikan → Kirana terhempas mundur +
  stun beberapa detik; charge terbatas, isi ulang di pelinggih/titik tertentu. Senjata utama.
- **APAR ruang server**: semprotan membutakan Kirana sesaat (kabut menutupi layar dia) —
  "amunisi" habis, ada unit cadangan tersebar.
- **Sakelar breaker per zona**: sabotase — matikan listrik zona → Kirana melambat di sana,
  tapi zona gelap total (trade-off: ghost VHS aktif di gelap? kamu yang atur balance-nya).
- **Senter UV**: mengungkap lapisan niskala (tulisan/jejak/petunjuk anomali) + membekukan
  ghost VHS selama disorot — tapi cahaya menarik perhatian (mekanik `lampIsOn` sudah ada).
- Keybind pakai/switch cepat (angka atau Q), slot aktif tampil di HUD; drop rate & charge
  dibalance supaya tetap horor (sumber daya langka), bukan power fantasy.
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
- Default tetap: semua client-side + persist lokal; kebutuhan server ditampung ekstensi kecil
  di `room-server.ts` (proses bun yang sama). **User sudah memberi izin service baru bila
  benar-benar perlu (2026-07-19)** — pakai hanya sebagai jalan terakhir, dengan rel wajib:
  systemd unit + `MemoryMax` ≤ 250M, bind 127.0.0.1/loopback saja (publik hanya via
  cloudflared), cek `free -h` dulu (available < 800 MB = batal), dan catat cara cabutnya
  di PROJECT_MASTER. Seluruh scope di prompt ini seharusnya TIDAK butuh service baru —
  kalau kamu merasa butuh, tulis dulu alasannya di laporan sebelum membangun.
- Dependency npm baru: boleh kalau benar-benar perlu, tapi sadar ukuran bundle (lazy chunk)
  — default tetap prosedural/nol aset.
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

Prioritas kalau waktu terbatas: MUST naskah (termasuk 3 pendalaman) → MUST audio →
MUST alat bertahan → SHOULD anomali DATA HALL → sisanya backlog.
Naskah adalah bintang utamanya — tulis seperti penulis game AAA, bukan placeholder.
Uji ulang balance setelah alat bertahan masuk: Kirana harus tetap menakutkan
walau pemain pegang genta (stun pendek, charge langka, dia belajar/berpindah rute).
