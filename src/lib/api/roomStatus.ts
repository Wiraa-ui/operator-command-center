import { createServerFn } from "@tanstack/react-start";

// Live host telemetry for the STATUS rack (serverroom/CONTRACT.md §Security).
// Hard constraints: read-only /proc files via node:fs/promises (no
// child_process ever), zero request input, strict output whitelist below
// (no hostname/IP/version/path/env/service names/error details), 5s
// in-memory cache, and non-linux runtimes short-circuit to all-null.

export interface RoomStatus {
  uptimeSec: number | null;
  memUsedMb: number | null;
  memTotalMb: number | null;
  load1: number | null;
}

const NULL_STATUS: RoomStatus = {
  uptimeSec: null,
  memUsedMb: null,
  memTotalMb: null,
  load1: null,
};

const CACHE_TTL_MS = 5_000;
let cache: { at: number; value: RoomStatus } | null = null;

function finiteOrNull(n: number): number | null {
  return Number.isFinite(n) ? n : null;
}

async function readProc(): Promise<RoomStatus> {
  // node:fs stays inside the handler path so it is tree-shaken from the
  // client bundle (build target is a worker-style fetch handler).
  const { readFile } = await import("node:fs/promises");

  // Per-file failure degrades that field to null instead of failing the call.
  const read = (path: string): Promise<string | null> =>
    readFile(path, "utf8").then(
      (text) => text,
      () => null,
    );

  const [uptime, meminfo, loadavg] = await Promise.all([
    read("/proc/uptime"),
    read("/proc/meminfo"),
    read("/proc/loadavg"),
  ]);

  // /proc/uptime → "<seconds up> <seconds idle>"
  const uptimeSec = uptime === null ? null : finiteOrNull(Math.floor(Number.parseFloat(uptime)));

  // /proc/meminfo → "MemTotal: N kB" / "MemAvailable: N kB"
  let memUsedMb: number | null = null;
  let memTotalMb: number | null = null;
  if (meminfo !== null) {
    const totalKb = Number.parseInt(/^MemTotal:\s+(\d+)/m.exec(meminfo)?.[1] ?? "", 10);
    const availKb = Number.parseInt(/^MemAvailable:\s+(\d+)/m.exec(meminfo)?.[1] ?? "", 10);
    if (Number.isFinite(totalKb)) {
      memTotalMb = Math.round(totalKb / 1024);
      if (Number.isFinite(availKb)) {
        memUsedMb = Math.round((totalKb - availKb) / 1024);
      }
    }
  }

  // /proc/loadavg → "<1m> <5m> <15m> ..." — only the 1m figure is exposed.
  const load1 = loadavg === null ? null : finiteOrNull(Number.parseFloat(loadavg));

  return { uptimeSec, memUsedMb, memTotalMb, load1 };
}

// No inputValidator on purpose: the function accepts no input at all, so
// there is no injection surface (params/body/headers are never read).
export const getRoomStatus = createServerFn({ method: "GET" }).handler(
  async (): Promise<RoomStatus> => {
    if (typeof process === "undefined" || process.platform !== "linux") {
      return NULL_STATUS;
    }

    const now = Date.now();
    if (cache && now - cache.at < CACHE_TTL_MS) {
      return cache.value;
    }

    let value: RoomStatus;
    try {
      value = await readProc();
    } catch {
      // Never leak error details to the client — null fields only.
      value = NULL_STATUS;
    }
    cache = { at: now, value };
    return value;
  },
);
