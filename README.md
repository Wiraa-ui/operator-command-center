# Portfolio — Mulai dari sini

**Website portfolio pribadi** (positioning: IT Administrator / Automation Builder / Software Developer).
Nama repo internal: `operator-command-center`.

## Stack

React 19 · TypeScript · Vite · **TanStack Start** · Tailwind CSS 4 · Radix UI · dikelola dengan **Bun**.

## Peta folder `src/`

| Folder/File             | Isinya                                 |
| ----------------------- | -------------------------------------- |
| `routes/`               | Halaman & rute situs (TanStack Router) |
| `content/`              | Konten/materi tiap bagian              |
| `components/`           | Komponen UI                            |
| `hooks/`, `lib/`        | Helper & utilitas                      |
| `styles.css`            | Gaya global (Tailwind)                 |
| `server.ts`, `start.ts` | Entry server (TanStack Start)          |

> File `routeTree.gen.ts` dibuat otomatis — jangan diedit manual.

## Dokumen

- `PROJECT_MASTER.md` — dokumen utama proyek (overview, status, rencana).

## Jalankan (dev)

```bash
bun install
bun run dev
```

(Lihat `package.json` untuk daftar perintah lengkap.)
