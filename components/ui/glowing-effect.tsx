
"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface GlowingEffectProps {
  blur?: number;
  inactiveZone?: number;
  proximity?: number;
  spread?: number;
  variant?: "default" | "white";
  glow?: boolean;
  className?: string;
  disabled?: boolean;
  movementDuration?: number;
  borderWidth?: number;
}

export const GlowingEffect = ({
  blur = 0,
  inactiveZone = 0.7,
  proximity = 0,
  spread = 20,
  variant = "default",
  glow = false,
  className,
  movementDuration = 2,
  borderWidth = 1,
  disabled = false,
}: GlowingEffectProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastPosition = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>(0);

  const handleMove = useCallback(
    (e?: MouseEvent | { x: number; y: number }) => {
      if (!containerRef.current) return;

      if (disabled) return;

      const { left, top, width, height } =
        containerRef.current.getBoundingClientRect();

      const x = (e?.x ?? lastPosition.current.x) - left;
      const y = (e?.y ?? lastPosition.current.y) - top;

      if (e) {
        lastPosition.current = { x: e.x, y: e.y };
      }

      const center = { x: width / 2, y: height / 2 };
      const distanceFromCenter = Math.hypot(x - center.x, y - center.y);
      const isInactive =
        distanceFromCenter > Math.max(width, height) * inactiveZone;

      if (isInactive) {
        containerRef.current.style.setProperty("--active", "0");
        return;
      }

      const active =
        proximity > 0
          ? 1 - Math.min(distanceFromCenter, proximity) / proximity
          : 1;

      containerRef.current.style.setProperty("--x", `${x}px`);
      containerRef.current.style.setProperty("--y", `${y}px`);
      containerRef.current.style.setProperty("--active", `${active}`);
      if (glow) {
        containerRef.current.style.setProperty("--opacity", `${active}`);
      }
    },
    [proximity, inactiveZone, glow, disabled]
  );

  useEffect(() => {
    if (disabled) return;

    const handlePointerMove = (e: PointerEvent) => {
      handleMove(e);
    };

    const handlePointerLeave = () => {
      if (containerRef.current) {
        containerRef.current.style.setProperty("--active", "0");
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [handleMove, disabled]);

  return (
    <>
      <div
        className={cn(
          "pointer-events-none absolute -inset-px rounded-[inherit] opacity-0 transition-opacity",
          glow && "opacity-100",
          variant === "white" && "border-white",
          disabled && "!block"
        )}
        style={
          {
            "--blur": `${blur}px`,
            "--spread": `${spread}px`,
            "--start": "0",
            "--active": "0",
            "--glowingeffect-border-width": `${borderWidth}px`,
            "--repeating-conic-gradient-times": "5",
            "--gradient":
              variant === "white"
                ? `repeating-linear-gradient(
                  to right,
                  #000000 0%,
                  #ffffff 50%,
                  #000000 100%
                )`
                : `radial-gradient(
                  circle,
                  #dd7bbb 10%,
                  #dd7bbb00 20%
                ), radial-gradient(
                  circle at 40% 40%,
                  #d79f1e 5%,
                  #d79f1e00 15%
                ), radial-gradient(
                  circle at 60% 60%,
                  #ffffff 10%,
                  #ffffff00 20%
                ), radial-gradient(
                  circle at 40% 60%,
                  #4c7894 10%,
                  #4c789400 20%
                ), repeating-linear-gradient(
                  to right,
                  #cdcdcd 0%,
                  #999999 50%,
                  #cdcdcd 100%
                )`,
          } as React.CSSProperties
        }
        ref={containerRef}
      >
        <div
          className={cn(
            "glow",
            "rounded-[inherit]",
            'after:content-[""] after:absolute after:inset-[calc(-1*var(--glowingeffect-border-width))] after:[border:var(--glowingeffect-border-width)_solid_transparent] after:[background:var(--gradient)] after:[background-attachment:fixed] after:opacity-[var(--active)] after:[mask-clip:padding-box,border-box] after:[mask-composite:intersect] after:[mask-image:linear-gradient(#000000,#000000),linear-gradient(#000000,#000000)]',
            className
          )}
        />
      </div>
    </>
  );
};
