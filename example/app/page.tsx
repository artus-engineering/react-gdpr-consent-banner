'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { detectBrowserLocale } from '@/lib/i18n/detect-locale'
import { getHomePath } from '@/lib/i18n/paths'

export default function RootRedirectPage() {
    const router = useRouter()

    useEffect(() => {
        router.replace(getHomePath(detectBrowserLocale()))
    }, [router])

    return null
}
