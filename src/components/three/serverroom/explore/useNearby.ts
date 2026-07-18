import { useEffect, useState } from "react";
import { player } from "./store";

/**
 * useNearby — cheap distance culling for heavy drei Html panels: polls the
 * mutable player singleton at 2.5 Hz (no per-frame React) and reports
 * whether the point is within radius. Small hysteresis so panels don't
 * flap at the boundary. Far panels unmount their DOM entirely — that's
 * where the FPS goes on low-end devices.
 */
export function useNearby(x: number, z: number, radius = 18): boolean {
  const [near, setNear] = useState(false);

  useEffect(() => {
    const check = () => {
      const d = Math.hypot(player.x - x, player.z - z);
      setNear((prev) => (prev ? d < radius + 2 : d < radius));
    };
    check();
    const id = setInterval(check, 400);
    return () => clearInterval(id);
  }, [x, z, radius]);

  return near;
}
