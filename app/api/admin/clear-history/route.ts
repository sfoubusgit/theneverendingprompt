import { supabase } from '@/lib/supabase'
import { isAuthorized } from '@/lib/adminAuth'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  if (!isAuthorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Find all closed rounds
  const { data: closedRounds } = await supabase
    .from('rounds')
    .select('id')
    .eq('status', 'closed')

  if (!closedRounds || closedRounds.length === 0) {
    return NextResponse.json({ success: true, deleted: 0 })
  }

  const ids = closedRounds.map(r => r.id)

  // Delete votes → submissions → rounds (in order to respect FK constraints)
  await supabase.from('votes').delete().in('round_id', ids)
  await supabase.from('submissions').delete().in('round_id', ids)
  const { error } = await supabase.from('rounds').delete().in('id', ids)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, deleted: ids.length })
}
