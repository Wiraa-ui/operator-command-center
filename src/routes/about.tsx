import { createFileRoute } from "@tanstack/react-router";
import { PageShell, Container } from "@/components/operator/PageShell";
import { SectionHeader } from "@/components/operator/SectionHeader";
import { Timeline } from "@/components/operator/Timeline";
import { SourceBadge } from "@/components/operator/SourceBadge";
import { LinkButton, AnchorButton } from "@/components/operator/Button";
import { journey } from "@/content/journey";
import { achievements } from "@/content/achievements";
import { skillGroups } from "@/content/skills";
import { site } from "@/content/site";

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
          <div className="flex-1">
            <p className="font-op-mono text-[12px] uppercase tracking-[0.22em] text-op-text-3">
              // about
            </p>
            <h1 className="mt-3 max-w-[22ch] text-[40px] font-semibold leading-[1.1] text-op-text sm:text-[48px]">
              A builder. Focused, methodical, driven.
            </h1>
            <p className="mt-5 max-w-[68ch] text-[17px] leading-[1.7] text-op-text-2">
              I'm {site.name}, a Software Engineering student focused on functional information
              systems and high-level conceptual automotive design. I have real-world experience in
              data administration and website management, which has trained me in precision and
              teamwork within dynamic environments.
            </p>
          </div>
          <div className="shrink-0">
            <img
              src="/profile-hd.png"
              alt={site.name}
              className="w-40 h-40 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-full border-2 border-op-line object-cover shadow-[0_0_60px_-15px_var(--color-op-accent-glow)]"
            />
          </div>
        </Container>
      </section>

      {/* How I think */}
      <section className="border-b border-op-line">
        <Container className="py-14 sm:py-16">
          <SectionHeader eyebrow="// principles" title="How I think about technology" />
          <div className="rounded-lg border border-op-line bg-op-surface p-6 sm:p-8">
            <p className="max-w-[68ch] text-[16px] leading-[1.75] text-op-text-2">
              Technology is a means, not an identity. The right tool is the one the operator can
              still maintain six months from now without me in the room. I default to
              long-term-supported, well-documented, boring choices — Ubuntu, Docker, n8n, structured
              spreadsheets — because they survive contact with real people.
            </p>
            <p className="mt-5 max-w-[68ch] text-[16px] leading-[1.75] text-op-text-2">
              I treat infrastructure as a first-class discipline. A self-hosted server with zero
              open ports teaches more about systems thinking than any framework tutorial. Security
              through configuration. Trust through transparency. Automation only where the manual
              step is proven painful.
            </p>
          </div>
        </Container>
      </section>

      {/* Achievements */}
      <section className="border-b border-op-line">
        <Container className="py-14 sm:py-16">
          <SectionHeader
            eyebrow="// verified"
            title="Achievements"
            description="Two competition placements that confirmed self-taught practice held up under judged conditions."
          />
          <ul className="grid gap-6 md:grid-cols-2">
            {achievements.map((a) => (
              <li
                key={a.title}
                className="flex gap-5 rounded-lg border border-op-line bg-op-surface p-6"
              >
                <span
                  aria-hidden="true"
                  className="font-op-mono text-[28px] leading-none text-op-accent"
                >
                  {a.glyph}
                </span>
                <div>
                  <h3 className="text-[18px] font-semibold text-op-text">{a.title}</h3>
                  <p className="mt-2 text-[14.5px] leading-[1.6] text-op-text-2">{a.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Skills */}
      <section className="border-b border-op-line">
        <Container className="py-14 sm:py-16">
          <SectionHeader
            eyebrow="// skills"
            title="What I work with"
            description="No progress bars. Source-tagged so you can see what came from school, internship, real projects, or self-study."
          />
          <div className="grid gap-8 md:grid-cols-2">
            {skillGroups.map((g) => (
              <div key={g.domain} className="rounded-lg border border-op-line bg-op-surface p-6">
                <h3 className="text-[18px] font-semibold text-op-text">{g.domain}</h3>
                <p className="mt-1 text-[14px] text-op-text-2">{g.blurb}</p>
                <ul className="mt-5 flex flex-col gap-2.5">
                  {g.skills.map((s) => (
                    <li
                      key={s.name}
                      className="flex items-center justify-between gap-3 border-b border-op-line pb-2.5 last:border-0 last:pb-0"
                    >
                      <span className="font-op-mono text-[13.5px] text-op-text">{s.name}</span>
                      <SourceBadge source={s.source} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Journey */}
      <section className="border-b border-op-line">
        <Container className="py-14 sm:py-16">
          <SectionHeader
            eyebrow="// timeline"
            title="My journey"
            description="Education, experience, achievements, and self-directed practice — on a single line."
          />
          <Timeline entries={journey} />
        </Container>
      </section>

      {/* Horizons */}
      <section className="border-b border-op-line">
        <Container className="py-14 sm:py-16">
          <SectionHeader eyebrow="// roadmap" title="Where I'm heading" />
          <ol className="grid gap-6 md:grid-cols-3">
            {horizons.map((h) => (
              <li key={h.code} className="rounded-lg border border-op-line bg-op-surface p-6">
                <p className="font-op-mono text-[11px] uppercase tracking-[0.2em] text-op-accent">
                  // {h.code}
                </p>
                <h3 className="mt-3 text-[18px] font-semibold text-op-text">{h.title}</h3>
                <p className="mt-2 text-[14.5px] leading-[1.6] text-op-text-2">{h.line}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Closing */}
      <section>
        <Container className="py-20">
          <h2 className="max-w-[22ch] text-[28px] font-semibold leading-[1.2] text-op-text sm:text-[36px]">
            Want to work together?
          </h2>
          <div className="mt-7 flex flex-wrap gap-4">
            <AnchorButton href={site.whatsapp.href} target="_blank" rel="noreferrer">
              WhatsApp →
            </AnchorButton>
            <LinkButton to="/contact" variant="ghost">
              See contact options
            </LinkButton>
          </div>
        </Container>
      </section>
    </PageShell>
  );
}
