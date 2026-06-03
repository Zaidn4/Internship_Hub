/**
 * SkillPicker — shared multi-select pill component.
 *
 * Props:
 *   skills       {Array<{id, name}>}  — full list of available skills (from API)
 *   selected     {number[]}           — array of currently selected skill IDs
 *   onChange     {(ids: number[]) => void} — called with the new selected IDs
 *   loading      {boolean}            — show skeleton pills while skills load
 *   label        {string}             — optional section label
 *   maxSelect    {number}             — optional max selection count (default unlimited)
 */
export default function SkillPicker({ skills = [], selected = [], onChange, loading = false, label, maxSelect }) {
  const toggle = (id) => {
    if (selected.includes(id)) {
      // Deselect
      onChange(selected.filter((s) => s !== id))
    } else {
      // Select — respect maxSelect if provided
      if (maxSelect && selected.length >= maxSelect) return
      onChange([...selected, id])
    }
  }

  return (
    <div>
      {label && (
        <p style={{
          color: 'var(--text-muted)', fontSize: '0.8125rem',
          fontWeight: 500, marginBottom: '0.625rem',
        }}>
          {label}
          {maxSelect && (
            <span style={{ color: 'var(--text-muted)', fontWeight: 400, marginLeft: '0.375rem' }}>
              (max {maxSelect})
            </span>
          )}
        </p>
      )}

      {/* Skeleton state */}
      {loading && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {[80, 60, 90, 70, 100, 55, 75, 65].map((w, i) => (
            <div
              key={i}
              style={{
                height: '1.875rem', width: w,
                borderRadius: '999px',
                background: '#f1f5f9',
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
          ))}
        </div>
      )}

      {/* Pill grid */}
      {!loading && (
        <div
          role="group"
          aria-label={label ?? 'Skill selector'}
          style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}
        >
          {skills.map((skill) => {
            const isSelected = selected.includes(skill.id)
            const isDisabled = !isSelected && maxSelect && selected.length >= maxSelect

            return (
              <button
                key={skill.id}
                type="button"
                onClick={() => toggle(skill.id)}
                disabled={!!isDisabled}
                aria-pressed={isSelected}
                style={{
                  padding: '0.3rem 0.75rem',
                  borderRadius: '999px',
                  fontSize: '0.78rem',
                  fontWeight: isSelected ? 600 : 400,
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  border: `1px solid ${isSelected ? '#a5b4fc' : '#e2e8f0'}`,
                  background: isSelected ? '#eef2ff' : '#ffffff',
                  color: isSelected ? '#4f46e5' : '#64748b',
                  opacity: isDisabled ? 0.4 : 1,
                  transition: 'all 0.15s ease',
                  display: 'flex', alignItems: 'center', gap: '0.3rem',
                  whiteSpace: 'nowrap',
                  userSelect: 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isDisabled && !isSelected) {
                    e.currentTarget.style.borderColor = '#c7d2fe'
                    e.currentTarget.style.color = '#4f46e5'
                    e.currentTarget.style.background = '#f5f3ff'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = '#e2e8f0'
                    e.currentTarget.style.color = '#64748b'
                    e.currentTarget.style.background = '#ffffff'
                  }
                }}
              >
                {isSelected && (
                  <span style={{ fontSize: '0.65rem', lineHeight: 1 }}>✓</span>
                )}
                {skill.name}
              </button>
            )
          })}

          {/* Empty state */}
          {skills.length === 0 && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', fontStyle: 'italic' }}>
              No skills available.
            </p>
          )}
        </div>
      )}

      {/* Selection counter */}
      {!loading && selected.length > 0 && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: '0.5rem' }}>
          {selected.length} selected
          {maxSelect ? ` / ${maxSelect}` : ''}
          {' · '}
          <button
            type="button"
            onClick={() => onChange([])}
            style={{
              background: 'none', border: 'none', padding: 0,
              color: 'var(--text-muted)', fontSize: 'inherit',
              textDecoration: 'underline', cursor: 'pointer',
            }}
          >
            Clear all
          </button>
        </p>
      )}
    </div>
  )
}
