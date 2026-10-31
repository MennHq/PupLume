import React, { useEffect, useRef } from 'react';

interface FullScreenConfettiProps {
  onComplete?: () => void;
  durationMs?: number;
}

interface ConfettiParticle {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  wobble: number;
  wobbleSpeed: number;
  opacity: number;
  shape: 'rect' | 'circle' | 'ribbon';
}

const CONFETTI_COLORS = [
  '#F59E0B', // Amber Gold
  '#8B5E3C', // Pup Caramel
  '#10B981', // Emerald
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#0EA5E9', // Sky Blue
  '#F97316', // Orange
  '#EAB308', // Bright Yellow
];

export const FullScreenConfetti: React.FC<FullScreenConfettiProps> = ({
  onComplete,
  durationMs = 4500,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Generate initial batch of particles
    const particleCount = 180;
    const particles: ConfettiParticle[] = [];

    for (let i = 0; i < particleCount; i++) {
      // Spawn across the top half with explosion spread
      const fromLeft = Math.random() < 0.5;
      const startX = fromLeft 
        ? Math.random() * (width * 0.4)
        : width * 0.6 + Math.random() * (width * 0.4);
      
      const angle = fromLeft
        ? (Math.random() * 50 + 20) * (Math.PI / 180) // 20 to 70 deg
        : (Math.random() * 50 + 110) * (Math.PI / 180); // 110 to 160 deg

      const speed = Math.random() * 12 + 6;
      const vx = Math.cos(angle) * speed * (fromLeft ? 1 : -1) + (Math.random() - 0.5) * 3;
      const vy = -Math.sin(angle) * speed - Math.random() * 4;

      particles.push({
        x: startX,
        y: height * 0.35 + (Math.random() - 0.5) * 80,
        w: Math.random() * 10 + 6,
        h: Math.random() * 14 + 8,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        vx,
        vy,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        wobble: Math.random() * 10,
        wobbleSpeed: Math.random() * 0.1 + 0.05,
        opacity: 1,
        shape: Math.random() > 0.4 ? 'rect' : Math.random() > 0.5 ? 'ribbon' : 'circle',
      });
    }

    const startTime = performance.now();

    const render = (time: number) => {
      const elapsed = time - startTime;
      const progress = elapsed / durationMs;

      ctx.clearRect(0, 0, width, height);

      let activeParticles = 0;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Apply physics
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.28; // Gravity
        p.vx *= 0.985; // Air drag
        p.rotation += p.rotationSpeed;
        p.wobble += p.wobbleSpeed;

        // Fade out near the end
        if (progress > 0.65) {
          p.opacity = Math.max(0, 1 - (progress - 0.65) / 0.35);
        }

        if (p.opacity > 0 && p.y < height + 50) {
          activeParticles++;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = p.opacity;
          ctx.fillStyle = p.color;

          const scaleX = Math.cos(p.wobble);

          if (p.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
            ctx.fill();
          } else if (p.shape === 'ribbon') {
            ctx.fillRect(-p.w / 2 * scaleX, -p.h / 2, p.w * scaleX, p.h * 1.4);
          } else {
            ctx.fillRect(-p.w / 2 * scaleX, -p.h / 2, p.w * scaleX, p.h);
          }

          ctx.restore();
        }
      }

      if (progress < 1 && activeParticles > 0) {
        animationFrameId = requestAnimationFrame(render);
      } else {
        if (onComplete) onComplete();
      }
    };

    animationFrameId = requestAnimationFrame(render);

    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, durationMs + 100);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [durationMs, onComplete]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[999999]"
      style={{ width: '100vw', height: '100vh' }}
    />
  );
};
