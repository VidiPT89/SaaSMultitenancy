'use client'

import { useLocale } from '@/i18n/LocaleProvider'
import { readJson } from '@/lib/http'
import type { UsageBar, WorkspacePayload } from '@/lib/types'
import { motion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'

function Bars({ series }: { series: UsageBar[] }) {
  const max = Math.max(1, ...series.map((item) => item.quantity))
  return (
    <div className="mt-3 flex h-28 items-end gap-1">
      {series.map((item) => (
        <div key={item.day} className="flex h-full flex-1 items-end">
          <motion.div
            className="bar"
            initial={{ height: 0 }}
            animate={{ height: `${(item.quantity / max) * 100}%` }}
            transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
          />
        </div>
      ))}
    </div>
  )
}

export function WorkspaceDesk({ slug }: { slug: string }) {
  const { t, locale } = useLocale()
  const [data, setData] = useState<WorkspacePayload | null>(null)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('member')
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setData(await readJson(await fetch(`/api/workspaces/${slug}`), null))
  }, [slug])

  useEffect(() => {
    void load()
  }, [load])

  async function invite() {
    setError('')
    const res = await fetch(`/api/workspaces/${slug}/invite`, {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    })
    if (res.status === 402) setError(t.limit)
    setEmail('')
    await load()
  }

  async function upgrade() {
    const json = await readJson<{ url?: string | null }>(
      await fetch(`/api/workspaces/${slug}/billing`, { method: 'POST' }),
      {},
    )
    if (json.url) window.location.href = json.url
    else await load()
  }

  async function runJob() {
    await fetch(`/api/workspaces/${slug}/usage`, { method: 'POST' })
    await load()
  }

  if (!data) return <p className="text-[#f4e6c8]/60">{t.isolation}</p>

  return (
    <div className="grid gap-6">
      <header className="panel p-6">
        <p className="display text-6xl tracking-[0.14em] text-[#ffaa00]">
          {locale === 'pt' ? data.name : data.nameEn}
        </p>
        <p className="mt-2 text-sm text-[#f4e6c8]/70">{t.isolation}</p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <span className="rounded-full bg-[#ff7a00] px-3 py-1 font-bold text-black">
            {data.plan === 'paid' ? t.paid : t.free}
          </span>
          <span>
            {t.role}: {data.role === 'admin' ? t.admin : t.member}
          </span>
        </div>
        {data.role === 'admin' && data.plan === 'free' && (
          <button type="button" className="mt-4 rounded-full bg-[#ffaa00] px-4 py-2 text-sm font-bold text-black" onClick={upgrade}>
            {t.upgrade}
          </button>
        )}
        <p className="mt-3 text-xs text-[#f4e6c8]/50">{t.stripeHint}</p>
      </header>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="panel p-5">
          <p className="display text-3xl tracking-[0.12em] text-[#ffaa00]">{t.jobs}</p>
          <Bars series={data.usage.jobs} />
          <button type="button" className="mt-4 rounded-full border border-[#ff7a00] px-3 py-1 text-[#ff7a00]" onClick={runJob}>
            {t.runJob}
          </button>
        </article>
        <article className="panel p-5">
          <p className="display text-3xl tracking-[0.12em] text-[#ffaa00]">{t.invites}</p>
          <Bars series={data.usage.invites} />
          <p className="mt-4 text-sm">
            {t.seats}: {data.usage.seats}
          </p>
        </article>
      </section>

      <section className="panel p-5">
        <p className="display text-3xl tracking-[0.12em] text-[#ffaa00]">{t.members}</p>
        <ul className="mt-4 grid gap-2">
          {data.members.map((item) => (
            <li key={item.id} className="flex justify-between border-b border-[#f4e6c8]/10 py-2">
              <span>
                {item.name} · {item.email}
              </span>
              <span>{item.role === 'admin' ? t.admin : t.member}</span>
            </li>
          ))}
        </ul>
        {data.role === 'admin' && (
          <form
            className="mt-4 flex flex-wrap gap-2"
            onSubmit={(event) => {
              event.preventDefault()
              void invite()
            }}
          >
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={t.email}
              className="rounded-full border border-[#f4e6c8]/20 bg-black/40 px-4 py-2"
            />
            <select
              value={role}
              onChange={(event) => setRole(event.target.value)}
              className="rounded-full border border-[#f4e6c8]/20 bg-black px-3 py-2"
            >
              <option value="member">{t.member}</option>
              <option value="admin">{t.admin}</option>
            </select>
            <button type="submit" className="rounded-full bg-[#ff7a00] px-4 py-2 text-sm font-bold text-black">
              {t.invite}
            </button>
          </form>
        )}
        {error && <p className="mt-2 text-sm text-[#ff7a00]">{error}</p>}
        {data.invites.length > 0 && (
          <div className="mt-4 text-sm text-[#f4e6c8]/70">
            <p>{t.pending}</p>
            {data.invites.map((item) => (
              <p key={item.id}>
                {item.email} · {item.token}
              </p>
            ))}
          </div>
        )}
      </section>

      <section className="panel p-5">
        <p className="display text-3xl tracking-[0.12em] text-[#ffaa00]">{t.webhook}</p>
        <ul className="mt-3 text-sm text-[#f4e6c8]/70">
          {data.billing.map((item) => (
            <li key={item.id}>
              {item.kind} · {item.createdAt.slice(0, 10)}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
