'use client'

import { useState } from 'react'
import FoodSearchBar from '@/components/foods/FoodSearchBar'
import CreateFoodModal from '@/components/foods/CreateFoodModal'
import { useFoodDetail } from '@/lib/hooks/useFoods'
import { X, Leaf, Plus } from 'lucide-react'
import { type FoodResult } from '@/lib/api/foods.api'

const QUALITY_WARNING: Record<string, { label: string; msg: string; color: string }> = {
  PARTIAL:    { label: 'Partial data',    msg: 'Micronutrient data may be incomplete.',           color: 'text-yellow-600 dark:text-yellow-400' },
  UNVERIFIED: { label: 'Unverified',      msg: 'Data has not been verified against a trusted source.', color: 'text-orange-600 dark:text-orange-400' },
  CONFLICTED: { label: 'Conflicted data', msg: 'Nutrient values conflict between sources.',        color: 'text-red-600 dark:text-red-400' },
}

function FoodDetailPanel({ foodId, onClose }: { foodId: string; onClose: () => void }) {
  const { data, isLoading, isError } = useFoodDetail(foodId)

  return (
    <aside className="w-full lg:w-80 shrink-0 bg-surface border border-border rounded-xl p-5 space-y-4 self-start sticky top-6">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold text-text leading-snug">
          {isLoading ? 'Loading…' : (data?.name ?? 'Food detail')}
        </h3>
        <button onClick={onClose} className="shrink-0 text-text-muted hover:text-text transition-colors" aria-label="Close detail">
          <X size={16} />
        </button>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => <div key={i} className="h-4 bg-surface-2 rounded animate-pulse" />)}
        </div>
      )}

      {isError && <p className="text-xs text-error">Could not load food details.</p>}

      {data && (
        <>
          {/* Quality warning banner */}
          {data.qualityStatus && QUALITY_WARNING[data.qualityStatus] && (
            <div className={`rounded-lg border px-3 py-2 text-xs ${
              data.qualityStatus === 'PARTIAL'    ? 'border-yellow-400/40 bg-yellow-50 dark:bg-yellow-950/20' :
              data.qualityStatus === 'UNVERIFIED' ? 'border-orange-400/40 bg-orange-50 dark:bg-orange-950/20' :
              'border-red-400/40 bg-red-50 dark:bg-red-950/20'
            }`}>
              <span className={`font-semibold ${QUALITY_WARNING[data.qualityStatus].color}`}>
                ⚠ {QUALITY_WARNING[data.qualityStatus].label}:
              </span>{' '}
              <span className="text-text-muted">{QUALITY_WARNING[data.qualityStatus].msg}</span>
            </div>
          )}

          {data.servingSizeG != null && (
            <p className="text-xs text-text-muted">Per {data.servingSizeG}g serving</p>
          )}

          {/* Macros */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Calories', value: Math.round(data.calories),   unit: 'kcal', color: 'text-primary' },
              { label: 'Protein',  value: data.proteinG?.toFixed(1),   unit: 'g',    color: 'text-protein'  },
              { label: 'Carbs',    value: data.carbsG?.toFixed(1),     unit: 'g',    color: 'text-carbs'    },
              { label: 'Fat',      value: data.fatG?.toFixed(1),       unit: 'g',    color: 'text-fat'      },
              { label: 'Fiber',    value: data.fiberG?.toFixed(1),     unit: 'g',    color: 'text-text-muted' },
              { label: 'Sodium',   value: data.sodiumMg?.toFixed(0),   unit: 'mg',   color: 'text-text-muted' },
            ]
              .filter((m) => m.value != null)
              .map(({ label, value, unit, color }) => (
                <div key={label} className="bg-surface-2 rounded-lg px-3 py-2 text-center">
                  <p className={`text-sm font-semibold ${color}`}>
                    {value}<span className="text-xs font-normal text-text-muted ml-0.5">{unit}</span>
                  </p>
                  <p className="text-xs text-text-faint mt-0.5">{label}</p>
                </div>
              ))}
          </div>

          {/* Micronutrients table */}
          {data.micros && Object.keys(data.micros).length > 0 && (
            <div>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Micronutrients</p>
              <table className="w-full text-xs">
                <tbody>
                  {Object.entries(data.micros).map(([key, val]) => (
                    <tr key={key} className="border-b border-divider last:border-0">
                      <td className="py-1 text-text-muted capitalize">{key.replace(/_/g, ' ')}</td>
                      <td className="py-1 text-right font-medium text-text">{String(val)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Source & quality */}
          <div className="flex items-center justify-between text-xs">
            {data.qualityStatus && (
              <span className={`font-medium ${
                data.qualityStatus === 'COMPLETE'   ? 'text-green-500' :
                data.qualityStatus === 'PARTIAL'    ? 'text-yellow-500' :
                data.qualityStatus === 'UNVERIFIED' ? 'text-orange-500' : 'text-red-500'
              }`}>
                {data.qualityStatus.charAt(0) + data.qualityStatus.slice(1).toLowerCase()}
              </span>
            )}
            {data.sourceType && (
              <span className="text-text-faint">Source: {data.sourceType.toUpperCase()}</span>
            )}
          </div>
        </>
      )}
    </aside>
  )
}

export default function FoodsPage() {
  const [selectedFood, setSelectedFood]   = useState<Pick<FoodResult, 'id' | 'name'> | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-text flex items-center gap-2">
            <Leaf size={22} className="text-primary" />
            Foods
          </h2>
          <p className="text-text-muted text-sm mt-1">
            Search your foods, presets, USDA and Open Food Facts catalog.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 bg-primary text-[#0f1117] font-semibold rounded-lg px-3 py-2 text-sm hover:bg-primary-hover transition-colors"
        >
          <Plus size={16} /> Add food
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="flex-1 min-w-0">
          <div className="bg-surface border border-border rounded-xl p-5">
            <FoodSearchBar
              onSelect={(food) => setSelectedFood(food)}
              placeholder="Search foods…"
            />
          </div>
        </div>

        {selectedFood ? (
          <FoodDetailPanel foodId={selectedFood.id} onClose={() => setSelectedFood(null)} />
        ) : (
          <aside className="hidden lg:flex w-80 shrink-0 bg-surface border border-border border-dashed rounded-xl p-8 items-center justify-center self-start sticky top-6">
            <div className="text-center">
              <p className="text-3xl mb-3">🥦</p>
              <p className="text-text-muted text-sm">Select a food to see its nutritional details.</p>
            </div>
          </aside>
        )}
      </div>

      {showCreateModal && <CreateFoodModal onClose={() => setShowCreateModal(false)} />}
    </div>
  )
}
