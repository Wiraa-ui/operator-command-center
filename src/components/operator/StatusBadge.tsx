import type { ProjectStatus } from "@/content/projects";

const config: Record<
  ProjectStatus,
  { label: string; srLabel: string; cls: string; pulse: boolean }
> = {
  live: {
    label: "LIVE",
    srLabel: "Status: live",
    cls: "bg-op-success-soft text-op-success border-op-success/60",
    pulse: true,
  },
  "in-progress": {
    label: "IN PROGRESS",
    srLabel: "Status: in progress",
    cls: "bg-op-warning-soft text-op-warning border-op-warning/60",
    pulse: false,
  },
  deployed: {
    label: "DEPLOYED",
    srLabel: "Status: deployed",
    cls: "bg-op-success-soft text-op-success border-op-success/60",
    pulse: false,
  },
  delivered: {
    label: "DELIVERED",
    srLabel: "Status: delivered",
    cls: "bg-op-surface-2 text-op-text border-op-line",
    pulse: false,
  },
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const c = config[status];
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-0.5 font-op-mono text-[11px] font-medium tracking-wider ${c.cls}`}
    >
      <span className="sr-only">{c.srLabel}</span>
      <span
        aria-hidden="true"
        className={`inline-block h-1.5 w-1.5 rounded-full bg-current ${c.pulse ? "op-pulse-live" : ""}`}
      />
      [{c.label}]
    </span>
  );
}
