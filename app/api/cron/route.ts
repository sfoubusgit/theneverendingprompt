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

  // Compute round number for announcement copy
  const { count: roundNumber } = await supabaseAdmin
    .from('rounds')
    .select('*', { count: 'exact', head: true })
    .lte('created_at', round.created_at)

  // Get submissions with vote counts AND submitter info needed for announcements
  const { data: submissions } = await supabaseAdmin
    .from('submissions')
    .select('id, prompt, submitter_name, mutation_type, votes(count)')
    .eq('round_id', round.id)
    .order('created_at', { ascending: true })

  let winnerId: string
  let winnerPrompt: string
  let winnerName: string
  let winnerMutationType: string | null = null
  let winnerVotes: number = 0
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
    const { error: voteErr } = await supabaseAdmin.from('votes').insert({
      round_id: round.id,
      submission_id: aiSub.id,
      voter_id: AI_VOTER_ID,
    })

    winnerId = aiSub.id
    winnerPrompt = aiPrompt
    winnerName = 'TNEP_AI'
    winnerMutationType = 'extend'
    winnerVotes = voteErr ? 0 : 1
  } else {
    // Human submissions exist — pick the one with most votes (first submitted wins ties)
    type SubRow = {
      id: string
      prompt: string
      submitter_name: string
      mutation_type: string | null
      votes: { count: number }[]
    }
    const winner = (submissions as SubRow[]).reduce((best, s) => {
      const count = s.votes?.[0]?.count ?? 0
      const bestCount = best.votes?.[0]?.count ?? 0
      return count > bestCount ? s : best
    })

    winnerId = winner.id
    winnerPrompt = winner.prompt
    winnerName = winner.submitter_name
    winnerMutationType = winner.mutation_type ?? null
    winnerVotes = winner.votes?.[0]?.count ?? 0
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

  // ── Discord announcement ──────────────────────────────────────────────────
  // Set DISCORD_WEBHOOK_URL in Vercel env vars. Obtain by:
  // Discord server -> channel settings -> Integrations -> Webhooks -> New Webhook -> Copy URL
  const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL
  if (discordWebhookUrl) {
    const totalVotes = (submissions ?? []).reduce(
      (sum, s) => sum + ((s as any).votes?.[0]?.count ?? 0),
      0
    )
    const nextRoundNum = (roundNumber ?? 0) + 1

    const embed = {
      // Cyan (0x00e5ff) for AI rounds, pink (0xff2d87) for human wins
      color: aiGenerated ? 0x00e5ff : 0xff2d87,
      title: aiGenerated
        ? `Round ${roundNumber}: no one played. The AI wrote that.`
        : `Round ${roundNumber} won by ${winnerName}`,
      description: `*"${winnerPrompt}"*`,
      fields: [
        {
          name: 'mutation type',
          value: winnerMutationType ?? 'unknown',
          inline: true,
        },
        {
          name: aiGenerated ? 'synthetic vote' : 'winning votes',
          value: `${winnerVotes} of ${Math.max(totalVotes, winnerVotes)} cast`,
          inline: true,
        },
        {
          name: `round ${nextRoundNum} is live`,
          value: `https://tnep.xyz/round/${newRound.id}`,
          inline: false,
        },
      ],
      footer: {
        text: aiGenerated
          ? 'No one played yesterday. The AI wrote that.'
          : 'The prompt never dies.',
      },
      timestamp: new Date().toISOString(),
    }

    // Non-fatal: Discord outage must not block the cron response
    await fetch(discordWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] }),
    }).catch(() => {})
  }
  // ─────────────────────────────────────────────────────────────────────────

  return NextResponse.json({
    closed: round.id,
    round_number: roundNumber,
    winner: winnerPrompt,
    winner_name: winnerName,
    winner_mutation_type: winnerMutationType,
    winner_votes: winnerVotes,
    opened: newRound.id,
    aiGenerated,
  })
}
