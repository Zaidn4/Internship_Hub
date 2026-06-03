import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { deleteInternship, getAllInternships } from '../../services/internshipService'
import InternshipCard        from '../../components/internships/InternshipCard'
import PostInternshipModal   from '../../components/internships/PostInternshipModal'
import EditInternshipModal   from '../../components/internships/EditInternshipModal'
import Toast                 from '../../components/common/Toast'


/** Skeleton card while loading */
function SkeletonCard() {
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '0.875rem',
        padding: '1.375rem',
        display: 'flex', flexDirection: 'column', gap: '0.75rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      {[120, 200, 80, 160].map((w, i) => (
        <div
          key={i}
          style={{
            height: i === 1 ? '2.5rem' : '0.875rem',
            width: `${w}px`, maxWidth: '100%',
            borderRadius: '0.375rem',
            background: '#f1f5f9',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
      ))}
    </div>
  )
}

export default function ManageInternships() {
  const { user } = useAuth()

  const [internships, setInternships] = useState([])
  const [loading, setLoading]         = useState(true)
  const [fetchError, setFetchError]   = useState(null)
  const [showModal, setShowModal]     = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingInternship, setEditingInternship] = useState(null)
  const [toast, setToast]             = useState(null)
  const [currentPage, setCurrentPage] = useState(1)

  const PAGE_SIZE = 9

  const companyId = user?.profile?.id

  // ── Fetch internships on mount ──────────────────────────────────────────────
  const fetchInternships = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    try {
      // Fetch all (public) internships, then filter to this company's listings.
      // The backend doesn't yet expose a ?company_id filter — client-side filter is correct here.
      let allInternships = []
      let page = 1
      let lastPage = 1

      // Paginate through all pages (usually just 1 for a new company)
      do {
        const data = await getAllInternships(page)
        allInternships = [...allInternships, ...data.data]
        lastPage = data.meta?.last_page ?? 1
        page++
      } while (page <= lastPage)

      const mine = allInternships.filter((i) => i.company?.id === companyId)
      setInternships(mine)
    } catch {
      setFetchError('Failed to load internships. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [companyId])

  useEffect(() => {
    fetchInternships()
  }, [fetchInternships])

  // ── Handlers ──────────────────────────────────────────────────────────────
  const showToast = (message, type = 'success') => {
    setToast({ message, type })
  }

  const handleDelete = useCallback(async (id) => {
    await deleteInternship(id)
    setInternships((prev) => prev.filter((i) => i.id !== id))
    showToast('Internship deleted successfully.')
  }, [])

  const handleEdit = useCallback((internship) => {
    setEditingInternship(internship)
    setIsEditModalOpen(true)
  }, [])

  const handleEditSuccess = useCallback((updatedInternship) => {
    setInternships((prev) => prev.map(i => i.id === updatedInternship.id ? updatedInternship : i))
    setIsEditModalOpen(false)
    showToast('Internship updated successfully! 🎉')
  }, [])

  const handlePostSuccess = useCallback((newInternship) => {
    setInternships((prev) => [newInternship, ...prev])
    setShowModal(false)
    showToast('Internship posted successfully! 🎉')
  }, [])

  // ── Render ────────────────────────────────────────────────────────────────
  const totalPages   = Math.max(1, Math.ceil(internships.length / PAGE_SIZE))
  const pagedItems   = internships.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  return (
    <div style={{ maxWidth: '1000px' }}>
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem',
        }}
      >
        <div>
          <h1
            style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}
          >
            My Internship Listings
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {loading ? 'Loading…' : `${internships.length} listing${internships.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          id="open-post-modal-btn"
          onClick={() => setShowModal(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.6875rem 1.25rem', borderRadius: '0.6rem',
            border: 'none', cursor: 'pointer',
            background: 'var(--accent)', color: '#fff',
            fontSize: '0.875rem', fontWeight: 600,
            transition: 'background 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--accent-hover)'
            e.currentTarget.style.transform = 'translateY(-1px)'
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(99,102,241,0.4)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--accent)'
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>+</span>
          Post New Internship
        </button>
      </div>

      {/* ── Fetch error ──────────────────────────────────────────────────── */}
      {fetchError && (
        <div className="alert-error" style={{ marginBottom: '1.5rem' }}>
          ⚠ &nbsp;{fetchError}
          <button
            onClick={fetchInternships}
            style={{
              marginLeft: '1rem', background: 'none', border: 'none',
              color: 'inherit', textDecoration: 'underline', cursor: 'pointer', fontSize: 'inherit',
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Loading skeletons ────────────────────────────────────────────── */}
      {loading && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1rem',
          }}
        >
          {[1, 2, 3].map((n) => <SkeletonCard key={n} />)}
        </div>
      )}

      {/* ── Empty state ──────────────────────────────────────────────────── */}
      {!loading && !fetchError && internships.length === 0 && (
        <div
          style={{
            textAlign: 'center', padding: '4rem 2rem',
            background: '#ffffff',
            border: '1px dashed #cbd5e1',
            borderRadius: '1rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📌</div>
          <h2 style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '0.5rem' }}>
            No listings yet
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Post your first internship to start receiving applications.
          </p>
          <button
            onClick={() => setShowModal(true)}
            style={{
              padding: '0.6875rem 1.5rem', borderRadius: '0.6rem',
              border: '1px solid #c7d2fe',
              background: '#eef2ff', color: '#4f46e5',
              fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#e0e7ff' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#eef2ff' }}
          >
            + Post New Internship
          </button>
        </div>
      )}

      {/* ── Internship grid ────────────────────────────────────────────── */}
      {!loading && pagedItems.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1rem',
          }}
        >
          {pagedItems.map((internship) => (
            <InternshipCard
              key={internship.id}
              internship={internship}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}

      {/* ── Pagination ────────────────────────────────────────────── */}
      {!loading && totalPages > 1 && (
        <div
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '0.75rem', marginTop: '2rem', paddingTop: '1.5rem',
            borderTop: '1px solid #e2e8f0',
          }}
        >
          <button
            onClick={() => setCurrentPage(p => p - 1)}
            disabled={currentPage === 1}
            style={{
              padding: '0.5rem 1.125rem', borderRadius: '0.5rem',
              border: '1px solid #e2e8f0',
              background: currentPage === 1 ? '#f8fafc' : '#ffffff',
              color: currentPage === 1 ? '#94a3b8' : '#475569',
              fontWeight: 500, fontSize: '0.875rem',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            ← Previous
          </button>
          <span style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 500 }}>
            Page <strong style={{ color: '#0f172a' }}>{currentPage}</strong> of <strong style={{ color: '#0f172a' }}>{totalPages}</strong>
          </span>
          <button
            onClick={() => setCurrentPage(p => p + 1)}
            disabled={currentPage === totalPages}
            style={{
              padding: '0.5rem 1.125rem', borderRadius: '0.5rem',
              border: '1px solid #e2e8f0',
              background: currentPage === totalPages ? '#f8fafc' : '#ffffff',
              color: currentPage === totalPages ? '#94a3b8' : '#475569',
              fontWeight: 500, fontSize: '0.875rem',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Next →
          </button>
        </div>
      )}

      {/* ── Modal ────────────────────────────────────────────────────────── */}
      <PostInternshipModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handlePostSuccess}
      />

      <EditInternshipModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleEditSuccess}
        internship={editingInternship}
      />

      {/* ── Toast ────────────────────────────────────────────────────────── */}
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  )
}
