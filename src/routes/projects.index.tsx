import { createFileRoute } from "@tanstack/react-router";
import { PageShell, Container } from "@/components/sections/PageShell";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { ProjectCard } from "@/components/sections/ProjectCard";
import { FlagshipProject } from "@/components/sections/FlagshipProject";
import { flagshipProject, secondaryProjects } from "@/content/projects";
import { FadeInStagger, FadeInStaggerItem } from "@/components/ui/motion/FadeInStagger";

export const Route = createFileRoute("/projects/")({
  head: () => ({
    meta: [
      { title: "Projects — I Kadek Wira Wibawa" },
      {
        name: "description",
        content:
          "Operator portfolio: an Internal Knowledge Assistant, a self-hosted Ubuntu server stack, invoice and payroll automation, and a shipped website.",
      },
      { property: "og:title", content: "Projects — The Operator" },
      {
        property: "og:description",
        content:
          "Real systems for real organisations: infrastructure, automation, and operational tooling.",
      },
    ],
  }),
  component: ProjectsIndex,
});

function ProjectsIndex() {
  return (
    <PageShell>
      <section className="border-b border-op-line">
        <Container className="py-16 sm:py-20">
          <FadeInStagger>
            <FadeInStaggerItem>
              <p className="font-op-mono text-[12px] uppercase tracking-[0.22em] text-op-text-3">
                // projects
              </p>
            </FadeInStaggerItem>
            <FadeInStaggerItem>
              <h1 className="mt-3 max-w-[22ch] text-[40px] font-semibold leading-[1.1] text-op-text sm:text-[48px]">
                Systems I've built, deployed, or am operating now.
              </h1>
            </FadeInStaggerItem>
            <FadeInStaggerItem>
              <p className="mt-5 max-w-[68ch] text-[16.5px] leading-[1.7] text-op-text-2">
                Listed by operational weight, not by recency. The flagship comes first because it's
                the system I'd most want you to evaluate me on.
              </p>
            </FadeInStaggerItem>
          </FadeInStagger>
        </Container>
      </section>

      <section className="border-b border-op-line">
        <Container className="py-16 sm:py-20">
          <FadeInStagger>
            <FadeInStaggerItem>
              <SectionHeader eyebrow="// flagship" title="Internal Knowledge Assistant" />
            </FadeInStaggerItem>
            <FadeInStaggerItem>
              <FlagshipProject project={flagshipProject} />
            </FadeInStaggerItem>
          </FadeInStagger>
        </Container>
      </section>

      <section>
        <Container className="py-16 sm:py-20">
          <FadeInStagger>
            <FadeInStaggerItem>
              <SectionHeader eyebrow="// other systems" title="Smaller, finished, in use" />
            </FadeInStaggerItem>
            <FadeInStaggerItem className="grid gap-6 md:grid-cols-2 xl:grid-cols-2">
              {secondaryProjects.map((p) => (
                <ProjectCard key={p.slug} project={p} />
              ))}
            </FadeInStaggerItem>
          </FadeInStagger>
        </Container>
      </section>
    </PageShell>
  );
}
