import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'

// Layouts
import StudentLayout from './layouts/StudentLayout'
import CompanyLayout from './layouts/CompanyLayout'
import AdminLayout   from './layouts/AdminLayout'
import PublicLayout  from './layouts/PublicLayout'

// Public pages
import Home from './pages/Home'

// Auth pages
import LoginPage      from './pages/auth/LoginPage'
import RegisterPage   from './pages/auth/RegisterPage'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword  from './pages/auth/ResetPassword'

// Dashboard pages
import StudentDashboard  from './pages/student/Dashboard'
import CompanyDashboard  from './pages/company/Dashboard'
import AdminDashboard    from './pages/admin/Dashboard'

// Company feature pages
import ManageInternships        from './pages/company/ManageInternships'
import ViewApplicants           from './pages/company/ViewApplicants'
import CompanyApplications      from './pages/company/Applications'
import CompanyProfile           from './pages/company/Profile'
import CompanyInternshipDetails from './pages/company/InternshipDetails'

// Student feature pages
import InternshipBoard  from './pages/student/InternshipBoard'
import InternshipDetails from './pages/student/InternshipDetails'
import SavedInternships  from './pages/student/SavedInternships'
import MyApplications  from './pages/student/MyApplications'
import StudentProfile  from './pages/student/Profile'
import CommunityFeed   from './pages/shared/CommunityFeed'

/** Maps a role to its default landing page */
const ROLE_HOME = {
  student: '/student/dashboard',
  company: '/company/dashboard',
  admin:   '/admin/dashboard',
}

/**
 * RootRedirect — smart handler for '/'.
 * - Loading  → spinner (prevents flash of wrong page)
 * - Auth     → role-specific dashboard
 * - Guest    → /login
 */
function RootRedirect() {
  const { isAuthenticated, loading, user } = useAuth()

  if (loading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ background: 'var(--bg-page)' }}
      >
        <div className="spinner" style={{ width: '2rem', height: '2rem' }} />
      </div>
    )
  }

  if (isAuthenticated && user?.role) {
    return <Navigate to={ROLE_HOME[user.role] ?? '/login'} replace />
  }

  // Unauthenticated guests land on the public home page
  return <Navigate to="/home" replace />
}

export default function App() {
  return (
    <Routes>
      {/* ── Root smart redirect ──────────────────────────────────────────── */}
      <Route path="/" element={<RootRedirect />} />

      {/* ── Public landing page ────────────────────────────────────────── */}
      <Route path="/home" element={<PublicLayout />}>
        <Route index element={<Home />} />
      </Route>

      {/* ── Public auth routes ─────────────────────────────── */}
      <Route path="/login"           element={<LoginPage />} />
      <Route path="/register"        element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password"  element={<ResetPassword />} />

      {/* ── Student routes ───────────────────────────────────────────────── */}
      <Route element={<ProtectedRoute allowedRoles={['student']} />}>
        <Route path="/student" element={<StudentLayout />}>
          <Route path="dashboard"    element={<StudentDashboard />} />
          <Route path="internships"  element={<InternshipBoard />} />
          <Route path="internships/:id" element={<InternshipDetails />} />
          <Route path="saved"        element={<SavedInternships />} />
          <Route path="applications" element={<MyApplications />} />
          <Route path="profile"      element={<StudentProfile />} />
          <Route path="feed"         element={<CommunityFeed />} />
        </Route>
      </Route>

      {/* ── Company routes ───────────────────────────────────────────────── */}
      <Route element={<ProtectedRoute allowedRoles={['company']} />}>
        <Route path="/company" element={<CompanyLayout />}>
          <Route path="dashboard"                  element={<CompanyDashboard />} />
          <Route path="internships"                element={<ManageInternships />} />
          <Route path="internships/:id"            element={<CompanyInternshipDetails />} />
          <Route path="internships/:id/applicants" element={<ViewApplicants />} />
          <Route path="applications"               element={<CompanyApplications />} />
          <Route path="profile"                    element={<CompanyProfile />} />
          <Route path="feed"                       element={<CommunityFeed />} />
        </Route>
      </Route>

      {/* ── Admin routes ─────────────────────────────────────────────────── */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          {/* Future child routes: users, internships, companies */}
        </Route>
      </Route>

      {/* ── Catch-all ────────────────────────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
