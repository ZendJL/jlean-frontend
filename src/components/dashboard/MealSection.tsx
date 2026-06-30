'use client'

import { type MealSummary } from '@/lib/api/dashboard.api'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const MEAL_LABELS: Record<string, string> = {
  BREAKFAST: '🌅 Breakfast',
  LUNCH:     '☀️ Lunch',
  DINNER:    '🌙 Dinner',
  SNACK:     '🍎 Snack',
  OTHER:     '🍽️ Other',
}

interface Props {
  mealType: string
  data:     MealSummary
}

export default function MealSection({ mealType, data }: Props) {
  const [open, setOpen] = useState(true)
  const label = MEAL_LABELS[mealType] ?? mealType

  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface-2 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-text">{label}</span>
          <span className="text-xs text-text-muted">{Math.round(data.calories)} kcal</span>
        </div>
        <ChevronDown
          size={16}
          className={cn('text-text-faint transition-transform duration-200', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div className="border-t border-border divide-y divide-divider">
          {data.items.map((item) => (
            <div key={item.id} className="px-4 py-2.5 flex items-center justify-between">
              <div>
                <p className="text-sm text-text">{item.foodName}</p>
                <p className="text-xs text-text-muted">{item.quantityG}g</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-text">{item.calories} kcal</p>
                <p className="text-xs text-text-faint">
                  P {item.proteinG}g · C {item.carbsG}g · F {item.fatG}g
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
