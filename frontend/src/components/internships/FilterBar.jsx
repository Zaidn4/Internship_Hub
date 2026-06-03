/**
 * FilterBar — search input + type dropdown for the Internship Board.
 *
 * Props:
 *   filters  — { search: string, type: string }
 *   onChange — (newFilters) => void
 */
export default function FilterBar({ filters, onChange }) {
  const handleSearch = (e) =>
    onChange({ ...filters, search: e.target.value })

  const handleType = (e) =>
    onChange({ ...filters, type: e.target.value })

  return (
    <div
      style={{
        display: 'flex',
        gap: '0.75rem',
        flexWrap: 'wrap',
        marginBottom: '1.5rem',
      }}
    >
      {/* ── Search input ──────────────────────────────────────────────── */}
      <div style={{ position: 'relative', flex: '1 1 260px' }}>
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: '0.875rem',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '0.9rem',
            pointerEvents: 'none',
            color: 'var(--text-muted)',
          }}
        >
          🔍
        </span>
        <input
          id="internship-search"
          type="text"
          value={filters.search}
          onChange={handleSearch}
          placeholder="Search by title or company…"
          style={{
            width: '100%',
            padding: '0.65rem 0.875rem 0.65rem 2.4rem',
            borderRadius: '0.625rem',
            border: '1px solid var(--border)',
            background: 'var(--bg-surface)',
            color: 'var(--text-primary)',
            fontSize: '0.875rem',
            outline: 'none',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
            boxSizing: 'border-box',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--border-focus)'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-glow)' }}
          onBlur={(e)  => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none' }}
        />
      </div>

      {/* ── Type dropdown ─────────────────────────────────────────────── */}
      <div style={{ position: 'relative', minWidth: '160px' }}>
        <select
          id="internship-type-filter"
          value={filters.type}
          onChange={handleType}
          style={{
            width: '100%',
            padding: '0.65rem 2.25rem 0.65rem 0.875rem',
            borderRadius: '0.625rem',
            border: '1px solid var(--border)',
            background: 'var(--bg-surface)',
            color: 'var(--text-primary)',
            fontSize: '0.875rem',
            cursor: 'pointer',
            outline: 'none',
            appearance: 'none',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--border-focus)'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-glow)' }}
          onBlur={(e)  => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none' }}
        >
          <option value="all">All Types</option>
          <option value="remote">Remote</option>
          <option value="on-site">On-site</option>
          <option value="hybrid">Hybrid</option>
        </select>
        {/* Custom dropdown arrow */}
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            right: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            color: 'var(--text-muted)',
            fontSize: '0.7rem',
          }}
        >
          ▼
        </span>
      </div>
    </div>
  )
}
