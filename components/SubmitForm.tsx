'use client'

import { useState } from 'react'
import { Submission } from '@/types'

export default function SubmitForm({
  roundId,
  currentPrompt,
  onSubmitted,
}: {
  roundId: string
  currentPrompt: string
  onSubmitted: (submission: Submission) => void
}) {
  const [prompt, setPrompt] = useState(currentPrompt)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    let voter_id = localStorage.getItem('voter_id')
    if (!voter_id) {
      voter_id = crypto.randomUUID()
      localStorage.setItem('voter_id', voter_id)
    }

    const res = await fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ round_id: roundId, prompt, submitter_name: name, voter_id }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error)
      setLoading(false)
      return
    }

    onSubmitted({ ...data, vote_count: 0 })
    setDone(true)
    setLoading(false)
  }

  if (done) {
    return (
      <div className="font-mono text-sm text-zinc-500 py-4">
        [ok] submitted. scroll down to vote.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <div className="flex justify-between mb-1">
          <span className="font-mono text-xs text-zinc-600">&gt; your mutation</span>
          <span className={`font-mono text-xs ${prompt.length > 230 ? prompt.length >= 250 ? 'text-red-400' : 'text-yellow-500' : 'text-zinc-600'}`}>
            [{prompt.length}/250]
          </span>
        </div>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          rows={3}
          required
          maxLength={250}
          className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-sm text-white font-mono resize-none focus:outline-none focus:border-zinc-400 transition-colors"
          placeholder="mutate the prompt..."
        />
      </div>

      <div>
        <span className="font-mono text-xs text-zinc-600 block mb-1">&gt; your name</span>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          required
          className="w-full bg-zinc-950 border border-zinc-700 px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-zinc-400 transition-colors"
          placeholder="anonymous"
        />
      </div>

      {error && <p className="font-mono text-xs text-red-400">[error] {error}</p>}

      <button
        type="submit"
        disabled={loading || !prompt.trim() || !name.trim()}
        className="w-full border border-zinc-600 text-white font-mono text-sm py-2.5 hover:bg-zinc-900 hover:border-zinc-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        {loading ? '$ submitting...' : '[SUBMIT]'}
      </button>
    </form>
  )
}
