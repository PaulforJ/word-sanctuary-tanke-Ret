import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/AuthContext'
import StageBadge from '../components/StageBadge'
import JourneyStep from '../components/JourneyStep'
import { formatDate, STAGE_LABELS } from '../lib/helpers'

export default function MemberProfile() {
  const { id } = useParams()
  const { isCoordinator } = useAuth()
  const [member, setMember] = useState(null)
  const [steps, setSteps] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [newTask, setNewTask] = useState('')
  const [newTaskOwner, setNewTaskOwner] = useState('')

  async function loadAll() {
    setLoading(true)
    const [{ data: m }, { data: s }, { data: t }] = await Promise.all([
      supabase.from('members').select('*').eq('id', id).single(),
      supabase.from('journey_steps').select('*').eq('member_id', id).order('due_date'),
      supabase.from('tasks').select('*').eq('member_id', id).order('created_at', { ascending: false }),
    ])
    setMember(m)
    setSteps(s || [])
    setTasks(t || [])
    setLoading(false)
  }

  useEffect(() => {
    loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function toggleStep(step) {
    const nextStatus = step.status === 'done' ? 'pending' : 'done'
    await supabase
      .from('journey_steps')
      .update({ status: nextStatus, completed_at: nextStatus === 'done' ? new Date().toISOString() : null })
      .eq('id', step.id)
    loadAll()
  }

  async function toggleTask(task) {
    await supabase.from('tasks').update({ completed: !task.completed }).eq('id', task.id)
    loadAll()
  }

  async function addTask(e) {
    e.preventDefault()
    if (!newTask.trim()) return
    await supabase.from('tasks').insert([
      { member_id: id, description: newTask.trim(), assigned_to: newTaskOwner.trim() || null },
    ])
    setNewTask('')
    setNewTaskOwner('')
    loadAll()
  }

  async function updateStage(stage) {
    await supabase.from('members').update({ stage }).eq('id', id)
    loadAll()
  }

  if (loading) return <p className="text-sm text-[var(--color-ink)]/50">Loading…</p>
  if (!member) return <p className="text-sm text-[var(--color-ink)]/50">Member not found.</p>

  return (
    <div>
      <Link to="/members" className="text-xs text-[var(--color-ink)]/50 hover:text-[var(--color-primary)]">
        ← Back to members
      </Link>

      <div className="flex items-start justify-between mt-3 mb-8 gap-4">
        <div>
          <h1 className="font-display text-2xl text-[var(--color-primary)]">{member.name}</h1>
          <p className="text-sm text-[var(--color-ink)]/60 mt-1">
            Visited {formatDate(member.first_visit_date)}
            {member.area ? ` · ${member.area}` : ''}
          </p>
        </div>
        <StageBadge stage={member.stage} />
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 flex flex-col gap-8">
          <section>
            <h2 className="font-display text-lg mb-2">Welcome journey</h2>
            <div className="bg-[var(--color-surface)] border border-[var(--color-line)] rounded-lg px-5 animate-card-rise">
              {steps.map((s) => (
                <JourneyStep key={s.id} step={s} member={member} onToggle={toggleStep} />
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-display text-lg mb-2">Follow-up tasks</h2>
            <div className="bg-[var(--color-surface)] border border-[var(--color-line)] rounded-lg p-5 animate-card-rise" style={{ animationDelay: '80ms' }}>
              {tasks.length === 0 && <p className="text-sm text-[var(--color-ink)]/50 mb-4">No tasks yet.</p>}
              <ul className="flex flex-col gap-2 mb-4">
                {tasks.map((t) => (
                  <li key={t.id} className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={t.completed}
                      onChange={() => toggleTask(t)}
                      className="mt-1 accent-[var(--color-primary)]"
                    />
                    <div>
                      <p className={`text-sm ${t.completed ? 'line-through text-[var(--color-ink)]/40' : ''}`}>
                        {t.description}
                      </p>
                      {t.assigned_to && (
                        <p className="text-xs text-[var(--color-ink)]/50">Assigned to {t.assigned_to}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
              <form onSubmit={addTask} className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-[var(--color-line)]">
                <input
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder="New task, e.g. Call to invite to Sunday class"
                  className="flex-1 px-3 py-2 border border-[var(--color-line)] rounded-md text-sm outline-none focus:border-[var(--color-primary)]"
                />
                <input
                  value={newTaskOwner}
                  onChange={(e) => setNewTaskOwner(e.target.value)}
                  placeholder="Assign to (optional)"
                  className="sm:w-40 px-3 py-2 border border-[var(--color-line)] rounded-md text-sm outline-none focus:border-[var(--color-primary)]"
                />
                <button
                  type="submit"
                  className="bg-[var(--color-primary)] text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-[var(--color-primary-light)]"
                >
                  Add
                </button>
              </form>
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-6">
          <section>
            <h2 className="font-display text-lg mb-2">Stage</h2>
            <div className="bg-[var(--color-surface)] border border-[var(--color-line)] rounded-lg p-4 animate-card-rise">
              <select
                value={member.stage}
                onChange={(e) => updateStage(e.target.value)}
                disabled={!isCoordinator}
                className="w-full px-3 py-2 border border-[var(--color-line)] rounded-md text-sm outline-none focus:border-[var(--color-primary)] disabled:opacity-60"
              >
                {Object.entries(STAGE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              {!isCoordinator && (
                <p className="text-xs text-[var(--color-ink)]/50 mt-2">Only coordinators can change stage.</p>
              )}
            </div>
          </section>

          <section>
            <h2 className="font-display text-lg mb-2">Details</h2>
            <div className="bg-[var(--color-surface)] border border-[var(--color-line)] rounded-lg p-4 flex flex-col gap-3 text-sm animate-card-rise" style={{ animationDelay: '80ms' }}>
              <Detail label="Phone" value={member.phone} />
              <Detail label="Email" value={member.email} />
              <Detail label="Contact preference" value={member.contact_preference} />
              <Detail label="Heard about us via" value={member.heard_about_us} />
              <Detail label="Prayer request" value={member.prayer_request} />
              <Detail label="Interests" value={member.interests} />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

function Detail({ label, value }) {
  if (!value) return null
  return (
    <div>
      <p className="text-xs text-[var(--color-ink)]/50">{label}</p>
      <p>{value}</p>
    </div>
  )
}
