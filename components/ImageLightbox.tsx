'use client'

import { useState } from 'react'

export default function ImageLightbox({ src, alt }: { src: string; alt?: string }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <img
        src={src}
        alt={alt ?? ''}
        onClick={() => setOpen(true)}
        className="w-10 h-10 object-cover flex-shrink-0 border border-cyan-900 cursor-pointer hover:border-cyan-500 transition-colors"
      />

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center cursor-pointer"
        >
          <img
            src={src}
            alt={alt ?? ''}
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={e => e.stopPropagation()}
          />
          <button
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 font-mono text-xs text-cyan-700 hover:text-cyan-300 transition-colors"
          >
            [close]
          </button>
        </div>
      )}
    </>
  )
}
