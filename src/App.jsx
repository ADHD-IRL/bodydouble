import { HashRouter, Route, Routes, Navigate } from 'react-router-dom'
import Resources from '@/pages/Resources'

/**
 * The Neurodivergence Library.
 *
 * A fully static site: no backend, no auth and no data fetching.
 *
 * HashRouter is used deliberately — the site is published on GitHub Pages,
 * which has no SPA rewrite, so a path-based deep link would 404.
 */
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Resources />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}
