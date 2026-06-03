import { useState, useEffect } from 'react'
import { getComments, postComment, deleteComment } from '../../services/commentService'
import { useAuth } from '../../context/AuthContext'

export default function DiscussionSection({ internshipId, internship }) {
  const { user } = useAuth()
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const data = await getComments(internshipId)
        setComments(data)
      } catch (err) {
        setError('Failed to load comments.')
      } finally {
        setLoading(false)
      }
    }
    fetchComments()
  }, [internshipId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setPosting(true)
    const tempId = Date.now()
    const optimisticComment = {
      id: tempId,
      body: newComment,
      user: {
        name: user.name ?? 'You',
        avatar_url: user.avatar_url,
      },
      created_at: new Date().toISOString(),
    }

    setComments([optimisticComment, ...comments])
    setNewComment('')

    try {
      const savedComment = await postComment(internshipId, optimisticComment.body)
      setComments((prev) => prev.map((c) => (c.id === tempId ? savedComment : c)))
    } catch (err) {
      setComments((prev) => prev.filter((c) => c.id !== tempId))
      setError('Failed to post comment. Please try again.')
    } finally {
      setPosting(false)
    }
  }

  const handleDeleteComment = async (commentId) => {
    const previousComments = [...comments]
    setComments(comments.filter(c => c.id !== commentId))

    try {
      await deleteComment(commentId)
    } catch (err) {
      setComments(previousComments)
      setError('Failed to delete comment.')
    }
  }

  const canDeleteComment = (comment) => {
    if (!user) return false;
    return user.id === comment.user_id || (internship?.company?.user_id && user.id === internship.company.user_id)
  }

  return (
    <div style={{
      background: 'var(--bg-surface)',
      borderRadius: '1rem',
      padding: '2rem',
      border: '1px solid var(--border)',
      marginTop: '2rem',
    }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span>💬</span> Discussion
      </h3>

      {/* Post Comment Form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-glow)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '1rem' }}>{(user?.name || 'U').charAt(0)}</span>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Ask a question or share your thoughts..."
            style={{
              width: '100%',
              minHeight: '80px',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              border: '1px solid var(--border)',
              background: 'var(--bg-input)',
              color: 'var(--text-primary)',
              fontFamily: 'inherit',
              fontSize: '0.875rem',
              resize: 'vertical',
              marginBottom: '0.5rem',
              outline: 'none',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--border-focus)'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-glow)' }}
            onBlur={(e)  => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none' }}
            disabled={posting}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={posting || !newComment.trim()}
              style={{
                padding: '0.5rem 1rem',
                background: 'var(--accent)',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: posting || !newComment.trim() ? 'not-allowed' : 'pointer',
                opacity: posting || !newComment.trim() ? 0.7 : 1,
                transition: 'background 0.15s ease',
              }}
            >
              {posting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </div>
      </form>

      {/* Error Message */}
      {error && <div style={{ color: 'var(--error)', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}

      {/* Comments List */}
      {loading ? (
        <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem 0' }}>Loading discussion...</div>
      ) : comments.length === 0 ? (
        <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem 0' }}>No comments yet. Be the first to start the discussion!</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {comments.map((comment) => (
            <div key={comment.id} style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-glow)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {comment.user?.avatar_url ? (
                  <img src={comment.user.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '1rem' }}>{(comment.user?.name || 'U').charAt(0)}</span>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.25rem', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{comment.user?.name}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {canDeleteComment(comment) && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      style={{
                        background: 'transparent', border: 'none', color: 'var(--error)',
                        cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, padding: '0 0.25rem',
                        opacity: 0.7, transition: 'opacity 0.15s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = 0.7}
                      title="Delete Comment"
                    >
                      🗑️ Delete
                    </button>
                  )}
                </div>
                <p style={{ margin: 0, color: 'var(--text-subtle)', fontSize: '0.875rem', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                  {comment.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
