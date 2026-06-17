import { Link, useRouterState } from "@tanstack/react-router";
import { Monogram } from "./Monogram";

const links = [
  { to: "/projects", label: "Projects" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function Nav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-op-line bg-op-bg/85 backdrop-blur"
      role="banner"
    >
      <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between px-4 sm:px-8">
        <Link
          to="/"
          aria-label="Home — I Kadek Wira Wibawa"
          className="flex items-center gap-3 text-op-text"
        >
          <Monogram size={26} />
          <span className="hidden font-op-mono text-[12px] tracking-wider text-op-text-2 sm:inline">
            operator.iw
          </span>
        </Link>
        <nav aria-label="Primary">
          <ul className="flex items-center gap-6 text-[14px]">
            {links.map((l) => {
              const active = pathname === l.to || pathname.startsWith(l.to);
              return (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    data-active={active}
                    className="op-link-underline text-op-text-2 transition-colors hover:text-op-text data-[active=true]:text-op-accent"
                  >
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
