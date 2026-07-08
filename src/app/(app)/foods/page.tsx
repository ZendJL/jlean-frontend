'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { foodsApi, type FoodDetail, type FoodResult, type QualityStatus } from '@/lib/api/foods.api'
import FoodSearchBar from '@/components/foods/FoodSearchBar'
import { X, FlaskConical, AlertTriangle, CheckCircle2, Info } from 'lucide-react'

// --- Calidad de datos ---
const QUALITY_META: Record<QualityStatus, { label: string; color: string; icon: React.ReactNode; description: string }> = {
  COMPLETE:   {
    label: 'Complete',
    color: 'text-green-600 dark:text-green-400',
    icon: <CheckCircle2 size={14} />,
    description: 'All macro and micronutrient data is verified and complete.',
  },
  PARTIAL:    {
    label: 'Partial data',
    color: 'text-yellow-600 dark:text-yellow-400',
    icon: <Info size={14} />,
    description: 'Some micronutrient fields are missing. Macros are reliable.',
  },
  UNVERIFIED: {
    label: 'Unverified',
    color: 'text-orange-600 dark:text-orange-400',
    icon: <AlertTriangle size={14} />,
    description: 'Data provided by community. May not be accurate.',
  },
  CONFLICTED: {
    label: 'Conflicted',
    color: 'text-red-600 dark:text-red-400',
    icon: <AlertTriangle size={14} />,
    description: 'Inconsistent data detected between sources. Use with caution.',
  },
}

// --- Modal detalle de alimento ---
function FoodDetailModal({ foodId, onClose }: { foodId: string; onClose: () => void }) {
  const { data, isLoading } = useQuery<FoodDetail>({
    queryKey: ['foods', 'detail', foodId],
    queryFn:  () => foodsApi.getById(foodId),
    staleTime: 1000 * 60 * 10,
  })

  const quality = data?.qualityStatus ? QUALITY_META[data.qualityStatus] : null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex-1 min-w-0">
            {isLoading
              ? <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              : <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">{data?.name}</h3>
            }
            {quality && (
              <div className={`flex items-center gap-1 mt-1 text-xs ${quality.color}`}>
                {quality.icon}
                <span>{quality.label}</span>
              </div>
            )}
          </div>
          <button onClick={onClose} className="ml-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X size={20} />
          </button>
        </div>

        {isLoading ? (
          <div className="p-5 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
            ))}
          </div>
        ) : data ? (
          <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">

            {/* Advertencia de calidad */}
            {quality && data.qualityStatus !== 'COMPLETE' && (
              <div className={`flex gap-2 p-3 rounded-xl text-xs border ${
                data.qualityStatus === 'CONFLICTED'
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
                  : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300'
              }`}>
                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                <p>{quality.description}</p>
              </div>
            )}

            {/* Serving */}
            {data.servingSize && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Serving size: {data.servingSize}{data.servingUnit ?? 'g'}
              </p>
            )}

            {/* Macros principales */}
            <section>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Macros (per 100g)</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Calories', value: `${Math.round(data.calories)} kcal`, color: 'text-primary' },
                  { label: 'Protein',  value: `${data.proteinG?.toFixed(1)}g`,     color: 'text-emerald-600 dark:text-emerald-400' },
                  { label: 'Carbs',    value: `${data.carbsG?.toFixed(1)}g`,       color: 'text-sky-600 dark:text-sky-400' },
                  { label: 'Fat',      value: `${data.fatG?.toFixed(1)}g`,         color: 'text-orange-500 dark:text-orange-400' },
                  ...(data.fiberG != null ? [{ label: 'Fiber', value: `${data.fiberG.toFixed(1)}g`, color: 'text-lime-600 dark:text-lime-400' }] : []),
                  ...(data.alcoholG != null ? [{ label: 'Alcohol', value: `${data.alcoholG.toFixed(1)}g`, color: 'text-purple-600 dark:text-purple-400' }] : []),
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                    <p className={`text-base font-semibold ${color}`}>{value}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Micronutrientes */}
            {(data.sodiumMg != null || data.calciumMg != null || data.ironMg != null ||
              data.magnesiumMg != null || data.potassiumMg != null ||
              data.vitaminCMg != null || data.vitaminDMcg != null || data.vitaminB12Mcg != null) && (
              <section>
                <div className="flex items-center gap-1.5 mb-2">
                  <FlaskConical size={13} className="text-gray-400" />
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Micronutrients</p>
                </div>
                <ul className="space-y-1.5">
                  {[
                    { label: 'Sodium',     value: data.sodiumMg,     unit: 'mg' },
                    { label: 'Calcium',    value: data.calciumMg,    unit: 'mg' },
                    { label: 'Iron',       value: data.ironMg,       unit: 'mg' },
                    { label: 'Magnesium',  value: data.magnesiumMg,  unit: 'mg' },
                    { label: 'Potassium',  value: data.potassiumMg,  unit: 'mg' },
                    { label: 'Vitamin C',  value: data.vitaminCMg,   unit: 'mg' },
                    { label: 'Vitamin D',  value: data.vitaminDMcg,  unit: 'µg' },
                    { label: 'Vitamin B12',value: data.vitaminB12Mcg,unit: 'µg' },
                    { label: 'Caffeine',   value: data.caffeineMg,   unit: 'mg' },
                  ]
                    .filter(({ value }) => value != null)
                    .map(({ label, value, unit }) => (
                      <li key={label} className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">{label}</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{(value as number).toFixed(1)} {unit}</span>
                      </li>
                    ))
                  }
                </ul>
              </section>
            )}

          </div>
        ) : null}
      </div>
    </div>
  )
}

// --- Página principal ---
export default function FoodsPage() {
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null)

  return (
    <div className="space-y-6 max-w-2xl">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-text">Food Catalog</h2>
        <p className="text-text-muted text-sm mt-1">
          Search across your foods, presets, USDA and Open Food Facts.
        </p>
      </div>

      {/* Búsqueda con tabs */}
      <FoodSearchBar
        onSelect={(food) => setSelectedFoodId(food.id)}
        placeholder="Search foods…"
      />

      {/* Modal detalle */}
      {selectedFoodId && (
        <FoodDetailModal
          foodId={selectedFoodId}
          onClose={() => setSelectedFoodId(null)}
        />
      )}

    </div>
  )
}
