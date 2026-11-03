'use client'

import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react'
import Link from 'next/link'
import type { GalleryPost } from '@/lib/posts'
import { sized } from '@/lib/img'

export const pad = (n: number) => String(n).padStart(3, '0')

function lineage(p: GalleryPost) {
  if (p.fromDay) return { text: `evolved from day ${p.fromDay}`, day: p.fromDay }
  if (p.splitFrom) return { text: `first post of branch ${p.letter} · split from branch ${p.splitFrom}`, day: null }
  return { text: `first post of branch ${p.letter}`, day: null }
}

/** Shown when a post has no stored image yet — styled like the Instagram card. */
export function TextTile({ post }: { post: GalleryPost }) {
  return (
    <div className="g-text-tile">
      <span className="g-text-tile-day">DAY_{pad(post.day)} · {post.letter}</span>
      <p>{post.prompt}</p>
    </div>
  )
}

const onHashChange = (cb: () => void) => {
  window.addEventListener('hashchange', cb)
  return () => window.removeEventListener('hashchange', cb)
}

/** The URL hash (#day-42, #branch-B) is the source of truth, so every view can be shared. */
export function useHash(): [string, (hash: string) => void] {
  const hash = useSyncExternalStore(onHashChange, () => location.hash, () => '')
  const setHash = useCallback((next: string) => {
    history.replaceState(null, '', next || location.pathname)
    window.dispatchEvent(new HashChangeEvent('hashchange'))
  }, [])
  return [hash, setHash]
}

/** Which post is open (#day-N). `posts` must be newest first; ← / → step to newer / older. */
export function useViewer(posts: GalleryPost[]) {
  const [hash, setHash] = useHash()
  const m = hash.match(/^#day-(\d+)$/)
  const idx = m ? posts.findIndex(p => p.day === Number(m[1])) : -1
  const open = idx >= 0 ? idx : null

  const show = useCallback((i: number | null) => {
    setHash(i === null ? '' : `#day-${posts[i].day}`)
  }, [posts, setHash])

  const showDay = useCallback((day: number) => setHash(`#day-${day}`), [setHash])

  return { open, show, showDay }
}

export default function PostViewer({ posts, open, show, showDay }: {
  posts: GalleryPost[]
} & ReturnType<typeof useViewer>) {
  const touchX = useRef<number | null>(null)

  const step = useCallback((dir: 1 | -1) => {
    if (open === null) return
    const next = open + dir
    if (next >= 0 && next < posts.length) show(next)
  }, [open, posts.length, show])

  useEffect(() => {
    if (open === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') show(null)
      if (e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowLeft') step(-1)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, show, step])

  if (open === null) return null
  const post = posts[open]
  const from = lineage(post)

  return (
    <div
      className="g-view"
      role="dialog"
      aria-modal="true"
      aria-label={`Day ${post.day}`}
      onClick={e => { if (e.target === e.currentTarget) show(null) }}
      onTouchStart={e => { touchX.current = e.touches[0].clientX }}
      onTouchEnd={e => {
        if (touchX.current === null) return
        const dx = e.changedTouches[0].clientX - touchX.current
        if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1)
        touchX.current = null
      }}
    >
      <button className="g-close" onClick={() => show(null)} aria-label="Close">✕</button>
      {open > 0 && (
        <button className="g-arrow g-arrow-l" onClick={() => step(-1)} aria-label="Newer">‹</button>
      )}
      {open < posts.length - 1 && (
        <button className="g-arrow g-arrow-r" onClick={() => step(1)} aria-label="Older">›</button>
      )}

      <figure className="g-figure">
        {post.imageUrl && (
          <div className="g-figure-img">
            <img key={post.id} src={sized(post.imageUrl, 1080)} alt={post.prompt} />
          </div>
        )}
        <figcaption>
          <div className="g-meta">
            <span className="g-meta-day">DAY_{pad(post.day)} · BRANCH {post.letter}</span>
            <span className="g-meta-date">{post.createdAt.slice(0, 10).replaceAll('-', '.')}</span>
          </div>
          <p className="g-prompt">{post.prompt}</p>
          <div className="g-links">
            {from.day
              ? <button onClick={() => showDay(from.day!)}>↳ {from.text}</button>
              : <span>↳ {from.text}</span>}
            <span className="g-links-right">
              <Link href={`/tree#branch-${post.letter}`} onClick={() => show(null)}>tree →</Link>
              {post.instagramUrl && (
                <a href={post.instagramUrl} target="_blank" rel="noopener noreferrer">instagram ↗</a>
              )}
            </span>
          </div>
        </figcaption>
      </figure>
    </div>
  )
}
