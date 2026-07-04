'use client'

import { useState } from 'react'
import { Submission } from '@/types'

type PrevRoundInfo = {
  id: string
  prompt: string
  closed_at: string | null
  winner_submission_id: string | null
}

function typeColor(mt?: string | null) {
  if (mt === 'extend') return 'var(--cyan)'
  if (mt === 'preserve') return 'var(--t3)'
  return 'var(--pink)'
}

export default function YesterdayStrip({
  prevRound,
  prevSubmissions,
  prevRoundNum,
}: {
  prevRound: PrevRoundInfo
  prevSubmissions: Submission[]
  prevRoundNum: number
}) {
  const [open, setOpen] = useState(false)

  const winner = prevSubmissions.find(s => s.id === prevRound.winner_submission_id)
  const totalVotes = prevSubmissions.reduce((a, s) => a + (s.vote_count ?? 0), 0)
  const winnerPct = winner && totalVotes > 0
    ? Math.round(((winner.vote_count ?? 0) / totalVotes) * 100)
    : 0

  // Group by mutation_type if available, otherwise show individual submissions
  const hasMutationTypes = prevSubmissions.some(s => s.mutation_type)
  const roundNumStr = String(prevRoundNum).padStart(3, '0')

  let bars: { label: string; pct: number; color: string; isWinner: boolean }[] = []

  if (hasMutationTypes) {
    const groups: Record<string, number> = {}
    for (const s of prevSubmissions) {
      const key = s.mutation_type ?? 'other'
      groups[key] = (groups[key] ?? 0) + (s.vote_count ?? 0)
    }
    const winnerType = winner?.mutation_type ?? null
    bars = Object.entries(groups)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([type, votes]) => ({
        label: type.charAt(0).toUpperCase() + type.slice(1),
        pct: totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0,
        color: typeColor(type),
        isWinner: type === winnerType,
      }))
  } else {
    bars = [...prevSubmissions]
      .sort((a, b) => (b.vote_count ?? 0) - (a.vote_count ?? 0))
      .slice(0, 4)
      .map(s => ({
        label: s.submitter_name || 'anon',
        pct: totalVotes > 0 ? Math.round(((s.vote_count ?? 0) / totalVotes) * 100) : 0,
        color: s.id === winner?.id ? 'var(--cyan)' : 'var(--t3)',
        isWinner: s.id === winner?.id,
      }))
  }

  const winnerLabel = winner?.mutation_type
    ? winner.mutation_type.charAt(0).toUpperCase() + winner.mutation_type.slice(1) + ' won'
    : winner
    ? 'won'
    : 'closed'

  return (
    <div style={{ borderBottom: '1px solid var(--div)', marginBottom: 0 }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          fontSize: 10, textTransform: 'uppercase', letterSpacing: '.09em',
          padding: '8px 0', cursor: 'pointer', color: 'var(--t3)',
          transition: 'color .11s', userSelect: 'none'
        }}
      >
        <span style={{ color: 'var(--t4)' }}>←</span>
        <span>{roundNumStr} closed</span>
        {winner && (
          <span style={{
            color: 'var(--cyan)', border: '1px solid var(--cT3)', background: 'var(--cT1)',
            padding: '1px 6px', borderRadius: 2, fontSize: 8
          }}>
            {winnerLabel}
          </span>
        )}
        {winnerPct > 0 && (
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>{winnerPct}%</span>
        )}
        {totalVotes > 0 && (
          <>
            <span style={{ color: 'var(--t4)' }}>·</span>
            <span style={{ color: 'var(--t4)', fontSize: 10 }}>{totalVotes} votes</span>
          </>
        )}
        <span style={{
          marginLeft: 'auto', fontSize: 9, color: 'var(--t4)',
          display: 'inline-block', transition: 'transform .15s',
          transform: open ? 'rotate(180deg)' : 'none'
        }}>▾</span>
      </div>

      {open && (
        <div style={{ paddingBottom: 14, animation: 'rise .18s ease' }}>
          {winner && (
            <div style={{
              border: '1px solid var(--div)', borderRadius: 3, overflow: 'hidden', marginBottom: 10
            }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', padding: '8px 12px', fontSize: 11 }}>
                <span style={{ fontSize: 8, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--t4)', width: 28, flexShrink: 0 }}>
                  {roundNumStr}
                </span>
                <span style={{ fontFamily: 'Georgia, serif', fontSize: 13, lineHeight: 1.45, color: 'rgba(240,240,240,.78)' }}>
                  {winner.prompt}
                </span>
              </div>
            </div>
          )}

          {bars.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {bars.map((b, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, textTransform: 'uppercase', letterSpacing: '.07em' }}>
                  <span style={{ width: 54, flexShrink: 0, color: b.isWinner ? b.color : 'var(--t3)' }}>{b.label}</span>
                  <div style={{ flex: 1, height: 3, background: 'var(--div)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${b.pct}%`, background: b.isWinner ? b.color : 'rgba(240,240,240,.18)', borderRadius: 2, transition: 'width .5s ease' }} />
                  </div>
                  <span style={{ fontSize: 10, fontVariantNumeric: 'tabular-nums', width: 28, textAlign: 'right', color: b.isWinner ? b.color : 'var(--t4)' }}>
                    {b.pct}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
