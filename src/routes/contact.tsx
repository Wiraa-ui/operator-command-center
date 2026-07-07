import { createFileRoute } from "@tanstack/react-router";
import { PageShell, Container } from "@/components/sections/PageShell";
import { AnchorButton } from "@/components/sections/Button";
import { site } from "@/content/site";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — I Kadek Wira Wibawa" },
      {
        name: "description",
        content: "Reach the operator. WhatsApp, email, and CV. Open for collaboration from Bali.",
      },
      { property: "og:title", content: "Contact — The Operator" },
      {
        property: "og:description",
        content:
          "WhatsApp, email, and CV. Open for collaboration on infrastructure, automation, and internal tooling.",
      },
    ],
  }),
  component: Contact,
});

function Contact() {
  return (
    <PageShell>
      <section className="border-b border-op-line">
        <Container className="py-16 sm:py-20">
          <p className="font-op-mono text-[12px] uppercase tracking-[0.22em] text-op-text-3">
            // contact
          </p>
          <h1 className="mt-3 max-w-[22ch] text-[40px] font-semibold leading-[1.1] text-op-text sm:text-[48px]">
            Get in touch.
          </h1>
          <p className="mt-5 max-w-[60ch] text-[16.5px] leading-[1.7] text-op-text-2">
            Two channels, both operator-grade: WhatsApp for fast back-and-forth, email for anything
            that needs a record. I read both.
          </p>
        </Container>
      </section>

      <section className="border-b border-op-line">
        <Container className="py-14 sm:py-16">
          <div className="grid gap-6 md:grid-cols-2">
            <ContactCard
              label={site.whatsapp.label}
              value={site.whatsapp.display}
              href={site.whatsapp.href}
              accent
              external
            />
            <ContactCard
              label={site.email.label}
              value={site.email.display}
              href={site.email.href}
            />
          </div>

          <div className="mt-10">
            <AnchorButton href={site.cvHref}>↓ Download CV (PDF)</AnchorButton>
          </div>
        </Container>
      </section>

      <section>
        <Container className="py-16">
          <p className="max-w-[60ch] text-[15.5px] leading-[1.7] text-op-text-2">
            I'm best suited to operational problems: internal tooling, self-hosted infrastructure,
            workflow automation, or an internal knowledge assistant grounded in your own documents.
            If that sounds like the room you're in, write.
          </p>
        </Container>
      </section>
    </PageShell>
  );
}

function ContactCard({
  label,
  value,
  href,
  accent,
  external,
}: {
  label: string;
  value: string;
  href: string;
  accent?: boolean;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className={`op-card-hover flex flex-col gap-3 rounded-lg border bg-op-surface p-6 ${
        accent ? "border-op-accent/50" : "border-op-line"
      }`}
    >
      <p className="font-op-mono text-[11px] uppercase tracking-[0.22em] text-op-text-3">
        // {label.toLowerCase()}
      </p>
      <p className="text-[22px] font-semibold text-op-text">{label}</p>
      <p className="font-op-mono text-[14px] text-op-accent">{value}</p>
    </a>
  );
}
