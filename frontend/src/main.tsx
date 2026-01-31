import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

const stored = localStorage.getItem('truthlens-theme')
const theme = stored === 'light' || stored === 'dark' ? stored : 'dark'
document.documentElement.setAttribute('data-theme', theme)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
