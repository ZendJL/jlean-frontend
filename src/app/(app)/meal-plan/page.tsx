'use client'

import { useMemo, useState } from 'react'
import { AlertTriangle, CalendarRange, ChefHat, Plus, Trash2 } from 'lucide-react'
import { useMealPlan, useCreateMealPlanEntry, useDeleteMealPlanEntry } from '@/lib/hooks/useMealPlan'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const MEALS = ['Breakfast', 'Lunch', 'Dinner', 'Snack']

export default function MealPlanPage() {
  const { data, isLoading } = useMealPlan()
  const createEntry = useCreateMealPlanEntry()
  const deleteEntry = useDeleteMealPlanEntry()

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    dayOfWeek: 'Monday',
    mealType: 'Breakfast',
    title: '',
    notes: '',
  })

  const grouped = useMemo(() => {
    const base = Object.fromEntries(DAYS.map(day => [day, [] as typeof data]))
    for (const entry of data ?? []) {
      if (!base[entry.dayOfWeek]) base[entry.dayOfWeek] = []
      base[entry.dayOfWeek].push(entry)
    }
    return base
  }, [data])

  const handleCreate = async () => {
    if (!form.title.trim()) return
    await createEntry.mutateAsync({
      dayOfWeek: form.dayOfWeek,
      mealType: form.mealType,
      title: form.title.trim(),
      notes: form.notes.trim() || undefined,
    })
    setForm({ dayOfWeek: 'Monday', mealType: 'Breakfast', title: '', notes: '' })
    setShowForm(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-semibold text-text">
            <CalendarRange size={22} className="text-primary" /> Meal Plan
          </h2>
          <p className="mt-1 text-sm text-text-muted">Plan meals for the week and keep a simple structure before full automation lands.</p>
        </div>
        <button onClick={() => setShowForm(v => !v)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-[#0f1117] transition-colors hover:bg-primary-hover">
          <Plus size={15} /> Add meal
        </button>
      </div>

      <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 text-sm text-text-muted">
        <div className="flex items-start gap-2">
          <AlertTriangle size={16} className="mt-0.5 text-warning" />
          <p>This is the v1 planning board. It covers weekly manual planning; shopping lists and macro balancing can come in a later step.</p>
        </div>
      </div>

      {showForm && (
        <div className="rounded-xl border border-border bg-surface p-4 space-y-3 max-w-2xl">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-text-muted">Day</label>
              <select value={form.dayOfWeek} onChange={e => setForm(p => ({ ...p, dayOfWeek: e.target.value }))}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-sm text-text focus:border-primary focus:outline-none">
                {DAYS.map(day => <option key={day}>{day}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-text-muted">Meal</label>
              <select value={form.mealType} onChange={e => setForm(p => ({ ...p, mealType: e.target.value }))}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-sm text-text focus:border-primary focus:outline-none">
                {MEALS.map(meal => <option key={meal}>{meal}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs text-text-muted">Title</label>
            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Oats with whey and berries"
              className="w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-sm text-text placeholder:text-text-faint focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-text-muted">Notes</label>
            <input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              placeholder="Optional prep note or reminder"
              className="w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-sm text-text placeholder:text-text-faint focus:border-primary focus:outline-none" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreate} disabled={createEntry.isPending}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-[#0f1117] transition-colors hover:bg-primary-hover disabled:opacity-50">
              Save
            </button>
            <button onClick={() => setShowForm(false)} className="text-sm text-text-muted transition-colors hover:text-text">Cancel</button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, i) => <div key={i} className="h-44 rounded-xl bg-surface animate-pulse" />)}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {DAYS.map(day => {
            const entries = (grouped[day] ?? []).slice().sort((a, b) => MEALS.indexOf(a.mealType) - MEALS.indexOf(b.mealType))
            return (
              <section key={day} className="rounded-2xl border border-border bg-surface p-4">
                <div className="mb-3 flex items-center gap-2">
                  <ChefHat size={16} className="text-primary" />
                  <h3 className="text-sm font-semibold text-text">{day}</h3>
                </div>
                {entries.length === 0 ? (
                  <p className="text-sm text-text-muted">No meals planned.</p>
                ) : (
                  <div className="space-y-2">
                    {entries.map(entry => (
                      <div key={entry.id} className="rounded-xl border border-border bg-bg px-3 py-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-text-faint">{entry.mealType}</p>
                            <p className="mt-1 text-sm font-medium text-text">{entry.title}</p>
                            {entry.notes && <p className="mt-1 text-xs text-text-muted">{entry.notes}</p>}
                          </div>
                          <button onClick={() => deleteEntry.mutate(entry.id)} className="text-text-faint transition-colors hover:text-error">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
