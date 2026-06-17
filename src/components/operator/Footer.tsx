import { site } from "@/content/site";

export function Footer() {
  return (
    <footer
      className="border-t border-op-line"
      role="contentinfo"
    >
      <div className="mx-auto flex max-w-[1200px] flex-col gap-3 px-4 py-8 text-[14px] text-op-text-3 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>
          © 2026 {site.name} — Built with intention. Operated from Bali.
        </p>
        <p className="font-op-mono text-[12px]">
          <a
            href={site.whatsapp.href}
            target="_blank"
            rel="noreferrer"
            className="text-op-text-2 transition-colors hover:text-op-accent"
          >
            whatsapp
          </a>
          <span className="px-2 text-op-text-3">·</span>
          <a
            href={site.email.href}
            className="text-op-text-2 transition-colors hover:text-op-accent"
          >
            email
          </a>
        </p>
      </div>
    </footer>
  );
}
