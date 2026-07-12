'use client'

import { useState } from 'react'
import { AlertTriangle, CheckCircle2, Plus, Trash2 } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api/client'

type RestrictionType = 'ALLERGY' | 'INTOLERANCE' | 'MEDICAL_CONDITION' | 'SENSITIVE_MEDICATION'

interface ProfileData {
  birthDate?: string
  gender?: string
  heightCm?: number
  weightKg?: number
  activityLevel: string
  goal: string
  calorieTarget?: number
  proteinTarget?: number
  carbTarget?: number
  fatTarget?: number
  restrictions?: Array<{
    id: string
    type: RestrictionType
    name: string
    notes?: string
  }>
}

const ACTIVITY_OPTIONS = [
  { value: 'SEDENTARY', label: 'Sedentary (desk job, no exercise)' },
  { value: 'LIGHTLY_ACTIVE', label: 'Lightly active (1-3 days/week)' },
  { value: 'MODERATELY_ACTIVE', label: 'Moderately active (3-5 days/week)' },
  { value: 'VERY_ACTIVE', label: 'Very active (6-7 days/week)' },
  { value: 'EXTRA_ACTIVE', label: 'Extra active (athlete / physical job)' },
]

const GOAL_OPTIONS = [
  { value: 'LOSE', label: 'Lose weight (cut)' },
  { value: 'MAINTAIN', label: 'Maintain weight' },
  { value: 'GAIN', label: 'Gain muscle (bulk)' },
]

const RESTRICTION_LABELS: Record<RestrictionType, string> = {
  ALLERGY: 'Allergy',
  INTOLERANCE: 'Intolerance',
  MEDICAL_CONDITION: 'Medical condition',
  SENSITIVE_MEDICATION: 'Sensitive medication',
}

function EmptyRestrictions() {
  return (
    <div className="rounded-xl border border-dashed border-border bg-bg px-4 py-5 text-center">
      <p className="text-sm font-medium text-text">No health restrictions added</p>
      <p className="mt-1 text-xs text-text-muted">
        Add allergies, intolerances, conditions, or medications to improve alerts and food screening.
      </p>
    </div>
  )
}

export default function ProfilePage() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => api.get<ProfileData>('/profile').then(r => r.data),
  })

  const save = useMutation({
    mutationFn: (form: Partial<ProfileData>) => api.put('/profile', form).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile'] }),
  })

  const [form, setForm] = useState<Partial<ProfileData>>({})
  const [saved, setSaved] = useState(false)
  const [restriction, setRestriction] = useState({ type: 'ALLERGY' as RestrictionType, name: '', notes: '' })

  useState(() => {
    if (data) setForm(data)
  })

  if (data && form !== data && !form.activityLevel && !form.goal) {
    setForm(data)
  }

  const set = (key: keyof ProfileData, val: any) => setForm(p => ({ ...p, [key]: val }))

  const handleSave = async () => {
    await save.mutateAsync(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const restrictions = form.restrictions ?? []

  const addRestriction = () => {
    if (!restriction.name.trim()) return
    setForm(p => ({
      ...p,
      restrictions: [
        ...(p.restrictions ?? []),
        {
          id: crypto.randomUUID(),
          type: restriction.type,
          name: restriction.name.trim(),
          notes: restriction.notes.trim() || undefined,
        },
      ],
    }))
    setRestriction({ type: 'ALLERGY', name: '', notes: '' })
  }

  const removeRestriction = (id: string) => {
    setForm(p => ({
      ...p,
      restrictions: (p.restrictions ?? []).filter(item => item.id !== id),
    }))
  }

  if (isLoading) return <div className="space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="h-12 bg-surface rounded-xl animate-pulse" />)}</div>

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h2 className="text-2xl font-semibold text-text">Profile</h2>
        <p className="mt-1 text-sm text-text-muted">Manage your biometrics, goals, and health-related restrictions.</p>
      </div>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-text uppercase tracking-wide">Biometrics</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-text-muted">Weight (kg)</label>
            <input type="number" value={form.weightKg ?? ''} onChange={e => set('weightKg', parseFloat(e.target.value))}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-text-muted">Height (cm)</label>
            <input type="number" value={form.heightCm ?? ''} onChange={e => set('heightCm', parseFloat(e.target.value))}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-text-muted">Date of birth</label>
            <input type="date" value={form.birthDate ? form.birthDate.slice(0, 10) : ''} onChange={e => set('birthDate', e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs text-text-muted">Gender</label>
            <select value={form.gender ?? ''} onChange={e => set('gender', e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text focus:border-primary focus:outline-none">
              <option value="">Select</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-text uppercase tracking-wide">Goals</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-text-muted">Activity level</label>
            <select value={form.activityLevel ?? 'SEDENTARY'} onChange={e => set('activityLevel', e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text focus:border-primary focus:outline-none">
              {ACTIVITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-text-muted">Goal</label>
            <select value={form.goal ?? 'MAINTAIN'} onChange={e => set('goal', e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text focus:border-primary focus:outline-none">
              {GOAL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-text uppercase tracking-wide">Manual targets <span className="font-normal normal-case text-text-faint">— override auto</span></h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {([
            ['calorieTarget', 'Calories (kcal)'],
            ['proteinTarget', 'Protein (g)'],
            ['carbTarget', 'Carbs (g)'],
            ['fatTarget', 'Fat (g)'],
          ] as [keyof ProfileData, string][]).map(([key, label]) => (
            <div key={key}>
              <label className="mb-1 block text-xs text-text-muted">{label}</label>
              <input type="number" value={(form[key] as number) ?? ''}
                onChange={e => set(key, e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text focus:border-primary focus:outline-none" />
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-warning" />
          <h3 className="text-sm font-semibold uppercase tracking-wide text-text">Health restrictions</h3>
        </div>
        <p className="text-sm text-text-muted">These settings help flag allergens, incompatibilities, and risky foods across the app.</p>

        <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-text-muted">Type</label>
              <select value={restriction.type} onChange={e => setRestriction(p => ({ ...p, type: e.target.value as RestrictionType }))}
                className="w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-sm text-text focus:border-primary focus:outline-none">
                {Object.entries(RESTRICTION_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-text-muted">Name</label>
              <input value={restriction.name} onChange={e => setRestriction(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Peanut, Lactose, Hypertension"
                className="w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-sm text-text placeholder:text-text-faint focus:border-primary focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs text-text-muted">Notes</label>
            <input value={restriction.notes} onChange={e => setRestriction(p => ({ ...p, notes: e.target.value }))}
              placeholder="Optional note or context"
              className="w-full rounded-lg border border-border bg-bg px-3 py-2.5 text-sm text-text placeholder:text-text-faint focus:border-primary focus:outline-none" />
          </div>
          <button onClick={addRestriction}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-[#0f1117] transition-colors hover:bg-primary-hover">
            <Plus size={15} /> Add restriction
          </button>
        </div>

        {restrictions.length === 0 ? (
          <EmptyRestrictions />
        ) : (
          <div className="space-y-2">
            {restrictions.map(item => (
              <div key={item.id} className="flex items-start justify-between rounded-xl border border-border bg-surface px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-text">{item.name}</p>
                  <p className="mt-0.5 text-xs text-text-muted">{RESTRICTION_LABELS[item.type]}{item.notes ? ` · ${item.notes}` : ''}</p>
                </div>
                <button onClick={() => removeRestriction(item.id)} className="text-text-faint transition-colors hover:text-error">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <button onClick={handleSave} disabled={save.isPending}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-[#0f1117] transition-colors hover:bg-primary-hover disabled:opacity-50">
        <CheckCircle2 size={16} />
        {saved ? 'Saved' : save.isPending ? 'Saving…' : 'Save changes'}
      </button>
    </div>
  )
}
