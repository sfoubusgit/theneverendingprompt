import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/caption
 *
 * Returns structured winner data for the instagram.py caption builder.
 * Called by scripts/instagram.py ~5 minutes after /api/cron fires (06:05 UTC).
 *
 * Auth: Authorization: Bearer <CRON_SECRET>
 * (Same secret as /api/cron — no new secret needed.)
 *
 * Response shape:
 * {
 *   closed_round_number: number,     // round number that just closed
 *   winner_name: string,             // submitter_name of winning submission
 *   winner_prompt: string,           // the winning mutation text
 *   winner_mutation_type: string|null,
 *   winner_votes: number,
 *   total_votes: number,
 *   ai_generated: boolean,           // true when TNEP_AI won (no human played)
 *   new_round_id: string|null,       // UUID of the now-open round
 *   new_round_number: number,
 *   site_url: string,
 * }
 */
export async function GET(request: Request) {
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Most recently closed round
  const { data: closedRound, error: closedErr } = await supabaseAdmin
    .from('rounds')
    .select('id, prompt, winner_submission_id, closed_at, created_at')
    .eq('status', 'closed')
    .order('closed_at', { ascending: false })
    .limit(1)
    .single()

  if (closedErr || !closedRound) {
    return NextResponse.json({ error: 'No closed round found' }, { status: 404 })
  }

  // Currently open round (its prompt equals the winner's prompt)
  const { data: openRound } = await supabaseAdmin
    .from('rounds')
    .select('id')
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // Winner submission details
  const { data: winnerSub } = closedRound.winner_submission_id
    ? await supabaseAdmin
        .from('submissions')
        .select('id, prompt, submitter_name, mutation_type')
        .eq('id', closedRound.winner_submission_id)
        .single()
    : { data: null }

  // Vote totals for the closed round
  const { count: totalVotes } = await supabaseAdmin
    .from('votes')
    .select('*', { count: 'exact', head: true })
    .eq('round_id', closedRound.id)

  const { count: winnerVotes } = closedRound.winner_submission_id
    ? await supabaseAdmin
        .from('votes')
        .select('*', { count: 'exact', head: true })
        .eq('submission_id', closedRound.winner_submission_id)
    : { count: 0 }

  // Closed round number (1-indexed count of all rounds up to and including this one)
  const { count: closedRoundNumber } = await supabaseAdmin
    .from('rounds')
    .select('*', { count: 'exact', head: true })
    .lte('created_at', closedRound.created_at)

  const aiGenerated = winnerSub?.submitter_name === 'TNEP_AI'

  return NextResponse.json({
    closed_round_number: closedRoundNumber ?? 0,
    winner_name: winnerSub?.submitter_name ?? 'anonymous',
    winner_prompt: winnerSub?.prompt ?? closedRound.prompt,
    winner_mutation_type: winnerSub?.mutation_type ?? null,
    winner_votes: winnerVotes ?? 0,
    total_votes: totalVotes ?? 0,
    ai_generated: aiGenerated,
    new_round_id: openRound?.id ?? null,
    new_round_number: (closedRoundNumber ?? 0) + 1,
    site_url: `https://tnep.xyz/round/${closedRound.id}`,
  })
}
