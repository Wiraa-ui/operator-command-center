import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

interface FadeInStaggerProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function FadeInStagger({ children, className = "", delay = 0 }: FadeInStaggerProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10%" }}
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.1,
            delayChildren: delay,
          },
        },
        hidden: {},
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function FadeInStaggerItem({ children, className = "" }: { children: ReactNode; className?: string }) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            type: "spring",
            damping: 25,
            stiffness: 100,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
