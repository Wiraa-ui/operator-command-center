import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageShell, Container } from "@/components/operator/PageShell";
import { StatusBadge } from "@/components/operator/StatusBadge";
import { TechPillRow } from "@/components/operator/TechPill";
import { ArchDiagram } from "@/components/operator/ArchDiagram";
import { projects, projectBySlug, type Project } from "@/content/projects";

export const Route = createFileRoute("/projects/$slug")({
  loader: ({ params }) => {
    const project = projectBySlug(params.slug);
    if (!project) throw notFound();
    return { project };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.project;
    if (!p) return { meta: [{ title: "Project not found" }] };
    return {
      meta: [
        { title: `${p.title} — I Kadek Wira Wibawa` },
        { name: "description", content: p.tagline },
        { property: "og:title", content: `${p.title} — Case Study` },
        { property: "og:description", content: p.tagline },
      ],
    };
  },
  notFoundComponent: () => (
    <PageShell>
      <Container className="py-24 text-center">
        <p className="font-op-mono text-[12px] uppercase tracking-[0.2em] text-op-text-3">
          // 404
        </p>
        <h1 className="mt-3 text-[32px] font-semibold text-op-text">
          That project doesn't exist.
        </h1>
        <Link
          to="/projects"
          className="mt-6 inline-block op-link-underline font-op-mono text-[13px] text-op-accent"
        >
          ← Back to projects
        </Link>
      </Container>
    </PageShell>
  ),
  component: ProjectDetail,
});

function ProjectDetail() {
  const { project } = Route.useLoaderData();

  const i = projects.findIndex((p) => p.slug === project.slug);
  const next = projects[(i + 1) % projects.length];

  return (
    <PageShell>
      {/* Header */}
      <section className="border-b border-op-line">
        <Container className="py-16 sm:py-20">
          <Link
            to="/projects"
            className="op-link-underline font-op-mono text-[12px] text-op-text-2 hover:text-op-accent"
          >
            ← All projects
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <h1 className="text-[36px] font-semibold leading-[1.1] text-op-text sm:text-[48px]">
              {project.title}
            </h1>
            <StatusBadge status={project.status} />
          </div>
          <p className="mt-4 max-w-[68ch] text-[18px] leading-[1.6] text-op-text-2">
            {project.tagline}
          </p>

          {project.confidentiality ? (
            <div
              role="note"
              className="mt-6 rounded-md border border-op-line bg-op-surface-2/60 px-4 py-3 font-op-mono text-[12.5px] text-op-text-2"
            >
              <span className="text-op-accent">// confidentiality:</span>{" "}
              {project.confidentiality}
            </div>
          ) : null}
        </Container>
      </section>

      {/* Overview */}
      <section className="border-b border-op-line">
        <Container className="grid gap-10 py-14 sm:py-16 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <h2 className="font-op-mono text-[11px] uppercase tracking-[0.2em] text-op-text-3">
              // overview
            </h2>
            <p className="mt-3 max-w-[60ch] text-[16px] leading-[1.7] text-op-text-2">
              {project.overview}
            </p>

            <h2 className="mt-10 font-op-mono text-[11px] uppercase tracking-[0.2em] text-op-text-3">
              // the problem
            </h2>
            <p className="mt-3 max-w-[60ch] text-[16px] leading-[1.7] text-op-text-2">
              {project.problem}
            </p>
          </div>

          <div>
            <h2 className="font-op-mono text-[11px] uppercase tracking-[0.2em] text-op-text-3">
              // architecture
            </h2>
            <div className="mt-3">
              <ArchDiagram label={`${project.title} architecture`}>
                {project.architecture}
              </ArchDiagram>
            </div>

            <h2 className="mt-8 font-op-mono text-[11px] uppercase tracking-[0.2em] text-op-text-3">
              // tech stack
            </h2>
            <div className="mt-3">
              <TechPillRow items={project.stack} />
            </div>
          </div>
        </Container>
      </section>

      {/* Component reasoning */}
      <section className="border-b border-op-line">
        <Container className="py-14 sm:py-16">
          <h2 className="font-op-mono text-[11px] uppercase tracking-[0.2em] text-op-text-3">
            // component reasoning
          </h2>
          <p className="mt-2 max-w-[60ch] text-[14.5px] text-op-text-2">
            Why each piece was chosen — the decisions a recruiter or engineering
            manager actually wants to read.
          </p>
          <dl className="mt-8 divide-y divide-op-line border-y border-op-line">
            {project.components.map((c) => (
              <div
                key={c.name}
                className="grid gap-3 py-5 sm:grid-cols-[180px_1fr] sm:gap-8"
              >
                <dt className="font-op-mono text-[14px] text-op-accent">
                  {c.name}
                </dt>
                <dd className="text-[15.5px] leading-[1.65] text-op-text-2">
                  {c.reason}
                </dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      {/* Current state */}
      <section className="border-b border-op-line">
        <Container className="py-14 sm:py-16">
          <h2 className="font-op-mono text-[11px] uppercase tracking-[0.2em] text-op-text-3">
            // current state
          </h2>
          <ul className="mt-6 grid gap-4 md:grid-cols-2">
            {project.state.map((s) => (
              <li
                key={s.label}
                className="rounded-md border border-op-line bg-op-surface p-5"
              >
                <p className="font-op-mono text-[12px] uppercase tracking-wider text-op-text-3">
                  {s.label}
                </p>
                <p className="mt-1.5 text-[15px] text-op-text">{s.detail}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Lessons + next */}
      <section className="border-b border-op-line">
        <Container className="grid gap-10 py-14 sm:py-16 lg:grid-cols-2">
          <div>
            <h2 className="font-op-mono text-[11px] uppercase tracking-[0.2em] text-op-text-3">
              // lessons
            </h2>
            <p className="mt-3 max-w-[55ch] text-[16px] leading-[1.7] text-op-text-2">
              {project.lessons}
            </p>
          </div>
          <div>
            <h2 className="font-op-mono text-[11px] uppercase tracking-[0.2em] text-op-text-3">
              // what comes next
            </h2>
            <p className="mt-3 max-w-[55ch] text-[16px] leading-[1.7] text-op-text-2">
              {project.next}
            </p>
          </div>
        </Container>
      </section>

      {/* Bottom nav */}
      <section>
        <Container className="flex flex-col gap-4 py-14 sm:flex-row sm:items-center sm:justify-between">
          <Link
            to="/projects/$slug"
            params={{ slug: next.slug }}
            className="op-link-underline font-op-mono text-[13px] text-op-text-2 hover:text-op-accent"
          >
            Next project: {next.title} →
          </Link>
          <Link
            to="/contact"
            className="op-link-underline font-op-mono text-[13px] text-op-accent"
          >
            Contact me →
          </Link>
        </Container>
      </section>
    </PageShell>
  );
}
