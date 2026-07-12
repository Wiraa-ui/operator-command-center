import { Nav } from "./Nav";
import { Footer } from "./Footer";
import type { ReactNode } from "react";
import { SceneCanvas } from "@/components/three/SceneCanvas";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";

export function PageShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="relative flex min-h-screen flex-col text-op-text">
      {/* Ambient WebGL backdrop on subpages only — the homepage owns its
          visual layer (Server Room canvas, or classic SceneCanvas fallback)
          so at most one renderer is ever mounted. */}
      {pathname !== "/" && <SceneCanvas dim />}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded focus:bg-op-accent focus:px-3 focus:py-2 focus:text-op-bg"
      >
        Skip to content
      </a>
      <Nav />
      <main id="main" className="relative z-10 flex-1 pt-14">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
        >
          {children}
        </motion.div>
      </main>
      <div className="relative z-10">
        <Footer />
      </div>
      <CommandPalette />
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
    <div className={`mx-auto w-full max-w-[1200px] px-4 sm:px-8 ${className}`}>{children}</div>
  );
}
