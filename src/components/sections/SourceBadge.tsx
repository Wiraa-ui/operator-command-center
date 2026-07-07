import type { SkillSource } from "@/content/skills";
import { sourceLabel } from "@/content/skills";

const cls: Record<SkillSource, string> = {
  otodidak: "border-op-accent/60 text-op-accent bg-op-accent-soft",
  sekolah: "border-op-line text-op-text-2",
  internship: "border-op-line text-op-text-2",
  project: "border-op-line text-op-text-2",
};

export function SourceBadge({ source }: { source: SkillSource }) {
  return (
    <span
      className={`inline-flex items-center rounded border px-1.5 py-[1px] font-op-mono text-[10px] uppercase tracking-wider ${cls[source]}`}
    >
      {sourceLabel[source]}
    </span>
  );
}
