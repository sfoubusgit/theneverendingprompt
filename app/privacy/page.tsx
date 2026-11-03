import type { Metadata } from 'next'
import SiteHeader, { SiteFooter } from '@/components/SiteHeader'

export const metadata: Metadata = {
  title: 'Privacy — TNEP',
  description: 'What theneverendingprompt.xyz does and does not collect.',
}

const MAIL = 'contact@theneverendingprompt.xyz'

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="legal">
        <h1>Privacy</h1>
        <p className="legal-meta">Effective 3 November 2026 · theneverendingprompt.xyz</p>

        <p className="legal-lead">
          This site is a read-only gallery. It has no accounts, no forms, no cookies, no analytics
          and no advertising trackers. It stores nothing in your browser.
        </p>

        <h2>Who we are</h2>
        <p>
          The Never Ending Prompt (&ldquo;TNEP&rdquo;) is an experimental AI-art project, operated by an
          independent creator based in France. Contact: <a href={`mailto:${MAIL}`}>{MAIL}</a>
        </p>

        <h2>What happens when you visit</h2>
        <ul>
          <li>
            <strong>Hosting — Vercel.</strong> Like every web server, Vercel processes your IP address
            and browser details to deliver the page and may keep short-lived technical logs.
          </li>
          <li>
            <strong>Images — Cloudinary.</strong> The images are loaded from Cloudinary&rsquo;s CDN, so your
            browser connects to Cloudinary and transmits your IP address.
          </li>
          <li>
            <strong>Data — Supabase.</strong> The prompts are read from a Supabase database (EU). No data
            about you is written there.
          </li>
          <li>
            <strong>Instagram.</strong> Links to Instagram only connect you to Meta when you click them;
            Meta&rsquo;s own privacy policy then applies.
          </li>
        </ul>
        <p>
          The legal basis is our legitimate interest in delivering a working website (Art. 6(1)(f) GDPR).
        </p>

        <h2>Your rights</h2>
        <p>
          You have the right to access, correct, delete or restrict the processing of your personal data,
          and to complain to a data-protection authority. We hold no personal data about visitors
          ourselves; write to <a href={`mailto:${MAIL}`}>{MAIL}</a> with any request.
        </p>
      </main>
      <SiteFooter />
    </>
  )
}
