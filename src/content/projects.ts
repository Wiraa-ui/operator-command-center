export type ProjectStatus = "live" | "in-progress" | "deployed" | "delivered";

export type Project = {
  slug: string;
  title: string;
  tagline: string;
  status: ProjectStatus;
  flagship?: boolean;
  stack: string[];
  overview: string;
  problem: string;
  architecture: string; // ASCII / monospace diagram
  components: { name: string; reason: string }[];
  state: { label: string; detail: string }[]; // current progress / services running
  lessons: string;
  next: string;
  confidentiality?: string;
  link?: string;
  preview?: string;
};

export const projects: Project[] = [
  {
    slug: "internal-knowledge-assistant",
    title: "Internal Knowledge Assistant",
    tagline:
      "An AI-powered knowledge retrieval system for internal documents — answers staff questions from real procedures, not guesses.",
    status: "in-progress",
    flagship: true,
    stack: ["n8n", "Gemini", "Qdrant", "Telegram", "Docker"],
    overview:
      "A self-hosted retrieval system that ingests internal documents, embeds them into a vector store, and lets staff query them through a Telegram interface. Designed for organisations that need answers grounded in their own SOPs instead of generic chatbot output.",
    problem:
      "Operational knowledge in most small organisations lives in shared drives, PDFs, and people's memories. Onboarding takes weeks. The same questions get re-asked monthly. A general-purpose chatbot can't help — it doesn't know the procedures. The assistant closes that gap with retrieval grounded in actual documents.",
    architecture: `
[ Documents ]
      |
      v
[ n8n ingestion ] ---> [ Gemini embeddings ] ---> [ Qdrant vector store ]
                                                          |
[ Telegram bot ] <--- [ n8n query workflow ] <-----------+
      ^                       |
      |                       v
   [ user ]            [ Gemini answer ]
`.trim(),
    components: [
      {
        name: "n8n",
        reason:
          "Self-hosted workflow runtime. Keeps ingestion and query orchestration auditable and modifiable without redeploying code.",
      },
      {
        name: "Gemini",
        reason:
          "Embeddings for semantic search and generation for grounded answers. Chosen for cost-to-quality fit at small operational scale.",
      },
      {
        name: "Qdrant",
        reason:
          "Open-source vector database, runs locally in Docker. No external dependency, no per-query fee.",
      },
      {
        name: "Telegram",
        reason:
          "Interface staff already use. No new accounts, no new app to install, instant adoption.",
      },
    ],
    state: [
      { label: "Ingestion pipeline", detail: "Working end-to-end on test corpus." },
      { label: "Query workflow", detail: "Returns grounded answers with source references." },
      { label: "Production rollout", detail: "Pending content review and access policy." },
    ],
    lessons:
      "The hard part is never the model — it's the retrieval quality, document hygiene, and trust. A confident wrong answer is worse than no answer; the system was designed to cite sources from day one.",
    next: "Add document-level access control, scheduled re-ingestion on file changes, and a lightweight web interface as an alternative to Telegram.",
    confidentiality:
      "Document contents and internal procedures are not shown in this case study. Architecture and tooling are public.",
  },
  {
    slug: "ubuntu-server-stack",
    title: "Ubuntu Server Stack",
    tagline:
      "Self-hosted server running Docker, Cloudflare Tunnel, and Tailscale. Zero open ports.",
    status: "live",
    stack: ["Ubuntu", "Docker", "Cloudflare Tunnel", "Tailscale"],
    overview:
      "A single Ubuntu server hosting personal and operational services behind Cloudflare Tunnel and Tailscale. No inbound ports exposed to the public internet. Every service is containerised, every container is reproducible.",
    problem:
      "Renting a managed VM for each small service is wasteful and teaches nothing. Exposing a home server with port-forwarding teaches the wrong lessons. This stack proves a third path: one machine, one tunnel, full control, no attack surface.",
    architecture: `
[ public DNS ]
      |
      v
[ Cloudflare Tunnel ]  ---- (no open ports) ----
      |
      v
[ Ubuntu host ]
      |
      +--> [ Docker network ]
      |        +-- n8n
      |        +-- qdrant
      |        +-- caddy / internal services
      |
      +--> [ Tailscale ] <-- admin access only
`.trim(),
    components: [
      {
        name: "Ubuntu Server",
        reason:
          "Boring, predictable, long-term-supported. The right default for a system meant to keep running.",
      },
      {
        name: "Docker",
        reason: "Every service is a compose file. Rebuild from scratch in minutes, not days.",
      },
      {
        name: "Cloudflare Tunnel",
        reason: "Outbound-only connection to the edge. No firewall holes, no exposed IP.",
      },
      {
        name: "Tailscale",
        reason: "Private mesh for admin and SSH access. The server has no public SSH port at all.",
      },
    ],
    state: [
      { label: "Uptime", detail: "Continuous since deployment." },
      { label: "Public attack surface", detail: "Zero open inbound ports." },
      { label: "Hosted services", detail: "n8n, Qdrant, internal tooling, IKA backend." },
    ],
    lessons:
      "Security through configuration beats security through obscurity. A tunnel + a mesh removes an entire class of mistakes I would otherwise have made.",
    next: "Add automated off-site backups, structured log shipping, and a status page reachable through the tunnel.",
  },


  {
    slug: "luung-bali",
    title: "Luung Bali",
    tagline: "A small, real website built end-to-end — proof that I ship, not just plan.",
    status: "live",
    stack: ["WordPress"],
    link: "https://luungbalistonecarving.biz.id",
    preview: "/luung-bali-preview.jpg",
    overview:
      "A simple, focused website built and deployed. Not a framework demo — a real site with a real purpose, built within real constraints.",
    problem:
      "Every operator needs at least one thing they have built and shipped themselves. Luung Bali is that artefact: small, finished, online.",
    architecture: `
[ source ] --> [ static build ] --> [ hosting ]
`.trim(),
    components: [
      {
        name: "WordPress",
        reason: "Chosen as a proven CMS to manage content easily for the client.",
      },
    ],
    state: [{ label: "Status", detail: "Live." }],
    lessons:
      "Shipping is a skill. The first finished thing teaches more than the tenth abandoned thing.",
    next: "Iterate on content and accessibility; carry the same discipline into larger projects.",
  },
];

export const projectBySlug = (slug: string) => projects.find((p) => p.slug === slug);

export const flagshipProject = projects.find((p) => p.flagship)!;
export const secondaryProjects = projects.filter((p) => !p.flagship);
