import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, Container } from "@/components/operator/PageShell";
import { LinkButton, AnchorButton } from "@/components/operator/Button";
import { FlagshipProject } from "@/components/operator/FlagshipProject";
import { ProjectCard } from "@/components/operator/ProjectCard";
import { SectionHeader } from "@/components/operator/SectionHeader";
import { ImageSlot } from "@/components/operator/ImageSlot";
import { flagshipProject, secondaryProjects } from "@/content/projects";
import { site } from "@/content/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title:
          "I Kadek Wira Wibawa — Systems that improve operations",
      },
      {
        name: "description",
        content:
          "I build systems that improve operations. Infrastructure, automation, and quiet reliability — operated from Bali.",
      },
      {
        property: "og:title",
        content: "I Kadek Wira Wibawa — The Operator",
      },
      {
        property: "og:description",
        content:
          "Systems that improve operations. Infrastructure, automation, and quiet reliability.",
      },
    ],
  }),
  component: Home,
});

const principles = [
  {
    code: "01 / infrastructure",
    line: "Run real machines. Own the uptime, own the surface area.",
  },
  {
    code: "02 / automation",
    line: "Remove the work that shouldn't be done by a person twice.",
  },
  {
    code: "03 / problem-solving",
    line: "Start at the operational gap. Tools come after the diagnosis.",
  },
];

function Home() {
  return (
    <PageShell>
      {/* ============================ HERO ============================ */}
      <section className="relative border-b border-op-line">
        <div aria-hidden="true" className="absolute inset-0 op-grid-backdrop opacity-40" />
        <Container className="relative py-20 sm:py-28 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-[1fr_360px] lg:items-start lg:gap-16">
            <div>
              <p className="flex items-center gap-2 font-op-mono text-[13px] text-op-text-2">
                <span
                  aria-hidden="true"
                  className="inline-block h-2 w-2 rounded-full bg-op-success op-pulse-live"
                />
                <span>
                  // operator @ kumon udayana
                  <span className="px-2 text-op-text-3">—</span>
                  <span className="text-op-accent">status: open for collaboration</span>
                </span>
              </p>

              <h1 className="mt-6 max-w-[18ch] text-[40px] font-semibold leading-[1.05] tracking-[-0.01em] text-op-text sm:text-[56px] sm:leading-[1.05]">
                I build systems that improve operations.
              </h1>

              <p className="mt-5 max-w-[42ch] text-[20px] font-semibold leading-[1.35] text-op-text-2 sm:text-[24px]">
                Infrastructure, automation, and quiet reliability — operated from Bali.
              </p>

              <p className="mt-6 max-w-[68ch] text-[16px] leading-[1.7] text-op-text-2">
                I'm {site.name}. I run a self-hosted server, design retrieval-grounded
                assistants for internal knowledge, and turn fragile manual workflows
                into systems a non-technical colleague can still operate. The work
                comes from the problem, not the stack.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-4">
                <LinkButton to="/projects" variant="primary">
                  View My Projects
                </LinkButton>
                <LinkButton to="/contact" variant="ghost">
                  Get in Touch
                </LinkButton>
              </div>
            </div>

            <ImageSlot
              label="portrait.jpg"
              caption="Replace with your portrait — 4:5, plain backdrop preferred."
              ratio="portrait"
              className="lg:mt-2"
            />
          </div>
        </Container>
      </section>


      {/* ====================== OPERATING PRINCIPLES ====================== */}
      <section className="border-b border-op-line" aria-label="Operating principles">
        <Container className="py-14 sm:py-16">
          <p className="font-op-mono text-[11px] uppercase tracking-[0.22em] text-op-text-3">
            // how I work
          </p>
          <ul className="mt-6 grid gap-6 sm:grid-cols-3 sm:gap-8">
            {principles.map((p) => (
              <li
                key={p.code}
                className="border-l border-op-line pl-5"
              >
                <p className="font-op-mono text-[12px] text-op-accent">{p.code}</p>
                <p className="mt-2 text-[16px] leading-[1.55] text-op-text">
                  {p.line}
                </p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* ============================ FLAGSHIP ============================ */}
      <section className="border-b border-op-line">
        <Container className="py-16 sm:py-20">
          <SectionHeader
            eyebrow="// selected work"
            title="The system I'm building right now"
            description="Real problem, real organisation, real architecture. Start here."
          />
          <FlagshipProject project={flagshipProject} />
        </Container>
      </section>

      {/* ============================ ALSO RUNNING ============================ */}
      <section className="border-b border-op-line">
        <Container className="py-16 sm:py-20">
          <SectionHeader
            eyebrow="// also running"
            title="Other operational systems"
            description="Smaller, finished, in active use. Same discipline applied at a different scale."
          />
          <div className="grid gap-6 md:grid-cols-2">
            {secondaryProjects
              .filter((p) =>
                ["ubuntu-server-stack", "kumon-invoice-automation"].includes(p.slug),
              )
              .map((p) => (
                <ProjectCard key={p.slug} project={p} />
              ))}
          </div>
          <div className="mt-8">
            <Link
              to="/projects"
              className="op-link-underline font-op-mono text-[13px] text-op-text-2 hover:text-op-accent"
            >
              View all projects →
            </Link>
          </div>
        </Container>
      </section>

      {/* ============================ ABOUT TEASER ============================ */}
      <section className="border-b border-op-line">
        <Container className="py-16 sm:py-20">
          <SectionHeader eyebrow="// about" title="An operator, not a rockstar" />
          <p className="max-w-[68ch] text-[16.5px] leading-[1.7] text-op-text-2">
            Most of what I know is self-taught against real systems. The rest came
            from a vocational IT track and a six-month internship that put
            production payroll and invoicing on my shoulders. I prefer boring,
            reliable choices — Ubuntu, Docker, Cloudflare Tunnel, a Telegram bot
            instead of a new app — because they survive contact with the people
            who actually use them.
          </p>
          <div className="mt-6">
            <Link
              to="/about"
              className="op-link-underline font-op-mono text-[13px] text-op-accent"
            >
              Read more about me →
            </Link>
          </div>
        </Container>
      </section>

      {/* ============================ CLOSING CTA ============================ */}
      <section>
        <Container className="py-20 sm:py-24">
          <p className="font-op-mono text-[12px] uppercase tracking-[0.2em] text-op-accent">
            // open for collaboration
          </p>
          <h2 className="mt-3 max-w-[20ch] text-[32px] font-semibold leading-[1.15] text-op-text sm:text-[40px]">
            Have an operational problem worth solving?
          </h2>
          <p className="mt-4 max-w-[60ch] text-[16px] leading-[1.7] text-op-text-2">
            Internal tooling, self-hosted infrastructure, workflow automation, or
            an internal knowledge assistant for your own team — reach out.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <AnchorButton
              href={site.whatsapp.href}
              target="_blank"
              rel="noreferrer"
              variant="primary"
            >
              WhatsApp →
            </AnchorButton>
            <AnchorButton href={site.email.href} variant="ghost">
              Email
            </AnchorButton>
            <a
              href={site.cvHref}
              className="op-link-underline font-op-mono text-[13px] text-op-text-2 hover:text-op-accent"
            >
              View / download CV →
            </a>
          </div>
        </Container>
      </section>
    </PageShell>
  );
}
