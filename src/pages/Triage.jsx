import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { predictImage, checkHealth } from '../api/client'
import { addPrediction } from '../store/predictionStore'
import Navbar from '../components/Navbar'
import RiskBadge from '../components/RiskBadge'
import ConfidenceBar from '../components/ConfidenceBar'

const CLASS_INFO = {
  mel:   { name: 'Melanoma',             risk: 'high',   icd: 'C43', advice: 'Immediate dermatologist referral required. Melanoma is the most dangerous skin cancer — early detection is critical.' },
  nv:    { name: 'Melanocytic Nevi',     risk: 'low',    icd: 'D22', advice: 'Common benign mole. Monitor for ABCDE changes: Asymmetry, Border irregularity, Colour variation, Diameter >6mm, Evolution.' },
  bcc:   { name: 'Basal Cell Carcinoma', risk: 'high',   icd: 'C44', advice: 'Most prevalent skin cancer. Locally invasive but rarely metastatic. Dermatology referral within 2 weeks recommended.' },
  akiec: { name: 'Actinic Keratosis',    risk: 'medium', icd: 'L57', advice: 'UV-induced precancerous lesion. Cryotherapy or topical agents typically effective. Review within 4–6 weeks.' },
  bkl:   { name: 'Benign Keratosis',     risk: 'low',    icd: 'L82', advice: 'Non-cancerous keratosis. No urgent treatment required. Annual dermatological review is advisable.' },
  df:    { name: 'Dermatofibroma',       risk: 'low',    icd: 'D23', advice: 'Benign fibrohistiocytic nodule. No treatment required unless symptomatic or cosmetically bothersome.' },
  vasc:  { name: 'Vascular Lesion',      risk: 'medium', icd: 'I78', advice: 'Cutaneous vascular abnormality. Evaluation recommended to exclude underlying systemic pathology.' },
}

const getRisk = (confidence, uncertainty) => {
  if (uncertainty > 0.005 || confidence < 0.6) return 'high'
  if (uncertainty > 0.001 || confidence < 0.8) return 'medium'
  return 'low'
}

export default function Triage() {
  const [apiOnline, setApiOnline] = useState(false)
  const [file, setFile]           = useState(null)
  const [preview, setPreview]     = useState(null)
  const [result, setResult]       = useState(null)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState(null)
  const [dragging, setDragging]   = useState(false)
  const inputRef = useRef()

  useEffect(() => {
    checkHealth().then(() => setApiOnline(true)).catch(() => setApiOnline(false))
  }, [])

  const handleFile = (f) => {
    if (!f || !['image/jpeg', 'image/png', 'image/jpg'].includes(f.type)) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setResult(null)
    setError(null)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  const analyse = async () => {
    if (!file || loading) return
    setLoading(true)
    setError(null)
    try {
      const data = await predictImage(file)
      setResult(data)
      // save to local history
      addPrediction({
        class: data.class,
        className: CLASS_INFO[data.class]?.name || data.class,
        confidence: data.confidence,
        uncertainty: data.uncertainty,
        risk: getRisk(data.confidence, data.uncertainty),
        fileName: file.name,
        preview: preview,
      })
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to connect. Please wake the backend first.')
    } finally {
      setLoading(false)
    }
  }

  const info = result ? CLASS_INFO[result.class] : null
  const computedRisk = result ? getRisk(result.confidence, result.uncertainty) : null
  const uncLevel = !result ? null : result.uncertainty < 0.001 ? 'low' : result.uncertainty < 0.005 ? 'medium' : 'high'

  const uncConfig = {
    low:    { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', msg: 'Low — model is highly confident in this prediction' },
    medium: { color: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-200',   msg: 'Medium — clinical verification is advised' },
    high:   { color: 'text-red-600',     bg: 'bg-red-50',     border: 'border-red-200',     msg: 'High — specialist review strongly recommended' },
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 pt-24 pb-16">

        {/* header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-3 uppercase tracking-widest">
            <span>MirrorMed</span><span>/</span><span className="text-blue-600">Triage</span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Triage Console</h1>
              <p className="text-slate-500 text-sm mt-1.5">Upload a dermoscopy image for AI-assisted classification</p>
            </div>
            <div className={`flex items-center gap-2 text-xs font-mono font-medium px-3 py-1.5 rounded-full border ${
              apiOnline
                ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                : 'text-red-700 bg-red-50 border-red-200'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${apiOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
              API {apiOnline ? 'Online' : 'Offline'}
            </div>
          </div>
        </div>

        {/* disclaimer */}
        <div className="mb-6 bg-amber-50 border border-amber-200 border-l-4 border-l-amber-500 rounded-xl px-4 py-3 flex gap-3 text-sm text-amber-800">
          <span className="flex-shrink-0">⚠️</span>
          <span><strong>Research Use Only.</strong> Not approved for clinical diagnosis. All results require review by a qualified dermatologist.</span>
        </div>

        <div className="grid grid-cols-5 gap-6">

          {/* left — upload */}
          <div className="col-span-2 space-y-4">

            {/* drop zone */}
            <div
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`relative rounded-2xl border-2 border-dashed cursor-pointer overflow-hidden transition-all duration-200 ${
                dragging ? 'border-blue-400 bg-blue-50' : preview ? 'border-slate-200 bg-white' : 'border-slate-300 bg-white hover:border-blue-300 hover:bg-blue-50/30'
              }`}
            >
              <AnimatePresence mode="wait">
                {preview ? (
                  <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <img src={preview} alt="preview" className="w-full object-cover max-h-64" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <span className="text-xs text-white/80 font-mono truncate max-w-[70%]">{file?.name}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); setResult(null) }}
                        className="text-xs text-white bg-black/40 hover:bg-red-500/80 px-2.5 py-1 rounded-lg transition-colors"
                      >✕ Clear</button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="py-14 text-center px-6">
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">📁</div>
                    <p className="text-sm font-medium text-slate-600">Drop dermoscopy image here</p>
                    <p className="text-xs text-slate-400 mt-1.5">or click to browse · JPG, PNG · Max 10MB</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <input ref={inputRef} type="file" accept="image/jpeg,image/png" className="hidden"
              onChange={(e) => handleFile(e.target.files[0])} />

            {/* analyse button */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={analyse}
              disabled={!file || loading}
              className={`w-full py-3.5 rounded-xl text-sm font-semibold tracking-wide transition-all ${
                file && !loading
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="4"/>
                    <path fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Running 10 MC passes...
                </span>
              ) : '▶  Run Analysis'}
            </motion.button>

            {/* error */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="bg-red-50 border border-red-200 border-l-4 border-l-red-500 rounded-xl px-4 py-3 text-sm text-red-700">
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* model info */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-[0.18em] mb-4">Model Config</p>
              <div className="space-y-3">
                {[
                  ['Architecture', 'EfficientNet-B3'],
                  ['Dataset',      'HAM10000'],
                  ['Training',     '10,015 images'],
                  ['Classes',      '7 lesion types'],
                  ['MC Passes',    '10 stochastic'],
                  ['Loss Fn',      'Focal Loss'],
                  ['Uncertainty',  'MC Dropout'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">{k}</span>
                    <span className="font-mono text-slate-600 font-medium">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* right — results */}
          <div className="col-span-3">
            <AnimatePresence mode="wait">
              {result && info ? (
                <motion.div key="result"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {/* main result card */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                    {/* colored top stripe */}
                    <div className={`absolute top-0 left-0 right-0 h-1 ${
                      computedRisk === 'high' ? 'bg-red-500' : computedRisk === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`} />

                    <div className="flex items-start justify-between mb-5">
                      <div>
                        <p className="text-[10px] font-mono text-slate-400 uppercase tracking-[0.18em] mb-2">Primary Diagnosis</p>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{info.name}</h2>
                        <p className="text-xs font-mono text-slate-400 mt-1.5">ICD-{info.icd} · HAM10000 · EfficientNet-B3</p>
                      </div>
                      <RiskBadge risk={computedRisk} />
                    </div>

                    <ConfidenceBar value={result.confidence} />
                  </div>

                  {/* stats grid */}
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { label: 'Confidence',  val: `${Math.round(result.confidence * 100)}%`, sub: 'Primary score' },
                      { label: 'Uncertainty', val: result.uncertainty.toFixed(5), sub: 'MC Dropout var.' },
                      { label: 'Latency',     val: `${result.inference_time_s}s`, sub: 'Inference time' },
                      { label: 'MC Passes',   val: result.mc_passes || 10, sub: 'Stochastic fwd.' },
                    ].map(({ label, val, sub }, i) => (
                      <motion.div key={label}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm"
                      >
                        <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2">{label}</p>
                        <p className="text-lg font-bold font-mono text-slate-800">{val}</p>
                        <p className="text-xs text-slate-400 mt-1">{sub}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* clinical note */}
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                    className={`rounded-2xl border p-5 ${
                      computedRisk === 'high'   ? 'bg-red-50 border-red-200 border-l-4 border-l-red-500' :
                      computedRisk === 'medium' ? 'bg-amber-50 border-amber-200 border-l-4 border-l-amber-500' :
                                                  'bg-emerald-50 border-emerald-200 border-l-4 border-l-emerald-500'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-2 h-2 rounded-full ${
                        computedRisk === 'high' ? 'bg-red-500' : computedRisk === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                      }`} />
                      <p className={`text-[10px] font-mono font-bold uppercase tracking-[0.15em] ${
                        computedRisk === 'high' ? 'text-red-700' : computedRisk === 'medium' ? 'text-amber-700' : 'text-emerald-700'
                      }`}>
                        {computedRisk === 'high' ? 'URGENT — Immediate action required' :
                         computedRisk === 'medium' ? 'ADVISORY — Clinical review recommended' :
                         'ROUTINE — Standard monitoring advised'}
                      </p>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">{info.advice}</p>
                  </motion.div>

                  {/* uncertainty */}
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                    className={`rounded-2xl border p-4 flex items-center gap-4 ${uncConfig[uncLevel].bg} ${uncConfig[uncLevel].border}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
                      uncLevel === 'low' ? 'bg-emerald-100' : uncLevel === 'medium' ? 'bg-amber-100' : 'bg-red-100'
                    }`}>
                      {uncLevel === 'low' ? '✅' : uncLevel === 'medium' ? '⚠️' : '🔴'}
                    </div>
                    <div className="flex-1">
                      <p className={`text-[10px] font-mono font-bold uppercase tracking-widest mb-1 ${uncConfig[uncLevel].color}`}>
                        MC Dropout Uncertainty
                      </p>
                      <p className="text-xs text-slate-600">{uncConfig[uncLevel].msg}</p>
                    </div>
                    <span className={`font-mono text-sm font-bold flex-shrink-0 ${uncConfig[uncLevel].color}`}>
                      {result.uncertainty.toFixed(5)}
                    </span>
                  </motion.div>

                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="h-full min-h-[480px] bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-4 shadow-sm"
                >
                  <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">📊</div>
                  <div className="text-center">
                    <p className="font-semibold text-slate-600">Awaiting Analysis</p>
                    <p className="text-sm text-slate-400 mt-1">Upload an image and run the model</p>
                  </div>
                  {loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="flex items-center gap-2 text-sm font-mono text-blue-600 bg-blue-50 px-4 py-2 rounded-full border border-blue-200">
                      <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="#bfdbfe" strokeWidth="4"/>
                        <path fill="#2563eb" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Running Monte Carlo inference...
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
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