import { useEffect } from "react";
import { useMotionValue, useSpring } from "framer-motion";

/**
 * Tracks the cursor as smoothed motion values. Pass `enabled: false` (e.g. on
 * touch devices) to skip the listener entirely — no work, no idle spring.
 */
export function useMousePosition(enabled = true) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Apply spring for smoother transitions
  const smoothMouseX = useSpring(mouseX, { stiffness: 150, damping: 20 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 150, damping: 20 });

  useEffect(() => {
    if (!enabled) return;
    const updateMousePosition = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", updateMousePosition);
    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
    };
  }, [enabled, mouseX, mouseY]);

  return { mouseX: smoothMouseX, mouseY: smoothMouseY };
}
