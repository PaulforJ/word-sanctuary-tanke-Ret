import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/AuthContext'
import StageBadge from '../components/StageBadge'
import { formatDate } from '../lib/helpers'

const emptyForm = {
  name: '',
  phone: '',
  email: '',
  first_visit_date: new Date().toISOString().slice(0, 10),
  area: '',
  heard_about_us: '',
  contact_preference: 'whatsapp',
  prayer_request: '',
  interests: '',
}

export default function Members() {
  const { isCoordinator } = useAuth()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  async function loadMembers() {
    setLoading(true)
    const { data } = await supabase.from('members').select('*').order('created_at', { ascending: false })
    setMembers(data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadMembers()
  }, [])

  async function handleAdd(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const { error } = await supabase.from('members').insert([form])
    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    setForm(emptyForm)
    setShowForm(false)
    loadMembers()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-display text-2xl text-[var(--color-primary)]">New members</h1>
        {isCoordinator && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="text-sm font-medium bg-[var(--color-primary)] text-white px-4 py-2 rounded-md hover:bg-[var(--color-primary-light)]"
          >
            {showForm ? 'Cancel' : '+ Add member'}
          </button>
        )}
      </div>
      <p className="text-sm text-[var(--color-ink)]/60 mb-6">
        {members.length} {members.length === 1 ? 'person' : 'people'} tracked.
      </p>

      {showForm && (
        <form
          onSubmit={handleAdd}
          className="bg-[var(--color-surface)] border border-[var(--color-line)] rounded-lg p-5 mb-8 grid sm:grid-cols-2 gap-4 animate-card-rise"
        >
          <Field label="Full name" required value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <Field label="Phone (WhatsApp)" required value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="0803..." />
          <Field label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
          <Field
            label="First visit date"
            type="date"
            value={form.first_visit_date}
            onChange={(v) => setForm({ ...form, first_visit_date: v })}
          />
          <Field label="Area / location" value={form.area} onChange={(v) => setForm({ ...form, area: v })} />
          <Field label="How they heard about us" value={form.heard_about_us} onChange={(v) => setForm({ ...form, heard_about_us: v })} />
          <div className="sm:col-span-2">
            <Field
              label="Prayer request"
              textarea
              value={form.prayer_request}
              onChange={(v) => setForm({ ...form, prayer_request: v })}
            />
          </div>
          <div className="sm:col-span-2">
            <Field
              label="Interests / gifts"
              textarea
              value={form.interests}
              onChange={(v) => setForm({ ...form, interests: v })}
            />
          </div>

          {error && <p className="sm:col-span-2 text-sm text-[var(--color-coral)]">{error}</p>}

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-[var(--color-primary)] text-white text-sm font-medium px-5 py-2.5 rounded-md hover:bg-[var(--color-primary-light)] disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save member'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-[var(--color-ink)]/50">Loading…</p>
      ) : members.length === 0 ? (
        <p className="text-sm text-[var(--color-ink)]/50">
          No one added yet. {isCoordinator ? 'Use "Add member" to start.' : 'Ask a coordinator to add the first member.'}
        </p>
      ) : (
        <div className="bg-[var(--color-surface)] border border-[var(--color-line)] rounded-lg divide-y divide-[var(--color-line)] animate-card-rise">
          {members.map((m) => (
            <Link
              key={m.id}
              to={`/members/${m.id}`}
              className="flex items-center justify-between px-5 py-4 hover:bg-[var(--color-bg)] hover:pl-6 transition-all"
            >
              <div>
                <p className="text-sm font-medium">{m.name}</p>
                <p className="text-xs text-[var(--color-ink)]/50">
                  Visited {formatDate(m.first_visit_date)}{m.area ? ` · ${m.area}` : ''}
                </p>
              </div>
              <StageBadge stage={m.stage} />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', required = false, textarea = false, placeholder }) {
  const props = {
    value,
    required,
    placeholder,
    onChange: (e) => onChange(e.target.value),
    className: 'w-full px-3 py-2 border border-[var(--color-line)] rounded-md text-sm focus:border-[var(--color-primary)] outline-none',
  }
  return (
    <label className="block">
      <span className="block text-xs font-medium text-[var(--color-ink)]/70 mb-1.5">{label}</span>
      {textarea ? <textarea rows={2} {...props} /> : <input type={type} {...props} />}
    </label>
  )
}
