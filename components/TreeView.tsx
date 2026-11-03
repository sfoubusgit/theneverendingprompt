'use client'

import { useEffect, useRef } from 'react'
import type { BranchInfo, GalleryPost } from '@/lib/posts'
import { sized } from '@/lib/img'
import PostViewer, { pad, useHash, useViewer } from './PostViewer'

const COLORS = ['#00e5ff', '#ff2d87', '#facc15', '#d4c9b2', '#a78bfa', '#34d399']
const STATUS: Record<string, string> = { active: 'active', dormant: 'resting', dead: 'ended' }

const COL    = 44   // px per posted day
const ROW    = 76   // px per branch
const THUMB  = 32
const GUTTER = 24   // left/right breathing room inside the scroll area
const AXIS   = 36

export default function TreeView({ posts, branches }: { posts: GalleryPost[]; branches: BranchInfo[] }) {
  // posts arrive oldest first; the viewer wants newest first
  const newestFirst = [...posts].reverse()
  const viewer = useViewer(newestFirst)
  const scroller = useRef<HTMLDivElement>(null)
  const [hash, setHash] = useHash()
  const focus = hash.match(/^#branch-([A-Z]+)$/)?.[1] ?? null

  const days   = posts.length
  const width  = GUTTER * 2 + Math.max(days, 1) * COL
  const height = branches.length * ROW + AXIS
  const x = (day: number) => GUTTER + (day - 0.5) * COL
  const y = (row: number) => row * ROW + ROW / 2
  const rowOf = new Map(branches.map((b, i) => [b.id, i]))

  // Newest days are on the right — start there
  useEffect(() => {
    const el = scroller.current
    if (el) el.scrollLeft = el.scrollWidth
  }, [])

  const lastDay = new Map<string, number>()
  posts.forEach(p => lastDay.set(p.branchId, p.day))

  return (
    <>
      <div className="t-wrap">
        <div className="t-labels" style={{ height }}>
          {branches.map((b, i) => (
            <button
              key={b.id}
              className="t-label"
              style={{ top: i * ROW, height: ROW, color: COLORS[i % COLORS.length] }}
              aria-pressed={focus === b.letter}
              onClick={() => setHash(focus === b.letter ? '' : `#branch-${b.letter}`)}
            >
              <span className="t-label-letter">{b.letter}</span>
              <span className="t-label-status">{STATUS[b.status] ?? b.status}</span>
            </button>
          ))}
        </div>

        <div className="t-scroll" ref={scroller}>
          <div style={{ position: 'relative', width, height }}>
            <svg width={width} height={height} aria-hidden="true" style={{ position: 'absolute', inset: 0 }}>
              {branches.map((b, i) => {
                const color = COLORS[i % COLORS.length]
                const dim = focus && focus !== b.letter ? 0.15 : 1
                const start = b.parentId ? GUTTER + b.splitDay * COL : x(1)
                const alive = b.status === 'active'
                const end = alive ? x(Math.max(days, 1)) : x(lastDay.get(b.id) ?? b.splitDay + 1)
                const parentRow = b.parentId ? rowOf.get(b.parentId) : undefined
                return (
                  <g key={b.id} opacity={dim}>
                    {focus === b.letter && (
                      <rect x={0} y={i * ROW + 4} width={width} height={ROW - 8} fill={color} opacity={0.05} />
                    )}
                    {parentRow !== undefined && (
                      <path
                        d={`M ${start} ${y(parentRow)} C ${start + 14} ${y(parentRow)}, ${start} ${y(i)}, ${start + 14} ${y(i)}`}
                        stroke={color} strokeWidth={1.2} fill="none" opacity={0.6}
                      />
                    )}
                    <line
                      x1={parentRow !== undefined ? start + 14 : start} y1={y(i)} x2={end} y2={y(i)}
                      stroke={color} strokeWidth={1.2} opacity={alive ? 0.55 : 0.3}
                      strokeDasharray={alive ? undefined : '4 5'}
                    />
                  </g>
                )
              })}

              {Array.from({ length: days }, (_, i) => i + 1)
                .filter(d => d === 1 || d % 5 === 0 || d === days)
                .map(d => (
                  <text
                    key={d} x={x(d)} y={height - 12} textAnchor="middle"
                    fontFamily="Courier New, monospace" fontSize={10}
                    fill={d === days ? '#00e5ff' : 'rgba(243,243,240,0.38)'}
                  >
                    {d}
                  </text>
                ))}
            </svg>

            {posts.map(p => {
              const row = rowOf.get(p.branchId)
              if (row === undefined) return null
              const color = COLORS[row % COLORS.length]
              const latest = p.day === days
              const size = latest ? THUMB + 10 : THUMB
              return (
                <button
                  key={p.id}
                  className="t-node"
                  style={{
                    left: x(p.day) - size / 2, top: y(row) - size / 2,
                    width: size, height: size,
                    borderColor: color,
                    opacity: focus && focus !== p.letter ? 0.2 : 1,
                  }}
                  onClick={() => viewer.showDay(p.day)}
                  aria-label={`Day ${p.day}, branch ${p.letter}`}
                  title={`DAY_${pad(p.day)} · ${p.letter}`}
                >
                  {p.imageUrl
                    ? <img src={sized(p.imageUrl, 120)} alt="" loading="lazy" />
                    : <span style={{ background: color }} />}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <PostViewer posts={newestFirst} {...viewer} />
    </>
  )
}
