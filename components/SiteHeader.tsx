import Link from 'next/link'

const IG = 'https://instagram.com/theneverendingprompt.xyz'

/**
 * Horizontal lockup: the v4 mark (small cut, public/logo/v4/tnep-mark-small.svg) + TNEP.
 * One SVG so the proportions never drift: the word sits on the mark's ground line,
 * cap height = 55% of the mark, width locked with textLength (font-independent).
 */
function Lockup() {
  return (
    <svg className="site-mark-svg" viewBox="194 184 2708 686" aria-hidden="true">
      <path d="M240,870 V530 A300,300 0 0 1 840,530 V870" fill="none" stroke="currentColor" strokeWidth="92" strokeLinejoin="round" />
      <path d="M360,870 V590 A180,180 0 0 1 720,590 V870" fill="none" stroke="currentColor" strokeWidth="80" strokeLinejoin="round" />
      <path d="M440,870 V680 A100,100 0 0 1 640,680 V870 Z" fill="var(--cyan)" />
      <text x="1106" y="870" fontFamily="'Courier New', Courier, monospace" fontWeight="700" fontSize="661"
        fill="currentColor" textLength="1796" lengthAdjust="spacing">TNEP</text>
    </svg>
  )
}

export default function SiteHeader({ current }: { current?: 'gallery' | 'tree' }) {
  return (
    <header className="site-header">
      <Link href="/" className="site-mark" aria-label="TNEP — gallery">
        <Lockup />
      </Link>
      <nav aria-label="Main">
        <Link href="/" aria-current={current === 'gallery' ? 'page' : undefined}>gallery</Link>
        <Link href="/tree" aria-current={current === 'tree' ? 'page' : undefined}>tree</Link>
        <a href={IG} target="_blank" rel="noopener noreferrer">instagram ↗</a>
      </nav>
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <span>The prompt never dies.</span>
      <span>
        <Link href="/privacy">privacy</Link>
        <Link href="/terms">terms</Link>
      </span>
    </footer>
  )
}
