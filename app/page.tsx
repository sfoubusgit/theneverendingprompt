import { supabase } from '@/lib/supabase'
import { Submission } from '@/types'
import RoundClient from '@/components/RoundClient'

export const revalidate = 0

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
    .select('*, submissions(prompt, submitter_name)')
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
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl px-4 py-16 text-center">

        {/* Prompt as hero */}
        <section className="mb-12">
          {round.image_url && (
            <div className="mb-8 aspect-square w-full overflow-hidden rounded-xl bg-zinc-900">
              <img src={round.image_url} alt="Round image" className="w-full h-full object-cover" />
            </div>
          )}
          <h1 className="text-2xl md:text-3xl font-serif leading-relaxed text-white mb-4">
            {round.prompt}
          </h1>
          <p className="text-xs text-zinc-600">
            {round.status === 'open'
              ? `${submissions.length} submission${submissions.length !== 1 ? 's' : ''} · opened ${Math.max(0, Math.floor((Date.now() - new Date(round.created_at).getTime()) / 3600000))}h ago`
              : 'Round closed — winner selected'}
          </p>
        </section>

        {/* Submissions + voting */}
        <section className="mb-10 text-left">
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-4 text-center">
            {round.status === 'open' ? 'What should come next?' : 'Results'}
          </p>
          <RoundClient
            roundId={round.id}
            submissions={submissions}
            closed={round.status === 'closed'}
            winnerId={round.winner_submission_id}
          />
        </section>

        {/* How it works */}
        <div className="mb-12 -mx-4 sm:-mx-16">
          <p className="text-xs tracking-widest text-zinc-400 uppercase mb-3 px-4 sm:px-16">The Never Ending Prompt</p>
          <img src="/graph.png" alt="How it works" className="w-full max-h-96 object-contain opacity-70" />
        </div>

        {/* Past rounds */}
        {pastRounds && pastRounds.length > 0 && (
          <section className="mb-16 text-left">
            <p className="text-xs text-zinc-500 uppercase tracking-widest mb-4 text-center">Chain history</p>
            <div className="space-y-3">
              {pastRounds.map((r: any) => (
                <div key={r.id} className="flex gap-3 items-start">
                  {r.image_url && (
                    <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-zinc-900">
                      <img src={r.image_url} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-zinc-400 line-clamp-2">{r.prompt}</p>
                    <p className="text-xs text-zinc-600 mt-0.5">
                      {new Date(r.closed_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

</div>
    </main>
  )
}
