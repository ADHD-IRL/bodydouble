import React from 'react'
import ReactDOM from 'react-dom/client'
import '@/index.css'

// VITE_STANDALONE is replaced with a literal at build time, so the unused
// branch (and everything it imports) is tree-shaken away. The GitHub Pages
// bundle therefore never pulls in the Base44 SDK or the auth gate.
const bootstrap = import.meta.env.VITE_STANDALONE === 'true'
  ? import('@/StandaloneApp.jsx')
  : import('@/App.jsx')

bootstrap.then(({ default: Root }) => {
  ReactDOM.createRoot(document.getElementById('root')).render(<Root />)
})
