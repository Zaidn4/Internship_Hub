import { useEffect, useRef, useState } from 'react'
import { createInternship } from '../../services/internshipService'
import { getSkills } from '../../services/skillService'
import SkillPicker from '../../components/common/SkillPicker'

const INITIAL_FORM = {
  title:       '',
  description: '',
  location:    '',
  type:        'remote',
  deadline:    '',
  salary:      '',
}

/**
 * PostInternshipModal
 *
 * Props:
 *   isOpen     — controls visibility
 *   onClose()  — called to close the modal
 *   onSuccess(internship) — called with the new internship on successful create
 */
export default function PostInternshipModal({ isOpen, onClose, onSuccess }) {
  const [form, setForm]               = useState(INITIAL_FORM)
  const [errors, setErrors]           = useState({})
  const [globalError, setGlobalError] = useState('')
  const [submitting, setSubmitting]   = useState(false)

  // Skills
  const [skillsAll, setSkillsAll]         = useState([])
  const [skillsLoading, setSkillsLoading] = useState(false)
  const [selectedSkills, setSelectedSkills] = useState([])

  const firstInputRef = useRef(null)

  // Reset form and fetch skills when modal opens
  useEffect(() => {
    if (isOpen) {
      setForm(INITIAL_FORM)
      setErrors({})
      setGlobalError('')
      setSelectedSkills([])
      setTimeout(() => firstInputRef.current?.focus(), 50)
      // Fetch skills list (only if not already loaded)
      if (skillsAll.length === 0) {
        setSkillsLoading(true)
        getSkills()
          .then(setSkillsAll)
          .catch(() => {})
          .finally(() => setSkillsLoading(false))
      }
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    if (isOpen) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => { const n = { ...prev }; delete n[name]; return n })
    if (globalError) setGlobalError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setErrors({})
    setGlobalError('')

    const payload = {
      title:       form.title,
      description: form.description,
      type:        form.type,
      deadline:    form.deadline,
      ...(form.location && { location: form.location }),
      ...(form.salary   && { salary:   parseFloat(form.salary) }),
      ...(selectedSkills.length > 0 && { skills: selectedSkills }),
    }

    try {
      const data = await createInternship(payload)
      onSuccess(data.internship)
    } catch (err) {
      const resData = err.response?.data
      if (err.response?.status === 422 && resData?.errors) {
        setErrors(resData.errors)
      } else {
        setGlobalError(resData?.message ?? 'Failed to create internship. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const fieldError = (name) =>
    errors[name] ? (
      <p style={{ color: 'var(--error)', fontSize: '0.78rem', marginTop: '0.3rem' }}>
        ✕ {errors[name][0]}
      </p>
    ) : null

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.2s ease',
        /* Flex centering — keeps the modal viewport-relative */
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
      }}
      onClick={onClose}
    >
      {/* ── Modal panel ───────────────────────────────────────────────────── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
        style={{
          /* Sizing — constrained to viewport with room for breathing */
          width: '100%',
          maxWidth: '560px',
          maxHeight: 'calc(100vh - 4rem)',
          /* Flex column so header/footer stay fixed and body scrolls */
          display: 'flex',
          flexDirection: 'column',
          /* Visual */
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '1.125rem',
          boxShadow: '0 8px 48px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.06)',
          animation: 'fadeInUp 0.25s cubic-bezier(0.16,1,0.3,1) both',
          overflow: 'hidden',
        }}
      >
        {/* ── Sticky header ───────────────────────────────────────────────── */}
        <div
          style={{
            flexShrink: 0,
            padding: '1.5rem 1.5rem 1rem',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: '#ffffff',
          }}
        >
          <div>
            <h2
              id="modal-title"
              style={{ color: '#0f172a', fontWeight: 700, fontSize: '1.125rem' }}
            >
              Post New Internship
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.8125rem', marginTop: '0.25rem' }}>
              Fill in the details below to publish a new listing
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: '#f1f5f9', border: '1px solid #e2e8f0',
              color: '#64748b', cursor: 'pointer',
              width: '2rem', height: '2rem', borderRadius: '0.5rem',
              fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#0f172a' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#64748b' }}
          >
            ✕
          </button>
        </div>

        {/* ── Scrollable form body ─────────────────────────────────────────── */}
        <form
          id="internship-form"
          onSubmit={handleSubmit}
          noValidate
          style={{
            flex: 1,           /* grows to fill available space     */
            overflowY: 'auto', /* scrolls when content exceeds height */
            padding: '1.25rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.125rem',
          }}
        >
          {globalError && (
            <div className="alert-error">
              ⚠ &nbsp;{globalError}
            </div>
          )}

          {/* Title */}
          <FormField label="Job Title" required error={fieldError('title')}>
            <input
              ref={firstInputRef}
              id="internship-title"
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Backend Developer Intern"
              className={`auth-input${errors.title ? ' error' : ''}`}
            />
          </FormField>

          {/* Description */}
          <FormField label="Description" required error={fieldError('description')}>
            <textarea
              id="internship-description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the role, responsibilities, and what you're looking for…"
              rows={4}
              className={`auth-input${errors.description ? ' error' : ''}`}
              style={{ resize: 'vertical', minHeight: '96px', fontFamily: 'inherit', lineHeight: 1.6 }}
            />
          </FormField>

          {/* Location + Type — side by side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
            <FormField label="Location" error={fieldError('location')}>
              <input
                id="internship-location"
                name="location"
                type="text"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g. London, UK"
                className={`auth-input${errors.location ? ' error' : ''}`}
              />
            </FormField>

            <FormField label="Work Type" required error={fieldError('type')}>
              <div style={{ position: 'relative' }}>
                <select
                  id="internship-type"
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className={`auth-input${errors.type ? ' error' : ''}`}
                  style={{ cursor: 'pointer', paddingRight: '2rem' }}
                >
                  <option value="remote">Remote</option>
                  <option value="on-site">On-site</option>
                  <option value="hybrid">Hybrid</option>
                </select>
                <span style={{
                  position: 'absolute', right: '0.75rem', top: '50%',
                  transform: 'translateY(-50%)', pointerEvents: 'none',
                  color: 'var(--text-muted)', fontSize: '0.7rem',
                }}>▼</span>
              </div>
            </FormField>
          </div>

          {/* Deadline + Salary — side by side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
            <FormField label="Application Deadline" required error={fieldError('deadline')}>
              <input
                id="internship-deadline"
                name="deadline"
                type="date"
                value={form.deadline}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className={`auth-input${errors.deadline ? ' error' : ''}`}
                style={{ colorScheme: 'dark' }}
              />
            </FormField>

            <FormField label="Monthly Salary (optional)" error={fieldError('salary')}>
              <input
                id="internship-salary"
                name="salary"
                type="number"
                min="0"
                step="50"
                value={form.salary}
                onChange={handleChange}
                placeholder="e.g. 1200"
                className={`auth-input${errors.salary ? ' error' : ''}`}
              />
            </FormField>
          </div>

          {/* Required Skills */}
          <FormField label="Required Skills (optional)" error={fieldError('skills')}>
            <div style={{ marginTop: '0.25rem' }}>
              <SkillPicker
                skills={skillsAll}
                selected={selectedSkills}
                onChange={setSelectedSkills}
                loading={skillsLoading}
                maxSelect={8}
              />
            </div>
          </FormField>
        </form>

        {/* ── Sticky footer (always visible) ──────────────────────────────── */}
        <div
          style={{
            flexShrink: 0,
            display: 'flex', gap: '0.75rem', justifyContent: 'flex-end',
            padding: '1rem 1.5rem 1.25rem',
            borderTop: '1px solid #f1f5f9',
            background: '#ffffff',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.6875rem 1.25rem', borderRadius: '0.5rem',
              border: '1px solid #e2e8f0',
              background: '#f8fafc', color: '#475569',
              fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = '#cbd5e1' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0' }}
          >
            Cancel
          </button>
          <button
            id="post-internship-submit"
            type="submit"
            form="internship-form"
            disabled={submitting}
            className="auth-btn"
            style={{ width: 'auto', padding: '0.6875rem 1.5rem' }}
            onClick={handleSubmit}
          >
            {submitting && <span className="spinner" />}
            {submitting ? 'Posting…' : 'Post Internship'}
          </button>
        </div>
      </div>
    </div>
  )

}

function FormField({ label, required, error, children }) {
  return (
    <div>
      <label
        style={{
          display: 'block', fontSize: '0.8125rem', fontWeight: 500,
          color: 'var(--text-subtle)', marginBottom: '0.4rem',
        }}
      >
        {label}
        {required && <span style={{ color: 'var(--accent)', marginLeft: '0.25rem' }}>*</span>}
      </label>
      {children}
      {error}
    </div>
  )
}
