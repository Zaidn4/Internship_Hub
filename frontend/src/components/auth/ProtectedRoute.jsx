import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

/** Maps each role to its home dashboard path */
const ROLE_HOME = {
  student: '/student/dashboard',
  company: '/company/dashboard',
  admin:   '/admin/dashboard',
}

/**
 * ProtectedRoute — multi-purpose route guard.
 *
 * Props:
 *   allowedRoles?: string[]  — if omitted, any authenticated user passes.
 *
 * Guard order:
 *   1. Still bootstrapping from localStorage → full-screen spinner
 *   2. Not authenticated → /login
 *   3. Role not in allowedRoles → redirect to the user's own dashboard
 *   4. All clear → <Outlet />
 */
export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, loading, user } = useAuth()

  // ── 1. Bootstrap guard ───────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ background: 'var(--bg-page)' }}
      >
        <div className="text-center">
          <div
            className="spinner"
            style={{ width: '2rem', height: '2rem', margin: '0 auto' }}
          />
          <p style={{ color: 'var(--text-muted)', marginTop: '1rem', fontSize: '0.875rem' }}>
            Loading…
          </p>
        </div>
      </div>
    )
  }

  // ── 2. Auth guard ────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // ── 3. Role guard ────────────────────────────────────────────────────────
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    const home = ROLE_HOME[user?.role] ?? '/login'
    return <Navigate to={home} replace />
  }

  // ── 4. Authorised ────────────────────────────────────────────────────────
  return <Outlet />
}
