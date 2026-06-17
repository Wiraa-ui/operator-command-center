import { Nav } from "./Nav";
import { Footer } from "./Footer";
import type { ReactNode } from "react";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-op-bg text-op-text">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded focus:bg-op-accent focus:px-3 focus:py-2 focus:text-op-bg"
      >
        Skip to content
      </a>
      <Nav />
      <main id="main" className="flex-1 pt-14">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-[1200px] px-4 sm:px-8 ${className}`}>
      {children}
    </div>
  );
}
