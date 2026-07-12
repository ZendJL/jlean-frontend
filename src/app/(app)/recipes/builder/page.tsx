'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCreateRecipe } from '@/lib/hooks/useRecipes'
import RecipeBuilderMacros from '@/components/recipes/RecipeBuilderMacros'
import RecipeBuilderMicros from '@/components/recipes/RecipeBuilderMicros'
import ImportRecipeModal from '@/components/recipes/ImportRecipeModal'
import type { BuildByMacrosResult, BuildByMicrosResult } from '@/lib/api/recipes.api'
import { ArrowLeft } from 'lucide-react'

type Tab = 'macros' | 'micros'

export default function RecipeBuilderPage() {
  const router       = useRouter()
  const createRecipe = useCreateRecipe()
  const [tab, setTab] = useState<Tab>('macros')
  const [pendingResult, setPendingResult] = useState<BuildByMacrosResult | BuildByMicrosResult | null>(null)

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-text-muted hover:text-text transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-text">Recipe Builder</h1>
          <p className="text-sm text-text-muted mt-0.5">
            Get ingredient suggestions based on your macro or micronutrient targets.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-gray-100 dark:bg-gray-800">
        {([
          { key: 'macros', label: '🥩 By Macros' },
          { key: 'micros', label: '💊 By Micronutrients' },
        ] as { key: Tab; label: string }[]).map(t => (
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
      <div className="bg-surface rounded-2xl border border-border p-6">
        {tab === 'macros'
          ? <RecipeBuilderMacros onImport={r => setPendingResult(r)} />
          : <RecipeBuilderMicros onImport={r => setPendingResult(r)} />}
      </div>

      {/* Import modal */}
      {pendingResult && (
        <ImportRecipeModal
          result={pendingResult}
          onClose={() => setPendingResult(null)}
          onCreate={async (name, servings) => {
            const r = await createRecipe.mutateAsync({ name, servings })
            router.push(`/recipes?open=${r.id}`)
          }}
        />
      )}
    </div>
  )
}
