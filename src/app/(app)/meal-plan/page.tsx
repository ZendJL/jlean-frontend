'use client'

import { useState } from 'react'
import { useMealPlans, useMealPlan, useCreateMealPlan, useDeleteMealPlan, useAddMealPlanItem, useRemoveMealPlanItem, useApplyMealPlanToLog } from '@/lib/hooks/useMealPlan'
import FoodSearchBar from '@/components/foods/FoodSearchBar'
import { Plus, Trash2, ArrowLeft, CalendarRange, PlayCircle, X } from 'lucide-react'

const MEALS = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'] as const
const MEAL_LABELS: Record<string, string> = {
  BREAKFAST: '🌅 Breakfast', LUNCH: '☀️ Lunch', DINNER: '🌙 Dinner', SNACK: '🍎 Snack',
}

function getMondayOfWeek(dateStr: string) {
  const d = new Date(dateStr)
  const day = d.getDay()
  const diff = (day === 0 ? -6 : 1 - day)
  d.setDate(d.getDate() + diff)
  return d.toISOString().split('T')[0]
}

function getWeekDays(mondayStr: string) {
  const days = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(mondayStr)
    d.setDate(d.getDate() + i)
    days.push(d.toISOString().split('T')[0])
  }
  return days
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// Modal para añadir alimento a una celda del plan
function AddItemModal({
  date, meal, planId, onClose,
}: { date: string; meal: string; planId: string; onClose: () => void }) {
  const [qty, setQty] = useState('100')
  const addItem = useAddMealPlanItem(planId)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-surface border border-border rounded-2xl p-5 w-full max-w-md space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text">
            Add to {MEAL_LABELS[meal]} — {new Date(date + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
          </h3>
          <button onClick={onClose} className="text-text-muted hover:text-text"><X size={16} /></button>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-text-muted shrink-0">Quantity (g)</label>
          <input type="number" min="1" value={qty} onChange={e => setQty(e.target.value)}
            className="w-24 bg-bg border border-border rounded-lg px-2 py-1.5 text-sm text-text text-right focus:outline-none focus:border-primary" />
        </div>
        <FoodSearchBar
          compact
          placeholder="Search food…"
          onSelect={food => {
            addItem.mutate({
              date, meal: meal as any,
              foodId: food.id, quantityG: parseFloat(qty) || 100,
            }, { onSuccess: onClose })
          }}
        />
      </div>
    </div>
  )
}

export default function MealPlanPage() {
  const { data: plans, isLoading } = useMealPlans()
  const createPlan   = useCreateMealPlan()
  const deletePlan   = useDeleteMealPlan()
  const applyToLog   = useApplyMealPlanToLog()

  const [activePlanId, setActivePlanId]   = useState<string | null>(null)
  const [view,         setView]           = useState<'list' | 'grid'>('list')
  const [showNew,      setShowNew]        = useState(false)
  const [newName,      setNewName]        = useState('')
  const [newWeek,      setNewWeek]        = useState(getMondayOfWeek(new Date().toISOString().split('T')[0]))
  const [addCell,      setAddCell]        = useState<{ date: string; meal: string } | null>(null)
  const [applyDone,    setApplyDone]      = useState(false)

  const { data: activePlan } = useMealPlan(activePlanId)
  const removeItem = useRemoveMealPlanItem(activePlanId ?? '')

  const handleCreate = async () => {
    if (!newName.trim()) return
    const p = await createPlan.mutateAsync({ name: newName, weekStart: newWeek })
    setActivePlanId(p.id); setView('grid'); setShowNew(false); setNewName('')
  }

  const handleApply = async () => {
    if (!activePlanId) return
    await applyToLog.mutateAsync(activePlanId)
    setApplyDone(true)
    setTimeout(() => setApplyDone(false), 3000)
  }

  // — Grid view —
  if (view === 'grid' && activePlan) {
    const days = getWeekDays(activePlan.weekStart.split('T')[0])
    const itemsByDateMeal = (date: string, meal: string) =>
      activePlan.items.filter(i => i.date.startsWith(date) && i.meal === meal)

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => setView('list')} className="text-text-muted hover:text-text"><ArrowLeft size={20} /></button>
          <h2 className="text-xl font-semibold text-text flex items-center gap-2">
            <CalendarRange size={20} className="text-primary" />
            {activePlan.name}
          </h2>
          <span className="text-xs text-text-muted">
            Week of {new Date(activePlan.weekStart.split('T')[0] + 'T12:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
          <button
            onClick={handleApply}
            disabled={applyToLog.isPending}
            className="ml-auto flex items-center gap-1.5 bg-primary text-[#0f1117] font-semibold rounded-lg px-3 py-1.5 text-sm hover:bg-primary-hover disabled:opacity-50 transition-colors"
          >
            <PlayCircle size={15} />
            {applyDone ? '✓ Applied!' : 'Apply to Daily Log'}
          </button>
        </div>

        {/* Grid: rows = meals, cols = days */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] border-separate border-spacing-1">
            <thead>
              <tr>
                <th className="w-28" />
                {days.map((d, i) => (
                  <th key={d} className="text-xs font-medium text-text-muted text-center pb-1">
                    {DAY_LABELS[i]}<br />
                    <span className="text-text-faint text-[10px]">{new Date(d + 'T12:00:00').getDate()}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MEALS.map(meal => (
                <tr key={meal}>
                  <td className="text-xs text-text-muted pr-2 py-1 align-top">{MEAL_LABELS[meal]}</td>
                  {days.map(date => {
                    const items = itemsByDateMeal(date, meal)
                    return (
                      <td key={date} className="align-top">
                        <div className="bg-surface border border-border rounded-lg p-1.5 min-h-[60px] space-y-1">
                          {items.map(item => (
                            <div key={item.id} className="flex items-start justify-between gap-1 bg-surface-2 rounded px-1.5 py-1">
                              <div className="min-w-0">
                                <p className="text-[10px] font-medium text-text truncate">
                                  {item.food?.name ?? item.recipe?.name ?? 'Unknown'}
                                </p>
                                <p className="text-[9px] text-text-faint">{item.quantityG}g</p>
                              </div>
                              <button onClick={() => removeItem.mutate(item.id)} className="shrink-0 text-text-faint hover:text-error transition-colors">
                                <X size={10} />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => setAddCell({ date, meal })}
                            className="w-full text-[10px] text-text-faint hover:text-primary transition-colors py-0.5 flex items-center justify-center gap-0.5"
                          >
                            <Plus size={10} /> Add
                          </button>
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {addCell && activePlanId && (
          <AddItemModal
            date={addCell.date} meal={addCell.meal}
            planId={activePlanId}
            onClose={() => setAddCell(null)}
          />
        )}
      </div>
    )
  }

  // — List view —
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-text flex items-center gap-2">
          <CalendarRange size={22} className="text-primary" /> Meal Plans
        </h2>
        <button onClick={() => setShowNew(v => !v)}
          className="flex items-center gap-1.5 bg-primary text-[#0f1117] font-semibold rounded-lg px-3 py-2 text-sm hover:bg-primary-hover transition-colors">
          <Plus size={16} /> New plan
        </button>
      </div>

      {showNew && (
        <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Plan name (e.g. Cut Week 1)"
            className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-faint focus:outline-none focus:border-primary" />
          <div className="flex items-center gap-2">
            <label className="text-xs text-text-muted shrink-0">Week starting (Monday)</label>
            <input type="date" value={newWeek} onChange={e => setNewWeek(e.target.value)}
              className="bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:border-primary" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreate} disabled={!newName.trim() || createPlan.isPending}
              className="bg-primary text-[#0f1117] font-semibold rounded-lg px-4 py-2 text-sm hover:bg-primary-hover disabled:opacity-50 transition-colors">
              Create
            </button>
            <button onClick={() => setShowNew(false)} className="text-text-muted text-sm hover:text-text">Cancel</button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-surface rounded-xl animate-pulse" />)}</div>
      ) : !plans?.length ? (
        <div className="bg-surface border border-border rounded-xl p-10 text-center">
          <p className="text-3xl mb-3">📅</p>
          <p className="text-text font-medium">No meal plans yet</p>
          <p className="text-text-muted text-sm mt-1">Create a weekly plan and apply it to your daily log in one click.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {plans.map(plan => (
            <li key={plan.id} className="bg-surface border border-border rounded-xl px-4 py-3 flex items-center justify-between">
              <button className="text-left flex-1" onClick={() => { setActivePlanId(plan.id); setView('grid') }}>
                <p className="text-sm font-medium text-text">{plan.name}</p>
                <p className="text-xs text-text-muted">
                  Week of {new Date(plan.weekStart.split('T')[0] + 'T12:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  {' · '}{plan.items.length} items
                </p>
              </button>
              <button onClick={() => deletePlan.mutate(plan.id)} className="text-text-faint hover:text-error transition-colors p-1">
                <Trash2 size={15} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
