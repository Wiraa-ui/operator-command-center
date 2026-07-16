import { getExploreState, player, setOnlinePeers, setUser } from "./store";

/**
 * online — client side of room-server.ts (login + presence). Same two-tier
 * pattern as the rest of EXPLORE: peer *positions* live in a mutable map the
 * frame loop lerps through (`peerState`), while peer *membership* goes through
 * the React store so figures mount/unmount.
 *
 * The socket only lives while EXPLORE is open with a logged-in user
 * (ExploreHud connects/disconnects); position updates go up at 5 Hz.
 */

const AUTH_KEY = "room-auth-v1";
const SEND_MS = 200;

export interface PeerMotion {
  /** Network target. */
  x: number;
  z: number;
  yaw: number;
  night: boolean;
  /** Interpolated current (what the figure actually shows). */
  cx: number;
  cz: number;
  cyaw: number;
}

/** name → motion; written by roster frames, read by PeerFigure per frame. */
export const peerState = new Map<string, PeerMotion>();

/* ------------------------------- auth --------------------------------- */

export interface Auth {
  token: string;
  name: string;
}

export function loadAuth(): Auth | null {
  try {
    const raw = window.localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const a = JSON.parse(raw) as Partial<Auth>;
    return typeof a.token === "string" && typeof a.name === "string"
      ? { token: a.token, name: a.name }
      : null;
  } catch {
    return null;
  }
}

function saveAuth(a: Auth | null) {
  try {
    if (a) window.localStorage.setItem(AUTH_KEY, JSON.stringify(a));
    else window.localStorage.removeItem(AUTH_KEY);
  } catch {
    /* private mode: login masih jalan untuk sesi ini saja */
  }
}

/** Register or log in; on success persists the session and updates store. */
export async function authRequest(
  mode: "login" | "register",
  name: string,
  pass: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const res = await fetch(`/api/room/${mode}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, pass }),
    });
    const body = (await res.json()) as { token?: string; name?: string; error?: string };
    if (!res.ok || !body.token || !body.name) {
      return { ok: false, error: body.error ?? "gagal — coba lagi" };
    }
    saveAuth({ token: body.token, name: body.name });
    setUser({ name: body.name });
    return { ok: true };
  } catch {
    return { ok: false, error: "server tidak merespons" };
  }
}

export function logout() {
  saveAuth(null);
  setUser(null);
  disconnectPresence();
}

/* ------------------------------ presence ------------------------------ */

let ws: WebSocket | null = null;
let sendTimer: ReturnType<typeof setInterval> | null = null;
let lastRosterKey = "";

function handleRoster(
  players: { name: string; x: number; z: number; yaw: number; night: boolean }[],
) {
  const self = getExploreState().user?.name;
  const seen = new Set<string>();
  for (const p of players) {
    if (p.name === self) continue;
    seen.add(p.name);
    const m = peerState.get(p.name);
    if (m) {
      m.x = p.x;
      m.z = p.z;
      m.yaw = p.yaw;
      m.night = p.night;
    } else {
      peerState.set(p.name, { ...p, cx: p.x, cz: p.z, cyaw: p.yaw });
    }
  }
  for (const name of peerState.keys()) if (!seen.has(name)) peerState.delete(name);
  // Membership → React only when it actually changed.
  const key = [...seen].sort().join(",");
  if (key !== lastRosterKey) {
    lastRosterKey = key;
    setOnlinePeers([...seen].sort());
  }
}

export function connectPresence() {
  if (ws || typeof window === "undefined") return;
  const auth = loadAuth();
  if (!auth) return;
  const proto = window.location.protocol === "https:" ? "wss" : "ws";
  const sock = new WebSocket(`${proto}://${window.location.host}/ws/room?token=${auth.token}`);
  ws = sock;
  sock.onmessage = (e) => {
    try {
      const m = JSON.parse(String(e.data)) as { t?: string; players?: [] };
      if (m.t === "roster" && Array.isArray(m.players)) handleRoster(m.players);
    } catch {
      /* ignore malformed frame */
    }
  };
  sock.onopen = () => {
    // Respect ghost mode from the first frame of the connection.
    if (!getExploreState().presenceVisible) sock.send(JSON.stringify({ t: "hide" }));
    sendTimer = setInterval(() => {
      if (sock.readyState !== WebSocket.OPEN) return;
      const s = getExploreState();
      if (!s.presenceVisible) return; // ghost: watch others, send nothing
      sock.send(
        JSON.stringify({
          t: "pos",
          x: Math.round(player.x * 100) / 100,
          z: Math.round(player.z * 100) / 100,
          yaw: Math.round(player.yaw * 100) / 100,
          night: s.night,
        }),
      );
    }, SEND_MS);
  };
  sock.onclose = () => {
    if (sendTimer) clearInterval(sendTimer);
    sendTimer = null;
    if (ws === sock) ws = null;
    peerState.clear();
    lastRosterKey = "";
    setOnlinePeers([]);
  };
  sock.onerror = () => sock.close();
}

export function disconnectPresence() {
  ws?.close();
}

/** Flip ghost mode live: tell the relay immediately, pos loop follows. */
export function sendVisibility(show: boolean) {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ t: show ? "show" : "hide" }));
  }
}

/* ------------------------------ speedrun ------------------------------- */

export interface RunResult {
  improved: boolean;
  best: number;
  rank?: number;
}

/** Submit a ROOT speedrun time; resolves null when not logged in / failed. */
export async function submitSpeedrun(ms: number): Promise<RunResult | null> {
  const auth = loadAuth();
  if (!auth) return null;
  try {
    const res = await fetch("/api/room/speedrun", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${auth.token}` },
      body: JSON.stringify({ ms }),
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { ok?: boolean } & RunResult;
    return body.ok ? body : null;
  } catch {
    return null;
  }
}
