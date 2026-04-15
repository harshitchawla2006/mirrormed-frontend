import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function Navbar() {
  const { pathname } = useLocation()

  const links = [
    { to: '/',          label: 'Home' },
    { to: '/triage',    label: 'Triage' },
    { to: '/dashboard', label: 'Dashboard' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">

        {/* logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-sm shadow-md shadow-blue-500/30 group-hover:scale-105 transition-transform">
            🔬
          </div>
          <span className="font-bold text-slate-900 tracking-tight">
            Mirror<span className="text-blue-600">Med</span>
          </span>
        </Link>

        {/* links */}
        <div className="flex items-center gap-1">
          {links.map(({ to, label }) => (
            <Link key={to} to={to} className="relative px-4 py-1.5 text-sm font-medium transition-colors">
              <span className={pathname === to ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'}>
                {label}
              </span>
              {pathname === to && (
                <motion.div layoutId="nav-pill"
                  className="absolute inset-0 bg-blue-50 rounded-lg border border-blue-200/60"
                  style={{ zIndex: -1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </Link>
          ))}
        </div>

        {/* cta */}
        <Link to="/triage"
          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-md shadow-blue-500/25 transition-all active:scale-95">
          Start Diagnosis
        </Link>
      </div>
    </nav>
  )
}