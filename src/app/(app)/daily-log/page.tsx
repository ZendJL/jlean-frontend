'use client'

import { useState } from 'react'
import { useDiary, useAddDiaryItem, useRemoveDiaryItem, useUpdateDiaryItem } from '@/lib/hooks/useDiary'
import { type MealType } from '@/lib/api/diary.api'
import FoodSearchBar from '@/components/foods/FoodSearchBar'
import { Plus, Trash2, X, Pencil, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const MEAL_ORDER: MealType[] = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'OTHER']
const MEAL_LABELS: Record<MealType, string> = {
  BREAKFAST: '🌅 Breakfast',
  LUNCH:     '☀️ Lunch',
  DINNER:    '🌙 Dinner',
  SNACK:     '🍎 Snack',
  OTHER:     '🍽️ Other',
}

interface AddState {
  mealType:  MealType
  foodId:    string
  foodName:  string
  quantityG: number
}

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  const over = max > 0 && value > max
  return (
    <div className="h-1.5 w-full bg-surface-2 rounded-full overflow-hidden">
      <div
        className={cn('h-full rounded-full transition-all', over ? 'bg-error' : color)}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export default function DailyLogPage() {
  const { data: log, isLoading } = useDiary()
  const addItem    = useAddDiaryItem()
  const removeItem = useRemoveDiaryItem()
  const updateItem = useUpdateDiaryItem()

  const [adding,   setAdding]   = useState<Partial<AddState> | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editQty,   setEditQty]   = useState<number>(100)

  const targets = log?.targets ?? { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 }

  const grouped = MEAL_ORDER.reduce((acc, meal) => {
    acc[meal] = log?.items.filter(i => i.mealType === meal) ?? []
    return acc
  }, {} as Record<MealType, NonNullable<typeof log>['items']>)

  const handleSelect = (meal: MealType, food: { id: string; name: string }) => {
    setAdding({ mealType: meal, foodId: food.id, foodName: food.name, quantityG: 100 })
  }

  const handleAdd = async () => {
    if (!adding?.foodId || !adding.mealType || !adding.quantityG) return
    await addItem.mutateAsync({
      foodId:    adding.foodId,
      mealType:  adding.mealType,
      quantityG: adding.quantityG,
    })
    setAdding(null)
  }

  const handleSaveEdit = async (itemId: string) => {
    await updateItem.mutateAsync({ itemId, quantityG: editQty })
    setEditingId(null)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-28 bg-surface rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  const consumed = {
    calories: log?.totalCalories  ?? 0,
    proteinG: log?.totalProteinG  ?? 0,
    carbsG:   log?.totalCarbsG    ?? 0,
    fatG:     log?.totalFatG      ?? 0,
  }

  const macroRows = [
    { key: 'calories', label: 'Calories', unit: 'kcal', consumed: consumed.calories, target: targets.calories,  color: 'bg-primary'  },
    { key: 'protein',  label: 'Protein',  unit: 'g',    consumed: consumed.proteinG, target: targets.proteinG,  color: 'bg-protein'  },
    { key: 'carbs',    label: 'Carbs',    unit: 'g',    consumed: consumed.carbsG,   target: targets.carbsG,    color: 'bg-carbs'    },
    { key: 'fat',      label: 'Fat',      unit: 'g',    consumed: consumed.fatG,     target: targets.fatG,      color: 'bg-fat'      },
  ]

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-semibold text-text">Daily Log</h2>
        <p className="text-text-muted text-sm mt-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          {log?.dayType && (
            <span className="ml-2 text-xs bg-surface-2 rounded-full px-2 py-0.5 text-text-muted">
              {log.dayType}
            </span>
          )}
        </p>
      </div>

      {/* Macro progress bars */}
      {log && (
        <div className="bg-surface rounded-xl border border-border p-4 space-y-3">
          <p className="text-xs text-text-muted uppercase tracking-wide">Today's progress</p>
          {macroRows.map(({ key, label, unit, consumed: c, target: t, color }) => (
            <div key={key}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-text-muted">{label}</span>
                <span className="text-text">
                  <span className="font-semibold">{typeof c === 'number' ? (unit === 'kcal' ? Math.round(c) : Number(c).toFixed(1)) : c}</span>
                  <span className="text-text-faint"> / {typeof t === 'number' ? (unit === 'kcal' ? Math.round(t) : Number(t).toFixed(1)) : t} {unit}</span>
                </span>
              </div>
              <ProgressBar value={Number(c)} max={Number(t)} color={color} />
            </div>
          ))}
        </div>
      )}

      {/* Meal sections */}
      {MEAL_ORDER.map(meal => {
        const items = grouped[meal]
        const mealCals    = items.reduce((s, i) => s + (i.calories ?? 0), 0)
        const mealProtein = items.reduce((s, i) => s + (i.proteinG ?? 0), 0)
        const mealCarbs   = items.reduce((s, i) => s + (i.carbsG ?? 0), 0)
        const mealFat     = items.reduce((s, i) => s + (i.fatG ?? 0), 0)

        return (
          <div key={meal} className="bg-surface rounded-xl border border-border overflow-hidden">
            <div className="px-4 py-3 flex items-center justify-between border-b border-divider">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-text">{MEAL_LABELS[meal]}</span>
                {items.length > 0 && (
                  <span className="text-xs text-text-faint">
                    {Math.round(mealCals)} kcal
                    {' · '} P {Number(mealProtein).toFixed(1)}g
                    {' · '} C {Number(mealCarbs).toFixed(1)}g
                    {' · '} F {Number(mealFat).toFixed(1)}g
                  </span>
                )}
              </div>
              <button
                onClick={() => setAdding({ mealType: meal })}
                className="flex items-center gap-1 text-primary text-xs hover:text-primary-hover transition-colors"
              >
                <Plus size={14} /> Add food
              </button>
            </div>

            {/* Add food inline */}
            {adding?.mealType === meal && !adding.foodId && (
              <div className="px-4 py-3 border-b border-divider bg-surface-2">
                <FoodSearchBar
                  placeholder="Search to add…"
                  onSelect={food => handleSelect(meal, food)}
                />
                <button onClick={() => setAdding(null)} className="mt-2 text-xs text-text-faint hover:text-text">Cancel</button>
              </div>
            )}

            {/* Quantity confirm */}
            {adding?.mealType === meal && adding.foodId && (
              <div className="px-4 py-3 border-b border-divider bg-surface-2 flex items-center gap-3">
                <p className="text-sm text-text flex-1 truncate">{adding.foodName}</p>
                <input
                  type="number" min={1}
                  value={adding.quantityG}
                  onChange={e => setAdding(prev => ({ ...prev, quantityG: Number(e.target.value) }))}
                  className="w-20 bg-surface border border-border rounded-lg px-2 py-1.5 text-sm text-text text-right"
                />
                <span className="text-xs text-text-muted">g</span>
                <button
                  onClick={handleAdd}
                  disabled={addItem.isPending}
                  className="bg-primary text-[#0f1117] font-semibold rounded-lg px-3 py-1.5 text-sm hover:bg-primary-hover disabled:opacity-50 transition-colors"
                >
                  Add
                </button>
                <button onClick={() => setAdding(null)}><X size={16} className="text-text-faint" /></button>
              </div>
            )}

            {/* Items */}
            {items.length === 0 && !adding ? (
              <p className="px-4 py-3 text-sm text-text-faint italic">No items yet.</p>
            ) : (
              <ul className="divide-y divide-divider">
                {items.map(item => (
                  <li key={item.id} className="px-4 py-2.5 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-text truncate">{item.name}</p>
                      {editingId === item.id ? (
                        <div className="flex items-center gap-1 mt-1">
                          <input
                            type="number" min={1}
                            value={editQty}
                            onChange={e => setEditQty(Number(e.target.value))}
                            className="w-16 bg-bg border border-border rounded px-2 py-0.5 text-xs text-text text-right"
                          />
                          <span className="text-xs text-text-muted">g</span>
                          <button onClick={() => handleSaveEdit(item.id)} className="text-primary hover:text-primary-hover"><Check size={13} /></button>
                          <button onClick={() => setEditingId(null)} className="text-text-faint hover:text-text"><X size={13} /></button>
                        </div>
                      ) : (
                        <p className="text-xs text-text-muted">{item.quantityG}g</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-medium text-text">{Math.round(item.calories ?? 0)} kcal</p>
                        <p className="text-xs text-text-faint">
                          P {Number(item.proteinG ?? 0).toFixed(1)}g
                          {' · '} C {Number(item.carbsG ?? 0).toFixed(1)}g
                          {' · '} F {Number(item.fatG ?? 0).toFixed(1)}g
                        </p>
                      </div>
                      <button
                        onClick={() => { setEditingId(item.id); setEditQty(item.quantityG) }}
                        className="text-text-faint hover:text-primary transition-colors"
                        aria-label="Edit quantity"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => removeItem.mutate(item.id)}
                        className="text-text-faint hover:text-error transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )
      })}
    </div>
  )
}
