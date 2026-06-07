'use client'

import { createContext, useContext } from 'react'
import type { Locale } from '@/lib/i18n/config'
import type { Dictionary } from '@/lib/i18n/messages'

type LocaleContextValue = {
    locale: Locale
    dictionary: Dictionary
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

export function LocaleProvider({
    locale,
    dictionary,
    children
}: {
    locale: Locale
    dictionary: Dictionary
    children: React.ReactNode
}) {
    return <LocaleContext.Provider value={{ locale, dictionary }}>{children}</LocaleContext.Provider>
}

export function useLocale(): LocaleContextValue {
    const context = useContext(LocaleContext)
    if (!context) {
        throw new Error('useLocale must be used within LocaleProvider')
    }
    return context
}
