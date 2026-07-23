import { supabase } from '@/lib/supabase'
import TreeView from '@/components/TreeView'

export const dynamic = 'force-dynamic'

export default async function TreePage() {
  const [stateRes, branchesRes, postsRes] = await Promise.all([
    supabase
      .from('evolution_state')
      .select('cycle_step, day_count, last_run_at')
      .eq('id', 1)
      .single(),
    supabase
      .from('branches')
      .select('id, prompt, parent_id, vitality, status, module_history, prompt_history, created_at, last_materialized_at')
      .order('created_at', { ascending: true }),
    supabase
      .from('materialized_posts')
      .select('id, branch_id, prompt, instagram_post_url, created_at')
      .order('created_at', { ascending: true }),
  ])

  const evolutionState = {
    cycleStep: stateRes.data?.cycle_step ?? 0,
    dayCount:  stateRes.data?.day_count  ?? 0,
    lastRunAt: stateRes.data?.last_run_at ?? null,
  }

  return (
    <TreeView
      branches={branchesRes.data ?? []}
      evolutionState={evolutionState}
      posts={postsRes.data ?? []}
    />
  )
}
