'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { recipesApi, BuildByMacrosResult, CarbFatBalance } from '@/lib/api/recipes.api'

interface Props {
  /** Callback para importar los ingredientes sugeridos a una receta existente */
  onImport?: (result: BuildByMacrosResult) => void
}

export default function RecipeBuilderMacros({ onImport }: Props) {
  const [targetCalories, setTargetCalories] = useState<string>('')
  const [targetProtein,  setTargetProtein]  = useState<string>('')
  const [balance, setBalance] = useState<CarbFatBalance>('balanced')
  const [presetsOnly, setPresetsOnly] = useState(false)

  const { mutate, data, isPending, isError, error, reset } = useMutation({
    mutationFn: () =>
      recipesApi.buildByMacros({
        targetCalories: Number(targetCalories),
        targetProtein:  Number(targetProtein),
        carbFatBalance: balance,
        presetsOnly,
      }),
  })

  const canSubmit =
    Number(targetCalories) > 0 && Number(targetProtein) > 0 && !isPending

  return (
    <div className="space-y-5">
      {/* Formulario */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Target calories
          </label>
          <input
            type="number"
            min={0}
            value={targetCalories}
            onChange={e => { reset(); setTargetCalories(e.target.value) }}
            placeholder="e.g. 600"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Target protein (g)
          </label>
          <input
            type="number"
            min={0}
            value={targetProtein}
            onChange={e => { reset(); setTargetProtein(e.target.value) }}
            placeholder="e.g. 50"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Carb/Fat balance */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Carb / Fat balance
        </label>
        <div className="flex gap-2">
          {(['balanced', 'low_carb', 'low_fat'] as CarbFatBalance[]).map(opt => (
            <button
              key={opt}
              onClick={() => setBalance(opt)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                balance === opt
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {opt.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Presets only toggle */}
      <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-gray-600 dark:text-gray-400">
        <input
          type="checkbox"
          checked={presetsOnly}
          onChange={e => setPresetsOnly(e.target.checked)}
          className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500"
        />
        Use preset foods only
      </label>

      {/* Submit */}
      <button
        onClick={() => mutate()}
        disabled={!canSubmit}
        className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
      >
        {isPending ? 'Calculating…' : 'Suggest ingredients'}
      </button>

      {/* Error */}
      {isError && (
        <p className="text-sm text-red-500">
          {(error as Error).message ?? 'Could not generate suggestion. Try again.'}
        </p>
      )}

      {/* Resultado */}
      {data && (
        <div className="space-y-3">
          {/* Accuracy badges */}
          <div className="flex gap-3">
            <AccuracyBadge label="Calorie accuracy" value={data.calorieAccuracy} />
            <AccuracyBadge label="Protein accuracy" value={data.proteinAccuracy} />
          </div>

          {/* Ingredient list */}
          <ul className="divide-y divide-gray-100 dark:divide-gray-700 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {data.ingredients.map((ing, i) => (
              <li key={i} className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{ing.foodName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {ing.macros.proteinG.toFixed(1)}g prot · {ing.macros.carbsG.toFixed(1)}g carbs · {ing.macros.fatG.toFixed(1)}g fat
                  </p>
                </div>
                <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                  {ing.suggestedQuantityG}g · {Math.round(ing.macros.calories)} kcal
                </span>
              </li>
            ))}
          </ul>

          {/* Totales */}
          <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 px-4 py-3 text-sm">
            <p className="font-semibold text-emerald-800 dark:text-emerald-300">
              Total: {Math.round(data.achievedCalories)} kcal · {data.achievedProtein.toFixed(1)}g protein
            </p>
            <p className="text-emerald-600 dark:text-emerald-400 text-xs mt-0.5">
              Target was {data.targetCalories} kcal / {data.targetProtein}g protein
            </p>
          </div>

          {onImport && (
            <button
              onClick={() => onImport(data)}
              className="w-full py-2 rounded-lg border border-emerald-600 text-emerald-700 dark:text-emerald-400 text-sm font-medium hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
            >
              Import into recipe
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function AccuracyBadge({ label, value }: { label: string; value: number }) {
  const color =
    value >= 90 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    : value >= 70 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'

  return (
    <div className={`flex-1 rounded-lg px-3 py-2 text-center ${color}`}>
      <p className="text-xs">{label}</p>
      <p className="text-lg font-bold">{value}%</p>
    </div>
  )
}
