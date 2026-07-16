// room-server — login + online presence for the SERVER ROOM game, hosted by
// the same Bun process as the site (serve.ts). No new services, no new RAM
// budget: one sqlite file + one in-memory roster with hard caps.
//
//   POST /api/room/register  {name, pass}  → {token, name}
//   POST /api/room/login     {name, pass}  → {token, name}
//   GET  /api/room/me        Bearer token  → {name}
//   GET  /api/room/services  → {services:[{id,up}], alert}  (digital twin)
//   GET  /api/room/wall      → {notes:[{author,text,at}]}   (guest board)
//   POST /api/room/wall      Bearer token, {text} → {ok}
//   WS   /ws/room?token=…    client {t:"pos",x,z,yaw,night} ≤10 Hz
//                            server {t:"roster", players:[…]} every 250 ms
import { Database } from "bun:sqlite";
import { join } from "node:path";
import { mkdirSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { connect } from "node:net";

/* ------------------------------ storage ------------------------------- */

const DATA_DIR = join(import.meta.dir, "data");
mkdirSync(DATA_DIR, { recursive: true });
const db = new Database(join(DATA_DIR, "room.db"));
db.exec(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE COLLATE NOCASE,
    pass TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS wall_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    author TEXT NOT NULL,
    text TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
`);

const MAX_USERS = 2000;
const SESSION_TTL_MS = 30 * 24 * 3600 * 1000;
const NAME_RE = /^[a-z0-9_]{3,16}$/;

/* ----------------------------- rate limit ----------------------------- */

/** 10 auth attempts / minute / IP — a game login, not a bank. */
const attempts = new Map<string, { n: number; resetAt: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const a = attempts.get(ip);
  if (!a || now > a.resetAt) {
    attempts.set(ip, { n: 1, resetAt: now + 60_000 });
    if (attempts.size > 5000) attempts.clear(); // memory hard cap
    return false;
  }
  a.n++;
  return a.n > 10;
}

/* ------------------------------- auth --------------------------------- */

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    },
  });
}

function newSession(userId: number, name: string): Response {
  const token = crypto.randomUUID();
  db.query("INSERT INTO sessions (token, user_id, created_at) VALUES (?, ?, ?)").run(
    token,
    userId,
    Date.now(),
  );
  return json(200, { token, name });
}

function userByToken(token: string | null): { id: number; name: string } | null {
  if (!token || token.length > 64) return null;
  const row = db
    .query<{ id: number; name: string; created_at: number }, [string]>(
      "SELECT u.id, u.name, s.created_at FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ?",
    )
    .get(token);
  if (!row) return null;
  if (Date.now() - row.created_at > SESSION_TTL_MS) {
    db.query("DELETE FROM sessions WHERE token = ?").run(token);
    return null;
  }
  return { id: row.id, name: row.name };
}

async function readCreds(req: Request): Promise<{ name: string; pass: string } | null> {
  try {
    const body = (await req.json()) as { name?: unknown; pass?: unknown };
    const name = String(body.name ?? "").toLowerCase();
    const pass = String(body.pass ?? "");
    if (!NAME_RE.test(name) || pass.length < 6 || pass.length > 72) return null;
    return { name, pass };
  } catch {
    return null;
  }
}

/* ---------------------------- digital twin ----------------------------- */

// CORE "digital twin" racks: each whitelisted local service maps to one rack
// in the 3D room. A service counts as UP when its loopback port accepts a TCP
// connect — no child_process, no systemctl, no request input. The response
// carries display id + boolean only (never ports/pids/versions/errors); the
// id whitelist extension over the original roomStatus contract is the
// PROJECT_MASTER backlog-1 mandate.
const TWIN_SERVICES: ReadonlyArray<{ id: string; port: number | null }> = [
  { id: "portfolio", port: null }, // self — answering this request proves it
  { id: "siku-backend", port: 3000 },
  { id: "siku-frontend", port: 4173 },
  { id: "postgres", port: 5432 },
  { id: "n8n", port: 5678 },
];

/** Low-memory alarm threshold (matches the ops rule "available < 800 MB"). */
const MEM_ALERT_KB = 800 * 1024;
const TWIN_TTL_MS = 5_000;

export interface TwinStatus {
  services: { id: string; up: boolean }[];
  alert: boolean;
}

let twinCache: { at: number; value: TwinStatus } | null = null;

/** True when 127.0.0.1:port accepts a connection within 600 ms. */
function probePort(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const sock = connect({ host: "127.0.0.1", port });
    let settled = false;
    const done = (up: boolean) => {
      if (settled) return;
      settled = true;
      sock.destroy();
      resolve(up);
    };
    sock.setTimeout(600, () => done(false));
    sock.once("connect", () => done(true));
    sock.once("error", () => done(false));
  });
}

export async function twinStatus(): Promise<TwinStatus> {
  const now = Date.now();
  if (twinCache && now - twinCache.at < TWIN_TTL_MS) return twinCache.value;

  const services = await Promise.all(
    TWIN_SERVICES.map(async (s) => ({
      id: s.id,
      up: s.port === null ? true : await probePort(s.port),
    })),
  );

  let alert = false;
  try {
    const meminfo = await readFile("/proc/meminfo", "utf8");
    const availKb = Number.parseInt(/^MemAvailable:\s+(\d+)/m.exec(meminfo)?.[1] ?? "", 10);
    alert = Number.isFinite(availKb) && availKb < MEM_ALERT_KB;
  } catch {
    /* non-linux dev host — no alarm */
  }

  const value = { services, alert };
  twinCache = { at: now, value };
  return value;
}

/* ------------------------------ guest wall ----------------------------- */

// Physical guestbook: `wall <pesan>` in the CORE terminal pins a sticky note
// on the NOC whiteboard for every future visitor. Login required (author =
// account name), tight charset, no links, per-user cooldown + daily cap,
// board bounded to the newest 24 notes — abuse surface stays tiny.
const WALL_MAX_LEN = 64;
const WALL_CHARSET = /^[a-zA-Z0-9 .,!?'"()@:_+*<>=~^-]+$/;
const WALL_COOLDOWN_MS = 120_000;
const WALL_DAILY_CAP = 5;
const WALL_KEEP = 24;
const WALL_SHOW = 12;

function postWallNote(userId: number, author: string, raw: unknown): Response {
  const text = String(raw ?? "")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length < 3 || text.length > WALL_MAX_LEN || !WALL_CHARSET.test(text)) {
    return json(400, { error: `pesan 3–${WALL_MAX_LEN} karakter, huruf/angka/tanda baca dasar` });
  }
  if (/https?|:\/\/|www\./i.test(text)) {
    return json(400, { error: "papan tamu bukan tempat tautan" });
  }
  const now = Date.now();
  const last = db
    .query<{ t: number }, [number]>("SELECT MAX(created_at) AS t FROM wall_notes WHERE user_id = ?")
    .get(userId);
  if (last?.t && now - last.t < WALL_COOLDOWN_MS) {
    return json(429, { error: "papan butuh napas — coba lagi 2 menit lagi" });
  }
  const today = db
    .query<{ n: number }, [number, number]>(
      "SELECT COUNT(*) AS n FROM wall_notes WHERE user_id = ? AND created_at > ?",
    )
    .get(userId, now - 86_400_000);
  if ((today?.n ?? 0) >= WALL_DAILY_CAP) {
    return json(429, { error: "kuota harian papan habis — besok lagi" });
  }
  db.query("INSERT INTO wall_notes (user_id, author, text, created_at) VALUES (?, ?, ?, ?)").run(
    userId,
    author,
    text,
    now,
  );
  db.query(
    `DELETE FROM wall_notes WHERE id NOT IN (SELECT id FROM wall_notes ORDER BY id DESC LIMIT ${WALL_KEEP})`,
  ).run();
  return json(200, { ok: true });
}

function listWallNotes(): Response {
  const notes = db
    .query<{ author: string; text: string; created_at: number }, []>(
      `SELECT author, text, created_at FROM wall_notes ORDER BY id DESC LIMIT ${WALL_SHOW}`,
    )
    .all()
    .map((n) => ({ author: n.author, text: n.text, at: n.created_at }));
  return json(200, { notes });
}

/** Handles /api/room/*; returns null for any other path. */
export async function roomApi(req: Request, url: URL, ip: string): Promise<Response | null> {
  if (!url.pathname.startsWith("/api/room/")) return null;

  // Body-size hard cap on every room POST: the biggest legit payload is a
  // login body (<200 B) — anything larger is garbage or a memory probe.
  if (req.method === "POST") {
    const len = Number(req.headers.get("content-length") ?? 0);
    if (!Number.isFinite(len) || len > 4096) {
      return json(413, { error: "body terlalu besar" });
    }
  }

  if (url.pathname === "/api/room/services" && req.method === "GET") {
    return json(200, await twinStatus());
  }

  if (url.pathname === "/api/room/wall" && req.method === "GET") {
    return listWallNotes();
  }

  if (url.pathname === "/api/room/wall" && req.method === "POST") {
    if (rateLimited(ip)) return json(429, { error: "terlalu cepat — tunggu sebentar" });
    const u = userByToken(req.headers.get("authorization")?.replace(/^Bearer /, "") ?? null);
    if (!u) return json(401, { error: "login dulu (tombol LOGIN — TAMPIL ONLINE)" });
    let body: { text?: unknown };
    try {
      body = (await req.json()) as { text?: unknown };
    } catch {
      return json(400, { error: "body json {text} dibutuhkan" });
    }
    return postWallNote(u.id, u.name, body.text);
  }

  if (url.pathname === "/api/room/me" && req.method === "GET") {
    const u = userByToken(req.headers.get("authorization")?.replace(/^Bearer /, "") ?? null);
    return u ? json(200, { name: u.name }) : json(401, { error: "sesi tidak valid" });
  }

  if (req.method !== "POST") return json(405, { error: "method" });
  if (rateLimited(ip)) return json(429, { error: "terlalu banyak percobaan — tunggu sebentar" });
  const creds = await readCreds(req);
  if (!creds)
    return json(400, { error: "nama 3–16 huruf kecil/angka/_, password minimal 6 karakter" });

  if (url.pathname === "/api/room/register") {
    const count = db.query<{ n: number }, []>("SELECT COUNT(*) AS n FROM users").get();
    if ((count?.n ?? 0) >= MAX_USERS) return json(503, { error: "registrasi penuh" });
    const exists = db
      .query<{ id: number }, [string]>("SELECT id FROM users WHERE name = ?")
      .get(creds.name);
    if (exists) return json(409, { error: "nama sudah dipakai" });
    const hash = await Bun.password.hash(creds.pass);
    const r = db
      .query("INSERT INTO users (name, pass, created_at) VALUES (?, ?, ?)")
      .run(creds.name, hash, Date.now());
    return newSession(Number(r.lastInsertRowid), creds.name);
  }

  if (url.pathname === "/api/room/login") {
    const row = db
      .query<{ id: number; pass: string }, [string]>("SELECT id, pass FROM users WHERE name = ?")
      .get(creds.name);
    if (!row || !(await Bun.password.verify(creds.pass, row.pass))) {
      return json(401, { error: "nama atau password salah" });
    }
    return newSession(row.id, creds.name);
  }

  return json(404, { error: "not found" });
}

/* ----------------------------- presence ------------------------------- */

export interface WsData {
  userId: number;
  name: string;
  pos: { x: number; z: number; yaw: number; night: boolean } | null;
  /** Ghost mode: connected (sees others) but never appears in the roster. */
  hidden: boolean;
  lastMsgAt: number;
  msgCount: number;
}

interface RoomSocket {
  data: WsData;
  send(data: string): void;
  close(code?: number, reason?: string): void;
}

const MAX_PLAYERS = 16;
const clients = new Set<RoomSocket>();
let broadcastTimer: ReturnType<typeof setInterval> | null = null;

function broadcast() {
  if (clients.size === 0) return;
  const players = [...clients]
    .filter((c) => c.data.pos)
    .map((c) => ({ name: c.data.name, ...c.data.pos }));
  const msg = JSON.stringify({ t: "roster", players });
  for (const c of clients) c.send(msg);
}

/** True if this request was upgraded to the presence websocket. */
export function roomUpgrade(
  req: Request,
  url: URL,
  server: { upgrade(req: Request, opts: { data: WsData }): boolean },
): boolean {
  if (url.pathname !== "/ws/room") return false;
  const u = userByToken(url.searchParams.get("token"));
  if (!u) return false; // no upgrade → caller returns 401
  return server.upgrade(req, {
    data: { userId: u.id, name: u.name, pos: null, hidden: false, lastMsgAt: 0, msgCount: 0 },
  });
}

export const roomWebsocket = {
  idleTimeout: 120, // s — dead tabs get reaped
  maxPayloadLength: 512,
  open(ws: RoomSocket) {
    if (clients.size >= MAX_PLAYERS) {
      ws.close(4001, "room penuh");
      return;
    }
    // One live socket per account: the newest tab wins.
    for (const c of clients) {
      if (c.data.userId === ws.data.userId) c.close(4002, "sesi lain masuk");
    }
    clients.add(ws);
    if (!broadcastTimer) broadcastTimer = setInterval(broadcast, 250);
  },
  message(ws: RoomSocket, raw: string | Buffer) {
    const d = ws.data;
    // ≤20 msg/s per client, silently dropped beyond that.
    const now = Date.now();
    if (now - d.lastMsgAt > 1000) {
      d.lastMsgAt = now;
      d.msgCount = 0;
    }
    if (++d.msgCount > 20) return;
    try {
      const m = JSON.parse(String(raw)) as {
        t?: string;
        x?: number;
        z?: number;
        yaw?: number;
        night?: boolean;
      };
      // Ghost-mode switches: hidden players drop out of the roster at the
      // next broadcast (pos null) and their position updates are ignored.
      if (m.t === "hide") {
        d.hidden = true;
        d.pos = null;
        return;
      }
      if (m.t === "show") {
        d.hidden = false;
        return;
      }
      if (m.t !== "pos" || d.hidden) return;
      const x = Number(m.x);
      const z = Number(m.z);
      const yaw = Number(m.yaw);
      if (!Number.isFinite(x) || !Number.isFinite(z) || !Number.isFinite(yaw)) return;
      // Map bounds with slack; junk coordinates are dropped, not clamped.
      if (Math.abs(x) > 60 || Math.abs(z) > 60) return;
      d.pos = { x, z, yaw, night: Boolean(m.night) };
    } catch {
      /* malformed frame — ignore */
    }
  },
  close(ws: RoomSocket) {
    clients.delete(ws);
    if (clients.size === 0 && broadcastTimer) {
      clearInterval(broadcastTimer);
      broadcastTimer = null;
    }
  },
};
