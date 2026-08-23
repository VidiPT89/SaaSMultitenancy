'use client'

import { clerkEnabled } from '@/lib/clerk'
import { ClerkProvider } from '@clerk/nextjs'
import { LocaleProvider } from '@/i18n/LocaleProvider'
import { SessionProvider } from '@/i18n/SessionProvider'
import type { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  const inner = (
    <LocaleProvider>
      <SessionProvider>{children}</SessionProvider>
    </LocaleProvider>
  )
  if (!clerkEnabled()) return inner
  return <ClerkProvider>{inner}</ClerkProvider>
}
