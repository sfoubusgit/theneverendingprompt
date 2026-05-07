import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { round_id, submission_id, voter_id } = await request.json()

  if (!round_id || !submission_id || !voter_id) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const { data: round } = await supabase
    .from('rounds')
    .select('status')
    .eq('id', round_id)
    .single()

  if (!round || round.status !== 'open') {
    return NextResponse.json({ error: 'Round is closed' }, { status: 400 })
  }

  const { error } = await supabase
    .from('votes')
    .upsert({ round_id, submission_id, voter_id }, { onConflict: 'round_id,voter_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
