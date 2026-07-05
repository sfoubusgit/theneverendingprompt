import type { Metadata } from 'next'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Submission } from '@/types'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { data: round } = await supabase
    .from('rounds')
    .select('prompt')
    .eq('id', params.id)
    .single()
  return {
    title: round ? `Mutations — "${round.prompt.slice(0, 60)}…" — TNEP.XYZ` : 'Mutations — TNEP.XYZ',
  }
}

function mutationColor(mt: string | null | undefined) {
  if (mt === 'extend') return { color: 'var(--cyan)', border: 'var(--cT3)', bg: 'var(--cT1)' }
  return { color: 'var(--pink)', border: 'var(--pT3)', bg: 'var(--pT1)' }
}

export default async function RoundPage({ params }: { params: { id: string } }) {
  const { data: round } = await supabase
    .from('rounds')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!round) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--t4)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.1em' }}>
          $ round not found.
        </p>
      </main>
    )
  }

  // Round number: count of rounds created at or before this one
  const { count: roundNumber } = await supabase
    .from('rounds')
    .select('*', { count: 'exact', head: true })
    .lte('created_at', round.created_at)

  const roundLabel = `ROUND_${String(roundNumber ?? 1).padStart(3, '0')}`
  const isLive = round.status === 'open'

  // All submissions with vote counts
  const { data: subs } = await supabase
    .from('submissions')
    .select('*, votes(count)')
    .eq('round_id', params.id)
    .order('created_at', { ascending: true })

  const submissions: Submission[] = (subs ?? [])
    .map((s: any) => ({
      ...s,
      vote_count: s.votes?.[0]?.count ?? 0,
      votes: undefined,
    }))
    .sort((a: Submission, b: Submission) => (b.vote_count ?? 0) - (a.vote_count ?? 0))

  const totalVotes = submissions.reduce((a, s) => a + (s.vote_count ?? 0), 0)

  return (
    <main style={{ maxWidth: 860, margin: '0 auto', padding: '52px 24px 80px' }}>

      {/* Back */}
      <Link href="/" style={{
        display: 'inline-block', marginBottom: 28,
        fontSize: 10, textTransform: 'uppercase', letterSpacing: '.12em',
        color: 'var(--t4)', textDecoration: 'none',
      }}>
        ← {roundLabel}
      </Link>

      {/* Round prompt */}
      <div style={{
        background: 'var(--warm)',
        border: '1px solid rgba(200,160,90,.12)',
        borderLeft: '2px solid rgba(200,160,90,.38)',
        borderRadius: 6, padding: '20px 24px', marginBottom: 10,
      }}>
        <div style={{
          fontSize: 9, textTransform: 'uppercase', letterSpacing: '.12em',
          color: 'rgba(200,160,90,.44)', marginBottom: 10,
          display: 'flex', alignItems: 'center', gap: 8
        }}>
          <span style={{
            width: 5, height: 5, borderRadius: '50%',
            background: 'rgba(200,160,90,.55)', display: 'inline-block', flexShrink: 0
          }} />
          {roundLabel}
          {isLive && (
            <span style={{
              fontSize: 8, padding: '1px 6px', borderRadius: 2,
              border: '1px solid rgba(250,204,21,.3)', background: 'var(--lT1)',
              color: 'var(--lamp)', letterSpacing: '.07em'
            }}>live</span>
          )}
        </div>
        <div style={{
          fontFamily: 'Georgia, serif',
          fontSize: 'clamp(18px, 2.2vw, 28px)',
          lineHeight: 1.3, color: 'var(--amber)',
        }}>
          {round.prompt}
        </div>
      </div>

      {/* Stats row */}
      <div style={{
        display: 'flex', gap: 16, flexWrap: 'wrap',
        fontSize: 10, textTransform: 'uppercase', letterSpacing: '.1em',
        color: 'var(--t4)', marginBottom: 32, paddingLeft: 2
      }}>
        <span>{submissions.length} mutation{submissions.length !== 1 ? 's' : ''}</span>
        <span style={{ opacity: .35 }}>·</span>
        <span>{totalVotes} votes</span>
        {round.closed_at && (
          <>
            <span style={{ opacity: .35 }}>·</span>
            <span>closed {new Date(round.closed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </>
        )}
      </div>

      {submissions.length === 0 ? (
        <p style={{ fontSize: 11, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.1em' }}>
          No mutations yet.
        </p>
      ) : (
        <>
          {/* Column headers */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '32px 1fr 72px 80px',
            gap: '0 16px',
            padding: '0 0 8px',
            fontSize: 9, textTransform: 'uppercase', letterSpacing: '.12em', color: 'var(--t4)',
            borderBottom: '1px solid var(--div)', marginBottom: 4
          }}>
            <span>#</span>
            <span>mutation</span>
            <span style={{ textAlign: 'right' }}>votes</span>
            <span style={{ textAlign: 'right' }}>share</span>
          </div>

          <div>
            {submissions.map((s, i) => {
              const pct = totalVotes > 0 ? Math.round((s.vote_count ?? 0) / totalVotes * 100) : 0
              const isWinner = round.winner_submission_id === s.id
              const mt = mutationColor(s.mutation_type)

              return (
                <div
                  key={s.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '32px 1fr 72px 80px',
                    gap: '0 16px',
                    padding: '14px 0',
                    borderBottom: '1px solid var(--div)',
                    alignItems: 'start',
                    background: isWinner ? 'rgba(250,204,21,.022)' : undefined,
                  }}
                >
                  {/* Rank */}
                  <span style={{
                    fontSize: 11, color: i < 3 ? 'var(--t2)' : 'var(--t4)',
                    fontVariantNumeric: 'tabular-nums', paddingTop: 2,
                  }}>
                    {i + 1}
                  </span>

                  {/* Prompt + meta */}
                  <div>
                    {isWinner && (
                      <div style={{
                        fontSize: 8, textTransform: 'uppercase', letterSpacing: '.1em',
                        color: 'var(--lamp)', marginBottom: 5,
                        display: 'flex', alignItems: 'center', gap: 5
                      }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--lamp)', display: 'inline-block' }} />
                        winner → next round
                      </div>
                    )}
                    <div style={{
                      fontFamily: 'Georgia, serif',
                      fontSize: 'clamp(12px, 1.4vw, 14px)',
                      lineHeight: 1.55, color: isWinner ? 'var(--amber)' : 'var(--t2)',
                      marginBottom: 6
                    }}>
                      "{s.prompt}"
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                      {s.mutation_type && (
                        <span style={{
                          fontSize: 8, textTransform: 'uppercase', letterSpacing: '.09em',
                          padding: '1px 6px', borderRadius: 2, border: '1px solid',
                          color: mt.color, borderColor: mt.border, background: mt.bg
                        }}>
                          {s.mutation_type}
                        </span>
                      )}
                      {s.submitter_name && (
                        <span style={{ fontSize: 10, color: 'var(--t4)', letterSpacing: '.04em' }}>
                          — {s.submitter_name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Vote count */}
                  <div style={{ textAlign: 'right', paddingTop: 2 }}>
                    <span style={{
                      fontSize: 13, fontVariantNumeric: 'tabular-nums',
                      color: isWinner ? 'var(--lamp)' : 'var(--t2)'
                    }}>
                      {s.vote_count ?? 0}
                    </span>
                  </div>

                  {/* Share bar */}
                  <div style={{ paddingTop: 6 }}>
                    <div style={{ height: 3, background: 'var(--t5)', borderRadius: 2, overflow: 'hidden', marginBottom: 4 }}>
                      <div style={{
                        height: '100%', borderRadius: 2,
                        width: `${pct}%`,
                        background: isWinner ? 'var(--lamp)' : mt.color,
                      }} />
                    </div>
                    <span style={{
                      fontSize: 10, color: 'var(--t4)',
                      fontVariantNumeric: 'tabular-nums', float: 'right'
                    }}>
                      {pct}%
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </main>
  )
}
