/**
 * Animated double-helix DNA strand decoration.
 * A pure SVG + CSS animation — no JS runtime.
 */
export default function DNAHelix({ className = '', height = 400 }) {
  const rungs = 14;
  const spacing = height / rungs;

  return (
    <svg
      viewBox={`0 0 80 ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`dna-helix-svg ${className}`}
      aria-hidden
      style={{ height, width: 80 }}
    >
      {/* Strand paths */}
      <path
        d={`M10 0 ${Array.from({ length: rungs }, (_, i) =>
          `Q${i % 2 === 0 ? 70 : 10} ${i * spacing + spacing * 0.5} ${i % 2 === 0 ? 10 : 70} ${(i + 1) * spacing}`
        ).join(' ')}`}
        stroke="url(#dna-grad-1)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
        className="dna-strand-1"
      />
      <path
        d={`M70 0 ${Array.from({ length: rungs }, (_, i) =>
          `Q${i % 2 === 0 ? 10 : 70} ${i * spacing + spacing * 0.5} ${i % 2 === 0 ? 70 : 10} ${(i + 1) * spacing}`
        ).join(' ')}`}
        stroke="url(#dna-grad-2)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
        className="dna-strand-2"
      />

      {/* Rungs */}
      {Array.from({ length: rungs }, (_, i) => {
        const y = (i + 0.5) * spacing;
        const phase = i % 2 === 0;
        const x1 = phase ? 28 : 22;
        const x2 = phase ? 52 : 58;
        return (
          <line
            key={i}
            x1={x1}
            y1={y}
            x2={x2}
            y2={y}
            stroke="rgba(251,191,36,0.18)"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="dna-rung"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        );
      })}

      {/* Small base-pair dots at rung ends */}
      {Array.from({ length: rungs }, (_, i) => {
        const y = (i + 0.5) * spacing;
        const phase = i % 2 === 0;
        const x1 = phase ? 28 : 22;
        const x2 = phase ? 52 : 58;
        return (
          <g key={`dots-${i}`}>
            <circle cx={x1} cy={y} r="2.5" fill="rgba(251,191,36,0.35)" className="dna-dot" style={{ animationDelay: `${i * 0.15}s` }} />
            <circle cx={x2} cy={y} r="2.5" fill="rgba(56,189,248,0.3)" className="dna-dot" style={{ animationDelay: `${i * 0.15 + 0.07}s` }} />
          </g>
        );
      })}

      <defs>
        <linearGradient id="dna-grad-1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.15" />
        </linearGradient>
        <linearGradient id="dna-grad-2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#818cf8" stopOpacity="0.15" />
        </linearGradient>
      </defs>
    </svg>
  );
}
