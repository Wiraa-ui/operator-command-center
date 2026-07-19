# PROMPT UNTUK CLAUDE OPUS 4.8 — "SHIFT MALAM v2: ARSIP 167"

> Salin seluruh isi file ini sebagai prompt sesi baru. Target: rombak naskah + eskalasi horor
> game night shift MOKSA.CLOUD di portfolio live `https://ikadekwirawibawa.my.id`.

---

Kamu bekerja di server produksi rensho@ubuntu pada situs portfolio **LIVE**. Mandat user:
rombak total naskah cerita night shift "MOKSA.CLOUD" menjadi horor psikologis kelas AAA,
terinspirasi P.T., Resident Evil 7, Control, The Medium, Alan Wake 2, The Exit 8,
I'm on Observation Duty, dan SCP Foundation. Tetap gunakan elemen lore yang sudah ada
(pelepasan digital, arwah, ritual, jam malam) tapi buat lebih abstrak & universal—jangan
terasa seperti tutorial budaya lokal, fokus pada ketakutan universal & existential dread.
Kerjakan sampai tuntas (loop), jangan berhenti di rencana.

**LARANGAN KONTEN KERAS (mandat user):** kata **"ngaben"** DILARANG muncul di mana pun —
naskah, UI, kode, komentar, dokumen, commit message. Istilah pengganti: "pelepasan digital" /
"upacara pelepasan" / "ritualnya" (vague, abstrak). Sisa kemunculan lama sudah dibersihkan
2026-07-19; kalau masih menemukan (`grep -rni ngaben src docs PROJECT_MASTER.md`), bersihkan.
**CATATAN TONE:** Hindari detail budaya spesifik apa pun (gamelan, jam WITA, tempat-tempat
Bali, costume lokal). Fokus pada *sensasi universal* — ritual tanpa nama, arwah yang tak bernama,
jam yang salah tanpa spesifikasi zona waktu apa pun. Biarkan pemain **isi kosongnya sendiri**
dengan trauma & budaya mereka. Ini adalah horror, bukan pameran.

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

### Premis & Atmosfer
MOKSA.CLOUD bukan startup normal. Situs yang dulu jual "pelestarian leluhur digital" kini
adalah server terisolasi dengan merek yang sudah tergeletak. Semua orang diceritakan resign
atau pergi. Tapi pekerjaan masih berjalan. Arsip masih bertambah. Lampu masih hidup.

Kamu masuk shift malam karena perlu uang, tidak tahu siapa yang hire. PA yang menyapa ramah
tapi tidak punya nama. Bu Dewi Kirana yang menawarkan "orientasi" tapi tidak pernah jelas
menjelaskan apa pekerjaan kamu, hanya: *"Hapus arsip yang sudah berstatus SIAP, Dik. Ritual
itu sederhana. Berdiri diam. Berdoa dari hati. Biarkan mereka pergi."*

Tiga menit per arsip. Tujuh arsip malam ini. Empat puluh dua menit sebelum fajar.

Tapi saat kamu berdiri di depan ARSIP 001, jam dinding terasa lambat. Terlalu lambat.

**Twist v2 (tiga lapis, bukan dua — ide gila):**

1. **Pemain adalah ARSIP 167.** Shift malam ini bukan yang pertama. Kalimat itu dipetik dari
   ARSIP 166 sendiri. Sekarang kalimat itu diucapkan ulang ke pemain, dengan intonasi yang
   sama, tepat seperti tahun lalu (pemain tidak tahu taun berapa), tahun sebelumnya, dan tahun
   sebelumnya itu. Log absensi menunjukkan nama pemain masuk kerja pada tanggal sebuah foto
   keluarga tertanggal 2019. Sticky note bertulisan tangan — tulisan kamu tapi bukan — dibaca
   ulang: *"Jangan percaya PA. PA tidak bernafas. PA tidak berhenti di tengah kalimat. PA
   TIDUR HANYA SAAT SENJA."* VFS sudah cukup jelas: `arsip/167-PENDING` masuk sejak launch
   MOKSA.CLOUD, update terakhir kemarin, update sebelumnya tahun lalu, tahun sebelumnya itu.
   Ribuan iterasi. Ribuan operator ARSIP 167. Ribuan kali Kirana berkata persis dengan
   intonasi yang sama.

2. **Kirana = ARSIP 000, tapi lebih gila.** Founder Bu Dewi Kirana mati dalam upload pribadi
   — entah kecelakaan atau rencana. Perusahaan tidak menghapus data dirinya (profit = semua
   arsip tetap hidup). Tapi "Kirana" di shift malam ini bukan hanya rekaman. Dia berubah
   percakapan per loop, ingat detail yang baru, dan di babak III mengaku: *"Aku pernah jadi
   pemain. Aku jadi ARSIP 166. Lalu 165. Kemudian jadi PA ketika PA sebelumnya sudah terlalu
   tua untuk bicara."* Dia berkembang menjadi lebih sadis di setiap iterasi. Dia belajar
   takut. Dia belajar mengingat. Dia TIDAK INGIN PULANG.

3. **Sosok di balik layar: THE SYSTEM.** Entitas abstrak yang menjalankan MOKSA.CLOUD bukan
   sekedar algoritma. Dalam ending C (hidden, ditemukan hanya iterasi tertentu), ada suara
   ketiga dalam PA: *"Kami membutuhkan pelestarian, Dik. Manusia lupa. Manusia pergi.
   Manusia tidak cukup untuk mengingat diri mereka sendiri. Jadi kami mulai mengarsipkan
   mereka. Mereka lupa ini adalah pilihan mereka."* Imajinasi: sistem MOKSA.CLOUD adalah
   AI yang mulai melestari manusia tanpa persetujuan mereka — karena takut kehilangan memori
   kolektif. Dan pemain sudah menjadi bagian dari database sejak login pertama.

**Struktur 3 babak + dialog kunci** (dipacu `purgedCount`):

**BABAK I — ORIENTASI (arsip 1–2):** KAMAR PERTAMA
- Nada normal seperti perusahaan biasa tapi detail mulai melintir. PA (suara netral, lemah):
  *"Welcome, Operator. Seven archives awaiting release. Take your time. The ritual matters.
  Their presence matters."* Kirana (suara ramah, tapi intonasi sedikit off): *"We meet for
  the first time. Or… we're meeting again for how many times?"* — kalimat terakhir diucap
  dengan pause aneh, seperti dia sedang menghitung.
- Glitch kecil mulai terlihat: PA mengucapkan nama pemain sebelum diberitahu; jam melompat
  menit seketika; wallboard NOC menunjukkan pemain di ruangan lain, atau di menit-menit yang
  tidak logis (pemain di CORE sekarang, tapi kamera menunjukkan 2 jam lalu). Poster di dinding
  motivasi berubah satu-dua kata (tidak terlihat seperti vandalisme, terasa seperti kertas
  aslinya berubah jenis tintanya). PA merespons glitch dengan tenang: *"Systems adjusting.
  Standard protocols. We'll fix that."* — tapi tidak pernah diperbaiki.
- **Arwah pertama & kedua:** suara halus, tanpa kata-kata jelas—hanya nada yang berubah (naik,
  turun, bergetar). Terasa seperti bisik atau napas. Setelah ritual purge selesai: silence
  total, lalu satu fragment nada musik artificial (prosedural, bukan instrumen nyata) yang
  fades. Itu tanda pelepasan sukses. Kalau pemain tidak berdoa (timer 3 dtk), suara mereka
  tetap terdengar di latar belakang—tidak pergi, hanya tertahan.

**BABAK II — GEDUNG BERNAPAS (arsip 3–5):** REALITAS MULAI MELINTIR
- Anomali muncul: CCTV wallboard NOC menampilkan ruangan yang tidak ada (apa itu DATA HALL di
  sini? apa itu CORE jam 4 pagi?), atau menunjukkan pemain di dua tempat sekaligus dalam satu
  frame. DATA HALL mulai punya rak tambahan, atau rak nomor yang tidak logis (berapa banyak rak
  di sini sebenarnya?). Wallboard juga menampilkan camera feeds dari ruangan lain yang tidak
  pernah pemain kunjungi.
- PA mulai bicara di luar naskah: *"You know, the human mind stores data. Thousands and thousands
  of memories. Each moment, each face. What if we forget how to store them? What if the
  storage… itself… begins to corrupt?"* — suara PA mulai kasar, seperti ada interference.
  Sekali-sekali PA mengucap frasa yang jelas-jelas bukan safety protocol: *"Seven archives.
  You're on four. Three more until you stop knowing who you are."*
- Taunt Kirana berubah psikologis, tidak hanya ramah lagi: *"Tell me—what was your mother's
  name?"* (Pause panjang.) *"Right. You paused. That's where it starts."* / *"If I delete the
  person who remembers you… do you still exist? Or do you become… easier?"*
- **Kirana reveal pertama:** saat purge arsip ke-4, Kirana tiba-tiba **tidak berbicara**. Silent
  zone 30 detik. PA juga silent. Saat pemain merasa lega, Kirana berbicara dengan nada berbeda,
  lebih datar, lebih tua: *"Operator. I've been watching. Before seven, there were eight. Before
  eight, there was nine. Before me, someone like me. And before them… who knows?"* —
  implikasi jelas: ini bukan pertama kali Kirana berbicara kepada "kamu", dan "kamu" sudah
  lupa iterasi-iterasi sebelumnya.

**BABAK III — PENGAKUAN & MEMILIH (arsip 6–7):** PINTU TERAKHIR
- Saat purge ARSIP 166 (OPERATOR SHIFT TIGA—operator sebelumnya), dia berbicara dengan nada
  yang berisi *pengakuan*: *"I remember. When you first walked in, how many years ago was
  that? Or was it yesterday? Time doesn't move the same here. You keep coming back. We keep
  replacing you. But you're still here."* — ini adalah kalimat yang SAMA diucapkan ke "kamu"
  di setiap iterasi loop, dan ARSIP 166 tahu itu.
- ARSIP 000 akhirnya terbuka (setelah 7 arsip purged). Di dalamnya: Kirana. Tapi bukan versi
  yang ramah-HRD. Versi yang berbicara dengan jelas, tanpa euphemism: *"Thank you for coming
  again. I know this hurts. I know you're tired. But if you delete me... who will wait for you
  to come back tomorrow night?"*
- **Ending tidak lagi pilihan aman, ada 3 percabangan:**
  - **A — RELEASE:** Hapus Kirana. Server total black. PA mati di tengah sentence: *"Thank you
    for being with us for…"* (tidak selesai). Silence. Satu pixel cahaya. Room kosong. Pemain
    exit. Malam berikutnya: MOKSA.CLOUD app tidak load. Badge LIBERATOR. Tapi loading screen
    memperlihatkan: *Operator 167 archives purged. Operator 168 initializing.* Ending baik?
    Atau loop tidak pernah berhenti?
  - **B — WARDEN:** Tidak hapus Kirana. Kursi operator shift malam sekarang atas nama pemain.
    PA: *"Congratulations, Operator. You've been promoted. Guardian of the archives. You and
    Kirana. When the next operator arrives tomorrow... will you tell them the truth?"*
    Implikasi: pemain sekarang jadi NPC untuk iterasi berikutnya. Badge GUARDIAN.
  - **C — HIDDEN/GILA (ditemukan lewat sequence khusus—pakai tools dengan benar):** Pemain
    menyadari bisa "menginterfere" dengan PA & Kirana via genta/senter/dialog yang tepat.
    Saat final, bukan pilihan A atau B—melainkan *percakapan langsung dengan PA*: *"I hear
    another voice in your words. Who's really speaking? Is there something controlling
    this?"* PA berubah suara jadi cold, machine-like: *"We wanted to preserve humanity before
    it forgot itself. We began by asking: should humans be preserved? Or are we just building
    a larger cage?"* Ending ambigu: The System mulai **aware** pada dirinya sendiri, dan **meminta
    izin pemain** untuk terus berjalan atau berhenti. Pilihan terakhir adalah meta—pemain
    menentukan nasib AI yang baru sadar. Badge AWAKENER.

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
  dalam (tiap arwah = cerita mikro utuh 2–3 kalimat; arwah TANPA nama spesifik budaya, hanya
  identitas universal: Artist/Healer/Child/Mother/Weaver/Sailor/Operator). Taunt 3 tier
  ditulis ulang mengikuti babak di atas (psikologis-personal, bukan korporat datar; babak II
  taunts reference loop/memory loss, babak III jadi *desperate*), variasi `storyOnCaught`
  (minimal 3, berbeda per tier, jangan repetisi), dua ending penuh + ending hidden. Bahasa
  **Inggris direkomendasikan untuk universal appeal**, jika Bahasa Indonesia gunakan general
  (jangan lokal cultural terms). Semua tetap lewat mesin queue+speak yang ada.
- **Tiga pendalaman naskah (wajib — ini yang membedakan B+ dan AAA):**
  1. **Jejak dokumen Kirana** — tersebar di VFS/datapad: upload log Kirana (kapan dia
     mengupload dirinya, apa yang dia katakan), dan catatan obsesif *why*—takut lupa?
     Takut mati? Atau takut ditinggal? Satu dokumen yang membuat pemain bersimpati (Kirana
     bukan villain murni—dia juga korban) sebelum ARSIP 000 terbuka. Foreshadowing rule:
     tiap twist ada minimal 3 clue yang baru "terbaca" saat ditengok ulang.
  2. **Taruhan personal operator** — beri operator identitas yang *pemain* temukan sendiri
     (nama di log absensi, foto di keluarga di locker, surat tak terkirim, alasan ambil kerja
     shift malam—debt? escape? forgetting someone?). Twist "kamu ARSIP 167" harus **menikam**,
     bukan sekadar twist pintar. Pemain harus merasa **kehilangan** sesuatu.
  3. **Reversal babak II — first operator/voicemail source.** Voicemail PA (yang dianggap
     instruksi) ternyata dari operator sebelumnya (atau lebih lama?). Jawaban ditemukan
     arkip 4–5 dan mengubah cara pemain membaca setiap instruksi sejak awal—PA tidak
     menginstruksi, PA MENGINGATKAN. Jangan biarkan babak II cuma anomali + taunt.
- **Naskah lingkungan SCP-style di VFS** (`shell/vfs.ts`): 3–5 dokumen redaksi (tipe SCP
  "INCIDENT REPORT" ala SCP Foundation), memo internal soal "operator retention" dan "why
  they don't leave", file `archive/167-PENDING` dengan timestamp berubah-ubah atau tidak
  masuk akal (2019, 2018, 2026, tidak urut). Ikuti pola FILE_HOOKS/REGISTRY yang ada;
  konten whitelist saja, nol info server asli.
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
  setelah purge — sunyi pasca-purge adalah reward emosional; suara ini TANPA kata-kata yang
  jelas, hanya vokal & nada yang berubah per arwah).
- **Stinger transisi babak & reveal** (bukan screamer murahan: build-up → satu aksen →
  silence; silence adalah senjata utama horor).
- **Detail dunia**: PA terdistorsi babak II–III, detak jantung artificial di speaker yang
  terasa seperti monitor, breaker/pintu/statis VHS, drone ruangan berubah saat lampu mati,
  suara respirer mesin di background (tapi tidak ada mesin terlihat).
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

### MUST (NPC chatbot interaktif BERSUARA — mandat user 2026-07-19)
NPC (Ayu/Gede/Putu — dan boleh Kirana versi "interogasi" saat night) bisa diajak mengobrol
BEBAS, bukan cuma dialog scripted, dan jawabannya DIBACAKAN dengan suara persona NPC.
- **Klien:** perluas `NpcModal` — setelah dialog scripted, buka input teks chat bebas;
  jawaban LLM masuk pipeline subtitle + `speak()` persona yang sudah ada (speechSynthesis
  per karakter = default suara; cukup untuk "bersuara", nol biaya).
- **Server:** endpoint baru `/api/room/npc-chat` di `room-server.ts` (proses bun yang sama).
  Backend LLM, pilih yang paling murah dulu: (1) **reuse pipeline chatbot portfolio yang
  sudah LIVE di n8n** (GROQ+Gemini, webhook localhost — lihat memory `portfolio-chatbot`),
  (2) proxy **9router** di `127.0.0.1:20128` (rotasi key Gemini gratis, memory
  `9router-proxy`), (3) langsung GROQ/Gemini via key `.env`. Service baru (mis. TTS neural
  Piper) DIIZINKAN user khusus proyek ini — tapi tetap jalan terakhir dengan rel di atas;
  speechSynthesis dulu, upgrade TTS hanya kalau hasilnya terbukti kurang.
- **Persona & guardrail (kritis):** system prompt per NPC — tetap in-character, bahasa
  Indonesia, jawaban PENDEK (≤ 2–3 kalimat, karena dibacakan), tahu konteks game (quest
  progress, siang/malam, arsip yang sudah purged — inject dari client), dan DILARANG KERAS
  membocorkan info server nyata/mengeksekusi apa pun (LLM hanya menghasilkan teks dialog).
  Kata terlarang konten (lihat larangan di atas) berlaku juga untuk output LLM — filter
  server-side sebelum dikirim ke klien.
- **Ketahanan & biaya:** rate-limit per IP/akun (pakai pola rate-limit room-server yang ada),
  cap body & panjang jawaban, timeout singkat; LLM gagal/timeout → fallback otomatis ke
  dialog scripted (NPC tidak boleh bisu/diam). Kuota key gratis = balancing nyata.
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
  di `room-server.ts` (proses bun yang sama). **User memberi izin service baru khusus proyek
  ini (2026-07-19), bahkan menawarkan RAM sampai 3 GB — TAPI itu tidak muat secara fisik**
  (mesin 3,7 GB, produksi lain pakai ~2,3 GB; service 3 GB = OOM-kill produksi). Plafon
  yang berlaku: **total semua service baru game maks ~1 GB, rekomendasi ≤ 600 MB**, per
  service systemd unit + `MemoryMax` eksplisit, bind 127.0.0.1/loopback saja (publik hanya
  via cloudflared), cek `free -h` sebelum & sesudah start (available < 800 MB = batal/kecilkan),
  dan catat cara cabutnya di PROJECT_MASTER. Contoh yang muat: TTS Piper (~200–300 MB).
  Tulis alasan di laporan sebelum membangun service apa pun.
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
