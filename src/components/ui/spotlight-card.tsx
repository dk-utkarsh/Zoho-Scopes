"use client";

import React, { useEffect, useRef, ReactNode, useCallback } from "react";

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: "blue" | "purple" | "green" | "red" | "orange";
}

const glowColorMap = {
  blue: { base: 220, spread: 200 },
  purple: { base: 280, spread: 300 },
  green: { base: 120, spread: 200 },
  red: { base: 0, spread: 200 },
  orange: { base: 30, spread: 200 },
};

// Shared pointer position — one listener for all cards
let pointerX = 0;
let pointerY = 0;
let pointerXP = 0;
let pointerYP = 0;
let listenerAttached = false;

function ensurePointerListener() {
  if (listenerAttached) return;
  listenerAttached = true;
  document.addEventListener(
    "pointermove",
    (e) => {
      pointerX = e.clientX;
      pointerY = e.clientY;
      pointerXP = e.clientX / window.innerWidth;
      pointerYP = e.clientY / window.innerHeight;
    },
    { passive: true }
  );
}

const GlowCard: React.FC<GlowCardProps> = ({
  children,
  className = "",
  glowColor = "blue",
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ensurePointerListener();

    let animId: number;
    const update = () => {
      if (cardRef.current) {
        const s = cardRef.current.style;
        s.setProperty("--x", pointerX.toFixed(0));
        s.setProperty("--xp", pointerXP.toFixed(2));
        s.setProperty("--y", pointerY.toFixed(0));
        s.setProperty("--yp", pointerYP.toFixed(2));
      }
      animId = requestAnimationFrame(update);
    };
    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, []);

  const { base, spread } = glowColorMap[glowColor];

  const style: React.CSSProperties & Record<string, string | number> = {
    "--base": base,
    "--spread": spread,
    "--radius": "14",
    "--border": "1.5",
    "--backdrop": "hsl(0 0% 60% / 0.06)",
    "--backup-border": "var(--backdrop)",
    "--size": "200",
    "--outer": "1",
    "--border-size": "calc(var(--border, 2) * 1px)",
    "--spotlight-size": "calc(var(--size, 150) * 1px)",
    "--hue": "calc(var(--base) + (var(--xp, 0) * var(--spread, 0)))",
    backgroundImage: `radial-gradient(
      var(--spotlight-size) var(--spotlight-size) at
      calc(var(--x, 0) * 1px)
      calc(var(--y, 0) * 1px),
      hsl(var(--hue, 210) calc(var(--saturation, 100) * 1%) calc(var(--lightness, 70) * 1%) / var(--bg-spot-opacity, 0.1)), transparent
    )`,
    backgroundColor: "var(--backdrop, transparent)",
    backgroundSize:
      "calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)))",
    backgroundPosition: "50% 50%",
    backgroundAttachment: "fixed",
    border: "var(--border-size) solid var(--backup-border)",
    position: "relative",
    touchAction: "none",
  } as React.CSSProperties & Record<string, string | number>;

  return (
    <div
      ref={cardRef}
      data-glow
      style={style}
      className={`rounded-2xl relative backdrop-blur-[5px] ${className}`}
    >
      <div data-glow />
      {children}
    </div>
  );
};

export { GlowCard };
