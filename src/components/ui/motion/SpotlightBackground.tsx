import { useEffect, useState } from "react";
import { motion, useMotionTemplate } from "framer-motion";
import { useMousePosition } from "@/hooks/useMousePosition";
import { useCoarsePointer } from "@/hooks/useCoarsePointer";

export function SpotlightBackground() {
  const coarse = useCoarsePointer();
  const { mouseX, mouseY } = useMousePosition(!coarse);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // useMotionTemplate lets us interpolate motion values into a CSS string directly
  const background = useMotionTemplate`radial-gradient(550px circle at ${mouseX}px ${mouseY}px, rgba(45, 212, 191, 0.035), transparent 45%)`;

  // Cursor-driven effect → useless on touch, and the full-screen mix-blend
  // repaint is expensive on phones. Skip it entirely there.
  if (!isClient || coarse) return null;

  return (
    <motion.div
      // z-40: ambient glow over content but BELOW the nav (z-50), so it never
      // tints the header.
      className="pointer-events-none fixed inset-0 z-40 mix-blend-screen"
      style={{ background }}
    />
  );
}
