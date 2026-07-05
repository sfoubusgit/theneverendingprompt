'use client'

import Link from 'next/link'

const LINKS = [
  { href: '/privacy', label: '// privacy' },
  { href: '/terms',   label: '// terms'   },
  { href: '/cookies', label: '// cookies' },
]

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--div)',
      padding: '32px 24px 40px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 16,
    }}>
      <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '.06em' }}>
        <span style={{ color: 'var(--t3)' }}>›</span>
        <span style={{ color: 'var(--cyan)' }}>T·N·E·P.XYZ</span>
        <span className="cursor" />
      </div>

      <p style={{
        fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase',
        color: 'var(--t4)', textAlign: 'center',
      }}>
        The prompt never dies.
      </p>

      <nav style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
        {LINKS.map(({ href, label }) => (
          <Link key={href} href={href} className="footer-link">
            {label}
          </Link>
        ))}
      </nav>

      <p style={{ fontSize: 10, color: 'var(--t5)', letterSpacing: '.08em' }}>
        © 2026 TNEP.XYZ
      </p>
    </footer>
  )
}
