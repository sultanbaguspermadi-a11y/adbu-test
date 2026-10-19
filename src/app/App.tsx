import { MotionConfig } from 'framer-motion'
import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Toasts } from '../components/common/Toasts'
import { useApplyAppearance, useMotion } from '../theme/useAppearance'
import { startAutoSync } from '../services/cloud/supabase'
import { ErrorBoundary } from './ErrorBoundary'
import { RequirePlayer } from './guards'
import { Landing } from '../pages/Landing'
import { Setup } from '../pages/Setup'
import { Tutorial } from '../pages/Tutorial'
import { CaseSelect } from '../pages/CaseSelect'
import { CasePage } from '../pages/CasePage'
import { Results } from '../pages/Results'
import { Achievements } from '../pages/Achievements'
import { Teacher } from '../pages/Teacher'
import { Settings } from '../pages/Settings'
import { NotFound } from '../pages/NotFound'

function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export function App() {
  useApplyAppearance()
  const motion = useMotion()
  useEffect(() => startAutoSync(), []) // flush queued scores on startup / when online; listeners removed on unmount
  return (
    <MotionConfig reducedMotion={motion.framer}>
      <ErrorBoundary>
      <BrowserRouter>
        <ScrollTop />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/setup" element={<Setup />} />
          <Route path="/teacher" element={<Teacher />} />
          <Route element={<RequirePlayer />}>
            <Route path="/tutorial" element={<Tutorial />} />
            <Route path="/cases" element={<CaseSelect />} />
            <Route path="/case/:id" element={<CasePage />} />
            <Route path="/results/:id" element={<Results />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toasts />
      </BrowserRouter>
      </ErrorBoundary>
    </MotionConfig>
  )
}
