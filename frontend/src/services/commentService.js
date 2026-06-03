import api from './api'

export const getComments = async (internshipId) => {
  const response = await api.get(`/internships/${internshipId}/comments`)
  return response.data
}

export const postComment = async (internshipId, body) => {
  const response = await api.post(`/internships/${internshipId}/comments`, { body })
  return response.data
}

export const deleteComment = async (commentId) => {
  const response = await api.delete(`/comments/${commentId}`)
  return response.data
}
