'use client'

import { readJson } from '@/lib/http'
import type { DeskPayload } from '@/lib/types'
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

const empty: DeskPayload = { user: null, demoUsers: [], clerk: false, workspaces: [], inbox: [] }

type Ctx = {
  data: DeskPayload
  refresh: () => Promise<void>
}

const SessionContext = createContext<Ctx | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DeskPayload>(empty)

  const refresh = useCallback(async () => {
    setData(await readJson(await fetch('/api/session'), empty))
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const value = useMemo(() => ({ data, refresh }), [data, refresh])
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession(): Ctx {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('SessionProvider missing')
  return ctx
}
