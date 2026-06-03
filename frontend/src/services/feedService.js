import api from './api'

/** GET /api/feed — fetch all posts with authors + comments + likes */
export const getFeed = () => api.get('/feed').then((r) => r.data.posts)

/** POST /api/feed/posts */
export const createPost = (body) =>
  api.post('/feed/posts', { body }).then((r) => r.data.post)

/** PUT /api/feed/posts/:id */
export const updatePost = (postId, body) =>
  api.put(`/feed/posts/${postId}`, { body }).then((r) => r.data.post)

/** DELETE /api/feed/posts/:id */
export const deletePost = (postId) =>
  api.delete(`/feed/posts/${postId}`).then((r) => r.data)

/** POST /api/feed/posts/:id/like — toggles like, returns { is_liked_by_me, likes_count } */
export const toggleLike = (postId) =>
  api.post(`/feed/posts/${postId}/like`).then((r) => r.data)

/** POST /api/feed/posts/:id/comments */
export const createComment = (postId, body) =>
  api.post(`/feed/posts/${postId}/comments`, { body }).then((r) => r.data.comment)

/** DELETE /api/feed/comments/:id */
export const deleteComment = (commentId) =>
  api.delete(`/feed/comments/${commentId}`).then((r) => r.data)
