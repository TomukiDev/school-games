type Props = {
  hour24: number;
  minute: number;
  className?: string;
};

const CX = 100;
const CY = 100;

/** Hands point to 12 o'clock by default; positive SVG rotate is clockwise. */
export default function AnalogClock({ hour24, minute, className = "" }: Props) {
  const minuteRotation = minute * 6;
  const hourRotation = (hour24 % 12) * 30 + minute * 0.5;

  const ticks = [];
  for (let i = 0; i < 60; i++) {
    const isHour = i % 5 === 0;
    const len = isHour ? 10 : 5;
    const outer = 92;
    const inner = outer - len;
    const a = (i * 6 * Math.PI) / 180 - Math.PI / 2;
    const x1 = CX + outer * Math.cos(a);
    const y1 = CY + outer * Math.sin(a);
    const x2 = CX + inner * Math.cos(a);
    const y2 = CY + inner * Math.sin(a);
    ticks.push(
      <line
        key={i}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={isHour ? "#92400E" : "#D6D3D1"}
        strokeWidth={isHour ? 2.5 : 1}
        strokeLinecap="round"
      />,
    );
  }

  const numbers = [];
  for (let n = 1; n <= 12; n++) {
    const angleDeg = -90 + n * 30;
    const rad = (angleDeg * Math.PI) / 180;
    const r = 74;
    const x = CX + r * Math.cos(rad);
    const y = CY + r * Math.sin(rad);
    const colors = ["#BE185D", "#0369A1", "#B45309", "#15803D", "#7C3AED", "#C2410C"];
    numbers.push(
      <text
        key={n}
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="system-ui, sans-serif"
        fontSize="15"
        fontWeight="800"
        fill={colors[(n - 1) % colors.length]}
      >
        {n}
      </text>,
    );
  }

  return (
    <div className={`flex justify-center ${className}`}>
      <svg
        viewBox="0 0 200 200"
        className="h-56 w-56 max-w-[min(100%,18rem)] drop-shadow-lg sm:h-72 sm:w-72"
        role="img"
        aria-hidden
      >
        <defs>
          <linearGradient id="clockFaceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FEF9C3" />
            <stop offset="50%" stopColor="#FCE7F3" />
            <stop offset="100%" stopColor="#E0F2FE" />
          </linearGradient>
          <linearGradient id="clockRim" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>

        <circle cx={CX} cy={CY} r="96" fill="url(#clockRim)" />
        <circle cx={CX} cy={CY} r="90" fill="url(#clockFaceGrad)" stroke="#F59E0B" strokeWidth="3" />

        {ticks}
        {numbers}

        {/* Hour hand */}
        <g transform={`rotate(${hourRotation} ${CX} ${CY})`}>
          <line
            x1={CX}
            y1={CY}
            x2={CX}
            y2={52}
            stroke="#1D4ED8"
            strokeWidth="8"
            strokeLinecap="round"
          />
        </g>

        {/* Minute hand */}
        <g transform={`rotate(${minuteRotation} ${CX} ${CY})`}>
          <line
            x1={CX}
            y1={CY}
            x2={CX}
            y2={36}
            stroke="#DC2626"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </g>

        {/* Center hub + smile */}
        <circle cx={CX} cy={CY} r="10" fill="#F472B6" stroke="#BE185D" strokeWidth="2" />
        <ellipse cx={CX - 4} cy={CY - 2} rx="3" ry="4" fill="#1F2937" />
        <ellipse cx={CX + 4} cy={CY - 2} rx="3" ry="4" fill="#1F2937" />
        <path
          d={`M ${CX - 10} ${CY + 8} Q ${CX} ${CY + 18} ${CX + 10} ${CY + 8}`}
          fill="none"
          stroke="#BE185D"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
