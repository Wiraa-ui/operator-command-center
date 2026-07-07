import { Link } from "@tanstack/react-router";
import { StatusBadge } from "./StatusBadge";
import { TechPillRow } from "./TechPill";
import type { Project } from "@/content/projects";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      to="/projects/$slug"
      params={{ slug: project.slug }}
      className="op-glass group flex h-full flex-col gap-4 rounded-[24px] p-6 text-left overflow-hidden relative transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-op-accent/10"
    >
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
      {project.preview && (
        <div className="relative -mx-6 -mt-6 mb-3 aspect-video overflow-hidden border-b border-op-line">
          <img
            src={project.preview}
            alt={`Preview of ${project.title}`}
            className="h-full w-full object-cover grayscale opacity-80 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105 group-hover:grayscale-0 group-hover:opacity-100"
          />
        </div>
      )}
      <div className="flex items-start justify-between gap-3 relative z-10">
        <h3 className="text-[22px] font-semibold leading-[1.3] text-op-text">{project.title}</h3>
        <StatusBadge status={project.status} />
      </div>
      <p className="text-[14px] leading-[1.6] text-op-text-2">{project.tagline}</p>
      <div className="mt-auto flex flex-col gap-4">
        <TechPillRow items={project.stack} />
        <span className="font-op-mono text-[12px] text-op-accent">View Case Study →</span>
      </div>
    </Link>
  );
}
