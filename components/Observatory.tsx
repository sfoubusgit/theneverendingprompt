'use client'

import { useEffect, useState } from 'react'
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


export default function Observatory({
  branches,
  evolutionState,
  materializedPosts,
}: {
  branches: Branch[]
  evolutionState: EvolutionState
  materializedPosts: Post[]
}) {
  const [revealed, setRevealed] = useState(false)

  const posts = [...materializedPosts].sort(
    (a, b) => +new Date(a.created_at) - +new Date(b.created_at)
  )
  const rootBranch     = branches.find(b => !b.parent_id) ?? branches[0]
  const originPrompt   = rootBranch?.prompt_history?.[0] ?? rootBranch?.prompt ?? ''
  const { dayCount, cycleStep } = evolutionState

  const entries = posts.map((post, idx) => {
    const dayNum = idx + 1
    const branch = branches.find(b => b.id === post.branch_id)
    return {
      dayNum,
      branch,
      prompt: post.prompt,
      imageUrl: post.instagram_post_url,
    }
  })

  const spawnedIds = new Set<string>()

  // ─── Preload dismiss ─────────────────────────────────────────────────
  useEffect(() => {
    const el = document.getElementById('preload')
    if (!el) return
    const t1 = setTimeout(() => {
      el.style.transition = 'opacity 0.55s ease'
      el.style.opacity    = '0'
    }, 1050)
    const t2 = setTimeout(() => { el.style.display = 'none' }, 1700)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  // ─── Content reveal ──────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 1450)
    return () => clearTimeout(t)
  }, [])


  // ─── Palimpsest scroll ───────────────────────────────────────────────
  useEffect(() => {
    const elems = document.querySelectorAll('[data-palimpsest]')
    if (!elems.length) return
    const obs = new IntersectionObserver((list) => {
      list.forEach(e => {
        const above = e.boundingClientRect.top < 0
        if (!e.isIntersecting && above) e.target.classList.add('obs-receding')
        else e.target.classList.remove('obs-receding')
      })
    }, { threshold: Array.from({length:21},(_,i)=>i/20) })
    elems.forEach(e => obs.observe(e))
    return () => obs.disconnect()
  }, [entries.length])

  // ─── Scroll invite ───────────────────────────────────────────────────
  useEffect(() => {
    const el = document.getElementById('scroll-invite')
    if (!el) return
    const hide = () => { el.style.opacity='0' }
    window.addEventListener('scroll', hide, { once:true, passive:true })
    const t = setTimeout(hide, 11000)
    return () => { window.removeEventListener('scroll', hide); clearTimeout(t) }
  }, [])

  // ─── Derived ─────────────────────────────────────────────────────────
  const branchLabel = (id:string) => {
    const idx = branches.findIndex(b => b.id===id)
    return String.fromCharCode(65+idx)
  }
  const rootLabel    = rootBranch ? branchLabel(rootBranch.id) : 'A'
  const specDays     = Math.min(dayCount, 5)
  const phaseColors  = [
    'rgba(255,255,255,0.09)',
    'rgba(255,255,255,0.13)',
    'rgba(255,32,128,0.42)',
    'rgba(255,255,255,0.09)',
    'rgba(10,238,255,1)',
  ]

  // Show the most recently materialized prompt, not the raw evolving branch prompt
  const latestPost  = materializedPosts[0] ?? null
  const displayPrompt = latestPost?.prompt ?? rootBranch?.prompt ?? ''

  // Prompt word-by-word reveal — capped so long prompts never exceed 1.4s total
  const promptWords = displayPrompt.split(/\s+/).filter(Boolean)
  const wordDelay   = (i: number) => Math.min(i * 52, 1400)
  const captionDelay = Math.min(promptWords.length * 52, 1400) + 480

  return (
    <>
      {/* ── Preload ── */}
      <div id="preload" style={{
        position:'fixed', inset:0, background:'#000', zIndex:400,
        pointerEvents:'none', display:'flex', alignItems:'flex-start',
        padding:'26px 34px',
      }}>
        <span className="pl-text" style={{
          fontFamily:'"Courier New",monospace',
          fontSize:11, letterSpacing:'0.26em', color:'#0AEEFF',
          textTransform:'uppercase', display:'block',
        }}>
          observer clearance verified
        </span>
      </div>

      {/* ── Navigation ── */}
      <nav aria-label="Main navigation" style={{
        position:'fixed', top:0, left:0, right:0, height:50,
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'0 34px',
        background:'rgba(0,0,0,0.82)', backdropFilter:'blur(24px)',
        borderBottom:'1px solid rgba(255,255,255,0.038)', zIndex:200,
      }}>
        {/* Home link — TNEP is always a link */}
        <Link href="/" style={{
          fontFamily:'"Courier New",monospace', fontSize:10,
          letterSpacing:'0.36em', color:'#0AEEFF',
          textTransform:'uppercase', fontWeight:600,
          textDecoration:'none',
        }}>
          TNEP
        </Link>

        <span style={{
          position:'absolute', left:'50%', transform:'translateX(-50%)',
          fontFamily:'"Courier New",monospace', fontSize:11,
          letterSpacing:'0.18em', color:'rgba(255,255,255,0.42)',
          textTransform:'uppercase', whiteSpace:'nowrap',
        }} className="nav-center">
          The Neverending Prompt&nbsp;&nbsp;·&nbsp;&nbsp;Day {dayCount}
        </span>

        <div style={{ display:'flex', gap:20, alignItems:'center' }}>
          {/* Internal navigation */}
          <Link href="/tree" style={{
            fontFamily:'"Courier New",monospace', fontSize:11,
            letterSpacing:'0.14em', color:'rgba(255,255,255,0.45)',
            textDecoration:'none', textTransform:'uppercase',
          }}>
            tree
          </Link>
          <a href="#z3" style={{
            fontFamily:'"Courier New",monospace', fontSize:11,
            letterSpacing:'0.14em', color:'rgba(255,255,255,0.45)',
            textDecoration:'none', textTransform:'uppercase',
          }}>
            archive
          </a>
          {/* Primary conversion CTA — visually distinct */}
          <a
            href="https://instagram.com/theneverendingprompt.xyz"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow TNEP on Instagram (opens in new tab)"
            style={{
              fontFamily:'"Courier New",monospace', fontSize:9,
              letterSpacing:'0.18em', color:'#0AEEFF',
              textDecoration:'none', textTransform:'uppercase',
              border:'1px solid rgba(10,238,255,0.30)',
              padding:'5px 12px', borderRadius:1,
              transition:'border-color 0.15s ease, color 0.15s ease',
            }}
          >
            follow ↗
          </a>
        </div>
      </nav>

      <main id="main-content">
      {/* ── ZONE 1 — WITNESS ── */}
      <section id="z1" aria-label="Current prompt — the organism's living output" style={{
        position:'relative', height:'100vh', overflow:'hidden', background:'#000',
      }}>

        {/* Specimen header — top-left */}
        <div className="z1-meta" style={{
          position:'absolute', top:68, left:34, zIndex:10,
          opacity: revealed ? 1 : 0,
          transform: revealed ? 'none' : 'translateY(6px)',
          transition:'opacity 0.9s ease, transform 0.9s ease',
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
            <div style={{
              width:5, height:5, borderRadius:'50%',
              background:'#0AEEFF', flexShrink:0,
              boxShadow:'0 0 8px rgba(10,238,255,0.95), 0 0 16px rgba(10,238,255,0.4)',
            }} />
            <span style={{
              fontFamily:'"Courier New",monospace', fontSize:11,
              letterSpacing:'0.20em', color:'#0AEEFF',
              textTransform:'uppercase', opacity:0.80,
            }}>
              Live
            </span>
          </div>
        </div>


        {/* THE PROMPT — monumental */}
        <div className="z1-prompt-wrap" style={{
          position:'absolute',
          top:'50%', transform:'translateY(-50%)',
          left:'clamp(34px,6vw,96px)',
          right:'clamp(34px,6vw,96px)',
          zIndex:10,
          maxWidth:900, margin:'0 auto',
        }}>
          {/* Prompt label */}
          <div style={{
            fontFamily:'"Courier New",monospace', fontSize:10,
            letterSpacing:'0.24em', color:'#0AEEFF',
            textTransform:'uppercase', marginBottom:18,
            textAlign:'center',
            opacity: revealed ? 0.80 : 0,
            transition:`opacity 0.7s ease 200ms`,
          }}>
            Active Prompt&nbsp;&nbsp;·&nbsp;&nbsp;Branch {rootLabel}&nbsp;&nbsp;·&nbsp;&nbsp;Day {dayCount}
          </div>

          <p style={{
            fontFamily:'Georgia,"Times New Roman",serif',
            fontSize:'clamp(20px,3.8vw,52px)',
            lineHeight:1.4,
            color:'rgba(243,243,240,0.95)',
            fontStyle:'italic',
            margin:0,
            letterSpacing:'-0.018em',
            textAlign:'center',
          }}>
            {promptWords.map((word,i) => (
              <span
                key={i}
                style={{
                  display:'inline-block',
                  marginRight:'0.28em',
                  opacity: revealed ? undefined : 0,
                  animation: revealed
                    ? `word-rise 0.58s cubic-bezier(0.16,1,0.3,1) ${wordDelay(i)}ms both`
                    : 'none',
                }}
              >
                {word}
              </span>
            ))}
          </p>

          {/* Prompt caption — appears after words */}
          <div style={{
            marginTop:20,
            fontFamily:'"Courier New",monospace', fontSize:11,
            letterSpacing:'0.14em', color:'rgba(255,255,255,0.50)',
            textAlign:'center',
            opacity: revealed ? 1 : 0,
            transition:`opacity 0.7s ease ${captionDelay}ms`,
          }}>
            Day {dayCount} of autonomous evolution&nbsp;&nbsp;·&nbsp;&nbsp;no human wrote this
          </div>

          {/* Zone 1 Instagram CTA — appears after caption */}
          <div style={{
            marginTop:28, textAlign:'center',
            opacity: revealed ? 1 : 0,
            transition:`opacity 0.7s ease ${captionDelay + 300}ms`,
          }}>
            <a
              href="https://instagram.com/theneverendingprompt.xyz"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow the organism on Instagram"
              style={{
                display:'inline-flex', alignItems:'center', gap:10,
                fontFamily:'"Courier New",monospace', fontSize:11,
                letterSpacing:'0.16em', color:'rgba(10,238,255,0.75)',
                textDecoration:'none', textTransform:'uppercase',
                borderBottom:'1px solid rgba(10,238,255,0.25)',
                paddingBottom:3,
                transition:'color 0.15s ease, border-color 0.15s ease',
              }}
              className="z1-ig-cta"
            >
              <span>Follow the organism on Instagram</span>
              <span aria-hidden="true" style={{fontSize:11}}>↗</span>
            </a>
          </div>
        </div>

        {/* Scroll invite */}
        <div id="scroll-invite" style={{
          position:'absolute', bottom:28, left:'50%', transform:'translateX(-50%)',
          width:1, height:34,
          background:'linear-gradient(to bottom,transparent,rgba(255,255,255,0.22))',
          zIndex:10,
        }} />
      </section>


      {/* ── ZONE 3 — TERRITORY ── */}
      <section id="z3" style={{
        background:'#020608', paddingTop:110,
        borderTop:'1px solid rgba(255,255,255,0.028)',
      }}>
        <div style={{
          fontFamily:'"Courier New",monospace', fontSize:11,
          letterSpacing:'0.36em', color:'rgba(255,255,255,0.12)',
          textTransform:'uppercase', marginBottom:110, textAlign:'center',
        }}>
          The Record
        </div>

        {[...entries].reverse().map((entry, revIdx) => {
          const idx       = entries.length - 1 - revIdx
          const isNewest  = idx === entries.length - 1
          // Dramatic font scale: newest → 60px, archives → 15px minimum
          const fontSize  = Math.max(15, Math.round(60 - revIdx*4.5))
          const isA       = !entry.branch?.parent_id
          const bColor    = isA ? '#0AEEFF' : '#FF2080'
          const bLabel    = entry.branch ? branchLabel(entry.branch.id) : 'A'
          const txtOpacity = isNewest ? 0.94 : Math.max(0.38, 0.86 - revIdx*0.065)

          let showSpawn = false
          if (entry.branch?.parent_id && !spawnedIds.has(entry.branch.id)) {
            spawnedIds.add(entry.branch.id)
            showSpawn = true
          }

          return (
            <div key={entry.dayNum} id={`day-${entry.dayNum}`}>
              {showSpawn && (
                <div style={{
                  height:'40vh', minHeight:280,
                  display:'flex', flexDirection:'column',
                  alignItems:'center', justifyContent:'center', gap:32,
                }}>
                  <svg width="200" height="130" viewBox="0 0 200 130" aria-hidden="true" style={{opacity:0.52}}>
                    <circle cx="100" cy="112" r="3" fill="rgba(255,255,255,0.16)" />
                    <line x1="100" y1="112" x2="46" y2="18" stroke="#0AEEFF" strokeWidth="1" opacity="0.40" />
                    <circle cx="46" cy="18" r="2.5" fill="#0AEEFF" opacity="0.58" />
                    <text x="24" y="13" fontFamily="Courier New" fontSize="8" fill="#0AEEFF" opacity="0.42">A</text>
                    <line x1="100" y1="112" x2="154" y2="18" stroke="#FF2080" strokeWidth="1" opacity="0.34" />
                    <circle cx="154" cy="18" r="2.5" fill="#FF2080" opacity="0.50" />
                    <text x="160" y="13" fontFamily="Courier New" fontSize="8" fill="#FF2080" opacity="0.38">B</text>
                  </svg>
                  <p style={{
                    fontFamily:'"Courier New",monospace', fontSize:13,
                    lineHeight:1.85, color:'rgba(255,255,255,0.22)',
                    textAlign:'center', maxWidth:340, letterSpacing:'0.04em',
                  }}>
                    On Day {entry.dayNum}, Branch B emerged.<br/>
                    The organism now carries two active lines of descent.
                  </p>
                </div>
              )}

              <div
                data-palimpsest
                style={{ position:'relative', paddingBottom:isNewest?130:110, transition:'opacity 0.5s ease' }}
              >
                {/* Branch line */}
                <div style={{
                  position:'absolute',
                  left:'max(34px,10vw)', top:0, bottom:0, width:1,
                  background:`linear-gradient(to bottom,${bColor}${isNewest?'4a':'22'},${bColor}00)`,
                }} />

                <div style={{
                  maxWidth:760,
                  marginLeft:'max(34px,10vw)',
                  paddingLeft:26,
                }}>
                  <header style={{
                    fontFamily:'"Courier New",monospace', fontSize:11,
                    letterSpacing:'0.18em',
                    color:isNewest ? bColor : `${bColor}70`,
                    textTransform:'uppercase', marginBottom:22,
                    display:'flex', alignItems:'center', gap:10, flexWrap:'wrap',
                  }}>
                    <span>Day {entry.dayNum}</span>
                    <span style={{opacity:0.28}}>·</span>
                    <span>Branch {bLabel}</span>
                    {isNewest && (
                      <>
                        <span style={{opacity:0.28}}>·</span>
                        <span>Vitality {entry.branch?.vitality??'—'}</span>
                        <span style={{opacity:0.28}}>·</span>
                        <span>◉ Materialized</span>
                      </>
                    )}
                  </header>

                  <p style={{
                    fontFamily:'Georgia,"Times New Roman",serif',
                    fontSize, lineHeight:1.40,
                    color:`rgba(243,243,240,${txtOpacity})`,
                    fontStyle:'normal', margin:0,
                    letterSpacing: isNewest ? '-0.012em' : '0',
                  }}>
                    {entry.prompt}
                  </p>

                  {isNewest && (
                    <div style={{ marginTop:48 }}>
                      {entry.imageUrl && (
                        <div style={{
                          width:'min(260px,72vw)', height:'min(260px,72vw)',
                          borderRadius:2,
                          overflow:'hidden',
                          marginBottom:12,
                        }}>
                          <img
                            src={entry.imageUrl}
                            alt={`Materialized — Day ${entry.dayNum}`}
                            style={{ width:'100%', height:'100%', objectFit:'cover', opacity:0.90 }}
                          />
                        </div>
                      )}
                      <span style={{
                        display:'block',
                        marginTop: entry.imageUrl ? 12 : 0,
                        fontFamily:'"Courier New",monospace', fontSize:10,
                        letterSpacing:'0.12em', color:'rgba(255,255,255,0.28)',
                      }}>
                        Branch {bLabel}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {/* Origin fossil */}
        {originPrompt && (
          <div style={{ background:'linear-gradient(to bottom,#020608,#0a0700)', paddingBottom:150 }}>
            <div data-palimpsest style={{ position:'relative', paddingBottom:70, transition:'opacity 0.5s ease' }}>
              <div style={{
                position:'absolute',
                left:'max(34px,10vw)', top:0, bottom:0, width:1,
                background:'linear-gradient(to bottom,rgba(255,238,160,0.20),rgba(255,238,160,0.01))',
              }} />
              <div style={{ maxWidth:760, marginLeft:'max(34px,10vw)', paddingLeft:26 }}>
                <header style={{
                  fontFamily:'"Courier New",monospace', fontSize:11,
                  letterSpacing:'0.18em', color:'rgba(255,238,160,0.42)',
                  textTransform:'uppercase', marginBottom:22,
                  display:'flex', alignItems:'center', gap:10, flexWrap:'wrap',
                }}>
                  <span>Origin</span>
                  <span style={{opacity:0.28}}>·</span>
                  <span>Extinct</span>
                  <span style={{opacity:0.28}}>·</span>
                  <span>Day 0 · Vitality 0</span>
                </header>
                <p style={{
                  fontFamily:'Georgia,"Times New Roman",serif',
                  fontSize:22, lineHeight:1.55,
                  color:'rgba(255,238,160,0.58)', fontStyle:'italic', margin:0,
                }}>
                  {originPrompt}
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── ABOUT ── */}
      <section style={{
        background:'#0a0700',
        padding:'120px 48px 100px',
        borderTop:'1px solid rgba(255,238,160,0.045)',
      }}>
        <div style={{ maxWidth:580, margin:'0 auto' }}>
          <div style={{
            fontFamily:'"Courier New",monospace', fontSize:11,
            letterSpacing:'0.36em', color:'rgba(255,255,255,0.11)',
            textTransform:'uppercase', marginBottom:64, textAlign:'center',
          }}>
            How the organism works
          </div>

          {[
            {
              title:'The System',
              body:'The Neverending Prompt is an autonomous generative system. Every day, a mutation module fires on each active branch, transforming an image-generation prompt through five phases. No human writes these prompts. No human decides what gets posted to Instagram.',
            },
            {
              title:'Survival',
              body:'The Instagram audience shapes which branches survive. Engagement lifts vitality; indifference accelerates decay. Branches that go unnoticed eventually die. Dead branches become fossils — preserved, extinct, documented. The organism does not know you are watching.',
            },
          ].map(({ title, body }) => (
            <div key={title} style={{ marginBottom:52 }}>
              <div style={{
                fontFamily:'"Courier New",monospace', fontSize:11,
                letterSpacing:'0.22em', color:'rgba(255,255,255,0.32)',
                textTransform:'uppercase', marginBottom:18,
              }}>
                {title}
              </div>
              <p style={{
                fontSize:16, lineHeight:1.90,
                color:'rgba(255,255,255,0.62)', margin:0,
              }}>
                {body}
              </p>
            </div>
          ))}

        </div>
      </section>
      </main>

      {/* ── FOOTER ── */}
      <footer style={{
        padding:'68px 48px 84px',
        background:'#0a0700',
        display:'flex', justifyContent:'space-between', alignItems:'flex-end',
        borderTop:'1px solid rgba(255,238,160,0.038)',
        gap:48, flexWrap:'wrap',
      }}>
        <div>
          <div style={{
            fontFamily:'"Courier New",monospace', fontSize:11,
            lineHeight:2.0, letterSpacing:'0.18em',
            color:'rgba(255,255,255,0.16)', textTransform:'uppercase',
            marginBottom:18,
          }}>
            TNEP · tnep.xyz<br/>
            Autonomous system · 2026
          </div>
          <div style={{ display:'flex', gap:22 }}>
            {['/privacy','/terms','/cookies'].map(href => (
              <Link key={href} href={href} style={{
                fontFamily:'"Courier New",monospace', fontSize:10,
                letterSpacing:'0.14em', color:'rgba(255,255,255,0.22)',
                textDecoration:'none', textTransform:'uppercase',
              }}>
                {href.slice(1).charAt(0).toUpperCase()+href.slice(2)}
              </Link>
            ))}
          </div>
        </div>
        <p style={{
          fontFamily:'Georgia,"Times New Roman",serif',
          fontSize:30, lineHeight:1.32,
          color:'rgba(255,238,160,0.20)', fontStyle:'italic',
          textAlign:'right', margin:0, maxWidth:380,
        }}>
          The prompt never dies.
        </p>
      </footer>

      {/* ── SPECTRUM STRIP ── */}
      <div style={{
        position:'fixed', bottom:0, left:0, right:0, height:36,
        background:'rgba(0,0,0,0.93)',
        borderTop:'1px solid rgba(255,255,255,0.045)',
        display:'flex', zIndex:180,
        backdropFilter:'blur(14px)',
      }}>
        {Array.from({length:specDays}, (_, i) => {
          const dayNum    = i+1
          const dist      = dayCount - dayNum
          const sIdx      = ((cycleStep-dist)%5+5)%5
          const isActive  = dayNum===dayCount
          const barH      = isActive ? 22 : [7,11,17,10][Math.min(sIdx,3)]??7
          return (
            <a key={dayNum} href={`#day-${dayNum}`} style={{
              flex:1, display:'flex', flexDirection:'column',
              alignItems:'center', justifyContent:'flex-end',
              padding:'0 0 7px', textDecoration:'none',
              borderLeft: isActive ? '1px solid rgba(10,238,255,0.42)' : 'none',
              minHeight:36,
            }}>
              <div style={{
                width:9, height:barH, borderRadius:'1px 1px 0 0', marginBottom:4,
                background: isActive ? '#0AEEFF' : phaseColors[sIdx]??'rgba(255,255,255,0.07)',
                boxShadow:  isActive ? '0 0 8px rgba(10,238,255,0.52)' : 'none',
              }} />
              <span style={{
                fontFamily:'"Courier New",monospace', fontSize:9, letterSpacing:'0.08em',
                color: isActive ? '#0AEEFF' : 'rgba(255,255,255,0.26)',
              }}>
                D{dayNum}
              </span>
            </a>
          )
        })}
      </div>
    </>
  )
}
