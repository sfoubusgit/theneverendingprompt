export default function HowItWorks() {
  return (
    <div className="font-mono">
      {/* 2x2 grid with arrows */}
      <div className="grid grid-cols-[1fr,2rem,1fr] grid-rows-[auto,2rem,auto]">

        {/* Row 1 */}
        <div className="border border-zinc-700 p-4">
          <p className="text-[10px] text-zinc-600 mb-2">01</p>
          <p className="text-xs text-white mb-1">READ</p>
          <p className="text-[10px] text-zinc-500">a prompt is shown</p>
        </div>

        <div className="flex items-center justify-center text-zinc-700 text-sm">→</div>

        <div className="border border-zinc-700 p-4">
          <p className="text-[10px] text-zinc-600 mb-2">02</p>
          <p className="text-xs text-white mb-1">MUTATE</p>
          <p className="text-[10px] text-zinc-500">submit your version<br />(max 250 chars)</p>
        </div>

        {/* Row 2 — vertical arrows */}
        <div className="flex items-center justify-center text-zinc-700 text-sm">↑</div>
        <div className="flex items-center justify-center">
          <span className="text-zinc-800 text-xs">∞</span>
        </div>
        <div className="flex items-center justify-center text-zinc-700 text-sm">↓</div>

        {/* Row 3 */}
        <div className="border border-zinc-700 p-4">
          <p className="text-[10px] text-zinc-600 mb-2">04</p>
          <p className="text-xs text-white mb-1">ADVANCE</p>
          <p className="text-[10px] text-zinc-500">winner becomes<br />tomorrow's prompt</p>
        </div>

        <div className="flex items-center justify-center text-zinc-700 text-sm">←</div>

        <div className="border border-zinc-700 p-4">
          <p className="text-[10px] text-zinc-600 mb-2">03</p>
          <p className="text-xs text-white mb-1">VOTE</p>
          <p className="text-[10px] text-zinc-500">community picks<br />the best one</p>
        </div>

      </div>

      <p className="text-[10px] text-zinc-700 mt-3 text-center tracking-widest">// repeat forever</p>
    </div>
  )
}
