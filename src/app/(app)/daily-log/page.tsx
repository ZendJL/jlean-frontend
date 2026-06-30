'use client'

import { useState } from 'react'
import { useDiary, useAddDiaryItem, useRemoveDiaryItem } from '@/lib/hooks/useDiary'
import { type MealType } from '@/lib/api/diary.api'
import FoodSearchBar from '@/components/foods/FoodSearchBar'
import { Plus, Trash2, X } from 'lucide-react'
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
  mealType: MealType
  foodId:   string
  foodName: string
  quantityG: number
}

export default function DailyLogPage() {
  const { data: log, isLoading } = useDiary()
  const addItem    = useAddDiaryItem()
  const removeItem = useRemoveDiaryItem()

  const [adding, setAdding] = useState<Partial<AddState> | null>(null)

  const grouped = MEAL_ORDER.reduce((acc, meal) => {
    acc[meal] = log?.items.filter(i => i.mealType === meal) ?? []
    return acc
  }, {} as Record<MealType, typeof log extends undefined ? never[] : (typeof log)['items']>)

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

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-28 bg-surface rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-semibold text-text">Daily Log</h2>
        <p className="text-text-muted text-sm mt-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Totals bar */}
      {log && (
        <div className="bg-surface rounded-xl border border-border px-4 py-3 grid grid-cols-4 gap-4 text-center">
          {[
            { label: 'Calories', val: `${log.totalCalories} kcal` },
            { label: 'Protein',  val: `${log.totalProteinG}g` },
            { label: 'Carbs',    val: `${log.totalCarbsG}g` },
            { label: 'Fat',      val: `${log.totalFatG}g` },
          ].map(({ label, val }) => (
            <div key={label}>
              <p className="text-xs text-text-muted uppercase tracking-wide">{label}</p>
              <p className="text-base font-semibold text-text">{val}</p>
            </div>
          ))}
        </div>
      )}

      {/* Meal sections */}
      {MEAL_ORDER.map(meal => (
        <div key={meal} className="bg-surface rounded-xl border border-border overflow-hidden">
          <div className="px-4 py-3 flex items-center justify-between border-b border-divider">
            <span className="text-sm font-medium text-text">{MEAL_LABELS[meal]}</span>
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
              <button
                onClick={() => setAdding(null)}
                className="mt-2 text-xs text-text-faint hover:text-text"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Quantity confirm */}
          {adding?.mealType === meal && adding.foodId && (
            <div className="px-4 py-3 border-b border-divider bg-surface-2 flex items-center gap-3">
              <p className="text-sm text-text flex-1 truncate">{adding.foodName}</p>
              <input
                type="number"
                min={1}
                value={adding.quantityG}
                onChange={e => setAdding(prev => ({ ...prev, quantityG: Number(e.target.value) }))}
                className="w-20 bg-surface border border-border rounded-lg px-2 py-1.5 text-sm text-text text-right"
              />
              <span className="text-xs text-text-muted">g</span>
              <button
                onClick={handleAdd}
                disabled={addItem.isPending}
                className="bg-primary text-[#0f1117] font-semibold rounded-lg px-3 py-1.5 text-sm
                           hover:bg-primary-hover disabled:opacity-50 transition-colors"
              >
                Add
              </button>
              <button onClick={() => setAdding(null)}><X size={16} className="text-text-faint" /></button>
            </div>
          )}

          {/* Items */}
          {grouped[meal].length === 0 && !adding ? (
            <p className="px-4 py-3 text-sm text-text-faint italic">No items yet.</p>
          ) : (
            <ul className="divide-y divide-divider">
              {grouped[meal].map(item => (
                <li key={item.id} className="px-4 py-2.5 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text">{item.name}</p>
                    <p className="text-xs text-text-muted">{item.quantityG}g</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-medium text-text">{item.calories} kcal</p>
                      <p className="text-xs text-text-faint">
                        P {item.proteinG}g · C {item.carbsG}g · F {item.fatG}g
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem.mutate(item.id)}
                      className="text-text-faint hover:text-error transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  )
}
