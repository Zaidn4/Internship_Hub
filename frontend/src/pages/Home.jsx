import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

// ── Animation variants ────────────────────────────────────────────────────────

const fadeUp = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } },
}

const staggerContainer = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const cardVariant = {
  hidden:  { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
}

// ── Feature data ──────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: '🔒',
    title: 'Immutable CV Snapshots',
    body:  'Your CV is captured at the moment you apply — companies always review exactly what you submitted, no retroactive changes.',
    color: '#4f46e5',
    bg:    '#eef2ff',
  },
  {
    icon: '⚡',
    title: 'Real-Time Status Tracking',
    body:  'Watch your application status update live — pending, accepted, or rejected — from your personal dashboard.',
    color: '#d97706',
    bg:    '#fffbeb',
  },
  {
    icon: '🎯',
    title: 'Smart Skill Matching',
    body:  'Tag your skills on your profile and instantly see which internships are the best fit for your current expertise.',
    color: '#059669',
    bg:    '#ecfdf5',
  },
  {
    icon: '🏢',
    title: 'Verified Companies',
    body:  'Every company goes through our review process before they can post. No ghost listings, no spam.',
    color: '#7c3aed',
    bg:    '#f5f3ff',
  },
  {
    icon: '📋',
    title: 'One-Click Apply',
    body:  'Your profile is pre-filled with your university, bio, and CV. Apply to any internship in under 10 seconds.',
    color: '#db2777',
    bg:    '#fdf2f8',
  },
  {
    icon: '🌍',
    title: 'Remote-First Listings',
    body:  'Filter by remote, hybrid, or on-site instantly. Find opportunities that match your lifestyle and location.',
    color: '#0891b2',
    bg:    '#ecfeff',
  },
]

const STATS = [
  { value: '18+',  label: 'Active Listings'   },
  { value: '4',    label: 'Partner Companies'  },
  { value: '100%', label: 'Free Forever'       },
  { value: '< 10s', label: 'Time to Apply'    },
]

// ── Feature Card ──────────────────────────────────────────────────────────────

function FeatureCard({ icon, title, body, color, bg }) {
  return (
    <motion.div
      variants={cardVariant}
      whileHover={{ y: -5, transition: { duration: 0.2, ease: 'easeOut' } }}
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '1rem',
        padding: '1.625rem',
        cursor: 'default',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        transition: 'box-shadow 0.25s ease, border-color 0.25s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'
        e.currentTarget.style.borderColor = '#cbd5e1'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'
        e.currentTarget.style.borderColor = '#e2e8f0'
      }}
    >
      <div
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: '44px', height: '44px', borderRadius: '10px', marginBottom: '1rem',
          fontSize: '1.375rem', background: bg,
        }}
      >
        {icon}
      </div>
      <h3 style={{ color: '#0f172a', fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem', letterSpacing: '-0.01em' }}>
        {title}
      </h3>
      <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.65 }}>
        {body}
      </p>
    </motion.div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <div style={{ overflowX: 'hidden', background: '#f8fafc' }}>

      {/* ═══ HERO ═══════════════════════════════════════════════════════════ */}
      <section
        style={{
          position: 'relative',
          minHeight: '92vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '6rem 1.5rem 4rem',
          textAlign: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Light mesh gradient background */}
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          {/* Main soft gradient */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, #ffffff 0%, #eef2ff 40%, #f5f3ff 70%, #fdf4ff 100%)',
          }} />
          {/* Indigo radial bloom top-center */}
          <div style={{
            position: 'absolute', top: '-15%', left: '50%', transform: 'translateX(-50%)',
            width: '800px', height: '600px', borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(199,210,254,0.6) 0%, transparent 65%)',
          }} />
          {/* Violet hint right */}
          <div style={{
            position: 'absolute', top: '15%', right: '-5%',
            width: '400px', height: '400px', borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(221,214,254,0.45) 0%, transparent 70%)',
          }} />
          {/* Pink hint bottom-left */}
          <div style={{
            position: 'absolute', bottom: '5%', left: '-5%',
            width: '350px', height: '350px', borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(251,207,232,0.3) 0%, transparent 70%)',
          }} />
          {/* Subtle dot grid */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.07) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }} />
        </div>

        {/* Hero content */}
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '820px', width: '100%' }}>

          {/* Floating beta badge */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              marginBottom: '1.75rem',
              padding: '0.35rem 1rem',
              borderRadius: '999px',
              border: '1px solid #c7d2fe',
              background: 'rgba(238,242,255,0.9)',
              backdropFilter: 'blur(8px)',
              animation: 'float 3.5s ease-in-out infinite',
            }}
          >
            <span style={{ fontSize: '0.6rem', color: '#4f46e5' }}>✦</span>
            <span style={{ fontSize: '0.8125rem', color: '#4338ca', fontWeight: 500, letterSpacing: '0.02em' }}>
              Now in Beta · 100% Free for Students
            </span>
            <span style={{
              padding: '0.1rem 0.5rem', borderRadius: '999px', fontSize: '0.65rem',
              fontWeight: 700, letterSpacing: '0.05em',
              background: '#4f46e5', color: '#ffffff',
            }}>
              NEW
            </span>
          </motion.div>

          {/* Main headline */}
          <motion.div variants={staggerContainer} initial="hidden" animate="visible">
            <motion.h1
              variants={fadeUp}
              style={{
                fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                fontWeight: 800,
                lineHeight: 1.08,
                letterSpacing: '-0.035em',
                color: '#0f172a',
                marginBottom: '1.25rem',
              }}
            >
              Find Your{' '}
              <span style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #a21caf 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Dream Internship.
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              style={{
                fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
                color: '#475569',
                lineHeight: 1.65,
                maxWidth: '580px',
                margin: '0 auto 2.5rem',
                fontWeight: 400,
              }}
            >
              The platform built for ambitious students and fast-moving companies.
              Apply in seconds, track your status in real time, and land the role you deserve.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              variants={fadeUp}
              style={{ display: 'flex', gap: '0.875rem', justifyContent: 'center', flexWrap: 'wrap' }}
            >
              <Link
                id="hero-browse"
                to="/student/internships"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.875rem 2rem', borderRadius: '0.75rem',
                  background: 'var(--accent)', color: '#fff',
                  fontWeight: 700, fontSize: '1rem', textDecoration: 'none',
                  boxShadow: '0 4px 16px rgba(79,70,229,0.35)',
                  transition: 'all 0.2s ease', letterSpacing: '-0.01em',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--accent-hover)'
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(79,70,229,0.45)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--accent)'
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(79,70,229,0.35)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                Browse Internships
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>

              <Link
                id="hero-post"
                to="/register"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.875rem 2rem', borderRadius: '0.75rem',
                  border: '1px solid #e2e8f0',
                  background: '#ffffff', color: '#0f172a',
                  fontWeight: 600, fontSize: '1rem', textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#cbd5e1'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0'
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                🏢 Post an Internship
              </Link>
            </motion.div>
          </motion.div>

          {/* Scroll chevron */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            style={{ marginTop: '4rem', color: '#94a3b8', fontSize: '0.75rem' }}
          >
            <div style={{ animation: 'float 2s ease-in-out infinite' }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" style={{ margin: '0 auto', display: 'block' }}>
                <path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ STATS BAR ══════════════════════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6 }}
        style={{
          borderTop: '1px solid #e2e8f0',
          borderBottom: '1px solid #e2e8f0',
          background: '#ffffff',
          padding: '2.25rem 1.5rem',
        }}
      >
        <div style={{
          maxWidth: '900px', margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1rem', textAlign: 'center',
        }}>
          {STATS.map(({ value, label }) => (
            <div key={label}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', lineHeight: 1 }}>
                {value}
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.375rem' }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ═══ FEATURE SHOWCASE ═══════════════════════════════════════════════ */}
      <section style={{ padding: '6rem 1.5rem', maxWidth: '1200px', margin: '0 auto' }}>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ textAlign: 'center', marginBottom: '3.5rem' }}
        >
          <p style={{
            display: 'inline-block',
            fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: 'var(--accent)',
            marginBottom: '0.875rem',
          }}>
            Why InternshipHub
          </p>
          <h2 style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
            fontWeight: 800, letterSpacing: '-0.03em',
            color: '#0f172a', lineHeight: 1.15,
            maxWidth: '560px', margin: '0 auto 1rem',
          }}>
            Everything you need to land the role.
          </h2>
          <p style={{ color: '#475569', fontSize: '1.0625rem', maxWidth: '480px', margin: '0 auto', lineHeight: 1.6 }}>
            Built specifically for students and growing tech companies, with features that actually matter.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {FEATURES.map((feat) => (
            <FeatureCard key={feat.title} {...feat} />
          ))}
        </motion.div>
      </section>

      {/* ═══ BOTTOM CTA ═════════════════════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        style={{
          padding: '5rem 1.5rem 6rem', textAlign: 'center',
          background: '#ffffff',
          borderTop: '1px solid #e2e8f0',
        }}
      >
        <h2 style={{
          fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800,
          letterSpacing: '-0.03em', color: '#0f172a',
          marginBottom: '1rem', lineHeight: 1.15,
        }}>
          Ready to take the next step?
        </h2>
        <p style={{ color: '#64748b', fontSize: '1.0625rem', marginBottom: '2rem', lineHeight: 1.6 }}>
          Join hundreds of students already using InternshipHub to build their careers.
        </p>
        <div style={{ display: 'flex', gap: '0.875rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            id="bottom-cta-student"
            to="/register"
            style={{
              padding: '0.875rem 2.25rem', borderRadius: '0.75rem',
              background: 'var(--accent)', color: '#fff',
              fontWeight: 700, fontSize: '1rem', textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(79,70,229,0.35)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--accent-hover)'
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(79,70,229,0.45)'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--accent)'
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(79,70,229,0.35)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            Create Free Account
          </Link>
          <Link
            id="bottom-cta-login"
            to="/login"
            style={{
              padding: '0.875rem 2rem', borderRadius: '0.75rem',
              border: '1px solid #e2e8f0',
              background: '#f8fafc', color: '#0f172a',
              fontWeight: 600, fontSize: '1rem', textDecoration: 'none',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#cbd5e1'
              e.currentTarget.style.background = '#ffffff'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e2e8f0'
              e.currentTarget.style.background = '#f8fafc'
            }}
          >
            Sign in instead
          </Link>
        </div>
      </motion.section>

      {/* ═══ FOOTER ═════════════════════════════════════════════════════════ */}
      <footer style={{
        borderTop: '1px solid #e2e8f0',
        padding: '1.75rem 1.5rem',
        background: '#f8fafc',
        textAlign: 'center',
        color: '#64748b',
        fontSize: '0.8125rem',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <span>© 2025 <strong style={{ color: '#475569' }}>InternshipHub</strong> · All rights reserved.</span>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            {['Browse Internships', 'For Companies', 'Log in', 'Register'].map((item, i) => {
              const paths = ['/student/internships', '/register', '/login', '/register']
              return (
                <Link key={item} to={paths[i]} style={{ color: '#64748b', textDecoration: 'none', transition: 'color 0.15s ease' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#0f172a')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
                >
                  {item}
                </Link>
              )
            })}
          </div>
        </div>
      </footer>

    </div>
  )
}
