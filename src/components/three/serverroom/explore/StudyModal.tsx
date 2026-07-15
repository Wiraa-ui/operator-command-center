import { projectBySlug } from "@/content/projects";
import { PALETTE } from "../types";
import { setModal } from "./store";

/**
 * StudyModal — in-game case-study reader. Walk to a project rack, press E,
 * and the study opens as a terminal dossier right on screen (no navigation,
 * the room keeps humming behind it). Full page stays one link away.
 */

const mono = "var(--font-op-mono, monospace)";

const h2Style: React.CSSProperties = {
  margin: "22px 0 6px",
  fontSize: 11,
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color: PALETTE.accentBright,
  fontFamily: mono,
};

export function StudyModal({ slug }: { slug: string }) {
  const p = projectBySlug(slug);
  if (!p) {
    setModal(null);
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Studi kasus ${p.title}`}
        className="flex max-h-[82vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border"
        style={{
          borderColor: "rgba(245,158,11,0.45)",
          background: "rgba(15,23,42,0.96)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.65), 0 0 40px rgba(245,158,11,0.1)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between gap-4 border-b px-6 py-4"
          style={{ borderColor: "rgba(245,158,11,0.25)" }}
        >
          <div>
            <div
              className="text-[10px] uppercase tracking-[0.24em]"
              style={{ color: PALETTE.accentBright, fontFamily: mono }}
            >
              // dossier · {p.status}
            </div>
            <h2 className="mt-1 text-xl font-bold text-slate-50">{p.title}</h2>
            <p className="mt-1 text-[13px] leading-relaxed text-slate-400">{p.tagline}</p>
          </div>
          <button
            onClick={() => setModal(null)}
            className="shrink-0 rounded-md border px-2.5 py-1 text-[12px]"
            style={{ borderColor: "rgba(124,141,176,0.4)", color: "#9fb0cc", fontFamily: mono }}
            aria-label="Tutup studi kasus"
          >
            ESC ✕
          </button>
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 text-[13.5px] leading-relaxed text-slate-300">
          <div className="mt-4 flex flex-wrap gap-1.5">
            {p.stack.map((t) => (
              <span
                key={t}
                className="rounded-full border px-2.5 py-0.5 text-[10.5px]"
                style={{
                  borderColor: "rgba(56,189,248,0.35)",
                  color: "#7dd3fc",
                  background: "rgba(56,189,248,0.1)",
                  fontFamily: mono,
                }}
              >
                {t}
              </span>
            ))}
          </div>

          <div style={h2Style}>// overview</div>
          <p>{p.overview}</p>

          <div style={h2Style}>// problem</div>
          <p>{p.problem}</p>

          <div style={h2Style}>// architecture</div>
          <pre
            className="overflow-x-auto rounded-lg border p-3 text-[11px] leading-snug"
            style={{
              borderColor: "rgba(56,189,248,0.25)",
              color: "#7dd3fc",
              background: "rgba(2,6,23,0.6)",
              fontFamily: mono,
            }}
          >
            {p.architecture}
          </pre>

          <div style={h2Style}>// components</div>
          <ul className="space-y-1.5">
            {p.components.map((c) => (
              <li key={c.name}>
                <span style={{ color: PALETTE.accentBright, fontFamily: mono }}>{c.name}</span> —{" "}
                {c.reason}
              </li>
            ))}
          </ul>

          <div style={h2Style}>// lessons</div>
          <p>{p.lessons}</p>

          <a
            href={`/projects/${p.slug}`}
            className="mt-6 inline-block rounded-md px-4 py-2 text-[12px] font-bold uppercase tracking-wider"
            style={{ background: PALETTE.accent, color: PALETTE.bg, fontFamily: mono }}
          >
            halaman penuh →
          </a>
        </div>
      </div>
    </div>
  );
}
