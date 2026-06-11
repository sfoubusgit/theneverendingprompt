import { supabase } from '@/lib/supabase'
import { Submission } from '@/types'
import RoundClient from '@/components/RoundClient'
import HowItWorksToggle from '@/components/HowItWorksToggle'
import ImageLightbox from '@/components/ImageLightbox'

export const dynamic = 'force-dynamic'

async function getSubmissionsWithCounts(roundId: string): Promise<Submission[]> {
  const { data: subs } = await supabase
    .from('submissions')
    .select('*, votes(count)')
    .eq('round_id', roundId)
    .order('created_at', { ascending: true })

  return (subs ?? []).map((s: any) => ({
    ...s,
    vote_count: s.votes?.[0]?.count ?? 0,
    votes: undefined,
  }))
}

export default async function Home() {
  const { data: round } = await supabase
    .from('rounds')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const { data: pastRounds } = await supabase
    .from('rounds')
    .select('id, prompt, image_url, closed_at, winner_submission_id, submissions(id, prompt)')
    .eq('status', 'closed')
    .gte('closed_at', oneMonthAgo)
    .order('closed_at', { ascending: false })

  const { data: originRound } = await supabase
    .from('rounds')
    .select('id, prompt, image_url, created_at')
    .order('created_at', { ascending: true })
    .limit(1)
    .single()

  const { count: roundNumber } = await supabase
    .from('rounds')
    .select('*', { count: 'exact', head: true })

  if (!round) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="font-mono text-zinc-500">$ no active round. check back soon.</p>
      </main>
    )
  }

  const submissions = await getSubmissionsWithCounts(round.id)
  const hoursOpen = Math.max(0, Math.floor((Date.now() - new Date(round.created_at).getTime()) / 3600000))
  const roundLabel = `ROUND_${String(roundNumber ?? 1).padStart(3, '0')}`

  return (
    <main className="min-h-screen bg-black text-[#f0f0f0]">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Terminal header */}
        <header className="mb-10 pt-2 flex items-center justify-between">
          <p className="font-mono text-sm text-zinc-500 cursor">theneverendingprompt.xyz</p>
          <div className="flex items-center gap-2">
            <a
              href="https://www.instagram.com/theneverendingprompt.xyz/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs inline-flex items-center gap-1.5 border border-zinc-700 text-zinc-300 hover:border-zinc-400 hover:text-white px-3 py-1.5 transition-colors"
              aria-label="Follow on Instagram"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
              </svg>
              follow
            </a>
            <a
              href="/history"
              className="font-mono text-xs inline-flex items-center border border-zinc-700 text-zinc-300 hover:border-zinc-400 hover:text-white px-3 py-1.5 transition-colors"
            >
              $ history
            </a>
            <HowItWorksToggle />
          </div>
        </header>

        {/* Prompt */}
        <section className="mb-10">
          <p className="font-mono text-xs text-zinc-600 mb-2 uppercase tracking-widest">{roundLabel} · {round.status === 'open' ? 'open' : 'closed'}</p>

          {round.image_url && (
            <div className="mb-6 w-full aspect-square overflow-hidden bg-zinc-900 border border-zinc-800">
              <img src={round.image_url} alt="Round image" className="w-full h-full object-cover" />
            </div>
          )}

          <p className="font-mono text-2xl md:text-3xl text-white leading-relaxed mb-3">
            "{round.prompt}"
          </p>

          <p className="font-mono text-xs text-zinc-600">
            {round.status === 'open'
              ? `[${submissions.length} submission${submissions.length !== 1 ? 's' : ''} · opened ${hoursOpen}h ago]`
              : '[round closed — winner selected]'}
          </p>
        </section>

        {/* Submit + Vote */}
        <section className="mb-10">
          <RoundClient
            roundId={round.id}
            currentPrompt={round.prompt}
            submissions={submissions}
            closed={round.status === 'closed'}
            winnerId={round.winner_submission_id}
          />
        </section>

        {/* Chain history — git log style */}
        {((pastRounds && pastRounds.length > 0) || originRound) && (
          <section className="mb-10">
            <p className="font-mono text-xs text-zinc-600 mb-5">// CHAIN HISTORY</p>
            <div className="relative">
              {/* Vertical connecting line */}
              <div className="absolute left-[5px] top-2 bottom-2 w-px bg-zinc-800" />

              <div className="space-y-5 pl-6">
                {(pastRounds ?? []).map((r: any) => {
                  const winner = (r.submissions ?? []).find((s: any) => s.id === r.winner_submission_id)
                  const hash = r.id.slice(0, 6)
                  return (
                    <div key={r.id} className="relative">
                      {/* * dot */}
                      <div className="absolute -left-6 top-[5px] w-[11px] h-[11px] border border-zinc-600 bg-black" />
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-mono text-[10px] text-zinc-600 mb-1">
                            {hash} · {new Date(r.closed_at).toLocaleDateString('en-GB').replace(/\//g, '.')}
                          </p>
                          <p className="font-mono text-xs text-zinc-400 line-clamp-1">"{r.prompt}"</p>
                          {winner && (
                            <>
                              <p className="font-mono text-[10px] text-zinc-700 my-0.5 ml-2">↓</p>
                              <p className="font-mono text-xs text-zinc-200 line-clamp-1 ml-2">"{winner.prompt}"</p>
                            </>
                          )}
                        </div>
                        {r.image_url && (
                          <ImageLightbox src={r.image_url} />
                        )}
                      </div>
                    </div>
                  )
                })}

                {originRound && !(pastRounds ?? []).some((r: any) => r.id === originRound.id) && (
                  <div className="relative">
                    <div className="absolute -left-6 top-[5px] w-[11px] h-[11px] border border-zinc-700 bg-black" />
                    <p className="font-mono text-[10px] text-zinc-600 mb-1">
                      {originRound.id.slice(0, 6)} · {new Date(originRound.created_at).toLocaleDateString('en-GB').replace(/\//g, '.')} · [origin]
                    </p>
                    <p className="font-mono text-xs text-zinc-400">"{originRound.prompt}"</p>
                  </div>
                )}
              </div>
            </div>
            <a href="/history" className="font-mono text-[10px] text-zinc-700 hover:text-zinc-500 transition-colors mt-4 inline-block">
              $ view full history →
            </a>
          </section>
        )}


      </div>
    </main>
  )
}
