import { useEffect, useState } from "react";

/**
 * True on touch / coarse-pointer devices (phones, most tablets). Used to gate
 * pointer-driven, repaint-heavy effects (cursor spotlight, hover parallax) that
 * are pure cost on mobile — they never fire usefully without a real cursor and
 * just burn battery/frame budget. SSR-safe: starts false, resolves after mount.
 */
export function useCoarsePointer() {
  const [coarse, setCoarse] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    setCoarse(mq.matches);
    const onChange = () => setCoarse(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return coarse;
}
