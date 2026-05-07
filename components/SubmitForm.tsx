'use client'

import { useState } from 'react'
import { Submission } from '@/types'

export default function SubmitForm({
  roundId,
  onSubmitted,
}: {
  roundId: string
  onSubmitted: (submission: Submission) => void
}) {
  const [prompt, setPrompt] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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
      <div className="text-center py-6 text-zinc-400 text-sm">
        Submitted. Now vote for your favorite.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <div className="flex justify-between mb-1">
          <label className="text-xs text-zinc-500">Your version</label>
          <span className={`text-xs ${prompt.length > 140 ? prompt.length >= 150 ? 'text-red-400' : 'text-yellow-500' : 'text-zinc-600'}`}>
            {prompt.length}/150
          </span>
        </div>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          rows={3}
          required
          maxLength={150}
          className="w-full bg-zinc-900 rounded-xl p-3 text-sm text-white resize-none focus:outline-none focus:ring-1 focus:ring-zinc-600"
          placeholder="Change the prompt however you want..."
        />
      </div>

      <div>
        <label className="block text-xs text-zinc-500 mb-1">Your name</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          required
          className="w-full bg-zinc-900 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-zinc-600"
          placeholder="Anonymous"
        />
      </div>

      {error && <p className="text-red-400 text-xs">{error}</p>}

      <button
        type="submit"
        disabled={loading || !prompt.trim() || !name.trim()}
        className="w-full bg-white text-black font-semibold py-2.5 rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
      >
        {loading ? 'Submitting...' : 'Submit prompt change'}
      </button>
    </form>
  )
}
