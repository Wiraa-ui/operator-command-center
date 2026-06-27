import { useEffect, useState } from "react";
import { motion, useMotionTemplate } from "framer-motion";
import { useMousePosition } from "@/hooks/useMousePosition";

export function SpotlightBackground() {
  const { mouseX, mouseY } = useMousePosition();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // useMotionTemplate lets us interpolate motion values into a CSS string directly
  const background = useMotionTemplate`radial-gradient(550px circle at ${mouseX}px ${mouseY}px, rgba(45, 212, 191, 0.035), transparent 45%)`;

  if (!isClient) return null;

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-50 mix-blend-screen"
      style={{ background }}
    />
  );
}
