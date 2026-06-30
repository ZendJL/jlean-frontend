'use client'

import { useDashboard } from '@/lib/hooks/useDashboard'
import MacroCard from '@/components/dashboard/MacroCard'
import MealSection from '@/components/dashboard/MealSection'
import { Lightbulb } from 'lucide-react'

const MACRO_CONFIG = [
  { key: 'calories', label: 'Calories', unit: 'kcal', color: 'var(--color-primary)',  progressKey: 'calories' },
  { key: 'proteinG', label: 'Protein',  unit: 'g',    color: 'var(--color-protein)',  progressKey: 'proteinG' },
  { key: 'carbsG',   label: 'Carbs',    unit: 'g',    color: 'var(--color-carbs)',    progressKey: 'carbsG'   },
  { key: 'fatG',     label: 'Fat',      unit: 'g',    color: 'var(--color-fat)',      progressKey: 'fatG'     },
] as const

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
        {MACRO_CONFIG.map(({ key, label, unit, color, progressKey }) => (
          <MacroCard
            key={key}
            label={label}
            consumed={data.consumed[key] as number}
            target={data.targets[key] as number}
            unit={unit}
            color={color}
            progress={data.progress[progressKey]}
          />
        ))}
      </div>

      {/* Remaining summary */}
      <div className="bg-surface rounded-xl border border-border p-4">
        <p className="text-text-muted text-xs uppercase tracking-wide mb-3">Remaining today</p>
        <div className="grid grid-cols-4 gap-4">
          {MACRO_CONFIG.map(({ key, label, unit, color }) => (
            <div key={key} className="text-center">
              <p className="text-lg font-semibold" style={{ color }}>
                {data.remaining[key] as number}
              </p>
              <p className="text-text-faint text-xs">{label} {unit}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      {data.insights.length > 0 && (
        <div className="space-y-2">
          {data.insights.map((msg, i) => (
            <div key={i} className="flex items-start gap-3 bg-surface rounded-xl border border-border px-4 py-3">
              <Lightbulb size={16} className="text-warning shrink-0 mt-0.5" />
              <p className="text-sm text-text-muted">{msg}</p>
            </div>
          ))}
        </div>
      )}

      {/* Meals */}
      {sortedMeals.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-text uppercase tracking-wide">Today's meals</h3>
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
