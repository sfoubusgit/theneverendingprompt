'use client'

import { useState } from 'react'
import HowItWorks from './HowItWorks'

export default function HowItWorksToggle() {
  const [open, setOpen] = useState(false)

  return (
    <section className="mb-8">
      <button
        onClick={() => setOpen(o => !o)}
        className="font-mono text-xs inline-flex items-center gap-2 border border-zinc-700 text-zinc-300 hover:border-zinc-400 hover:text-white px-4 py-2 transition-colors"
      >
        $ --help <span className="text-zinc-500">·</span> how it works
        <span className="text-zinc-500">{open ? '↑' : '↓'}</span>
      </button>

      {open && (
        <div className="mt-4 border border-zinc-800 p-4">
          <HowItWorks />
        </div>
      )}
    </section>
  )
}
