import { useEffect, useMemo, useRef, useState } from "react";
import { PALETTE } from "../types";
import { roomAudio } from "./audio";
import { downloadCertificate } from "./certificate";
import type { ExploreMap } from "./layout";
import { LoginModal } from "./LoginModal";
import { NpcModal } from "./NpcModal";
import { connectPresence, disconnectPresence, loadAuth, logout } from "./online";
import { activeQuestInfo, type NpcId } from "./rpg";
import { PuzzleModal } from "./PuzzleModal";
import { StudyModal } from "./StudyModal";
import { TerminalModal } from "./TerminalModal";
import {
  endNightShift,
  input,
  setModal,
  setMuted,
  setUser,
  toggleView,
  triggerInteract,
  useExplore,
} from "./store";
import { ARSIP_RACKS } from "./nightshift/state";
import { stopSpeaking } from "./nightshift/voice";

/**
 * ExploreHud — every DOM control of EXPLORE mode: pointer-lock pad + mouse
 * look (desktop), virtual joystick + drag-look (touch), crosshair, privilege
 * badge, interact prompt, toasts, music toggle, certificate, and the modal
 * mounts. Writes raw input into the mutable `input` singleton; PlayerRig
 * consumes it inside the Canvas.
 */

const mono = "font-op-mono";
const TOUCH_LOOK_GAIN = 2.2;
const JOY_RADIUS = 48;

export function ExploreHud({ map, onExit }: { map: ExploreMap; onExit: () => void }) {
  const modal = useExplore((s) => s.modal);
  const interact = useExplore((s) => s.interact);
  const privilege = useExplore((s) => s.privilege);
  const toasts = useExplore((s) => s.toasts);
  const muted = useExplore((s) => s.muted);
  const achievements = useExplore((s) => s.achievements);
  const view = useExplore((s) => s.view);
  const nightOn = useExplore((s) => s.night);
  const purgedCount = useExplore((s) => s.purged.length);
  const purging = useExplore((s) => s.purging);
  const moksa = useExplore((s) => s.moksa);
  const dialogue = useExplore((s) => s.dialogue);
  const user = useExplore((s) => s.user);
  const onlineCount = useExplore((s) => s.onlinePeers.length);
  // Select the stable reference, derive outside — a fresh object from the
  // selector would make useSyncExternalStore re-render forever.
  const questProgress = useExplore((s) => s.questProgress);
  const quest = useMemo(() => activeQuestInfo(questProgress), [questProgress]);

  const [locked, setLocked] = useState(false);
  const lockpad = useRef<HTMLDivElement>(null);
  const isTouch = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches,
    [],
  );

  // Restore the badge session and keep presence alive for the whole EXPLORE
  // session (login via the modal reuses the same socket lifecycle).
  useEffect(() => {
    const auth = loadAuth();
    if (auth) {
      setUser({ name: auth.name });
      connectPresence();
      // Server may have expired the token — verify quietly, demote if so.
      fetch("/api/room/me", { headers: { Authorization: `Bearer ${auth.token}` } })
        .then((r) => {
          if (r.status === 401) logout();
        })
        .catch(() => {});
    }
    return () => disconnectPresence();
  }, []);

  /* --------------------- pointer lock + mouse look --------------------- */

  useEffect(() => {
    const onChange = () => {
      const l = document.pointerLockElement === lockpad.current;
      input.pointerLocked = l;
      setLocked(l);
    };
    const onMove = (e: MouseEvent) => {
      if (input.pointerLocked) {
        input.lookDX += e.movementX;
        input.lookDY += e.movementY;
      }
    };
    document.addEventListener("pointerlockchange", onChange);
    document.addEventListener("mousemove", onMove);
    return () => {
      document.removeEventListener("pointerlockchange", onChange);
      document.removeEventListener("mousemove", onMove);
      if (document.pointerLockElement) document.exitPointerLock();
      input.pointerLocked = false;
    };
  }, []);

  // ESC closes an open modal (pointer lock is already released then).
  useEffect(() => {
    if (!modal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModal(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modal]);

  const engage = () => {
    roomAudio.start(muted);
    if (!isTouch && !modal && lockpad.current && !document.pointerLockElement) {
      lockpad.current.requestPointerLock();
    }
  };

  /* -------------------------- touch drag-look -------------------------- */

  const lookPointer = useRef<{ id: number; x: number; y: number } | null>(null);
  const onPadPointerDown = (e: React.PointerEvent) => {
    engage();
    if (isTouch && lookPointer.current === null) {
      lookPointer.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
    }
  };
  const onPadPointerMove = (e: React.PointerEvent) => {
    const lp = lookPointer.current;
    if (!lp || lp.id !== e.pointerId) return;
    input.lookDX += (e.clientX - lp.x) * TOUCH_LOOK_GAIN;
    input.lookDY += (e.clientY - lp.y) * TOUCH_LOOK_GAIN;
    lp.x = e.clientX;
    lp.y = e.clientY;
  };
  const onPadPointerEnd = (e: React.PointerEvent) => {
    if (lookPointer.current?.id === e.pointerId) lookPointer.current = null;
  };

  /* ---------------------------- render ---------------------------------- */

  return (
    <>
      {/* Input pad: full-screen, sits above the canvas but below the HUD chrome. */}
      <div
        ref={lockpad}
        className="fixed inset-0 z-10"
        style={{ touchAction: "none", cursor: locked ? "none" : "crosshair" }}
        onClick={engage}
        onPointerDown={onPadPointerDown}
        onPointerMove={onPadPointerMove}
        onPointerUp={onPadPointerEnd}
        onPointerCancel={onPadPointerEnd}
        aria-hidden="true"
      />

      {/* Crosshair */}
      {(locked || isTouch) && !modal && (
        <div className="pointer-events-none fixed left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
          <div
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: PALETTE.accentBright, boxShadow: "0 0 8px rgba(245,158,11,0.9)" }}
          />
        </div>
      )}

      {/* Desktop "click to control" veil */}
      {!isTouch && !locked && !modal && (
        <div className="pointer-events-none fixed inset-0 z-20 flex items-center justify-center">
          <div
            className={`rounded-xl border px-6 py-4 text-center ${mono} text-[12px] leading-relaxed backdrop-blur-md`}
            style={{
              borderColor: "rgba(245,158,11,0.4)",
              background: "rgba(15,23,42,0.75)",
              color: "#e2e8f0",
            }}
          >
            <div
              style={{ color: PALETTE.accentBright }}
              className="text-[13px] font-bold tracking-[0.2em]"
            >
              KLIK UNTUK KENDALI
            </div>
            <div className="mt-2" style={{ color: "#9fb0cc" }}>
              WASD jalan · Shift lari · Space lompat · mouse 360° · E interaksi · V sudut pandang ·
              ESC jeda
            </div>
          </div>
        </div>
      )}

      {/* Privilege badge */}
      <div
        className={`pointer-events-none fixed left-4 top-16 z-30 rounded-md border px-3 py-1.5 ${mono} text-[11px] tracking-[0.2em]`}
        style={{
          borderColor: privilege === "root" ? PALETTE.accentBright : "rgba(124,141,176,0.4)",
          background: "rgba(15,23,42,0.7)",
          color: privilege === "guest" ? "#9fb0cc" : PALETTE.accentBright,
        }}
      >
        {privilege.toUpperCase()}@server-room
      </div>

      {/* Perspective toggle — stacked under the badge; the bottom-right rows
          (chrome + touch E button) are already full at 390px widths. */}
      <button
        onClick={toggleView}
        className={`fixed left-4 top-28 z-30 rounded-md border px-3 py-1.5 ${mono} text-[11px] tracking-[0.2em]`}
        style={{
          borderColor: "rgba(245,158,11,0.5)",
          background: "rgba(15,23,42,0.7)",
          color: PALETTE.accentBright,
        }}
        aria-label={
          view === "first"
            ? "Ganti ke sudut pandang orang ketiga"
            : "Ganti ke sudut pandang orang pertama"
        }
      >
        POV: {view === "first" ? "1ST" : "3RD"}
      </button>

      {/* Online badge / login — stacked under POV */}
      <button
        onClick={() => {
          if (user) {
            if (window.confirm(`Keluar dari badge ${user.name}?`)) logout();
          } else {
            setModal({ type: "login" });
          }
        }}
        className={`fixed left-4 top-40 z-30 rounded-md border px-3 py-1.5 ${mono} text-[11px] tracking-[0.2em]`}
        style={{
          borderColor: user ? "rgba(56,189,248,0.55)" : "rgba(124,141,176,0.4)",
          background: "rgba(15,23,42,0.7)",
          color: user ? PALETTE.secondary : "#9fb0cc",
        }}
        aria-label={user ? "Keluar dari akun" : "Masuk atau daftar untuk tampil online"}
      >
        {user ? `● ${onlineCount + 1} ONLINE · ${user.name}` : "○ LOGIN — TAMPIL ONLINE"}
      </button>

      {/* Quest tracker — under the minimap; night mode has its own goals */}
      {quest && !nightOn && (
        <div
          className={`pointer-events-none fixed right-4 top-[17.5rem] z-30 w-[9.5rem] rounded-md border px-3 py-2 ${mono}`}
          style={{
            borderColor: "rgba(245,158,11,0.4)",
            background: "rgba(15,23,42,0.7)",
          }}
        >
          <div
            className="text-[9px] font-bold tracking-[0.22em]"
            style={{ color: PALETTE.accentBright }}
          >
            📜 {quest.title}
          </div>
          <div className="mt-1 text-[10px] leading-snug" style={{ color: "#cbd5e1" }}>
            {quest.step}
          </div>
        </div>
      )}

      {/* ------------------------- SHIFT MALAM ------------------------- */}
      {nightOn && (
        <div
          className={`pointer-events-none fixed left-4 top-[13rem] z-30 rounded-md border px-3 py-1.5 ${mono} text-[11px] tracking-[0.2em]`}
          style={{
            borderColor: "rgba(245,158,11,0.5)",
            background: "rgba(15,23,42,0.7)",
            color: PALETTE.accentBright,
          }}
        >
          ARSIP {purgedCount}/{ARSIP_RACKS.length} · L LAMPU
        </div>
      )}
      {nightOn && purging && (
        <div className="pointer-events-none fixed bottom-40 left-1/2 z-30 w-56 -translate-x-1/2">
          <style>{`@keyframes ns-fill { from { width: 0%; } to { width: 100%; } }`}</style>
          <div
            className={`${mono} mb-1 text-center text-[10px] tracking-[0.25em]`}
            style={{ color: PALETTE.accentBright }}
          >
            NGABEN DIGITAL…
          </div>
          <div
            className="h-1.5 overflow-hidden rounded-full"
            style={{ background: "rgba(245,158,11,0.18)" }}
          >
            <div
              key={purging.id}
              className="h-full"
              style={{
                background: PALETTE.accentBright,
                animation: `ns-fill ${Math.max(purging.until - Date.now(), 100)}ms linear forwards`,
              }}
            />
          </div>
        </div>
      )}
      {moksa && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(253,233,200,0.32), rgba(15,23,42,0.94) 75%)",
          }}
        >
          <div className="max-w-md px-8 text-center">
            <div className={`${mono} text-[11px] tracking-[0.3em]`} style={{ color: "#fde9c8" }}>
              // 7/7 ARSIP DILEPASKAN
            </div>
            <h2 className="mt-3 text-3xl font-bold" style={{ color: "#f8fafc" }}>
              MOKSA
            </h2>
            <p className="mt-3 text-[14px] leading-relaxed" style={{ color: "#cbd5e1" }}>
              Server sunyi. Tidak ada lagi yang menunggu di dalam rak. Bu Kirana berdiri di lorong,
              melepas kacamatanya — malam ini tak ada yang perlu dia jaga.
            </p>
            <button
              onClick={() => {
                endNightShift();
              }}
              className={`${mono} mt-6 rounded-full border px-5 py-2 text-[12px] font-bold tracking-[0.2em]`}
              style={{
                borderColor: PALETTE.accentBright,
                background: "rgba(245,158,11,0.18)",
                color: PALETTE.accentBright,
              }}
            >
              KEMBALI KE SHIFT PAGI
            </button>
          </div>
        </div>
      )}

      {/* Dialogue subtitle — one line at a time, story.ts runs the queue */}
      {dialogue && (
        <div
          key={dialogue.id}
          className="pointer-events-none fixed bottom-44 left-1/2 z-30 w-[min(92vw,40rem)] -translate-x-1/2 text-center"
        >
          {/* Slide only — never animate opacity here: on slow devices a
              stalled animation would hold the subtitle invisible forever. */}
          <style>{`@keyframes ns-sub { from { transform: translateY(10px); } to { transform: none; } }`}</style>
          <div
            className="rounded-xl border px-5 py-3"
            style={{
              animation: "ns-sub 320ms ease-out both",
              borderColor:
                dialogue.speaker === "kirana" ? "rgba(245,158,11,0.55)" : "rgba(56,189,248,0.4)",
              background: "rgba(11,17,32,0.86)",
              backdropFilter: "blur(6px)",
            }}
          >
            <div
              className={`${mono} text-[10px] font-bold tracking-[0.28em]`}
              style={{
                color: dialogue.speaker === "kirana" ? PALETTE.accentBright : PALETTE.secondary,
              }}
            >
              {dialogue.name}
            </div>
            <div className="mt-1.5 text-[14px] leading-relaxed" style={{ color: "#e2e8f0" }}>
              “{dialogue.text}”
            </div>
          </div>
        </div>
      )}

      {/* Interact prompt / button */}
      {interact &&
        !modal &&
        (isTouch ? (
          <button
            onClick={triggerInteract}
            className={`fixed bottom-24 right-6 z-30 flex h-16 w-16 items-center justify-center rounded-full border-2 ${mono} text-xl font-bold`}
            style={{
              borderColor: PALETTE.accentBright,
              background: "rgba(245,158,11,0.2)",
              color: PALETTE.accentBright,
            }}
            aria-label={interact.label}
          >
            E
          </button>
        ) : (
          <div
            className={`pointer-events-none fixed bottom-28 left-1/2 z-30 -translate-x-1/2 rounded-md border px-4 py-2 ${mono} text-[12px] tracking-[0.14em]`}
            style={{
              borderColor: "rgba(245,158,11,0.5)",
              background: "rgba(15,23,42,0.8)",
              color: PALETTE.accentBright,
            }}
          >
            [E] {interact.label}
          </div>
        ))}

      {/* Toasts */}
      <div className="pointer-events-none fixed left-1/2 top-20 z-40 flex -translate-x-1/2 flex-col items-center gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`rounded-md border px-4 py-2 ${mono} text-[12px]`}
            style={{
              borderColor: "rgba(245,158,11,0.55)",
              background: "rgba(15,23,42,0.9)",
              color: PALETTE.accentBright,
            }}
          >
            {t.text}
          </div>
        ))}
      </div>

      {/* Chrome: exit, mute, certificate */}
      {/* bottom-20 clears the ChatWidget FAB that lives at the corner */}
      <div className="fixed right-4 bottom-20 z-30 flex items-center gap-2">
        {privilege === "root" && (
          <button
            onClick={() => setModal({ type: "certificate" })}
            className={`rounded-full border px-4 py-2 ${mono} text-[11px] uppercase tracking-[0.16em]`}
            style={{
              borderColor: PALETTE.accentBright,
              background: "rgba(245,158,11,0.15)",
              color: PALETTE.accentBright,
            }}
          >
            🏆 sertifikat
          </button>
        )}
        <button
          onClick={() => {
            setMuted(!muted);
            roomAudio.setMuted(!muted);
            if (!muted) stopSpeaking(); // muting also silences the cast
          }}
          className={`rounded-full border px-3 py-2 ${mono} text-[13px]`}
          style={{
            borderColor: "rgba(124,141,176,0.4)",
            background: "rgba(15,23,42,0.7)",
            color: "#e2e8f0",
          }}
          aria-label={muted ? "Nyalakan musik" : "Matikan musik"}
        >
          {muted ? "🔇" : "🔊"}
        </button>
        <button
          onClick={onExit}
          className={`rounded-full border px-4 py-2 ${mono} text-[11px] uppercase tracking-[0.16em]`}
          style={{
            borderColor: "rgba(124,141,176,0.4)",
            background: "rgba(15,23,42,0.7)",
            color: "#e2e8f0",
          }}
        >
          ✕ keluar
        </button>
      </div>

      {/* Virtual joystick (touch) */}
      {isTouch && <Joystick />}

      {/* Modals */}
      {modal?.type === "puzzle" && (
        <PuzzleModal door={map.doors.find((d) => d.id === modal.doorId)!} />
      )}
      {modal?.type === "terminal" && <TerminalModal />}
      {modal?.type === "study" && <StudyModal slug={modal.slug} />}
      {modal?.type === "login" && <LoginModal />}
      {modal?.type === "npc" && <NpcModal npcId={modal.npcId as NpcId} />}
      {modal?.type === "certificate" && <CertificateModal achievements={achievements} />}
    </>
  );
}

/* ------------------------------ joystick ------------------------------- */

function Joystick() {
  const base = useRef<HTMLDivElement>(null);
  const [nub, setNub] = useState({ x: 0, y: 0 });
  const active = useRef<number | null>(null);

  const update = (e: React.PointerEvent) => {
    const el = base.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    let dx = e.clientX - (r.left + r.width / 2);
    let dy = e.clientY - (r.top + r.height / 2);
    const len = Math.hypot(dx, dy);
    if (len > JOY_RADIUS) {
      dx = (dx / len) * JOY_RADIUS;
      dy = (dy / len) * JOY_RADIUS;
    }
    setNub({ x: dx, y: dy });
    input.joy.x = dx / JOY_RADIUS;
    input.joy.y = dy / JOY_RADIUS;
  };

  const release = () => {
    active.current = null;
    setNub({ x: 0, y: 0 });
    input.joy.x = 0;
    input.joy.y = 0;
  };

  return (
    <div
      ref={base}
      className="fixed bottom-8 left-6 z-30 h-32 w-32 rounded-full border-2"
      style={{
        borderColor: "rgba(245,158,11,0.4)",
        background: "rgba(15,23,42,0.5)",
        touchAction: "none",
      }}
      onPointerDown={(e) => {
        active.current = e.pointerId;
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        roomAudio.start(false);
        update(e);
      }}
      onPointerMove={(e) => {
        if (active.current === e.pointerId) update(e);
      }}
      onPointerUp={release}
      onPointerCancel={release}
      aria-label="Joystick jalan"
      role="application"
    >
      <div
        className="absolute left-1/2 top-1/2 h-12 w-12 rounded-full"
        style={{
          background: "rgba(245,158,11,0.55)",
          transform: `translate(calc(-50% + ${nub.x}px), calc(-50% + ${nub.y}px))`,
        }}
      />
    </div>
  );
}

/* ---------------------------- certificate ------------------------------ */

function CertificateModal({ achievements }: { achievements: string[] }) {
  const [name, setName] = useState("");
  const mono2 = "var(--font-op-mono, monospace)";
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Sertifikat ROOT"
        className="w-full max-w-sm rounded-xl border p-6 text-center"
        style={{
          borderColor: "rgba(245,158,11,0.5)",
          background: "rgba(15,23,42,0.95)",
          fontFamily: mono2,
          color: "#e2e8f0",
        }}
      >
        <div
          className="text-[11px] uppercase tracking-[0.24em]"
          style={{ color: PALETTE.accentBright }}
        >
          root access granted
        </div>
        <p className="mt-3 text-[13px] leading-relaxed" style={{ color: "#9fb0cc" }}>
          Cetak bukti bahwa Anda menembus CORE mesin ini.
        </p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="nama Anda"
          aria-label="Nama untuk sertifikat"
          className="mt-4 w-full rounded-md border bg-transparent px-3 py-2 text-center text-[14px] outline-none"
          style={{
            borderColor: "rgba(245,158,11,0.4)",
            color: PALETTE.accentBright,
            fontFamily: mono2,
          }}
        />
        <button
          onClick={() => downloadCertificate(name.trim(), achievements)}
          className="mt-4 w-full rounded-md px-4 py-2.5 text-[12px] font-bold uppercase tracking-wider"
          style={{ background: PALETTE.accent, color: PALETTE.bg }}
        >
          unduh sertifikat .png
        </button>
        <button
          onClick={() => setModal(null)}
          className="mt-3 text-[11px] uppercase tracking-[0.18em] underline-offset-4 hover:underline"
          style={{ color: "#9fb0cc" }}
        >
          tutup
        </button>
      </div>
    </div>
  );
}
