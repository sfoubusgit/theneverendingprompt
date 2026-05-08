import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { isAuthorized } from '@/lib/adminAuth'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  if (!isAuthorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [
    { count: totalRounds },
    { count: totalSubmissions },
    { count: totalVotes },
    { data: submitters },
  ] = await Promise.all([
    supabaseAdmin.from('rounds').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('submissions').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('votes').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('submissions').select('voter_id'),
  ])

  const uniqueParticipants = new Set((submitters ?? []).map((s: any) => s.voter_id).filter(Boolean)).size

  return NextResponse.json({
    totalRounds: totalRounds ?? 0,
    totalSubmissions: totalSubmissions ?? 0,
    totalVotes: totalVotes ?? 0,
    uniqueParticipants,
  })
}
