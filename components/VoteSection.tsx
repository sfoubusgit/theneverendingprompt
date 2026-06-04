'use client'

import { useEffect, useState } from 'react'
import { Submission } from '@/types'

function getVoterId(): string {
  let id = localStorage.getItem('voter_id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('voter_id', id)
  }
  return id
}

export default function VoteSection({
  submissions,
  roundId,
  closed,
  winnerId,
}: {
  submissions: Submission[]
  roundId: string
  closed: boolean
  winnerId: string | null
}) {
  const [myVote, setMyVote] = useState<string | null>(null)
  const [counts, setCounts] = useState<Record<string, number>>(
    Object.fromEntries(submissions.map(s => [s.id, s.vote_count ?? 0]))
  )
  const [voting, setVoting] = useState(false)

  useEffect(() => {
    const voterId = getVoterId()
    fetch(`/api/votes/mine?round_id=${roundId}&voter_id=${voterId}`)
      .then(r => r.json())
      .then(data => { if (data.submission_id) setMyVote(data.submission_id) })
  }, [roundId])

  async function vote(submissionId: string) {
    if (voting || closed) return
    const voterId = getVoterId()
    const prev = myVote

    setMyVote(submissionId)
    setCounts(c => {
      const next = { ...c }
      if (prev) next[prev] = Math.max(0, (next[prev] ?? 0) - 1)
      next[submissionId] = (next[submissionId] ?? 0) + 1
      return next
    })

    setVoting(true)
    await fetch('/api/votes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ round_id: roundId, submission_id: submissionId, voter_id: voterId }),
    })
    setVoting(false)
  }

  const sorted = [...submissions].sort((a, b) => (counts[b.id] ?? 0) - (counts[a.id] ?? 0))
  const maxVotes = Math.max(...Object.values(counts), 1)

  if (submissions.length === 0) {
    return <p className="font-mono text-xs text-zinc-600 py-4">$ no submissions yet. be first.</p>
  }

  return (
    <div className="space-y-2">
      {sorted.map(s => {
        const count = counts[s.id] ?? 0
        const isMyVote = myVote === s.id
        const isWinner = winnerId === s.id

        return (
          <div
            key={s.id}
            onClick={() => vote(s.id)}
            className={`relative border transition-colors ${
              closed
                ? isWinner
                  ? 'border-zinc-400 bg-zinc-900'
                  : 'border-zinc-800 bg-zinc-950 opacity-40'
                : isMyVote
                  ? 'border-zinc-400 bg-zinc-900 cursor-pointer'
                  : 'border-zinc-800 bg-zinc-950 hover:border-zinc-600 cursor-pointer'
            }`}
          >
            {/* Vote bar */}
            <div
              className="absolute inset-0 bg-white/5 transition-all duration-500"
              style={{ width: `${(count / maxVotes) * 100}%` }}
            />

            <div className="relative flex items-start gap-3 px-3 py-3">
              <span className="font-mono text-xs text-zinc-500 flex-shrink-0 w-8 pt-0.5">
                {isMyVote && !closed ? '[>]' : `[${count}]`}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-mono text-sm text-white leading-relaxed">"{s.prompt}"</p>
                <p className="font-mono text-xs text-zinc-600 mt-1">
                  {s.submitter_name}
                  {isWinner && <span className="ml-2 text-zinc-400">[winner]</span>}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
