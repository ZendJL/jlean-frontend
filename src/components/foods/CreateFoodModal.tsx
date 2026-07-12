'use client'

import { useState } from 'react'
import { useCreateFood } from '@/lib/hooks/useFoods'
import { X } from 'lucide-react'

interface Props { onClose: () => void }

const FIELD_CONFIG = [
  { key: 'name',      label: 'Name *',      type: 'text',   required: true  },
  { key: 'calories',  label: 'Calories (kcal)', type: 'number', required: true  },
  { key: 'proteinG',  label: 'Protein (g)',  type: 'number', required: false },
  { key: 'carbsG',    label: 'Carbs (g)',    type: 'number', required: false },
  { key: 'fatG',      label: 'Fat (g)',      type: 'number', required: false },
  { key: 'fiberG',    label: 'Fiber (g)',    type: 'number', required: false },
  { key: 'sodiumMg',  label: 'Sodium (mg)',  type: 'number', required: false },
  { key: 'servingSizeG', label: 'Serving size (g)', type: 'number', required: false },
] as const

type FieldKey = typeof FIELD_CONFIG[number]['key']

export default function CreateFoodModal({ onClose }: Props) {
  const createFood = useCreateFood()
  const [form, setForm] = useState<Partial<Record<FieldKey, string>>>({})
  const [error, setError] = useState<string | null>(null)

  const set = (key: FieldKey, val: string) => setForm(prev => ({ ...prev, [key]: val }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!form.name?.trim() || !form.calories) {
      setError('Name and calories are required.')
      return
    }
    try {
      await createFood.mutateAsync({
        name:         form.name.trim(),
        calories:     Number(form.calories),
        proteinG:     form.proteinG     ? Number(form.proteinG)     : undefined,
        carbsG:       form.carbsG       ? Number(form.carbsG)       : undefined,
        fatG:         form.fatG         ? Number(form.fatG)         : undefined,
        fiberG:       form.fiberG       ? Number(form.fiberG)       : undefined,
        sodiumMg:     form.sodiumMg     ? Number(form.sodiumMg)     : undefined,
        servingSizeG: form.servingSizeG ? Number(form.servingSizeG) : undefined,
      })
      onClose()
    } catch {
      setError('Could not create food. Please try again.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface rounded-2xl border border-border w-full max-w-md shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-divider">
          <h2 className="text-base font-semibold text-text">Add Custom Food</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {FIELD_CONFIG.map(({ key, label, type }) => (
              <div key={key} className={key === 'name' ? 'col-span-2' : ''}>
                <label className="block text-xs text-text-muted mb-1">{label}</label>
                <input
                  type={type}
                  min={type === 'number' ? 0 : undefined}
                  step={type === 'number' ? 'any' : undefined}
                  value={form[key] ?? ''}
                  onChange={e => set(key, e.target.value)}
                  className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text
                             placeholder:text-text-faint focus:outline-none focus:border-primary"
                />
              </div>
            ))}
          </div>

          {error && <p className="text-xs text-error">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="text-sm text-text-muted hover:text-text">
              Cancel
            </button>
            <button
              type="submit"
              disabled={createFood.isPending}
              className="bg-primary text-[#0f1117] font-semibold rounded-lg px-4 py-2 text-sm
                         hover:bg-primary-hover disabled:opacity-50 transition-colors"
            >
              {createFood.isPending ? 'Saving…' : 'Save food'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
