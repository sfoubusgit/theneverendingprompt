import { supabase } from '@/lib/supabase'
// Images of posts made before materialized_posts.image_url existed, keyed by Instagram media id
import legacyImages from '@/lib/post-images.json'

export type GalleryPost = {
  id: string
  day: number               // matches DAY_NNN on the Instagram post
  branchId: string
  letter: string            // A, B, ... — same lettering as the Instagram card
  theme: string | null      // permanent theme of a themed branch
  label: string             // "B" or "G · gothic apple pie universe"
  planted: boolean          // first themed branch of its line (not inherited from the parent)
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
  theme: string | null
  splitDay: number          // posts that existed when the branch was created (0 for the root)
}

export function branchLetter(idx: number) {
  let s = ''
  for (let n = idx + 1; n > 0; n = Math.floor((n - 1) / 26)) {
    s = String.fromCharCode(65 + ((n - 1) % 26)) + s
  }
  return s
}

export function branchLabel(b: { letter: string; theme: string | null } | undefined) {
  if (!b) return '?'
  return b.theme ? `${b.letter} · ${b.theme}` : b.letter
}

function legacyImage(row: { instagram_post_id?: string | null; instagram_post_url: string | null }) {
  const id = row.instagram_post_id ?? row.instagram_post_url?.match(/\/p\/(\d+)/)?.[1]
  return id ? (legacyImages as Record<string, string>)[id] ?? null : null
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
      .select('*')   // * — keeps working whether or not `theme` exists
      .order('created_at', { ascending: true }),
  ])

  const postRows = postsRes.data ?? []
  const branches: BranchInfo[] = (branchesRes.data ?? []).map((b, i) => ({
    id: b.id,
    letter: branchLetter(i),
    parentId: b.parent_id,
    status: b.status,
    theme: b.theme ?? null,
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
      theme: branch?.theme ?? null,
      label: branchLabel(branch),
      planted: !!branch?.theme && byId.get(branch.parentId ?? '')?.theme !== branch.theme,
      prompt: row.prompt,
      imageUrl: row.image_url ?? legacyImage(row),
      instagramUrl: instagramLink(row.instagram_post_url),
      createdAt: row.created_at,
      fromDay,
      splitFrom: fromDay === null && branch?.parentId ? byId.get(branch.parentId)?.letter ?? null : null,
    }
  })

  return { posts, branches }
}
