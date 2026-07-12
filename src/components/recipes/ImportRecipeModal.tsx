'use client'

import { useState } from 'react'
import { X, ChevronDown, ChevronUp } from 'lucide-react'
import type { BuildByMacrosResult, BuildByMicrosResult } from '@/lib/api/recipes.api'

type AnyResult = BuildByMacrosResult | BuildByMicrosResult

function isMacrosResult(r: AnyResult): r is BuildByMacrosResult {
  return 'targetCalories' in r
}

interface Props {
  result:   AnyResult
  onClose:  () => void
  onCreate: (name: string, servings: number) => Promise<void>
}

export default function ImportRecipeModal({ result, onClose, onCreate }: Props) {
  const [name, setName]         = useState('')
  const [servings, setServings] = useState(1)
  const [expanded, setExpanded] = useState(true)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const ingredients = result.ingredients ?? []

  const handleCreate = async () => {
    if (!name.trim()) { setError('Recipe name is required.'); return }
    setSaving(true)
    try {
      await onCreate(name.trim(), servings)
    } catch {
      setError('Could not create recipe. Please try again.')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface rounded-2xl border border-border w-full max-w-md shadow-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-divider shrink-0">
          <h2 className="text-base font-semibold text-text">Import Builder Suggestion</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          {/* Summary chips */}
          {isMacrosResult(result) && (
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Target',  val: `${result.targetCalories} kcal` },
                { label: 'Achieved', val: `${Math.round(result.achievedCalories ?? 0)} kcal` },
                { label: 'Protein', val: `${Number(result.achievedProteinG ?? 0).toFixed(1)}g` },
              ].map(c => (
                <span key={c.label} className="text-xs bg-surface-2 rounded-full px-3 py-1 text-text-muted">
                  <span className="font-medium text-text">{c.label}:</span> {c.val}
                </span>
              ))}
            </div>
          )}

          {/* Ingredients preview */}
          <div>
            <button
              className="flex items-center gap-1 text-xs font-semibold text-text-muted uppercase tracking-wide mb-2 hover:text-text"
              onClick={() => setExpanded(p => !p)}
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {ingredients.length} ingredient{ingredients.length !== 1 ? 's' : ''}
            </button>
            {expanded && (
              <ul className="divide-y divide-divider rounded-xl border border-border overflow-hidden">
                {ingredients.map((ing, i) => (
                  <li key={i} className="px-3 py-2 flex items-center justify-between bg-surface">
                    <div>
                      <p className="text-sm text-text">{ing.foodName}</p>
                      <p className="text-xs text-text-muted">{ing.suggestedQuantityG}g</p>
                    </div>
                    <p className="text-sm font-medium text-text shrink-0">
                      {Math.round(ing.calories ?? 0)} kcal
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Name + servings */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-text-muted mb-1">Recipe name *</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. High-protein lunch"
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text
                           placeholder:text-text-faint focus:outline-none focus:border-primary"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-text-muted">Servings</label>
              <input
                type="number" min={1} value={servings}
                onChange={e => setServings(Number(e.target.value))}
                className="w-20 bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text text-right focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {error && <p className="text-xs text-error">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-divider shrink-0">
          <button onClick={onClose} className="text-sm text-text-muted hover:text-text">Cancel</button>
          <button
            onClick={handleCreate}
            disabled={saving || !name.trim()}
            className="bg-primary text-[#0f1117] font-semibold rounded-lg px-4 py-2 text-sm
                       hover:bg-primary-hover disabled:opacity-50 transition-colors"
          >
            {saving ? 'Creating…' : 'Create recipe'}
          </button>
        </div>
      </div>
    </div>
  )
}
