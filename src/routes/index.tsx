import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell, Container } from "@/components/operator/PageShell";
import { LinkButton, AnchorButton } from "@/components/operator/Button";
import { FlagshipProject } from "@/components/operator/FlagshipProject";
import { ProjectCard } from "@/components/operator/ProjectCard";
import { SectionHeader } from "@/components/operator/SectionHeader";
import { ImageSlot } from "@/components/operator/ImageSlot";
import { flagshipProject, secondaryProjects } from "@/content/projects";
import { site } from "@/content/site";
import { TextReveal } from "@/components/ui/motion/TextReveal";
import { SpotlightCard } from "@/components/ui/motion/SpotlightCard";
import { FadeIn } from "@/components/ui/motion/FadeIn";
import { StaggerContainer, StaggerItem } from "@/components/ui/motion/StaggerContainer";
import { Hero3D } from "@/components/ui/motion/Hero3D";
import { Skills } from "@/components/operator/Skills";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "I Kadek Wira Wibawa — Systems that improve operations",
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
      <section className="relative overflow-hidden border-b border-op-line">
        <div aria-hidden="true" className="absolute inset-0 op-grid-backdrop opacity-20" />
        <Container className="relative pt-8 pb-24 sm:pt-12 sm:pb-28 lg:pt-12 lg:pb-32">
          <StaggerContainer className="grid gap-16 lg:grid-cols-[1fr_500px] xl:grid-cols-[1fr_600px] lg:items-start lg:gap-20 lg:pt-8">
            <div className="z-10 relative">
              <StaggerItem>
                <p className="hidden sm:flex items-center gap-2 font-op-mono text-[13px] text-op-text-2">
                  <span
                    aria-hidden="true"
                    className="inline-block h-2 w-2 rounded-full bg-op-success op-pulse-live"
                  />
                  <span>
                    // {site.currentStatus.toLowerCase()}
                    <span className="px-2 text-op-text-3">—</span>
                    <span className="text-op-accent">
                      status: {site.availability.toLowerCase()}
                    </span>
                  </span>
                </p>
              </StaggerItem>

              <StaggerItem>
                <h1 className="mt-6 max-w-[18ch] text-[42px] font-bold leading-[1.04] tracking-[-0.03em] text-transparent bg-clip-text bg-gradient-to-br from-white via-op-text to-op-accent sm:text-[64px] sm:leading-[1.03]">
                  <TextReveal text="I build systems that improve operations." stagger={0.08} />
                </h1>
              </StaggerItem>

              <StaggerItem>
                <p className="mt-5 max-w-[42ch] text-[20px] font-semibold leading-[1.35] text-op-text-2 sm:text-[24px]">
                  Functional web systems, precision data management, and conceptual design —
                  operated from Bali.
                </p>
              </StaggerItem>

              <StaggerItem>
                <p className="mt-6 max-w-[68ch] text-[16px] leading-[1.7] text-op-text-2">
                  I'm {site.name}. I build functional information systems and manage client
                  websites. My background in software engineering trains me to value precision,
                  reliable teamwork, and turning complex operational needs into elegant web
                  solutions.
                </p>
              </StaggerItem>

              <StaggerItem>
                <div className="mt-9 flex flex-wrap items-center gap-4">
                  <LinkButton to="/projects" variant="primary">
                    View My Projects
                  </LinkButton>
                  <LinkButton to="/contact" variant="ghost">
                    Get in Touch
                  </LinkButton>
                </div>
              </StaggerItem>
            </div>

            <StaggerItem className="relative h-full w-full min-h-[400px] -mt-10 lg:mt-0">
              <Hero3D />
            </StaggerItem>
          </StaggerContainer>
        </Container>
      </section>

      {/* ====================== OPERATING PRINCIPLES ====================== */}
      <section className="border-b border-op-line" aria-label="Operating principles">
        <Container className="py-24 sm:py-28">
          <FadeIn delay={0.1}>
            <p className="font-op-mono text-[11px] uppercase tracking-[0.22em] text-op-text-3">
              // how I work
            </p>
          </FadeIn>
          <StaggerContainer className="mt-10 grid gap-8 sm:grid-cols-3 sm:gap-10">
            {principles.map((p) => (
              <StaggerItem key={p.code} className="border-l border-op-line pl-5">
                <p className="font-op-mono text-[12px] text-op-accent">{p.code}</p>
                <p className="mt-2 text-[16px] leading-[1.55] text-op-text">{p.line}</p>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </Container>
      </section>

      {/* ============================ FLAGSHIP ============================ */}
      <section className="border-b border-op-line">
        <Container className="py-24 sm:py-32">
          <FadeIn>
            <SectionHeader
              eyebrow="// selected work"
              title="The system I'm building right now"
              description="Real problem, real organisation, real architecture. Start here."
            />
          </FadeIn>
          <FadeIn delay={0.2}>
            <SpotlightCard className="mb-10">
              <ImageSlot
                label={`${flagshipProject.slug}-cover.jpg`}
                caption="Flagship cover — screenshot, diagram, or hero shot (16:9)."
                ratio="wide"
                src={`/${flagshipProject.slug}-cover.jpg`}
              />
            </SpotlightCard>
            <FlagshipProject project={flagshipProject} />
          </FadeIn>
        </Container>
      </section>

      {/* ============================ CORE TECHNOLOGIES ============================ */}
      <section className="border-b border-op-line">
        <Container className="py-24 sm:py-32">
          <FadeIn>
            <SectionHeader
              eyebrow="// stack & tools"
              title="The tools I use to build and operate"
              description="Choices made for reliability, maintainability, and precision."
            />
          </FadeIn>
          <div className="mt-10">
            <Skills />
          </div>
        </Container>
      </section>

      {/* ============================ ALSO RUNNING ============================ */}
      <section className="border-b border-op-line">
        <Container className="py-24 sm:py-32">
          <FadeIn>
            <SectionHeader
              eyebrow="// also running"
              title="Other operational systems"
              description="Smaller, finished, in active use. Same discipline applied at a different scale."
            />
          </FadeIn>
          <StaggerContainer className="grid gap-8 md:grid-cols-2 lg:gap-10">
            {secondaryProjects
              .filter((p) => ["ubuntu-server-stack", "tuition-invoice-automation"].includes(p.slug))
              .map((p) => (
                <StaggerItem key={p.slug} className="flex flex-col gap-4">
                  <SpotlightCard>
                    <ImageSlot label={`${p.slug}.jpg`} ratio="video" src={`/${p.slug}.jpg?v=2`} />
                  </SpotlightCard>
                  <ProjectCard project={p} />
                </StaggerItem>
              ))}
          </StaggerContainer>
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
        <Container className="py-24 sm:py-32">
          <SectionHeader eyebrow="// about" title="An operator, not a rockstar" />
          <div className="grid gap-8 md:grid-cols-[260px_1fr] md:items-start md:gap-10">
            <SpotlightCard>
              <ImageSlot
                label="portrait-about.png"
                caption="Square portrait for the about teaser."
                ratio="square"
                src="/profile-hd.png"
              />
            </SpotlightCard>
            <div>
              <p className="max-w-[68ch] text-[16.5px] leading-[1.7] text-op-text-2">
                Most of what I know is self-taught against real systems. The rest came from a
                vocational IT track and a six-month internship that put production payroll and
                invoicing on my shoulders. I prefer boring, reliable choices — Ubuntu, Docker,
                Cloudflare Tunnel, a Telegram bot instead of a new app — because they survive
                contact with the people who actually use them.
              </p>
              <div className="mt-6">
                <Link
                  to="/about"
                  className="op-link-underline font-op-mono text-[13px] text-op-accent"
                >
                  Read more about me →
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ============================ CLOSING CTA ============================ */}
      <section>
        <Container className="py-28 sm:py-36">
          <p className="font-op-mono text-[12px] uppercase tracking-[0.2em] text-op-accent">
            // open for collaboration
          </p>
          <h2 className="mt-3 max-w-[20ch] text-[32px] font-semibold leading-[1.12] tracking-[-0.03em] text-op-text sm:text-[42px]">
            Have an operational problem worth solving?
          </h2>
          <p className="mt-4 max-w-[60ch] text-[16px] leading-[1.7] text-op-text-2">
            Internal tooling, self-hosted infrastructure, workflow automation, or an internal
            knowledge assistant for your own team — reach out.
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
