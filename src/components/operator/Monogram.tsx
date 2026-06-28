import { motion } from "framer-motion";

type Props = { size?: number; className?: string };

/**
 * Geometric "IW" monogram — built from clean lines, no decoration.
 * Upgraded with a 3D entrance and hover flip for a luxurious feel.
 */
export function Monogram({ size = 28, className }: Props) {
  return (
    <motion.div
      initial={{ rotateY: -180, opacity: 0, transformPerspective: 1000 }}
      animate={{ rotateY: 0, opacity: 1, transformPerspective: 1000 }}
      whileHover={{ rotateY: 180, scale: 1.05, transformPerspective: 1000 }}
      transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
      className="inline-block"
      style={{ transformStyle: "preserve-3d" }}
    >
      <img src="/favicon.svg" width={size} height={size} alt="Operator Logo" className={className} />
    </motion.div>
  );
}
