import { useTranslation } from 'react-i18next'

const LANGUAGES = [
  { code: 'en', label: 'EN', flag: '🇬🇧' },
  { code: 'fr', label: 'FR', flag: '🇫🇷' },
]

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const currentLng = i18n.language?.slice(0, 2) // normalise e.g. 'en-GB' → 'en'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
      {LANGUAGES.map((lng) => {
        const isActive = currentLng === lng.code
        return (
          <button
            key={lng.code}
            onClick={() => i18n.changeLanguage(lng.code)}
            title={`Switch to ${lng.label}`}
            style={{
              padding: '0.25rem 0.5rem',
              borderRadius: '0.375rem',
              border: isActive ? '1px solid var(--accent)' : '1px solid transparent',
              background: isActive ? 'rgba(79,70,229,0.1)' : 'transparent',
              color: isActive ? 'var(--accent)' : 'var(--text-muted)',
              fontSize: '0.75rem',
              fontWeight: isActive ? 700 : 500,
              cursor: isActive ? 'default' : 'pointer',
              transition: 'all 0.15s ease',
              letterSpacing: '0.04em',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = 'rgba(79,70,229,0.06)'
                e.currentTarget.style.color = 'var(--text-subtle)'
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = 'var(--text-muted)'
              }
            }}
          >
            <span>{lng.flag}</span>
            {lng.label}
          </button>
        )
      })}
    </div>
  )
}
