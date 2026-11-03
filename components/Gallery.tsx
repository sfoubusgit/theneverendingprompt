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
          <li key={p.id}>
            <button
              className="g-tile"
              onClick={() => viewer.show(i)}
              aria-label={`Day ${p.day}, branch ${p.letter}: ${p.prompt}`}
            >
              {p.imageUrl
                ? <img src={sized(p.imageUrl, 540)} alt="" loading={i < 9 ? 'eager' : 'lazy'} />
                : <TextTile post={p} />}
              <span className="g-tile-label">DAY_{pad(p.day)} · {p.letter}</span>
            </button>
          </li>
        ))}
      </ul>
      <PostViewer posts={posts} {...viewer} />
    </>
  )
}
