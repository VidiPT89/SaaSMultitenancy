import type { Metadata } from 'next'
import { Barlow_Condensed, Karla } from 'next/font/google'
import { Providers } from '@/components/layout/Providers'
import { SiteChrome } from '@/components/layout/SiteChrome'
import './globals.css'

const display = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
})

const body = Karla({
  subsets: ['latin'],
  variable: '--font-body',
})

export const metadata: Metadata = {
  title: 'FIRMA',
  description: 'Isolated company workspaces, invites, Stripe plans and usage metrics.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-PT">
      <body className={`${display.variable} ${body.variable} antialiased`}>
        <Providers>
          <div className="sky" aria-hidden>
            <span className="ember e1" />
            <span className="ember e2" />
          </div>
          <div className="grain" aria-hidden />
          <SiteChrome>{children}</SiteChrome>
        </Providers>
      </body>
    </html>
  )
}
