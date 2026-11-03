import { getPosts } from '@/lib/posts'
import Gallery from '@/components/Gallery'
import SiteHeader, { SiteFooter } from '@/components/SiteHeader'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const { posts, branches } = await getPosts()
  const latest = posts.at(-1)
  const active = branches.filter(b => b.status === 'active').length

  return (
    <>
      <SiteHeader current="gallery" />
      <main>
        <section className="g-intro">
          <h1>One prompt. Rewritten by an AI every day.</h1>
          <p>
            Day {latest?.day ?? 0} · {active} branch{active === 1 ? '' : 'es'} · no human input
          </p>
        </section>
        <Gallery posts={[...posts].reverse()} />
      </main>
      <SiteFooter />
    </>
  )
}
