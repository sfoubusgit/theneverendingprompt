import type { Metadata } from 'next'
import { getPosts } from '@/lib/posts'
import TreeView from '@/components/TreeView'
import SiteHeader, { SiteFooter } from '@/components/SiteHeader'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Tree — TNEP',
}

export default async function TreePage() {
  const { posts, branches } = await getPosts()

  return (
    <>
      <SiteHeader current="tree" />
      <main>
        <section className="g-intro">
          <h1>The prompt has split into branches.</h1>
          <p>Every branch mutates every day · one is posted · each square is a post</p>
        </section>
        <TreeView posts={posts} branches={branches} />
      </main>
      <SiteFooter />
    </>
  )
}
