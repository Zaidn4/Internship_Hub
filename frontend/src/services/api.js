import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// ── Request interceptor ──────────────────────────────────────────────────────
// Automatically attaches the Sanctum bearer token to every outgoing request.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Attach current locale so Laravel can localise validation messages etc.
    const lng = localStorage.getItem('i18nextLng') ?? 'en'
    config.headers['Accept-Language'] = lng.slice(0, 2) // normalise 'en-GB' → 'en'

    // When sending FormData (file uploads), let the browser set the
    // Content-Type including the multipart boundary automatically.
    // The instance default 'application/json' must not override it.
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }

    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor ─────────────────────────────────────────────────────
// On a 401, clear stale credentials and redirect to login to prevent loops.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // Only redirect if we're not already on an auth page
      if (!window.location.pathname.startsWith('/login') &&
          !window.location.pathname.startsWith('/register')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
