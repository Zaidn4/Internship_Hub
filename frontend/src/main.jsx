import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import App from './App.jsx'
import './i18n'           // Initialise i18next before rendering
import './index.css'

/**
 * Mount order matters:
 *   BrowserRouter → enables useNavigate inside AuthProvider
 *   AuthProvider  → provides auth state to the entire app
 *   App           → renders the route tree
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
