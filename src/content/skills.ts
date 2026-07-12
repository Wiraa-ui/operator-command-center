export type SkillSource = "otodidak" | "sekolah" | "internship" | "project";

export type Skill = {
  name: string;
  source: SkillSource;
};

export type SkillGroup = {
  domain: string;
  blurb: string;
  skills: Skill[];
};

export const sourceLabel: Record<SkillSource, string> = {
  otodidak: "self-taught",
  sekolah: "school",
  internship: "internship",
  project: "project",
};

export const skillGroups: SkillGroup[] = [
  {
    domain: "Frontend Development",
    blurb: "Building fast, accessible interfaces with modern React tooling.",
    skills: [
      { name: "React 19 / TypeScript", source: "project" },
      { name: "Tailwind CSS 4", source: "project" },
      { name: "TanStack (Router, Start, Query)", source: "project" },
      { name: "Framer Motion", source: "project" },
      { name: "Vite 8", source: "project" },
      { name: "HTML / CSS / JavaScript", source: "sekolah" },
    ],
  },
  {
    domain: "Backend & Infrastructure",
    blurb: "Running real servers and services with full-stack reliability.",
    skills: [
      { name: "Node.js / Bun", source: "project" },
      { name: "Express / REST API", source: "project" },
      { name: "PostgreSQL / Kysely", source: "project" },
      { name: "Ubuntu Server / systemd", source: "project" },
      { name: "Docker / Docker Compose", source: "otodidak" },
      { name: "Cloudflare Tunnel / Tailscale", source: "project" },
    ],
  },
  {
    domain: "AI & Automation",
    blurb: "Integrating AI and orchestrating workflows for operational systems.",
    skills: [
      { name: "Gemini API (chat + embeddings)", source: "project" },
      { name: "n8n (workflow automation)", source: "otodidak" },
      { name: "Qdrant (vector search)", source: "otodidak" },
      { name: "Telegram Bot API", source: "project" },
    ],
  },
  {
    domain: "Tools & Workflow",
    blurb: "Day-to-day tools and practices for shipping reliable software.",
    skills: [
      { name: "Git / GitHub", source: "project" },
      { name: "Linux CLI", source: "otodidak" },
      { name: "Conventional Commits", source: "project" },
      { name: "Problem Solving", source: "project" },
    ],
  },
];
