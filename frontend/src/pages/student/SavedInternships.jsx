import { useCallback, useEffect, useState } from 'react'
import { getSavedInternships, applyToInternship, toggleSavedInternship } from '../../services/internshipService'
import InternshipListingCard from '../../components/internships/InternshipListingCard'
import Toast                  from '../../components/common/Toast'

export default function SavedInternships() {
  const [internships, setInternships]       = useState([])
  const [loading, setLoading]               = useState(true)
  const [fetchError, setFetchError]         = useState(null)
  const [appliedIds, setAppliedIds]         = useState(new Set())
  const [toast, setToast]                   = useState(null)

  const fetchSaved = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const data = await getSavedInternships()
      setInternships(data.data) // Assuming resource collection
    } catch {
      setFetchError('Failed to load saved internships.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchSaved() }, [fetchSaved])

  const handleApply = useCallback(async (internshipId) => {
    try {
      await applyToInternship(internshipId)
      setAppliedIds((prev) => new Set([...prev, internshipId]))
      setToast({ message: 'Application submitted successfully! 🎉', type: 'success' })
    } catch (err) {
      const status = err.response?.status
      const msg    = err.response?.data?.message

      if (status === 409) {
        setToast({ message: msg ?? 'You have already applied.', type: 'warning' })
        setAppliedIds((prev) => new Set([...prev, internshipId]))
      } else {
        setToast({ message: msg ?? 'Something went wrong.', type: 'error' })
      }
      throw err
    }
  }, [])

  const handleToggleSave = useCallback(async (internshipId) => {
    try {
      const result = await toggleSavedInternship(internshipId)
      // If it was removed from saved list, we might want to remove it from the UI immediately
      if (!result.is_saved) {
        setInternships(prev => prev.filter(i => i.id !== internshipId))
        setToast({ message: 'Internship removed from saved list.', type: 'info' })
      }
    } catch (err) {
      setToast({ message: 'Failed to update saved status.', type: 'error' })
    }
  }, [])

  return (
    <div style={{ maxWidth: '1080px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
          Saved Internships
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          {loading ? 'Loading...' : `You have ${internships.length} saved internship${internships.length !== 1 ? 's' : ''}.`}
        </p>
      </div>

      {fetchError && (
        <div className="alert-error" style={{ marginBottom: '1.5rem' }}>
          <span>⚠ {fetchError}</span>
        </div>
      )}

      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {/* Skeletons could go here */}
          <div style={{ height: '250px', background: '#ffffff', borderRadius: '1rem', border: '1px solid #e2e8f0', animation: 'pulse 1.5s infinite' }} />
          <div style={{ height: '250px', background: '#ffffff', borderRadius: '1rem', border: '1px solid #e2e8f0', animation: 'pulse 1.5s infinite' }} />
        </div>
      )}

      {!loading && !fetchError && internships.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#ffffff', border: '1px dashed #cbd5e1', borderRadius: '1rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔖</div>
          <h2 style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '1.1rem' }}>
            No saved internships
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            When you see an interesting internship, click the bookmark icon to save it here for later.
          </p>
        </div>
      )}

      {!loading && internships.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {internships.map((internship) => (
            <InternshipListingCard
              key={internship.id}
              internship={internship}
              onApply={handleApply}
              alreadyApplied={appliedIds.has(internship.id)}
              isSaved={true}
              onToggleSave={handleToggleSave}
            />
          ))}
        </div>
      )}

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  )
}
