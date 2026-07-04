'use client'

import { useEffect, useRef } from 'react'

export default function DnaHelix({ height = 38 }: { height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf: number
    let t = 0

    function resize() {
      if (!canvas) return
      canvas.width = canvas.offsetWidth * (window.devicePixelRatio || 1)
      canvas.height = canvas.offsetHeight * (window.devicePixelRatio || 1)
    }

    function draw() {
      if (!canvas || !ctx) return
      const W = canvas.width
      const H = canvas.height
      const dpr = window.devicePixelRatio || 1

      ctx.clearRect(0, 0, W, H)

      const cy = H / 2
      const amp = H * 0.34
      const freq = (2 * Math.PI) / (W * 0.3)
      const steps = Math.ceil(W / (dpr * 5))

      // Connecting rungs
      for (let i = 0; i <= steps; i++) {
        if (i % 5 !== 0) continue
        const x = (i / steps) * W
        const phase = x * freq + t
        const y1 = cy + Math.sin(phase) * amp
        const y2 = cy + Math.sin(phase + Math.PI) * amp
        ctx.beginPath()
        ctx.moveTo(x, y1)
        ctx.lineTo(x, y2)
        ctx.strokeStyle = 'rgba(240,240,240,0.08)'
        ctx.lineWidth = dpr
        ctx.stroke()
      }

      // Cyan strand
      ctx.beginPath()
      for (let i = 0; i <= steps; i++) {
        const x = (i / steps) * W
        const y = cy + Math.sin(x * freq + t) * amp
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.strokeStyle = 'rgba(0,229,255,0.5)'
      ctx.lineWidth = 1.5 * dpr
      ctx.stroke()

      // Pink strand
      ctx.beginPath()
      for (let i = 0; i <= steps; i++) {
        const x = (i / steps) * W
        const y = cy + Math.sin(x * freq + t + Math.PI) * amp
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.strokeStyle = 'rgba(255,45,135,0.5)'
      ctx.lineWidth = 1.5 * dpr
      ctx.stroke()

      // Nodes on each strand
      for (let i = 0; i <= steps; i++) {
        if (i % 3 !== 0) continue
        const x = (i / steps) * W
        const phase = x * freq + t

        ctx.beginPath()
        ctx.arc(x, cy + Math.sin(phase) * amp, 1.8 * dpr, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(0,229,255,0.65)'
        ctx.fill()

        ctx.beginPath()
        ctx.arc(x, cy + Math.sin(phase + Math.PI) * amp, 1.8 * dpr, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255,45,135,0.65)'
        ctx.fill()
      }

      t += 0.007
      raf = requestAnimationFrame(draw)
    }

    resize()
    draw()

    const observer = new ResizeObserver(resize)
    observer.observe(canvas)

    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ display: 'block', width: '100%', height }}
    />
  )
}
