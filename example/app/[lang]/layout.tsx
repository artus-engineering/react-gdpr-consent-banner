import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { LocaleProvider } from '@/components/LocaleProvider'
import { isValidLocale, type Locale, locales } from '@/lib/i18n/config'
import { getDictionary } from '@/lib/i18n/messages'

export function generateStaticParams() {
    return locales.map(lang => ({ lang }))
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
    const { lang } = await params
    const dictionary = getDictionary(lang)

    return {
        title: dictionary.meta.siteTitle,
        description: dictionary.meta.siteDescription
    }
}

export default async function LangLayout({
    children,
    params
}: {
    children: React.ReactNode
    params: Promise<{ lang: string }>
}) {
    const { lang } = await params

    if (!isValidLocale(lang)) {
        notFound()
    }

    const dictionary = getDictionary(lang)

    return (
        <LocaleProvider locale={lang as Locale} dictionary={dictionary}>
            {children}
        </LocaleProvider>
    )
}
