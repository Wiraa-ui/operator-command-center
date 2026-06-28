import { useRef, useState, ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from "framer-motion";
import { cn } from "@/lib/utils";

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  spotlightColor?: string;
}

export function SpotlightCard({
  children,
  className,
  spotlightColor = "rgba(45, 212, 191, 0.12)", // faded cyan accent
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

  // Restrained tilt — premium, not gimmicky, slightly deeper for "mewah" feel.
  const rotateX = useTransform(scy, [-300, 300], [8, -8]);
  const rotateY = useTransform(scx, [-300, 300], [-8, 8]);

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

  const spotlight = useMotionTemplate`radial-gradient(420px circle at ${sx}px ${sy}px, ${spotlightColor}, transparent 45%)`;
  const borderGlow = useMotionTemplate`radial-gradient(340px circle at ${sx}px ${sy}px, rgba(45, 212, 191, 0.55), transparent 55%)`;

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={cn("group relative rounded-xl", className)}
    >
      {/* Glowing border ring that tracks the cursor */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 rounded-xl transition-opacity duration-500"
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
        className="pointer-events-none absolute inset-0 z-10 rounded-xl transition-opacity duration-500"
        style={{ opacity: isHovered ? 1 : 0, background: spotlight }}
      />
      {children}
    </motion.div>
  );
}
