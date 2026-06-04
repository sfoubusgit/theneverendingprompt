import { supabase } from '@/lib/supabase'
import { Submission } from '@/types'
import RoundClient from '@/components/RoundClient'

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

  const { data: pastRounds } = await supabase
    .from('rounds')
    .select('id, prompt, image_url, closed_at, winner_submission_id, submissions(id, prompt)')
    .eq('status', 'closed')
    .order('closed_at', { ascending: false })
    .limit(10)

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
        <header className="mb-10 pt-2">
          <p className="font-mono text-sm text-zinc-500 cursor">theneverendingprompt.xyz</p>
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

        {/* Chain history */}
        {((pastRounds && pastRounds.length > 0) || originRound) && (
          <section className="mb-10">
            <p className="font-mono text-xs text-zinc-600 mb-4">// CHAIN HISTORY</p>
            <div className="flex gap-3 overflow-x-auto pb-3 -mx-4 px-4">
              {(pastRounds ?? []).map((r: any) => {
                const winner = (r.submissions ?? []).find((s: any) => s.id === r.winner_submission_id)
                return (
                  <div key={r.id} className="flex-shrink-0 w-44 border border-zinc-800 bg-zinc-950 p-3">
                    {r.image_url && (
                      <div className="w-full aspect-video overflow-hidden bg-zinc-900 mb-3">
                        <img src={r.image_url} alt="" className="w-full h-full object-contain" />
                      </div>
                    )}
                    <p className="font-mono text-[10px] text-zinc-600 mb-1">{new Date(r.closed_at).toLocaleDateString()}</p>
                    <p className="font-mono text-[10px] text-zinc-400 line-clamp-2">"{r.prompt}"</p>
                    {winner && (
                      <>
                        <p className="font-mono text-[10px] text-zinc-700 my-1">↓</p>
                        <p className="font-mono text-[10px] text-zinc-200 line-clamp-2">"{winner.prompt}"</p>
                      </>
                    )}
                  </div>
                )
              })}

              {originRound && !(pastRounds ?? []).some((r: any) => r.id === originRound.id) && (
                <div className="flex-shrink-0 w-44 border border-zinc-800 bg-zinc-950 p-3">
                  <p className="font-mono text-[10px] text-zinc-600 mb-1 uppercase tracking-widest">origin</p>
                  <p className="font-mono text-[10px] text-zinc-400 line-clamp-3">"{originRound.prompt}"</p>
                  <p className="font-mono text-[10px] text-zinc-600 mt-1">{new Date(originRound.created_at).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* How it works */}
        <section className="mb-8">
          <a href="#how-it-works" className="font-mono text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
            $ --help ↓
          </a>
        </section>

      </div>

      {/* How it works — bottom */}
      <div id="how-it-works" className="max-w-2xl mx-auto px-4 pb-16">
        <p className="font-mono text-xs text-zinc-600 mb-6">// HOW IT WORKS</p>
        <img src="/graph.png" alt="How it works" className="w-full max-h-96 object-contain opacity-60" />
      </div>
    </main>
  )
}
