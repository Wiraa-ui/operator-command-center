import { createFileRoute } from "@tanstack/react-router";
import { PageShell, Container } from "@/components/sections/PageShell";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { Timeline } from "@/components/sections/Timeline";
import { SourceBadge } from "@/components/sections/SourceBadge";
import { LinkButton, AnchorButton } from "@/components/sections/Button";
import { journey } from "@/content/journey";
import { achievements } from "@/content/achievements";
import { skillGroups } from "@/content/skills";
import { site } from "@/content/site";
import { FadeInStagger, FadeInStaggerItem } from "@/components/ui/motion/FadeInStagger";
import { SpotlightCard } from "@/components/ui/motion/SpotlightCard";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — I Kadek Wira Wibawa" },
      {
        name: "description",
        content:
          "Software Engineering student focused on functional information systems and high-level conceptual automotive design.",
      },
      { property: "og:title", content: "About — The Operator" },
      {
        property: "og:description",
        content: "How I think about technology, what I've shipped, and where I'm heading next.",
      },
    ],
  }),
  component: About,
});

const horizons = [
  {
    code: "now",
    title: "Operate and harden",
    line: "Ship the Internal Knowledge Assistant into production. Add backups and log shipping to the Ubuntu stack.",
  },
  {
    code: "next",
    title: "Unify operational data",
    line: "Move invoice and payroll master data into a small shared store so both systems read from one source.",
  },
  {
    code: "later",
    title: "Operator-as-a-service",
    line: "Offer the same stack — self-hosted infra + a knowledge assistant grounded in your own SOPs — to other small organisations.",
  },
];

function About() {
  return (
    <PageShell>
      {/* Header */}
      <section className="border-b border-op-line">
        <Container className="py-16 sm:py-20 flex flex-col-reverse md:flex-row items-start gap-10 md:gap-16">
          <FadeInStagger className="flex-1">
            <FadeInStaggerItem>
              <p className="font-op-mono text-[12px] uppercase tracking-[0.22em] text-op-text-3">
                // about
              </p>
            </FadeInStaggerItem>
            <FadeInStaggerItem>
              <h1 className="mt-3 max-w-[22ch] text-[40px] font-semibold leading-[1.1] text-op-text sm:text-[48px]">
                A builder. Focused, methodical, driven.
              </h1>
            </FadeInStaggerItem>
            <FadeInStaggerItem>
              <p className="mt-5 max-w-[68ch] text-[17px] leading-[1.7] text-op-text-2">
                I'm {site.name}, a Software Engineering student focused on functional information
                systems and high-level conceptual automotive design. I have real-world experience in
                data administration and website management, which has trained me in precision and
                teamwork within dynamic environments.
              </p>
            </FadeInStaggerItem>
          </FadeInStagger>
          <div className="shrink-0">
            <img
              src="/profile-hd.png"
              alt={site.name}
              className="w-40 h-40 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-full border-2 border-op-line object-cover shadow-[0_0_60px_-15px_var(--color-op-accent-glow)] animate-in fade-in zoom-in duration-1000"
            />
          </div>
        </Container>
      </section>

      {/* How I think */}
      <section className="border-b border-op-line relative overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 bg-op-accent/5 opacity-50 blur-3xl pointer-events-none" />
        <Container className="py-14 sm:py-16 relative">
          <FadeInStagger>
            <FadeInStaggerItem>
              <SectionHeader eyebrow="// principles" title="How I think about technology" />
            </FadeInStaggerItem>
            <FadeInStaggerItem className="op-glass rounded-[24px] p-8 sm:p-10">
              <p className="max-w-[68ch] text-[16.5px] leading-[1.8] text-op-text-2">
                Technology is a means, not an identity. The right tool is the one the operator can
                still maintain six months from now without me in the room. I default to
                long-term-supported, well-documented, boring choices — Ubuntu, Docker, n8n, structured
                spreadsheets — because they survive contact with real people.
              </p>
              <p className="mt-6 max-w-[68ch] text-[16.5px] leading-[1.8] text-op-text-2">
                I treat infrastructure as a first-class discipline. A self-hosted server with zero
                open ports teaches more about systems thinking than any framework tutorial. Security
                through configuration. Trust through transparency. Automation only where the manual
                step is proven painful.
              </p>
            </FadeInStaggerItem>
          </FadeInStagger>
        </Container>
      </section>

      {/* Achievements */}
      <section className="border-b border-op-line">
        <Container className="py-14 sm:py-16">
          <FadeInStagger>
            <FadeInStaggerItem>
              <SectionHeader
                eyebrow="// verified"
                title="Achievements"
                description="Two competition placements that confirmed self-taught practice held up under judged conditions."
              />
            </FadeInStaggerItem>
            <FadeInStaggerItem>
              <ul className="grid gap-6 md:grid-cols-2">
                {achievements.map((a) => (
                  <li
                    key={a.title}
                    className="op-glass flex gap-5 rounded-[20px] p-8 transition-transform hover:-translate-y-1 hover:shadow-lg hover:shadow-op-accent/5"
                  >
                    <span
                      aria-hidden="true"
                      className="font-op-mono text-[28px] leading-none text-op-accent opacity-90"
                    >
                      {a.glyph}
                    </span>
                    <div>
                      <h3 className="text-[19px] font-semibold text-op-text">{a.title}</h3>
                      <p className="mt-2 text-[15px] leading-[1.7] text-op-text-2">{a.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </FadeInStaggerItem>
          </FadeInStagger>
        </Container>
      </section>

      {/* Skills */}
      <section className="border-b border-op-line relative overflow-hidden">
        <div aria-hidden="true" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-op-accent/5 opacity-50 blur-[100px] pointer-events-none rounded-full" />
        <Container className="py-14 sm:py-16 relative">
          <FadeInStagger>
            <FadeInStaggerItem>
              <SectionHeader
                eyebrow="// skills"
                title="What I work with"
                description="No progress bars. Source-tagged so you can see what came from school, internship, real projects, or self-study."
              />
            </FadeInStaggerItem>
            <FadeInStaggerItem className="grid gap-4 md:grid-cols-3 md:grid-rows-2 auto-rows-min">
              {skillGroups.map((g, i) => {
                // First item spans 2 columns, others span 1 to create an asymmetric bento box feel
                const isLarge = i === 0;
                return (
                  <SpotlightCard 
                    key={g.domain} 
                    className={`op-glass rounded-[24px] p-6 sm:p-8 flex flex-col h-full ${isLarge ? 'md:col-span-2' : ''}`}
                  >
                    <div className="mb-6">
                      <h3 className="text-[20px] font-semibold text-op-text">{g.domain}</h3>
                      <p className="mt-2 text-[14.5px] text-op-text-2 leading-[1.6] max-w-[40ch]">{g.blurb}</p>
                    </div>
                    <ul className={`mt-auto grid gap-3 ${isLarge ? 'md:grid-cols-2 gap-x-8' : 'flex flex-col'}`}>
                      {g.skills.map((s) => (
                        <li
                          key={s.name}
                          className="flex items-center justify-between gap-3 border-b border-white/5 pb-3 last:border-0 last:pb-0"
                        >
                          <span className="font-op-mono text-[14px] text-op-text/90">{s.name}</span>
                          <SourceBadge source={s.source} />
                        </li>
                      ))}
                    </ul>
                  </SpotlightCard>
                );
              })}
            </FadeInStaggerItem>
          </FadeInStagger>
        </Container>
      </section>

      {/* Journey */}
      <section className="border-b border-op-line">
        <Container className="py-14 sm:py-16">
          <FadeInStagger>
            <FadeInStaggerItem>
              <SectionHeader
                eyebrow="// timeline"
                title="My journey"
                description="Education, experience, achievements, and self-directed practice — on a single line."
              />
            </FadeInStaggerItem>
            <FadeInStaggerItem className="op-glass rounded-[24px] p-8 sm:p-12">
              <Timeline entries={journey} />
            </FadeInStaggerItem>
          </FadeInStagger>
        </Container>
      </section>

      {/* Horizons */}
      <section className="border-b border-op-line relative overflow-hidden">
        <Container className="py-14 sm:py-16 relative z-10">
          <FadeInStagger>
            <FadeInStaggerItem>
              <SectionHeader eyebrow="// roadmap" title="Where I'm heading" />
            </FadeInStaggerItem>
            <FadeInStaggerItem>
              <div className="grid gap-4 lg:grid-cols-3">
                {horizons.map((h, i) => (
                  <SpotlightCard 
                    key={h.code} 
                    className="op-glass rounded-[20px] p-8 flex flex-col h-full transition-transform hover:-translate-y-1"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <p className="font-op-mono text-[12px] uppercase tracking-[0.2em] text-op-accent">
                        // {h.code}
                      </p>
                      <span className="text-[32px] font-bold text-op-text-3/30 leading-none">0{i + 1}</span>
                    </div>
                    <h3 className="text-[19px] font-semibold text-op-text mb-3">{h.title}</h3>
                    <p className="text-[15px] leading-[1.7] text-op-text-2 mt-auto">{h.line}</p>
                  </SpotlightCard>
                ))}
              </div>
            </FadeInStaggerItem>
          </FadeInStagger>
        </Container>
      </section>

      {/* Closing */}
      <section>
        <Container className="py-20">
          <FadeInStagger>
            <FadeInStaggerItem>
              <h2 className="max-w-[22ch] text-[28px] font-semibold leading-[1.2] text-op-text sm:text-[36px]">
                Want to work together?
              </h2>
            </FadeInStaggerItem>
            <FadeInStaggerItem className="mt-7 flex flex-wrap gap-4">
              <AnchorButton href={site.whatsapp.href} target="_blank" rel="noreferrer">
                WhatsApp →
              </AnchorButton>
              <LinkButton to="/contact" variant="ghost">
                See contact options
              </LinkButton>
            </FadeInStaggerItem>
          </FadeInStagger>
        </Container>
      </section>
    </PageShell>
  );
}
