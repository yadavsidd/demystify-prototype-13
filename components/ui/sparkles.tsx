
"use client";
import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  color: string;
}

export const SparklesCore = (props: {
  id?: string;
  background?: string;
  minSize?: number;
  maxSize?: number;
  particleDensity?: number;
  className?: string;
  particleColor?: string;
}) => {
  const {
    background = "transparent",
    minSize = 0.4,
    maxSize = 1,
    particleDensity = 100,
    className,
    particleColor = "#FFFFFF",
  } = props;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const handleResize = () => {
        const { width, height } = canvas.parentElement?.getBoundingClientRect() || { width: window.innerWidth, height: window.innerHeight };
        canvas.width = width;
        canvas.height = height;
        initParticles(width, height);
      };

      const initParticles = (width: number, height: number) => {
        const newParticles: Particle[] = [];
        // If density is small (<1), treat as density factor per area, else treat as count
        const count = particleDensity < 1 
            ? Math.floor(width * height * particleDensity) 
            : particleDensity;
            
        for (let i = 0; i < count; i++) {
          newParticles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * (maxSize - minSize) + minSize,
            speedX: Math.random() * 0.2 - 0.1, // Reduced speed
            speedY: Math.random() * 0.2 - 0.1, // Reduced speed
            opacity: Math.random(),
            color: particleColor,
          });
        }
        setParticles(newParticles);
      };

      handleResize();
      
      // Observe resize
      const resizeObserver = new ResizeObserver(() => {
           if (canvasRef.current && canvasRef.current.parentElement) {
                handleResize();
           }
      });
      if (canvas.parentElement) {
          resizeObserver.observe(canvas.parentElement);
      }

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [minSize, maxSize, particleDensity, particleColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.opacity -= 0.002; // Slower fade out

        if (p.opacity <= 0) {
          p.x = Math.random() * canvas.width;
          p.y = Math.random() * canvas.height;
          p.opacity = 1;
        }
        
        // Wrap around screen
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color; // Use the hex color directly for fillStyle
        ctx.globalAlpha = p.opacity; // Control opacity via globalAlpha
        ctx.fill();
        ctx.globalAlpha = 1.0; // Reset alpha
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [particles]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("w-full h-full pointer-events-none", className)}
      style={{ background }}
    />
  );
};