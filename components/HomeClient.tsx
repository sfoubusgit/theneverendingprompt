'use client'

import { useState } from 'react'
import DnaHelix from './DnaHelix'
import VoteSection from './VoteSection'
import SubmitForm from './SubmitForm'
import YesterdayStrip from './YesterdayStrip'
import Wordmark from './Wordmark'
import { Round, Submission, ChainRound } from '@/types'

type PrevRoundInfo = {
  id: string
  prompt: string
  closed_at: string | null
  winner_submission_id: string | null
}

type Panel =
  | { type: 'active' }
  | { type: 'round'; data: ChainRound }
  | { type: 'fullchain' }

function tagStyle(mt: string | null | undefined) {
  if (mt === 'extend') return { color: 'var(--cyan)', borderColor: 'var(--cT3)', background: 'var(--cT1)' }
  if (mt === 'preserve') return { color: 'var(--t3)', borderColor: 'var(--div)', background: 'transparent' }
  return { color: 'var(--pink)', borderColor: 'var(--pT3)', background: 'var(--pT1)' }
}

function accentColor(mt: string | null | undefined) {
  if (mt === 'extend') return 'rgba(0,229,255,.55)'
  if (mt === 'preserve') return 'rgba(240,240,240,.2)'
  return 'rgba(255,45,135,.55)'
}

export default function HomeClient({
  round,
  roundNumber,
  submissions: initialSubs,
  chainRounds,
  prevRound,
  prevSubmissions,
}: {
  round: Round
  roundNumber: number
  submissions: Submission[]
  chainRounds: ChainRound[]
  prevRound: PrevRoundInfo | null
  prevSubmissions: Submission[]
}) {
  const [panel, setPanel] = useState<Panel>({ type: 'active' })
  const [submissions, setSubmissions] = useState<Submission[]>(initialSubs)

  const TOP_N = 10
  const roundLabel = `ROUND_${String(roundNumber).padStart(3, '0')}`
  const isOpen = round.status === 'open'
  const totalVotes = submissions.reduce((a, s) => a + (s.vote_count ?? 0), 0)
  const sidebarChain = chainRounds.slice(0, 6)
  const topSubs = [...submissions]
    .sort((a, b) => (b.vote_count ?? 0) - (a.vote_count ?? 0))
    .slice(0, TOP_N)

  return (
    <>
      {/* ── Top nav bar ─────────────────────────────────── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: 44, background: 'rgba(5,5,8,.97)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--divC)',
        display: 'flex', alignItems: 'center', padding: '0 24px', gap: 4
      }}>
        <a href="/" style={{ marginRight: 16, textDecoration: 'none', color: 'inherit' }}>
          <Wordmark />
        </a>
        {isOpen && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, textTransform: 'uppercase', letterSpacing: '.09em', color: 'var(--lamp)' }}>
            <span className="lamp-dot" style={{ width: 5, height: 5 }} />
            {roundLabel} · live
          </span>
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 14 }}>
          <a href="/history" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.09em', color: 'var(--t3)', textDecoration: 'none' }}>
            history
          </a>
          <a
            href="https://www.instagram.com/theneverendingprompt.xyz/"
            target="_blank" rel="noopener noreferrer"
            aria-label="Instagram"
            style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.09em', color: 'var(--t3)', textDecoration: 'none' }}
          >
            IG
          </a>
        </div>
      </header>

      {/* Gradient rule */}
      <div style={{ height: 1, background: 'linear-gradient(90deg, var(--pink), var(--cyan))', opacity: .38, marginTop: 44 }} />

      {/* ── Layout grid ─────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'var(--sb-w, 1fr)', minHeight: 'calc(100vh - 45px)' }}
        className="lg:!grid-cols-[242px_minmax(0,1fr)]">

        {/* ── Sidebar (desktop only) ──────────────────── */}
        <aside
          className="hidden lg:flex"
          style={{
            background: '#040507', borderRight: '1px solid var(--divC)',
            position: 'sticky', top: 45, height: 'calc(100vh - 45px)',
            overflowY: 'auto', scrollbarWidth: 'none',
            flexDirection: 'column', padding: '18px 0 0'
          }}
        >
          <div style={{ fontSize: 14, letterSpacing: '.06em', padding: '0 18px 18px', borderBottom: '1px solid var(--divC)' }}>
            <Wordmark size="lg" />
          </div>

          <div style={{ marginTop: 16, flex: 1 }}>
            {/* Chain header */}
            <div style={{
              fontSize: 9, textTransform: 'uppercase', letterSpacing: '.15em', color: 'var(--t4)',
              padding: '0 18px 6px', display: 'flex', alignItems: 'center', gap: 6
            }}>
              // chain
              <div style={{ flex: 1, height: 1, background: 'var(--divC)' }} />
            </div>

            {/* Current round item */}
            <SidebarItem
              active={panel.type === 'active'}
              accent="rgba(250,204,21,.6)"
              onClick={() => setPanel({ type: 'active' })}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                <span style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--lamp)' }}>
                  {roundLabel}
                </span>
                <span style={{
                  fontSize: 8, textTransform: 'uppercase', letterSpacing: '.07em',
                  padding: '1px 5px', borderRadius: 2, border: '1px solid',
                  color: 'var(--lamp)', borderColor: 'rgba(250,204,21,.3)', background: 'var(--lT1)'
                }}>live</span>
                <span className="lamp-dot" style={{ width: 6, height: 6, marginLeft: 'auto' }} />
              </div>
              <div style={{
                fontSize: 10, color: 'var(--t3)', lineHeight: 1.38,
                display: '-webkit-box', overflow: 'hidden',
              } as React.CSSProperties} className="line-clamp-2">
                {round.prompt}
              </div>
            </SidebarItem>

            {/* Past chain items */}
            {sidebarChain.map(r => {
              const ts = tagStyle(r.winner_mutation_type)
              return (
                <SidebarItem
                  key={r.id}
                  active={panel.type === 'round' && panel.data.id === r.id}
                  accent={accentColor(r.winner_mutation_type)}
                  onClick={() => setPanel({ type: 'round', data: r })}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                    <span style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--t3)' }}>
                      ROUND_{String(r.roundNum).padStart(3, '0')}
                    </span>
                    {r.winner_mutation_type && (
                      <span style={{
                        fontSize: 8, textTransform: 'uppercase', letterSpacing: '.07em',
                        padding: '1px 5px', borderRadius: 2, border: '1px solid',
                        color: ts.color, borderColor: ts.borderColor, background: ts.background
                      }}>
                        {r.winner_mutation_type.slice(0, 3)}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--t4)', lineHeight: 1.38 }} className="line-clamp-2">
                    {r.prompt}
                  </div>
                </SidebarItem>
              )
            })}

            {/* View full chain */}
            <button
              onClick={() => setPanel({ type: 'fullchain' })}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px',
                fontSize: 9, textTransform: 'uppercase', letterSpacing: '.12em',
                color: 'var(--t4)', cursor: 'pointer', border: 'none', background: 'none',
                width: '100%', transition: 'color .12s', fontFamily: 'inherit'
              }}
            >
              // view full chain · {roundNumber} rounds
              <div style={{ flex: 1, height: 1, background: 'var(--div)' }} />
            </button>
          </div>

          <div style={{ padding: '16px 18px', borderTop: '1px solid var(--div)' }}>
            <div style={{ fontSize: 42, lineHeight: 1, color: 'var(--t4)', marginBottom: 4 }}>∞</div>
            <div style={{ fontSize: 8, textTransform: 'uppercase', letterSpacing: '.2em', color: 'var(--t4)' }}>
              The prompt never dies.
            </div>
          </div>
        </aside>

        {/* ── Main content ────────────────────────────── */}
        <main style={{ padding: '36px 52px 80px', overflowX: 'hidden' }}
          className="max-lg:!p-[20px_20px_60px]">

          {/* Panel: Active round */}
          {panel.type === 'active' && (
            <div style={{ maxWidth: 820, animation: 'rise .22s ease both' }}>

              {/* Eyebrow */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
                fontSize: 9, textTransform: 'uppercase', letterSpacing: '.14em', color: 'var(--cyan)',
                marginBottom: 16
              }}>
                <span className="lamp-dot" style={{ width: 5, height: 5 }} />
                <span>{roundLabel}</span>
                <span style={{ color: 'var(--t4)' }}>·</span>
                <span>{isOpen ? 'Voting open' : 'Closed'}</span>
                <span style={{ color: 'var(--t4)' }}>·</span>
                <span style={{ color: 'var(--t3)' }}>{roundNumber} / ∞</span>
                {totalVotes > 0 && (
                  <>
                    <span style={{ color: 'var(--t4)' }}>·</span>
                    <span style={{ color: 'var(--t3)' }}>{totalVotes} votes</span>
                  </>
                )}
              </div>

              {/* DNA Helix */}
              <DnaHelix height={38} />
              <div style={{ marginBottom: 18 }} />

              {/* Prompt card */}
              <div style={{
                background: 'var(--warm)',
                border: '1px solid rgba(200,170,120,.12)',
                borderLeft: '2px solid rgba(200,160,90,.4)',
                borderRadius: 6, padding: '22px 26px', marginBottom: 14,
                boxShadow: '0 6px 28px -10px rgba(0,0,0,.5)'
              }}>
                <div style={{
                  fontSize: 9, textTransform: 'uppercase', letterSpacing: '.12em',
                  color: 'rgba(200,160,90,.44)', marginBottom: 12,
                  display: 'flex', alignItems: 'center', gap: 8
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(200,160,90,.55)', display: 'inline-block', flexShrink: 0 }} />
                  current prompt
                  <span style={{ flex: 1, height: 1, background: 'rgba(200,160,90,.1)', display: 'block' }} />
                </div>
                <div style={{
                  fontFamily: 'Georgia, serif',
                  fontSize: 'clamp(20px, 2.6vw, 32px)',
                  lineHeight: 1.3, letterSpacing: '-.018em',
                  color: 'var(--amber)'
                }}>
                  {round.prompt}
                </div>
                <div style={{
                  display: 'flex', gap: 12, marginTop: 14,
                  fontSize: 9, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--t4)'
                }}>
                  <span>Round {roundNumber} / ∞</span>
                  <span style={{ opacity: .35 }}>·</span>
                  <span>{round.prompt.length} chars</span>
                  <span style={{ opacity: .35 }}>·</span>
                  <span>{round.prompt.split(/\s+/).filter(Boolean).length} words</span>
                </div>
              </div>

              {/* Mechanic copy */}
              <div style={{
                fontSize: 12, color: 'var(--t3)', lineHeight: 1.55,
                borderLeft: '2px solid var(--divC)', padding: '7px 14px', marginBottom: 18
              }}>
                Each day, <strong style={{ color: 'var(--t2)', fontWeight: 400 }}>one prompt.</strong>{' '}
                Vote on how it evolves — or whether it survives. The winner becomes tomorrow's.{' '}
                <strong style={{ color: 'var(--t2)', fontWeight: 400 }}>Forever.</strong>
              </div>

              {/* Yesterday strip */}
              {prevRound && prevSubmissions.length > 0 && (
                <YesterdayStrip
                  prevRound={prevRound}
                  prevSubmissions={prevSubmissions}
                  prevRoundNum={roundNumber - 1}
                />
              )}

              {/* Submit form — above vote section so it's reachable without scrolling */}
              {round.status === 'open' && (
                <>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    fontSize: 9, textTransform: 'uppercase', letterSpacing: '.14em', color: 'var(--t4)',
                    padding: '14px 0 10px', borderTop: '1px solid var(--div)'
                  }}>
                    <span>// write your own mutation</span>
                    <div style={{ flex: 1, height: 1, background: 'var(--div)' }} />
                  </div>
                  <SubmitForm
                    roundId={round.id}
                    currentPrompt={round.prompt}
                    onSubmitted={s => setSubmissions(prev => [...prev, s])}
                  />
                </>
              )}

              {/* Vote section */}
              <VoteSection
                submissions={topSubs}
                totalCount={submissions.length}
                roundId={round.id}
                closed={round.status === 'closed'}
                winnerId={round.winner_submission_id}
                roundNum={roundNumber}
              />

              {/* See all link */}
              {submissions.length > TOP_N && (
                <a
                  href={`/round/${round.id}`}
                  style={{
                    display: 'inline-block', marginBottom: 20,
                    fontSize: 10, textTransform: 'uppercase', letterSpacing: '.12em',
                    color: 'var(--t3)', textDecoration: 'none', transition: 'color .12s'
                  }}
                >
                  // see all {submissions.length} mutations →
                </a>
              )}

              {/* Mobile chain pills */}
              <div className="lg:hidden" style={{ marginTop: 28 }}>
                <div style={{ fontSize: 8, textTransform: 'uppercase', letterSpacing: '.13em', color: 'var(--t4)', marginBottom: 6 }}>
                  // chain · {roundNumber} rounds
                </div>
                <div style={{ display: 'flex', gap: 5, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 4 }}>
                  <div
                    onClick={() => setPanel({ type: 'active' })}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0,
                      fontSize: 9, textTransform: 'uppercase', letterSpacing: '.07em',
                      padding: '3px 8px', borderRadius: 20,
                      border: '1px solid rgba(250,204,21,.3)',
                      background: 'rgba(250,204,21,.06)', color: 'var(--lamp)',
                      cursor: 'pointer', whiteSpace: 'nowrap'
                    }}
                  >
                    <span className="lamp-dot" style={{ width: 5, height: 5 }} />
                    {String(roundNumber).padStart(3, '0')}
                  </div>
                  {sidebarChain.map(r => {
                    const ts = tagStyle(r.winner_mutation_type)
                    return (
                      <div
                        key={r.id}
                        onClick={() => setPanel({ type: 'round', data: r })}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0,
                          fontSize: 9, textTransform: 'uppercase', letterSpacing: '.07em',
                          padding: '3px 8px', borderRadius: 20,
                          border: `1px solid ${ts.borderColor}`,
                          background: ts.background, color: ts.color,
                          cursor: 'pointer', whiteSpace: 'nowrap'
                        }}
                      >
                        {String(r.roundNum).padStart(3, '0')}
                        {r.winner_mutation_type && ` ${r.winner_mutation_type.slice(0, 3)}`}
                      </div>
                    )
                  })}
                  {roundNumber > sidebarChain.length + 1 && (
                    <a
                      href="/history"
                      style={{
                        display: 'flex', alignItems: 'center', flexShrink: 0,
                        fontSize: 9, padding: '3px 8px', color: 'var(--t4)',
                        borderRadius: 20, border: '1px solid var(--div)', whiteSpace: 'nowrap',
                        textDecoration: 'none'
                      }}
                    >
                      ···view all
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Panel: Round detail */}
          {panel.type === 'round' && (
            <div style={{ maxWidth: 820, animation: 'rise .22s ease both' }}>
              <button
                onClick={() => setPanel({ type: 'active' })}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, fontSize: 10,
                  color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.1em',
                  cursor: 'pointer', marginBottom: 24, border: 'none', background: 'none',
                  fontFamily: 'inherit', padding: 0, transition: 'color .12s'
                }}
              >
                ← back to {roundLabel}
              </button>

              <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '.12em', color: 'var(--t4)', marginBottom: 10 }}>
                ROUND_{String(panel.data.roundNum).padStart(3, '0')} · closed
                {panel.data.closed_at && ` · ${new Date(panel.data.closed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`}
              </div>

              <div style={{
                fontFamily: 'Georgia, serif',
                fontSize: 'clamp(18px, 2.2vw, 26px)',
                lineHeight: 1.35, color: 'var(--amber)', marginBottom: 20
              }}>
                {panel.data.prompt}
              </div>

              {panel.data.winner_mutation_type && (
                <>
                  <div style={{
                    fontSize: 9, textTransform: 'uppercase', letterSpacing: '.13em', color: 'var(--t4)',
                    marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8
                  }}>
                    // result
                    <div style={{ flex: 1, height: 1, background: 'var(--div)' }} />
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: 10, textTransform: 'uppercase', letterSpacing: '.09em',
                      padding: '4px 10px', borderRadius: 3, border: '1px solid',
                      color: 'var(--lamp)', borderColor: 'rgba(250,204,21,.35)', background: 'var(--lT1)'
                    }}>
                      {panel.data.winner_mutation_type} won
                    </span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Panel: Full chain */}
          {panel.type === 'fullchain' && (
            <div style={{ animation: 'rise .22s ease both' }}>
              <button
                onClick={() => setPanel({ type: 'active' })}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, fontSize: 10,
                  color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.1em',
                  cursor: 'pointer', marginBottom: 24, border: 'none', background: 'none',
                  fontFamily: 'inherit', padding: 0, transition: 'color .12s'
                }}
              >
                ← back to {roundLabel}
              </button>

              <div style={{
                fontSize: 9, textTransform: 'uppercase', letterSpacing: '.13em', color: 'var(--t4)',
                marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10
              }}>
                // full chain · {roundNumber} rounds · oldest first
                <div style={{ flex: 1, height: 1, background: 'var(--div)' }} />
              </div>

              <div style={{ overflowX: 'auto', paddingBottom: 12, scrollbarWidth: 'thin', scrollbarColor: 'rgba(240,240,240,.1) transparent' }}>
                <div style={{ display: 'flex', gap: 10, width: 'max-content' }}>
                  {/* Past rounds — oldest first */}
                  {[...chainRounds].reverse().map(r => {
                    const ts = tagStyle(r.winner_mutation_type)
                    return (
                      <div
                        key={r.id}
                        onClick={() => setPanel({ type: 'round', data: r })}
                        style={{
                          width: 148, flexShrink: 0,
                          border: '1px solid var(--div)',
                          borderRadius: 4, padding: '11px 12px', background: 'var(--warm)',
                          cursor: 'pointer', transition: 'border-color .12s'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 7 }}>
                          <span style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--t3)' }}>
                            {String(r.roundNum).padStart(3, '0')}
                          </span>
                          {r.winner_mutation_type && (
                            <span style={{
                              fontSize: 7, textTransform: 'uppercase', letterSpacing: '.06em',
                              padding: '1px 4px', borderRadius: 2, border: '1px solid',
                              color: ts.color, borderColor: ts.borderColor, background: ts.background
                            }}>
                              {r.winner_mutation_type.slice(0, 3)}
                            </span>
                          )}
                        </div>
                        <div style={{
                          fontFamily: 'Georgia, serif', fontSize: 11, color: 'var(--t3)', lineHeight: 1.4,
                          display: '-webkit-box', overflow: 'hidden'
                        } as React.CSSProperties} className="line-clamp-3">
                          {r.prompt}
                        </div>
                      </div>
                    )
                  })}

                  {/* Current round */}
                  <div
                    onClick={() => setPanel({ type: 'active' })}
                    style={{
                      width: 148, flexShrink: 0,
                      border: '1px solid rgba(250,204,21,.3)',
                      borderRadius: 4, padding: '11px 12px',
                      background: 'rgba(250,204,21,.022)',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 7 }}>
                      <span style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--lamp)' }}>
                        {String(roundNumber).padStart(3, '0')}
                      </span>
                      <span style={{
                        fontSize: 7, textTransform: 'uppercase', letterSpacing: '.06em',
                        padding: '1px 4px', borderRadius: 2, border: '1px solid',
                        color: 'var(--lamp)', borderColor: 'rgba(250,204,21,.3)', background: 'var(--lT1)'
                      }}>live</span>
                      <span className="lamp-dot" style={{ width: 5, height: 5, marginLeft: 'auto' }} />
                    </div>
                    <div style={{
                      fontFamily: 'Georgia, serif', fontSize: 11,
                      color: 'rgba(212,201,178,.7)', lineHeight: 1.4,
                      display: '-webkit-box', overflow: 'hidden'
                    } as React.CSSProperties} className="line-clamp-3">
                      {round.prompt}
                    </div>
                  </div>
                </div>
              </div>

              <a href="/history" style={{
                display: 'inline-block', marginTop: 16, fontSize: 9,
                textTransform: 'uppercase', letterSpacing: '.12em',
                color: 'var(--cyan)', textDecoration: 'none'
              }}>
                view complete history →
              </a>
            </div>
          )}
        </main>
      </div>
    </>
  )
}

function SidebarItem({
  active, accent, onClick, children
}: {
  active: boolean
  accent: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'stretch', cursor: 'pointer',
        borderBottom: '1px solid rgba(240,240,240,.04)',
        background: active ? 'rgba(0,229,255,.03)' : undefined,
        transition: 'background .11s', position: 'relative'
      }}
    >
      <div style={{ width: 3, background: accent, flexShrink: 0 }} />
      <div style={{ padding: '8px 28px 8px 10px', flex: 1, minWidth: 0 }}>
        {children}
      </div>
    </div>
  )
}
