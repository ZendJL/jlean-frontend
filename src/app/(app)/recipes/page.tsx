'use client'

import { useState } from 'react'
import { useRecipes, useCreateRecipe, useDeleteRecipe, useAddIngredient } from '@/lib/hooks/useRecipes'
import FoodSearchBar from '@/components/foods/FoodSearchBar'
import { Plus, Trash2, ChevronRight, ArrowLeft } from 'lucide-react'

export default function RecipesPage() {
  const { data: recipes, isLoading } = useRecipes()
  const createRecipe  = useCreateRecipe()
  const deleteRecipe  = useDeleteRecipe()

  const [view, setView]   = useState<'list' | 'detail'>('list')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [showNew, setShowNew]   = useState(false)
  const [newName, setNewName]   = useState('')
  const [newServings, setNewServings] = useState(1)

  const active = recipes?.find(r => r.id === activeId)
  const addIngredient = useAddIngredient(activeId ?? '')

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
    return <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-surface rounded-xl animate-pulse" />)}</div>
  }

  // — Detail view —
  if (view === 'detail' && active) {
    return (
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center gap-3">
          <button onClick={() => setView('list')} className="text-text-muted hover:text-text"><ArrowLeft size={20} /></button>
          <h2 className="text-2xl font-semibold text-text">{active.name}</h2>
        </div>

        {/* Macros */}
        <div className="bg-surface rounded-xl border border-border px-4 py-3 grid grid-cols-4 gap-4 text-center">
          {[
            { label: 'Calories', val: `${active.calories} kcal` },
            { label: 'Protein',  val: `${active.proteinG}g` },
            { label: 'Carbs',    val: `${active.carbsG}g` },
            { label: 'Fat',      val: `${active.fatG}g` },
          ].map(({ label, val }) => (
            <div key={label}>
              <p className="text-xs text-text-muted uppercase tracking-wide">{label}</p>
              <p className="text-base font-semibold text-text">{val}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-text-muted">{active.servings} serving{active.servings > 1 ? 's' : ''} · {active.calPerServing} kcal/serving</p>

        {/* Ingredients */}
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-divider">
            <p className="text-sm font-medium text-text">Ingredients</p>
          </div>
          {active.ingredients.length === 0 ? (
            <p className="px-4 py-3 text-sm text-text-faint italic">No ingredients yet.</p>
          ) : (
            <ul className="divide-y divide-divider">
              {active.ingredients.map(ing => (
                <li key={ing.id} className="px-4 py-2.5 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text">{ing.foodName}</p>
                    <p className="text-xs text-text-muted">{ing.quantityG}g</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-text">{ing.calories} kcal</p>
                    <p className="text-xs text-text-faint">P {ing.proteinG}g · C {ing.carbsG}g · F {ing.fatG}g</p>
                  </div>
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
      </div>
    )
  }

  // — List view —
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-text">Recipes</h2>
        <button
          onClick={() => setShowNew(!showNew)}
          className="flex items-center gap-1.5 bg-primary text-[#0f1117] font-semibold rounded-lg px-3 py-2 text-sm
                     hover:bg-primary-hover transition-colors"
        >
          <Plus size={16} /> New recipe
        </button>
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
              className="w-20 bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text text-right
                         focus:outline-none focus:border-primary"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={!newName.trim() || createRecipe.isPending}
              className="bg-primary text-[#0f1117] font-semibold rounded-lg px-4 py-2 text-sm
                         hover:bg-primary-hover disabled:opacity-50 transition-colors"
            >
              Create
            </button>
            <button onClick={() => setShowNew(false)} className="text-text-muted text-sm hover:text-text">Cancel</button>
          </div>
        </div>
      )}

      {(!recipes || recipes.length === 0) ? (
        <div className="bg-surface rounded-xl border border-border p-8 text-center">
          <p className="text-2xl mb-3">🍳</p>
          <p className="text-text font-medium">No recipes yet</p>
          <p className="text-text-muted text-sm mt-1">Create your first recipe to reuse it in your daily log.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {recipes.map(recipe => (
            <li key={recipe.id}>
              <button
                onClick={() => { setActiveId(recipe.id); setView('detail') }}
                className="w-full bg-surface rounded-xl border border-border px-4 py-3
                           flex items-center justify-between hover:bg-surface-2 transition-colors"
              >
                <div className="text-left">
                  <p className="text-sm font-medium text-text">{recipe.name}</p>
                  <p className="text-xs text-text-muted">
                    {recipe.calories} kcal · P {recipe.proteinG}g · {recipe.servings} serving{recipe.servings > 1 ? 's' : ''}
                  </p>
                </div>
                <ChevronRight size={16} className="text-text-faint" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
