/**
 * Decorative gradient divider used between page sections.
 * Renders a thin animated line with a pulsing dot in the center.
 */
export default function SectionDivider({ className = '' }) {
  return (
    <div className={`relative flex items-center justify-center py-8 ${className}`}>
      {/* Left line */}
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-brand-500/30 to-brand-500/40" />
      {/* Center dot */}
      <div className="relative mx-4">
        <div className="w-2 h-2 rounded-full bg-brand-400 shadow-[0_0_12px_rgba(251,191,36,0.6)]" />
        <div className="absolute inset-0 w-2 h-2 rounded-full bg-brand-400 animate-ping opacity-40" />
      </div>
      {/* Right line */}
      <div className="flex-1 h-px bg-gradient-to-l from-transparent via-brand-500/30 to-brand-500/40" />
    </div>
  );
}
