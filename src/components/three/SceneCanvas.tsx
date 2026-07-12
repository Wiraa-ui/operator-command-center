import { lazy, Suspense, useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

/**
 * SceneCanvas — mounts the global WebGL backdrop (single renderer for the
 * whole page, per three.js stack guideline). Client-only + lazy so the
 * three.js chunk never blocks SSR or first paint, with a static gradient
 * fallback when WebGL is unavailable ("mobile fallback essential" —
 * Immersive/Interactive Experience pattern).
 */
const Scene = lazy(() => import("./Scene"));

function supportsWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") ?? c.getContext("webgl"));
  } catch {
    return false;
  }
}

export function SceneCanvas({ dim = false }: { dim?: boolean }) {
  const [mode, setMode] = useState<"pending" | "webgl" | "fallback">("pending");

  useEffect(() => {
    setMode(supportsWebGL() ? "webgl" : "fallback");
  }, []);

  // On the homepage the scene IS the journey — it only softens slightly while
  // content passes over it (the scrim + fog handle readability). Content-heavy
  // subpages (dim) keep it as a quiet ambient layer instead.
  const { scrollY } = useScroll();
  const scrollOpacity = useTransform(scrollY, [0, 700], [1, 0.62]);
  const opacity = dim ? 0.3 : scrollOpacity;

  if (mode === "pending") return null;

  return (
    <motion.div
      aria-hidden="true"
      style={{ opacity }}
      className="pointer-events-none fixed inset-0 z-0"
    >
      {mode === "webgl" ? (
        <Suspense fallback={null}>
          <Scene mode={dim ? "ambient" : "journey"} />
        </Suspense>
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(900px 600px at 75% 20%, rgba(34,197,94,0.14), transparent 60%), radial-gradient(700px 500px at 15% 80%, rgba(56,189,248,0.08), transparent 55%)",
          }}
        />
      )}
    </motion.div>
  );
}
