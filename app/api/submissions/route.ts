import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { round_id, prompt, submitter_name, voter_id } = await request.json()

  if (!round_id || !prompt?.trim() || !submitter_name?.trim() || !voter_id) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  if (prompt.trim().length > 250) {
    return NextResponse.json({ error: 'Prompt exceeds 250 characters' }, { status: 400 })
  }

  const { data: round } = await supabase
    .from('rounds')
    .select('status')
    .eq('id', round_id)
    .single()

  if (!round || round.status !== 'open') {
    return NextResponse.json({ error: 'Round is closed' }, { status: 400 })
  }

  const { data: existing } = await supabase
    .from('submissions')
    .select('id')
    .eq('round_id', round_id)
    .eq('voter_id', voter_id)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'You already submitted this round' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('submissions')
    .insert({ round_id, prompt: prompt.trim(), submitter_name: submitter_name.trim(), voter_id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
