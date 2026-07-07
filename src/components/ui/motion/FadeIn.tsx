import { ReactNode } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface FadeInProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
}

export function FadeIn({
  children,
  delay = 0,
  direction = "up",
  className,
  ...props
}: FadeInProps) {
  const directions = {
    up: { y: 14 },
    down: { y: -14 },
    left: { x: 14 },
    right: { x: -14 },
    none: { x: 0, y: 0 },
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        filter: "blur(12px)",
        ...directions[direction],
      }}
      whileInView={{
        opacity: 1,
        filter: "blur(0px)",
        x: 0,
        y: 0,
      }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 1.2,
        delay,
        ease: [0.22, 1, 0.36, 1], // Apple-style premium precision easing
        filter: { duration: 1.0, delay, ease: [0.22, 1, 0.36, 1] },
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
