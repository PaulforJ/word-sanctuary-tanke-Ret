export const STAGE_LABELS = {
  new: 'New',
  contacted: 'Contacted',
  engaged: 'Engaged',
  at_risk: 'At risk',
  dropped: 'Dropped off',
}

export const STAGE_COLORS = {
  new: '#B4863B',
  contacted: '#2E5652',
  engaged: '#1F3D3B',
  at_risk: '#C15A42',
  dropped: '#8A8578',
}

export const STEP_LABELS = {
  day0: 'Day 0 — Welcome',
  day7: 'Day 7 — Check-in',
  day30: 'Day 30 — Invite to get involved',
}

export function daysSince(dateStr) {
  const d = new Date(dateStr)
  const now = new Date()
  return Math.floor((now - d) / (1000 * 60 * 60 * 24))
}

export function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// Default WhatsApp message copy per journey step. Edit freely —
// this is just a starting point for the click-to-chat button.
export function defaultMessage(stepName, memberName) {
  const firstName = (memberName || '').split(' ')[0]
  switch (stepName) {
    case 'day0':
      return `Hi ${firstName}! It was so good having you with us today. We're really glad you came, and we'd love to see you again soon 🙏`
    case 'day7':
      return `Hi ${firstName}, just checking in — how have you been since your visit? We'd love to have you join us again this week.`
    case 'day30':
      return `Hi ${firstName}, hope you've been doing well! We'd love to help you get more connected — is there a class or small group you'd be interested in joining?`
    default:
      return `Hi ${firstName}, hope you're doing well!`
  }
}

export function whatsappLink(phone, message) {
  if (!phone) return null
  const digits = phone.replace(/[^\d+]/g, '').replace(/^0/, '234') // rough Nigeria default
  const cleanDigits = digits.replace(/\+/g, '')
  return `https://wa.me/${cleanDigits}?text=${encodeURIComponent(message)}`
}
