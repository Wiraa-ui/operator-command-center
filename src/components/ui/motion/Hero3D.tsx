import { useEffect, useRef, useState } from "react";
import { useCoarsePointer } from "@/hooks/useCoarsePointer";

/**
 * Hero3D — a lightweight, dependency-free 3D node network.
 *
 * Nodes are distributed on a sphere (fibonacci) in real 3D space, rotated each
 * frame and projected with perspective onto a 2D canvas. Edges connect nearby
 * nodes; depth drives brightness so the cluster reads as a living "system
 * graph". The pointer adds a subtle parallax tilt. No WebGL / three.js — it
 * stays small, fast, and SSR-safe (the canvas only animates after mount).
 *
 * Mobile budget: fewer nodes (edges are O(n²)), capped DPR, no pointer parallax,
 * and the render loop pauses whenever the canvas scrolls out of view. With
 * prefers-reduced-motion it paints a single static frame and never loops.
 */

const ACCENT: [number, number, number] = [45, 212, 191]; // cyan, matches --op-accent
const EDGE_DISTANCE = 0.62; // as a fraction of diameter (in unit-sphere space)

type Node = { x: number; y: number; z: number; pulse: number };

function fibonacciSphere(n: number): Node[] {
  const nodes: Node[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2; // 1 → -1
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    nodes.push({
      x: Math.cos(theta) * r,
      y,
      z: Math.sin(theta) * r,
      pulse: Math.random() * Math.PI * 2,
    });
  }
  return nodes;
}

export function Hero3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);
  const coarse = useCoarsePointer();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Phones: lighter graph + lower resolution. Edge cost grows with n², so
    // trimming node count is the biggest single win on weak GPUs.
    const nodeCount = coarse ? 18 : 30;
    const maxDpr = coarse ? 1.5 : 2;
    const nodes = fibonacciSphere(nodeCount);

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, maxDpr);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Pointer parallax (smoothed targets) — desktop only.
    let pointerX = 0;
    let pointerY = 0;
    let rotX = 0;
    let rotY = 0;
    const onPointer = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointerX = ((e.clientX - rect.left) / rect.width - 0.5) * 2; // -1 → 1
      pointerY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    const usePointer = !coarse && !reduceMotion;
    if (usePointer) window.addEventListener("pointermove", onPointer);

    let angleY = 0;
    let raf = 0;
    let last = performance.now();

    const drawFrame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      if (!reduceMotion) angleY += dt * 0.18; // slow auto-rotation
      // Ease pointer-driven tilt.
      rotY += (pointerX * 0.5 - rotY) * 0.06;
      rotX += (-pointerY * 0.4 - rotX) * 0.06;

      const cy = Math.cos(angleY + rotY);
      const sy = Math.sin(angleY + rotY);
      const cx = Math.cos(rotX);
      const sx = Math.sin(rotX);

      const cxp = width / 2;
      const cyp = height / 2;
      const R = Math.min(width, height) * 0.42;
      const perspective = 2.4;

      // Project every node once.
      const pts = nodes.map((n) => {
        // rotate around Y
        const x1 = n.x * cy + n.z * sy;
        const z1 = -n.x * sy + n.z * cy;
        const y1 = n.y;
        // rotate around X
        const y2 = y1 * cx - z1 * sx;
        const z2 = y1 * sx + z1 * cx;
        const depth = (z2 + 1) / 2; // 0 (back) → 1 (front)
        const scale = perspective / (perspective - z2);
        return {
          sx: cxp + x1 * R * scale,
          sy: cyp - y2 * R * scale,
          depth,
          scale,
          pulse: n.pulse,
        };
      });

      ctx.clearRect(0, 0, width, height);

      // Edges — connect nodes that are near in 3D, fade by depth + distance.
      const maxDist = EDGE_DISTANCE * 2;
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
          if (d > maxDist) continue;
          const pa = pts[i];
          const pb = pts[j];
          const depth = (pa.depth + pb.depth) / 2;
          const alpha = (1 - d / maxDist) * (0.12 + depth * 0.4);
          ctx.strokeStyle = `rgba(${ACCENT[0]}, ${ACCENT[1]}, ${ACCENT[2]}, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(pa.sx, pa.sy);
          ctx.lineTo(pb.sx, pb.sy);
          ctx.stroke();
        }
      }

      // Nodes — back to front so nearer ones overlay.
      const order = pts.map((_, i) => i).sort((a, b) => pts[a].depth - pts[b].depth);
      const t = now / 1000;
      for (const i of order) {
        const p = pts[i];
        const twinkle = reduceMotion ? 1 : 0.6 + 0.4 * Math.sin(t * 1.6 + p.pulse);
        const radius = (1.1 + p.depth * 2.2) * p.scale;
        const alpha = 0.25 + p.depth * 0.75;

        ctx.shadowBlur = 10 * p.depth;
        ctx.shadowColor = `rgba(${ACCENT[0]}, ${ACCENT[1]}, ${ACCENT[2]}, ${0.7 * p.depth})`;
        ctx.fillStyle = `rgba(${ACCENT[0]}, ${ACCENT[1]}, ${ACCENT[2]}, ${alpha * twinkle})`;
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    };

    // Pause the loop while the hero is scrolled off-screen — no point burning
    // frames (and battery) when nobody can see it.
    let visible = true;

    const render = (now: number) => {
      raf = 0;
      drawFrame(now);
      if (!reduceMotion && visible) raf = requestAnimationFrame(render);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !reduceMotion && !raf) {
          last = performance.now();
          raf = requestAnimationFrame(render);
        }
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    if (reduceMotion) {
      drawFrame(performance.now()); // single static frame, no loop
    } else {
      raf = requestAnimationFrame(render);
    }

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      if (usePointer) window.removeEventListener("pointermove", onPointer);
    };
  }, [mounted, coarse]);

  return (
    <div className="relative h-full w-full min-h-[400px] lg:min-h-[600px]">
      {/* Ambient cyan bloom behind the network */}
      <div className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-op-accent-soft opacity-40 blur-3xl" />
      {!mounted ? (
        <div className="h-full w-full animate-pulse rounded-xl bg-op-surface-2" />
      ) : (
        <canvas ref={canvasRef} className="h-full w-full" aria-hidden="true" />
      )}
    </div>
  );
}
