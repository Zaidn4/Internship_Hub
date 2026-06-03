import { useEffect, useRef, useState } from 'react'
import api from '../../services/api'

/**
 * AvatarUpload — shared avatar section for Student and Company profiles.
 *
 * Props:
 *   user       {object} — current auth user ({ name, email, avatar_url })
 *   onSuccess  {fn}     — called with the fresh user object after a successful upload
 */
export default function AvatarUpload({ user, onSuccess }) {
  const fileRef               = useRef(null)
  const [previewUrl, setPreviewUrl] = useState(null)   // instant local preview
  const [uploading, setUploading]   = useState(false)
  const [error, setError]           = useState('')

  // Derive display URL: local object URL wins while we have one (instant feedback),
  // then fall back to the server URL stored on the user object.
  const displayUrl = previewUrl ?? user?.avatar_url ?? null
  const initials   = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  // Revoke the object URL when the component unmounts or when it changes,
  // to avoid memory leaks from dangling Blob references.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    console.log('Avatar — file selected:', file.name, file.type, file.size, 'bytes')

    // ── 1. Instant local preview — no network request needed ─────────────────
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
    setError('')
    setUploading(true)

    // ── 2. Upload to the server ───────────────────────────────────────────────
    // Pass FormData directly — Axios detects it and sets the correct
    // multipart/form-data boundary automatically. Do NOT set Content-Type manually.
    const formData = new FormData()
    formData.append('avatar', file)

    try {
      const res = await api.post('/user/avatar', formData)
      console.log('Avatar — upload success:', res.data)

      // Clear the blob URL — the parent will re-render with the persisted server URL
      setPreviewUrl(null)
      // Propagate the fresh user object to the parent (updates sidebar etc.)
      if (res.data?.user) onSuccess(res.data.user)
    } catch (err) {
      console.error('Avatar — upload failed:', err.response?.data || err.message)

      const msg =
        err.response?.data?.errors?.avatar?.[0] ??
        err.response?.data?.message ??
        'Upload failed. Please try again.'

      setError(msg)
      // Roll back the preview so the UI doesn't show a broken state
      setPreviewUrl(null)
    } finally {
      setUploading(false)
      // Reset so re-selecting the same file fires onChange again
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem' }}>

      {/* ── Avatar circle ───────────────────────────────────────────────────── */}
      <div
        style={{ position: 'relative', flexShrink: 0, cursor: uploading ? 'wait' : 'pointer' }}
        onClick={() => !uploading && fileRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Change profile picture"
        onKeyDown={(e) => e.key === 'Enter' && !uploading && fileRef.current?.click()}
      >
        {/* Circle */}
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%',
          border: '3px solid #e2e8f0',
          background: displayUrl ? 'transparent' : '#eef2ff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          transition: 'border-color 0.15s ease',
        }}>
          {displayUrl ? (
            <img
              src={displayUrl}
              alt={user?.name ?? 'Avatar'}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <span style={{ fontSize: '1.375rem', fontWeight: 700, color: '#4f46e5', userSelect: 'none' }}>
              {initials}
            </span>
          )}
        </div>

        {/* Uploading spinner overlay */}
        {uploading && (
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: 'rgba(15,23,42,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span className="spinner" style={{
              width: '20px', height: '20px',
              borderColor: 'rgba(255,255,255,0.3)',
              borderTopColor: '#ffffff',
            }} />
          </div>
        )}

        {/* Indigo camera badge — always visible at bottom-right */}
        {!uploading && (
          <div style={{
            position: 'absolute', bottom: '1px', right: '1px',
            width: '24px', height: '24px', borderRadius: '50%',
            background: '#4f46e5', border: '2px solid #ffffff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.6rem', boxShadow: '0 1px 4px rgba(79,70,229,0.4)',
            pointerEvents: 'none',   // click is handled by the parent div
          }}>
            📷
          </div>
        )}
      </div>

      {/* ── Text info + upload trigger ──────────────────────────────────────── */}
      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: 600, fontSize: '0.9375rem', color: '#0f172a', marginBottom: '0.2rem' }}>
          {user?.name ?? '—'}
        </p>
        <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '0.5rem' }}>
          {user?.email ?? '—'}
        </p>

        <button
          type="button"
          onClick={() => !uploading && fileRef.current?.click()}
          disabled={uploading}
          style={{
            fontSize: '0.78rem', fontWeight: 600,
            color: uploading ? '#94a3b8' : '#4f46e5',
            background: 'none', border: 'none', padding: 0,
            cursor: uploading ? 'wait' : 'pointer',
          }}
        >
          {uploading ? 'Uploading…' : displayUrl ? 'Change photo' : 'Upload photo'}
        </button>

        {!error && (
          <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.25rem' }}>
            JPG, PNG, GIF or WebP · max 2 MB
          </p>
        )}
        {error && (
          <p style={{ fontSize: '0.72rem', color: '#dc2626', marginTop: '0.25rem' }}>
            ✕ {error}
          </p>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileRef}
        id="avatar-file-input"
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        aria-hidden="true"
      />
    </div>
  )
}
