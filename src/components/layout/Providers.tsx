'use client'

import { clerkEnabled } from '@/lib/clerk'
import { ClerkProvider } from '@clerk/nextjs'
import { LocaleProvider } from '@/i18n/LocaleProvider'
import type { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  const inner = <LocaleProvider>{children}</LocaleProvider>
  if (!clerkEnabled()) return inner
  return <ClerkProvider>{inner}</ClerkProvider>
}
