'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api/client'

interface ProfileData {
  birthDate?:    string
  gender?:       string
  heightCm?:     number
  weightKg?:     number
  activityLevel: string
  goal:          string
  calorieTarget?: number
  proteinTarget?: number
  carbTarget?:    number
  fatTarget?:     number
}

const ACTIVITY_OPTIONS = [
  { value: 'SEDENTARY',         label: 'Sedentary (desk job, no exercise)' },
  { value: 'LIGHTLY_ACTIVE',    label: 'Lightly active (1-3 days/week)' },
  { value: 'MODERATELY_ACTIVE', label: 'Moderately active (3-5 days/week)' },
  { value: 'VERY_ACTIVE',       label: 'Very active (6-7 days/week)' },
  { value: 'EXTRA_ACTIVE',      label: 'Extra active (athlete / physical job)' },
]

const GOAL_OPTIONS = [
  { value: 'LOSE',     label: 'Lose weight (cut)' },
  { value: 'MAINTAIN', label: 'Maintain weight' },
  { value: 'GAIN',     label: 'Gain muscle (bulk)' },
]

export default function ProfilePage() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn:  () => api.get<ProfileData>('/profile').then(r => r.data),
  })

  const save = useMutation({
    mutationFn: (form: Partial<ProfileData>) => api.put('/profile', form).then(r => r.data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['profile'] }),
  })

  const [form, setForm] = useState<Partial<ProfileData>>({})
  const [saved, setSaved] = useState(false)

  useEffect(() => { if (data) setForm(data) }, [data])

  const set = (key: keyof ProfileData, val: any) => setForm(p => ({ ...p, [key]: val }))

  const handleSave = async () => {
    await save.mutateAsync(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (isLoading) return <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-surface rounded-xl animate-pulse" />)}</div>

  return (
    <div className="space-y-8 max-w-xl">
      <h2 className="text-2xl font-semibold text-text">Profile</h2>

      {/* Biometrics */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-text uppercase tracking-wide">Biometrics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-text-muted block mb-1">Weight (kg)</label>
            <input type="number" value={form.weightKg ?? ''} onChange={e => set('weightKg', parseFloat(e.target.value))}
              className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-text focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="text-xs text-text-muted block mb-1">Height (cm)</label>
            <input type="number" value={form.heightCm ?? ''} onChange={e => set('heightCm', parseFloat(e.target.value))}
              className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-text focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="text-xs text-text-muted block mb-1">Date of birth</label>
            <input type="date" value={form.birthDate ? form.birthDate.slice(0, 10) : ''}
              onChange={e => set('birthDate', e.target.value)}
              className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-text focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="text-xs text-text-muted block mb-1">Gender</label>
            <select value={form.gender ?? ''} onChange={e => set('gender', e.target.value)}
              className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-text focus:outline-none focus:border-primary">
              <option value="">Select</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>
      </section>

      {/* Goals */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-text uppercase tracking-wide">Goals</h3>
        <div>
          <label className="text-xs text-text-muted block mb-1">Activity level</label>
          <select value={form.activityLevel ?? 'SEDENTARY'} onChange={e => set('activityLevel', e.target.value)}
            className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-text focus:outline-none focus:border-primary">
            {ACTIVITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-text-muted block mb-1">Goal</label>
          <select value={form.goal ?? 'MAINTAIN'} onChange={e => set('goal', e.target.value)}
            className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-text focus:outline-none focus:border-primary">
            {GOAL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </section>

      {/* Manual targets */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-text uppercase tracking-wide">Manual targets <span className="text-text-faint font-normal normal-case">— override auto</span></h3>
        <div className="grid grid-cols-2 gap-4">
          {([
            ['calorieTarget', 'Calories (kcal)'],
            ['proteinTarget', 'Protein (g)'],
            ['carbTarget',    'Carbs (g)'],
            ['fatTarget',     'Fat (g)'],
          ] as [keyof ProfileData, string][]).map(([key, label]) => (
            <div key={key}>
              <label className="text-xs text-text-muted block mb-1">{label}</label>
              <input type="number" value={(form[key] as number) ?? ''}
                onChange={e => set(key, e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-text focus:outline-none focus:border-primary" />
            </div>
          ))}
        </div>
      </section>

      <button
        onClick={handleSave}
        disabled={save.isPending}
        className="bg-primary text-[#0f1117] font-semibold rounded-lg px-6 py-2.5 text-sm hover:bg-primary-hover disabled:opacity-50 transition-colors"
      >
        {saved ? '✓ Saved' : save.isPending ? 'Saving…' : 'Save changes'}
      </button>
    </div>
  )
}
