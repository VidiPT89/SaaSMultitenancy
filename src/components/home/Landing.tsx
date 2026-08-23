'use client'

import { useLocale } from '@/i18n/LocaleProvider'
import { motion } from 'framer-motion'
import Link from 'next/link'

const pillars = [
  { pt: 'Empresas isoladas', en: 'Isolated companies' },
  { pt: 'Convites e papéis', en: 'Invites and roles' },
  { pt: 'Free e pago', en: 'Free and paid' },
  { pt: 'Webhooks Stripe', en: 'Stripe webhooks' },
  { pt: 'Livro e métricas', en: 'Ledger and metrics' },
]

export function Landing() {
  const { t, locale } = useLocale()

  return (
    <div className="grid gap-12">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="display text-6xl tracking-[0.18em] text-[#ffaa00] sm:text-8xl">{t.brand}</p>
          <p className="mt-4 max-w-xl text-lg text-[#f4e6c8]/80">{t.heroLead}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            {pillars.map((item) => (
              <span
                key={item.en}
                className="rounded-full border border-[#f4e6c8]/15 px-3 py-1 text-xs tracking-[0.16em]"
              >
                {locale === 'pt' ? item.pt : item.en}
              </span>
            ))}
          </div>
          <Link
            href="/app"
            className="mt-10 inline-flex rounded-full bg-[#ff7a00] px-6 py-3 text-sm font-bold text-black"
          >
            {t.enter}
          </Link>
        </div>
        <div className="grid gap-3">
          {['iVidi.dev', 'Atelier Cascais', 'Estúdio Norte'].map((name, index) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.12 * index, duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
              className="panel px-5 py-6"
            >
              <p className="display text-3xl tracking-[0.14em] text-[#ffaa00]">{name}</p>
              <p className="mt-2 text-sm text-[#f4e6c8]/65">{t.isolation}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <section>
        <p className="display text-4xl tracking-[0.14em] text-[#ffaa00]">{t.compare}</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <article className="panel p-6">
            <p className="display text-3xl text-[#ffaa00]">{t.free}</p>
            <p className="mt-3 text-sm">{t.freeSeats} · {t.freeNotes}</p>
          </article>
          <article className="panel glow p-6">
            <p className="display text-3xl text-[#ffaa00]">{t.paid}</p>
            <p className="mt-3 text-sm">{t.paidSeats} · {t.paidNotes}</p>
          </article>
        </div>
      </section>
    </div>
  )
}
