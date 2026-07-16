import { useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

/**
 * PostFX — the "AAA" pass: HDR bloom over the whole room so every LED,
 * hologram and amber strip actually glows. Ships from three's own
 * examples (no new dependency). Mount only when enabled — the positive
 * useFrame priority takes over rendering from R3F, so an unmounted PostFX
 * costs exactly nothing and R3F renders as before.
 */

/** Decide whether this device gets the bloom pass. `?fx=1|0` overrides. */
export function autoFx(reduced: boolean): boolean {
  if (typeof window === "undefined") return false;
  const q = new URLSearchParams(window.location.search).get("fx");
  if (q === "0") return false;
  if (q === "1") return true;
  if (reduced) return false;
  const nav = navigator as Navigator & { deviceMemory?: number };
  const mobile = /Android|iPhone|iPad|Mobile/i.test(nav.userAgent);
  const cores = nav.hardwareConcurrency ?? 4;
  return !mobile && (nav.deviceMemory === undefined || nav.deviceMemory >= 4) && cores >= 4;
}

export function PostFX() {
  const { gl, scene, camera, size } = useThree();

  const composer = useMemo(() => {
    // HalfFloat + MSAA target keeps bloom banding-free without FXAA.
    const target = new THREE.WebGLRenderTarget(size.width, size.height, {
      samples: 4,
      type: THREE.HalfFloatType,
    });
    const c = new EffectComposer(gl, target);
    c.addPass(new RenderPass(scene, camera));
    c.addPass(
      new UnrealBloomPass(
        new THREE.Vector2(Math.max(1, size.width / 2), Math.max(1, size.height / 2)),
        0.3, // strength — a glow, not a smear
        0.5, // radius
        0.9, // threshold — only emissive/self-lit surfaces bloom
      ),
    );
    c.addPass(new OutputPass()); // tone mapping + sRGB, same as R3F default
    return c;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- camera/scene/gl stable per Canvas
  }, [gl, scene, camera]);

  useEffect(() => {
    composer.setSize(size.width, size.height);
    composer.setPixelRatio(gl.getPixelRatio());
  }, [composer, gl, size.width, size.height]);

  useEffect(() => () => composer.dispose(), [composer]);

  // Priority 1: R3F stops auto-rendering and this pass draws the frame.
  useFrame(() => {
    composer.render();
  }, 1);

  return null;
}
