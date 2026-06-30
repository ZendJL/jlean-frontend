'use client'

import { useState } from 'react'
import RecipeBuilderMacros from '@/components/recipes/RecipeBuilderMacros'
import RecipeBuilderMicros from '@/components/recipes/RecipeBuilderMicros'
import type { BuildByMacrosResult, BuildByMicrosResult } from '@/lib/api/recipes.api'

type Tab = 'macros' | 'micros'

export default function RecipeBuilderPage() {
  const [tab, setTab] = useState<Tab>('macros')

  // Handler de importación (por ahora muestra toast; se puede extender
  // para pre-llenar un formulario de receta)
  function handleImportMacros(result: BuildByMacrosResult) {
    console.info('[RecipeBuilder] import macros result', result)
    // TODO: abrir modal de creación de receta con ingredientes pre-cargados
    alert(
      `Suggestion ready!\n\n` +
      result.ingredients
        .map(i => `• ${i.foodName} — ${i.suggestedQuantityG}g`)
        .join('\n')
    )
  }

  function handleImportMicros(result: BuildByMicrosResult) {
    console.info('[RecipeBuilder] import micros result', result)
    alert(
      `Suggestion ready!\n\n` +
      result.ingredients
        .map(i => `• ${i.foodName} — ${i.suggestedQuantityG}g`)
        .join('\n')
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Recipe Builder</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Get ingredient suggestions based on your macro or micronutrient targets.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-gray-100 dark:bg-gray-800 mb-6">
        {([
          { key: 'macros', label: '🥩 By Macros',      color: 'emerald' },
          { key: 'micros', label: '💊 By Micronutrients', color: 'violet' },
        ] as { key: Tab; label: string; color: string }[]).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.key
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Panel */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        {tab === 'macros'
          ? <RecipeBuilderMacros onImport={handleImportMacros} />
          : <RecipeBuilderMicros onImport={handleImportMicros} />}
      </div>
    </div>
  )
}
