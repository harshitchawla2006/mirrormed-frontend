import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from 'recharts'
import Navbar from '../components/Navbar'
import StatCard from '../components/StatCard'
import RiskBadge from '../components/RiskBadge'
import { getHistory, clearHistory } from '../store/predictionStore'
import { getMetrics } from '../api/client'

const CLASS_FULL = {
  mel: 'Melanoma', nv: 'Melanocytic Nevi', bcc: 'Basal Cell Carcinoma',
  akiec: 'Actinic Keratosis', bkl: 'Benign Keratosis', df: 'Dermatofibroma', vasc: 'Vascular Lesion',
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899']

// dummy data fallback when no predictions yet
const DUMMY = {
  history: [
    { id: 1, class: 'mel',   className: 'Melanoma',         confidence: 0.87, uncertainty: 0.003, risk: 'high',   fileName: 'sample_01.jpg', timestamp: new Date(Date.now() - 3600000).toISOString() },
    { id: 2, class: 'nv',    className: 'Melanocytic Nevi',  confidence: 0.94, uncertainty: 0.0001, risk: 'low',  fileName: 'sample_02.jpg', timestamp: new Date(Date.now() - 7200000).toISOString() },
    { id: 3, class: 'bcc',   className: 'Basal Cell Carcinoma', confidence: 0.72, uncertainty: 0.006, risk: 'high', fileName: 'sample_03.jpg', timestamp: new Date(Date.now() - 10800000).toISOString() },
    { id: 4, class: 'akiec', className: 'Actinic Keratosis', confidence: 0.68, uncertainty: 0.004, risk: 'medium', fileName: 'sample_04.jpg', timestamp: new Date(Date.now() - 14400000).toISOString() },
    { id: 5, class: 'bkl',   className: 'Benign Keratosis',  confidence: 0.91, uncertainty: 0.0002, risk: 'low',  fileName: 'sample_05.jpg', timestamp: new Date(Date.now() - 18000000).toISOString() },
  ],
}

export default function Dashboard() {
  const [history, setHistory]   = useState([])
  const [metrics, setMetrics]   = useState(null)
  const [useDummy, setUseDummy] = useState(false)

  useEffect(() => {
    // load local history
    const local = getHistory()
    if (local.length > 0) {
      setHistory(local)
    } else {
      setHistory(DUMMY.history)
      setUseDummy(true)
    }

    // try to get API metrics
    getMetrics().then(setMetrics).catch(() => {})
  }, [])

  const data = history.length > 0 ? history : DUMMY.history

  const totalPreds  = data.length
  const avgConf     = data.reduce((s, r) => s + r.confidence, 0) / (totalPreds || 1)
  const avgUnc      = data.reduce((s, r) => s + r.uncertainty, 0) / (totalPreds || 1)
  const highRisk    = data.filter(r => r.risk === 'high').length

  // chart data
  const classCounts = data.reduce((acc, r) => {
    acc[r.class] = (acc[r.class] || 0) + 1
    return acc
  }, {})

  const barData = Object.entries(classCounts).map(([cls, count]) => ({
    name: CLASS_FULL[cls] || cls,
    count,
    short: cls.toUpperCase(),
  }))

  const pieData = barData.map((d, i) => ({ ...d, fill: COLORS[i % COLORS.length] }))

  const confBuckets = [
    { range: '90-100%', count: data.filter(r => r.confidence >= 0.9).length },
    { range: '80-90%',  count: data.filter(r => r.confidence >= 0.8 && r.confidence < 0.9).length },
    { range: '70-80%',  count: data.filter(r => r.confidence >= 0.7 && r.confidence < 0.8).length },
    { range: '<70%',    count: data.filter(r => r.confidence < 0.7).length },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 pt-24 pb-16">

        {/* header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-3 uppercase tracking-widest">
            <span>MirrorMed</span><span>/</span><span className="text-blue-600">Dashboard</span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Analytics Dashboard</h1>
              <p className="text-slate-500 text-sm mt-1.5">Prediction history and model performance metrics</p>
            </div>
            <div className="flex items-center gap-3">
              {useDummy && (
                <span className="text-xs font-mono text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
                  Showing demo data
                </span>
              )}
              <button
                onClick={() => { clearHistory(); setHistory(DUMMY.history); setUseDummy(true) }}
                className="text-xs text-slate-500 hover:text-red-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg transition-colors"
              >
                Clear History
              </button>
            </div>
          </div>
        </div>

        {/* stat cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Predictions" value={metrics?.total_predictions || totalPreds} icon="📊" color="blue"  sub="All time" delay={0} />
          <StatCard label="Avg Confidence"    value={`${Math.round(avgConf * 100)}%`}          icon="🎯" color="green" sub="Across all cases" delay={0.08} />
          <StatCard label="High Risk Cases"   value={highRisk}                                  icon="⚠️" color="red"   sub="Require urgent review" delay={0.16} />
          <StatCard label="Avg Uncertainty"   value={avgUnc.toFixed(4)}                         icon="📉" color="amber" sub="MC Dropout variance" delay={0.24} />
        </div>

        {/* charts row */}
        <div className="grid grid-cols-2 gap-5 mb-8">

          {/* disease frequency */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-1">Disease Frequency</h3>
            <p className="text-xs text-slate-400 mb-5">Prediction count by lesion class</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} margin={{ top: 4, right: 8, left: -20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="short" tick={{ fontSize: 10, fontFamily: 'monospace', fill: '#94a3b8' }} angle={-35} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, fontSize: 12, fontFamily: 'monospace' }}
                  formatter={(v, n, p) => [v, p.payload.name]}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {barData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* confidence distribution */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-1">Confidence Distribution</h3>
            <p className="text-xs text-slate-400 mb-5">Predictions bucketed by confidence range</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={confBuckets} margin={{ top: 4, right: 8, left: -20, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="range" tick={{ fontSize: 11, fontFamily: 'monospace', fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]}>
                  {confBuckets.map((d, i) => (
                    <Cell key={i} fill={d.range === '90-100%' ? '#10b981' : d.range === '80-90%' ? '#3b82f6' : d.range === '70-80%' ? '#f59e0b' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

        </div>

        {/* disease pie + history table */}
        <div className="grid grid-cols-3 gap-5">

          {/* pie chart */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36 }}
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-1">Class Distribution</h3>
            <p className="text-xs text-slate-400 mb-4">Proportion of each lesion type</p>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={72} paddingAngle={3} dataKey="count">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, fontSize: 11 }}
                  formatter={(v, n, p) => [v, p.payload.name]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {pieData.map(({ name, count, fill, short }) => (
                <div key={short} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: fill }} />
                    <span className="text-slate-600 truncate max-w-[120px]">{name}</span>
                  </div>
                  <span className="font-mono text-slate-400">{count}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* history table */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.44 }}
            className="col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-1">Recent Predictions</h3>
            <p className="text-xs text-slate-400 mb-4">Last {data.length} analyses</p>

            <div className="overflow-hidden">
              {/* table header */}
              <div className="grid grid-cols-12 gap-2 text-[10px] font-mono text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-100">
                <span className="col-span-4">Diagnosis</span>
                <span className="col-span-2 text-center">Confidence</span>
                <span className="col-span-2 text-center">Uncertainty</span>
                <span className="col-span-2 text-center">Risk</span>
                <span className="col-span-2 text-right">Time</span>
              </div>

              <div className="space-y-1 mt-2">
                {data.map((rec, i) => (
                  <motion.div key={rec.id || i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.04 }}
                    className="grid grid-cols-12 gap-2 py-2.5 px-1 rounded-lg hover:bg-slate-50 transition-colors items-center text-xs"
                  >
                    <div className="col-span-4">
                      <p className="font-medium text-slate-800 truncate">{rec.className || CLASS_FULL[rec.class]}</p>
                      <p className="text-slate-400 font-mono text-[10px] truncate">{rec.fileName || '—'}</p>
                    </div>
                    <div className="col-span-2 text-center">
                      <span className={`font-mono font-semibold ${
                        rec.confidence >= 0.8 ? 'text-emerald-600' : rec.confidence >= 0.6 ? 'text-amber-600' : 'text-red-600'
                      }`}>{Math.round(rec.confidence * 100)}%</span>
                    </div>
                    <div className="col-span-2 text-center font-mono text-slate-500 text-[11px]">
                      {rec.uncertainty?.toFixed(4)}
                    </div>
                    <div className="col-span-2 flex justify-center">
                      <RiskBadge risk={rec.risk || 'low'} size="sm" />
                    </div>
                    <div className="col-span-2 text-right text-slate-400 font-mono text-[10px]">
                      {rec.timestamp ? new Date(rec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* footer */}
        <div className="mt-12 pt-5 border-t border-slate-200 flex justify-between text-xs font-mono text-slate-300">
          <span>MIRRORMED CLINICAL AI · RESEARCH USE ONLY</span>
          <span>EfficientNet-B3 · HAM10000 · MC Dropout · v1.0.0</span>
        </div>
      </main>
    </div>
  )
}