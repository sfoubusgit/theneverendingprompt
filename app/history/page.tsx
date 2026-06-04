import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export default async function HistoryPage() {
  const { data: rounds } = await supabase
    .from('rounds')
    .select('id, prompt, image_url, closed_at, created_at, status, winner_submission_id, submissions(id, prompt)')
    .eq('status', 'closed')
    .order('closed_at', { ascending: false })

  const { data: originRound } = await supabase
    .from('rounds')
    .select('id, prompt, image_url, created_at')
    .order('created_at', { ascending: true })
    .limit(1)
    .single()

  const allRounds = rounds ?? []

  return (
    <main className="min-h-screen bg-black text-[#f0f0f0]">
      <div className="max-w-2xl mx-auto px-4 py-8">

        <header className="mb-10 pt-2">
          <a href="/" className="font-mono text-xs text-zinc-600 hover:text-zinc-400 transition-colors">← back</a>
        </header>

        <p className="font-mono text-xs text-zinc-600 mb-1">theneverendingprompt.xyz</p>
        <p className="font-mono text-2xl text-white mb-8">$ git log</p>

        <p className="font-mono text-xs text-zinc-600 mb-6">
          // {allRounds.length} round{allRounds.length !== 1 ? 's' : ''} in the chain
        </p>

        <div className="relative">
          <div className="absolute left-[5px] top-2 bottom-2 w-px bg-zinc-800" />

          <div className="space-y-6 pl-6">
            {allRounds.map((r: any) => {
              const winner = (r.submissions ?? []).find((s: any) => s.id === r.winner_submission_id)
              const hash = r.id.slice(0, 6)
              const isOrigin = originRound?.id === r.id

              return (
                <div key={r.id} className="relative">
                  <div className="absolute -left-6 top-[5px] w-[11px] h-[11px] border border-zinc-600 bg-black" />
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-[10px] text-zinc-600 mb-1">
                        {hash} · {new Date(r.closed_at).toLocaleDateString('en-GB').replace(/\//g, '.')}
                        {isOrigin && <span className="ml-2 text-zinc-700">[origin]</span>}
                      </p>
                      <p className="font-mono text-xs text-zinc-400">"{r.prompt}"</p>
                      {winner && (
                        <>
                          <p className="font-mono text-[10px] text-zinc-700 my-0.5 ml-2">↓</p>
                          <p className="font-mono text-xs text-zinc-200 ml-2">"{winner.prompt}"</p>
                        </>
                      )}
                    </div>
                    {r.image_url && (
                      <img src={r.image_url} alt="" className="w-12 h-12 object-cover flex-shrink-0 border border-zinc-800" />
                    )}
                  </div>
                </div>
              )
            })}

            {originRound && !allRounds.some((r: any) => r.id === originRound.id) && (
              <div className="relative">
                <div className="absolute -left-6 top-[5px] w-[11px] h-[11px] border border-zinc-700 bg-black" />
                <p className="font-mono text-[10px] text-zinc-600 mb-1">
                  {originRound.id.slice(0, 6)} · {new Date(originRound.created_at).toLocaleDateString('en-GB').replace(/\//g, '.')} · [origin]
                </p>
                <p className="font-mono text-xs text-zinc-400">"{originRound.prompt}"</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-zinc-900">
          <a href="/" className="font-mono text-xs text-zinc-600 hover:text-zinc-400 transition-colors">← back to today's prompt</a>
        </div>

      </div>
    </main>
  )
}
