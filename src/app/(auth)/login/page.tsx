export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="w-full max-w-sm bg-surface border border-border rounded-2xl p-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-text">Sign in to JLean</h1>
          <p className="text-text-muted text-sm">Track your nutrition and reach your goals.</p>
        </div>

        <form className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm text-text-muted">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-text-faint focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm text-text-muted">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2.5 text-sm text-text placeholder:text-text-faint focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-[#0f1117] font-semibold rounded-lg py-2.5 text-sm hover:bg-primary-hover transition-colors"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  )
}