'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRecipes, useCreateRecipe, useDeleteRecipe, useAddIngredient, useRemoveIngredient } from '@/lib/hooks/useRecipes'
import FoodSearchBar from '@/components/foods/FoodSearchBar'
import ImportRecipeModal from '@/components/recipes/ImportRecipeModal'
import { Plus, Trash2, ChevronRight, ArrowLeft, Wand2 } from 'lucide-react'
import type { BuildByMacrosResult, BuildByMicrosResult } from '@/lib/api/recipes.api'

export default function RecipesPage() {
  const { data: recipes, isLoading } = useRecipes()
  const createRecipe    = useCreateRecipe()
  const deleteRecipe    = useDeleteRecipe()

  const [view, setView]               = useState<'list' | 'detail'>('list')
  const [activeId, setActiveId]       = useState<string | null>(null)
  const [showNew, setShowNew]         = useState(false)
  const [newName, setNewName]         = useState('')
  const [newServings, setNewServings] = useState(1)
  const [importResult, setImportResult] = useState<BuildByMacrosResult | BuildByMicrosResult | null>(null)

  const active       = recipes?.find(r => r.id === activeId)
  const addIngredient    = useAddIngredient(activeId ?? '')
  const removeIngredient = useRemoveIngredient(activeId ?? '')

  const handleCreate = async () => {
    if (!newName.trim()) return
    const r = await createRecipe.mutateAsync({ name: newName.trim(), servings: newServings })
    setActiveId(r.id)
    setView('detail')
    setShowNew(false)
    setNewName('')
    setNewServings(1)
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 bg-surface rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  // — Detail view —
  if (view === 'detail' && active) {
    const total  = active.macrosTotal      ?? { calories: 0, protein: 0, carbs: 0, fat: 0 }
    const perSrv = active.macrosPerServing ?? { calories: 0, protein: 0, carbs: 0, fat: 0 }
    const items: any[] = active.items ?? []

    return (
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center gap-3">
          <button onClick={() => setView('list')} className="text-text-muted hover:text-text">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-2xl font-semibold text-text">{active.name}</h2>
        </div>

        {/* Macros totales y por porción */}
        <div className="bg-surface rounded-xl border border-border px-4 py-3 space-y-2">
          <p className="text-xs text-text-muted uppercase tracking-wide">Totals</p>
          <div className="grid grid-cols-4 gap-4 text-center">
            {[
              { label: 'Calories', val: `${Math.round(total.calories)} kcal` },
              { label: 'Protein',  val: `${Number(total.protein).toFixed(1)}g`  },
              { label: 'Carbs',    val: `${Number(total.carbs).toFixed(1)}g`    },
              { label: 'Fat',      val: `${Number(total.fat).toFixed(1)}g`      },
            ].map(({ label, val }) => (
              <div key={label}>
                <p className="text-xs text-text-muted uppercase tracking-wide">{label}</p>
                <p className="text-base font-semibold text-text">{val}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-text-faint text-center">
            {active.servings} serving{active.servings > 1 ? 's' : ''}
            {' · '}{Math.round(perSrv.calories)} kcal / serving
            {' · '} P {Number(perSrv.protein).toFixed(1)}g
            {' · '} C {Number(perSrv.carbs).toFixed(1)}g
            {' · '} F {Number(perSrv.fat).toFixed(1)}g
          </p>
        </div>

        {/* Ingredients list */}
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-divider flex items-center justify-between">
            <p className="text-sm font-medium text-text">Ingredients</p>
            <span className="text-xs text-text-faint">{items.length} items</span>
          </div>
          {items.length === 0 ? (
            <p className="px-4 py-3 text-sm text-text-faint italic">No ingredients yet.</p>
          ) : (
            <ul className="divide-y divide-divider">
              {items.map((ing: any) => (
                <li key={ing.id} className="px-4 py-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-text truncate">{ing.foodName}</p>
                    <p className="text-xs text-text-muted">{ing.quantityG}g</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium text-text">{Math.round(ing.macros?.calories ?? 0)} kcal</p>
                    <p className="text-xs text-text-faint">
                      P {Number(ing.macros?.protein ?? 0).toFixed(1)}g
                      {' · '} C {Number(ing.macros?.carbs ?? 0).toFixed(1)}g
                      {' · '} F {Number(ing.macros?.fat ?? 0).toFixed(1)}g
                    </p>
                  </div>
                  <button
                    onClick={() => removeIngredient.mutate(ing.id)}
                    className="text-text-faint hover:text-error transition-colors shrink-0"
                    aria-label="Remove ingredient"
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Add ingredient */}
        <div className="bg-surface rounded-xl border border-border p-4">
          <p className="text-sm font-medium text-text mb-3">Add ingredient</p>
          <FoodSearchBar
            placeholder="Search food to add…"
            onSelect={food => addIngredient.mutate({ foodId: food.id, quantityG: 100 })}
          />
        </div>

        {/* Delete recipe */}
        <button
          onClick={async () => { await deleteRecipe.mutateAsync(active.id); setView('list'); setActiveId(null) }}
          disabled={deleteRecipe.isPending}
          className="text-xs text-error hover:underline disabled:opacity-50"
        >
          Delete recipe
        </button>
      </div>
    )
  }

  // — List view —
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-text">Recipes</h2>
        <div className="flex items-center gap-2">
          <Link
            href="/recipes/builder"
            className="flex items-center gap-1.5 border border-border text-text-muted rounded-lg px-3 py-2 text-sm hover:bg-surface-2 transition-colors"
          >
            <Wand2 size={15} /> Builder
          </Link>
          <button
            onClick={() => setShowNew(!showNew)}
            className="flex items-center gap-1.5 bg-primary text-[#0f1117] font-semibold rounded-lg px-3 py-2 text-sm hover:bg-primary-hover transition-colors"
          >
            <Plus size={16} /> New recipe
          </button>
        </div>
      </div>

      {showNew && (
        <div className="bg-surface rounded-xl border border-border p-4 space-y-3">
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Recipe name"
            className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text
                       placeholder:text-text-faint focus:outline-none focus:border-primary"
          />
          <div className="flex items-center gap-2">
            <label className="text-sm text-text-muted">Servings</label>
            <input
              type="number" min={1} value={newServings}
              onChange={e => setNewServings(Number(e.target.value))}
              className="w-20 bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text text-right focus:outline-none focus:border-primary"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={!newName.trim() || createRecipe.isPending}
              className="bg-primary text-[#0f1117] font-semibold rounded-lg px-4 py-2 text-sm hover:bg-primary-hover disabled:opacity-50 transition-colors"
            >
              {createRecipe.isPending ? 'Creating…' : 'Create'}
            </button>
            <button onClick={() => setShowNew(false)} className="text-text-muted text-sm hover:text-text">Cancel</button>
          </div>
        </div>
      )}

      {(!recipes || recipes.length === 0) ? (
        <div className="bg-surface rounded-xl border border-border p-8 text-center">
          <p className="text-2xl mb-3">🍳</p>
          <p className="text-text font-medium">No recipes yet</p>
          <p className="text-text-muted text-sm mt-1">Create your first recipe or use the Builder to auto-suggest ingredients.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {recipes.map(recipe => {
            const t = recipe.macrosTotal ?? { calories: 0, protein: 0 }
            return (
              <li key={recipe.id}>
                <button
                  onClick={() => { setActiveId(recipe.id); setView('detail') }}
                  className="w-full bg-surface rounded-xl border border-border px-4 py-3
                             flex items-center justify-between hover:bg-surface-2 transition-colors"
                >
                  <div className="text-left">
                    <p className="text-sm font-medium text-text">{recipe.name}</p>
                    <p className="text-xs text-text-muted">
                      {Math.round(t.calories)} kcal · P {Number(t.protein).toFixed(1)}g
                      {' · '}{recipe.servings} serving{recipe.servings > 1 ? 's' : ''}
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-text-faint" />
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {/* Import modal desde el builder */}
      {importResult && (
        <ImportRecipeModal
          result={importResult}
          onClose={() => setImportResult(null)}
          onCreate={async (name, servings) => {
            const r = await createRecipe.mutateAsync({ name, servings })
            setActiveId(r.id)
            setView('detail')
            setImportResult(null)
          }}
        />
      )}
    </div>
  )
}
