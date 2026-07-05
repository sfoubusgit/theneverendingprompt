import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Cookie & Storage Policy — TNEP.XYZ',
  description: 'How The Never Ending Prompt uses browser storage.',
}

const S = {
  page: {
    maxWidth: 680,
    margin: '0 auto',
    padding: '64px 24px 80px',
  } as React.CSSProperties,
  eyebrow: {
    fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase' as const,
    color: 'var(--pink)', marginBottom: 10,
  },
  h1: {
    fontSize: 26, fontWeight: 700, letterSpacing: '.04em',
    color: 'var(--t1)', lineHeight: 1.2, marginBottom: 8,
  },
  meta: {
    fontSize: 11, color: 'var(--t4)', letterSpacing: '.06em',
    marginBottom: 48,
  },
  section: { marginBottom: 40 },
  h2: {
    fontSize: 11, fontWeight: 700, letterSpacing: '.14em',
    textTransform: 'uppercase' as const, color: 'var(--cyan)',
    marginBottom: 14,
  },
  p: {
    fontSize: 13, lineHeight: 1.75, color: 'var(--t2)',
    marginBottom: 12,
  },
  table: {
    width: '100%', borderCollapse: 'collapse' as const,
    fontSize: 12, marginBottom: 16,
  },
  th: {
    textAlign: 'left' as const, fontSize: 10, letterSpacing: '.1em',
    textTransform: 'uppercase' as const, color: 'var(--t4)',
    padding: '0 14px 10px 0', borderBottom: '1px solid var(--div)',
  },
  td: {
    padding: '10px 14px 10px 0', borderBottom: '1px solid var(--div)',
    color: 'var(--t2)', verticalAlign: 'top' as const,
  },
  rule: {
    border: 'none', borderTop: '1px solid var(--div)', margin: '40px 0',
  },
  highlight: {
    background: 'var(--cT1)', border: '1px solid var(--divC)',
    borderLeft: '2px solid var(--cyan)',
    borderRadius: 4, padding: '14px 18px', marginBottom: 16,
    fontSize: 13, lineHeight: 1.7, color: 'var(--t2)',
  } as React.CSSProperties,
}

export default function CookiesPage() {
  return (
    <main style={S.page}>
      <p style={S.eyebrow}>// legal</p>
      <h1 style={S.h1}>Cookie & Storage Policy</h1>
      <p style={S.meta}>Effective: 1 July 2026 &nbsp;·&nbsp; theneverendingprompt.xyz</p>

      <div style={S.highlight}>
        TNEP.XYZ does not use advertising cookies or tracking pixels.
        We use one item of browser localStorage — a random ID that lets you vote — and nothing else.
      </div>

      <div style={S.section}>
        <h2 style={S.h2}>What is localStorage?</h2>
        <p style={S.p}>
          localStorage is a browser feature that lets a website save small amounts of data on your
          device. Unlike a cookie, localStorage data is not sent to the server on every request —
          it stays on your machine unless the site explicitly reads it. It has no expiry date and
          persists until you clear your browser storage.
        </p>
      </div>

      <div style={S.section}>
        <h2 style={S.h2}>What we store</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Key</th>
                <th style={S.th}>Value</th>
                <th style={S.th}>Purpose</th>
                <th style={S.th}>Expiry</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ ...S.td, color: 'var(--lamp)', fontFamily: 'monospace' }}>
                  voter_id
                </td>
                <td style={S.td}>Random UUID (e.g. <code style={{ color: 'var(--t3)', fontSize: 11 }}>a3f2…</code>)</td>
                <td style={S.td}>Allows one vote per round without requiring an account.</td>
                <td style={S.td}>Until you clear browser storage</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p style={S.p}>
          That is the complete list. We do not set HTTP cookies, session storage, or IndexedDB entries.
        </p>
      </div>

      <div style={S.section}>
        <h2 style={S.h2}>Third-party scripts</h2>
        <p style={S.p}>
          We do not load third-party advertising, analytics, or tracking scripts. There are no Google
          Analytics, Meta Pixel, or similar trackers on this site.
        </p>
        <p style={S.p}>
          Third-party services we use (Supabase, Cloudinary, Vercel) may set their own infrastructure
          cookies for security or performance purposes — we have no control over these. Refer to their
          respective privacy policies for details.
        </p>
      </div>

      <div style={S.section}>
        <h2 style={S.h2}>How to clear your data</h2>
        <p style={S.p}>
          You can delete your voter ID at any time by clearing site data in your browser:
        </p>
        <p style={S.p}>
          <strong style={{ color: 'var(--t1)' }}>Chrome / Edge:</strong> Settings → Privacy and security
          → Clear browsing data → Cookies and other site data.
        </p>
        <p style={S.p}>
          <strong style={{ color: 'var(--t1)' }}>Firefox:</strong> Settings → Privacy & Security →
          Cookies and Site Data → Clear Data.
        </p>
        <p style={S.p}>
          <strong style={{ color: 'var(--t1)' }}>Safari:</strong> Settings → Privacy → Manage Website Data.
        </p>
        <p style={S.p}>
          After clearing, a new voter ID will be created automatically on your next visit. Any votes
          previously cast under the old ID cannot be recovered or transferred.
        </p>
      </div>

      <div style={S.section}>
        <h2 style={S.h2}>Contact</h2>
        <p style={S.p}>
          Questions:{' '}
          <a href="mailto:contact@theneverendingprompt.xyz"
            style={{ color: 'var(--cyan)', textDecoration: 'none' }}>
            contact@theneverendingprompt.xyz
          </a>
        </p>
      </div>

      <hr style={S.rule} />

      <nav style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        {[['/', '← home'], ['/privacy', '// privacy'], ['/terms', '// terms']].map(([href, label]) => (
          <Link key={href} href={href} style={{
            fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase',
            color: 'var(--t4)', textDecoration: 'none',
          }}>
            {label}
          </Link>
        ))}
      </nav>
    </main>
  )
}
