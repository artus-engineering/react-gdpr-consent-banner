import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PrivacyPage } from '@/components/PrivacyPage'
import { getDictionary } from '@/lib/i18n/messages'

export function generateStaticParams() {
    return [{ lang: 'en' }]
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
    const { lang } = await params
    const dictionary = getDictionary(lang)

    return {
        title: dictionary.meta.privacyTitle,
        description: dictionary.meta.privacyDescription
    }
}

export default async function PrivacyPolicyPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params

    if (lang !== 'en') {
        notFound()
    }

    return <PrivacyPage />
}
