import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy — TNEP.XYZ',
  description: 'How The Never Ending Prompt collects and uses your data.',
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
  ul: {
    listStyle: 'none', padding: 0, margin: '0 0 12px',
  },
  li: {
    fontSize: 13, lineHeight: 1.75, color: 'var(--t2)',
    paddingLeft: 18, marginBottom: 6, position: 'relative' as const,
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

export default function PrivacyPage() {
  return (
    <main style={S.page}>
      <p style={S.eyebrow}>// legal</p>
      <h1 style={S.h1}>Privacy Policy</h1>
      <p style={S.meta}>Effective: 1 July 2026 &nbsp;·&nbsp; theneverendingprompt.xyz</p>

      <div style={S.highlight}>
        TNEP.XYZ is a community creative game. We collect the minimum data necessary to run the
        game — no accounts, no passwords, no advertising trackers.
      </div>

      <div style={S.section}>
        <h2 style={S.h2}>1. Who we are</h2>
        <p style={S.p}>
          The Never Ending Prompt (&ldquo;TNEP&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) is an experimental
          community AI-art project available at theneverendingprompt.xyz. The project is operated by an
          independent creator based in France.
        </p>
        <p style={S.p}>
          Contact: <a href="mailto:contact@theneverendingprompt.xyz"
            style={{ color: 'var(--cyan)', textDecoration: 'none' }}>
            contact@theneverendingprompt.xyz
          </a>
        </p>
      </div>

      <div style={S.section}>
        <h2 style={S.h2}>2. Data we collect</h2>

        <p style={S.p}><strong style={{ color: 'var(--t1)' }}>Anonymous voter ID</strong></p>
        <p style={S.p}>
          When you first visit the site we generate a random UUID and store it in your browser&rsquo;s
          localStorage under the key <code style={{ color: 'var(--lamp)' }}>voter_id</code>. This ID lets
          you vote once per round without creating an account. It never leaves your device except as part
          of your vote record; it is not linked to your name, email, or IP address. Clearing your
          browser storage removes it permanently.
        </p>

        <p style={S.p}><strong style={{ color: 'var(--t1)' }}>Prompt submissions</strong></p>
        <p style={S.p}>
          When you submit a prompt mutation we store: the text of your prompt, the mutation type
          (Mutate or Extend), your voter ID, an optional display name you choose, and a timestamp.
          Display names are public — if you enter a real name it will be visible on the site.
        </p>

        <p style={S.p}><strong style={{ color: 'var(--t1)' }}>Votes</strong></p>
        <p style={S.p}>
          Each vote record stores: the submission ID voted on, your voter ID, the round ID, and a
          timestamp. We use this to enforce one vote per round and to rank submissions.
        </p>

        <p style={S.p}><strong style={{ color: 'var(--t1)' }}>What we do NOT collect</strong></p>
        <ul style={S.ul}>
          {[
            'Email addresses or passwords — there are no user accounts.',
            'Real names — display name is optional and free-text.',
            'Payment information — the game is free.',
            'Location data or IP addresses — we do not log request IPs.',
            'Behavioural tracking cookies or advertising pixels.',
          ].map(item => (
            <li key={item} style={S.li}>
              <span style={{ position: 'absolute', left: 0, color: 'var(--t4)' }}>—</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div style={S.section}>
        <h2 style={S.h2}>3. How we use your data</h2>
        <ul style={S.ul}>
          {[
            'To display and rank submissions within each round.',
            'To prevent duplicate voting within a round (via voter_id).',
            'To generate the AI-produced winner image posted to Instagram.',
            'To build the historical chain of prompts shown on the site.',
          ].map(item => (
            <li key={item} style={S.li}>
              <span style={{ position: 'absolute', left: 0, color: 'var(--cyan)' }}>›</span>
              {item}
            </li>
          ))}
        </ul>
        <p style={S.p}>
          We do not sell, rent, or share your data with third parties for marketing purposes.
        </p>
      </div>

      <div style={S.section}>
        <h2 style={S.h2}>4. Third-party services</h2>
        <p style={S.p}>
          We use the following third-party services. Each has its own privacy policy.
        </p>
        <ul style={S.ul}>
          {[
            ['Supabase', 'Database and API hosting. Stores submissions and votes. Data is hosted in the EU (Frankfurt).'],
            ['Cloudinary', 'Image hosting and CDN. Stores AI-generated round images.'],
            ['Instagram / Meta', 'We post winner images to our public Instagram account (@theneverendingprompt.xyz). Meta collects data about people who interact with those posts per their own privacy policy.'],
            ['Vercel', 'Website hosting. Vercel may collect minimal infrastructure logs (request metadata).'],
            ['Anthropic API', 'Used server-side to generate captions and seed prompts. Submitted prompts are not sent to Anthropic; only our internal system prompts are used.'],
          ].map(([name, desc]) => (
            <li key={name as string} style={{ ...S.li, marginBottom: 10 }}>
              <span style={{ position: 'absolute', left: 0, color: 'var(--t4)' }}>—</span>
              <strong style={{ color: 'var(--t1)' }}>{name as string}:</strong>{' '}
              {desc as string}
            </li>
          ))}
        </ul>
      </div>

      <div style={S.section}>
        <h2 style={S.h2}>5. Data retention</h2>
        <p style={S.p}>
          Submissions and votes are retained indefinitely to preserve the prompt chain history — this
          is a core part of the project. If you want a submission removed, contact us and we will
          remove the content while keeping an anonymised record for chain continuity.
        </p>
        <p style={S.p}>
          Your voter ID exists only in your browser. We have no way to link it to you after the fact.
        </p>
      </div>

      <div style={S.section}>
        <h2 style={S.h2}>6. Your rights (GDPR / EEA)</h2>
        <p style={S.p}>
          If you are in the European Economic Area you have the right to access, correct, or request
          deletion of your personal data. Because we do not collect email addresses, the only personal
          data that could be yours is a display name you voluntarily submitted. To exercise your rights,
          email us at{' '}
          <a href="mailto:contact@theneverendingprompt.xyz"
            style={{ color: 'var(--cyan)', textDecoration: 'none' }}>
            contact@theneverendingprompt.xyz
          </a>.
        </p>
      </div>

      <div style={S.section}>
        <h2 style={S.h2}>7. Changes to this policy</h2>
        <p style={S.p}>
          We may update this policy as the project evolves. Material changes will be noted at the top
          of this page with a new effective date. Continued use of the site after changes constitutes
          acceptance.
        </p>
      </div>

      <hr style={S.rule} />

      <nav style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        {[['/', '← home'], ['/terms', '// terms'], ['/cookies', '// cookies']].map(([href, label]) => (
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
