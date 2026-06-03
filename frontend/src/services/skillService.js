import api from './api'

/**
 * Skills service.
 *
 * getSkills()           — public, no auth needed (GET /skills)
 * syncStudentSkills()   — protected, plain JSON body (PUT /student/skills)
 */

/**
 * Fetch the full list of skills in alphabetical order.
 * Used to populate SkillPicker on both the student profile and
 * the company internship form.
 *
 * @returns {Promise<Array<{id: number, name: string}>>}
 */
export const getSkills = async () => {
  const response = await api.get('/skills')
  return response.data.data  // unwrap the { data: [...] } envelope
}

/**
 * Replace the authenticated student's skill set with the provided IDs.
 * Sends a plain JSON body so there is no multipart/FormData complexity.
 * The backend uses Eloquent sync() — additions and removals are handled
 * atomically in one call.
 *
 * @param {number[]} skillIds — array of skill IDs to set (empty = clear all)
 * @returns {Promise<{message: string, skills: Array<{id, name}>}>}
 */
export const syncStudentSkills = async (skillIds) => {
  const response = await api.put('/student/skills', { skills: skillIds })
  return response.data
}
