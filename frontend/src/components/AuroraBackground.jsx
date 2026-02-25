/**
 * Animated aurora / gradient banner that flows behind page content.
 * Pure CSS animation — no JS cost.
 */
export default function AuroraBackground({ className = '' }) {
  return (
    <div className={`pointer-events-none fixed inset-0 z-0 overflow-hidden ${className}`} aria-hidden>
      {/* Primary aurora band */}
      <div className="aurora-band aurora-band-1" />
      {/* Secondary aurora band */}
      <div className="aurora-band aurora-band-2" />
      {/* Tertiary soft glow */}
      <div className="aurora-band aurora-band-3" />
    </div>
  );
}
