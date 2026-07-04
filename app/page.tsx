import { supabase } from '@/lib/supabase'
import { Submission, ChainRound } from '@/types'
import HomeClient from '@/components/HomeClient'

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
  // Active round
  const { data: round } = await supabase
    .from('rounds')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!round) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--t4)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.1em' }}>
          $ no active round. check back soon.
        </p>
      </main>
    )
  }

  // Total round count
  const { count: roundCount } = await supabase
    .from('rounds')
    .select('*', { count: 'exact', head: true })

  const roundNumber = roundCount ?? 1

  // Active round submissions with vote counts
  const submissions = await getSubmissionsWithCounts(round.id)

  // Chain rounds: last 10 closed (for sidebar + full chain panel)
  const { data: rawChain } = await supabase
    .from('rounds')
    .select('id, prompt, image_url, closed_at, winner_submission_id, submissions(id, mutation_type)')
    .eq('status', 'closed')
    .order('closed_at', { ascending: false })
    .limit(10)

  const chainRounds: ChainRound[] = (rawChain ?? []).map((r: any, i: number) => {
    const winnerSub = (r.submissions ?? []).find((s: any) => s.id === r.winner_submission_id)
    return {
      id: r.id,
      prompt: r.prompt,
      image_url: r.image_url ?? null,
      closed_at: r.closed_at ?? null,
      winner_submission_id: r.winner_submission_id ?? null,
      winner_mutation_type: winnerSub?.mutation_type ?? null,
      roundNum: roundNumber - 1 - i,
    }
  })

  // Previous round for yesterday strip
  const prevRoundData = chainRounds[0] ?? null
  const prevSubmissions: Submission[] = prevRoundData
    ? await getSubmissionsWithCounts(prevRoundData.id)
    : []

  const prevRound = prevRoundData
    ? {
        id: prevRoundData.id,
        prompt: prevRoundData.prompt,
        closed_at: prevRoundData.closed_at,
        winner_submission_id: prevRoundData.winner_submission_id,
      }
    : null

  return (
    <HomeClient
      round={round}
      roundNumber={roundNumber}
      submissions={submissions}
      chainRounds={chainRounds}
      prevRound={prevRound}
      prevSubmissions={prevSubmissions}
    />
  )
}
