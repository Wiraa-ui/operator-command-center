import { useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, ChevronDown, MapPin, Server } from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { SpotlightCard } from "@/components/ui/motion/SpotlightCard";
import { PageShell, Container } from "@/components/sections/PageShell";
import { LinkButton, AnchorButton } from "@/components/sections/Button";
import { ProjectCard } from "@/components/sections/ProjectCard";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { ImageSlot } from "@/components/sections/ImageSlot";
import { flagshipProject, secondaryProjects } from "@/content/projects";
import { site } from "@/content/site";
import { skillGroups } from "@/content/skills";
import { TextReveal } from "@/components/ui/motion/TextReveal";
import { FadeIn } from "@/components/ui/motion/FadeIn";
import { StaggerContainer, StaggerItem } from "@/components/ui/motion/StaggerContainer";

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

/**
 * Cinematic pinned hero: the copy stays stuck while the extra scroll length
 * gives the 3D camera a beat of pure scenery — text fades/pulls away as the
 * journey to the next station begins. Reduced motion → plain static hero.
 */
function CinematicHero({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const opacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.7], [1, 0.94]);
  const y = useTransform(scrollYProgress, [0, 0.7], [0, -70]);

  if (reduced) {
    return (
      <section className="relative flex min-h-[calc(100dvh-3.5rem)] flex-col justify-center overflow-hidden">
        {children}
      </section>
    );
  }
  return (
    <section ref={ref} className="relative h-[175vh]">
      <motion.div
        style={{ opacity, scale, y }}
        className="sticky top-14 flex min-h-[calc(100dvh-3.5rem)] flex-col justify-center overflow-hidden"
      >
        {children}
      </motion.div>
    </section>
  );
}

function Home() {
  return (
    <PageShell>
      {/* ================= 1. FULL-SCREEN IMMERSIVE HERO ================= */}
      <CinematicHero>
        <Container className="relative z-10 pb-24 pt-10 sm:pt-0">
          <StaggerContainer className="max-w-[720px]">
            <StaggerItem>
              <span className="inline-flex items-center gap-2.5 rounded-full border border-op-line bg-op-surface/60 px-3.5 py-1.5 font-op-mono text-[12px] tracking-tight backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-op-accent opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-op-accent" />
                </span>
                <span className="text-op-accent">{site.availability}</span>
                <span className="text-op-line">|</span>
                <span className="text-op-text-3">{site.currentStatus.toLowerCase()}</span>
              </span>
            </StaggerItem>

            <StaggerItem>
              <h1 className="mt-8 text-[46px] font-bold leading-[1.0] tracking-[-0.035em] text-op-text sm:text-[72px] lg:text-[82px]">
                <TextReveal text="Engineering reliable web systems." />
              </h1>
            </StaggerItem>

            <StaggerItem>
              <p className="mt-7 max-w-[46ch] text-[18px] font-medium leading-[1.5] text-op-text-2 sm:text-[21px]">
                I'm {site.name} — full-stack developer focused on{" "}
                <span className="text-op-accent">robust architecture</span>, real servers, and
                software that performs under real-world conditions.
              </p>
            </StaggerItem>

            <StaggerItem>
              <div className="mt-10 flex flex-wrap items-center gap-3.5">
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
              <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 font-op-mono text-[12px] text-op-text-3">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={13} className="text-op-text-2" />
                  {site.location}
                </span>
                <span className="text-op-line">/</span>
                <span className="text-op-text-2">{site.role}</span>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </Container>

        {/* Skip / scroll cue — the pattern requires an escape for impatient users */}
        <div className="pointer-events-none absolute inset-x-0 bottom-6 z-10 flex justify-center">
          <a
            href="#tour"
            className="pointer-events-auto flex flex-col items-center gap-1.5 font-op-mono text-[11px] uppercase tracking-[0.22em] text-op-text-3 transition-colors hover:text-op-accent"
          >
            skip intro — see the work
            <motion.span
              aria-hidden="true"
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            >
              <ChevronDown size={16} />
            </motion.span>
          </a>
        </div>
      </CinematicHero>

      {/* Everything below eases in over the 3D backdrop */}
      <div className="op-scrim">
        {/* ================= 2. GUIDED TOUR — BENTO GRID ================= */}
        <section id="tour" className="scroll-mt-14 border-b border-op-line">
          <Container className="py-24 sm:py-28">
            <FadeIn>
              <SectionHeader
                eyebrow="// the tour"
                title="One engineer, full stack, real servers"
                description="What I build with, where it runs, and why it stays up."
              />
            </FadeIn>
            <StaggerContainer className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Flagship — the big visual tile */}
              <StaggerItem className="sm:col-span-2 lg:row-span-2">
                <SpotlightCard className="h-full rounded-[24px]" maxTilt={5}>
                  <Link
                    to="/projects/$slug"
                    params={{ slug: flagshipProject.slug }}
                    className="op-bento group flex h-full flex-col overflow-hidden p-6"
                  >
                    <div className="-mx-6 -mt-6 mb-5 overflow-hidden border-b border-op-line">
                      <ImageSlot
                        label={`${flagshipProject.slug}-cover.jpg`}
                        caption=""
                        ratio="wide"
                        src={`/${flagshipProject.slug}-cover.jpg`}
                      />
                    </div>
                    <p className="font-op-mono text-[11px] uppercase tracking-[0.22em] text-op-accent">
                      // flagship
                    </p>
                    <h3 className="mt-2 text-[22px] font-semibold leading-[1.2] text-op-text">
                      {flagshipProject.title}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-[14.5px] leading-[1.6] text-op-text-2">
                      {flagshipProject.tagline}
                    </p>
                    <span className="mt-auto inline-flex items-center gap-1 pt-4 font-op-mono text-[12px] text-op-text-2 transition-colors group-hover:text-op-accent">
                      Case study <ArrowUpRight size={13} />
                    </span>
                  </Link>
                </SpotlightCard>
              </StaggerItem>

              {/* Principles strip */}
              <StaggerItem className="sm:col-span-2">
                <SpotlightCard className="h-full rounded-[24px]" maxTilt={5}>
                  <div className="op-bento h-full p-6">
                    <p className="font-op-mono text-[11px] uppercase tracking-[0.22em] text-op-text-3">
                      // my approach
                    </p>
                    <div className="mt-4 space-y-3.5">
                      {principles.map((p) => (
                        <div key={p.code} className="border-l border-op-line pl-4">
                          <p className="font-op-mono text-[11px] text-op-accent">{p.code}</p>
                          <p className="mt-0.5 text-[14px] leading-[1.5] text-op-text">{p.line}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </SpotlightCard>
              </StaggerItem>

              {/* Skill domains */}
              {skillGroups.slice(0, 2).map((g) => (
                <StaggerItem key={g.domain}>
                  <SpotlightCard className="h-full rounded-[24px]" maxTilt={6}>
                    <div className="op-bento h-full p-6">
                      <h3 className="text-[15px] font-semibold text-op-text">{g.domain}</h3>
                      <p className="mt-1.5 text-[13px] leading-[1.55] text-op-text-2">{g.blurb}</p>
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {g.skills.slice(0, 4).map((s) => (
                          <span
                            key={s.name}
                            className="rounded-full border border-op-line bg-op-surface-2/60 px-2.5 py-1 font-op-mono text-[11px] text-op-text-2"
                          >
                            {s.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </SpotlightCard>
                </StaggerItem>
              ))}

              {/* Self-hosted ops */}
              <StaggerItem>
                <SpotlightCard className="h-full rounded-[24px]" maxTilt={6}>
                  <div className="op-bento flex h-full flex-col p-6">
                    <Server size={18} className="text-op-accent" strokeWidth={1.5} />
                    <h3 className="mt-3 text-[15px] font-semibold text-op-text">
                      Self-hosted, self-operated
                    </h3>
                    <p className="mt-1.5 text-[13px] leading-[1.55] text-op-text-2">
                      This site and its AI assistant run on my own Ubuntu server — systemd,
                      Postgres, tunnels, backups, monitoring.
                    </p>
                  </div>
                </SpotlightCard>
              </StaggerItem>

              {/* Location / availability */}
              <StaggerItem>
                <SpotlightCard className="h-full rounded-[24px]" maxTilt={6}>
                  <div className="op-bento flex h-full flex-col justify-between p-6">
                    <div>
                      <MapPin size={18} className="text-op-accent" strokeWidth={1.5} />
                      <h3 className="mt-3 text-[15px] font-semibold text-op-text">
                        Operated from Bali
                      </h3>
                      <p className="mt-1.5 text-[13px] leading-[1.55] text-op-text-2">
                        {site.location} — remote-ready, {site.currentStatus.toLowerCase()}.
                      </p>
                    </div>
                    <a
                      href={site.whatsapp.href}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex items-center gap-1 font-op-mono text-[12px] text-op-text-2 transition-colors hover:text-op-accent"
                    >
                      WhatsApp <ArrowUpRight size={13} />
                    </a>
                  </div>
                </SpotlightCard>
              </StaggerItem>
            </StaggerContainer>
          </Container>
        </section>

        {/* ============== 3. KEY WORK REVEALED — PROJECTS ============== */}
        <section id="work" className="scroll-mt-14 border-b border-op-line">
          <Container className="py-24 sm:py-32">
            <FadeIn>
              <SectionHeader
                eyebrow="// other projects"
                title="Additional work"
                description="Other applications and systems I have developed."
              />
            </FadeIn>
            <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:gap-8">
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

        {/* ==================== 4. ABOUT TEASER ==================== */}
        <section className="border-b border-op-line">
          <Container className="py-24 sm:py-32">
            <SectionHeader eyebrow="// about" title="Dedicated to reliable engineering" />
            <FadeIn>
              <div className="op-bento grid gap-8 p-7 md:grid-cols-[260px_1fr] md:items-start md:gap-10 md:p-9">
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
                    systems—from database management to full-stack application development. I
                    prioritize reliable, proven technologies over fleeting trends because my
                    ultimate goal is to build software that users can depend on.
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
            </FadeIn>
          </Container>
        </section>

        {/* ================= 5. CTA AFTER THE TOUR ================= */}
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
      </div>
    </PageShell>
  );
}
