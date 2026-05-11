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

  if (!round) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-zinc-500">No active round. Check back soon.</p>
      </main>
    )
  }

  const submissions = await getSubmissionsWithCounts(round.id)

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-16">

        {/* Prompt hero */}
        <section className="text-center mb-12">
          {round.image_url && (
            <div className="mb-8 mx-auto max-w-sm aspect-square overflow-hidden rounded-xl bg-zinc-900">
              <img src={round.image_url} alt="Round image" className="w-full h-full object-cover" />
            </div>
          )}
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3">Today's prompt</p>
          <h1 className="text-2xl md:text-4xl font-serif leading-relaxed text-white mb-3">
            "{round.prompt}"
          </h1>
          <p className="text-xs text-zinc-600">
            {round.status === 'open'
              ? `${submissions.length} submission${submissions.length !== 1 ? 's' : ''} · opened ${Math.max(0, Math.floor((Date.now() - new Date(round.created_at).getTime()) / 3600000))}h ago`
              : 'Round closed — winner selected'}
          </p>
        </section>

        {/* Submit + Vote side by side */}
        <section className="mb-16">
          <RoundClient
            roundId={round.id}
            submissions={submissions}
            closed={round.status === 'closed'}
            winnerId={round.winner_submission_id}
          />
        </section>

        {/* How it works */}
        <section className="mb-16 border-t border-zinc-900 pt-12">
          <p className="text-xs tracking-widest text-zinc-500 uppercase mb-6 text-center">The Never Ending Prompt</p>
          <img src="/graph.png" alt="How it works" className="w-full max-h-72 object-contain opacity-60" />
        </section>

        {/* Chain history */}
        {pastRounds && pastRounds.length > 0 && (
          <section className="border-t border-zinc-900 pt-12 pb-8">
            <p className="text-xs text-zinc-500 uppercase tracking-widest mb-6 text-center">Chain history</p>
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4">
              {pastRounds.map((r: any) => {
                const winner = (r.submissions ?? []).find((s: any) => s.id === r.winner_submission_id)
                return (
                  <div key={r.id} className="flex-shrink-0 w-64 bg-zinc-900 rounded-xl p-4">
                    {r.image_url && (
                      <div className="w-full aspect-video rounded-lg overflow-hidden bg-zinc-800 mb-3">
                        <img src={r.image_url} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <p className="text-xs text-zinc-500 mb-2">{new Date(r.closed_at).toLocaleDateString()}</p>
                    <p className="text-xs text-zinc-400 line-clamp-2">"{r.prompt}"</p>
                    {winner && (
                      <>
                        <p className="text-xs text-zinc-600 my-1.5">↓</p>
                        <p className="text-xs text-white line-clamp-2">"{winner.prompt}"</p>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}

      </div>
    </main>
  )
}
