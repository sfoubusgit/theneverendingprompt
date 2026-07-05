'use client'

import { useEffect, useState } from 'react'
import { Submission } from '@/types'

function getVoterId(): string {
  let id = localStorage.getItem('voter_id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('voter_id', id)
  }
  return id
}

function typeStyle(mt: string | null | undefined, voted: boolean) {
  if (voted) return {
    tagColor: 'var(--lamp)',
    tagBorder: 'rgba(250,204,21,.4)',
    tagBg: 'var(--lT1)',
    fillColor: 'var(--lamp)',
    btnColor: 'var(--lamp)',
    btnBorder: 'rgba(250,204,21,.4)',
    btnBg: 'var(--lT1)',
  }
  if (mt === 'extend') return {
    tagColor: 'var(--cyan)', tagBorder: 'var(--cT3)', tagBg: 'var(--cT1)',
    fillColor: 'var(--cyan)',
    btnColor: 'var(--cyan)', btnBorder: 'var(--cT3)', btnBg: 'none',
  }
  if (mt === 'preserve') return {
    tagColor: 'var(--t3)', tagBorder: 'var(--div)', tagBg: 'transparent',
    fillColor: 'rgba(240,240,240,.28)',
    btnColor: 'var(--t3)', btnBorder: 'var(--div)', btnBg: 'none',
  }
  return {
    tagColor: 'var(--pink)', tagBorder: 'var(--pT3)', tagBg: 'var(--pT1)',
    fillColor: 'var(--pink)',
    btnColor: 'var(--pink)', btnBorder: 'var(--pT3)', btnBg: 'none',
  }
}

export default function VoteSection({
  submissions,
  roundId,
  closed,
  winnerId,
  roundNum,
  totalCount,
}: {
  submissions: Submission[]
  roundId: string
  closed: boolean
  winnerId: string | null
  roundNum?: number
  totalCount?: number
}) {
  const [myVote, setMyVote] = useState<string | null>(null)
  const [counts, setCounts] = useState<Record<string, number>>(
    Object.fromEntries(submissions.map(s => [s.id, s.vote_count ?? 0]))
  )
  const [voting, setVoting] = useState(false)
  const [votedSub, setVotedSub] = useState<Submission | null>(null)

  useEffect(() => {
    const voterId = getVoterId()
    fetch(`/api/votes/mine?round_id=${roundId}&voter_id=${voterId}`)
      .then(r => r.json())
      .then(data => {
        if (data.submission_id) {
          setMyVote(data.submission_id)
          setVotedSub(submissions.find(s => s.id === data.submission_id) ?? null)
        }
      })
  }, [roundId])

  async function vote(submissionId: string) {
    if (voting || myVote || closed) return
    const voterId = getVoterId()
    const sub = submissions.find(s => s.id === submissionId) ?? null

    setMyVote(submissionId)
    setVotedSub(sub)
    setCounts(c => ({ ...c, [submissionId]: (c[submissionId] ?? 0) + 1 }))

    setVoting(true)
    await fetch('/api/votes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ round_id: roundId, submission_id: submissionId, voter_id: voterId }),
    })
    setVoting(false)
  }

  const sorted = [...submissions].sort((a, b) => (counts[b.id] ?? 0) - (counts[a.id] ?? 0))
  const totalVotes = Object.values(counts).reduce((a, b) => a + b, 0)
  const leaderId = sorted[0]?.id
  const nextNum = roundNum ? String(roundNum + 1).padStart(3, '0') : '???'

  if (submissions.length === 0) {
    return (
      <p style={{ color: 'var(--t4)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.1em', padding: '16px 0' }}>
        No mutations yet. Be first →
      </p>
    )
  }

  return (
    <div>
      {myVote && !closed && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: '#060509',
          borderBottom: '1px solid rgba(250,204,21,.18)',
          borderLeft: '3px solid var(--lamp)',
          padding: '0 20px', height: 36, borderRadius: 3,
          fontSize: 11, textTransform: 'uppercase', letterSpacing: '.09em',
          marginBottom: 18, animation: 'slidedown .3s ease both'
        }}>
          <span style={{ color: 'var(--lamp)' }}>✓</span>
          <span style={{ color: 'var(--lamp)' }}>voted{votedSub?.mutation_type ? ` — ${votedSub.mutation_type}` : ''}</span>
          <span style={{ color: 'var(--t3)' }}>· mutation queued for round_{nextNum}</span>
        </div>
      )}

      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        fontSize: 9, textTransform: 'uppercase', letterSpacing: '.14em',
        color: 'var(--t4)', padding: '14px 0 10px'
      }}>
        <span>// how should it evolve?</span>
        <div style={{ flex: 1, height: 1, background: 'var(--div)' }} />
        <span style={{ color: 'var(--t3)' }}>
          {totalCount && totalCount > submissions.length
            ? `top ${submissions.length} of ${totalCount}`
            : `${submissions.length} option${submissions.length !== 1 ? 's' : ''}`
          } · {totalVotes} votes
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: 12,
        marginBottom: 24
      }}>
        {sorted.map(s => {
          const count = counts[s.id] ?? 0
          const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0
          const isMyVote = myVote === s.id
          const isWinner = closed && winnerId === s.id
          const isDimmed = !!myVote && !isMyVote && !closed && !isWinner
          const isLeader = !myVote && !closed && s.id === leaderId && totalVotes > 0
          const ts = typeStyle(s.mutation_type, isMyVote || isWinner)

          return (
            <div
              key={s.id}
              onClick={() => vote(s.id)}
              tabIndex={myVote || closed ? -1 : 0}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); vote(s.id) } }}
              style={{
                display: 'flex', flexDirection: 'column',
                border: `1px solid ${isMyVote || isWinner ? 'rgba(250,204,21,.48)' : isLeader ? 'rgba(0,229,255,.27)' : 'var(--div)'}`,
                borderRadius: 5,
                background: isMyVote || isWinner ? 'rgba(250,204,21,.03)' : isLeader ? 'rgba(0,229,255,.022)' : 'transparent',
                boxShadow: isMyVote || isWinner ? '0 0 24px -10px rgba(250,204,21,.22)' : 'none',
                opacity: isDimmed ? .32 : 1,
                cursor: myVote || closed ? 'default' : 'pointer',
                transition: 'border-color .13s, background .13s',
                outline: 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '13px 14px 8px' }}>
                {s.mutation_type && (
                  <span style={{
                    fontSize: 9, textTransform: 'uppercase', letterSpacing: '.1em',
                    padding: '2px 6px', borderRadius: 2, border: '1px solid', flexShrink: 0,
                    color: ts.tagColor, borderColor: ts.tagBorder, background: ts.tagBg
                  }}>
                    {s.mutation_type}
                  </span>
                )}
                {isLeader && (
                  <span style={{ fontSize: 9, color: 'var(--lamp)', textTransform: 'uppercase', letterSpacing: '.08em' }}>
                    ↑ leading
                  </span>
                )}
                <span style={{
                  marginLeft: 'auto', fontSize: 12, fontVariantNumeric: 'tabular-nums',
                  color: isMyVote || isWinner ? 'var(--lamp)' : 'var(--t3)'
                }}>
                  {pct}%
                </span>
              </div>

              <div style={{ height: 2, background: 'var(--t5)', margin: '0 14px 10px', borderRadius: 1, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 1,
                  width: `${pct}%`, background: ts.fillColor,
                  transition: 'width .5s ease'
                }} />
              </div>

              <div style={{ fontSize: 8, textTransform: 'uppercase', letterSpacing: '.12em', color: 'var(--t4)', padding: '0 14px 6px' }}>
                ROUND_{nextNum} will read →
              </div>

              <div style={{
                fontFamily: 'Georgia, serif',
                fontSize: 'clamp(12px, 1.4vw, 15px)', lineHeight: 1.5,
                color: isMyVote || isWinner ? 'rgba(240,240,240,.84)' : 'var(--t2)',
                padding: '0 14px', flex: 1
              }}>
                "{s.prompt}"
              </div>

              {s.submitter_name && (
                <div style={{ fontSize: 9, color: 'var(--t4)', padding: '4px 14px 0', textTransform: 'uppercase', letterSpacing: '.08em' }}>
                  — {s.submitter_name}
                </div>
              )}

              <button
                onClick={e => { e.stopPropagation(); vote(s.id) }}
                disabled={!!myVote || closed}
                style={{
                  display: 'block', margin: '12px 14px 14px',
                  fontFamily: 'inherit', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.1em',
                  padding: 7, borderRadius: 3, border: `1px solid ${ts.btnBorder}`,
                  background: ts.btnBg, color: ts.btnColor,
                  cursor: myVote || closed ? 'default' : 'pointer',
                  textAlign: 'center', transition: 'background .13s'
                }}
              >
                {isMyVote || isWinner ? '✓ voted' : closed ? (isWinner ? '[winner]' : '[closed]') : '[vote]'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
