'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import { dictionaries, type Dictionary, type Locale } from './dictionaries'

const STORAGE = 'firma-locale'

type Ctx = {
  locale: Locale
  t: Dictionary
  setLocale: (locale: Locale) => void
}

const LocaleContext = createContext<Ctx | null>(null)

// The choice lives in localStorage, read through useSyncExternalStore: no setState in an
// effect, and the server render (and first hydration pass) always uses the default 'pt'.
const listeners = new Set<() => void>()

function subscribe(onChange: () => void) {
  listeners.add(onChange)
  window.addEventListener('storage', onChange)
  return () => {
    listeners.delete(onChange)
    window.removeEventListener('storage', onChange)
  }
}

function readLocale(): Locale {
  const stored = localStorage.getItem(STORAGE)
  return stored === 'en' || stored === 'pt' ? stored : 'pt'
}

function serverLocale(): Locale {
  return 'pt'
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(subscribe, readLocale, serverLocale)

  const setLocale = useCallback((next: Locale) => {
    localStorage.setItem(STORAGE, next)
    listeners.forEach((notify) => notify())
  }, [])

  useEffect(() => {
    document.documentElement.lang = locale === 'pt' ? 'pt-PT' : 'en'
  }, [locale])

  const value = useMemo<Ctx>(
    () => ({
      locale,
      t: dictionaries[locale],
      setLocale,
    }),
    [locale, setLocale],
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale(): Ctx {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('LocaleProvider missing')
  return ctx
}
