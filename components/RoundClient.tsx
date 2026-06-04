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
          <div>
            <p className="font-mono text-xs text-zinc-600 mb-3">// YOUR MUTATION</p>
            <SubmitForm roundId={roundId} currentPrompt={currentPrompt} onSubmitted={handleSubmitted} />
          </div>
          <p className="font-mono text-xs text-zinc-800">---</p>
        </>
      )}
      <div>
        <p className="font-mono text-xs text-zinc-600 mb-3">
          {closed ? '// RESULTS' : '// OTHERS — click to vote'}
        </p>
        <VoteSection
          submissions={submissions}
          roundId={roundId}
          closed={closed}
          winnerId={winnerId}
        />
      </div>
    </div>
  )
}
