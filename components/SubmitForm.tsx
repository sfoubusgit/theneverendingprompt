'use client'

import { useState } from 'react'
import { Submission } from '@/types'

const MUTATION_TYPES = [
  { value: 'mutate', label: 'Mutate' },
  { value: 'extend', label: 'Extend' },
]

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
  const [extension, setExtension] = useState('')
  const [name, setName] = useState('')
  const [mutationType, setMutationType] = useState<'mutate' | 'extend'>('mutate')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [submittedText, setSubmittedText] = useState('')
  const [error, setError] = useState<string | null>(null)

  const isExtend = mutationType === 'extend'
  const finalPrompt = isExtend
    ? `${currentPrompt} ${extension.trim()}`
    : prompt.trim()
  const charCount = isExtend
    ? currentPrompt.length + 1 + extension.trim().length
    : prompt.length
  const extMaxLen = Math.max(1, 250 - currentPrompt.length - 1)
  const canSubmit = isExtend ? extension.trim().length > 0 : prompt.trim().length > 0

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
      body: JSON.stringify({
        round_id: roundId,
        prompt: finalPrompt,
        submitter_name: name.trim() || 'anonymous',
        voter_id,
        mutation_type: mutationType,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error)
      setLoading(false)
      return
    }

    setSubmittedText(finalPrompt)
    onSubmitted({ ...data, vote_count: 0 })
    setDone(true)
    setLoading(false)
  }

  if (done) {
    return (
      <div style={{
        background: 'rgba(250,204,21,.025)',
        border: '1px solid rgba(250,204,21,.22)',
        borderLeft: '2px solid rgba(250,204,21,.55)',
        borderRadius: 4, padding: '16px 18px',
        animation: 'rise .25s ease both'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 11 }}>
          <span style={{ color: 'var(--lamp)' }}>✓</span>
          <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--lamp)' }}>
            mutation queued
          </span>
          <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.08em' }}>
            scroll up to vote
          </span>
        </div>
        <div style={{
          fontFamily: 'Georgia, serif', fontSize: 14, fontStyle: 'italic',
          color: 'var(--amber)', lineHeight: 1.5,
          borderLeft: '2px solid rgba(212,201,178,.13)', paddingLeft: 12, marginBottom: 10
        }}>
          "{submittedText}"
        </div>
        <p style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 12 }}>
          Reviewed before next round opens.
        </p>
        <button
          onClick={() => { setDone(false); setPrompt(currentPrompt); setExtension(''); setError(null) }}
          style={{
            fontFamily: 'inherit', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.1em',
            color: 'var(--t4)', background: 'none', border: 'none', cursor: 'pointer',
            padding: 0, transition: 'color .12s'
          }}
        >
          // write another →
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        {MUTATION_TYPES.map(t => {
          const active = mutationType === t.value
          const isExt = t.value === 'extend'
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => setMutationType(t.value as typeof mutationType)}
              style={{
                fontFamily: 'inherit', fontSize: 9, textTransform: 'uppercase', letterSpacing: '.09em',
                padding: '4px 10px', borderRadius: 2, border: '1px solid',
                cursor: 'pointer', transition: 'all .12s',
                color: active ? (isExt ? 'var(--cyan)' : 'var(--pink)') : 'var(--t3)',
                borderColor: active ? (isExt ? 'var(--cT3)' : 'var(--pT3)') : 'var(--div)',
                background: active ? (isExt ? 'var(--cT1)' : 'var(--pT1)') : 'none',
              } as React.CSSProperties}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      {isExtend ? (
        <div>
          {/* Locked prefix */}
          <div style={{
            background: 'rgba(0,229,255,.03)',
            border: '1px solid rgba(0,229,255,.14)',
            borderLeft: '2px solid rgba(0,229,255,.28)',
            borderBottom: 'none',
            borderRadius: '4px 4px 0 0',
            padding: '11px 14px',
            fontFamily: 'Georgia, serif', fontSize: 14, fontStyle: 'italic',
            lineHeight: 1.55, color: 'var(--t3)',
            userSelect: 'none', cursor: 'default',
            position: 'relative',
          }}>
            <span style={{
              position: 'absolute', top: 6, right: 10,
              fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase',
              color: 'rgba(0,229,255,.3)',
            }}>locked</span>
            {currentPrompt}
          </div>
          {/* Extension input */}
          <textarea
            value={extension}
            onChange={e => setExtension(e.target.value)}
            rows={2}
            required
            maxLength={extMaxLen}
            placeholder="…continue the prompt"
            autoFocus
            style={{
              width: '100%', background: 'var(--surf)',
              border: '1px solid rgba(0,229,255,.14)',
              borderLeft: '2px solid rgba(0,229,255,.28)',
              borderRadius: '0 0 4px 4px',
              color: 'var(--t1)',
              fontFamily: 'Georgia, serif', fontSize: 14, lineHeight: 1.55,
              padding: '11px 14px', resize: 'none', outline: 'none',
              transition: 'border-color .13s',
            }}
            onFocus={e => {
              e.currentTarget.style.borderColor = 'rgba(0,229,255,.45)'
              e.currentTarget.style.borderLeftColor = 'rgba(0,229,255,.45)'
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = 'rgba(0,229,255,.14)'
              e.currentTarget.style.borderLeftColor = 'rgba(0,229,255,.28)'
            }}
          />
        </div>
      ) : (
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          rows={3}
          required
          maxLength={250}
          placeholder="Write your mutation of the prompt…"
          style={{
            width: '100%', background: 'var(--surf)', border: '1px solid var(--div)',
            borderRadius: 4, color: 'var(--t1)',
            fontFamily: 'Georgia, serif', fontSize: 14, lineHeight: 1.55,
            padding: '12px 14px', resize: 'none', height: 88, outline: 'none',
            transition: 'border-color .13s'
          }}
          onFocus={e => (e.currentTarget.style.borderColor = 'rgba(255,45,135,.35)')}
          onBlur={e => (e.currentTarget.style.borderColor = 'var(--div)')}
        />
      )}

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
        <span style={{ fontSize: 10, color: 'var(--t4)', fontVariantNumeric: 'tabular-nums' }}>
          {charCount} / 250
        </span>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="your name (optional)"
          style={{
            flex: 1, background: 'var(--surf)', border: '1px solid var(--div)',
            borderRadius: 4, color: 'var(--t1)', fontFamily: 'inherit',
            fontSize: 12, padding: '9px 12px', outline: 'none',
            transition: 'border-color .13s'
          }}
          onFocus={e => (e.currentTarget.style.borderColor = 'rgba(255,45,135,.25)')}
          onBlur={e => (e.currentTarget.style.borderColor = 'var(--div)')}
        />
        <button
          type="submit"
          disabled={loading || !canSubmit}
          style={{
            fontFamily: 'inherit', fontSize: 10, textTransform: 'uppercase', letterSpacing: '.1em',
            color: 'var(--pink)', border: '1px solid var(--pT3)', background: 'none',
            borderRadius: 4, padding: '9px 18px', cursor: 'pointer',
            transition: 'background .13s', flexShrink: 0,
            opacity: loading || !canSubmit ? .4 : 1
          }}
        >
          {loading ? '…' : '[submit mutation]'}
        </button>
      </div>

      {error && (
        <p style={{ fontSize: 11, color: '#f87171', marginTop: 8 }}>[error] {error}</p>
      )}
    </form>
  )
}
