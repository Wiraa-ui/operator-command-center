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
  otodidak: "otodidak",
  sekolah: "sekolah",
  internship: "internship",
  project: "project",
};

export const skillGroups: SkillGroup[] = [
  {
    domain: "Infrastructure",
    blurb: "Running real machines, not borrowing someone else's.",
    skills: [
      { name: "Ubuntu Server", source: "otodidak" },
      { name: "Docker", source: "otodidak" },
      { name: "Cloudflare Tunnel", source: "otodidak" },
      { name: "Tailscale", source: "otodidak" },
      { name: "Networking fundamentals", source: "sekolah" },
    ],
  },
  {
    domain: "Automation & AI",
    blurb: "Workflows that remove repeat work and ground answers in real documents.",
    skills: [
      { name: "n8n", source: "otodidak" },
      { name: "Gemini API", source: "project" },
      { name: "Qdrant", source: "project" },
      { name: "Telegram Bot API", source: "otodidak" },
    ],
  },
  {
    domain: "Operations",
    blurb: "Spreadsheet discipline that non-technical colleagues can still maintain.",
    skills: [
      { name: "Structured Excel / Sheets", source: "internship" },
      { name: "CSV pipelines", source: "internship" },
      { name: "Validation & reconciliation", source: "internship" },
    ],
  },
  {
    domain: "Build",
    blurb: "Enough code to ship the things infrastructure can't ship by itself.",
    skills: [
      { name: "HTML / CSS / JavaScript", source: "sekolah" },
      { name: "Static site delivery", source: "project" },
      { name: "Git", source: "otodidak" },
    ],
  },
];
