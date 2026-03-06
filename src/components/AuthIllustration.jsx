export default function AuthIllustration() {
  return (
    <svg
      viewBox="0 0 480 480"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', maxWidth: '400px' }}
    >
      {/* Shield body */}
      <path
        d="M240 60 L380 120 L380 260 Q380 360 240 430 Q100 360 100 260 L100 120 Z"
        fill="#eef0ff"
        stroke="#4834d4"
        strokeWidth="3"
      />
      <path
        d="M240 80 L360 132 L360 256 Q360 344 240 408 Q120 344 120 256 L120 132 Z"
        fill="#f5f3ff"
      />

      {/* Inner shield highlight */}
      <path
        d="M240 100 L340 144 L340 252 Q340 328 240 386 Q140 328 140 252 L140 144 Z"
        fill="#fff"
        stroke="#d4d0f8"
        strokeWidth="1.5"
      />

      {/* Checkmark circle */}
      <circle cx="240" cy="220" r="60" fill="#4834d4" opacity="0.1" />
      <circle cx="240" cy="220" r="48" fill="#4834d4" />
      <path
        d="M215 220 L232 237 L268 201"
        stroke="#fff"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Person silhouette above shield */}
      <circle cx="240" cy="140" r="20" fill="#4834d4" opacity="0.15" />
      <circle cx="240" cy="140" r="14" fill="#4834d4" opacity="0.25" />

      {/* ID card lines */}
      <rect x="195" y="280" width="90" height="6" rx="3" fill="#4834d4" opacity="0.15" />
      <rect x="210" y="296" width="60" height="4" rx="2" fill="#4834d4" opacity="0.1" />

      {/* Floating verification badges */}
      <g transform="translate(70, 160)">
        <circle cx="0" cy="0" r="18" fill="#22c55e" opacity="0.15" />
        <circle cx="0" cy="0" r="12" fill="#22c55e" />
        <path d="M-5 0 L-1.5 3.5 L6 -3" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>

      <g transform="translate(410, 180)">
        <circle cx="0" cy="0" r="18" fill="#3b82f6" opacity="0.15" />
        <circle cx="0" cy="0" r="12" fill="#3b82f6" />
        <path d="M-4 -2 L0 -2 L0 4 M-4 4 L4 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none" />
      </g>

      <g transform="translate(90, 310)">
        <circle cx="0" cy="0" r="15" fill="#f59e0b" opacity="0.15" />
        <circle cx="0" cy="0" r="10" fill="#f59e0b" />
        <path d="M0 -4 L0 1 M0 3.5 L0 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none" />
      </g>

      <g transform="translate(395, 300)">
        <circle cx="0" cy="0" r="15" fill="#8b5cf6" opacity="0.15" />
        <circle cx="0" cy="0" r="10" fill="#8b5cf6" />
        <path d="M-3 0 A3 3 0 0 1 3 0 A3 3 0 0 1 -3 0" stroke="#fff" strokeWidth="1.8" fill="none" />
        <circle cx="0" cy="0" r="1" fill="#fff" />
      </g>

      {/* Decorative dots */}
      <circle cx="150" cy="100" r="3" fill="#4834d4" opacity="0.2" />
      <circle cx="340" cy="110" r="3" fill="#4834d4" opacity="0.2" />
      <circle cx="120" cy="380" r="2.5" fill="#4834d4" opacity="0.15" />
      <circle cx="370" cy="370" r="2.5" fill="#4834d4" opacity="0.15" />
      <circle cx="60" cy="240" r="2" fill="#4834d4" opacity="0.12" />
      <circle cx="420" cy="250" r="2" fill="#4834d4" opacity="0.12" />

      {/* Connection lines */}
      <line x1="88" y1="168" x2="140" y2="185" stroke="#4834d4" strokeWidth="1" opacity="0.1" strokeDasharray="4 3" />
      <line x1="392" y1="188" x2="340" y2="205" stroke="#4834d4" strokeWidth="1" opacity="0.1" strokeDasharray="4 3" />
    </svg>
  );
}
