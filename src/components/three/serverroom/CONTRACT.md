# The Server Room — build contract (v1)

Konsep: seluruh homepage = interior ruang server 3D. Scroll = berjalan menyusuri
lorong rak (sumbu **-Z**). Tiap stasiun = rak server; layar rak menampilkan
konten asli (drei `Html`). Kabel amber berdenyut mengalir antar rak. Satu rak
"STATUS" menampilkan telemetri LIVE server ini (disanitasi ketat — lihat §Security).

## Aturan keras untuk SEMUA modul

- Stack: React 19 + @react-three/fiber v9 + @react-three/drei v10 + three 0.185. **Tanpa dependensi baru.**
- Palet WAJIB (**TANPA hijau, TANPA ungu** — permintaan eksplisit user): bg `#0f172a`, aksen **amber `#f59e0b`** (lampu peringatan rak; varian terang `#fbbf24`), sekunder sky `#38bdf8`, metal `#16213c`, slate `#7c8db0`. Impor dari `types.ts` (`PALETTE`), jangan hardcode nilai lain.
- Perf: geometri berulang → `InstancedMesh`; total draw call modul ≤ ~30; tekstur = tidak ada (semua warna/emissive/shader murni); partikel dilarang di modul selain World (bujet global).
- Reduced motion: setiap animasi useFrame wajib no-op saat prop `reduced` true.
- Semua komponen menerima data lewat props dari `types.ts` — jangan impor konten (`@/content/*`) langsung kecuali disebut.
- Bahasa komentar: Inggris, gaya repo (jelaskan constraint, bukan narasi).
- Dilarang: mengedit file di luar daftar milikmu, `bun install`, build, commit, restart service.

## Geometri dunia

- Lorong: lebar 6, tinggi 4.2 (`CORRIDOR` di types.ts). Lantai y=0, plafon y=4.2. Kamera berjalan di x≈0, y≈1.7, dari z=4 menuju z = terdalam stasiun − 4.
- Stasiun: dari `stations.ts` (`getStations()`), spacing `RACK_SPACING=7` pada z negatif. `side` menentukan rak di x=-2.4 (left) / x=+2.4 (right) / tengah (center, untuk entrance & contact).
- Fog: FogExp2 bg, density ±0.06 — modul tidak memasang fog sendiri (dipasang integrator di Canvas).

## Pembagian modul (1 file per agent)

| File                                           | Isi                                                                                                                                                                                                                                                 | Ekspor                                                   |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `World.tsx`                                    | lorong: lantai grid emissive, plafon, rak instanced di kedua sisi (non-stasiun = dekorasi), LED strip berkedip (instanced plane + offset waktu), 1 rak detail per stasiun kind=project/skills                                                       | `<World stations reduced />`                             |
| `Cables.tsx`                                   | kabel TubeGeometry sepanjang plafon+lantai mengikuti lorong, cabang turun ke tiap stasiun; pulsa cahaya hijau mengalir (shader/uv scroll), kedip halus                                                                                              | `<Cables stations reduced />`                            |
| `CameraRig.tsx`                                | kamera dolly mengikuti scroll (pageProgress→z), sway x ke arah rak stasiun aktif, lookAt ke depan + sedikit ke stasiun aktif, lag-lerp dt-based; pointer parallax kecil; helper `useActiveStation(stations)` (berbasis progress) diekspor untuk HUD | `<RoomCameraRig stations reduced />`, `useActiveStation` |
| `Panels.tsx`                                   | layar rak: drei `Html transform occlude` per stasiun; kartu konten dark-glass (judul, tagline, stack pill, link route dari `station.href`); entrance = judul besar + hint scroll; contact = CTA WhatsApp/email                                      | `<Panels stations reduced />`                            |
| `StatusRack.tsx` + `src/lib/api/roomStatus.ts` | rak telemetri: server function TanStack Start (pola lihat `src/lib/api/assistant.functions.ts`) + layar Html menampilkan uptime/RAM/load live, polling 10 dtk                                                                                       | `<StatusRack station reduced />`                         |

## Security (WAJIB — StatusRack/roomStatus)

- Sumber data HANYA baca file: `/proc/uptime`, `/proc/meminfo`, `/proc/loadavg`. **Dilarang** `child_process`/exec/spawn dalam bentuk apa pun.
- Output whitelist PERSIS: `{ uptimeSec:number, memUsedMb:number, memTotalMb:number, load1:number }` — tidak ada hostname, IP, versi, path, env, nama service, error detail.
- Tidak membaca input request apa pun (tanpa param/body/header) → tidak ada permukaan injeksi.
- Cache in-memory 5 dtk (jangan hit /proc tiap request). Gagal baca → nilai `null` per field, jangan lempar detail error ke klien.
- Berjalan hanya di runtime bun/linux; guard `process.platform === "linux"`, selain itu return null semua (build target Cloudflare tak punya /proc).

## Integrasi (dikerjakan integrator, bukan agent)

Canvas, fog, lights, mode homepage vs subpage, fallback no-WebGL/reduced-motion
(DOM klasik tetap ada untuk SEO/a11y), HUD DOM, build & deploy.
