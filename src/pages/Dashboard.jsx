import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/AuthContext'
import StageBadge from '../components/StageBadge'
import { formatDate, STEP_LABELS } from '../lib/helpers'

function StatCard({ label, value, accent, delay }) {
  return (
    <div
      className="bg-[var(--color-surface)] border border-[var(--color-line)] rounded-lg p-5 animate-card-rise"
      style={{ borderLeft: `3px solid ${accent || 'var(--color-line)'}`, animationDelay: `${delay}ms` }}
    >
      <p className="text-xs font-medium text-[var(--color-ink)]/50 mb-2">{label}</p>
      <p className="font-display text-3xl" style={accent ? { color: accent } : undefined}>
        {value}
      </p>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [members, setMembers] = useState([])
  const [steps, setSteps] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: m }, { data: s }] = await Promise.all([
        supabase.from('members').select('*').order('created_at', { ascending: false }),
        supabase.from('journey_steps').select('*'),
      ])
      setMembers(m || [])
      setSteps(s || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <p className="text-sm text-[var(--color-ink)]/50">Loading…</p>

  const now = new Date()
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(now.getDate() - 30)

  const newThisMonth = members.filter((m) => new Date(m.first_visit_date) >= thirtyDaysAgo)

  const overdueSteps = steps.filter(
    (s) => s.status === 'pending' && new Date(s.due_date) < now
  )
  const overdueByMember = {}
  overdueSteps.forEach((s) => {
    overdueByMember[s.member_id] = overdueByMember[s.member_id] || []
    overdueByMember[s.member_id].push(s)
  })

  const notYetContacted = members.filter((m) =>
    overdueSteps.some((s) => s.member_id === m.id && s.step_name === 'day0')
  )

  const atRisk = members.filter((m) => {
    if (m.stage === 'dropped' || m.stage === 'engaged') return false
    const memberOverdue = overdueByMember[m.id] || []
    return (
      m.stage === 'at_risk' ||
      memberOverdue.some((s) => {
        const daysLate = Math.floor((now - new Date(s.due_date)) / 86400000)
        return daysLate > 3
      })
    )
  })

  const firstName = (user?.email || '').split('@')[0]

  return (
    <div>
      {/* Hero banner — church crest on a solid brand background, gentle
          continuous breathing motion (a full photo-zoom doesn't suit a
          white-background logo, so it gets its own subtle treatment) */}
      <div className="relative -mx-5 -mt-5 md:-mx-10 md:-mt-10 mb-8 overflow-hidden rounded-b-2xl md:rounded-2xl bg-[var(--color-primary)]">
        <div className="relative h-40 md:h-52 flex items-center px-6 md:px-10 gap-5">
          <img
            src="/church-logo.jpg"
            alt="Word Sanctuary Global"
            className="h-24 md:h-32 w-auto object-contain mix-blend-multiply animate-breathe shrink-0"
          />
          <div>
            <p className="text-[11px] tracking-wide text-[#E7DFC8]/70 mb-1">Word Sanctuary Global · Tanke</p>
            <h1 className="font-display text-2xl md:text-3xl text-white">Welcome back{firstName ? `, ${firstName}` : ''}</h1>
            <p className="text-sm text-white/75 mt-1">Here's how new members are settling in.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        <StatCard label="New in last 30 days" value={newThisMonth.length} delay={0} />
        <StatCard label="Not yet contacted" value={notYetContacted.length} accent="#B4863B" delay={90} />
        <StatCard label="At risk of dropping off" value={atRisk.length} accent="#C15A42" delay={180} />
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <section>
          <h2 className="font-display text-lg mb-3">Needs a first welcome</h2>
          {notYetContacted.length === 0 ? (
            <p className="text-sm text-[var(--color-ink)]/50">Everyone has been welcomed. Nothing pending here.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {notYetContacted.map((m) => (
                <li key={m.id}>
                  <Link
                    to={`/members/${m.id}`}
                    className="hover-lift flex items-center justify-between bg-[var(--color-surface)] border border-[var(--color-line)] rounded-lg px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{m.name}</p>
                      <p className="text-xs text-[var(--color-ink)]/50">
                        Visited {formatDate(m.first_visit_date)}
                      </p>
                    </div>
                    <StageBadge stage={m.stage} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="font-display text-lg mb-3">At risk of dropping off</h2>
          {atRisk.length === 0 ? (
            <p className="text-sm text-[var(--color-ink)]/50">No one is currently flagged as at risk.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {atRisk.map((m) => {
                const overdue = overdueByMember[m.id] || []
                return (
                  <li key={m.id}>
                    <Link
                      to={`/members/${m.id}`}
                      className="hover-lift flex items-center justify-between bg-[var(--color-surface)] border border-[var(--color-coral)]/30 rounded-lg px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-medium">{m.name}</p>
                        <p className="text-xs text-[var(--color-coral)]">
                          {overdue.length > 0
                            ? `${STEP_LABELS[overdue[0].step_name]} overdue`
                            : 'Flagged as at risk'}
                        </p>
                      </div>
                      <StageBadge stage={m.stage} />
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
