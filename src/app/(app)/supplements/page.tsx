'use client'

import { useState } from 'react'
import {
  useSupplements, useCreateSupplement, useRemoveSupplement,
  useLogSupplement, useTodaySupplementLogs,
} from '@/lib/hooks/useSupplements'
import { Plus, Trash2, CheckCircle2 } from 'lucide-react'

export default function SupplementsPage() {
  const { data: supplements, isLoading } = useSupplements()
  const { data: todayLogs }              = useTodaySupplementLogs()
  const create  = useCreateSupplement()
  const remove  = useRemoveSupplement()
  const logIntake = useLogSupplement()

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', doseAmount: '', doseUnit: 'mg', frequency: '', timing: '' })

  const takenIds = new Set(todayLogs?.map(l => l.supplementId) ?? [])

  const handleCreate = async () => {
    if (!form.name || !form.doseAmount) return
    await create.mutateAsync({
      name:       form.name,
      doseAmount: parseFloat(form.doseAmount),
      doseUnit:   form.doseUnit,
      frequency:  form.frequency || undefined,
      timing:     form.timing    || undefined,
    })
    setForm({ name: '', doseAmount: '', doseUnit: 'mg', frequency: '', timing: '' })
    setShowForm(false)
  }

  if (isLoading) return <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-surface rounded-xl animate-pulse" />)}</div>

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-text">Supplements</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 bg-primary text-[#0f1117] font-semibold rounded-lg px-3 py-2 text-sm hover:bg-primary-hover transition-colors"
        >
          <Plus size={16} /> Add
        </button>
      </div>

      {showForm && (
        <div className="bg-surface rounded-xl border border-border p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))}
              placeholder="Name (e.g. Creatine)"
              className="col-span-2 bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-faint focus:outline-none focus:border-primary" />
            <input value={form.doseAmount} onChange={e => setForm(p => ({...p, doseAmount: e.target.value}))}
              type="number" placeholder="Dose"
              className="bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-faint focus:outline-none focus:border-primary" />
            <select value={form.doseUnit} onChange={e => setForm(p => ({...p, doseUnit: e.target.value}))}
              className="bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary">
              {['mg','g','ml','IU','mcg','tablet','capsule','scoop'].map(u => <option key={u}>{u}</option>)}
            </select>
            <input value={form.frequency} onChange={e => setForm(p => ({...p, frequency: e.target.value}))}
              placeholder="Frequency (e.g. Daily)"
              className="bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-faint focus:outline-none focus:border-primary" />
            <input value={form.timing} onChange={e => setForm(p => ({...p, timing: e.target.value}))}
              placeholder="Timing (e.g. Morning, Pre-workout)"
              className="bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-faint focus:outline-none focus:border-primary" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreate} disabled={create.isPending}
              className="bg-primary text-[#0f1117] font-semibold rounded-lg px-4 py-2 text-sm hover:bg-primary-hover disabled:opacity-50 transition-colors">
              Save
            </button>
            <button onClick={() => setShowForm(false)} className="text-text-muted text-sm hover:text-text">Cancel</button>
          </div>
        </div>
      )}

      {(!supplements || supplements.length === 0) ? (
        <div className="bg-surface rounded-xl border border-border p-8 text-center">
          <p className="text-2xl mb-3">💪</p>
          <p className="text-text font-medium">No supplements yet</p>
          <p className="text-text-muted text-sm mt-1">Add supplements and track daily intake.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {supplements.map(s => (
            <li key={s.id} className="bg-surface rounded-xl border border-border px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text">{s.name}</p>
                <p className="text-xs text-text-muted">{s.doseAmount} {s.doseUnit}{s.timing ? ` · ${s.timing}` : ''}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => logIntake.mutate(s.id)}
                  disabled={takenIds.has(s.id)}
                  className="flex items-center gap-1 text-xs rounded-lg px-2.5 py-1.5 transition-colors disabled:opacity-40
                             bg-success/10 text-success hover:bg-success/20 disabled:cursor-not-allowed"
                >
                  <CheckCircle2 size={13} />
                  {takenIds.has(s.id) ? 'Taken' : 'Mark taken'}
                </button>
                <button onClick={() => remove.mutate(s.id)} className="text-text-faint hover:text-error transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
