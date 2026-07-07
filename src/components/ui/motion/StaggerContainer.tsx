import { ReactNode } from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface StaggerContainerProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  staggerDelay?: number;
  delayChildren?: number;
}

export function StaggerContainer({
  children,
  staggerDelay = 0.15,
  delayChildren = 0,
  ...props
}: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: delayChildren,
          },
        },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 16, filter: "blur(12px)" },
        visible: {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          transition: {
            duration: 1.2,
            ease: [0.22, 1, 0.36, 1],
            filter: { duration: 1.0, ease: [0.22, 1, 0.36, 1] },
          },
        },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
