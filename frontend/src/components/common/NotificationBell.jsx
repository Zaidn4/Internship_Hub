import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../../services/notificationService'

function timeAgo(dateString) {
  const now     = new Date()
  const date    = new Date(dateString)
  const seconds = Math.floor((now - date) / 1000)
  if (seconds < 60)    return 'just now'
  if (seconds < 3600)  return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export default function NotificationBell({ roleBase = '/student' }) {
  const [notifications, setNotifications] = useState([])
  const [unreadCount,   setUnreadCount]   = useState(0)
  const [isOpen,        setIsOpen]        = useState(false)
  const [markingAll,    setMarkingAll]    = useState(false)
  const dropdownRef = useRef(null)
  const navigate    = useNavigate()

  const fetchNotifs = useCallback(async () => {
    try {
      const data = await getNotifications()
      setNotifications(data.notifications || [])
      setUnreadCount(data.unread_count ?? 0)
    } catch { /* silently fail */ }
  }, [])

  useEffect(() => {
    fetchNotifs()
    const interval = setInterval(fetchNotifs, 60_000)
    return () => clearInterval(interval)
  }, [fetchNotifs])

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleNotifClick = async (notif) => {
    if (!notif.read_at) {
      try {
        await markNotificationAsRead(notif.id)
        setNotifications((prev) =>
          prev.map((n) => n.id === notif.id ? { ...n, read_at: new Date().toISOString() } : n)
        )
        setUnreadCount((c) => Math.max(0, c - 1))
      } catch { /* ignore */ }
    }
    setIsOpen(false)
    const { data } = notif
    if (data?.post_id)            navigate(`${roleBase}/feed`)
    else if (data?.internship_id) navigate(`${roleBase}/internships/${data.internship_id}`)
  }

  const handleMarkAllRead = async () => {
    if (markingAll || unreadCount === 0) return
    setMarkingAll(true)
    try {
      await markAllNotificationsAsRead()
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() }))
      )
      setUnreadCount(0)
    } catch { /* ignore */ } finally {
      setMarkingAll(false)
    }
  }

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>

      {/* ── Bell Button ──────────────────────────────────────────────────── */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        title="Notifications"
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          border: 'none',
          background: 'transparent',
          color: '#64748b',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#0f172a' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b' }}
      >
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            minWidth: '18px',
            height: '18px',
            padding: '0 4px',
            borderRadius: '9px',
            background: '#ef4444',
            color: '#fff',
            fontSize: '10px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
            border: '2px solid #fff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown Panel ───────────────────────────────────────────────── */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 12px)',
          right: 0,
          width: '400px',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          boxShadow: '0 20px 60px -10px rgba(0,0,0,0.18), 0 4px 16px -4px rgba(0,0,0,0.08)',
          zIndex: 100,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}>

          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 22px',
            borderBottom: '1px solid #f1f5f9',
            background: '#f8fafc',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                Notifications
              </span>
              {unreadCount > 0 && (
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '20px',
                  background: '#e0e7ff',
                  color: '#4338ca',
                  fontSize: '11px',
                  fontWeight: 700,
                }}>
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={markingAll}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#4f46e5',
                  cursor: 'pointer',
                  opacity: markingAll ? 0.4 : 1,
                  transition: 'color 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#3730a3')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#4f46e5')}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div style={{ maxHeight: '440px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (

              /* Empty state */
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '52px 32px',
                textAlign: 'center',
              }}>
                <div style={{
                  width: '52px', height: '52px',
                  borderRadius: '14px',
                  background: '#f1f5f9',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '14px',
                }}>
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#475569', margin: 0 }}>
                  You're all caught up!
                </p>
                <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                  New notifications will appear here
                </p>
              </div>

            ) : notifications.map((notif, index) => {
              const isUnread = !notif.read_at
              return (
                <button
                  key={notif.id}
                  onClick={() => handleNotifClick(notif)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '14px',
                    padding: '16px 22px',
                    textAlign: 'left',
                    background: isUnread ? '#eef2ff' : '#ffffff',
                    border: 'none',
                    borderBottom: index < notifications.length - 1 ? '1px solid #f1f5f9' : 'none',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = isUnread ? '#e0e7ff' : '#f8fafc' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = isUnread ? '#eef2ff' : '#ffffff' }}
                >
                  {/* Icon */}
                  <div style={{
                    flexShrink: 0,
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: isUnread ? '#c7d2fe' : '#f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                  }}>
                    💬
                  </div>

                  {/* Text */}
                  <div style={{ flex: 1, minWidth: 0, paddingTop: '2px' }}>
                    <p style={{
                      margin: 0,
                      fontSize: '13px',
                      lineHeight: '1.5',
                      fontWeight: isUnread ? 600 : 500,
                      color: isUnread ? '#1e1b4b' : '#475569',
                    }}>
                      {notif.data?.message || 'New notification'}
                    </p>
                    <span style={{
                      display: 'block',
                      marginTop: '5px',
                      fontSize: '11px',
                      color: '#94a3b8',
                    }}>
                      {timeAgo(notif.created_at)}
                    </span>
                  </div>

                  {/* Unread dot */}
                  {isUnread && (
                    <span style={{
                      flexShrink: 0,
                      marginTop: '8px',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#6366f1',
                    }} />
                  )}
                </button>
              )
            })}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div style={{
              padding: '12px 22px',
              borderTop: '1px solid #f1f5f9',
              background: '#f8fafc',
              textAlign: 'center',
            }}>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                Showing the last {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}

        </div>
      )}
    </div>
  )
}
