'use client'

import { useLocale } from '@/i18n/LocaleProvider'
import { useSession } from '@/i18n/SessionProvider'
import { hues } from '@/lib/hue'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

export function SiteChrome({ children }: { children: ReactNode }) {
  const { t, locale, setLocale } = useLocale()
  const { data } = useSession()
  const path = usePathname()

  return (
    <div className="relative z-10 min-h-dvh">
      <header className="sticky top-4 z-20 mx-auto w-[min(1280px,calc(100%-1.5rem))]">
        <div className="flex items-center justify-between gap-3 rounded-full border border-[#f4e6c8]/12 bg-black/70 px-4 py-2 backdrop-blur-md">
          <Link href="/" className="display text-xl tracking-[0.22em] text-[#ffaa00]">
            {t.brand}
          </Link>
          <div className="flex items-center gap-3">
            {data.workspaces.length > 0 && (
              <nav className="hidden max-w-[42vw] items-center gap-1 overflow-x-auto md:flex">
                {data.workspaces.map((item) => {
                  const active = path === `/app/${item.slug}`
                  const color = hues[item.hue as keyof typeof hues] ?? hues.ember
                  return (
                    <Link
                      key={item.slug}
                      href={`/app/${item.slug}`}
                      className={`rounded-full px-3 py-1 text-[11px] font-bold tracking-[0.12em] ${active ? 'text-black' : 'border border-[#f4e6c8]/20'}`}
                      style={active ? { background: color } : { color }}
                    >
                      {locale === 'pt' ? item.name : item.nameEn}
                    </Link>
                  )
                })}
              </nav>
            )}
            <Link href="/app" className="relative text-xs font-bold tracking-[0.16em] text-[#ff7a00]">
              {t.enter}
              {data.inbox.length > 0 && <span className="dot" />}
            </Link>
            <div className="flex overflow-hidden rounded-full border border-[#f4e6c8]/25">
              <button
                type="button"
                className={`px-3 py-1 text-xs font-bold ${locale === 'pt' ? 'bg-[#ff7a00] text-black' : ''}`}
                onClick={() => setLocale('pt')}
              >
                PT
              </button>
              <button
                type="button"
                className={`px-3 py-1 text-xs font-bold ${locale === 'en' ? 'bg-[#ff7a00] text-black' : ''}`}
                onClick={() => setLocale('en')}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </header>

      <motion.main
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
        className="mx-auto w-[min(1280px,calc(100%-1.5rem))] py-10"
      >
        {children}
      </motion.main>

      <footer className="mx-auto mt-8 w-[min(1280px,calc(100%-1.5rem))] border-t border-[#f4e6c8]/10 py-10 text-center text-sm text-[#f4e6c8]/70">
        <p className="display text-lg tracking-[0.2em] text-[#ffaa00]">{t.brand}</p>
        <p className="mt-2">{t.tagline}</p>
        <p className="mt-4">{t.developed}</p>
        <p className="mt-2 flex justify-center gap-4">
          <a href="https://ividi.dev/" className="text-[#ff7a00] hover:text-[#ffaa00]">
            ividi.dev
          </a>
          <a href="https://github.com/VidiPT89/" className="text-[#ff7a00] hover:text-[#ffaa00]">
            GitHub
          </a>
        </p>
      </footer>
    </div>
  )
}
