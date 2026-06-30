'use client'

import { useState } from 'react'
import { CalendarDays, Plus, Trash2, Check } from 'lucide-react'
import {
  useDayTypes,
  useTodayAssignment,
  useAssignDayType,
  useRemoveAssignment,
  useCreateDayType,
  useDeleteDayType,
} from '@/lib/hooks/useDayTypes'

const today = new Date().toISOString().split('T')[0]

export default function DayTypesPage() {
  const { data: dayTypes = [], isLoading } = useDayTypes()
  const { data: todayAssignment } = useTodayAssignment()
  const assignMutation    = useAssignDayType()
  const removeMutation    = useRemoveAssignment()
  const createMutation    = useCreateDayType()
  const deleteMutation    = useDeleteDayType()

  const [showForm, setShowForm] = useState(false)
  const [newName,  setNewName]  = useState('')
  const [newAdj,   setNewAdj]   = useState(0)
  const [newColor, setNewColor] = useState('#64748b')

  const handleAssign = (dayTypeId: string) => {
    if (todayAssignment?.dayTypeId === dayTypeId) {
      removeMutation.mutate(today)
    } else {
      assignMutation.mutate({ dayTypeId, date: today })
    }
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    createMutation.mutate(
      { name: newName.trim(), tdeAdjustPct: newAdj, color: newColor },
      {
        onSuccess: () => {
          setNewName('')
          setNewAdj(0)
          setNewColor('#64748b')
          setShowForm(false)
        },
      },
    )
  }

  const adjLabel = (pct: number) => {
    if (pct === 0) return 'Base TDEE'
    return pct > 0 ? `+${pct}% TDEE` : `${pct}% TDEE`
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-16 bg-surface rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-xl space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-text flex items-center gap-2">
            <CalendarDays size={20} className="text-primary" />
            Day Types
          </h2>
          <p className="text-text-muted text-sm mt-0.5">
            Assign a day type to dynamically adjust your TDEE target.
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 bg-primary text-[#0f1117] text-sm font-semibold px-3 py-2 rounded-lg hover:bg-primary-hover transition-colors"
        >
          <Plus size={15} />
          New type
        </button>
      </div>

      {/* Today banner */}
      {todayAssignment && (
        <div
          className="rounded-xl border px-4 py-3 flex items-center justify-between"
          style={{
            borderColor: todayAssignment.dayType.color ?? 'var(--color-border)',
            background:  `${todayAssignment.dayType.color ?? '#64748b'}18`,
          }}
        >
          <div>
            <p className="text-xs text-text-muted uppercase tracking-wide">Today</p>
            <p className="font-semibold text-text">{todayAssignment.dayType.name}</p>
            <p className="text-xs text-text-muted">{adjLabel(todayAssignment.dayType.tdeAdjustPct)}</p>
          </div>
          <button
            onClick={() => removeMutation.mutate(today)}
            disabled={removeMutation.isPending}
            className="text-xs text-text-muted hover:text-error transition-colors disabled:opacity-50"
          >
            Remove
          </button>
        </div>
      )}

      {/* New day type form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-surface border border-border rounded-xl p-4 space-y-3"
        >
          <p className="text-sm font-medium text-text">Create day type</p>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Name (e.g. Heavy Training)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1 bg-bg border border-border rounded-lg px-3 py-2 text-sm text-text placeholder:text-text-faint focus:outline-none focus:border-primary"
              maxLength={40}
            />
            <input
              type="color"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              title="Pick a color"
              className="w-10 h-10 rounded-lg border border-border cursor-pointer bg-bg p-1"
            />
          </div>

          <div>
            <label className="text-xs text-text-muted block mb-1">
              TDEE Adjustment:{' '}
              <span className="text-text font-medium">{adjLabel(newAdj)}</span>
            </label>
            <input
              type="range"
              min={-50}
              max={50}
              step={5}
              value={newAdj}
              onChange={(e) => setNewAdj(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-text-faint mt-0.5">
              <span>-50%</span>
              <span>0</span>
              <span>+50%</span>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={createMutation.isPending || !newName.trim()}
              className="flex-1 bg-primary text-[#0f1117] text-sm font-semibold py-2 rounded-lg hover:bg-primary-hover disabled:opacity-50 transition-colors"
            >
              {createMutation.isPending ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm text-text-muted hover:text-text rounded-lg border border-border transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* List */}
      <div className="space-y-2">
        {dayTypes.length === 0 ? (
          <div className="bg-surface rounded-xl border border-border p-8 text-center">
            <p className="text-3xl mb-3">🗓️</p>
            <p className="text-text font-medium">No day types yet</p>
            <p className="text-text-muted text-sm mt-1">
              Create your first type above to start customizing your daily targets.
            </p>
          </div>
        ) : (
          dayTypes.map((dt) => {
            const isActive = todayAssignment?.dayTypeId === dt.id
            return (
              <div
                key={dt.id}
                className="bg-surface border border-border rounded-xl px-4 py-3 flex items-center justify-between group hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ background: dt.color ?? '#64748b' }}
                  />
                  <div>
                    <p className="text-sm font-medium text-text">{dt.name}</p>
                    <p className="text-xs text-text-muted">{adjLabel(dt.tdeAdjustPct)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAssign(dt.id)}
                    disabled={assignMutation.isPending || removeMutation.isPending}
                    className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'bg-surface-2 text-text-muted hover:text-text hover:bg-surface-offset'
                    }`}
                  >
                    {isActive && <Check size={12} />}
                    {isActive ? 'Today' : 'Set today'}
                  </button>

                  {!dt.isDefault && (
                    <button
                      onClick={() => deleteMutation.mutate(dt.id)}
                      disabled={deleteMutation.isPending}
                      className="opacity-0 group-hover:opacity-100 text-text-faint hover:text-error transition-all disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
