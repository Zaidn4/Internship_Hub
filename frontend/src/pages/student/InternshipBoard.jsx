import { useCallback, useEffect, useMemo, useState } from 'react'
import { getAllInternships, applyToInternship, getSavedInternshipIds, toggleSavedInternship } from '../../services/internshipService'
import InternshipListingCard from '../../components/internships/InternshipListingCard'
import FilterBar              from '../../components/internships/FilterBar'
import Toast                  from '../../components/common/Toast'

const INITIAL_FILTERS = { search: '', type: 'all' }

/** Skeleton card shown while data is loading */
function SkeletonCard() {
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '0.875rem',
        padding: '1.375rem',
        display: 'flex', flexDirection: 'column', gap: '0.875rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      {[80, 200, 140, 100].map((w, i) => (
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

/** Pagination controls */
function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: '0.75rem', marginTop: '2rem', paddingTop: '1.5rem',
        borderTop: '1px solid #e2e8f0',
      }}
    >
      <button
        onClick={() => onPageChange(p => p - 1)}
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
        onMouseEnter={(e) => { if (currentPage !== 1) e.currentTarget.style.borderColor = '#a5b4fc' }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0' }}
      >
        ← Previous
      </button>

      <span style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 500 }}>
        Page <strong style={{ color: '#0f172a' }}>{currentPage}</strong> of <strong style={{ color: '#0f172a' }}>{totalPages}</strong>
      </span>

      <button
        onClick={() => onPageChange(p => p + 1)}
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
        onMouseEnter={(e) => { if (currentPage !== totalPages) e.currentTarget.style.borderColor = '#a5b4fc' }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0' }}
      >
        Next →
      </button>
    </div>
  )
}

export default function InternshipBoard() {
  const [internships, setInternships] = useState([])
  const [loading, setLoading]         = useState(true)
  const [fetchError, setFetchError]   = useState(null)
  const [filters, setFilters]         = useState(INITIAL_FILTERS)
  const [appliedIds, setAppliedIds]   = useState(new Set())
  const [savedIds, setSavedIds]       = useState(new Set())
  const [toast, setToast]             = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages]   = useState(1)
  const [totalCount, setTotalCount]   = useState(0)

  // ── Reset to page 1 when filters change ───────────────────────────────────
  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  // ── Fetch page of internships ──────────────────────────────────────────────
  const fetchPage = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const data = await getAllInternships(currentPage)
      setInternships(data.data)
      setTotalPages(data.meta?.last_page ?? 1)
      setTotalCount(data.meta?.total ?? data.data.length)

      // Fetch saved IDs only once (page 1)
      if (currentPage === 1) {
        const savedData = await getSavedInternshipIds()
        setSavedIds(new Set(savedData.saved_ids))
      }
    } catch {
      setFetchError('Failed to load internships. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }, [currentPage])

  useEffect(() => { fetchPage() }, [fetchPage])

  // ── Scroll to top on page change ──────────────────────────────────────────
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentPage])

  // ── Client-side filtering (on the current page) ────────────────────────────
  const filtered = useMemo(() => {
    const q    = filters.search.toLowerCase().trim()
    const type = filters.type

    return internships.filter((i) => {
      const matchesType   = type === 'all' || i.type === type
      const matchesSearch = q === '' ||
        i.title.toLowerCase().includes(q) ||
        (i.company?.company_name ?? '').toLowerCase().includes(q)
      return matchesType && matchesSearch
    })
  }, [internships, filters])

  // ── Apply handler ──────────────────────────────────────────────────────────
  const handleApply = useCallback(async (internshipId) => {
    try {
      await applyToInternship(internshipId)
      setAppliedIds((prev) => new Set([...prev, internshipId]))
      setToast({ message: 'Application submitted successfully! 🎉', type: 'success' })
    } catch (err) {
      const status = err.response?.status
      const msg    = err.response?.data?.message

      if (status === 409) {
        setToast({ message: msg ?? 'You have already applied to this internship.', type: 'warning' })
        setAppliedIds((prev) => new Set([...prev, internshipId]))
      } else if (status === 403) {
        setToast({ message: 'Only students can apply to internships.', type: 'error' })
      } else {
        setToast({ message: msg ?? 'Something went wrong. Please try again.', type: 'error' })
      }
      throw err
    }
  }, [])

  // ── Toggle Save handler ────────────────────────────────────────────────────
  const handleToggleSave = useCallback(async (internshipId) => {
    setSavedIds((prev) => {
      const next = new Set(prev)
      if (next.has(internshipId)) next.delete(internshipId)
      else next.add(internshipId)
      return next
    })
    try {
      await toggleSavedInternship(internshipId)
    } catch {
      setSavedIds((prev) => {
        const next = new Set(prev)
        if (next.has(internshipId)) next.delete(internshipId)
        else next.add(internshipId)
        return next
      })
      setToast({ message: 'Failed to update saved status.', type: 'error' })
    }
  }, [])

  // ── Render ─────────────────────────────────────────────────────────────────
  const isFiltered = filters.search !== '' || filters.type !== 'all'

  return (
    <div style={{ maxWidth: '1080px' }}>
      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1
          style={{
            fontSize: '1.625rem', fontWeight: 700,
            color: 'var(--text-primary)', marginBottom: '0.3rem',
          }}
        >
          Browse Internships
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          {loading
            ? 'Loading available opportunities…'
            : isFiltered
              ? `${filtered.length} result${filtered.length !== 1 ? 's' : ''} for your search`
              : `${totalCount} internship${totalCount !== 1 ? 's' : ''} available`}
        </p>
      </div>

      {/* ── Filter bar ──────────────────────────────────────────────────────── */}
      <FilterBar filters={filters} onChange={setFilters} />

      {/* ── Fetch error ─────────────────────────────────────────────────────── */}
      {fetchError && (
        <div
          className="alert-error"
          style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
        >
          <span>⚠ {fetchError}</span>
          <button
            onClick={fetchPage}
            style={{
              marginLeft: 'auto', background: 'none', border: 'none',
              color: 'inherit', textDecoration: 'underline', cursor: 'pointer',
              fontSize: 'inherit', padding: 0,
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* ── Loading skeletons ────────────────────────────────────────────────── */}
      {loading && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1rem',
          }}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => <SkeletonCard key={n} />)}
        </div>
      )}

      {/* ── Empty state ─────────────────────────────────────────────────────── */}
      {!loading && !fetchError && filtered.length === 0 && (
        <div
          style={{
            textAlign: 'center', padding: '4rem 2rem',
            background: '#ffffff',
            border: '1px dashed #cbd5e1',
            borderRadius: '1rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
            {isFiltered ? '🔎' : '📭'}
          </div>
          <h2 style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '1.1rem' }}>
            {isFiltered ? 'No matches found' : 'No internships yet'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {isFiltered
              ? 'Try adjusting your search or filter to see more results.'
              : 'Check back soon — companies are posting new opportunities.'}
          </p>
          {isFiltered && (
            <button
              onClick={() => setFilters(INITIAL_FILTERS)}
              style={{
                marginTop: '1.25rem', padding: '0.6rem 1.25rem',
                borderRadius: '0.5rem', border: '1px solid #c7d2fe',
                background: '#eef2ff', color: '#4f46e5',
                fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#e0e7ff')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#eef2ff')}
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* ── Internship grid ─────────────────────────────────────────────────── */}
      {!loading && filtered.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1rem',
          }}
        >
          {filtered.map((internship) => (
            <InternshipListingCard
              key={internship.id}
              internship={internship}
              onApply={handleApply}
              alreadyApplied={appliedIds.has(internship.id)}
              isSaved={savedIds.has(internship.id)}
              onToggleSave={handleToggleSave}
            />
          ))}
        </div>
      )}

      {/* ── Pagination ───────────────────────────────────────────────────────── */}
      {!loading && !isFiltered && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* ── Toast ───────────────────────────────────────────────────────────── */}
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  )
}
