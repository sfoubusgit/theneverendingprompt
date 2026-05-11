'use client'

import { useState } from 'react'
import { Submission } from '@/types'
import VoteSection from './VoteSection'
import SubmitForm from './SubmitForm'

export default function RoundClient({
  roundId,
  currentPrompt,
  submissions: initial,
  closed,
  winnerId,
}: {
  roundId: string
  currentPrompt: string
  submissions: Submission[]
  closed: boolean
  winnerId: string | null
}) {
  const [submissions, setSubmissions] = useState<Submission[]>(initial)

  function handleSubmitted(s: Submission) {
    setSubmissions(prev => [...prev, s])
  }

  return (
    <div className="space-y-8">
      {!closed && (
        <>
          <SubmitForm roundId={roundId} currentPrompt={currentPrompt} onSubmitted={handleSubmitted} />
          <div className="border-t border-zinc-800" />
        </>
      )}
      {submissions.length > 0 && (
        <div>
          <div className="mb-4">
            <p className="text-xs text-zinc-500 uppercase tracking-widest">
              {closed ? 'Results' : 'What others suggested'}
            </p>
            {!closed && (
              <p className="text-xs text-zinc-600 mt-1">tap a prompt to vote for it</p>
            )}
          </div>
          <VoteSection
            submissions={submissions}
            roundId={roundId}
            closed={closed}
            winnerId={winnerId}
          />
        </div>
      )}
    </div>
  )
}
