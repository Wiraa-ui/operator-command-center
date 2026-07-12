import { Link } from "@tanstack/react-router";
import { StatusBadge } from "./StatusBadge";
import { TechPillRow } from "./TechPill";
import { ArchDiagram } from "./ArchDiagram";
import type { Project } from "@/content/projects";

/**
 * Flagship project block — used only on the homepage to give the lead
 * project disproportionate visual weight. Full-width feature, two-column
 * on desktop, accent-marked border + glow.
 */
export function FlagshipProject({ project }: { project: Project }) {
  return (
    <article
      className="op-glass relative overflow-hidden rounded-[32px] p-8 shadow-[0_0_80px_-20px_var(--color-op-accent-glow)] sm:p-12 lg:p-14 transition-all duration-500 ease-out hover:shadow-[0_0_100px_-10px_var(--color-op-accent-glow)]"
      aria-labelledby="flagship-title"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none"
      />
      <span aria-hidden="true" className="absolute left-0 top-0 h-full w-[3px] bg-op-accent" />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="font-op-mono text-[11px] uppercase tracking-[0.2em] text-op-accent">
            // flagship system
          </span>
        </div>
        <StatusBadge status={project.status} />
      </div>

      <h2
        id="flagship-title"
        className="mt-4 text-[32px] font-semibold leading-[1.15] text-op-text sm:text-[40px]"
      >
        {project.title}
      </h2>
      <p className="mt-3 max-w-[58ch] text-[18px] leading-[1.6] text-op-text-2">
        {project.tagline}
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.05fr_1fr]">
        <div className="flex min-w-0 flex-col gap-5">
          <div>
            <h3 className="font-op-mono text-[11px] uppercase tracking-[0.18em] text-op-text-3">
              The operational gap
            </h3>
            <p className="mt-2 text-[15.5px] leading-[1.65] text-op-text-2">{project.problem}</p>
          </div>
          <div>
            <h3 className="font-op-mono text-[11px] uppercase tracking-[0.18em] text-op-text-3">
              What it does
            </h3>
            <p className="mt-2 text-[15.5px] leading-[1.65] text-op-text-2">{project.overview}</p>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <h3 className="font-op-mono text-[11px] uppercase tracking-[0.18em] text-op-text-3">
            Architecture
          </h3>
          <ArchDiagram label={`${project.title} architecture`}>{project.architecture}</ArchDiagram>
        </div>
      </div>

      <div className="mt-8 flex flex-col items-start gap-5 border-t border-op-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <TechPillRow items={project.stack} />
        <Link
          to="/projects/$slug"
          params={{ slug: project.slug }}
          className="inline-flex items-center gap-2 rounded-md border-2 border-op-accent bg-op-accent px-5 py-2.5 text-[14px] font-medium text-op-bg op-button-hover"
        >
          View Case Study →
        </Link>
      </div>
    </article>
  );
}
