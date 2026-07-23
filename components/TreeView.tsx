'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type Branch = {
  id: string
  prompt: string
  parent_id: string | null
  vitality: number
  status: string
  module_history: string[]
  prompt_history: string[]
  created_at: string
  last_materialized_at: string | null
}
type Post = {
  id: string
  branch_id: string
  prompt: string
  instagram_post_url: string | null
  created_at: string
}
type EvolutionState = {
  cycleStep: number
  dayCount: number
  lastRunAt: string | null
}
type SelectedNode = {
  dayNum: number
  branchLabel: string
  branchColor: string
  cycleName: string
  prompt: string
  instagramUrl: string | null
  moduleTag: string
}

const CYCLE        = ['WHISPER', 'BUILD', 'PEAK', 'DECAY', 'SILENCE']
const BRANCH_COLORS = ['#0AEEFF', '#FF2080', '#C77DFF', '#FFB703', '#06D6A0']

export default function TreeView({
  branches,
  posts,
  evolutionState,
}: {
  branches: Branch[]
  posts: Post[]
  evolutionState: EvolutionState
}) {
  const [selected, setSelected] = useState<SelectedNode | null>(null)

  useEffect(() => {
    if (!selected) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelected(null) }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [selected])

  const { dayCount, cycleStep } = evolutionState
  const sortedBranches = [...branches].sort(
    (a, b) => +new Date(a.created_at) - +new Date(b.created_at)
  )
  const rootBranch = sortedBranches[0]
  const rootMs = rootBranch ? +new Date(rootBranch.created_at) : 0

  const sortedPosts = [...posts].sort(
    (a, b) => +new Date(a.created_at) - +new Date(b.created_at)
  )
  const totalDays = Math.max(dayCount, sortedPosts.length, 1)

  // Layout
  const DAY_W  = 60
  const ROW_H  = 110
  const PAD_L  = 72
  const PAD_R  = 100
  const PAD_T  = 80
  const PAD_B  = 80
  const SVG_W  = PAD_L + PAD_R + totalDays * DAY_W
  const SVG_H  = PAD_T + PAD_B + Math.max(sortedBranches.length, 1) * ROW_H

  function dayX(day: number) {
    return PAD_L + (day - 0.5) * DAY_W
  }
  function rowY(idx: number) {
    return PAD_T + idx * ROW_H + ROW_H * 0.5
  }
  function getBranchIdx(id: string) {
    return sortedBranches.findIndex(b => b.id === id)
  }
  function getBranchStartDay(branch: Branch): number {
    if (!branch.parent_id) return 1
    const ms = +new Date(branch.created_at) - rootMs
    return Math.max(2, Math.round(ms / 86400000) + 1)
  }

  // Map posts → day numbers
  const postNodes = sortedPosts.map((post, idx) => {
    const dayNum = idx + 1
    const bIdx = getBranchIdx(post.branch_id)
    if (bIdx < 0) return null
    const dist = dayCount - dayNum
    const sIdx = ((cycleStep - dist) % 5 + 5) % 5
    return { post, dayNum, bIdx, sIdx, isLatest: dayNum === dayCount }
  }).filter((n): n is NonNullable<typeof n> => n !== null)

  const todayX  = dayX(dayCount)
  const axisY   = SVG_H - PAD_B + 16

  // Show tick every N days depending on total
  const tickEvery = totalDays <= 10 ? 1 : totalDays <= 30 ? 5 : totalDays <= 90 ? 10 : 20
  const ticks = Array.from({ length: totalDays }, (_, i) => i + 1)
    .filter(d => d === 1 || d % tickEvery === 0 || d === totalDays)

  function handleNodeClick(node: typeof postNodes[number]) {
    const { dayNum, bIdx, sIdx, post } = node
    const branch = sortedBranches[bIdx]
    setSelected({
      dayNum,
      branchLabel: String.fromCharCode(65 + bIdx),
      branchColor: BRANCH_COLORS[bIdx] ?? '#fff',
      cycleName: CYCLE[sIdx] ?? '',
      prompt: post.prompt,
      instagramUrl: post.instagram_post_url,
      moduleTag: branch?.module_history?.at(-1) ?? '—',
    })
  }

  return (
    <div style={{
      background: '#000', minHeight: '100vh',
      fontFamily: '"Courier New",monospace',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* ── Header ── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 50, zIndex: 200,
        background: 'rgba(0,0,0,0.94)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.14)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 34px',
      }}>
        <Link href="/" style={{
          fontSize: 11, letterSpacing: '0.18em',
          color: 'rgba(255,255,255,0.72)',
          textDecoration: 'none', textTransform: 'uppercase',
        }}>
          ← Observatory
        </Link>
        <span style={{
          position: 'absolute', left: '50%', transform: 'translateX(-50%)',
          fontSize: 11, letterSpacing: '0.22em',
          color: 'rgba(255,255,255,0.80)', textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}>
          Organism Tree
        </span>
        <span style={{
          fontSize: 10, letterSpacing: '0.18em',
          color: 'rgba(10,238,255,0.88)', textTransform: 'uppercase',
        }}>
          Day {dayCount} · {sortedBranches.length} Branch{sortedBranches.length !== 1 ? 'es' : ''}
        </span>
      </header>

      {/* ── Tree SVG ── */}
      <div style={{ flex: 1, marginTop: 50, overflow: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 32 }}>
        <svg
          width={SVG_W}
          height={SVG_H}
          style={{ display: 'block', flexShrink: 0 }}
          aria-label="Organism branch tree — click nodes to see prompts"
        >
          <defs>
            {/* Per-branch gradient */}
            {sortedBranches.map((branch, idx) => {
              const color = BRANCH_COLORS[idx] ?? '#fff'
              const startDay = getBranchStartDay(branch)
              const isActive = branch.status !== 'dead' && branch.status !== 'extinct'
              return (
                <linearGradient
                  key={`grad-${idx}`}
                  id={`bg-${idx}`}
                  x1={dayX(startDay)} y1={0}
                  x2={dayX(totalDays)} y2={0}
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0%"   stopColor={color} stopOpacity={0.20} />
                  <stop offset="35%"  stopColor={color} stopOpacity={0.55} />
                  <stop offset="100%" stopColor={color} stopOpacity={isActive ? 0.90 : 0.35} />
                </linearGradient>
              )
            })}

          </defs>


          {/* Horizontal row guides */}
          {sortedBranches.map((_, idx) => (
            <line key={`hg-${idx}`}
              x1={PAD_L * 0.6} y1={rowY(idx)}
              x2={SVG_W - PAD_R * 0.5} y2={rowY(idx)}
              stroke="rgba(255,255,255,0.10)" strokeWidth={0.6} strokeDasharray="1 10"
            />
          ))}

          {/* Vertical day grid (every tickEvery days) */}
          {ticks.map(d => (
            <line key={`vg-${d}`}
              x1={dayX(d)} y1={PAD_T * 0.5}
              x2={dayX(d)} y2={SVG_H - PAD_B * 0.5}
              stroke="rgba(255,255,255,0.08)" strokeWidth={0.5}
            />
          ))}

          {/* Today marker */}
          <line
            x1={todayX} y1={PAD_T * 0.3}
            x2={todayX} y2={axisY + 4}
            stroke="rgba(10,238,255,0.60)" strokeWidth={1.0}
            strokeDasharray="4 6"
          />
          <text
            x={todayX} y={PAD_T * 0.3 - 10}
            textAnchor="middle"
            fontSize={10} fill="rgba(10,238,255,0.90)"
            letterSpacing={3}
          >
            NOW
          </text>

          {/* Day axis */}
          <line
            x1={PAD_L * 0.5} y1={axisY}
            x2={SVG_W - PAD_R * 0.4} y2={axisY}
            stroke="rgba(255,255,255,0.22)" strokeWidth={0.7}
          />
          {ticks.map(d => (
            <g key={`ax-${d}`}>
              <line
                x1={dayX(d)} y1={axisY} x2={dayX(d)} y2={axisY + 7}
                stroke="rgba(255,255,255,0.28)" strokeWidth={0.7}
              />
              <text
                x={dayX(d)} y={axisY + 20}
                textAnchor="middle" fontSize={10}
                fill="rgba(255,255,255,0.70)"
              >
                {d}
              </text>
            </g>
          ))}
          <text
            x={PAD_L + (totalDays * DAY_W) / 2} y={SVG_H - 10}
            textAnchor="middle"
            fontFamily='"Courier New",monospace'
            fontSize={9} fill="rgba(255,255,255,0.45)" letterSpacing={6}
          >
            TIME →
          </text>

          {/* Branch labels (Y axis) */}
          {sortedBranches.map((branch, idx) => {
            const color    = BRANCH_COLORS[idx] ?? '#fff'
            const label    = String.fromCharCode(65 + idx)
            const isActive = branch.status !== 'dead' && branch.status !== 'extinct'
            const isRoot   = !branch.parent_id
            const y = rowY(idx)
            return (
              <g key={`yl-${idx}`}>
                {/* Branch letter */}
                <text
                  x={PAD_L - 20} y={y - 6}
                  textAnchor="end" dominantBaseline="middle"
                  fontFamily='"Courier New",monospace'
                  fontSize={16} fill={color}
                  opacity={isActive ? 1.0 : 0.50}
                  fontWeight={isRoot ? 500 : 400}
                >
                  {label}
                </text>
                {/* Root / branch descriptor */}
                <text
                  x={PAD_L - 20} y={y + 10}
                  textAnchor="end" dominantBaseline="middle"
                  fontFamily='"Courier New",monospace'
                  fontSize={8} fill={color}
                  letterSpacing={2}
                  opacity={isActive ? 0.65 : 0.35}
                >
                  {isRoot ? 'ROOT' : 'BRANCH'}
                </text>
                {/* Right: vitality / status */}
                <text
                  x={SVG_W - PAD_R + 14} y={y + 1}
                  textAnchor="start" dominantBaseline="middle"
                  fontFamily='"Courier New",monospace'
                  fontSize={10} fill={color}
                  opacity={isActive ? 0.75 : 0.35}
                >
                  {isActive ? `VIT ${branch.vitality}` : 'EXTINCT'}
                </text>
              </g>
            )
          })}

          {/* Phantom positions — unfilled day slots, ghost presence */}
          {sortedBranches.map((branch, bIdx) => {
            const color = BRANCH_COLORS[bIdx] ?? '#fff'
            const startDay = getBranchStartDay(branch)
            const filledDays = new Set(
              postNodes.filter(n => n.bIdx === bIdx).map(n => n.dayNum)
            )
            return Array.from({ length: totalDays - startDay + 1 }, (_, i) => {
              const day = startDay + i
              if (filledDays.has(day)) return null
              return (
                <circle
                  key={`ph-${bIdx}-${day}`}
                  cx={dayX(day)} cy={rowY(bIdx)}
                  r={2.2}
                  fill="none"
                  stroke={color}
                  strokeWidth={0.6}
                  opacity={0.10}
                />
              )
            })
          })}

          {/* Fork connectors — smooth bezier curves */}
          {sortedBranches.filter(b => b.parent_id).map(branch => {
            const parent = branches.find(b => b.id === branch.parent_id)
            if (!parent) return null
            const startDay = getBranchStartDay(branch)
            const fx  = dayX(startDay)
            const cIdx = getBranchIdx(branch.id)
            const pIdx = getBranchIdx(parent.id)
            const y1  = rowY(pIdx)
            const y2  = rowY(cIdx)
            const mid = (y1 + y2) / 2
            const color = BRANCH_COLORS[cIdx] ?? '#fff'
            return (
              <path
                key={`fork-${branch.id}`}
                d={`M ${fx} ${y1} C ${fx} ${mid} ${fx} ${mid} ${fx} ${y2}`}
                stroke={color} strokeWidth={1.5} strokeOpacity={0.70}
                fill="none" strokeDasharray="none"
              />
            )
          })}

          {/* Branch lines */}
          {sortedBranches.map((branch, idx) => {
            const startDay = getBranchStartDay(branch)
            const x1 = dayX(startDay)
            const x2 = dayX(totalDays)
            const y  = rowY(idx)
            const isActive = branch.status !== 'dead' && branch.status !== 'extinct'
            const isRoot = !branch.parent_id
            return (
              <line
                key={`bl-${idx}`}
                x1={x1} y1={y} x2={x2} y2={y}
                stroke={`url(#bg-${idx})`}
                strokeWidth={isRoot ? 2 : 1.5}
                strokeDasharray={isActive ? undefined : '6 5'}
              />
            )
          })}

          {/* Materialization nodes — clickable */}
          {postNodes.map(node => {
            const { dayNum, bIdx, isLatest } = node
            const color = BRANCH_COLORS[bIdx] ?? '#fff'
            const x = dayX(dayNum)
            const y = rowY(bIdx)
            const r = isLatest ? 8 : 5.5

            return (
              <g
                key={`n-${node.post.id}`}
                onClick={() => handleNodeClick(node)}
                style={{ cursor: 'pointer' }}
              >
                <circle cx={x} cy={y} r={24} fill="transparent" />
                {isLatest && (
                  <>
                    <circle cx={x} cy={y} r={20} fill={color} opacity={0.05} />
                    <circle cx={x} cy={y} r={13} fill={color} opacity={0.08} />
                  </>
                )}
                <circle
                  cx={x} cy={y} r={r + 8}
                  fill={color} opacity={0}
                  className="node-hover-ring"
                />
                <circle
                  cx={x} cy={y} r={r}
                  fill={color}
                  opacity={isLatest ? 1.0 : 0.85}
                  style={isLatest ? { filter: `drop-shadow(0 0 6px ${color})` } : undefined}
                  className="node-dot"
                />
              </g>
            )
          })}

          {/* Empty state — shown when no posts yet */}
          {postNodes.length === 0 && (
            <g>
              <text
                x={SVG_W / 2} y={SVG_H / 2 - 16}
                textAnchor="middle" dominantBaseline="middle"
                fontFamily='"Courier New",monospace'
                fontSize={11} fill="rgba(255,255,255,0.70)"
                letterSpacing={4}
              >
                NO MATERIALIZATIONS YET
              </text>
              <text
                x={SVG_W / 2} y={SVG_H / 2 + 12}
                textAnchor="middle" dominantBaseline="middle"
                fontFamily='Georgia,"Times New Roman",serif'
                fontSize={13} fill="rgba(255,255,255,0.50)"
                fontStyle="italic"
              >
                Each circle marks a day the organism produced an image.
              </text>
            </g>
          )}

          {/* Annotation — click instruction, shown when posts exist */}
          {postNodes.length > 0 && (
            <text
              x={SVG_W / 2} y={axisY + 42}
              textAnchor="middle"
              fontFamily='"Courier New",monospace'
              fontSize={9} fill="rgba(255,255,255,0.55)"
              letterSpacing={3}
            >
              EACH ● IS A MATERIALIZED PROMPT — CLICK TO READ
            </text>
          )}

        </svg>
      </div>

      {/* ── Prompt popup ── */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 400,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'linear-gradient(135deg, #060d14 0%, #020608 100%)',
              border: `1px solid ${selected.branchColor}28`,
              maxWidth: 620, width: '100%',
              padding: '48px 52px 52px',
              position: 'relative',
              boxShadow: `0 0 80px ${selected.branchColor}0d, 0 32px 96px rgba(0,0,0,0.70)`,
            }}
          >
            {/* Accent bar */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 2,
              background: `linear-gradient(to right, transparent, ${selected.branchColor}55, transparent)`,
            }} />

            {/* Close */}
            <button
              onClick={() => setSelected(null)}
              aria-label="Close"
              style={{
                position: 'absolute', top: 16, right: 18,
                background: 'none', border: 'none',
                color: 'rgba(255,255,255,0.55)', fontSize: 22,
                cursor: 'pointer', lineHeight: 1, padding: '4px 8px',
                fontFamily: 'inherit',
              }}
            >
              ×
            </button>

            {/* Meta row */}
            <div style={{
              display: 'flex', gap: 10, alignItems: 'center',
              flexWrap: 'wrap', marginBottom: 32,
              fontSize: 10, letterSpacing: '0.20em',
              color: selected.branchColor, opacity: 0.90,
              textTransform: 'uppercase',
            }}>
              <span>Day {selected.dayNum}</span>
              <span style={{ opacity: 0.35 }}>·</span>
              <span>Branch {selected.branchLabel}</span>
              {selected.moduleTag !== '—' && (
                <>
                  <span style={{ opacity: 0.35 }}>·</span>
                  <span style={{ opacity: 0.65 }}>{selected.moduleTag}</span>
                </>
              )}
            </div>

            {/* Prompt text */}
            <p style={{
              fontFamily: 'Georgia,"Times New Roman",serif',
              fontSize: 22, lineHeight: 1.62,
              color: 'rgba(243,243,240,0.92)',
              fontStyle: 'italic',
              margin: '0 0 38px',
            }}>
              &ldquo;{selected.prompt}&rdquo;
            </p>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
              {selected.instagramUrl && (
                <a
                  href={selected.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: 10, letterSpacing: '0.18em',
                    color: selected.branchColor,
                    textDecoration: 'none', textTransform: 'uppercase',
                    borderBottom: `1px solid ${selected.branchColor}30`,
                    paddingBottom: 2, opacity: 0.85,
                  }}
                >
                  View on Instagram ↗
                </a>
              )}
              <span style={{
                fontSize: 9, letterSpacing: '0.12em',
                color: 'rgba(255,255,255,0.42)',
                textTransform: 'uppercase',
              }}>
                esc or click outside to close
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Hover styles */}
      <style>{`
        g:hover .node-hover-ring { opacity: 0.10 !important; }
        g:hover .node-dot { opacity: 1 !important; }
      `}</style>
    </div>
  )
}
