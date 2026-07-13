import { Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'

const Market = lazy(() => import('./pages/Market'))
const Analysis = lazy(() => import('./pages/Analysis'))
const Portfolio = lazy(() => import('./pages/Portfolio'))
const Signals = lazy(() => import('./pages/Signals'))
const Strategy = lazy(() => import('./pages/Strategy'))

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-[#00D9C0] border-t-transparent rounded-full animate-spin" />
        <span className="text-[#94A3B8] text-sm">Loading...</span>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/market" element={<Suspense fallback={<PageLoader />}><Market /></Suspense>} />
        <Route path="/analysis" element={<Suspense fallback={<PageLoader />}><Analysis /></Suspense>} />
        <Route path="/portfolio" element={<Suspense fallback={<PageLoader />}><Portfolio /></Suspense>} />
        <Route path="/signals" element={<Suspense fallback={<PageLoader />}><Signals /></Suspense>} />
        <Route path="/strategy" element={<Suspense fallback={<PageLoader />}><Strategy /></Suspense>} />
      </Route>
    </Routes>
  )
}
