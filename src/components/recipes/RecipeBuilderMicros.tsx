'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { recipesApi, BuildByMicrosResult } from '@/lib/api/recipes.api'

// 20 micro fields válidos (whitelist del backend)
const MICRO_FIELDS = [
  { value: 'vitaminA',   label: 'Vitamin A' },
  { value: 'vitaminB1',  label: 'Vitamin B1 (Thiamine)' },
  { value: 'vitaminB2',  label: 'Vitamin B2 (Riboflavin)' },
  { value: 'vitaminB3',  label: 'Vitamin B3 (Niacin)' },
  { value: 'vitaminB5',  label: 'Vitamin B5' },
  { value: 'vitaminB6',  label: 'Vitamin B6' },
  { value: 'vitaminB7',  label: 'Vitamin B7 (Biotin)' },
  { value: 'vitaminB9',  label: 'Vitamin B9 (Folate)' },
  { value: 'vitaminB12', label: 'Vitamin B12' },
  { value: 'vitaminC',   label: 'Vitamin C' },
  { value: 'vitaminD',   label: 'Vitamin D' },
  { value: 'vitaminE',   label: 'Vitamin E' },
  { value: 'vitaminK',   label: 'Vitamin K' },
  { value: 'calcium',    label: 'Calcium' },
  { value: 'iron',       label: 'Iron' },
  { value: 'magnesium',  label: 'Magnesium' },
  { value: 'phosphorus', label: 'Phosphorus' },
  { value: 'potassium',  label: 'Potassium' },
  { value: 'zinc',       label: 'Zinc' },
  { value: 'selenium',   label: 'Selenium' },
  { value: 'fiber',      label: 'Fiber' },
]

interface Props {
  onImport?: (result: BuildByMicrosResult) => void
}

export default function RecipeBuilderMicros({ onImport }: Props) {
  const [microField,   setMicroField]   = useState<string>(MICRO_FIELDS[0].value)
  const [gapAmount,    setGapAmount]    = useState<string>('')
  const [maxCalories,  setMaxCalories]  = useState<string>('')

  const { mutate, data, isPending, isError, error, reset } = useMutation({
    mutationFn: () =>
      recipesApi.buildByMicros({
        microField,
        gapAmount:   Number(gapAmount),
        maxCalories: maxCalories ? Number(maxCalories) : undefined,
      }),
  })

  const canSubmit = Number(gapAmount) > 0 && !isPending

  return (
    <div className="space-y-5">
      {/* Micro selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Deficient micronutrient
        </label>
        <select
          value={microField}
          onChange={e => { reset(); setMicroField(e.target.value) }}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
        >
          {MICRO_FIELDS.map(f => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
      </div>

      {/* Gap + max cal */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Gap to cover
          </label>
          <input
            type="number"
            min={0}
            value={gapAmount}
            onChange={e => { reset(); setGapAmount(e.target.value) }}
            placeholder="e.g. 8"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Max calories (optional)
          </label>
          <input
            type="number"
            min={0}
            value={maxCalories}
            onChange={e => setMaxCalories(e.target.value)}
            placeholder="e.g. 300"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
      </div>

      <button
        onClick={() => mutate()}
        disabled={!canSubmit}
        className="w-full py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
      >
        {isPending ? 'Searching…' : 'Find foods'}
      </button>

      {isError && (
        <p className="text-sm text-red-500">
          {(error as Error).message ?? 'Could not generate suggestion. Try again.'}
        </p>
      )}

      {data && (
        <div className="space-y-3">
          {/* Coverage badge */}
          <div className={`rounded-lg px-4 py-3 text-sm ${
            data.coveragePercent >= 90
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300'
              : data.coveragePercent >= 60
              ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300'
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'
          }`}>
            <p className="font-semibold">
              {data.coveragePercent}% of gap covered
            </p>
            <p className="text-xs mt-0.5">
              {data.coveredAmount.toFixed(2)} / {data.gapAmount} units of {MICRO_FIELDS.find(f => f.value === data.microField)?.label ?? data.microField}
            </p>
          </div>

          {data.ingredients.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No foods found with this micronutrient in the catalog.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-700 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {data.ingredients.map((ing, i) => (
                <li key={i} className="px-4 py-3 bg-white dark:bg-gray-800">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{ing.foodName}</p>
                    <span className="text-sm font-semibold text-violet-700 dark:text-violet-400 whitespace-nowrap">
                      {ing.suggestedQuantityG}g
                    </span>
                  </div>
                  {/* Barra de contribución */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-violet-500"
                        style={{ width: `${Math.min(100, (ing.microContribution / data.gapAmount) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      +{ing.microContribution.toFixed(2)} · {Math.round(ing.macros.calories)} kcal
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {onImport && data.ingredients.length > 0 && (
            <button
              onClick={() => onImport(data)}
              className="w-full py-2 rounded-lg border border-violet-600 text-violet-700 dark:text-violet-400 text-sm font-medium hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors"
            >
              Import into recipe
            </button>
          )}
        </div>
      )}
    </div>
  )
}
