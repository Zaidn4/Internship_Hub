import api from './api'

/**
 * Student profile service.
 *
 * Uses multipart/form-data so a CV PDF file can be sent alongside text fields.
 *
 * ⚠️  WHY transformRequest IS NEEDED:
 * The shared api.js Axios instance sets a global default header:
 *   Content-Type: application/json
 *
 * When Axios sees a FormData body it *should* override this with the correct
 * multipart/form-data + boundary string — but the instance-level default
 * prevents that auto-detection from firing. The result is that Laravel receives
 * the request with the wrong Content-Type, can't parse the multipart body, and
 * reports the cv field as a string instead of a file → 422 "must be a file".
 *
 * The only reliable fix is to delete the Content-Type entry from the request
 * config *before* Axios serialises it, using transformRequest. This lets the
 * browser set the header itself (including the exact boundary string).
 *
 * @param {FormData} formData — may contain: university?, bio?, cv? (File object)
 */
export const updateProfile = async (formData) => {
  const response = await api.post('/student/profile', formData, {
    transformRequest: [
      (data, headers) => {
        // Remove the JSON default so the browser can set the correct
        // multipart/form-data header with the proper boundary string.
        delete headers['Content-Type']
        return data
      },
    ],
  })
  return response.data
}
