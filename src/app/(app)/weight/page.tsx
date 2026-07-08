'use client'

import { useState } from 'react'
import { useWeightHistory, useLogWeight, useDeleteWeight } from '@/lib/hooks/useWeight'
import { Scale, Plus, Trash2, TrendingDown, TrendingUp, Minus } from 'lucide-react'

function StatBadge({ delta }: { delta: number }) {
  if (delta === 0) return <span className="flex items-center gap-1 text-text-muted text-xs"><Minus size={12} /> No change</span>
  const lost = delta < 0
  return (
    <span className={`flex items-center gap-1 text-xs font-medium ${lost ? 'text-green-500' : 'text-orange-400'}`}>
      {lost ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
      {lost ? `${Math.abs(delta).toFixed(1)} kg lost` : `${delta.toFixed(1)} kg gained`}
    </span>
  )
}

export default function WeightPage() {
  const { data, isLoading } = useWeightHistory({ limit: 90 })
  const logWeight   = useLogWeight()
  const deleteEntry = useDeleteWeight()

  const [kg,   setKg]   = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [showForm, setShowForm] = useState(false)

  const handleSubmit = async () => {
    const w = parseFloat(kg)
    if (isNaN(w) || w < 20 || w > 500) return
    await logWeight.mutateAsync({ weightKg: w, note: note || undefined, recordedAt: date })
    setKg(''); setNote(''); setShowForm(false)
  }

  const entries  = data?.entries ?? []
  const stats    = data?.stats

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-text flex items-center gap-2">
            <Scale size={22} className="text-primary" /> Weight History
          </h2>
          <p className="text-text-muted text-sm mt-0.5">Track your body weight over time.</p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-1.5 bg-primary text-[#0f1117] font-semibold rounded-lg px-3 py-2 text-sm hover:bg-primary-hover transition-colors"
        >
          <Plus size={16} /> Log weight
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-text-muted mb-1 block">Weight (kg)</label>
              <input type="number" step="0.1" min="20" max="500" value={kg} onChange={e => setKg(e.target.value)}
                placeholder="70.5"
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1 block">Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary" />
            </div>
          </div>
          <input value={note} onChange={e => setNote(e.target.value)} placeholder="Optional note…"
            className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-faint focus:outline-none focus:border-primary" />
          <div className="flex gap-2">
            <button onClick={handleSubmit} disabled={!kg || logWeight.isPending}
              className="bg-primary text-[#0f1117] font-semibold rounded-lg px-4 py-2 text-sm hover:bg-primary-hover disabled:opacity-50 transition-colors">
              Save
            </button>
            <button onClick={() => setShowForm(false)} className="text-text-muted text-sm hover:text-text">Cancel</button>
          </div>
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Current',  value: `${entries[entries.length - 1]?.weightKg?.toFixed(1)} kg` },
            { label: 'Minimum',  value: `${stats.minWeight.toFixed(1)} kg` },
            { label: 'Maximum',  value: `${stats.maxWeight.toFixed(1)} kg` },
            { label: 'Entries',  value: stats.count },
          ].map(({ label, value }) => (
            <div key={label} className="bg-surface border border-border rounded-xl px-4 py-3 text-center">
              <p className="text-xs text-text-muted uppercase tracking-wide">{label}</p>
              <p className="text-base font-semibold text-text mt-1">{value}</p>
            </div>
          ))}
          <div className="col-span-2 sm:col-span-4 bg-surface border border-border rounded-xl px-4 py-3 flex items-center gap-3">
            <span className="text-xs text-text-muted">Overall trend:</span>
            <StatBadge delta={stats.delta} />
          </div>
        </div>
      )}

      {/* Simple chart (sparkline using SVG) */}
      {entries.length > 1 && (
        <div className="bg-surface border border-border rounded-xl p-4">
          <p className="text-xs text-text-muted mb-3">Last {entries.length} entries</p>
          <WeightSparkline entries={entries} />
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-surface rounded-xl animate-pulse" />)}</div>
      ) : entries.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-10 text-center">
          <p className="text-3xl mb-3">⚖️</p>
          <p className="text-text font-medium">No entries yet</p>
          <p className="text-text-muted text-sm mt-1">Log your first weight to start tracking.</p>
        </div>
      ) : (
        <ul className="divide-y divide-divider bg-surface border border-border rounded-xl overflow-hidden">
          {[...entries].reverse().map(entry => (
            <li key={entry.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-text">{entry.weightKg.toFixed(1)} kg</p>
                <p className="text-xs text-text-muted">
                  {new Date(entry.recordedAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  {entry.note && <> · {entry.note}</>}
                </p>
              </div>
              <button onClick={() => deleteEntry.mutate(entry.id)}
                className="text-text-faint hover:text-error transition-colors p-1">
                <Trash2 size={15} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// SVG sparkline inline (sin dependencias extra)
function WeightSparkline({ entries }: { entries: Array<{ weightKg: number }> }) {
  const W = 600; const H = 80; const PAD = 8
  const weights = entries.map(e => e.weightKg)
  const min = Math.min(...weights)
  const max = Math.max(...weights)
  const range = max - min || 1
  const pts = weights.map((w, i) => {
    const x = PAD + (i / (weights.length - 1)) * (W - PAD * 2)
    const y = H - PAD - ((w - min) / range) * (H - PAD * 2)
    return `${x},${y}`
  }).join(' ')

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-16" preserveAspectRatio="none">
      <polyline fill="none" stroke="var(--color-primary, #a3e635)" strokeWidth="2" points={pts} />
      {weights.map((w, i) => {
        const x = PAD + (i / (weights.length - 1)) * (W - PAD * 2)
        const y = H - PAD - ((w - min) / range) * (H - PAD * 2)
        return <circle key={i} cx={x} cy={y} r="3" fill="var(--color-primary, #a3e635)" />
      })}
    </svg>
  )
}
