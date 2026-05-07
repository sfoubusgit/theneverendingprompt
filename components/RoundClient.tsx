'use client'

import { useState } from 'react'
import { Submission } from '@/types'
import VoteSection from './VoteSection'
import SubmitForm from './SubmitForm'

export default function RoundClient({
  roundId,
  submissions: initial,
  closed,
  winnerId,
}: {
  roundId: string
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
          <SubmitForm
            roundId={roundId}
            onSubmitted={handleSubmitted}
          />
          <div className="border-t border-zinc-800" />
        </>
      )}
      {submissions.length > 0 && (
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-4">
            {closed ? 'Results' : 'What others suggested'}
          </p>
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
