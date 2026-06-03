import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

// ── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext(null)

// ── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser]                     = useState(null)
  const [token, setToken]                   = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading]               = useState(true)

  const navigate = useNavigate()

  // Bootstrap: restore session from localStorage on first render
  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser  = localStorage.getItem('user')

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setToken(storedToken)
        setUser(parsedUser)
        setIsAuthenticated(true)
      } catch {
        // Malformed data — clear and start fresh
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }

    setLoading(false)
  }, [])

  // ── Persist helpers ────────────────────────────────────────────────────────
  const persistSession = useCallback((userData, tokenValue) => {
    setUser(userData)
    setToken(tokenValue)
    setIsAuthenticated(true)
    localStorage.setItem('token', tokenValue)
    localStorage.setItem('user', JSON.stringify(userData))
  }, [])

  const clearSession = useCallback(() => {
    setUser(null)
    setToken(null)
    setIsAuthenticated(false)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }, [])

  // ── Auth actions ───────────────────────────────────────────────────────────
  const login = useCallback(async (credentials) => {
    const response = await api.post('/login', credentials)
    const { user: userData, token: tokenValue } = response.data
    persistSession(userData, tokenValue)
    return response.data
  }, [persistSession])

  const register = useCallback(async (data) => {
    const response = await api.post('/register', data)
    const { user: userData, token: tokenValue } = response.data
    persistSession(userData, tokenValue)
    return response.data
  }, [persistSession])

  const logout = useCallback(async () => {
    try {
      await api.post('/logout')
    } catch {
      // Token may already be invalid — proceed with local cleanup regardless
    } finally {
      clearSession()
      navigate('/login')
    }
  }, [clearSession, navigate])

  /**
   * Re-fetch the current user from the API and sync state + localStorage.
   * Call this after a profile update so the user object stays fresh everywhere.
   */
  const refreshUser = useCallback(async () => {
    const storedToken = localStorage.getItem('token')
    if (!storedToken) return
    try {
      const response  = await api.get('/user')
      const freshUser = response.data.user
      persistSession(freshUser, storedToken)
    } catch {
      // Silently fail — stale data is acceptable here
    }
  }, [persistSession])

  /**
   * Sync a freshly-returned user object into state + localStorage.
   * Use this after an update endpoint returns { user: ... } to avoid
   * a redundant GET /user round-trip.
   */
  const updateUser = useCallback((userData) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }, [])

  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    refreshUser,
    updateUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// ── Custom hook ───────────────────────────────────────────────────────────────
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
