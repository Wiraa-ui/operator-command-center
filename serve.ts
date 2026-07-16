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
import { join, normalize } from "node:path";
import { existsSync, statSync } from "node:fs";
import { asciiRoom } from "./ascii-room";
import { roomApi, roomUpgrade, roomWebsocket, type WsData } from "./room-server";

const CLIENT = join(import.meta.dir, ".output", "public");
const port = Number(process.env.PORT ?? 4174);
const hostname = process.env.HOST ?? "127.0.0.1";

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
      return new Response(Bun.file(p), {
        headers: { "cache-control": "public, max-age=31536000, immutable" },
      });
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
