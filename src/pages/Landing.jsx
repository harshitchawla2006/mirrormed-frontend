import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'

const features = [
  { icon: '🧠', title: 'EfficientNet-B3',     desc: 'State-of-the-art CNN pretrained on ImageNet and fine-tuned on HAM10000 dermoscopy dataset.' },
  { icon: '📊', title: 'MC Dropout',           desc: 'Monte Carlo Dropout provides uncertainty quantification across 10 stochastic forward passes.' },
  { icon: '🔬', title: '7 Lesion Classes',     desc: 'Classifies melanoma, nevi, BCC, actinic keratosis, benign keratosis, dermatofibroma and vascular lesions.' },
  { icon: '⚡', title: 'Fast Inference',       desc: 'Results in under 2 seconds locally. Production API built with FastAPI and containerized with Docker.' },
  { icon: '🛡️', title: 'Uncertainty Aware',   desc: 'Every prediction comes with a calibrated uncertainty score — high uncertainty flags cases for human review.' },
  { icon: '📈', title: 'Analytics Dashboard', desc: 'Track prediction history, confidence distributions, and disease frequency over time.' },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* hero */}
      <section className="pt-32 pb-20 px-6 max-w-6xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            AI-Powered Dermatology Triage · Research System
          </span>

          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
            Skin Lesion Analysis<br />
            <span className="text-blue-600">Powered by AI</span>
          </h1>

          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed mb-10">
            Upload a dermoscopy image and get instant AI-assisted classification with
            uncertainty quantification. Built on EfficientNet-B3 trained on HAM10000.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link to="/triage"
              className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95 text-sm">
              Start Diagnosis →
            </Link>
            <Link to="/dashboard"
              className="px-8 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all text-sm">
              View Dashboard
            </Link>
          </div>
        </motion.div>

        {/* hero visual */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-16 relative"
        >
          <div className="bg-gradient-to-b from-slate-50 to-white border border-slate-200 rounded-3xl p-8 shadow-xl max-w-3xl mx-auto">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Model', value: 'EfficientNet-B3', color: 'text-blue-600' },
                { label: 'Dataset', value: 'HAM10000', color: 'text-slate-900' },
                { label: 'Accuracy', value: '~87%', color: 'text-emerald-600' },
                { label: 'Classes', value: '7 types', color: 'text-slate-900' },
                { label: 'MC Passes', value: '10 fwd.', color: 'text-slate-900' },
                { label: 'Training', value: '10,015 imgs', color: 'text-slate-900' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-white border border-slate-100 rounded-2xl p-4 text-left shadow-sm">
                  <p className="text-xs text-slate-400 font-mono uppercase tracking-wider mb-1">{label}</p>
                  <p className={`text-lg font-bold font-mono ${color}`}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* features */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Built for Clinical Research</h2>
            <p className="text-slate-500">Every component designed with medical AI best practices in mind</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-xl mb-4">{icon}</div>
                <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* disclaimer */}
      <section className="py-8 px-6 border-t border-slate-200">
        <p className="text-center text-xs text-slate-400 font-mono max-w-2xl mx-auto">
          RESEARCH USE ONLY · NOT APPROVED FOR CLINICAL DIAGNOSIS · MIRRORMED v1.0.0<br />
          EfficientNet-B3 · HAM10000 · Monte Carlo Dropout · FastAPI · Docker
        </p>
      </section>
    </div>
  )
}