import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { round_id, prompt, submitter_name } = await request.json()

  if (!round_id || !prompt?.trim() || !submitter_name?.trim()) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  if (prompt.trim().length > 150) {
    return NextResponse.json({ error: 'Prompt exceeds 150 characters' }, { status: 400 })
  }

  const { data: round } = await supabase
    .from('rounds')
    .select('status')
    .eq('id', round_id)
    .single()

  if (!round || round.status !== 'open') {
    return NextResponse.json({ error: 'Round is closed' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('submissions')
    .insert({ round_id, prompt: prompt.trim(), submitter_name: submitter_name.trim() })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
