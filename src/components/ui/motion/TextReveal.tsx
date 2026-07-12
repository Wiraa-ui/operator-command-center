import { Fragment } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TextRevealProps {
  text: string;
  className?: string;
  /** Seconds to wait before the first word reveals. */
  delay?: number;
  /** Seconds between each word. */
  stagger?: number;
}

/**
 * Word-by-word blur-up reveal for headings — each word fades, un-blurs and
 * rises into place. Replaces the old per-character scramble: it's GPU-driven
 * (transform/opacity/filter only, no 30ms setState storm), so it stays smooth
 * on phones. Reduced motion is handled globally via <MotionConfig
 * reducedMotion="user"> at the root, which settles each word to its visible
 * state without an SSR/hydration mismatch. Words stay real text, so it's fully
 * accessible / selectable.
 */
export function TextReveal({ text, className, delay = 0, stagger = 0.07 }: TextRevealProps) {
  const words = text.split(" ");

  return (
    <motion.span
      className={cn("inline-block", className)}
      aria-label={text}
      initial={false}
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
    >
      {words.map((word, i) => (
        <Fragment key={`${word}-${i}`}>
          <motion.span
            aria-hidden="true"
            className="inline-block"
            variants={{
              hidden: { opacity: 0, y: "0.4em", filter: "blur(8px)" },
              visible: {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                transition: { duration: 0.55, ease: [0.32, 0.72, 0, 1] },
              },
            }}
          >
            {word}
          </motion.span>
          {/* real space text node → keeps natural line-wrapping between words */}
          {i < words.length - 1 ? " " : ""}
        </Fragment>
      ))}
    </motion.span>
  );
}
