// Color coded risk badge based on confidence + uncertainty
export default function RiskBadge({ risk, size = 'md' }) {
  const config = {
    high:   { label: 'High Risk',     bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-700',    dot: 'bg-red-500' },
    medium: { label: 'Moderate Risk', bg: 'bg-amber-50',  border: 'border-amber-200',  text: 'text-amber-700',  dot: 'bg-amber-500' },
    low:    { label: 'Low Risk',      bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  }
  const c = config[risk] || config.medium
  const sz = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-3 py-1'

  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full border uppercase tracking-wide ${c.bg} ${c.border} ${c.text} ${sz}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  )
}