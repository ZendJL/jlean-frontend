'use client'

import { useState } from 'react'
import { useLastSleep, useSleepHistory, useLogSleep } from '@/lib/hooks/useSleep'
import { Moon, Plus } from 'lucide-react'

function formatDuration(min: number) {
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${h}h ${m > 0 ? `${m}m` : ''}`
}

export default function SleepPage() {
  const { data: last }    = useLastSleep()
  const { data: history } = useSleepHistory()
  const logSleep          = useLogSleep()

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ bedtime: '', wakeTime: '', qualityScore: '' })

  const handleSubmit = async () => {
    if (!form.bedtime || !form.wakeTime) return
    await logSleep.mutateAsync({
      bedtime:  form.bedtime,
      wakeTime: form.wakeTime,
      qualityScore: form.qualityScore ? parseFloat(form.qualityScore) : undefined,
    })
    setForm({ bedtime: '', wakeTime: '', qualityScore: '' })
    setShowForm(false)
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-text">Sleep</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 bg-primary text-[#0f1117] font-semibold rounded-lg px-3 py-2 text-sm hover:bg-primary-hover transition-colors"
        >
          <Plus size={16} /> Log sleep
        </button>
      </div>

      {/* Last entry insight */}
      {last && (
        <div className="bg-surface rounded-xl border border-border p-4 flex items-start gap-4">
          <Moon size={28} className="text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-text">Last night: {last.hoursSlept}h slept</p>
            <p className="text-xs text-text-muted mt-0.5">{last.recommendation}</p>
          </div>
        </div>
      )}

      {showForm && (
        <div className="bg-surface rounded-xl border border-border p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-text-muted block mb-1">Bedtime</label>
              <input type="datetime-local" value={form.bedtime} onChange={e => setForm(p => ({...p, bedtime: e.target.value}))}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="text-xs text-text-muted block mb-1">Wake time</label>
              <input type="datetime-local" value={form.wakeTime} onChange={e => setForm(p => ({...p, wakeTime: e.target.value}))}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="text-xs text-text-muted block mb-1">Quality (0-10)</label>
              <input type="number" min={0} max={10} value={form.qualityScore} onChange={e => setForm(p => ({...p, qualityScore: e.target.value}))}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSubmit} disabled={logSleep.isPending}
              className="bg-primary text-[#0f1117] font-semibold rounded-lg px-4 py-2 text-sm hover:bg-primary-hover disabled:opacity-50 transition-colors">
              Save
            </button>
            <button onClick={() => setShowForm(false)} className="text-text-muted text-sm hover:text-text">Cancel</button>
          </div>
        </div>
      )}

      {/* History */}
      {history && history.length > 0 && (
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-divider">
            <p className="text-sm font-medium text-text">Last 14 nights</p>
          </div>
          <ul className="divide-y divide-divider">
            {history.map(entry => (
              <li key={entry.id} className="px-4 py-2.5 flex items-center justify-between">
                <p className="text-sm text-text">{new Date(entry.bedtime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                <div className="text-right">
                  <p className="text-sm font-medium text-text">{formatDuration(entry.durationMin)}</p>
                  {entry.qualityScore != null && (
                    <p className="text-xs text-text-faint">Quality {entry.qualityScore}/10</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
