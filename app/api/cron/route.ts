import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { NextResponse } from 'next/server'

const AI_VOTER_ID = 'TNEP_AI_CRON'
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
const TEXT_MODEL = 'openai/gpt-oss-20b:free'

async function generateAIMutation(currentPrompt: string, recentPrompts: string[]): Promise<string> {
  const historyLines = recentPrompts
    .slice(0, 4)
    .reverse()
    .map((p, i, arr) => `  [${arr.length - i} round${arr.length - i === 1 ? '' : 's'} ago] "${p}"`)
    .join('\n')

  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: TEXT_MODEL,
      messages: [
        {
          role: 'user',
          content: `You maintain "The Never Ending Prompt" — an infinite chain of prompts for AI image generation. Each prompt is a single sentence, contemplative and slightly surreal. The chain evolves daily: each entry extends or reframes the one before it.

Recent chain (oldest to newest):
${historyLines || '  [this is the first prompt]'}
  [current] "${currentPrompt}"

Write the next prompt. Follow the logic of the current prompt one step further — extend its metaphor, invert its premise, or reveal something it implied but didn't say. Return only the prompt sentence, max 250 characters, no quotes, no explanation.`,
        },
      ],
    }),
  })

  if (!res.ok) throw new Error(`OpenRouter error: ${res.status}`)
  const data = await res.json()
  const raw: string = data.choices?.[0]?.message?.content?.trim() ?? currentPrompt
  return raw.replace(/^["'`]|["'`]$/g, '').trim().slice(0, 250)
}

export async function GET(request: Request) {
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Find current open round
  const { data: round } = await supabaseAdmin
    .from('rounds')
    .select('*')
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!round) return NextResponse.json({ message: 'No open round to close' })

  // Get submissions with vote counts
  const { data: submissions } = await supabaseAdmin
    .from('submissions')
    .select('id, prompt, votes(count)')
    .eq('round_id', round.id)

  let winnerId: string
  let winnerPrompt: string
  let aiGenerated = false

  if (!submissions || submissions.length === 0) {
    // No human submissions — AI generates the next mutation
    aiGenerated = true

    const { data: recent } = await supabaseAdmin
      .from('rounds')
      .select('prompt')
      .eq('status', 'closed')
      .order('closed_at', { ascending: false })
      .limit(4)

    const recentPrompts = ((recent ?? []) as { prompt: string }[]).map((r) => r.prompt)
    const aiPrompt = await generateAIMutation(round.prompt, recentPrompts)

    const { data: aiSub, error: subErr } = await supabaseAdmin
      .from('submissions')
      .insert({
        round_id: round.id,
        prompt: aiPrompt,
        submitter_name: 'TNEP_AI',
        voter_id: AI_VOTER_ID,
        mutation_type: 'extend',
      })
      .select()
      .single()

    if (subErr || !aiSub) {
      return NextResponse.json({ error: 'Failed to create AI submission' }, { status: 500 })
    }

    // Cast a synthetic vote so it shows up with a count
    await supabaseAdmin.from('votes').insert({
      round_id: round.id,
      submission_id: aiSub.id,
      voter_id: AI_VOTER_ID,
    })

    winnerId = aiSub.id
    winnerPrompt = aiPrompt
  } else {
    // Human submissions exist — pick the one with most votes (first as tiebreaker)
    const winner = (submissions as { id: string; prompt: string; votes: { count: number }[] }[]).reduce(
      (best, s) => {
        const count = s.votes?.[0]?.count ?? 0
        const bestCount = best.votes?.[0]?.count ?? 0
        return count > bestCount ? s : best
      }
    )

    winnerId = winner.id
    winnerPrompt = winner.prompt
  }

  // Close current round
  const { error: closeErr } = await supabaseAdmin
    .from('rounds')
    .update({
      status: 'closed',
      winner_submission_id: winnerId,
      closed_at: new Date().toISOString(),
    })
    .eq('id', round.id)

  if (closeErr) return NextResponse.json({ error: closeErr.message }, { status: 500 })

  // Open next round with winner's prompt
  const { data: newRound, error: openErr } = await supabaseAdmin
    .from('rounds')
    .insert({ prompt: winnerPrompt, status: 'open' })
    .select()
    .single()

  if (openErr) return NextResponse.json({ error: openErr.message }, { status: 500 })

  return NextResponse.json({
    closed: round.id,
    winner: winnerPrompt,
    opened: newRound.id,
    aiGenerated,
  })
}
