import { useMemo } from 'react';

/**
 * Floating particles / bokeh background decoration.
 * Renders animated circles that drift upward at random speeds.
 * Uses pure CSS animations — zero JS runtime cost.
 */
export default function FloatingParticles({ count = 30, className = '' }) {
  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const size = Math.random() * 4 + 1;            // 1–5 px
      const left = Math.random() * 100;               // 0–100 vw
      const delay = Math.random() * 12;               // 0–12 s
      const duration = Math.random() * 14 + 10;       // 10–24 s
      const opacity = Math.random() * 0.35 + 0.05;    // 0.05–0.4
      const drift = (Math.random() - 0.5) * 60;       // horizontal sway
      const hue = Math.random() > 0.5 ? '45' : '38';  // amber / golden range
      return { id: i, size, left, delay, duration, opacity, drift, hue };
    });
  }, [count]);

  return (
    <div className={`pointer-events-none fixed inset-0 overflow-hidden z-0 ${className}`} aria-hidden>
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.left}%`,
            bottom: '-5%',
            opacity: p.opacity,
            background: `hsl(${p.hue}, 92%, 64%)`,
            boxShadow: `0 0 ${p.size * 3}px hsl(${p.hue}, 92%, 64%, 0.4)`,
            animation: `particleFloat ${p.duration}s ${p.delay}s linear infinite`,
            '--drift': `${p.drift}px`,
          }}
        />
      ))}
    </div>
  );
}
