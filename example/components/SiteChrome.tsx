'use client'

import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { useLocale } from '@/components/LocaleProvider'
import { getPrivacyPath } from '@/lib/i18n/paths'

const LICENSE_URL = 'https://github.com/artus-engineering/react-gdpr-consent-banner/blob/main/LICENSE'
const CONTACT_URL = 'https://artus-engineering.de/kontakt'
const COMPANY_URL = 'https://artus-engineering.de'
const IMPRESSUM_URL = 'https://artus-engineering.de/impressum'

export function SiteHeader() {
    return (
        <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto flex items-center justify-between h-16 gap-4">
                    <a href={COMPANY_URL} target="_blank" rel="noopener noreferrer" className="inline-flex">
                        <img
                            src="/artus-engineering-logo.svg"
                            alt="Artus Engineering"
                            className="h-10 w-auto"
                            width={156}
                            height={40}
                        />
                    </a>
                    <LanguageSwitcher />
                </div>
            </div>
        </header>
    )
}

export function LicenseNotice() {
    const { dictionary } = useLocale()
    const t = dictionary.licenseNotice

    return (
        <div
            role="note"
            className="rounded-xl border border-violet-200 bg-violet-50/60 px-4 py-3 text-sm text-slate-700"
        >
            <p>
                {t.textBefore}{' '}
                <a
                    href={LICENSE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-violet-700 underline underline-offset-2 hover:text-violet-900"
                >
                    {t.licenseName}
                </a>
                {t.textMiddle}{' '}
                <a
                    href={CONTACT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-violet-700 underline underline-offset-2 hover:text-violet-900"
                >
                    {t.contactLabel}
                </a>
                {t.textAfter}
            </p>
        </div>
    )
}

export function SiteFooter() {
    const { locale, dictionary } = useLocale()
    const t = dictionary.footer
    const year = new Date().getFullYear()

    return (
        <footer className="border-t bg-white/80 mt-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="max-w-6xl mx-auto flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-sm text-slate-600">
                    <p>
                        © {year}{' '}
                        <a
                            href={COMPANY_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-slate-800 hover:text-violet-700"
                        >
                            Artus Engineering GmbH
                        </a>
                    </p>
                    <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label={t.legalNav}>
                        <a
                            href={COMPANY_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-violet-700"
                        >
                            artus-engineering.de
                        </a>
                        <a href={getPrivacyPath(locale)} className="hover:text-violet-700">
                            {t.privacy}
                        </a>
                        <a
                            href={IMPRESSUM_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-violet-700"
                        >
                            {t.imprint}
                        </a>
                        <a
                            href={LICENSE_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-violet-700"
                        >
                            {t.license}
                        </a>
                        <a
                            href={CONTACT_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-violet-700"
                        >
                            {t.contact}
                        </a>
                    </nav>
                </div>
            </div>
        </footer>
    )
}
