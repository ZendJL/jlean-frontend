'use client'

import { useMemo, useState } from 'react'
import { AlertTriangle, Info, Plus } from 'lucide-react'
import { useCreateFood, useFoodSources } from '@/lib/hooks/useFoods'

const qualityTone: Record<string, string> = {
  COMPLETE: 'border-success/30 bg-success/5 text-success',
  PARTIAL: 'border-warning/30 bg-warning/5 text-warning',
  UNVERIFIED: 'border-warning/30 bg-warning/5 text-warning',
  CONFLICTED: 'border-error/30 bg-error/5 text-error',
}

function estimateCalories(protein: number, carbs: number, fat: number) {
  return protein * 4 + carbs * 4 + fat * 9
}

export default function CreateFoodModal({ onClose }: { onClose: () => void }) {
  const createFood = useCreateFood()
  const { data: sources } = useFoodSources()
  const [form, setForm] = useState({
    name: '', servingSize: '', calories: '', protein: '', carbs: '', fat: '', sourceType: 'CUSTOM',
  })

  const numeric = useMemo(() => ({
    calories: Number(form.calories || 0),
    protein: Number(form.protein || 0),
    carbs: Number(form.carbs || 0),
    fat: Number(form.fat || 0),
  }), [form])

  const estimated = estimateCalories(numeric.protein, numeric.carbs, numeric.fat)
  const delta = Math.abs(numeric.calories - estimated)
  const hasMismatch = numeric.calories > 0 && delta >= 25
  const hasNegative = [numeric.calories, numeric.protein, numeric.carbs, numeric.fat].some(v => v < 0)
  const selectedSource = sources?.find(source => source.value === form.sourceType)

  const handleSubmit = async () => {
    if (!form.name.trim() || hasNegative) return
    await createFood.mutateAsync({
      name: form.name.trim(),
      servingSize: Number(form.servingSize || 100),
      calories: numeric.calories,
      protein: numeric.protein,
      carbs: numeric.carbs,
      fat: numeric.fat,
      sourceType: form.sourceType,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-border bg-surface p-5 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-text">Create food</h3>
            <p className="mt-1 text-sm text-text-muted">Add a custom food with macro validation and source context.</p>
          </div>
          <button onClick={onClose} className="text-sm text-text-muted hover:text-text">Close</button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs text-text-muted">Name</label>
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-sm text-text focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-text-muted">Serving size (g/ml)</label>
            <input type="number" value={form.servingSize} onChange={e => setForm(p => ({ ...p, servingSize: e.target.value }))}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-sm text-text focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-text-muted">Source</label>
            <select value={form.sourceType} onChange={e => setForm(p => ({ ...p, sourceType: e.target.value }))}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-sm text-text focus:border-primary focus:outline-none">
              {(sources ?? [{ value: 'CUSTOM', label: 'Custom', qualityStatus: 'COMPLETE' }]).map(source => (
                <option key={source.value} value={source.value}>{source.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-text-muted">Calories</label>
            <input type="number" value={form.calories} onChange={e => setForm(p => ({ ...p, calories: e.target.value }))}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-sm text-text focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-text-muted">Protein (g)</label>
            <input type="number" value={form.protein} onChange={e => setForm(p => ({ ...p, protein: e.target.value }))}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-sm text-text focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-text-muted">Carbs (g)</label>
            <input type="number" value={form.carbs} onChange={e => setForm(p => ({ ...p, carbs: e.target.value }))}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-sm text-text focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-text-muted">Fat (g)</label>
            <input type="number" value={form.fat} onChange={e => setForm(p => ({ ...p, fat: e.target.value }))}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-sm text-text focus:border-primary focus:outline-none" />
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {selectedSource?.qualityStatus && (
            <div className={`rounded-xl border px-3 py-2 text-sm ${qualityTone[selectedSource.qualityStatus] ?? 'border-border bg-bg text-text-muted'}`}>
              <div className="flex items-start gap-2">
                <Info size={15} className="mt-0.5" />
                <p>Source quality: <span className="font-medium">{selectedSource.qualityStatus}</span>{selectedSource.fallbackMessage ? ` · ${selectedSource.fallbackMessage}` : ''}</p>
              </div>
            </div>
          )}

          {hasNegative && (
            <div className="rounded-xl border border-error/30 bg-error/5 px-3 py-2 text-sm text-error">
              <div className="flex items-start gap-2">
                <AlertTriangle size={15} className="mt-0.5" />
                <p>Macros and calories cannot be negative.</p>
              </div>
            </div>
          )}

          {hasMismatch && (
            <div className="rounded-xl border border-warning/30 bg-warning/5 px-3 py-2 text-sm text-warning">
              <div className="flex items-start gap-2">
                <AlertTriangle size={15} className="mt-0.5" />
                <p>Declared calories differ from macro-estimated calories by {Math.round(delta)} kcal. Estimated: {Math.round(estimated)} kcal.</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-5 flex gap-2">
          <button onClick={handleSubmit} disabled={createFood.isPending || hasNegative}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-[#0f1117] transition-colors hover:bg-primary-hover disabled:opacity-50">
            <Plus size={15} /> Save food
          </button>
          <button onClick={onClose} className="text-sm text-text-muted hover:text-text">Cancel</button>
        </div>
      </div>
    </div>
  )
}
