'use client'

import Link from 'next/link'
import { useLocale } from '@/components/LocaleProvider'
import { SiteFooter, SiteHeader } from '@/components/SiteChrome'
import { getHomePath } from '@/lib/i18n/paths'

const GITHUB_PRIVACY_URL = 'https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement'
const CONTACT_URL = 'https://artus-engineering.de/kontakt'
const EMAIL = 'hi@artus-engineering.de'

export function PrivacyPage() {
    const { locale, dictionary } = useLocale()
    const t = dictionary.privacy

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-50 flex flex-col">
            <SiteHeader />

            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1">
                <article className="max-w-3xl mx-auto space-y-8 text-slate-700 leading-relaxed">
                    <header className="space-y-3">
                        <h1 className="text-3xl font-bold text-slate-900">{t.title}</h1>
                    </header>

                    <section className="space-y-3">
                        <h2 className="text-xl font-semibold text-slate-900">{t.sections[0].title}</h2>
                        <h3 className="text-lg font-medium text-slate-800">{t.sections[0].subsections?.[0]?.title}</h3>
                        {t.sections[0].subsections?.[0]?.paragraphs.map(paragraph => (
                            <p key={paragraph}>{paragraph}</p>
                        ))}
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-semibold text-slate-900">{t.sections[1].title}</h2>
                        <p>{t.sections[1].paragraphs?.[0]}</p>
                        <p>
                            Artus Engineering GmbH
                            <br />
                            Wilhelmstraße 18
                            <br />
                            76344 Eggenstein-Leopoldshafen
                            <br />
                            {locale === 'de' ? 'Telefon' : 'Phone'}: 0721 4671 2023
                            <br />
                            {locale === 'de' ? 'E-Mail' : 'Email'}:{' '}
                            <a
                                href={`mailto:${EMAIL}`}
                                className="text-violet-700 underline underline-offset-2 hover:text-violet-900"
                            >
                                {EMAIL}
                            </a>
                        </p>
                        <p>{t.sections[1].paragraphs?.[2]}</p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-semibold text-slate-900">{t.sections[2].title}</h2>
                        <p>{t.sections[2].paragraphs?.[0]}</p>
                        <p>{t.sections[2].paragraphs?.[1]}</p>
                        <p>
                            {locale === 'de'
                                ? 'Die Datenübertragung in die USA erfolgt auf Grundlage der Standardvertragsklauseln der EU-Kommission. Weitere Informationen entnehmen Sie der'
                                : 'Data transfers to the USA are based on the EU Commission Standard Contractual Clauses. Further information is available in'}{' '}
                            <a
                                href={GITHUB_PRIVACY_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-violet-700 underline underline-offset-2 hover:text-violet-900"
                            >
                                {t.githubPrivacyLabel}
                            </a>
                            .
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-semibold text-slate-900">{t.sections[3].title}</h2>
                        {t.sections[3].subsections?.map((subsection, index) => (
                            <div key={subsection.title ?? `block-${index}`} className="space-y-3">
                                {subsection.title ? (
                                    <h3 className="text-lg font-medium text-slate-800">{subsection.title}</h3>
                                ) : null}
                                {subsection.paragraphs.map(paragraph => {
                                    if (paragraph.includes(t.cookieSettingsLink)) {
                                        return (
                                            <p key={paragraph}>
                                                {locale === 'de' ? (
                                                    <>
                                                        Sie können Ihre Auswahl jederzeit über „{t.cookieSettingsLink}“
                                                        auf der{' '}
                                                        <Link
                                                            href={getHomePath(locale)}
                                                            className="text-violet-700 underline underline-offset-2 hover:text-violet-900"
                                                        >
                                                            {t.homeLink}
                                                        </Link>{' '}
                                                        ändern oder Cookies in Ihrem Browser löschen.
                                                    </>
                                                ) : (
                                                    <>
                                                        You can change your choice at any time via &quot;
                                                        {t.cookieSettingsLink}&quot; on the{' '}
                                                        <Link
                                                            href={getHomePath(locale)}
                                                            className="text-violet-700 underline underline-offset-2 hover:text-violet-900"
                                                        >
                                                            {t.homeLink}
                                                        </Link>{' '}
                                                        or by deleting cookies in your browser.
                                                    </>
                                                )}
                                            </p>
                                        )
                                    }
                                    return <p key={paragraph}>{paragraph}</p>
                                })}
                                {subsection.listItems ? (
                                    <ul className="list-disc pl-6 space-y-1">
                                        {subsection.listItems.map(item => (
                                            <li key={item}>{item}</li>
                                        ))}
                                    </ul>
                                ) : null}
                            </div>
                        ))}
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-semibold text-slate-900">{t.sections[4].title}</h2>
                        <p>{t.sections[4].paragraphs?.[0]}</p>
                        <p>
                            {locale === 'de'
                                ? 'Zur Ausübung Ihrer Rechte oder bei Fragen zum Datenschutz erreichen Sie uns unter den oben genannten Kontaktdaten der verantwortlichen Stelle oder über'
                                : 'To exercise your rights or if you have privacy questions, contact us using the controller details above or via'}{' '}
                            <a
                                href={CONTACT_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-violet-700 underline underline-offset-2 hover:text-violet-900"
                            >
                                {t.contactPageLabel}
                            </a>
                            .
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-semibold text-slate-900">{t.sections[5].title}</h2>
                        <p>{t.sections[5].paragraphs?.[0]}</p>
                    </section>

                    <p className="text-sm text-slate-500">{t.updatedAt}</p>

                    <p>
                        <Link
                            href={getHomePath(locale)}
                            className="text-violet-700 underline underline-offset-2 hover:text-violet-900"
                        >
                            {t.backToDemo}
                        </Link>
                    </p>
                </article>
            </main>

            <SiteFooter />
        </div>
    )
}
