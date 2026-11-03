import { supabase } from '@/lib/supabase'

export type GalleryPost = {
  id: string
  day: number               // matches DAY_NNN on the Instagram post
  branchId: string
  letter: string            // A, B, ... — same lettering as the Instagram card
  prompt: string
  imageUrl: string | null
  instagramUrl: string | null
  createdAt: string
  fromDay: number | null    // previous post of the same branch
  splitFrom: string | null  // parent branch letter, when this is a branch's first post
}

export type BranchInfo = {
  id: string
  letter: string
  parentId: string | null
  status: string
  splitDay: number          // posts that existed when the branch was created (0 for the root)
}

export function branchLetter(idx: number) {
  let s = ''
  for (let n = idx + 1; n > 0; n = Math.floor((n - 1) / 26)) {
    s = String.fromCharCode(65 + ((n - 1) % 26)) + s
  }
  return s
}

/** Old rows stored /p/<media id>/, which Instagram doesn't resolve — fall back to the profile. */
function instagramLink(url: string | null) {
  if (!url || /\/p\/\d+\/?$/.test(url)) return 'https://instagram.com/theneverendingprompt.xyz'
  return url
}

/** All posts that made it to Instagram, oldest first, numbered exactly like the Instagram days. */
export async function getPosts(): Promise<{ posts: GalleryPost[]; branches: BranchInfo[] }> {
  const [postsRes, branchesRes] = await Promise.all([
    supabase
      .from('materialized_posts')
      .select('*')
      .not('instagram_post_url', 'is', null)
      .order('created_at', { ascending: true }),
    supabase
      .from('branches')
      .select('id, parent_id, status, created_at')
      .order('created_at', { ascending: true }),
  ])

  const postRows = postsRes.data ?? []
  const branches: BranchInfo[] = (branchesRes.data ?? []).map((b, i) => ({
    id: b.id,
    letter: branchLetter(i),
    parentId: b.parent_id,
    status: b.status,
    splitDay: b.parent_id ? postRows.filter(p => p.created_at < b.created_at).length : 0,
  }))
  const byId = new Map(branches.map(b => [b.id, b]))
  const lastDay = new Map<string, number>()

  const posts: GalleryPost[] = postRows.map((row, i) => {
    const day = i + 1
    const branch = byId.get(row.branch_id)
    const fromDay = lastDay.get(row.branch_id) ?? null
    lastDay.set(row.branch_id, day)
    return {
      id: row.id,
      day,
      branchId: row.branch_id,
      letter: branch?.letter ?? '?',
      prompt: row.prompt,
      imageUrl: row.image_url ?? null,
      instagramUrl: instagramLink(row.instagram_post_url),
      createdAt: row.created_at,
      fromDay,
      splitFrom: fromDay === null && branch?.parentId ? byId.get(branch.parentId)?.letter ?? null : null,
    }
  })

  return { posts, branches }
}
