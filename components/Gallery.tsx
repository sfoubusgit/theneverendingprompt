'use client'

import type { GalleryPost } from '@/lib/posts'
import { sized } from '@/lib/img'
import PostViewer, { TextTile, pad, useViewer } from './PostViewer'

export default function Gallery({ posts }: { posts: GalleryPost[] }) {
  // posts arrive newest first
  const viewer = useViewer(posts)

  return (
    <>
      <ul className="g-grid">
        {posts.map((p, i) => (
          <li key={p.id} className={i === 0 ? 'g-latest' : undefined}>
            <button
              className="g-tile"
              onClick={() => viewer.show(i)}
              aria-label={`${i === 0 ? 'Latest — ' : ''}Day ${p.day}, branch ${p.label}: ${p.prompt}`}
            >
              {p.imageUrl
                ? <img src={sized(p.imageUrl, 540)} alt="" loading={i < 9 ? 'eager' : 'lazy'} />
                : <TextTile post={p} />}
              {i === 0
                ? <span className="g-tile-label g-tile-label-now"><span className="g-dot" />NOW · DAY_{pad(p.day)} · {p.label}</span>
                : <span className="g-tile-label">DAY_{pad(p.day)} · {p.label}</span>}
            </button>
          </li>
        ))}
      </ul>
      <PostViewer posts={posts} {...viewer} />
    </>
  )
}
