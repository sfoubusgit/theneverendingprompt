'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Round, Submission } from '@/types'

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [keyInput, setKeyInput] = useState('')
  const [keyError, setKeyError] = useState(false)
  const [round, setRound] = useState<Round | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [winner, setWinner] = useState<Submission | null>(null)
  const [nextPrompt, setNextPrompt] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem('admin_key')
    if (stored) { setAuthed(true); fetchCurrent() }
  }, [])

  function adminFetch(url: string, options: RequestInit = {}) {
    const key = sessionStorage.getItem('admin_key') ?? ''
    return fetch(url, {
      ...options,
      headers: {
        ...(options.headers as Record<string, string> ?? {}),
        'Authorization': `Bearer ${key}`,
      },
    })
  }

  function handleLogin(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    sessionStorage.setItem('admin_key', keyInput)
    setAuthed(true)
    setKeyError(false)
    fetchCurrent()
  }

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
    const res = await adminFetch('/api/admin/close-round', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ round_id: round.id }),
    })
    const data = await res.json()
    if (res.status === 401) { setKeyError(true); setAuthed(false); setLoading(false); return }
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

    if (imageFile && round?.status === 'closed') {
      const url = await uploadImage(round.id)
      if (url) {
        await supabase.from('rounds').update({ image_url: url }).eq('id', round.id)
      }
    }

    const res = await adminFetch('/api/admin/open-round', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: nextPrompt }),
    })
    const data = await res.json()
    if (res.status === 401) { setKeyError(true); setAuthed(false); setLoading(false); return }
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

  async function resetAll() {
    if (!confirm('Delete all rounds, submissions and votes?')) return
    setLoading(true)
    const res = await adminFetch('/api/admin/reset', { method: 'POST' })
    const data = await res.json()
    if (res.status === 401) { setKeyError(true); setAuthed(false); setLoading(false); return }
    if (data.success) {
      setRound(null)
      setSubmissions([])
      setWinner(null)
      setNextPrompt('')
      setMessage('All data reset.')
    } else {
      setMessage(data.error ?? 'Error resetting')
    }
    setLoading(false)
  }

  const sorted = [...submissions].sort((a, b) => (b.vote_count ?? 0) - (a.vote_count ?? 0))

  if (!authed) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <form onSubmit={handleLogin} className="w-full max-w-sm px-4">
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-4">Admin access</p>
          {keyError && (
            <p className="text-red-400 text-xs mb-3">Wrong key. Try again.</p>
          )}
          <input
            type="password"
            value={keyInput}
            onChange={e => setKeyInput(e.target.value)}
            className="w-full bg-zinc-900 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-zinc-600 mb-3"
            placeholder="Enter admin key"
            autoFocus
          />
          <button
            type="submit"
            disabled={!keyInput.trim()}
            className="w-full bg-white text-black font-semibold py-2.5 rounded-xl text-sm hover:bg-zinc-200 transition-colors disabled:opacity-40"
          >
            Enter
          </button>
        </form>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-bold">Admin</h1>
          <button
            onClick={() => { sessionStorage.removeItem('admin_key'); setAuthed(false) }}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Log out
          </button>
        </div>

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

        <div className="mt-16 pt-8 border-t border-zinc-900">
          <button
            onClick={resetAll}
            disabled={loading}
            className="w-full bg-transparent border border-red-900 text-red-700 hover:text-red-400 hover:border-red-700 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-40"
          >
            Reset everything
          </button>
        </div>

      </div>
    </main>
  )
}
