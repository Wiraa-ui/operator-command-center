import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MapPin } from "lucide-react";
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
    code: "01 / reliability",
    line: "Build systems that work consistently under real-world conditions.",
  },
  {
    code: "02 / efficiency",
    line: "Write clean, maintainable code that optimizes performance and resources.",
  },
  {
    code: "03 / problem-solving",
    line: "Understand the core problem first, then choose the right technology to solve it.",
  },
];

function Home() {
  return (
    <PageShell>
      {/* ============================ HERO ============================ */}
      <section className="relative overflow-hidden border-b border-op-line">
        <div aria-hidden="true" className="absolute inset-0 op-grid-backdrop opacity-20" />
        {/* Soft accent bloom anchored to the system-graph side */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-32 -top-32 h-[520px] w-[520px] rounded-full bg-op-accent/10 opacity-60 blur-[120px]"
        />
        <Container className="relative pt-8 pb-16 sm:pt-12 sm:pb-24 lg:pt-16 lg:pb-28">
          <StaggerContainer className="grid gap-14 lg:grid-cols-[1.1fr_0.9fr] xl:grid-cols-[1fr_540px] lg:items-center lg:gap-16 xl:gap-20">
            <div className="relative z-10">
              <div className="max-lg:op-glass relative overflow-hidden lg:overflow-visible rounded-[28px] p-7 sm:rounded-[32px] sm:p-12 lg:p-0">
                {/* top edge highlight */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-op-accent/40 to-transparent lg:hidden"
                />

                <StaggerItem>
                  <span className="inline-flex items-center gap-2.5 rounded-full border border-op-line bg-op-surface/70 px-3.5 py-1.5 font-op-mono text-[12px] tracking-tight backdrop-blur-md">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-op-accent opacity-60" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-op-accent" />
                    </span>
                    <span className="text-op-accent">Open for collaboration</span>
                    <span className="text-op-line">|</span>
                    <span className="text-op-text-3">fresh graduate</span>
                  </span>
                </StaggerItem>

                <StaggerItem>
                  <h1 className="mt-7 max-w-[16ch] lg:max-w-none text-[40px] font-bold leading-[1.02] tracking-[-0.035em] text-op-text sm:text-[62px] lg:text-[54px] xl:text-[62px]">
                    <TextReveal text="Engineering reliable web systems." />
                  </h1>
                </StaggerItem>

                <StaggerItem>
                  <p className="mt-6 max-w-[44ch] text-[19px] font-medium leading-[1.45] text-op-text sm:text-[22px] lg:text-[20px] xl:text-[22px]">
                    Full-stack developer focused on{" "}
                    <span className="text-op-accent">robust architecture</span> and precision.
                  </p>
                </StaggerItem>

                <StaggerItem>
                  <p className="mt-5 max-w-[52ch] text-[15.5px] leading-[1.75] text-op-text-2 lg:text-[16px]">
                    I'm {site.name}. I build functional applications, manage data systems, and
                    deliver software that performs flawlessly under real-world conditions.
                  </p>
                </StaggerItem>

                <StaggerItem>
                  <div className="mt-9 flex flex-wrap items-center gap-3.5">
                    <LinkButton
                      to="/projects"
                      variant="primary"
                      className="group h-12 px-7 text-[14px]"
                    >
                      View My Projects
                      <ArrowRight
                        size={16}
                        className="transition-transform duration-300 group-hover:translate-x-0.5"
                      />
                    </LinkButton>
                    <LinkButton to="/contact" variant="ghost" className="h-12 px-7 text-[14px]">
                      Get in Touch
                    </LinkButton>
                  </div>
                </StaggerItem>

                <StaggerItem>
                  <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-op-line pt-5 font-op-mono text-[12px] text-op-text-3">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin size={13} className="text-op-text-2" />
                      {site.location}
                    </span>
                    <span className="text-op-line">/</span>
                    <span className="text-op-text-2">{site.role}</span>
                  </div>
                </StaggerItem>
              </div>
            </div>

            <StaggerItem className="relative -mt-8 h-full min-h-[360px] w-full sm:min-h-[420px] lg:mt-0 xl:min-h-[460px]">
              {/* corner instrument label — ties the 3D to the "system" theme */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-0 top-2 z-10 font-op-mono text-[11px] uppercase tracking-[0.22em] text-op-text-3"
              >
                // system.graph
              </span>
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
              // my approach
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
              title="Recent full-stack project"
              description="A comprehensive system demonstrating backend architecture and frontend integration."
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
              title="Technologies I use"
              description="Languages, frameworks, and tools I have experience working with."
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
              eyebrow="// other projects"
              title="Additional work"
              description="Other applications and systems I have developed."
            />
          </FadeIn>
          <StaggerContainer className="grid gap-8 md:grid-cols-2 lg:gap-10">
            {secondaryProjects
              .filter((p) => ["ubuntu-server-stack", "luung-bali"].includes(p.slug))
              .map((p) => (
                <StaggerItem key={p.slug} className="flex h-full flex-col">
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
          <SectionHeader eyebrow="// about" title="Dedicated to reliable engineering" />
          <div className="grid gap-8 md:grid-cols-[260px_1fr] md:items-start md:gap-10">
            <ImageSlot
              label="portrait-about.png"
              caption="Square portrait for the about teaser."
              ratio="square"
              src="/profile-hd.png"
            />
            <div>
              <p className="max-w-[68ch] text-[16.5px] leading-[1.7] text-op-text-2">
                My approach to software engineering is grounded in practicality. Throughout my
                academic background and hands-on internships, I have taken ownership of critical
                systems—from database management to full-stack application development. I prioritize
                reliable, proven technologies over fleeting trends because my ultimate goal is to
                build software that users can depend on.
              </p>
              <div className="mt-6">
                <Link
                  to="/about"
                  className="op-link-underline font-op-mono text-[13px] text-op-accent"
                >
                  Read more about my experience →
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
            // open to opportunities
          </p>
          <h2 className="mt-3 max-w-[20ch] text-[32px] font-semibold leading-[1.12] tracking-[-0.03em] text-op-text sm:text-[42px]">
            Looking for a dedicated software engineer?
          </h2>
          <p className="mt-4 max-w-[60ch] text-[16px] leading-[1.7] text-op-text-2">
            Whether you need a full-stack web application, system integration, or reliable
            infrastructure management, I'm ready to contribute to your team. Let's connect.
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
