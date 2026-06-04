'use client'

import { useState } from 'react'
import HowItWorks from './HowItWorks'

export default function HowItWorksToggle() {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="font-mono text-xs inline-flex items-center gap-2 border border-zinc-700 text-zinc-300 hover:border-zinc-400 hover:text-white px-3 py-1.5 transition-colors"
      >
        $ --help {open ? '↑' : '↓'}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-10 w-72 border border-zinc-700 bg-black p-4 shadow-xl">
          <HowItWorks />
        </div>
      )}
    </div>
  )
}
