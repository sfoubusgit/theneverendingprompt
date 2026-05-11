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
    <div className="md:grid md:grid-cols-5 md:gap-10">
      {!closed && (
        <div className="md:col-span-2 mb-8 md:mb-0">
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-4">Your version</p>
          <SubmitForm roundId={roundId} onSubmitted={handleSubmitted} />
        </div>
      )}
      <div className={closed ? 'md:col-span-5' : 'md:col-span-3'}>
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
    </div>
  )
}
