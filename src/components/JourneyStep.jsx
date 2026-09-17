import { STEP_LABELS, formatDate, defaultMessage, whatsappLink } from '../lib/helpers'

export default function JourneyStep({ step, member, onToggle }) {
  const isDone = step.status === 'done'
  const link = whatsappLink(member.phone, defaultMessage(step.step_name, member.name))
  const isOverdue = !isDone && new Date(step.due_date) < new Date().setHours(0, 0, 0, 0)

  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-[var(--color-line)] last:border-0">
      <div className="flex items-center gap-3">
        <button
          onClick={() => onToggle(step)}
          aria-label={isDone ? 'Mark as not done' : 'Mark as done'}
          className={`w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${
            isDone
              ? 'bg-[var(--color-primary)] border-[var(--color-primary)]'
              : 'border-[var(--color-ink)]/30'
          }`}
        >
          {isDone && (
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
        <div>
          <p className={`text-sm font-medium ${isDone ? 'text-[var(--color-ink)]/50 line-through' : ''}`}>
            {STEP_LABELS[step.step_name]}
          </p>
          <p className={`text-xs ${isOverdue ? 'text-[var(--color-coral)]' : 'text-[var(--color-ink)]/50'}`}>
            Due {formatDate(step.due_date)}{isOverdue ? ' · overdue' : ''}
          </p>
        </div>
      </div>
      {!isDone && link && (
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-medium px-3 py-1.5 rounded-md bg-[#25D366]/10 text-[#1a9c4d] hover:bg-[#25D366]/20 whitespace-nowrap"
        >
          Send on WhatsApp
        </a>
      )}
    </div>
  )
}
