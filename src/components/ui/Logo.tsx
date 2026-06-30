export default function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-label="JLean"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Hoja / leaf — representa nutrición */}
      <path
        d="M16 4C16 4 6 8 6 18C6 23.5 10.5 28 16 28C21.5 28 26 23.5 26 18C26 8 16 4 16 4Z"
        fill="var(--color-primary)"
        fillOpacity="0.15"
      />
      <path
        d="M16 4C16 4 6 8 6 18C6 23.5 10.5 28 16 28"
        stroke="var(--color-primary)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M16 28C21.5 28 26 23.5 26 18C26 8 16 4 16 4"
        stroke="var(--color-primary)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Línea central — vena de hoja */}
      <path
        d="M16 8V24"
        stroke="var(--color-primary)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="2 2"
      />
    </svg>
  )
}