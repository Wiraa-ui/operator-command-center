import { useEffect, useMemo } from "react";
import { PALETTE } from "../types";
import { speak, stopSpeaking, type Speaker } from "./nightshift/voice";
import { NPCS, QUESTS, startQuest, type NpcId } from "./rpg";
import { getExploreState, setModal, useExplore } from "./store";

/**
 * NpcModal — day-shift dialogue. The talk quest-event has already fired by
 * the time this renders (triggerInteract emits before opening the modal), so
 * lines are computed *after* any step completion — an NPC reacts to what you
 * just reported. First line is spoken aloud with the NPC's voice persona.
 */

const mono = "var(--font-op-mono, monospace)";

interface Script {
  lines: string[];
  /** Quest offer, when this NPC has one available right now. */
  offer?: { questId: string; label: string };
}

function scriptFor(npcId: NpcId): Script {
  const p = getExploreState().questProgress;
  const started = (q: string) => p.active[q] !== undefined;
  const done = (q: string) => p.completed.includes(q);
  const stepOf = (q: string) => p.active[q] ?? -1;

  if (npcId === "npc:ayu") {
    if (done("q-orientasi")) {
      if (!done("q-sinyal")) {
        return {
          lines: [
            "Orientasimu beres! Oh ya — Putu di NOC dari tadi panik soal 'derau aneh' di monitornya.",
            "NOC itu pintu di dinding utara LAB. Jawaban teka-tekinya gampang kok… kamu kan tahu port HTTPS.",
          ],
        };
      }
      return {
        lines: [
          "Kamu betah juga di gedung ini, ya. Para tamu online lain juga sering mampir — coba login badge biar saling kelihatan.",
          "…Kalau lembur sampai malam, matikan lampumu kalau dengar statis. Percaya deh.",
        ],
      };
    }
    if (started("q-orientasi")) {
      return {
        lines: [
          stepOf("q-orientasi") === 0
            ? "Belum baca dossier proyeknya? Rak-rak di lorong ini bisa dibaca — dekati, lalu tekan E."
            : "Dossier sudah, tinggal lapor ke Bli Gede. Pintu bengkel ada di dinding barat lorong, agak ke dalam.",
        ],
      };
    }
    return {
      lines: [
        "Selamat datang di ruang server ikadekwirawibawa.my.id — kamu operator baru itu, kan?",
        "Aku Ayu, front desk shift satu. Sebelum dilepas sendirian, ada SOP orientasi singkat: kenali mesinnya, kenali orangnya.",
      ],
      offer: { questId: "q-orientasi", label: "Terima tugas ORIENTASI" },
    };
  }

  if (npcId === "npc:gede") {
    if (done("q-kandidat")) {
      return {
        lines: [
          "Rekomendasimu sudah kukirim… langsung ke meja Ibu Direktur.",
          "Saranku: kalau dia mengundangmu meninjau 'arsip pelestarian' — datanglah siang. Jangan malam. Jangan sendirian.",
        ],
      };
    }
    if (started("q-kandidat")) {
      return {
        lines: [
          stepOf("q-kandidat") === 0
            ? "Terminal CORE butuh root. Kode aksesnya… operator teliti selalu menemukannya tercetak di suatu tempat di LAB."
            : "Tinggal satu perintah: sudo hire-me. Direktur suka orang yang berani eskalasi.",
        ],
      };
    }
    if (done("q-orientasi")) {
      return {
        lines: [
          "Jadi kamu anak baru yang dikirim Ayu. Bagus, kamu membaca dossier dulu — kebanyakan orang cuma lihat sampulnya.",
          "Dengar. Aku teknisi terakhir yang tersisa dari tim lama. Kalau kamu memang serius mau kerja di sini, buktikan lewat jalur resmi.",
        ],
        offer: { questId: "q-kandidat", label: "Terima tugas REKOMENDASI DIREKTUR" },
      };
    }
    return {
      lines: [
        "Hmm? Tamu jarang sampai bengkel. Aku Gede — aku merawat semua yang berderit di gedung ini.",
        "Kalau Ayu memberimu SOP orientasi, selesaikan dulu. Aku tidak menerima laporan dari orang yang belum membaca apa pun.",
      ],
    };
  }

  // npc:putu
  if (done("q-sinyal")) {
    return {
      lines: [
        "Jadi derau itu datang dari rak arsip lama?! Kak… itu bukan kerusakan. Polanya pentatonik. Seperti gamelan.",
        "Kalau kakak berani: malam-malam, buka terminal di CORE, ketik ls. Ada direktori yang tak pernah kami buat. Jangan bilang siapa-siapa.",
      ],
    };
  }
  if (started("q-sinyal")) {
    const s = stepOf("q-sinyal");
    return {
      lines: [
        s === 0
          ? "Mulai dari patch panel di ujung dalam AISLE-A — yang paling gelap, maaf ya."
          : s === 1
            ? "Lanjut ke panel LAB, dinding selatan. Dengar baik-baik derau-nya."
            : s === 2
              ? "Terakhir panel CORE, pojok selatan. Hati-hati, di sana sinyalnya paling kuat."
              : "Sudah tiga-tiganya? Ceritakan semuanya!",
      ],
    };
  }
  return {
    lines: [
      "Kak! Kakak operator baru, kan? Aku Putu, intern monitoring. Monitor tiga menangkap derau aneh tiap tengah malam — polanya berulang, seperti… musik?",
      "Aku tidak boleh meninggalkan NOC. Tolong periksa tiga patch panel: AISLE, LAB, CORE. Kumohon?",
    ],
    offer: { questId: "q-sinyal", label: "Terima tugas SINYAL HANTU" },
  };
}

export function NpcModal({ npcId }: { npcId: NpcId }) {
  const npc = NPCS.find((n) => n.id === npcId);
  // Re-run the script when quest progress changes (accepting shows reminder).
  const progress = useExplore((s) => s.questProgress);
  const script = useMemo(() => scriptFor(npcId), [npcId, progress]);
  const muted = useExplore((s) => s.muted);

  useEffect(() => {
    if (!muted && script.lines[0] && npc) {
      speak(script.lines.join(" "), npcId.slice("npc:".length) as Speaker);
    }
    return () => stopSpeaking();
    // Speak once per open, not on every progress tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [npcId]);

  if (!npc) return null;
  const offer = script.offer;
  const offerDef = offer ? QUESTS.find((q) => q.id === offer.questId) : undefined;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 p-4 pb-10 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Dialog dengan ${npc.name}`}
        className="w-full max-w-lg rounded-xl border p-6"
        style={{
          borderColor: "rgba(56,189,248,0.45)",
          background: "rgba(15,23,42,0.95)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 40px rgba(56,189,248,0.1)",
          fontFamily: mono,
        }}
      >
        <div className="flex items-baseline gap-3">
          <span className="text-[15px] font-bold" style={{ color: PALETTE.accentBright }}>
            {npc.name}
          </span>
          <span className="text-[9px] tracking-[0.24em]" style={{ color: PALETTE.secondary }}>
            {npc.title}
          </span>
        </div>

        <div className="mt-4 space-y-3 text-[13.5px] leading-relaxed" style={{ color: "#e2e8f0" }}>
          {script.lines.map((l, i) => (
            <p key={i}>“{l}”</p>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          {offer && offerDef && (
            <button
              onClick={() => {
                startQuest(offer.questId);
                setModal(null);
              }}
              className="rounded-md px-4 py-2 text-[12px] font-bold uppercase tracking-wider"
              style={{ background: PALETTE.accent, color: PALETTE.bg }}
            >
              📜 {offer.label}
            </button>
          )}
          <button
            onClick={() => setModal(null)}
            className="rounded-md border px-4 py-2 text-[12px] uppercase tracking-[0.16em]"
            style={{ borderColor: "rgba(124,141,176,0.5)", color: "#9fb0cc" }}
          >
            {offer ? "nanti dulu" : "sampai nanti"}
          </button>
        </div>
      </div>
    </div>
  );
}
