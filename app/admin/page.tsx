'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Round, Submission } from '@/types'

export default function AdminPage() {
  const [round, setRound] = useState<Round | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [winner, setWinner] = useState<Submission | null>(null)
  const [nextPrompt, setNextPrompt] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => { fetchCurrent() }, [])

  async function fetchCurrent() {
    const { data: r } = await supabase
      .from('rounds')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!r) return
    setRound(r)

    const { data: subs } = await supabase
      .from('submissions')
      .select('*, votes(count)')
      .eq('round_id', r.id)
      .order('created_at', { ascending: true })

    const mapped: Submission[] = (subs ?? []).map((s: any) => ({
      ...s,
      vote_count: s.votes?.[0]?.count ?? 0,
      votes: undefined,
    }))
    setSubmissions(mapped)

    if (r.winner_submission_id) {
      const w = mapped.find(s => s.id === r.winner_submission_id) ?? null
      setWinner(w)
      if (w) setNextPrompt(w.prompt)
    }
  }

  async function closeRound() {
    if (!round) return
    setLoading(true)
    const res = await fetch('/api/admin/close-round', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ round_id: round.id }),
    })
    const data = await res.json()
    if (data.winner) {
      setWinner(data.winner)
      setNextPrompt(data.winner.prompt)
      setMessage('Round closed. Winner selected by votes.')
      fetchCurrent()
    } else {
      setMessage(data.error ?? 'Error closing round')
    }
    setLoading(false)
  }

  async function uploadImage(roundId: string): Promise<string | null> {
    if (!imageFile) return null
    const ext = imageFile.name.split('.').pop()
    const fileName = `round-${roundId}-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('images').upload(fileName, imageFile)
    if (error) { setMessage(error.message); return null }
    const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName)
    return publicUrl
  }

  async function openNextRound() {
    if (!nextPrompt.trim()) return
    setLoading(true)

    // If there's an image for the current (just closed) round, upload it first
    if (imageFile && round?.status === 'closed') {
      const url = await uploadImage(round.id)
      if (url) {
        await supabase.from('rounds').update({ image_url: url }).eq('id', round.id)
      }
    }

    const res = await fetch('/api/admin/open-round', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: nextPrompt }),
    })
    const data = await res.json()
    if (data.id) {
      setMessage('New round opened.')
      setImageFile(null)
      setImagePreview(null)
      fetchCurrent()
    } else {
      setMessage(data.error ?? 'Error opening round')
    }
    setLoading(false)
  }

  const sorted = [...submissions].sort((a, b) => (b.vote_count ?? 0) - (a.vote_count ?? 0))

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-xl mx-auto px-4 py-12">
        <h1 className="text-xl font-bold mb-8">Admin</h1>

        {message && (
          <div className="mb-6 p-3 bg-zinc-800 rounded-lg text-sm text-zinc-300">{message}</div>
        )}

        {!round && (
          <section>
            <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3">Start the first round</p>
            <textarea
              value={nextPrompt}
              onChange={e => setNextPrompt(e.target.value)}
              rows={3}
              className="w-full bg-zinc-900 rounded-xl p-3 text-sm text-white resize-none focus:outline-none focus:ring-1 focus:ring-zinc-600 mb-3"
              placeholder="Enter the starting prompt..."
            />
            <button
              onClick={openNextRound}
              disabled={loading || !nextPrompt.trim()}
              className="w-full bg-white text-black font-semibold py-2.5 rounded-xl text-sm hover:bg-zinc-200 transition-colors disabled:opacity-40"
            >
              Open first round
            </button>
          </section>
        )}

        {round && (
          <>
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <p className="text-xs text-zinc-500 uppercase tracking-widest">Current round</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${round.status === 'open' ? 'bg-green-900 text-green-300' : 'bg-zinc-800 text-zinc-400'}`}>
                  {round.status}
                </span>
              </div>
              <p className="text-sm text-zinc-300 mb-4 leading-relaxed">{round.prompt}</p>

              <div className="space-y-2 mb-4">
                {sorted.map(s => (
                  <div key={s.id} className={`flex justify-between items-start p-3 rounded-lg ${winner?.id === s.id ? 'bg-white/10' : 'bg-zinc-900'}`}>
                    <div className="flex-1 mr-3">
                      <p className="text-xs text-white leading-relaxed">{s.prompt}</p>
                      <p className="text-xs text-zinc-600 mt-0.5">{s.submitter_name}</p>
                    </div>
                    <span className="text-sm font-semibold flex-shrink-0">{s.vote_count ?? 0}</span>
                  </div>
                ))}
                {submissions.length === 0 && (
                  <p className="text-zinc-600 text-xs">No submissions yet.</p>
                )}
              </div>

              {round.status === 'open' && (
                <button
                  onClick={closeRound}
                  disabled={loading || submissions.length === 0}
                  className="w-full bg-red-900 hover:bg-red-800 text-white py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-40"
                >
                  Close round & select winner
                </button>
              )}
            </section>

            {round.status === 'closed' && (
              <section>
                <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3">Open next round</p>

                <div className="mb-3">
                  <label className="block text-xs text-zinc-500 mb-1">Upload image for winning prompt (optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      const f = e.target.files?.[0]
                      if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)) }
                    }}
                    className="text-xs text-zinc-400"
                  />
                  {imagePreview && (
                    <img src={imagePreview} alt="Preview" className="mt-2 max-h-40 rounded-lg object-contain" />
                  )}
                </div>

                <div className="mb-3">
                  <label className="block text-xs text-zinc-500 mb-1">Next prompt (edit if needed)</label>
                  <textarea
                    value={nextPrompt}
                    onChange={e => setNextPrompt(e.target.value)}
                    rows={3}
                    className="w-full bg-zinc-900 rounded-xl p-3 text-sm text-white resize-none focus:outline-none focus:ring-1 focus:ring-zinc-600"
                  />
                </div>

                <button
                  onClick={openNextRound}
                  disabled={loading || !nextPrompt.trim()}
                  className="w-full bg-white text-black font-semibold py-2.5 rounded-xl text-sm hover:bg-zinc-200 transition-colors disabled:opacity-40"
                >
                  Open next round
                </button>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  )
}
