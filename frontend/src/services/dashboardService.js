import api from './api'

/**
 * Fetch the company dashboard statistics.
 * @returns {Promise<{active_listings, total_applications, hired_count, applications_by_status, applications_by_month}>}
 */
export const getCompanyDashboardStats = async () => {
  const res = await api.get('/company/dashboard')
  return res.data
}

/**
 * Fetch the student dashboard statistics.
 * @returns {Promise<{total_applications, pending_count, accepted_count, rejected_count, applications_by_status, recent_applications}>}
 */
export const getStudentDashboardStats = async () => {
  const res = await api.get('/student/dashboard')
  return res.data
}
