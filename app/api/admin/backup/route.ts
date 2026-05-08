import { supabase } from '@/lib/supabase'
import { isAuthorized } from '@/lib/adminAuth'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  if (!isAuthorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: rounds } = await supabase
    .from('rounds')
    .select('*')
    .order('created_at', { ascending: true })

  const { data: submissions } = await supabase
    .from('submissions')
    .select('*, votes(count)')
    .order('created_at', { ascending: true })

  const { data: votes } = await supabase
    .from('votes')
    .select('*')
    .order('created_at', { ascending: true })

  const backup = {
    exported_at: new Date().toISOString(),
    rounds: rounds ?? [],
    submissions: (submissions ?? []).map((s: any) => ({
      ...s,
      vote_count: s.votes?.[0]?.count ?? 0,
      votes: undefined,
    })),
    votes: votes ?? [],
  }

  return new Response(JSON.stringify(backup, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="tnep-backup-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  })
}
