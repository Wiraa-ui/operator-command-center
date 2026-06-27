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
    slug: "kumon-invoice-automation",
    title: "Kumon Invoice Automation",
    tagline:
      "A structured spreadsheet workflow that streamlines monthly invoice processing for Kumon Udayana.",
    status: "deployed",
    stack: ["Excel", "CSV", "Spreadsheet Workflow"],
    overview:
      "An operational spreadsheet system that takes raw enrolment data and produces consistent monthly invoices with far less manual handling. Built inside the constraints of the centre's existing tools — no new software, no training overhead.",
    problem:
      "Monthly invoicing was a manual, error-prone process: copy-paste from rosters, reformat, double-check, repeat. The risk was wrong amounts on real bills going to real parents. The solution had to live where the data already lived.",
    architecture: `
[ enrolment roster ]
        |
        v
[ normalised CSV ] --> [ formula-driven workbook ] --> [ invoice batch ]
                              |
                              v
                       [ validation checks ]
`.trim(),
    components: [
      {
        name: "Structured workbook",
        reason:
          "Single source of truth. Inputs in one sheet, outputs in another, formulas in between — auditable line by line.",
      },
      {
        name: "Validation checks",
        reason:
          "Conditional rules flag missing fields, duplicate students, and amount anomalies before anything prints.",
      },
      {
        name: "CSV interchange",
        reason:
          "Keeps the workflow portable. Roster source can change without rewriting the whole system.",
      },
    ],
    state: [
      { label: "Status", detail: "In active monthly use." },
      { label: "Manual steps removed", detail: "Most of the per-student copy-paste cycle." },
      { label: "Error class eliminated", detail: "Silent amount mismatches caught at validation." },
    ],
    lessons:
      "The best automation is the one a non-technical operator can still understand and edit. A spreadsheet that anyone in the office can open beats a script no one else can maintain.",
    next: "Extend the same validation pattern to payroll and attendance, with shared lookup tables.",
    confidentiality:
      "Real enrolment and pricing data is not shown. Workflow structure is described in general terms.",
  },
  {
    slug: "payroll-system",
    title: "Payroll System",
    tagline:
      "Structured payroll calculation for centre staff, built on the same spreadsheet discipline as the invoice system.",
    status: "delivered",
    stack: ["Excel", "Spreadsheet Workflow"],
    overview:
      "A payroll workbook that takes hours, allowances, and deductions and produces consistent monthly payslips. Sits alongside the invoice system, sharing the same staff master data.",
    problem:
      "Payroll was being recalculated by hand each cycle. Small mistakes were common and expensive to unwind. A structured workbook removes the recalculation and leaves only the inputs to review.",
    architecture: `
[ staff master ]
        |
        v
[ hours + allowances ] --> [ payroll workbook ] --> [ payslip output ]
                                  |
                                  v
                          [ deduction rules ]
`.trim(),
    components: [
      {
        name: "Staff master sheet",
        reason: "Single record per person. Rates and deductions defined once.",
      },
      {
        name: "Period inputs",
        reason: "Only hours and adjustments change month to month — everything else is computed.",
      },
      {
        name: "Payslip output",
        reason: "Print-ready format derived directly from the calculated rows.",
      },
    ],
    state: [
      { label: "Status", detail: "Delivered during internship." },
      { label: "Cycle time", detail: "Reduced relative to the prior manual process." },
    ],
    lessons:
      "Sharing master data between invoicing and payroll matters more than any individual formula. The system survives because the shape of the data is right.",
    next: "Migrate the underlying master data into a small relational store so invoice + payroll can read from one source.",
    confidentiality:
      "Real staff and salary data is not shown. Structure is described in general terms.",
  },
  {
    slug: "luung-bali",
    title: "Luung Bali",
    tagline: "A small, real website built end-to-end — proof that I ship, not just plan.",
    status: "live",
    stack: ["HTML", "CSS", "JavaScript"],
    overview:
      "A simple, focused website built and deployed. Not a framework demo — a real site with a real purpose, built within real constraints.",
    problem:
      "Every operator needs at least one thing they have built and shipped themselves. Luung Bali is that artefact: small, finished, online.",
    architecture: `
[ source ] --> [ static build ] --> [ hosting ]
`.trim(),
    components: [
      {
        name: "Hand-written front-end",
        reason: "No framework overhead. Page weight stays small.",
      },
      {
        name: "Static deployment",
        reason: "Cheap, fast, nothing to break in the middle of the night.",
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
