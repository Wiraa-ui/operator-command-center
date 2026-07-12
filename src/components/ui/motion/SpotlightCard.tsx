import { useRef, useState, ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from "framer-motion";
import { cn } from "@/lib/utils";

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  spotlightColor?: string;
  /** Max tilt in degrees toward the cursor (default 3 — restrained). */
  maxTilt?: number;
}

export function SpotlightCard({
  children,
  className,
  spotlightColor = "var(--op-accent-glow)", // theme-aware accent
  maxTilt = 3,
}: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Cursor position, in px, relative to the card's top-left corner.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  // Centered offset, in px, used for the subtle tilt.
  const cx = useMotionValue(0);
  const cy = useMotionValue(0);

  // Springs tuned for a precise, weighty-but-quick feel (Apple-ish).
  const springConfig = { damping: 24, stiffness: 170, mass: 0.4 };
  const sx = useSpring(px, springConfig);
  const sy = useSpring(py, springConfig);
  const scx = useSpring(cx, springConfig);
  const scy = useSpring(cy, springConfig);

  // Tilt toward the cursor; depth reads through transformPerspective below.
  const rotateX = useTransform(scy, [-300, 300], [maxTilt, -maxTilt]);
  const rotateY = useTransform(scx, [-300, 300], [-maxTilt, maxTilt]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    px.set(e.clientX - rect.left);
    py.set(e.clientY - rect.top);
    cx.set(e.clientX - rect.left - rect.width / 2);
    cy.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    cx.set(0);
    cy.set(0);
  };

  const spotlight = useMotionTemplate`radial-gradient(420px circle at ${sx}px ${sy}px, var(--op-accent-glow), transparent 45%)`;
  const borderGlow = useMotionTemplate`radial-gradient(340px circle at ${sx}px ${sy}px, var(--op-accent-glow-strong), transparent 55%)`;

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      initial={false}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d", transformPerspective: 1000 }}
      className={cn("group relative rounded-xl", className)}
    >
      {/* Glowing border ring that tracks the cursor */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] transition-opacity duration-500"
        style={{
          opacity: isHovered ? 1 : 0,
          background: borderGlow,
          padding: "1px",
          WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />
      {/* Soft interior spotlight */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] transition-opacity duration-500"
        style={{ opacity: isHovered ? 1 : 0, background: spotlight }}
      />
      {children}
    </motion.div>
  );
}
