export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-text">Good morning 👋</h2>
        <p className="text-text-muted mt-1">Here's your nutrition summary for today.</p>
      </div>

      {/* Placeholder cards */}
      <div className="grid grid-cols-4 gap-4">
        {['Calories', 'Protein', 'Carbs', 'Fat'].map((macro) => (
          <div key={macro} className="bg-surface rounded-xl p-4 border border-border">
            <p className="text-text-muted text-sm">{macro}</p>
            <p className="text-2xl font-semibold text-text mt-1">—</p>
            <p className="text-text-faint text-xs mt-1">/ — goal</p>
          </div>
        ))}
      </div>
    </div>
  )
}