import { Link, useRouterState } from "@tanstack/react-router";
import { Monogram } from "./Monogram";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

const links = [
  { to: "/", label: "Home" },
  { to: "/projects", label: "Projects", activeOptions: { exact: false } },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function Nav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  // Sync with the class set pre-paint by the inline theme script in __root.
  useEffect(() => {
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* private mode — theme just won't persist */
    }
    setTheme(next);
  };

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
        <div className="flex items-center gap-6">
          <nav aria-label="Primary" onMouseLeave={() => setHoveredPath(null)}>
            <ul className="flex items-center gap-1 sm:gap-2 text-[14px]">
              {links.map((l) => {
                const active =
                  l.to === "/"
                    ? pathname === "/"
                    : pathname === l.to || pathname.startsWith(`${l.to}/`);
                
                const isHovered = hoveredPath === l.to;

                return (
                  <li key={l.to} className="relative">
                    <Link
                      to={l.to}
                      onMouseEnter={() => setHoveredPath(l.to)}
                      className={`relative z-10 block px-3 py-1.5 transition-colors ${
                        active || isHovered ? "text-op-text" : "text-op-text-2"
                      } ${active ? "font-medium" : ""}`}
                    >
                      {l.label}
                    </Link>
                    {active && (
                      <motion.div
                        layoutId="nav-active"
                        className="absolute inset-0 bg-op-surface-2 rounded-full border border-op-line"
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                    {isHovered && !active && (
                      <motion.div
                        layoutId="nav-hover"
                        className="absolute inset-0 bg-op-surface-2/50 rounded-full"
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="hidden sm:flex items-center gap-2 border-l border-op-line pl-6">
            <button
              onClick={toggleTheme}
              className="flex h-8 w-8 items-center justify-center rounded-md text-op-text-3 transition-colors hover:bg-op-surface-2 hover:text-op-text-2"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <button
              onClick={() => {
                const e = new KeyboardEvent("keydown", { key: "k", metaKey: true });
                document.dispatchEvent(e);
              }}
              className="flex h-8 items-center gap-2 rounded-md bg-op-surface-2/50 px-3 text-[12px] text-op-text-3 transition-colors hover:bg-op-surface-2 hover:text-op-text-2 border border-transparent hover:border-op-line"
              aria-label="Open command palette"
            >
              <span>Search</span>
              <kbd className="font-op-mono text-[10px] opacity-70">⌘K</kbd>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
