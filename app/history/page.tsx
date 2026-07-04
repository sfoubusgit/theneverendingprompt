import { supabase } from '@/lib/supabase'
import Wordmark from '@/components/Wordmark'

export const dynamic = 'force-dynamic'

function tagStyle(mt: string | null | undefined) {
  if (mt === 'extend') return { color: 'var(--cyan)', borderColor: 'var(--cT3)', background: 'var(--cT1)' }
  if (mt === 'preserve') return { color: 'var(--t3)', borderColor: 'var(--div)', background: 'transparent' }
  if (mt === 'mutate') return { color: 'var(--pink)', borderColor: 'var(--pT3)', background: 'var(--pT1)' }
  return null
}

export default async function HistoryPage() {
  const { data: rounds } = await supabase
    .from('rounds')
    .select('id, prompt, image_url, closed_at, created_at, status, winner_submission_id, submissions(id, prompt, mutation_type)')
    .eq('status', 'closed')
    .order('closed_at', { ascending: false })

  const { data: originRound } = await supabase
    .from('rounds')
    .select('id, prompt, image_url, created_at')
    .order('created_at', { ascending: true })
    .limit(1)
    .single()

  const { count: totalCount } = await supabase
    .from('rounds')
    .select('*', { count: 'exact', head: true })

  const allRounds = rounds ?? []

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Top nav */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        height: 44, background: 'rgba(5,5,8,.97)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--divC)',
        display: 'flex', alignItems: 'center', padding: '0 24px', gap: 4
      }}>
        <a href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <Wordmark />
        </a>
        <div style={{ marginLeft: 'auto' }}>
          <a href="/" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.09em', color: 'var(--t3)', textDecoration: 'none' }}>
            ← back
          </a>
        </div>
      </header>

      <div style={{ height: 1, background: 'linear-gradient(90deg, var(--pink), var(--cyan))', opacity: .38 }} />

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px 80px' }}>

        <div style={{ marginBottom: 32 }}>
          <div style={{
            fontSize: 9, textTransform: 'uppercase', letterSpacing: '.14em',
            color: 'var(--cyan)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8
          }}>
            // chain history
            <div style={{ flex: 1, height: 1, background: 'var(--divC)' }} />
          </div>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(24px, 3vw, 36px)', color: 'var(--amber)', lineHeight: 1.2 }}>
            The Never Ending Prompt
          </div>
          <div style={{ fontSize: 11, color: 'var(--t4)', marginTop: 8, textTransform: 'uppercase', letterSpacing: '.1em' }}>
            {allRounds.length} round{allRounds.length !== 1 ? 's' : ''} in the chain · still running
          </div>
        </div>

        {/* Chain list */}
        <div style={{ position: 'relative' }}>
          <div style={{
            position: 'absolute', left: 5, top: 4, bottom: 4,
            width: 1, background: 'var(--divC)'
          }} />

          <div style={{ paddingLeft: 28 }}>
            {allRounds.map((r: any, i: number) => {
              const winner = (r.submissions ?? []).find((s: any) => s.id === r.winner_submission_id)
              const mt = winner?.mutation_type ?? null
              const ts = tagStyle(mt)
              const roundNum = (totalCount ?? allRounds.length) - 1 - i
              const hash = r.id.slice(0, 6)
              const isOrigin = originRound?.id === r.id

              return (
                <div key={r.id} style={{ position: 'relative', marginBottom: 28 }}>
                  {/* Timeline dot */}
                  <div style={{
                    position: 'absolute', left: -28 + 5 - 5, top: 5,
                    width: 10, height: 10,
                    border: `1px solid ${ts ? ts.borderColor : 'var(--divC)'}`,
                    background: 'var(--bg)',
                    borderRadius: ts ? 0 : 0
                  }} />

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, justifyContent: 'space-between' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
                        fontSize: 9, textTransform: 'uppercase', letterSpacing: '.09em',
                        color: 'var(--t4)', marginBottom: 5
                      }}>
                        <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                          ROUND_{String(roundNum).padStart(3, '0')}
                        </span>
                        <span style={{ opacity: .5 }}>·</span>
                        <span>{hash}</span>
                        <span style={{ opacity: .5 }}>·</span>
                        <span>{r.closed_at ? new Date(r.closed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</span>
                        {isOrigin && <span style={{ color: 'var(--t4)', border: '1px solid var(--div)', padding: '0 5px', borderRadius: 2 }}>[origin]</span>}
                      </div>

                      <p style={{
                        fontFamily: 'Georgia, serif', fontSize: 'clamp(13px, 1.5vw, 16px)',
                        color: 'var(--t3)', lineHeight: 1.45, marginBottom: winner ? 10 : 0
                      }}>
                        "{r.prompt}"
                      </p>

                      {winner && (
                        <div style={{
                          display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 8
                        }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, paddingTop: 2, flexShrink: 0 }}>
                            <div style={{ width: 1, height: 12, background: 'var(--divC)' }} />
                            <div style={{ width: 5, height: 5, borderRadius: '50%', background: ts ? ts.color : 'var(--t4)' }} />
                          </div>
                          <div>
                            {ts && (
                              <span style={{
                                display: 'inline-block', fontSize: 8, textTransform: 'uppercase', letterSpacing: '.09em',
                                padding: '1px 6px', borderRadius: 2, border: '1px solid',
                                color: ts.color, borderColor: ts.borderColor, background: ts.background,
                                marginBottom: 5
                              }}>
                                {mt} won
                              </span>
                            )}
                            <p style={{
                              fontFamily: 'Georgia, serif', fontSize: 'clamp(13px, 1.5vw, 16px)',
                              color: 'var(--t2)', lineHeight: 1.45
                            }}>
                              "{winner.prompt}"
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {r.image_url && (
                      <img
                        src={r.image_url}
                        alt=""
                        style={{
                          width: 52, height: 52, objectFit: 'cover', flexShrink: 0,
                          border: '1px solid var(--divC)', borderRadius: 2
                        }}
                      />
                    )}
                  </div>
                </div>
              )
            })}

            {/* Origin note if not already shown */}
            {originRound && !allRounds.some((r: any) => r.id === originRound.id) && (
              <div style={{ position: 'relative', marginBottom: 28 }}>
                <div style={{
                  position: 'absolute', left: -28 + 5 - 5, top: 5,
                  width: 10, height: 10,
                  border: '1px solid var(--divC)', background: 'var(--bg)'
                }} />
                <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '.09em', color: 'var(--t4)', marginBottom: 5 }}>
                  ROUND_001 · {originRound.id.slice(0, 6)} · {new Date(originRound.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} · [origin]
                </div>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: 14, color: 'var(--t3)', lineHeight: 1.45 }}>
                  "{originRound.prompt}"
                </p>
              </div>
            )}
          </div>
        </div>

        <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid var(--divC)' }}>
          <div style={{ fontSize: 42, lineHeight: 1, color: 'var(--t4)', marginBottom: 8 }}>∞</div>
          <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '.2em', color: 'var(--t4)', marginBottom: 20 }}>
            The prompt never dies.
          </div>
          <a href="/" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--cyan)', textDecoration: 'none' }}>
            ← back to today's prompt
          </a>
        </div>

      </div>
    </div>
  )
}
