import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service — TNEP.XYZ',
  description: 'Rules for participating in The Never Ending Prompt.',
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
    background: 'var(--lT1)', border: '1px solid rgba(250,204,21,.12)',
    borderLeft: '2px solid rgba(250,204,21,.4)',
    borderRadius: 4, padding: '14px 18px', marginBottom: 16,
    fontSize: 13, lineHeight: 1.7, color: 'var(--t2)',
  } as React.CSSProperties,
}

export default function TermsPage() {
  return (
    <main style={S.page}>
      <p style={S.eyebrow}>// legal</p>
      <h1 style={S.h1}>Terms of Service</h1>
      <p style={S.meta}>Effective: 1 July 2026 &nbsp;·&nbsp; theneverendingprompt.xyz</p>

      <div style={S.highlight}>
        TNEP.XYZ is a creative experiment. By participating you agree to keep it a constructive,
        open space for language and ideas. These terms are intentionally brief.
      </div>

      <div style={S.section}>
        <h2 style={S.h2}>1. What TNEP is</h2>
        <p style={S.p}>
          The Never Ending Prompt is a community game where participants submit mutations of a daily
          seed prompt. The community votes, and the winning mutation becomes the next round&rsquo;s prompt.
          The chain never ends — each round is a continuation of the one before it.
        </p>
        <p style={S.p}>
          Participation is free and requires no account. By submitting a prompt or casting a vote you
          agree to these terms.
        </p>
      </div>

      <div style={S.section}>
        <h2 style={S.h2}>2. Submitted content</h2>
        <p style={S.p}>
          You retain ownership of any prompt you submit. By submitting, you grant TNEP.XYZ a
          worldwide, royalty-free, perpetual licence to display, reproduce, and use your submission
          as part of the project — including on the website, in the prompt chain history, and in
          AI-generated images posted to social media.
        </p>
        <p style={S.p}>
          This licence is necessary because the chain is permanent by design: a round&rsquo;s winning
          prompt becomes the foundation for all future rounds.
        </p>
      </div>

      <div style={S.section}>
        <h2 style={S.h2}>3. Content rules</h2>
        <p style={S.p}>Do not submit content that:</p>
        <ul style={S.ul}>
          {[
            'Is hateful, discriminatory, or targeted at an individual.',
            'Is sexually explicit or violent in a gratuitous way.',
            'Infringes a third party\'s copyright or intellectual property.',
            'Contains personal information about a real person without consent.',
            'Is spam, coordinated manipulation, or an attempt to game the vote.',
            'Violates any applicable law.',
          ].map(item => (
            <li key={item} style={S.li}>
              <span style={{ position: 'absolute', left: 0, color: 'var(--t4)' }}>—</span>
              {item}
            </li>
          ))}
        </ul>
        <p style={S.p}>
          We reserve the right to remove any submission without notice and to block a voter ID from
          future participation.
        </p>
      </div>

      <div style={S.section}>
        <h2 style={S.h2}>4. Voting</h2>
        <p style={S.p}>
          Each visitor may cast one vote per round, tracked by an anonymous voter ID stored in your
          browser. Using automation, VPNs, or other means to cast multiple votes is a breach of
          these terms and may result in all votes from the affected IDs being removed.
        </p>
      </div>

      <div style={S.section}>
        <h2 style={S.h2}>5. The prompt chain and resets</h2>
        <p style={S.p}>
          Occasionally the chain is deliberately reset — a new &ldquo;seed&rdquo; prompt is planted and the
          count returns to Round 1. This is a creative decision, not a deletion of history. Past
          rounds remain archived on the site.
        </p>
      </div>

      <div style={S.section}>
        <h2 style={S.h2}>6. AI-generated content</h2>
        <p style={S.p}>
          Round images are generated by AI systems (including Stable Diffusion via ComfyUI and
          Anthropic&rsquo;s Claude API). These images are not human-authored and may not always represent
          the intent of a submitted prompt. They are produced for creative and experimental purposes.
        </p>
        <p style={S.p}>
          We do not claim copyright over AI-generated images; their legal status is evolving. If you
          believe an image infringes your rights, contact us.
        </p>
      </div>

      <div style={S.section}>
        <h2 style={S.h2}>7. Availability and modifications</h2>
        <p style={S.p}>
          TNEP.XYZ is provided &ldquo;as is&rdquo; without warranty. We may modify, suspend, or terminate
          the service at any time. We may update these terms; continued participation after an update
          constitutes acceptance.
        </p>
      </div>

      <div style={S.section}>
        <h2 style={S.h2}>8. Age requirement</h2>
        <p style={S.p}>
          You must be at least 13 years old to participate. If you are under 18, please ensure a
          parent or guardian is aware of your participation.
        </p>
      </div>

      <div style={S.section}>
        <h2 style={S.h2}>9. Limitation of liability</h2>
        <p style={S.p}>
          To the maximum extent permitted by law, TNEP.XYZ shall not be liable for any indirect,
          incidental, or consequential damages arising from your use of the service or the content
          generated by it.
        </p>
      </div>

      <div style={S.section}>
        <h2 style={S.h2}>10. Contact</h2>
        <p style={S.p}>
          Questions about these terms:{' '}
          <a href="mailto:contact@theneverendingprompt.xyz"
            style={{ color: 'var(--cyan)', textDecoration: 'none' }}>
            contact@theneverendingprompt.xyz
          </a>
        </p>
      </div>

      <hr style={S.rule} />

      <nav style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        {[['/', '← home'], ['/privacy', '// privacy'], ['/cookies', '// cookies']].map(([href, label]) => (
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
