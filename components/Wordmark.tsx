export default function Wordmark({ size = 'sm' }: { size?: 'sm' | 'lg' }) {
  const fs = size === 'lg' ? 14 : 12
  return (
    <span style={{ fontSize: fs, letterSpacing: '.06em', fontFamily: 'inherit' }}>
      <span style={{ color: 'var(--pink)' }}>›</span>
      T
      <span style={{ color: 'var(--cyan)', opacity: .35 }}>·</span>
      N
      <span style={{ color: 'var(--cyan)', opacity: .35 }}>·</span>
      E
      <span style={{ color: 'var(--cyan)', opacity: .35 }}>·</span>
      P.XYZ
      <span className="cursor" />
    </span>
  )
}
