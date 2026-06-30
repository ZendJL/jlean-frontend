'use client'

import { useState } from 'react'
import { profileApi, type ProfileDto, type Sex, type ActivityLevel, type Goal } from '@/lib/api/profile.api'
import Logo from '@/components/ui/Logo'
import { cn } from '@/lib/utils'

const STEPS = ['Body', 'Activity', 'Goal', 'Done']

const activityOptions: { value: ActivityLevel; label: string; desc: string }[] = [
  { value: 'SEDENTARY',        label: 'Sedentary',         desc: 'Little or no exercise' },
  { value: 'LIGHTLY_ACTIVE',   label: 'Lightly active',    desc: '1–3 days/week' },
  { value: 'MODERATELY_ACTIVE',label: 'Moderately active', desc: '3–5 days/week' },
  { value: 'VERY_ACTIVE',      label: 'Very active',       desc: '6–7 days/week' },
  { value: 'EXTRA_ACTIVE',     label: 'Extra active',      desc: 'Physical job or 2×/day' },
]

const goalOptions: { value: Goal; label: string; desc: string; color: string }[] = [
  { value: 'CUT',      label: 'Lose fat',       desc: 'Caloric deficit, preserve muscle', color: 'text-error' },
  { value: 'MAINTAIN', label: 'Maintain',        desc: 'Stay at current weight',           color: 'text-accent' },
  { value: 'BULK',     label: 'Build muscle',    desc: 'Caloric surplus, gain strength',   color: 'text-success' },
]

export default function OnboardingPage() {
  const [step, setStep]           = useState(0)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')

  // Form state
  const [sex, setSex]                     = useState<Sex>('MALE')
  const [birthDate, setBirthDate]         = useState('')
  const [weightKg, setWeightKg]           = useState('')
  const [heightCm, setHeightCm]           = useState('')
  const [activity, setActivity]           = useState<ActivityLevel>('MODERATELY_ACTIVE')
  const [goal, setGoal]                   = useState<Goal>('MAINTAIN')

  async function handleFinish() {
    setLoading(true)
    setError('')
    try {
      await profileApi.update({
        sex,
        birthDate,
        weightKg: parseFloat(weightKg),
        heightCm: parseFloat(heightCm),
        activityLevel: activity,
        goal,
      })
      window.location.href = '/dashboard'
    } catch (err: any) {
      const msg = err?.response?.data?.message
      setError(Array.isArray(msg) ? msg[0] : msg ?? 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-8 space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Logo size={28} />
          <div>
            <h1 className="text-lg font-semibold text-text">Set up your profile</h1>
            <p className="text-text-muted text-xs">Step {step + 1} of {STEPS.length}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex gap-1.5">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-1 flex-1 rounded-full transition-all duration-300',
                i <= step ? 'bg-primary' : 'bg-surface-offset'
              )}
            />
          ))}
        </div>

        {/* Step 0 — Body */}
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-text">Tell us about your body</h2>

            {/* Sex */}
            <div className="space-y-1.5">
              <label className="text-sm text-text-muted">Biological sex</label>
              <div className="flex gap-2">
                {(['MALE', 'FEMALE', 'OTHER'] as Sex[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSex(s)}
                    className={cn(
                      'flex-1 py-2 rounded-lg text-sm border transition-all',
                      sex === s
                        ? 'bg-primary/10 border-primary text-primary font-medium'
                        : 'bg-surface-2 border-border text-text-muted hover:border-text-faint'
                    )}
                  >
                    {s.charAt(0) + s.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Birth date */}
            <div className="space-y-1.5">
              <label className="text-sm text-text-muted">Date of birth</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-sm text-text focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* Weight & Height */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm text-text-muted">Weight (kg)</label>
                <input
                  type="number"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  placeholder="75"
                  min={30} max={300}
                  className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-text-faint focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-text-muted">Height (cm)</label>
                <input
                  type="number"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  placeholder="175"
                  min={100} max={250}
                  className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-text-faint focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 1 — Activity */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-text">How active are you?</h2>
            <div className="space-y-2">
              {activityOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setActivity(opt.value)}
                  className={cn(
                    'w-full flex items-center justify-between px-4 py-3 rounded-lg border text-left transition-all',
                    activity === opt.value
                      ? 'bg-primary/10 border-primary'
                      : 'bg-surface-2 border-border hover:border-text-faint'
                  )}
                >
                  <div>
                    <p className={cn('text-sm font-medium', activity === opt.value ? 'text-primary' : 'text-text')}>
                      {opt.label}
                    </p>
                    <p className="text-text-muted text-xs">{opt.desc}</p>
                  </div>
                  {activity === opt.value && (
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 — Goal */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-text">What's your main goal?</h2>
            <div className="space-y-2">
              {goalOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setGoal(opt.value)}
                  className={cn(
                    'w-full flex items-center justify-between px-4 py-3 rounded-lg border text-left transition-all',
                    goal === opt.value
                      ? 'bg-primary/10 border-primary'
                      : 'bg-surface-2 border-border hover:border-text-faint'
                  )}
                >
                  <div>
                    <p className={cn('text-sm font-medium', goal === opt.value ? 'text-primary' : 'text-text')}>
                      {opt.label}
                    </p>
                    <p className="text-text-muted text-xs">{opt.desc}</p>
                  </div>
                  {goal === opt.value && (
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3 — Done */}
        {step === 3 && (
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <span className="text-3xl">🎯</span>
            </div>
            <div>
              <h2 className="text-base font-semibold text-text">You're all set!</h2>
              <p className="text-text-muted text-sm mt-1">
                We'll calculate your personalized nutrition targets based on your profile.
              </p>
            </div>
            {error && (
              <p className="text-error text-sm bg-error/10 border border-error/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 pt-2">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex-1 py-2.5 rounded-lg border border-border text-text-muted text-sm hover:bg-surface-offset transition-colors"
            >
              Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              disabled={
                step === 0 && (!birthDate || !weightKg || !heightCm)
              }
              className="flex-1 bg-primary text-[#0f1117] font-semibold rounded-lg py-2.5 text-sm hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              disabled={loading}
              className="flex-1 bg-primary text-[#0f1117] font-semibold rounded-lg py-2.5 text-sm hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Saving…' : 'Go to Dashboard'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}