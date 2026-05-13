import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Find current open round
  const { data: round } = await supabaseAdmin
    .from('rounds')
    .select('*')
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!round) return NextResponse.json({ message: 'No open round to close' })

  // Get submissions with vote counts
  const { data: submissions } = await supabaseAdmin
    .from('submissions')
    .select('id, prompt, votes(count)')
    .eq('round_id', round.id)

  if (!submissions || submissions.length === 0) {
    return NextResponse.json({ message: 'No submissions — keeping round open' })
  }

  // Pick winner (most votes; first submission as tiebreaker)
  const winner = submissions.reduce((best, s) => {
    const count = (s.votes as any)?.[0]?.count ?? 0
    const bestCount = (best.votes as any)?.[0]?.count ?? 0
    return count > bestCount ? s : best
  })

  // Close current round
  await supabaseAdmin
    .from('rounds')
    .update({
      status: 'closed',
      winner_submission_id: winner.id,
      closed_at: new Date().toISOString(),
    })
    .eq('id', round.id)

  // Open next round with winner's prompt
  const { data: newRound, error } = await supabaseAdmin
    .from('rounds')
    .insert({ prompt: winner.prompt, status: 'open' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    closed: round.id,
    winner: winner.prompt,
    opened: newRound.id,
  })
}
