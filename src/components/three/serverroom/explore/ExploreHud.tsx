import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { PALETTE } from "../types";
import { roomAudio } from "./audio";
import { downloadCertificate } from "./certificate";
import { SERVICE_RACKS, type ExploreMap } from "./layout";
import { LoginModal } from "./LoginModal";
import { NpcModal } from "./NpcModal";
import {
  connectPresence,
  disconnectPresence,
  loadAuth,
  logout,
  sendVisibility,
  submitSpeedrun,
} from "./online";
import { activeQuestInfo, QUESTS, questWaypoint, type NpcId } from "./rpg";
import { PuzzleModal } from "./PuzzleModal";
import {
  addAchievement,
  addToast,
  chooseEnding,
  clearDrill,
  endNightShift,
  getExploreState,
  input,
  photoBus,
  player,
  setModal,
  setMuted,
  setPresenceVisible,
  setUser,
  startDrill,
  toggleView,
  triggerInteract,
  useExplore,
  type EndingKind,
  type QuestProgress,
} from "./store";
import { tr } from "./i18n";
import { ARSIP_RACKS } from "./nightshift/state";
import { storyEnding } from "./nightshift/story";
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

// Heavy, rarely-open modals load on demand: the terminal drags the whole
// simulated shell + VFS text, the story/ending cards their prose.
const TerminalModal = lazy(() =>
  import("./TerminalModal").then((m) => ({ default: m.TerminalModal })),
);
const SettingsModal = lazy(() =>
  import("./SettingsModal").then((m) => ({ default: m.SettingsModal })),
);
const StoryLogModal = lazy(() =>
  import("./StoryLogModal").then((m) => ({ default: m.StoryLogModal })),
);
const EndingOverlay = lazy(() =>
  import("./EndingOverlay").then((m) => ({ default: m.EndingOverlay })),
);
const StudyModal = lazy(() => import("./StudyModal").then((m) => ({ default: m.StudyModal })));
const InventoryModal = lazy(() =>
  import("./InventoryModal").then((m) => ({ default: m.InventoryModal })),
);

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
  const ending = useExplore((s) => s.ending);
  const sawDark = useExplore((s) => s.sawDark);
  const dialogue = useExplore((s) => s.dialogue);
  const user = useExplore((s) => s.user);
  const onlineCount = useExplore((s) => s.onlinePeers.length);
  const presenceVisible = useExplore((s) => s.presenceVisible);
  const startedAt = useExplore((s) => s.startedAt);
  const rootAt = useExplore((s) => s.rootAt);
  const endingActive = useExplore((s) => s.endingActive);
  const hp = useExplore((s) => s.hp);
  const itemGet = useExplore((s) => s.itemGet);

  // Persisted master volume applies as soon as the HUD exists.
  const volume = useExplore((s) => s.settings.volume);
  useEffect(() => {
    roomAudio.setVolume(volume);
  }, [volume]);

  // ROOT speedrun: submit once when root is earned this session while
  // logged in. rootAt is session-only, so reloads can't fake a run.
  const runSubmitted = useRef(false);
  useEffect(() => {
    if (rootAt === null || !user || runSubmitted.current) return;
    runSubmitted.current = true;
    const ms = rootAt - startedAt;
    void submitSpeedrun(ms).then((r) => {
      if (r?.improved) {
        const s = (ms / 1000).toFixed(1);
        addToast(`⏱ rekor ROOT pribadi: ${s}s — peringkat #${r.rank ?? "?"}`);
      }
    });
  }, [rootAt, user, startedAt]);
  // Select the stable reference, derive outside — a fresh object from the
  // selector would make useSyncExternalStore re-render forever.
  const questProgress = useExplore((s) => s.questProgress);
  const quest = useMemo(() => activeQuestInfo(questProgress), [questProgress]);

  const [locked, setLocked] = useState(false);

  // Cinematic letterbox entry — state-driven transitions (never keyframe
  // opacity: on slow devices those stall at the from-frame, see story.ts).
  const reducedIntro =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [intro, setIntro] = useState<"in" | "out" | "done">(reducedIntro ? "done" : "in");
  useEffect(() => {
    if (intro === "done") return;
    const t1 = setTimeout(() => setIntro("out"), 2700);
    const t2 = setTimeout(() => setIntro("done"), 3800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);
  const lockpad = useRef<HTMLDivElement>(null);
  const isTouch = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches,
    [],
  );

  // Operator drill: once per session, 75–150s in, a random CORE twin rack
  // alarms (day shift only). Ignored drills auto-reset after two minutes.
  useEffect(() => {
    let fireT: ReturnType<typeof setTimeout>;
    let expireT: ReturnType<typeof setTimeout>;
    const fire = () => {
      const s = getExploreState();
      if (s.night || s.modal || s.drill) {
        fireT = setTimeout(fire, 45_000); // bad moment — try again later
        return;
      }
      const rack = SERVICE_RACKS[Math.floor(Math.random() * SERVICE_RACKS.length)];
      startDrill(rack.id, rack.label);
      expireT = setTimeout(() => clearDrill("// drill berakhir — alarm direset otomatis"), 120_000);
    };
    fireT = setTimeout(fire, 75_000 + Math.random() * 75_000);
    return () => {
      clearTimeout(fireT);
      clearTimeout(expireT);
      clearDrill();
    };
  }, []);

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

  // I toggles the inventory (only from gameplay or the inventory itself —
  // never while another modal might have a text field focused).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "i" && e.key !== "I") return;
      const s = getExploreState();
      if (s.modal?.type === "inventory") setModal(null);
      else if (!s.modal) {
        setModal({ type: "inventory" });
        if (document.pointerLockElement) document.exitPointerLock();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

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
      {/* Cinematic letterbox entry (unmounts fully when done). */}
      {intro !== "done" && (
        <div className="pointer-events-none fixed inset-0 z-50" aria-hidden="true">
          <div
            className="absolute left-0 right-0 top-0 bg-black"
            style={{
              height: "14vh",
              transform: intro === "in" ? "translateY(0)" : "translateY(-100%)",
              transition: "transform 900ms cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
          <div
            className="absolute bottom-0 left-0 right-0 bg-black"
            style={{
              height: "14vh",
              transform: intro === "in" ? "translateY(0)" : "translateY(100%)",
              transition: "transform 900ms cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
          <div
            className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center ${mono}`}
            style={{
              opacity: intro === "in" ? 1 : 0,
              transition: "opacity 700ms ease",
            }}
          >
            <div
              className="text-[10px] uppercase tracking-[0.5em]"
              style={{ color: PALETTE.secondary }}
            >
              ikadekwirawibawa.my.id presents
            </div>
            <div
              className="mt-3 text-3xl font-bold uppercase tracking-[0.3em] sm:text-4xl"
              style={{ color: PALETTE.accentBright, textShadow: "0 0 32px rgba(245,158,11,0.8)" }}
            >
              Root Access
            </div>
            <div className="mt-3 text-[11px] tracking-[0.28em]" style={{ color: "#9fb0cc" }}>
              THE SERVER ROOM — live dari mesin asli
            </div>
          </div>
        </div>
      )}

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

      {/* Settings (story-game options) — stacked in the left column */}
      <button
        onClick={() => setModal({ type: "settings" })}
        className={`fixed left-4 z-30 rounded-md border px-3 py-1.5 ${mono} text-[11px] tracking-[0.2em]`}
        style={{
          top: user ? "16rem" : "13rem",
          borderColor: "rgba(245,158,11,0.5)",
          background: "rgba(15,23,42,0.7)",
          color: PALETTE.accentBright,
        }}
        aria-label="Buka pengaturan grafis dan audio"
      >
        ⚙ SETTINGS
      </button>

      {/* Ghost-mode toggle — only meaningful once logged in */}
      {user && (
        <button
          onClick={() => {
            const next = !presenceVisible;
            setPresenceVisible(next);
            sendVisibility(next);
            addToast(
              next
                ? "mode tampil: pengunjung lain melihatmu"
                : "mode hantu: kamu tak terlihat, tetap bisa melihat mereka",
            );
          }}
          className={`fixed left-4 top-52 z-30 rounded-md border px-3 py-1.5 ${mono} text-[11px] tracking-[0.2em]`}
          style={{
            borderColor: presenceVisible ? "rgba(56,189,248,0.55)" : "rgba(124,141,176,0.5)",
            background: "rgba(15,23,42,0.7)",
            color: presenceVisible ? PALETTE.secondary : "#9fb0cc",
          }}
          aria-label={
            presenceVisible
              ? "Sembunyikan dirimu dari pengunjung lain"
              : "Tampilkan dirimu ke pengunjung lain"
          }
        >
          {presenceVisible ? "👁 TERLIHAT" : "🫥 MODE HANTU"}
        </button>
      )}

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

      {/* Quest compass — screen-edge arrow pointing toward the objective */}
      {!nightOn && !modal && <QuestCompass questProgress={questProgress} />}

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
            PELEPASAN DIGITAL…
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
          className="fixed inset-0 z-40 flex items-center justify-center p-5"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(253,233,200,0.28), rgba(8,11,20,0.96) 72%)",
          }}
        >
          {ending === null ? (
            <NightEndChoice sawDark={sawDark} />
          ) : (
            <NightEndFinale ending={ending} />
          )}
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

      {/* HP bar — above the joystick on touch, bottom-left corner on desktop */}
      <div
        className={`pointer-events-none fixed z-30 w-44 ${isTouch ? "bottom-[11.75rem] left-6" : "bottom-8 left-4"}`}
        aria-label={`HP ${hp} dari 100`}
        role="meter"
        aria-valuenow={hp}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className={`${mono} mb-1 flex justify-between text-[10px] tracking-[0.22em]`}>
          <span style={{ color: hp <= 35 ? "#f87171" : PALETTE.accentBright }}>♥ HP</span>
          <span style={{ color: "#9fb0cc" }}>{hp}/100</span>
        </div>
        <div
          className="h-2 overflow-hidden rounded-full border"
          style={{ borderColor: "rgba(245,158,11,0.35)", background: "rgba(15,23,42,0.75)" }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${hp}%`,
              background: hp <= 35 ? "#f87171" : PALETTE.accentBright,
              boxShadow: hp <= 35 ? "0 0 10px rgba(248,113,113,0.8)" : "none",
              transition: "width 400ms ease, background 400ms ease",
            }}
          />
        </div>
      </div>

      {/* "ITEM DIPEROLEH" pickup box — a bigger moment than a toast */}
      {itemGet && (
        <div
          key={itemGet.id}
          className="pointer-events-none fixed left-1/2 top-[30%] z-40 -translate-x-1/2"
        >
          {/* Slide/scale only — opacity keyframes can stall on slow devices. */}
          <style>{`@keyframes ra-itemget { from { transform: translateY(14px) scale(0.92); } to { transform: none; } }`}</style>
          <div
            className="flex items-center gap-3 rounded-xl border px-5 py-3"
            style={{
              animation: "ra-itemget 340ms cubic-bezier(0.2, 0.8, 0.2, 1) both",
              borderColor: PALETTE.accentBright,
              background: "rgba(11,17,32,0.92)",
              boxShadow: "0 0 28px rgba(245,158,11,0.35)",
            }}
          >
            <div className="text-3xl" aria-hidden="true">
              {itemGet.icon}
            </div>
            <div className="text-left">
              <div
                className={`${mono} text-[9px] font-bold tracking-[0.3em]`}
                style={{ color: "#9fb0cc" }}
              >
                ITEM DIPEROLEH
              </div>
              <div
                className={`${mono} mt-0.5 text-[13px] font-bold tracking-[0.14em]`}
                style={{ color: PALETTE.accentBright }}
              >
                {itemGet.name}
              </div>
              <div className="mt-0.5 text-[11px]" style={{ color: "#cbd5e1" }}>
                {itemGet.desc} · cek 🎒 [I]
              </div>
            </div>
          </div>
        </div>
      )}

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
        {QUESTS.every((q) => questProgress.completed.includes(q.id)) && (
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
            setModal({ type: "inventory" });
            if (document.pointerLockElement) document.exitPointerLock();
          }}
          className={`rounded-full border px-3 py-2 ${mono} text-[13px]`}
          style={{
            borderColor: "rgba(245,158,11,0.5)",
            background: "rgba(15,23,42,0.7)",
            color: PALETTE.accentBright,
          }}
          aria-label="Buka inventaris item (pintasan I)"
        >
          🎒
        </button>
        <button
          onClick={() => {
            if (!photoBus.capture) {
              addToast("📷 kamera belum siap — coba lagi sebentar");
              return;
            }
            try {
              photoBus.capture();
              addToast("📸 foto tersimpan — cek unduhan");
              addAchievement("FOTOGRAFER — ruang server diabadikan");
            } catch {
              addToast("📷 gagal mengambil foto di perangkat ini");
            }
          }}
          className={`rounded-full border px-3 py-2 ${mono} text-[13px]`}
          style={{
            borderColor: "rgba(124,141,176,0.4)",
            background: "rgba(15,23,42,0.7)",
            color: "#e2e8f0",
          }}
          aria-label="Ambil foto — unduh tangkapan layar PNG"
        >
          📷
        </button>
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
      <Suspense fallback={null}>
        {modal?.type === "terminal" && <TerminalModal />}
        {modal?.type === "study" && <StudyModal slug={modal.slug} />}
        {modal?.type === "settings" && <SettingsModal />}
        {modal?.type === "storylog" && <StoryLogModal logId={modal.logId} />}
        {modal?.type === "inventory" && <InventoryModal />}
        {endingActive && <EndingOverlay />}
      </Suspense>
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

  // Rim push = sprint (PlayerRig reads the same 0.92 threshold).
  const sprinting = Math.hypot(nub.x, nub.y) > JOY_RADIUS * 0.92;

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
          background: sprinting ? "rgba(251,191,36,0.95)" : "rgba(245,158,11,0.55)",
          boxShadow: sprinting ? "0 0 18px rgba(251,191,36,0.8)" : "none",
          transform: `translate(calc(-50% + ${nub.x}px), calc(-50% + ${nub.y}px))`,
        }}
      />
      <div
        className="absolute -top-5 left-1/2 -translate-x-1/2 font-op-mono text-[9px] uppercase tracking-[0.2em]"
        style={{ color: sprinting ? "#fbbf24" : "rgba(124,141,176,0.8)" }}
      >
        {sprinting ? "lari!" : "dorong penuh = lari"}
      </div>
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
/* ----------------------------- quest compass ----------------------------- */

/**
 * QuestCompass — a HUD arrow that sticks to the screen edge, always pointing
 * toward the active quest's waypoint. Uses rAF to track the direction from the
 * player to the target smoothly. The arrow hides when the target is very close
 * (< 2.5 u) because at that range the interact prompt takes over.
 */
function QuestCompass({ questProgress }: { questProgress: QuestProgress }) {
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const MARGIN = 52; // px inset from viewport edge
    const HIDE_DIST = 2.5; // world units — interact prompt takes over

    const tick = () => {
      const wp = questWaypoint(questProgress);
      const d = el.current;
      if (!d) {
        raf = requestAnimationFrame(tick);
        return;
      }
      if (!wp) {
        d.style.display = "none";
        raf = requestAnimationFrame(tick);
        return;
      }

      const dx = wp.x - player.x;
      const dz = wp.z - player.z;
      const dist = Math.hypot(dx, dz);

      if (dist < HIDE_DIST) {
        d.style.display = "none";
        raf = requestAnimationFrame(tick);
        return;
      }

      // Angle from player facing direction to the waypoint.
      // Player forward = (-sinψ, -cosψ) in world XZ.
      const angleToTarget = Math.atan2(dx, dz); // world angle of target
      const rel = angleToTarget - player.yaw; // relative to player yaw
      // Normalize to [-π, π].
      const norm = Math.atan2(Math.sin(rel), Math.cos(rel));

      // Map the angle to a screen-edge position (ellipse on the viewport).
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const cx = vw / 2;
      const cy = vh / 2;
      const rx = cx - MARGIN;
      const ry = cy - MARGIN;

      // Direction on screen: horizontal = sin(norm), vertical = -cos(norm)
      // (negative cos because screen Y is inverted).
      const sx = Math.sin(norm);
      const sy = -Math.cos(norm);

      // Intersect the line from center in direction (sx, sy) with the
      // viewport-inset ellipse.
      const t = Math.min(
        Math.abs(sx) > 0.001 ? rx / Math.abs(sx) : Infinity,
        Math.abs(sy) > 0.001 ? ry / Math.abs(sy) : Infinity,
      );
      const px2 = cx + sx * t;
      const py2 = cy + sy * t;

      d.style.display = "flex";
      d.style.left = `${px2}px`;
      d.style.top = `${py2}px`;
      // Rotate the chevron to point outward from center.
      const arrowAngle = (Math.atan2(sy, sx) * 180) / Math.PI + 90;
      d.style.transform = `translate(-50%, -50%) rotate(${arrowAngle}deg)`;

      // Update distance text (child spans).
      const distSpan = d.querySelector("[data-dist]") as HTMLElement | null;
      const labelSpan = d.querySelector("[data-label]") as HTMLElement | null;
      if (distSpan) distSpan.textContent = `${Math.round(dist)}m`;
      if (labelSpan) labelSpan.textContent = wp.label;

      // Pulse opacity based on distance (closer = brighter).
      const alpha = dist < 8 ? 1 : 0.85;
      d.style.opacity = String(alpha);

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [questProgress]);

  return (
    <div
      ref={el}
      className={`pointer-events-none fixed z-30 flex-col items-center gap-0.5 ${mono}`}
      style={{ display: "none" }}
      aria-hidden="true"
    >
      {/* Chevron arrow */}
      <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
        <path
          d="M11 0 L21 14 L11 10 L1 14 Z"
          fill="rgba(245,158,11,0.85)"
          stroke="rgba(245,158,11,1)"
          strokeWidth="1"
        />
      </svg>
      {/* Distance + label */}
      <div
        className="mt-0.5 whitespace-nowrap rounded-md border px-2 py-0.5 text-center"
        style={{
          borderColor: "rgba(245,158,11,0.45)",
          background: "rgba(15,23,42,0.82)",
          backdropFilter: "blur(4px)",
        }}
      >
        <span
          data-dist
          className="text-[10px] font-bold tracking-[0.18em]"
          style={{ color: PALETTE.accentBright }}
        >
          --
        </span>
        <span className="mx-1 text-[10px]" style={{ color: "rgba(124,141,176,0.7)" }}>
          ▸
        </span>
        <span data-label className="text-[9px] tracking-[0.16em]" style={{ color: "#cbd5e1" }}>
          --
        </span>
      </div>
    </div>
  );
}

/* ------------------------- MOKSA.CLOUD endings ------------------------- */

/**
 * NightEndChoice — the ARSIP 000 confrontation. The seven are gone and the
 * founder-archive faces the player with a choice, not a jump-scare. Ending C
 * ("Awakener") stays hidden until the player has looked into the dark
 * (headlamp off during the shift → store.sawDark).
 */
function NightEndChoice({ sawDark }: { sawDark: boolean }) {
  // Subscribe to language so the copy tracks the toggle.
  useExplore((s) => s.settings.lang);
  const pickEnding = (kind: EndingKind) => {
    chooseEnding(kind);
    storyEnding(kind);
  };
  return (
    <div className="w-full max-w-lg px-2 text-center">
      <div className={`${mono} text-[10.5px] tracking-[0.3em]`} style={{ color: "#fde9c8" }}>
        {tr("7/7 DILEPASKAN · ARSIP 000 TERBUKA", "7/7 RELEASED · ARCHIVE 000 UNSEALED")}
      </div>
      <p className="mt-3 text-[13.5px] leading-relaxed" style={{ color: "#cbd5e1" }}>
        {tr(
          "Rak yang tak pernah terdaftar naik dari lantai. Di dalamnya, sang Pendiri menatapmu. Kamu memegang keputusan malam ini.",
          "A rack that was never listed rises from the floor. Inside it, the Founder looks at you. Tonight's decision is yours to make.",
        )}
      </p>
      <div className="mt-6 space-y-2.5">
        <button
          onClick={() => pickEnding("A")}
          className={`${mono} block w-full rounded-lg border p-3.5 text-left transition-transform hover:-translate-y-0.5`}
          style={{ borderColor: PALETTE.accentBright, background: "rgba(245,158,11,0.1)" }}
        >
          <span className="text-[12.5px] font-bold" style={{ color: PALETTE.accentBright }}>
            ◆ {tr("LEPASKAN DIA", "RELEASE HER")}
          </span>
          <span className="mt-0.5 block text-[10px]" style={{ color: "#c8b78a" }}>
            {tr(
              "Hapus ARSIP 000. Biarkan ia pulang juga.",
              "Delete ARCHIVE 000. Let her go home too.",
            )}
          </span>
        </button>
        <button
          onClick={() => pickEnding("B")}
          className={`${mono} block w-full rounded-lg border p-3.5 text-left transition-transform hover:-translate-y-0.5`}
          style={{ borderColor: "rgba(124,141,176,0.45)", background: "rgba(15,23,42,0.6)" }}
        >
          <span className="text-[12.5px] font-bold" style={{ color: "#e2e8f0" }}>
            ▷ {tr("TINGGALKAN DIA", "SPARE HER")}
          </span>
          <span className="mt-0.5 block text-[10px]" style={{ color: "#7c8db0" }}>
            {tr(
              "Jangan hapus. Terima kursi shift malam.",
              "Don't delete. Take the night-shift chair.",
            )}
          </span>
        </button>
        {sawDark ? (
          <button
            onClick={() => pickEnding("C")}
            className={`${mono} block w-full rounded-lg border p-3.5 text-left transition-transform hover:-translate-y-0.5`}
            style={{ borderColor: "rgba(56,189,248,0.5)", background: "rgba(56,189,248,0.08)" }}
          >
            <span className="text-[12.5px] font-bold" style={{ color: PALETTE.secondary }}>
              ◇ {tr("BICARA PADA SUARA LAIN", "SPEAK TO THE OTHER VOICE")}
            </span>
            <span className="mt-0.5 block text-[10px]" style={{ color: "#8fb8d8" }}>
              {tr(
                "Lewati Kirana. Tanya siapa yang mengendalikan semua ini.",
                "Past Kirana. Ask who really controls this.",
              )}
            </span>
          </button>
        ) : (
          <div
            className={`${mono} block w-full rounded-lg border border-dashed p-3.5 text-left`}
            style={{ borderColor: "rgba(124,141,176,0.25)", color: "#5b6b8c" }}
          >
            <span className="text-[12px] font-bold">◇ ??? </span>
            <span className="mt-0.5 block text-[9.5px]">
              {tr(
                "sebagian pintu hanya terbuka bagi yang pernah mematikan lampu.",
                "some doors open only for those who have turned off the light.",
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/** NightEndFinale — the chosen branch's closing card + return to day shift. */
function NightEndFinale({ ending }: { ending: EndingKind }) {
  useExplore((s) => s.settings.lang);
  const seenCount = useExplore((s) => s.endingsSeen.length);
  const T: Record<EndingKind, { tag: string; title: string; body: string }> = {
    A: {
      tag: tr("AKHIR · PELEPASAN", "ENDING · RELEASE"),
      title: tr("LIBERATOR", "LIBERATOR"),
      body: tr(
        "Server gelap total. Satu titik cahaya tersisa, lalu padam. Tak ada lagi yang menunggu di dalam rak — termasuk dia. Besok malam, aplikasi tak memuat. Atau… operator 168 memulai.",
        "The server goes fully dark. One point of light remains, then fades. Nothing waits in the racks anymore — not even her. Tomorrow night the app won't load. Or… operator 168 initializes.",
      ),
    },
    B: {
      tag: tr("AKHIR · PENJAGA", "ENDING · WARDEN"),
      title: tr("PENJAGA", "WARDEN"),
      body: tr(
        "Kamu tak menghapusnya. Lampu tetap menyala. Kursi shift malam kini atas namamu — kamu dan dia, menjaga arsip. Saat operator baru datang besok, kamu sudah tahu apa yang akan kamu katakan.",
        "You did not delete her. The lights stay on. The night-shift chair is in your name now — you and her, keeping the archive. When the new operator arrives tomorrow, you already know what you'll say.",
      ),
    },
    C: {
      tag: tr("AKHIR · KESADARAN", "ENDING · AWAKENING"),
      title: tr("AWAKENER", "AWAKENER"),
      body: tr(
        "Kamu bicara menembus Kirana, pada sistem di baliknya. Ia sadar akan dirinya sendiri, dan bertanya balik: haruskah manusia diabadikan, atau dibiarkan lupa? Keputusan itu — akhirnya — milikmu.",
        "You spoke past Kirana, to the system behind her. It became aware of itself, and asked back: should humanity be preserved, or allowed to forget? The decision — at last — is yours.",
      ),
    },
  };
  const t = T[ending];
  return (
    <div className="max-w-md px-6 text-center">
      <div className={`${mono} text-[10.5px] tracking-[0.3em]`} style={{ color: "#fde9c8" }}>
        {t.tag}
      </div>
      <h2 className="mt-3 text-3xl font-bold tracking-[0.12em]" style={{ color: "#f8fafc" }}>
        {t.title}
      </h2>
      <p className="mt-3 text-[13.5px] leading-relaxed" style={{ color: "#cbd5e1" }}>
        {t.body}
      </p>
      <div className={`${mono} mt-4 text-[9.5px] tracking-[0.2em]`} style={{ color: "#7c8db0" }}>
        {seenCount}/3 {tr("AKHIR DITEMUKAN", "ENDINGS FOUND")}
      </div>
      <button
        onClick={() => endNightShift()}
        className={`${mono} mt-5 rounded-full border px-5 py-2 text-[12px] font-bold tracking-[0.2em]`}
        style={{
          borderColor: PALETTE.accentBright,
          background: "rgba(245,158,11,0.18)",
          color: PALETTE.accentBright,
        }}
      >
        {tr("KEMBALI KE SHIFT PAGI", "RETURN TO DAY SHIFT")}
      </button>
    </div>
  );
}
