import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [members, setMembers] = useState({})
  const [loading, setLoading] = useState(true)
  const [showDone, setShowDone] = useState(false)

  async function load() {
    setLoading(true)
    const [{ data: t }, { data: m }] = await Promise.all([
      supabase.from('tasks').select('*').order('due_date', { ascending: true }),
      supabase.from('members').select('id, name'),
    ])
    setTasks(t || [])
    const map = {}
    ;(m || []).forEach((mem) => (map[mem.id] = mem.name))
    setMembers(map)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function toggleTask(task) {
    await supabase.from('tasks').update({ completed: !task.completed }).eq('id', task.id)
    load()
  }

  const visible = tasks.filter((t) => showDone || !t.completed)

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-display text-2xl text-[var(--color-primary)]">Follow-up tasks</h1>
        <label className="text-xs text-[var(--color-ink)]/60 flex items-center gap-2">
          <input type="checkbox" checked={showDone} onChange={(e) => setShowDone(e.target.checked)} className="accent-[var(--color-primary)]" />
          Show completed
        </label>
      </div>
      <p className="text-sm text-[var(--color-ink)]/60 mb-6">Everything the team needs to do, across all new members.</p>

      {loading ? (
        <p className="text-sm text-[var(--color-ink)]/50">Loading…</p>
      ) : visible.length === 0 ? (
        <p className="text-sm text-[var(--color-ink)]/50">Nothing outstanding. Good work.</p>
      ) : (
        <ul className="bg-[var(--color-surface)] border border-[var(--color-line)] rounded-lg divide-y divide-[var(--color-line)] animate-card-rise">
          {visible.map((t) => (
            <li key={t.id} className="flex items-start gap-3 px-5 py-4 transition-colors hover:bg-[var(--color-bg)]">
              <input
                type="checkbox"
                checked={t.completed}
                onChange={() => toggleTask(t)}
                className="mt-1 accent-[var(--color-primary)]"
              />
              <div className="flex-1">
                <p className={`text-sm ${t.completed ? 'line-through text-[var(--color-ink)]/40' : ''}`}>
                  {t.description}
                </p>
                <p className="text-xs text-[var(--color-ink)]/50">
                  <Link to={`/members/${t.member_id}`} className="hover:text-[var(--color-primary)] underline underline-offset-2">
                    {members[t.member_id] || 'Member'}
                  </Link>
                  {t.assigned_to ? ` · assigned to ${t.assigned_to}` : ''}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
