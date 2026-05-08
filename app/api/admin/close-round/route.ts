import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin'
import { isAuthorized } from '@/lib/adminAuth'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  if (!isAuthorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { round_id } = await request.json()

  // Get all submissions with vote counts
  const { data: submissions } = await supabase
    .from('submissions')
    .select('id, votes(count)')
    .eq('round_id', round_id)

  if (!submissions || submissions.length === 0) {
    return NextResponse.json({ error: 'No submissions' }, { status: 400 })
  }

  // Find winner (most votes)
  const winner = submissions.reduce((best, s) => {
    const count = (s.votes as any)?.[0]?.count ?? 0
    const bestCount = (best.votes as any)?.[0]?.count ?? 0
    return count > bestCount ? s : best
  })

  const { error } = await supabase
    .from('rounds')
    .update({
      status: 'closed',
      winner_submission_id: winner.id,
      closed_at: new Date().toISOString(),
    })
    .eq('id', round_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: winnerData } = await supabase
    .from('submissions')
    .select('*')
    .eq('id', winner.id)
    .single()

  return NextResponse.json({ winner: winnerData })
}
