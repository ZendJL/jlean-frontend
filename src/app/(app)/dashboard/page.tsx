'use client'

import { useDashboard } from '@/lib/hooks/useDashboard'
import MacroCard from '@/components/dashboard/MacroCard'
import MealSection from '@/components/dashboard/MealSection'
import { Lightbulb } from 'lucide-react'

// Keys must match backend: consumed.calories | consumed.protein | consumed.carbs | consumed.fat
const MACRO_CONFIG = [
  { key: 'calories', label: 'Calories', unit: 'kcal', color: 'var(--color-primary)' },
  { key: 'protein',  label: 'Protein',  unit: 'g',    color: 'var(--color-protein)'  },
  { key: 'carbs',    label: 'Carbs',    unit: 'g',    color: 'var(--color-carbs)'    },
  { key: 'fat',      label: 'Fat',      unit: 'g',    color: 'var(--color-fat)'      },
] as const

type MacroKey = typeof MACRO_CONFIG[number]['key']

const MEAL_ORDER = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'OTHER']

export default function DashboardPage() {
  const { data, isLoading, isError } = useDashboard()

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-surface rounded-lg animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-surface rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-text-muted">Could not load dashboard.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 text-primary text-sm hover:underline"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const sortedMeals = MEAL_ORDER.filter((m) => data.meals[m])

  return (
    <div className="space-y-6 max-w-4xl">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-text">{greeting()} 👋</h2>
        <p className="text-text-muted text-sm mt-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Macro cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {MACRO_CONFIG.map(({ key, label, unit, color }) => {
          const consumed = data.consumed[key as MacroKey] ?? 0
          const target   = data.targets[key as MacroKey] ?? 1
          return (
            <MacroCard
              key={key}
              label={label}
              consumed={consumed}
              target={target}
              unit={unit}
              color={color}
              progress={target > 0 ? consumed / target : 0}
            />
          )
        })}
      </div>

      {/* Remaining summary */}
      <div className="bg-surface rounded-xl border border-border p-4">
        <p className="text-text-muted text-xs uppercase tracking-wide mb-3">Remaining today</p>
        <div className="grid grid-cols-4 gap-4">
          {MACRO_CONFIG.map(({ key, label, unit, color }) => (
            <div key={key} className="text-center">
              <p className="text-lg font-semibold" style={{ color }}>
                {data.remaining[key as MacroKey] ?? 0}
              </p>
              <p className="text-text-faint text-xs">{label} {unit}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Meals */}
      {sortedMeals.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-text uppercase tracking-wide">Today&apos;s meals</h3>
          {sortedMeals.map((meal) => (
            <MealSection key={meal} mealType={meal} data={data.meals[meal]} />
          ))}
        </div>
      ) : (
        <div className="bg-surface rounded-xl border border-border p-8 text-center">
          <p className="text-2xl mb-3">🍽️</p>
          <p className="text-text font-medium">No meals logged yet</p>
          <p className="text-text-muted text-sm mt-1">Add your first meal to start tracking.</p>
          <a
            href="/daily-log"
            className="inline-block mt-4 bg-primary text-[#0f1117] font-semibold rounded-lg px-4 py-2 text-sm hover:bg-primary-hover transition-colors"
          >
            Log a meal
          </a>
        </div>
      )}

    </div>
  )
}
