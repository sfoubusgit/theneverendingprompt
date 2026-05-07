import { supabase } from '@/lib/supabase'
import { isAuthorized } from '@/lib/adminAuth'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  if (!isAuthorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { prompt } = await request.json()

  if (!prompt?.trim()) {
    return NextResponse.json({ error: 'Prompt required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('rounds')
    .insert({ prompt: prompt.trim(), status: 'open' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
