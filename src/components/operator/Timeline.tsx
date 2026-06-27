import type { JourneyEntry, JourneyCategory } from "@/content/journey";

const catLabel: Record<JourneyCategory, string> = {
  education: "education",
  experience: "experience",
  achievement: "achievement",
  skills: "skills",
};

const catCls: Record<JourneyCategory, string> = {
  education: "text-op-text-2 border-op-line",
  experience: "text-op-accent border-op-accent/60",
  achievement: "text-op-success border-op-success/60",
  skills: "text-op-warning border-op-warning/60",
};

export function Timeline({ entries }: { entries: JourneyEntry[] }) {
  return (
    <ol className="relative ml-3 border-l border-op-line">
      {entries.map((e, i) => (
        <li key={i} className="relative pl-6 pb-8 last:pb-0">
          {/* marker */}
          <span
            aria-hidden="true"
            className={`absolute -left-[5px] top-1 inline-block h-2.5 w-2.5 rounded-full ${
              e.current ? "bg-op-accent op-pulse-marker" : "bg-op-surface-2 ring-1 ring-op-line"
            }`}
          />
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-op-mono text-[12px] text-op-text-3">{e.period}</span>
            <span
              className={`inline-flex items-center rounded border px-1.5 py-[1px] font-op-mono text-[10px] uppercase tracking-wider ${catCls[e.category]}`}
            >
              {catLabel[e.category]}
            </span>
            {e.current ? (
              <span className="font-op-mono text-[10px] uppercase tracking-wider text-op-accent">
                current
              </span>
            ) : null}
          </div>
          <h3 className="mt-1.5 text-[18px] font-semibold text-op-text">{e.title}</h3>
          <p className="mt-1 max-w-[65ch] text-[14.5px] leading-[1.6] text-op-text-2">
            {e.description}
          </p>
        </li>
      ))}
    </ol>
  );
}
