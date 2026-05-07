import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const round_id = searchParams.get('round_id')
  const voter_id = searchParams.get('voter_id')

  if (!round_id || !voter_id) {
    return NextResponse.json({ submission_id: null })
  }

  const { data } = await supabase
    .from('votes')
    .select('submission_id')
    .eq('round_id', round_id)
    .eq('voter_id', voter_id)
    .single()

  return NextResponse.json({ submission_id: data?.submission_id ?? null })
}
