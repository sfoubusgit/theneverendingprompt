import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST() {
  await supabase.from('votes').delete().gte('created_at', '1970-01-01')
  await supabase.from('submissions').delete().gte('created_at', '1970-01-01')
  const { error } = await supabase.from('rounds').delete().gte('created_at', '1970-01-01')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
