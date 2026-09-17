import { STAGE_LABELS, STAGE_COLORS } from '../lib/helpers'

export default function StageBadge({ stage }) {
  const color = STAGE_COLORS[stage] || '#999'
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ backgroundColor: `${color}1A`, color }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      {STAGE_LABELS[stage] || stage}
    </span>
  )
}
