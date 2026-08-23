'use client'

import { useLocale } from '@/i18n/LocaleProvider'
import { readJson } from '@/lib/http'
import type { DeskPayload } from '@/lib/types'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'

const empty: DeskPayload = { user: null, demoUsers: [], clerk: false, workspaces: [] }

export function Desk() {
  const { t, locale } = useLocale()
  const [data, setData] = useState<DeskPayload>(empty)
  const [name, setName] = useState('')
  const [token, setToken] = useState('')

  const load = useCallback(async () => {
    setData(await readJson(await fetch('/api/session'), empty))
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function signIn(userId: string) {
    await fetch('/api/session', { method: 'POST', body: JSON.stringify({ userId }) })
    await load()
  }

  async function signOut() {
    await fetch('/api/session', { method: 'DELETE' })
    await load()
  }

  async function createWorkspace() {
    const res = await fetch('/api/workspaces', {
      method: 'POST',
      body: JSON.stringify({ name, nameEn: name }),
    })
    const json = await readJson<{ slug?: string }>(res, {})
    setName('')
    if (json.slug) window.location.href = `/app/${json.slug}`
    else await load()
  }

  async function accept() {
    const res = await fetch('/api/invites/accept', {
      method: 'POST',
      body: JSON.stringify({ token }),
    })
    const json = await readJson<{ slug?: string }>(res, {})
    if (json.slug) window.location.href = `/app/${json.slug}`
  }

  return (
    <div className="grid gap-8">
      <section className="panel p-6">
        <p className="display text-4xl tracking-[0.16em] text-[#ffaa00]">{t.signIn}</p>
        <p className="mt-2 text-sm text-[#f4e6c8]/70">{data.clerk ? t.clerkHint : t.demoHint}</p>
        {data.user ? (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span>
              {data.user.name} · {data.user.email}
            </span>
            {!data.clerk && (
              <button type="button" className="rounded-full border border-[#f4e6c8]/25 px-3 py-1" onClick={signOut}>
                {t.signOut}
              </button>
            )}
          </div>
        ) : (
          <div className="mt-4 flex flex-wrap gap-2">
            {data.demoUsers.map((user) => (
              <button
                key={user.id}
                type="button"
                className="rounded-full bg-[#ff7a00] px-3 py-1 text-sm font-bold text-black"
                onClick={() => signIn(user.id)}
              >
                {user.name}
              </button>
            ))}
          </div>
        )}
      </section>

      {data.user && (
        <>
          <section>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <p className="display text-5xl tracking-[0.14em] text-[#ffaa00]">{t.workspaces}</p>
              <form
                className="flex gap-2"
                onSubmit={(event) => {
                  event.preventDefault()
                  void createWorkspace()
                }}
              >
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder={t.workspaceName}
                  className="rounded-full border border-[#f4e6c8]/20 bg-black/40 px-4 py-2"
                />
                <button type="submit" className="rounded-full bg-[#ff7a00] px-4 py-2 text-sm font-bold text-black">
                  {t.newWorkspace}
                </button>
              </form>
            </div>
            {data.workspaces.length === 0 ? (
              <p className="text-[#f4e6c8]/60">{t.empty}</p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {data.workspaces.map((item, index) => (
                  <motion.article
                    key={item.slug}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                    className="panel p-5"
                  >
                    <p className="display text-3xl tracking-[0.12em] text-[#ffaa00]">
                      {locale === 'pt' ? item.name : item.nameEn}
                    </p>
                    <p className="mt-2 text-sm text-[#f4e6c8]/65">
                      {item.plan === 'paid' ? t.paid : t.free} · {item.role} · {item.members} {t.seats}
                    </p>
                    <Link href={`/app/${item.slug}`} className="mt-4 inline-block text-[#ff7a00]">
                      {t.open}
                    </Link>
                  </motion.article>
                ))}
              </div>
            )}
          </section>

          <form
            className="panel flex flex-wrap items-end gap-3 p-5"
            onSubmit={(event) => {
              event.preventDefault()
              void accept()
            }}
          >
            <label className="grid gap-1 text-sm">
              {t.token}
              <input
                value={token}
                onChange={(event) => setToken(event.target.value)}
                className="rounded-full border border-[#f4e6c8]/20 bg-black/40 px-4 py-2"
              />
            </label>
            <button type="submit" className="rounded-full border border-[#ff7a00] px-4 py-2 text-[#ff7a00]">
              {t.accept}
            </button>
          </form>
        </>
      )}
    </div>
  )
}
