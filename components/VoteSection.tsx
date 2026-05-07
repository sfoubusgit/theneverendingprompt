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

    // Optimistic update
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

  return (
    <div className="space-y-3">
      {sorted.map(s => {
        const count = counts[s.id] ?? 0
        const isMyVote = myVote === s.id
        const isWinner = winnerId === s.id

        return (
          <div
            key={s.id}
            onClick={() => vote(s.id)}
            className={`relative rounded-xl p-4 transition-all ${
              closed
                ? isWinner
                  ? 'bg-white/10 border border-white/20'
                  : 'bg-zinc-900 opacity-50'
                : isMyVote
                  ? 'bg-zinc-800 border border-zinc-600 cursor-pointer'
                  : 'bg-zinc-900 hover:bg-zinc-800 cursor-pointer'
            }`}
          >
            {/* Vote bar */}
            <div
              className="absolute inset-0 rounded-xl bg-white/10 transition-all duration-300"
              style={{ width: `${(count / maxVotes) * 100}%` }}
            />

            <div className="relative flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-sm leading-relaxed text-white">{s.prompt}</p>
                <p className="text-xs text-zinc-500 mt-1">
                  {s.submitter_name}
                  {isWinner && <span className="ml-2 text-yellow-400">winner</span>}
                </p>
              </div>
              <div className="flex-shrink-0 flex flex-col items-center gap-1">
                <span className="text-sm font-semibold text-white">{count}</span>
                {isMyVote && !closed && (
                  <span className="text-xs text-zinc-400">your vote</span>
                )}
              </div>
            </div>
          </div>
        )
      })}

      {submissions.length === 0 && (
        <p className="text-zinc-600 text-sm text-center py-6">No submissions yet. Be the first.</p>
      )}
    </div>
  )
}
