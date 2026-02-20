export function TennisCourt() {
  return (
    <svg
      viewBox="0 0 360 540"
      className="w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Court Surface */}
      <rect
        x="0"
        y="0"
        width="360"
        height="540"
        fill="#2D8B57"
      />

      {/* Outer boundary */}
      <rect
        x="10"
        y="10"
        width="340"
        height="520"
        fill="none"
        stroke="white"
        strokeWidth="3"
      />

      {/* Singles Sidelines (inner) */}
      <line
        x1="50"
        y1="10"
        x2="50"
        y2="530"
        stroke="white"
        strokeWidth="2"
      />
      <line
        x1="310"
        y1="10"
        x2="310"
        y2="530"
        stroke="white"
        strokeWidth="2"
      />

      {/* Net - Center horizontal line */}
      <line
        x1="10"
        y1="270"
        x2="350"
        y2="270"
        stroke="white"
        strokeWidth="3"
      />

      {/* Service Lines (top court) */}
      <line
        x1="50"
        y1="140"
        x2="310"
        y2="140"
        stroke="white"
        strokeWidth="2"
      />

      {/* Service Lines (bottom court) */}
      <line
        x1="50"
        y1="400"
        x2="310"
        y2="400"
        stroke="white"
        strokeWidth="2"
      />

      {/* Center Service Line (top court) */}
      <line
        x1="180"
        y1="140"
        x2="180"
        y2="270"
        stroke="white"
        strokeWidth="2"
      />

      {/* Center Service Line (bottom court) */}
      <line
        x1="180"
        y1="270"
        x2="180"
        y2="400"
        stroke="white"
        strokeWidth="2"
      />

      {/* Center Mark on Baseline (top) */}
      <line
        x1="180"
        y1="10"
        x2="180"
        y2="20"
        stroke="white"
        strokeWidth="3"
      />

      {/* Center Mark on Baseline (bottom) */}
      <line
        x1="180"
        y1="520"
        x2="180"
        y2="530"
        stroke="white"
        strokeWidth="3"
      />

      {/* Net representation - with mesh pattern */}
      <line
        x1="10"
        y1="270"
        x2="350"
        y2="270"
        stroke="rgba(200,200,200,0.6)"
        strokeWidth="8"
      />
      <rect
        x="10"
        y="266"
        width="340"
        height="8"
        fill="url(#netPattern)"
        opacity="0.5"
      />

      {/* Pattern definition for net */}
      <defs>
        <pattern id="netPattern" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
          <rect width="10" height="10" fill="white" opacity="0.3"/>
          <line x1="0" y1="0" x2="10" y2="10" stroke="gray" strokeWidth="1"/>
          <line x1="10" y1="0" x2="0" y2="10" stroke="gray" strokeWidth="1"/>
        </pattern>
      </defs>
    </svg>
  );
}
