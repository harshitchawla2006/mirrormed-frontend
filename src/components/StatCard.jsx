import { motion } from 'framer-motion'

export default function StatCard({ label, value, sub, icon, color = 'blue', delay = 0 }) {
  const colors = {
    blue:    { bg: 'bg-blue-50',    text: 'text-blue-600',    icon: 'bg-blue-100' },
    green:   { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: 'bg-emerald-100' },
    amber:   { bg: 'bg-amber-50',   text: 'text-amber-600',   icon: 'bg-amber-100' },
    red:     { bg: 'bg-red-50',     text: 'text-red-600',     icon: 'bg-red-100' },
    slate:   { bg: 'bg-slate-50',   text: 'text-slate-600',   icon: 'bg-slate-100' },
  }
  const c = colors[color]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 ${c.icon} rounded-xl flex items-center justify-center text-lg`}>{icon}</div>
      </div>
      <p className="text-2xl font-bold text-slate-900 font-mono">{value}</p>
      <p className="text-sm font-medium text-slate-700 mt-1">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </motion.div>
  )
}