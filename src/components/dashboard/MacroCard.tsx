'use client'

import MacroRing from './MacroRing'

interface Props {
  label:     string
  consumed:  number
  target:    number
  unit:      string
  color:     string
  progress:  number
}

export default function MacroCard({ label, consumed, target, unit, color, progress }: Props) {
  return (
    <div className="bg-surface rounded-xl p-4 border border-border flex items-center gap-4">
      <div className="relative shrink-0">
        <MacroRing value={progress} color={color} size={56} stroke={5} />
        <span
          className="absolute inset-0 flex items-center justify-center text-xs font-semibold"
          style={{ color }}
        >
          {progress}%
        </span>
      </div>
      <div className="min-w-0">
        <p className="text-text-muted text-xs uppercase tracking-wide">{label}</p>
        <p className="text-text font-semibold text-lg leading-tight">
          {consumed}<span className="text-text-faint text-sm font-normal">{unit}</span>
        </p>
        <p className="text-text-faint text-xs">/ {target}{unit}</p>
      </div>
    </div>
  )
}
