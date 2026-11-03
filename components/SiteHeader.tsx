import Link from 'next/link'

const IG = 'https://instagram.com/theneverendingprompt.xyz'

export default function SiteHeader({ current }: { current?: 'gallery' | 'tree' }) {
  return (
    <header className="site-header">
      <Link href="/" className="site-mark" aria-label="TNEP — gallery">
        <span className="site-mark-chev">›</span>T·N·E·P
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
