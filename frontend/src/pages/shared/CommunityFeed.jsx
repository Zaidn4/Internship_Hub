import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import ConfirmationModal from '../../components/common/ConfirmationModal'
import {
  createComment,
  createPost,
  deleteComment,
  deletePost,
  getFeed,
  toggleLike,
  updatePost,
} from '../../services/feedService'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000)
  if (diff < 60)    return `${diff}s ago`
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function Avatar({ name, avatarUrl, size = 40 }) {
  const initials = name
    ? name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: avatarUrl ? 'transparent' : '#eef2ff',
      border: '2px solid #c7d2fe',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.35, fontWeight: 700, color: '#4f46e5',
      overflow: 'hidden',
    }}>
      {avatarUrl
        ? <img src={avatarUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : initials}
    </div>
  )
}

function Badge({ type }) {
  const isCompany = type === 'company'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.2rem',
      fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.5rem',
      borderRadius: '9999px', letterSpacing: '0.04em',
      background: isCompany ? '#fff7ed' : '#eef2ff',
      color: isCompany ? '#c2410c' : '#4338ca',
      border: `1px solid ${isCompany ? '#fed7aa' : '#c7d2fe'}`,
    }}>
      {isCompany ? '🏢 Company' : '🎓 Student'}
    </span>
  )
}

// ─── 3-dot dropdown menu ──────────────────────────────────────────────────────

function PostMenu({ onEdit, onDelete }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const menuBtn = (label, icon, color, handler) => (
    <button
      onClick={() => { handler(); setOpen(false) }}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        width: '100%', padding: '0.5rem 0.875rem',
        background: 'none', border: 'none', cursor: 'pointer',
        fontSize: '0.8125rem', fontWeight: 500, color,
        textAlign: 'left', transition: 'background 0.12s',
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
    >
      <span>{icon}</span> {label}
    </button>
  )

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        onClick={() => setOpen((s) => !s)}
        title="Options"
        style={{
          background: open ? '#f1f5f9' : 'none', border: 'none', cursor: 'pointer',
          color: '#94a3b8', padding: '0.25rem 0.4rem', borderRadius: '0.375rem',
          fontSize: '1.1rem', lineHeight: 1, transition: 'all 0.15s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#475569' }}
        onMouseLeave={(e) => { if (!open) { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#94a3b8' } }}
      >
        ···
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', right: 0, zIndex: 50,
          background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.10)', minWidth: '140px', overflow: 'hidden',
        }}>
          {menuBtn('Edit post',   '✏️', '#0f172a', onEdit)}
          {menuBtn('Delete post', '🗑️', '#dc2626', onDelete)}
        </div>
      )}
    </div>
  )
}

// ─── Like Button ──────────────────────────────────────────────────────────────

function LikeButton({ count, liked, onClick }) {
  const [hovered, setHovered] = useState(false)
  const color   = liked ? '#e11d48' : hovered ? '#e11d48' : '#64748b'
  const bgColor = liked ? '#fff1f2' : hovered ? '#fff1f2' : 'transparent'

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.35rem',
        background: bgColor, border: 'none', cursor: 'pointer',
        color, fontSize: '0.8125rem', fontWeight: liked ? 700 : 500,
        padding: '0.3rem 0.625rem', borderRadius: '0.5rem',
        transition: 'all 0.15s ease',
      }}
      title={liked ? 'Unlike' : 'Like'}
    >
      <svg width="15" height="15" viewBox="0 0 24 24"
        fill={liked ? color : 'none'} stroke={color}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        style={{ transition: 'all 0.15s ease', flexShrink: 0 }}
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      {count > 0 && <span>{count}</span>}
      <span>{liked ? 'Liked' : 'Like'}</span>
    </button>
  )
}

// ─── Post Card ────────────────────────────────────────────────────────────────

function PostCard({
  post,
  currentAuthorType,
  currentAuthorId,
  onPostDeleted,
  onPostUpdated,
  onCommentAdded,
  onCommentDeleted,
  onLikeToggled,
  onRequestDeletePost,
  onRequestDeleteComment,
}) {
  const [commentText, setCommentText]   = useState('')
  const [submitting, setSubmitting]     = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [editing, setEditing]           = useState(false)
  const [editBody, setEditBody]         = useState(post.body)
  const [savingEdit, setSavingEdit]     = useState(false)
  const [likeBusy, setLikeBusy]         = useState(false)

  const editAreaRef     = useRef(null)
  const commentInputRef = useRef(null)

  const isPostOwner = post.author?.type === currentAuthorType &&
    post.author?.id === currentAuthorId

  const canDeleteComment = (comment) => {
    const isCommentAuthor =
      comment.author?.type === currentAuthorType &&
      comment.author?.id   === currentAuthorId
    return isCommentAuthor || isPostOwner
  }

  useEffect(() => {
    if (editing) {
      setEditBody(post.body)
      setTimeout(() => editAreaRef.current?.focus(), 30)
    }
  }, [editing, post.body])

  const handleSaveEdit = async () => {
    if (!editBody.trim() || editBody.trim() === post.body) { setEditing(false); return }
    setSavingEdit(true)
    try {
      await updatePost(post.id, editBody.trim())
      onPostUpdated(post.id, editBody.trim())
      setEditing(false)
    } catch {}
    finally { setSavingEdit(false) }
  }

  const handleLike = async () => {
    if (likeBusy) return
    setLikeBusy(true)
    onLikeToggled(post.id, !post.is_liked_by_me)
    try {
      const { is_liked_by_me, likes_count } = await toggleLike(post.id)
      onLikeToggled(post.id, is_liked_by_me, likes_count)
    } catch {
      onLikeToggled(post.id, post.is_liked_by_me)
    } finally { setLikeBusy(false) }
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!commentText.trim()) return
    setSubmitting(true)
    try {
      const comment = await createComment(post.id, commentText.trim())
      onCommentAdded(post.id, comment)
      setCommentText('')
      setShowComments(true)
    } catch {}
    finally { setSubmitting(false) }
  }

  return (
    <div style={{
      background: '#ffffff', border: '1px solid #e2e8f0',
      borderRadius: '1rem', overflow: 'hidden',
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    }}>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div style={{ padding: '1rem 1.125rem 0.75rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <Avatar name={post.author?.name} avatarUrl={post.author?.avatar_url} size={42} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
              {post.author?.name ?? 'Unknown'}
            </span>
            <Badge type={post.author?.type} />
            <span style={{ color: '#94a3b8', fontSize: '0.75rem', marginLeft: 'auto', paddingRight: '0.25rem' }}>
              {timeAgo(post.created_at)}
            </span>
          </div>
        </div>
        {isPostOwner && (
          <PostMenu
            onEdit={() => setEditing(true)}
            onDelete={() => onRequestDeletePost(post.id)}
          />
        )}
      </div>

      {/* ── Body / Edit Mode ───────────────────────────────────────────── */}
      <div style={{ padding: '0 1.125rem 1rem' }}>
        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            <textarea
              ref={editAreaRef}
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              maxLength={2000} rows={4}
              className="auth-input"
              style={{ resize: 'vertical', fontSize: '0.9375rem', lineHeight: 1.6, fontFamily: 'inherit', width: '100%', boxSizing: 'border-box', minHeight: '80px' }}
            />
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setEditing(false)}
                style={{ padding: '0.4rem 1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit} disabled={savingEdit || !editBody.trim()}
                className="auth-btn" style={{ width: 'auto', padding: '0.4rem 1.25rem', fontSize: '0.8125rem' }}
              >
                {savingEdit ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          <p style={{ color: '#1e293b', fontSize: '0.9375rem', lineHeight: 1.65, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {post.body}
          </p>
        )}
      </div>

      {/* ── Footer: Like + Comments ─────────────────────────────────────── */}
      <div style={{ borderTop: '1px solid #f1f5f9', padding: '0.5rem 1.125rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <LikeButton count={post.likes_count ?? 0} liked={!!post.is_liked_by_me} onClick={handleLike} />
        <span style={{ color: '#e2e8f0', fontSize: '0.7rem', userSelect: 'none', padding: '0 0.125rem' }}>•</span>
        <button
          onClick={() => { setShowComments((s) => !s); setTimeout(() => commentInputRef.current?.focus(), 50) }}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#64748b', fontSize: '0.8125rem', fontWeight: 500,
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.3rem 0.5rem', borderRadius: '0.375rem', transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#4f46e5' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#64748b' }}
        >
          💬 {post.comments.length > 0 ? `${post.comments.length} comment${post.comments.length !== 1 ? 's' : ''}` : 'Comment'}
        </button>
      </div>

      {/* ── Comments section ───────────────────────────────────────────── */}
      {showComments && (
        <div style={{ borderTop: '1px solid #f1f5f9', background: '#fafafa', padding: '0.875rem 1.125rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {post.comments.length === 0 && (
            <p style={{ color: '#94a3b8', fontSize: '0.8rem', textAlign: 'center' }}>No comments yet — be the first!</p>
          )}
          {post.comments.map((c) => (
            <div key={c.id} style={{ display: 'flex', gap: '0.625rem', alignItems: 'flex-start' }}>
              <Avatar name={c.author?.name} avatarUrl={c.author?.avatar_url} size={30} />
              <div style={{ flex: 1, background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '0.5rem 0.75rem', minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.8rem', color: '#0f172a' }}>{c.author?.name}</span>
                  <Badge type={c.author?.type} />
                  <span style={{ color: '#94a3b8', fontSize: '0.7rem', marginLeft: 'auto' }}>{timeAgo(c.created_at)}</span>
                  {canDeleteComment(c) && (
                    <button
                      onClick={() => onRequestDeleteComment(c.id, post.id)}
                      title="Delete comment"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1', fontSize: '0.75rem', padding: '0 0.1rem', lineHeight: 1, transition: 'color 0.15s' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}
                    >
                      ✕
                    </button>
                  )}
                </div>
                <p style={{ color: '#334155', fontSize: '0.85rem', lineHeight: 1.55, wordBreak: 'break-word' }}>{c.body}</p>
              </div>
            </div>
          ))}

          {/* New comment input */}
          <form onSubmit={handleComment} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              ref={commentInputRef} value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment…" maxLength={1000}
              className="auth-input"
              style={{ flex: 1, padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
            />
            <button
              type="submit" disabled={submitting || !commentText.trim()}
              style={{
                padding: '0.5rem 1rem', borderRadius: '0.5rem',
                background: commentText.trim() ? '#4f46e5' : '#e2e8f0',
                color: commentText.trim() ? '#ffffff' : '#94a3b8',
                border: 'none', fontWeight: 600, fontSize: '0.8rem',
                cursor: commentText.trim() ? 'pointer' : 'default',
                transition: 'all 0.15s', flexShrink: 0,
              }}
            >
              {submitting ? '…' : 'Reply'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const EMPTY_TARGET = { isOpen: false, type: null, id: null, parentPostId: null }

export default function CommunityFeed() {
  const { user } = useAuth()
  const [posts, setPosts]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [postText, setPostText]     = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(EMPTY_TARGET)
  const [deleting, setDeleting]     = useState(false)

  const currentAuthorType = user?.role === 'student' ? 'student'
    : user?.role === 'company' ? 'company' : null
  const currentAuthorId = user?.profile?.id ?? null

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try { setPosts(await getFeed()) }
    catch { setError('Failed to load feed. Please refresh.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  // ── Create post ────────────────────────────────────────────────────────────
  const handlePost = async (e) => {
    e.preventDefault()
    if (!postText.trim()) return
    setSubmitting(true)
    try {
      const newPost = await createPost(postText.trim())
      setPosts((prev) => [{ ...newPost, comments: [], likes_count: 0, is_liked_by_me: false }, ...prev])
      setPostText('')
    } catch (err) {
      alert(err.response?.data?.message ?? 'Failed to post.')
    } finally { setSubmitting(false) }
  }

  // ── Delete triggers (open modal) ───────────────────────────────────────────
  const requestDeletePost    = (id) =>
    setDeleteTarget({ isOpen: true, type: 'post',    id, parentPostId: null })

  const requestDeleteComment = (id, parentPostId) =>
    setDeleteTarget({ isOpen: true, type: 'comment', id, parentPostId })

  // ── Modal confirm handler ──────────────────────────────────────────────────
  const confirmDeletion = async () => {
    setDeleting(true)
    try {
      if (deleteTarget.type === 'post') {
        await deletePost(deleteTarget.id)
        setPosts((p) => p.filter((x) => x.id !== deleteTarget.id))
      } else if (deleteTarget.type === 'comment') {
        await deleteComment(deleteTarget.id)
        setPosts((p) => p.map((x) =>
          x.id !== deleteTarget.parentPostId ? x
            : { ...x, comments: x.comments.filter((c) => c.id !== deleteTarget.id) }
        ))
      }
      setDeleteTarget(EMPTY_TARGET)
    } catch {}
    finally { setDeleting(false) }
  }

  // ── Other state updaters ───────────────────────────────────────────────────
  const handlePostUpdated  = (id, body) =>
    setPosts((p) => p.map((x) => x.id === id ? { ...x, body } : x))

  const handleLikeToggled = (postId, isLiked, exactCount = null) =>
    setPosts((p) => p.map((x) => {
      if (x.id !== postId) return x
      const likes_count = exactCount !== null ? exactCount
        : isLiked ? (x.likes_count ?? 0) + 1 : Math.max(0, (x.likes_count ?? 0) - 1)
      return { ...x, is_liked_by_me: isLiked, likes_count }
    }))

  const handleCommentAdded = (postId, comment) =>
    setPosts((p) => p.map((x) =>
      x.id === postId ? { ...x, comments: [...x.comments, comment] } : x
    ))

  const displayName = user?.role === 'company'
    ? user?.profile?.company_name ?? user?.name : user?.name

  // ── Modal copy ─────────────────────────────────────────────────────────────
  const modalTitle   = deleteTarget.type === 'post' ? 'Delete Post?' : 'Delete Comment?'
  const modalMessage = deleteTarget.type === 'post'
    ? 'This will permanently delete the post and all its comments. This action cannot be undone.'
    : 'This will permanently delete this comment. This action cannot be undone.'

  // ── Stat data (derived from live posts) ───────────────────────────────────
  const totalLikes    = posts.reduce((s, p) => s + (p.likes_count ?? 0), 0)
  const totalComments = posts.reduce((s, p) => s + p.comments.length, 0)

  // Last 4 unique authors across all posts for the "Active Members" widget
  const seenIds = new Set()
  const activeMembers = []
  for (const p of posts) {
    if (p.author && !seenIds.has(`${p.author.type}-${p.author.id}`)) {
      seenIds.add(`${p.author.type}-${p.author.id}`)
      activeMembers.push(p.author)
    }
    if (activeMembers.length >= 4) break
  }

  const card = {
    background: '#ffffff', border: '1px solid #e2e8f0',
    borderRadius: '1rem', padding: '1.25rem',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  }

  return (
    /* ── Outer page wrapper — full width of the content area ────────────── */
    <div style={{ width: '100%' }}>

      {/* ── Page header (above the grid) ─────────────────────────────────── */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '0.2rem' }}>
          Community Feed
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
          Share updates, tips, and opportunities with students and companies.
        </p>
      </div>

      {/* ── 2+1 column grid ──────────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',          /* mobile: single column          */
        gap: '1.5rem',
      }}
        className="feed-grid"               /* ← breakpoint handled in <style> */
      >

        {/* ══ LEFT / CENTRE — the feed ══════════════════════════════════════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: 0 }}>

          {/* Create Post Card */}
          <div style={{ ...card, padding: '1.125rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <Avatar name={displayName} avatarUrl={user?.avatar_url} size={42} />
              <form onSubmit={handlePost} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <textarea
                  value={postText} onChange={(e) => setPostText(e.target.value)}
                  placeholder="What's on your mind?" rows={3} maxLength={2000}
                  className="auth-input"
                  style={{ resize: 'none', fontSize: '0.9375rem', lineHeight: 1.6, fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                    {postText.length > 0 ? `${postText.length} / 2000` : ''}
                  </span>
                  <button
                    type="submit" disabled={submitting || !postText.trim()}
                    className="auth-btn"
                    style={{ width: 'auto', padding: '0.5rem 1.5rem', opacity: postText.trim() ? 1 : 0.55 }}
                  >
                    {submitting ? <><span className="spinner" /> Posting…</> : 'Post'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Loading / error / empty states */}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
              <span className="spinner" style={{ width: '2rem', height: '2rem' }} />
            </div>
          )}
          {error && (
            <div style={{ padding: '1rem', borderRadius: '0.75rem', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', textAlign: 'center', fontSize: '0.875rem' }}>
              {error}
              <button onClick={load} style={{ marginLeft: '0.75rem', background: 'none', border: 'none', color: '#dc2626', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>Retry</button>
            </div>
          )}
          {!loading && !error && posts.length === 0 && (
            <div style={{ padding: '3rem 1.5rem', textAlign: 'center', ...card, color: '#94a3b8' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📢</div>
              <p style={{ fontWeight: 600, color: '#64748b', marginBottom: '0.25rem' }}>The feed is empty</p>
              <p style={{ fontSize: '0.875rem' }}>Be the first to post something!</p>
            </div>
          )}

          {/* Post list */}
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentAuthorType={currentAuthorType}
              currentAuthorId={currentAuthorId}
              onPostUpdated={handlePostUpdated}
              onLikeToggled={handleLikeToggled}
              onCommentAdded={handleCommentAdded}
              onRequestDeletePost={requestDeletePost}
              onRequestDeleteComment={requestDeleteComment}
            />
          ))}
        </div>

        {/* ══ RIGHT — sticky widgets ════════════════════════════════════════ */}
        <div className="feed-sidebar" style={{ display: 'none', flexDirection: 'column', gap: '1.25rem' }}>

          {/* ── Widget 1: About Community ─────────────────────────────────── */}
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem', paddingBottom: '0.875rem', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ width: 36, height: 36, borderRadius: '0.625rem', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>
                🌐
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>About Community</p>
                <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Internship Hub Network</p>
              </div>
            </div>

            <p style={{ fontSize: '0.8125rem', color: '#64748b', lineHeight: 1.65, marginBottom: '1.25rem' }}>
              A shared space where <strong style={{ color: '#4f46e5' }}>students</strong> and <strong style={{ color: '#c2410c' }}>companies</strong> connect, share opportunities, ask questions, and grow together.
            </p>

            {/* Live stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
              {[
                { label: 'Posts',    value: posts.length, icon: '📝' },
                { label: 'Likes',    value: totalLikes,   icon: '❤️' },
                { label: 'Comments', value: totalComments, icon: '💬' },
              ].map(({ label, value, icon }) => (
                <div key={label} style={{ textAlign: 'center', padding: '0.625rem 0.25rem', background: '#f8fafc', borderRadius: '0.625rem', border: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>{icon}</div>
                  <div style={{ fontWeight: 800, fontSize: '1.0625rem', color: '#0f172a', lineHeight: 1 }}>{value}</div>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.2rem', fontWeight: 500 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Widget 2: Active Members ──────────────────────────────────── */}
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '0.875rem', borderBottom: '1px solid #f1f5f9' }}>
              <p style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>Active Members</p>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#4f46e5', background: '#eef2ff', padding: '0.2rem 0.5rem', borderRadius: '9999px' }}>
                Recently posted
              </span>
            </div>

            {activeMembers.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: '0.8rem', textAlign: 'center', padding: '1rem 0' }}>No activity yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {activeMembers.map((member, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <Avatar name={member.name} avatarUrl={member.avatar_url} size={36} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: '0.8125rem', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {member.name}
                      </p>
                    </div>
                    <span style={{
                      flexShrink: 0, fontSize: '0.6rem', fontWeight: 700,
                      padding: '0.15rem 0.45rem', borderRadius: '9999px', letterSpacing: '0.04em',
                      background: member.type === 'company' ? '#fff7ed' : '#eef2ff',
                      color:      member.type === 'company' ? '#c2410c'  : '#4338ca',
                      border: `1px solid ${member.type === 'company' ? '#fed7aa' : '#c7d2fe'}`,
                    }}>
                      {member.type === 'company' ? 'Company' : 'Student'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Widget 3: Tips ────────────────────────────────────────────── */}
          <div style={{ ...card, background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)', border: '1px solid #bae6fd' }}>
            <p style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0c4a6e', marginBottom: '0.75rem' }}>
              💡 Community Tips
            </p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                'Share internship openings to reach students faster.',
                'Ask questions — companies love engaged candidates.',
                'Like posts you find helpful to boost visibility.',
              ].map((tip, i) => (
                <li key={i} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.78rem', color: '#0369a1', lineHeight: 1.5 }}>
                  <span style={{ flexShrink: 0, marginTop: '0.1rem' }}>›</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* ── Confirmation Modal ───────────────────────────────────────────── */}
      <ConfirmationModal
        isOpen={deleteTarget.isOpen}
        title={modalTitle}
        message={modalMessage}
        confirmLabel={deleting ? 'Deleting…' : 'Delete'}
        onClose={() => !deleting && setDeleteTarget(EMPTY_TARGET)}
        onConfirm={confirmDeletion}
      />

      {/* ── Responsive grid styles injected once ─────────────────────────── */}
      <style>{`
        @media (min-width: 1024px) {
          .feed-grid {
            grid-template-columns: 1fr 320px !important;
          }
          .feed-sidebar {
            display: flex !important;
            position: sticky;
            top: 88px;
            height: fit-content;
            align-self: start;
          }
        }
      `}</style>
    </div>
  )
}
