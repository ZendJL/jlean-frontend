'use client'

import { useState } from 'react'
import { useFastingStatus, useFastingConfig, useSetFastingConfig } from '@/lib/hooks/useFasting'
import { Timer } from 'lucide-react'

const PRESETS = [
  { label: '16:8',  fastHours: 16, eatHours: 8  },
  { label: '18:6',  fastHours: 18, eatHours: 6  },
  { label: '20:4',  fastHours: 20, eatHours: 4  },
  { label: 'OMAD',  fastHours: 23, eatHours: 1  },
]

export default function FastingPage() {
  const { data: status }  = useFastingStatus()
  const { data: config }  = useFastingConfig()
  const setConfig         = useSetFastingConfig()

  const [form, setForm] = useState({ fastHours: 16, eatHours: 8, eatStartHour: 12 })

  const handlePreset = (preset: typeof PRESETS[0]) => {
    setForm(p => ({ ...p, fastHours: preset.fastHours, eatHours: preset.eatHours }))
  }

  const handleSave = () => {
    setConfig.mutate({ ...form, active: true })
  }

  return (
    <div className="space-y-6 max-w-xl">
      <h2 className="text-2xl font-semibold text-text">Intermittent Fasting</h2>

      {/* Status card */}
      {status?.active && (
        <div className={`rounded-xl border p-5 flex items-start gap-4 ${
          status.fasting
            ? 'border-primary/30 bg-primary/5'
            : 'border-success/30 bg-success/5'
        }`}>
          <Timer size={28} className={status.fasting ? 'text-primary' : 'text-success'} />
          <div>
            <p className="font-semibold text-text">{status.fasting ? 'Fasting now' : 'Eating window open'}</p>
            <p className="text-sm text-text-muted mt-0.5">{status.message}</p>
            <p className="text-xs text-text-faint mt-2">Window: {status.windowLabel} · Eating {status.eatStartHour}:00–{status.eatEndHour}:00</p>
          </div>
        </div>
      )}

      {/* Config form */}
      <div className="bg-surface rounded-xl border border-border p-5 space-y-4">
        <p className="text-sm font-medium text-text">Configure window</p>

        {/* Presets */}
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(p => (
            <button
              key={p.label}
              onClick={() => handlePreset(p)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors border ${
                form.fastHours === p.fastHours && form.eatHours === p.eatHours
                  ? 'border-primary bg-primary/10 text-primary font-medium'
                  : 'border-border text-text-muted hover:text-text'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-text-muted block mb-1">Fast hours</label>
            <input type="number" min={1} max={23} value={form.fastHours}
              onChange={e => setForm(p => ({...p, fastHours: Number(e.target.value)}))}
              className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="text-xs text-text-muted block mb-1">Eat hours</label>
            <input type="number" min={1} max={23} value={form.eatHours}
              onChange={e => setForm(p => ({...p, eatHours: Number(e.target.value)}))}
              className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="text-xs text-text-muted block mb-1">Eating starts at</label>
            <input type="number" min={0} max={23} value={form.eatStartHour}
              onChange={e => setForm(p => ({...p, eatStartHour: Number(e.target.value)}))}
              className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary" />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={setConfig.isPending}
          className="bg-primary text-[#0f1117] font-semibold rounded-lg px-5 py-2 text-sm hover:bg-primary-hover disabled:opacity-50 transition-colors"
        >
          Save configuration
        </button>
      </div>
    </div>
  )
}
