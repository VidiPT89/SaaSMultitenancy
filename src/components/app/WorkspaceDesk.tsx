'use client'

import { useLocale } from '@/i18n/LocaleProvider'
import { activityCsv } from '@/lib/export'
import { hues, initials } from '@/lib/hue'
import { readJson } from '@/lib/http'
import type { UsageBar, WorkspacePayload } from '@/lib/types'
import { motion } from 'framer-motion'
import Link from 'next/link'
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

type Tab = 'overview' | 'ledger' | 'team' | 'billing'

export function WorkspaceDesk({ slug }: { slug: string }) {
  const { t, locale } = useLocale()
  const [data, setData] = useState<WorkspacePayload | null>(null)
  const [denied, setDenied] = useState(false)
  const [tab, setTab] = useState<Tab>('overview')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('member')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState('')
  const [query, setQuery] = useState('')

  const load = useCallback(async () => {
    const res = await fetch(`/api/workspaces/${slug}`)
    if (res.status === 403 || res.status === 401) {
      setDenied(true)
      setData(null)
      return
    }
    const next = await readJson<WorkspacePayload | null>(res, null)
    setData(next)
    if (next) setName(locale === 'pt' ? next.name : next.nameEn)
  }, [slug, locale])

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

  async function addNote() {
    setError('')
    const res = await fetch(`/api/workspaces/${slug}/notes`, {
      method: 'POST',
      body: JSON.stringify({ title, titleEn: title, body, bodyEn: body }),
    })
    if (res.status === 402) setError(t.noteLimit || t.jobLimit)
    setTitle('')
    setBody('')
    await load()
  }

  if (denied) {
    return (
      <div className="panel p-8 text-center">
        <p className="display text-5xl text-[#ffaa00]">{t.wall}</p>
        <Link href="/app" className="mt-4 inline-block text-[#ff7a00]">
          {t.enter}
        </Link>
      </div>
    )
  }

  if (!data) return <p className="text-[#f4e6c8]/60">{t.isolation}</p>

  const tabs: Tab[] = ['overview', 'ledger', 'team', 'billing']
  const accent = hues[data.hue as keyof typeof hues] ?? hues.ember
  const notes = data.notes.filter((item) => {
    const hay = `${item.title} ${item.titleEn} ${item.body} ${item.bodyEn}`.toLowerCase()
    return hay.includes(query.toLowerCase())
  })

  return (
    <div className="grid gap-6" style={{ ['--accent' as string]: accent }}>
      <header className="panel p-6" style={{ borderColor: `${accent}55` }}>
        <p className="display text-6xl tracking-[0.14em]" style={{ color: accent }}>
          {locale === 'pt' ? data.name : data.nameEn}
        </p>
        <p className="mt-2 text-sm text-[#f4e6c8]/70">{t.isolation}</p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <span className="rounded-full px-3 py-1 font-bold text-black" style={{ background: accent }}>
            {data.plan === 'paid' ? t.paid : t.free}
          </span>
          <button
            type="button"
            className="text-xs text-[#f4e6c8]/60"
            onClick={() => navigator.clipboard.writeText(data.slug)}
          >
            {t.slug}: {data.slug}
          </button>
          <span>
            {t.role}: {data.role === 'admin' ? t.admin : t.member}
          </span>
          <span>
            {data.usage.seats}/{data.plan === 'paid' ? '∞' : 3} {t.seats}
          </span>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {tabs.map((item) => (
            <button
              key={item}
              type="button"
              className={`rounded-full px-4 py-1 text-xs font-bold tracking-[0.14em] ${tab === item ? 'text-black' : 'border border-[#f4e6c8]/20'}`}
              style={tab === item ? { background: accent } : undefined}
              onClick={() => setTab(item)}
            >
              {t[item]}
            </button>
          ))}
        </div>
      </header>

      {tab === 'overview' && (
        <section className="grid gap-4 lg:grid-cols-2">
          <article className="panel p-5">
            <p className="display text-3xl tracking-[0.12em] text-[#ffaa00]">{t.jobs}</p>
            <p className="mt-1 text-sm text-[#f4e6c8]/60">
              {data.usage.jobTotal}/{data.usage.jobLimit === 999 ? '∞' : data.usage.jobLimit}
            </p>
            <Bars series={data.usage.jobs} />
            <button type="button" className="mt-4 rounded-full border border-[#ff7a00] px-3 py-1 text-[#ff7a00]" onClick={async () => {
              const res = await fetch(`/api/workspaces/${slug}/usage`, { method: 'POST' })
              if (res.status === 402) setError(t.jobLimit)
              await load()
            }}>
              {t.runJob}
            </button>
          </article>
          <article className="panel p-5">
            <p className="display text-3xl tracking-[0.12em] text-[#ffaa00]">{t.activity}</p>
            <button
              type="button"
              className="mb-3 text-xs text-[#ff7a00]"
              onClick={() => {
                const blob = new Blob([activityCsv(data.activity, locale)], { type: 'text/csv' })
                const url = URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = url
                link.download = `${data.slug}-activity.csv`
                link.click()
                URL.revokeObjectURL(url)
              }}
            >
              {t.export}
            </button>
            <ul className="mt-3 grid gap-2 text-sm text-[#f4e6c8]/75">
              {data.activity.map((item) => (
                <li key={item.id}>{locale === 'pt' ? item.message : item.messageEn}</li>
              ))}
            </ul>
          </article>
        </section>
      )}

      {tab === 'ledger' && (
        <section className="panel p-5">
          <p className="display text-3xl tracking-[0.12em] text-[#ffaa00]">{t.ledger}</p>
          <p className="mt-1 text-sm text-[#f4e6c8]/60">
            {data.notes.length}/{data.usage.noteLimit === 999 ? '∞' : data.usage.noteLimit}
          </p>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.search}
            className="mt-3 w-full rounded-full border border-[#f4e6c8]/20 bg-black/40 px-4 py-2"
          />
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {notes.map((item) => (
              <article key={item.id} className={`rounded-2xl border p-4 ${item.pinned ? 'border-[#ffaa00]/50' : 'border-[#f4e6c8]/10'}`}>
                <p className="display text-2xl text-[#ffaa00]">{locale === 'pt' ? item.title : item.titleEn}</p>
                <p className="mt-2 text-sm">{locale === 'pt' ? item.body : item.bodyEn}</p>
                <div className="mt-3 flex gap-3 text-xs">
                  <button type="button" className="text-[#ff7a00]" onClick={async () => {
                    await fetch(`/api/workspaces/${slug}/notes`, {
                      method: 'PATCH',
                      body: JSON.stringify({ id: item.id, pinned: !item.pinned }),
                    })
                    await load()
                  }}>
                    {item.pinned ? t.unpin : t.pin}
                  </button>
                  <button type="button" onClick={async () => {
                    await fetch(`/api/workspaces/${slug}/notes`, {
                      method: 'DELETE',
                      body: JSON.stringify({ id: item.id }),
                    })
                    await load()
                  }}>
                    {t.remove}
                  </button>
                </div>
              </article>
            ))}
          </div>
          <form
            className="mt-5 grid gap-2"
            onSubmit={(event) => {
              event.preventDefault()
              void addNote()
            }}
          >
            <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder={t.noteTitle} className="rounded-full border border-[#f4e6c8]/20 bg-black/40 px-4 py-2" />
            <textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder={t.noteBody} className="min-h-24 rounded-2xl border border-[#f4e6c8]/20 bg-black/40 px-4 py-2" />
            <button type="submit" className="w-fit rounded-full bg-[#ff7a00] px-4 py-2 text-sm font-bold text-black">
              {t.addNote}
            </button>
          </form>
          {error && <p className="mt-2 text-sm text-[#ff7a00]">{error}</p>}
        </section>
      )}

      {tab === 'team' && (
        <section className="panel p-5">
          <p className="display text-3xl tracking-[0.12em] text-[#ffaa00]">{t.members}</p>
          <ul className="mt-4 grid gap-2">
            {data.members.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-[#f4e6c8]/10 py-2">
                <span className="flex items-center gap-2">
                  <span className="avatar">{initials(item.name)}</span>
                  {item.name} · {item.email}
                </span>
                <span className="flex gap-2">
                  {data.role === 'admin' && item.id !== data.me && (
                    <>
                      <button type="button" className="text-[#ff7a00]" onClick={async () => {
                        const res = await fetch(`/api/workspaces/${slug}/members`, {
                          method: 'PATCH',
                          body: JSON.stringify({ userId: item.id, role: item.role === 'admin' ? 'member' : 'admin' }),
                        })
                        if (res.status === 409) setError(t.lastAdmin)
                        await load()
                      }}>
                        {item.role === 'admin' ? t.member : t.admin}
                      </button>
                      <button type="button" onClick={async () => {
                        const res = await fetch(`/api/workspaces/${slug}/members`, {
                          method: 'DELETE',
                          body: JSON.stringify({ userId: item.id }),
                        })
                        if (res.status === 409) setError(t.lastAdmin)
                        await load()
                      }}>
                        {t.remove}
                      </button>
                    </>
                  )}
                  {item.id === data.me ? (item.role === 'admin' ? t.admin : t.member) : item.role === 'admin' ? t.admin : t.member}
                </span>
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
              <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder={t.email} className="rounded-full border border-[#f4e6c8]/20 bg-black/40 px-4 py-2" />
              <select value={role} onChange={(event) => setRole(event.target.value)} className="rounded-full border border-[#f4e6c8]/20 bg-black px-3 py-2">
                <option value="member">{t.member}</option>
                <option value="admin">{t.admin}</option>
              </select>
              <button type="submit" className="rounded-full bg-[#ff7a00] px-4 py-2 text-sm font-bold text-black">
                {t.invite}
              </button>
            </form>
          )}
          {data.invites.length > 0 && (
            <div className="mt-4 text-sm text-[#f4e6c8]/70">
              <p>{t.pending}</p>
              {data.invites.map((item) => (
                <p key={item.id} className="mt-1 flex flex-wrap gap-3">
                  <span>
                    {item.email} · {item.token}
                  </span>
                  <button type="button" className="text-[#ff7a00]" onClick={async () => {
                    await navigator.clipboard.writeText(item.token)
                    setCopied(item.id)
                  }}>
                    {copied === item.id ? t.copied : t.copy}
                  </button>
                  {data.role === 'admin' && (
                    <button type="button" onClick={async () => {
                      await fetch(`/api/workspaces/${slug}/invite`, { method: 'DELETE', body: JSON.stringify({ id: item.id }) })
                      await load()
                    }}>
                      {t.revoke}
                    </button>
                  )}
                </p>
              ))}
            </div>
          )}
          <button
            type="button"
            className="mt-5 rounded-full border border-[#f4e6c8]/25 px-4 py-2"
            onClick={async () => {
              if (!window.confirm(t.confirmLeave)) return
              const res = await fetch(`/api/workspaces/${slug}/members`, {
                method: 'DELETE',
                body: JSON.stringify({ userId: data.me }),
              })
              if (res.status === 409) setError(t.lastAdmin)
              else window.location.href = '/app'
            }}
          >
            {t.leave}
          </button>
          {error && <p className="mt-2 text-sm text-[#ff7a00]">{error}</p>}
        </section>
      )}

      {tab === 'billing' && (
        <section className="grid gap-4 lg:grid-cols-2">
          <article className="panel p-5">
            <p className="display text-3xl tracking-[0.12em] text-[#ffaa00]">{t.plan}</p>
            <p className="mt-2">{data.plan === 'paid' ? t.paid : t.free}</p>
            <p className="mt-3 text-xs text-[#f4e6c8]/50">{t.stripeHint}</p>
            {data.role === 'admin' && data.plan === 'free' && (
              <button type="button" className="mt-4 rounded-full bg-[#ffaa00] px-4 py-2 text-sm font-bold text-black" onClick={async () => {
                const json = await readJson<{ url?: string | null }>(await fetch(`/api/workspaces/${slug}/billing`, { method: 'POST' }), {})
                if (json.url) window.location.href = json.url
                else await load()
              }}>
                {t.upgrade}
              </button>
            )}
            {data.role === 'admin' && data.plan === 'paid' && (
              <button type="button" className="mt-4 rounded-full border border-[#ff7a00] px-4 py-2 text-[#ff7a00]" onClick={async () => {
                await fetch(`/api/workspaces/${slug}/billing`, { method: 'DELETE' })
                await load()
              }}>
                {t.downgrade}
              </button>
            )}
            {data.role === 'admin' && (
              <form
                className="mt-5 flex flex-wrap gap-2"
                onSubmit={async (event) => {
                  event.preventDefault()
                  await fetch(`/api/workspaces/${slug}`, {
                    method: 'PATCH',
                    body: JSON.stringify({ name, nameEn: name }),
                  })
                  await load()
                }}
              >
                <input value={name} onChange={(event) => setName(event.target.value)} className="rounded-full border border-[#f4e6c8]/20 bg-black/40 px-4 py-2" />
                <button type="submit" className="rounded-full border border-[#ff7a00] px-4 py-2 text-[#ff7a00]">
                  {t.rename}
                </button>
              </form>
            )}
          </article>
          <article className="panel p-5">
            <p className="display text-3xl tracking-[0.12em] text-[#ffaa00]">{t.webhook}</p>
            <ul className="mt-3 text-sm text-[#f4e6c8]/70">
              {data.billing.map((item) => (
                <li key={item.id}>
                  {item.kind} · {item.createdAt.slice(0, 10)}
                </li>
              ))}
            </ul>
          </article>
        </section>
      )}
    </div>
  )
}
