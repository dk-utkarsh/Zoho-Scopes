"use client";

import React, { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  r: number;
  baseAlpha: number;
  speed: number;
}

function createStarField(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.scale(dpr, dpr);

  const w = window.innerWidth;
  const h = window.innerHeight;

  const stars: Star[] = [];
  for (let i = 0; i < 600; i++) {
    stars.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 2 + 0.2,
      baseAlpha: Math.random() * 0.7 + 0.3,
      speed: Math.random() * 2 + 0.5,
    });
  }

  let animId: number;
  let tick = 0;

  function render() {
    if (!ctx) return;
    ctx.clearRect(0, 0, w, h);
    tick += 0.008;

    for (const star of stars) {
      const twinkle =
        star.baseAlpha +
        Math.sin(tick * star.speed + star.x * 0.02) * 0.3;
      const alpha = Math.max(0.05, Math.min(1, twinkle));

      // Glow layer
      if (star.r > 1) {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180, 200, 255, ${alpha * 0.08})`;
        ctx.fill();
      }

      // Star core
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fill();
    }

    animId = requestAnimationFrame(render);
  }

  render();
  return () => cancelAnimationFrame(animId);
}

export const AuroraBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    let cleanup = createStarField(canvasRef.current);

    const onResize = () => {
      if (!canvasRef.current) return;
      cleanup?.();
      cleanup = createStarField(canvasRef.current);
    };

    window.addEventListener("resize", onResize);
    return () => {
      cleanup?.();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[#030014]">
      {/* Stars */}
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Multi-layer aurora */}
      <div className="aurora-layer aurora-layer-1" />
      <div className="aurora-layer aurora-layer-2" />
      <div className="aurora-layer aurora-layer-3" />

      {/* Top vignette for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#030014] via-transparent to-transparent opacity-60" />
    </div>
  );
};
