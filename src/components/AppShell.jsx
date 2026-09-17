import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/members', label: 'New members' },
  { to: '/tasks', label: 'Follow-up tasks' },
]

export default function AppShell() {
  const { signOut, isCoordinator } = useAuth()

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="md:w-60 shrink-0 border-b md:border-b-0 md:border-r border-[var(--color-line)] bg-[var(--color-surface)] flex md:flex-col justify-between">
        <div className="p-5 md:p-6">
          <h1 className="font-display text-lg leading-tight text-[var(--color-primary)]">
            New Member<br />Care
          </h1>
          <nav className="mt-8 hidden md:flex flex-col gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'text-[var(--color-ink)]/70 hover:bg-[var(--color-bg)]'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="p-5 md:p-6 flex md:flex-col items-center md:items-stretch gap-3 md:gap-2">
          <span className="text-xs text-[var(--color-ink)]/50 hidden md:block">
            {isCoordinator ? 'Coordinator access' : 'Volunteer access'}
          </span>
          <button
            onClick={signOut}
            className="text-sm text-[var(--color-ink)]/60 hover:text-[var(--color-coral)] underline underline-offset-2"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* mobile nav */}
      <nav className="md:hidden flex border-b border-[var(--color-line)] bg-[var(--color-surface)] overflow-x-auto">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) =>
              `px-4 py-3 text-sm font-medium whitespace-nowrap ${
                isActive ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]' : 'text-[var(--color-ink)]/60'
              }`
            }
          >
            {l.label}
          </NavLink>
        ))}
      </nav>

      <main className="flex-1 p-5 md:p-10 max-w-5xl">
        <Outlet />
      </main>
    </div>
  )
}
