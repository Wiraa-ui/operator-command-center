import { Link } from "@tanstack/react-router";
import { StatusBadge } from "./StatusBadge";
import { TechPillRow } from "./TechPill";
import type { Project } from "@/content/projects";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      to="/projects/$slug"
      params={{ slug: project.slug }}
      className="op-card-hover group flex h-full flex-col gap-4 rounded-lg border border-op-line bg-op-surface/60 p-5 text-left backdrop-blur-md overflow-hidden"
    >
      {project.preview && (
        <div className="relative -mx-5 -mt-5 mb-2 aspect-video overflow-hidden border-b border-op-line">
          <img
            src={project.preview}
            alt={`Preview of ${project.title}`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}
      <div className="flex items-start justify-between gap-3">
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
