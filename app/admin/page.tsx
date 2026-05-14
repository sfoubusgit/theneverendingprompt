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
  const [stats, setStats] = useState<{ totalRounds: number; totalSubmissions: number; totalVotes: number; uniqueParticipants: number } | null>(null)
  const [closedNoImage, setClosedNoImage] = useState<Round[]>([])
  const [pastImageFile, setPastImageFile] = useState<File | null>(null)
  const [pastImagePreview, setPastImagePreview] = useState<string | null>(null)
  const [pastImageRoundId, setPastImageRoundId] = useState<string>('')

  useEffect(() => {
    const stored = sessionStorage.getItem('admin_key')
    if (stored) { setAuthed(true); fetchCurrent(); fetchStats(); fetchClosedNoImage() }
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

  async function handleLogin(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    const res = await fetch('/api/admin/verify', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${keyInput}` },
    })
    if (res.status === 401) { setKeyError(true); return }
    sessionStorage.setItem('admin_key', keyInput)
    setKeyError(false)
    setAuthed(true)
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

  async function fetchStats() {
    const res = await adminFetch('/api/admin/stats')
    if (res.ok) setStats(await res.json())
  }

  async function fetchClosedNoImage() {
    const { data } = await supabase
      .from('rounds')
      .select('*')
      .eq('status', 'closed')
      .is('image_url', null)
      .order('closed_at', { ascending: false })
    setClosedNoImage((data as Round[]) ?? [])
  }

  async function uploadImageForPastRound() {
    if (!pastImageFile || !pastImageRoundId) return
    setLoading(true)
    const url = await uploadImage(pastImageRoundId)
    if (url) {
      await supabase.from('rounds').update({ image_url: url }).eq('id', pastImageRoundId)
      setMessage('Image uploaded.')
      setPastImageFile(null)
      setPastImagePreview(null)
      setPastImageRoundId('')
      fetchClosedNoImage()
    }
    setLoading(false)
  }

  async function downloadBackup() {
    const key = sessionStorage.getItem('admin_key') ?? ''
    const res = await fetch('/api/admin/backup', {
      headers: { 'Authorization': `Bearer ${key}` },
    })
    if (res.status === 401) { setKeyError(true); setAuthed(false); return }
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tnep-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function clearHistory() {
    if (!confirm('Delete all closed rounds and their history? The current open round is kept.')) return
    setLoading(true)
    const res = await adminFetch('/api/admin/clear-history', { method: 'POST' })
    const data = await res.json()
    if (res.status === 401) { setKeyError(true); setAuthed(false); setLoading(false); return }
    if (data.success) {
      setMessage(`History cleared (${data.deleted} round${data.deleted !== 1 ? 's' : ''} deleted).`)
      fetchCurrent()
    } else {
      setMessage(data.error ?? 'Error clearing history')
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

        {stats && (
          <div className="grid grid-cols-2 gap-3 mb-8">
            {[
              { label: 'Rounds', value: stats.totalRounds },
              { label: 'Submissions', value: stats.totalSubmissions },
              { label: 'Votes', value: stats.totalVotes },
              { label: 'Participants', value: stats.uniqueParticipants },
            ].map(({ label, value }) => (
              <div key={label} className="bg-zinc-900 rounded-xl p-4">
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-zinc-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        )}

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

        {closedNoImage.length > 0 && (
          <section className="mt-10 pt-8 border-t border-zinc-900">
            <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3">Add image to past round</p>
            <select
              value={pastImageRoundId}
              onChange={e => setPastImageRoundId(e.target.value)}
              className="w-full bg-zinc-900 rounded-xl px-3 py-2 text-sm text-white mb-3 focus:outline-none focus:ring-1 focus:ring-zinc-600"
            >
              <option value="">Select a round...</option>
              {closedNoImage.map(r => (
                <option key={r.id} value={r.id}>
                  {new Date(r.closed_at!).toLocaleDateString()} — {r.prompt.slice(0, 40)}
                </option>
              ))}
            </select>
            <input
              type="file"
              accept="image/*"
              onChange={e => {
                const f = e.target.files?.[0]
                if (f) { setPastImageFile(f); setPastImagePreview(URL.createObjectURL(f)) }
              }}
              className="text-xs text-zinc-400 mb-3 block"
            />
            {pastImagePreview && (
              <img src={pastImagePreview} alt="Preview" className="mb-3 max-h-40 rounded-lg object-contain" />
            )}
            <button
              onClick={uploadImageForPastRound}
              disabled={loading || !pastImageFile || !pastImageRoundId}
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-2.5 rounded-xl text-sm transition-colors disabled:opacity-40"
            >
              Upload image
            </button>
          </section>
        )}

        <div className="mt-10 pt-8 border-t border-zinc-900 space-y-3">
          <button
            onClick={downloadBackup}
            disabled={loading}
            className="w-full bg-transparent border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-40"
          >
            Download backup
          </button>
          <button
            onClick={clearHistory}
            disabled={loading}
            className="w-full bg-transparent border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-40"
          >
            Clear history
          </button>
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
