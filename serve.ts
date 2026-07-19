// Host entry untuk self-hosting di server rensho@ubuntu (Node 18, bun runtime).
//
// Kenapa file ini ada:
//   Build TanStack Start memakai preset nitro Cloudflare (lihat vite.config.ts),
//   sehingga .output/server/index.mjs mengekspor handler Worker `{ fetch(req, env, ctx) }`,
//   BUKAN server Node yang listen ke port. `vite preview` juga gagal (butuh Node >=20).
//   Bun bisa menjalankan handler fetch itu langsung via Bun.serve + melayani aset statis
//   dari .output/public (yang di Cloudflare dilayani binding ASSETS).
//
//   Sejak 2026-07-16 proses yang sama juga meng-host login + online presence
//   untuk game SERVER ROOM (room-server.ts): /api/room/* + WebSocket /ws/room.
//
// Jalankan: bun run serve.ts   (port default 4174, override via env PORT/HOST)
import handler from "./.output/server/index.mjs";
import { join, normalize, extname } from "node:path";
import { existsSync, statSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { asciiRoom } from "./ascii-room";
import { roomApi, roomUpgrade, roomWebsocket, type WsData } from "./room-server";

const CLIENT = join(import.meta.dir, ".output", "public");
const port = Number(process.env.PORT ?? 4174);
const hostname = process.env.HOST ?? "127.0.0.1";

// Precompress aset teks sekali saat start (user feedback 2026-07-19: "web nya
// ga di optimize"): bundle JS ±1,5 MB tadinya terkirim mentah. .gz ditulis di
// sebelah file asli (hilang saat rebuild → dibuat ulang di start berikutnya),
// jadi nol RAM dan nol kerja per-request.
const GZ_EXT = new Set([".js", ".mjs", ".css", ".html", ".svg", ".json", ".txt", ".xml", ".map"]);
function precompress(dir: string) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) {
      precompress(p);
      continue;
    }
    if (!GZ_EXT.has(extname(entry.name)) || entry.name.endsWith(".gz")) continue;
    const st = statSync(p);
    if (st.size < 1024) continue; // gzip overhead not worth it
    const gz = p + ".gz";
    if (existsSync(gz) && statSync(gz).mtimeMs >= st.mtimeMs) continue;
    writeFileSync(gz, Bun.gzipSync(readFileSync(p), { level: 9 }));
  }
}
try {
  precompress(CLIENT);
} catch (e) {
  console.error("precompress skipped:", e);
}

Bun.serve<WsData>({
  port,
  hostname,
  async fetch(req, server) {
    const url = new URL(req.url);

    // Game room: presence websocket, lalu API login/register.
    if (url.pathname === "/ws/room") {
      if (roomUpgrade(req, url, server)) return undefined as unknown as Response;
      return new Response("unauthorized", { status: 401 });
    }
    const ip = server.requestIP(req)?.address ?? "?";
    const api = await roomApi(req, url, ip);
    if (api) return api;

    // CLI easter egg: curl/wget on the homepage get the room as ANSI art
    // (live twin status included). Browsers never match; /ascii works for all.
    const ua = req.headers.get("user-agent") ?? "";
    if (url.pathname === "/ascii" || (url.pathname === "/" && /\b(curl|wget|httpie)\b/i.test(ua))) {
      return new Response(await asciiRoom(!url.searchParams.has("plain")), {
        headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
      });
    }

    // Aset statis dari .output/public (cegah path traversal di luar CLIENT).
    const p = normalize(join(CLIENT, decodeURIComponent(url.pathname)));
    if (p.startsWith(CLIENT) && existsSync(p) && statSync(p).isFile()) {
      const headers: Record<string, string> = {
        "cache-control": "public, max-age=31536000, immutable",
        vary: "accept-encoding",
      };
      const gz = p + ".gz";
      if (/\bgzip\b/.test(req.headers.get("accept-encoding") ?? "") && existsSync(gz)) {
        headers["content-encoding"] = "gzip";
        headers["content-type"] = Bun.file(p).type; // bukan application/gzip
        return new Response(Bun.file(gz), { headers });
      }
      return new Response(Bun.file(p), { headers });
    }
    // Selain itu: serahkan ke SSR handler (worker fetch). Runtime nitro
    // memanggil ctx.waitUntil, jadi beri execution context minimal.
    return handler.fetch(
      req,
      {},
      {
        waitUntil() {},
        passThroughOnException() {},
      },
    );
  },
  websocket: roomWebsocket,
});

console.log(`portfolio host up on http://${hostname}:${port}`);
