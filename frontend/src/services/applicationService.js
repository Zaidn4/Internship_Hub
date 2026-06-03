import api from './api'

/**
 * Application API service.
 *
 * Covers both student-facing (history) and company-facing (review) endpoints.
 * The bearer token is automatically attached by the Axios interceptor in api.js.
 */

/**
 * Fetch the authenticated student's full application history.
 * Each item includes the nested internship and company objects.
 * Enforced by the backend: only the owning student receives their own records.
 */
export const getStudentApplications = async () => {
  const response = await api.get('/student/applications')
  return response.data
}

/**
 * Fetch all applications for a specific internship.
 * Requires company ownership — enforced by InternshipPolicy@viewApplications.
 *
 * Response includes: application id, status, cv_path, applied_at,
 * and a nested `student` object (id, name, email, university, bio).
 *
 * @param {number} internshipId
 */
export const getApplications = async (internshipId) => {
  const response = await api.get(`/internships/${internshipId}/applications`)
  return response.data
}

/**
 * Accept or reject an application.
 * Requires company ownership — enforced by ApplicationPolicy@updateStatus.
 *
 * @param {number} applicationId
 * @param {'accepted'|'rejected'} status
 */
export const updateApplicationStatus = async (applicationId, status) => {
  const response = await api.patch(`/applications/${applicationId}/status`, { status })
  return response.data
}
