import api from './api'

/**
 * Internship API service.
 *
 * All methods return the `data` property of the Axios response so callers
 * work with plain objects/arrays rather than Axios response envelopes.
 * The underlying api.js instance automatically attaches the Bearer token.
 */

/** Fetch all internships (public, paginated). */
export const getAllInternships = async (page = 1) => {
  const response = await api.get(`/internships?page=${page}`)
  return response.data
}

/** Fetch a single internship by ID (public). */
export const getInternship = async (id) => {
  const response = await api.get(`/internships/${id}`)
  return response.data
}

/**
 * Create a new internship listing.
 * Requires a valid company Bearer token (enforced by backend policy).
 *
 * @param {Object} data - { title, description, location, type, deadline, salary, skills[] }
 */
export const createInternship = async (data) => {
  const response = await api.post('/internships', data)
  return response.data
}

/**
 * Update an existing internship.
 * Requires ownership — backend InternshipPolicy@update enforces this.
 *
 * @param {number} id
 * @param {Object} data - Partial fields (all fields are 'sometimes' on the backend)
 */
export const updateInternship = async (id, data) => {
  const response = await api.put(`/internships/${id}`, data)
  return response.data
}

/**
 * Delete an internship listing.
 * Requires ownership — backend InternshipPolicy@delete enforces this.
 *
 * @param {number} id
 */
export const deleteInternship = async (id) => {
  const response = await api.delete(`/internships/${id}`)
  return response.data
}

/**
 * Submit a student application to an internship.
 * Requires a valid student Bearer token (enforced by backend).
 * Returns the created Application object on success (HTTP 201).
 * Throws on 409 (duplicate) and 403 (wrong role) so callers can branch.
 *
 * @param {number} internshipId
 */
export const applyToInternship = async (internshipId) => {
  const response = await api.post(`/internships/${internshipId}/apply`)
  return response.data
}

/**
 * Fetch all saved internships for the authenticated student.
 */
export const getSavedInternships = async () => {
  const response = await api.get('/student/saved-internships')
  return response.data
}

/**
 * Fetch only the array of saved internship IDs for fast UI lookup.
 */
export const getSavedInternshipIds = async () => {
  const response = await api.get('/student/saved-internship-ids')
  return response.data
}

/**
 * Toggle the saved status of an internship.
 * @param {number} id 
 */
export const toggleSavedInternship = async (id) => {
  const response = await api.post(`/student/internships/${id}/save`)
  return response.data
}

