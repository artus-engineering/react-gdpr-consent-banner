'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { getLocaleFromPathname } from '@/lib/i18n/paths'

export function LangAttribute() {
    const pathname = usePathname()

    useEffect(() => {
        const locale = getLocaleFromPathname(pathname) ?? 'de'
        document.documentElement.lang = locale
    }, [pathname])

    return null
}
