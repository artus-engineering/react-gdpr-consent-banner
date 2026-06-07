'use client'

import { usePathname, useRouter } from 'next/navigation'
import { type Locale, locales } from '@/lib/i18n/config'
import { switchLocaleInPath } from '@/lib/i18n/paths'
import { useLocale } from './LocaleProvider'

const localeLabels: Record<Locale, string> = {
    de: 'Deutsch',
    en: 'English'
}

export function LanguageSwitcher() {
    const { locale, dictionary } = useLocale()
    const pathname = usePathname()
    const router = useRouter()

    return (
        <div className="flex items-center gap-2">
            <label htmlFor="language-select" className="sr-only">
                {dictionary.header.languageLabel}
            </label>
            <select
                id="language-select"
                value={locale}
                onChange={event => {
                    const nextLocale = event.target.value as Locale
                    if (locales.includes(nextLocale)) {
                        router.push(switchLocaleInPath(pathname, nextLocale))
                    }
                }}
                className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
            >
                {locales.map(option => (
                    <option key={option} value={option}>
                        {localeLabels[option]}
                    </option>
                ))}
            </select>
        </div>
    )
}
