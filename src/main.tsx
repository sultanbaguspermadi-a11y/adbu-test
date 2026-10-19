import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './app/App'
import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-600.css'
import '@fontsource/inter/latin-700.css'
import '@fontsource/ibm-plex-mono/latin-400.css'
import '@fontsource/ibm-plex-mono/latin-500.css'
import '@fontsource/noto-naskh-arabic/arabic-400.css'
import '@fontsource/noto-naskh-arabic/arabic-600.css'
import '@fontsource/noto-naskh-arabic/arabic-700.css'
import '@fontsource/ibm-plex-sans/latin-400.css'
import '@fontsource/ibm-plex-sans/latin-500.css'
import '@fontsource/ibm-plex-sans/latin-600.css'
import '@fontsource/ibm-plex-sans/latin-700.css'
import '@fontsource/atkinson-hyperlegible/latin-400.css'
import '@fontsource/atkinson-hyperlegible/latin-700.css'
import '@fontsource/amiri/arabic-400.css'
import '@fontsource/amiri/arabic-700.css'
import '@fontsource/scheherazade-new/arabic-400.css'
import '@fontsource/scheherazade-new/arabic-700.css'
import './styles/index.css'
import { applyPreferences } from './theme/apply'
import { loadPreferences } from './stores/preferencesStore'

// Apply saved appearance before the first paint so there is no flash of the default theme.
applyPreferences(loadPreferences())

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
