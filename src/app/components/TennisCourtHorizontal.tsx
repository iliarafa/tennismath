export function TennisCourtHorizontal() {
  return (
    <svg
      viewBox="0 0 780 360"
      className="w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Court Surface */}
      <rect
        x="0"
        y="0"
        width="780"
        height="360"
        fill="#3A8B4F"
      />

      {/* Outer boundary */}
      <rect
        x="10"
        y="10"
        width="760"
        height="340"
        fill="none"
        stroke="white"
        strokeWidth="3"
      />

      {/* Singles Sidelines (inner horizontal lines) */}
      <line
        x1="10"
        y1="55"
        x2="770"
        y2="55"
        stroke="white"
        strokeWidth="2"
      />
      <line
        x1="10"
        y1="305"
        x2="770"
        y2="305"
        stroke="white"
        strokeWidth="2"
      />

      {/* Net - Center vertical line */}
      <line
        x1="390"
        y1="10"
        x2="390"
        y2="350"
        stroke="white"
        strokeWidth="3"
      />

      {/* Service Lines (left court) */}
      <line
        x1="195"
        y1="55"
        x2="195"
        y2="305"
        stroke="white"
        strokeWidth="2"
      />

      {/* Service Lines (right court) */}
      <line
        x1="585"
        y1="55"
        x2="585"
        y2="305"
        stroke="white"
        strokeWidth="2"
      />

      {/* Center Service Line (left court) */}
      <line
        x1="195"
        y1="180"
        x2="390"
        y2="180"
        stroke="white"
        strokeWidth="2"
      />

      {/* Center Service Line (right court) */}
      <line
        x1="390"
        y1="180"
        x2="585"
        y2="180"
        stroke="white"
        strokeWidth="2"
      />

      {/* Center Mark on Baseline (left) */}
      <line
        x1="10"
        y1="180"
        x2="20"
        y2="180"
        stroke="white"
        strokeWidth="3"
      />

      {/* Center Mark on Baseline (right) */}
      <line
        x1="760"
        y1="180"
        x2="770"
        y2="180"
        stroke="white"
        strokeWidth="3"
      />

      {/* Net representation with mesh effect */}
      <line
        x1="390"
        y1="10"
        x2="390"
        y2="350"
        stroke="rgba(255,255,255,0.8)"
        strokeWidth="6"
      />

      {/* Net posts */}
      <circle cx="390" cy="10" r="4" fill="white" />
      <circle cx="390" cy="350" r="4" fill="white" />

      {/* Subtle court texture lines */}
      <line x1="0" y1="90" x2="780" y2="90" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
      <line x1="0" y1="180" x2="780" y2="180" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
      <line x1="0" y1="270" x2="780" y2="270" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
    </svg>
  );
}
