import React, { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import {
    CookieConsentBanner,
    CookieConsentProvider,
    createFacebookPixelHook,
    createGoogleAnalyticsHook,
    createGoogleTagManagerHook,
    useOpenCookieBanner
} from '../../../src/index'
import type {
    ConsentHook,
    CookieBannerTheme,
    CookieConsentBannerConfig,
    CookieConsentLabels,
    CookieProviderConfig,
    SupportedLanguage
} from '../../../src/types'
import { getLanguageLabels } from './german-translations'

type CookieProvider = CookieProviderConfig

interface WordPressIntegrations {
    gaMeasurementId: string
    gtmContainerId: string
    gtmGranular: boolean
    fbPixelId: string
}

interface WordPressProvider {
    id: string
    name: string
    category: string
    description: string
    cookies: Array<{
        name: string
        duration: string | number
        unit: string
        purpose: string
    }>
    dataProtectionLink: string
    serviceProvider: string
}

interface WordPressConfig {
    cookiePolicyLink: string
    websiteName: string
    domain: string
    lang: string
    cookiesValidForDays: string | number
    bannerHeading?: string
    bannerIntro?: string
    theme: Record<string, string>
    providers: WordPressProvider[]
    integrations: WordPressIntegrations
}

const GOOGLE_PRIVACY_POLICY_URL = 'https://policies.google.com/privacy'
const FACEBOOK_PRIVACY_POLICY_URL = 'https://www.facebook.com/privacy/policy/'

type CookieConsentWindow = Window &
    typeof globalThis & {
        cookieConsentConfig?: WordPressConfig
        rgccOpenCookieConsent?: () => void
    }

declare global {
    interface Window {
        cookieConsentConfig?: WordPressConfig
        rgccOpenCookieConsent?: () => void
    }
}

const OPEN_CONSENT_EVENT_NAME = 'rgcc:open-cookie-consent'
const OPEN_CONSENT_HASH = '#rgcc-open-cookie-consent'
const OPEN_CONSENT_SELECTOR = 'a[href], [data-rgcc-open-cookie-consent]'

function isHTMLElement(value: EventTarget | null): value is HTMLElement {
    return value instanceof HTMLElement
}

function isSamePageUrl(url: URL): boolean {
    return url.origin === window.location.origin && url.pathname === window.location.pathname
}

function isOpenConsentTrigger(element: HTMLElement): boolean {
    if (element.hasAttribute('data-rgcc-open-cookie-consent')) {
        return true
    }

    if (!(element instanceof HTMLAnchorElement)) {
        return false
    }

    const url = new URL(element.href, window.location.href)
    return url.hash === OPEN_CONSENT_HASH && isSamePageUrl(url)
}

function buildConsentHooks(integrations: WordPressIntegrations): ConsentHook[] {
    const hooks: ConsentHook[] = []

    if (integrations.gaMeasurementId) {
        hooks.push(
            ...createGoogleAnalyticsHook(integrations.gaMeasurementId, {
                anonymizeIp: true,
                cookieFlags: 'SameSite=Strict;Secure'
            })
        )
    }

    if (integrations.gtmContainerId) {
        hooks.push(
            ...createGoogleTagManagerHook(integrations.gtmContainerId, {
                granular: Boolean(integrations.gtmGranular)
            })
        )
    }

    if (integrations.fbPixelId) {
        hooks.push(...createFacebookPixelHook(integrations.fbPixelId))
    }

    return hooks
}

function mapProviders(raw: WordPressProvider[]): CookieProvider[] {
    return raw.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category as CookieProvider['category'],
        description: p.description,
        cookies: p.cookies.map(c => ({
            name: c.name,
            duration: typeof c.duration === 'string' ? parseInt(c.duration, 10) || 0 : c.duration,
            unit: c.unit as 'days' | 'weeks' | 'months' | 'years' | 'session',
            purpose: c.purpose
        })),
        dataProtectionLink: p.dataProtectionLink,
        serviceProvider: p.serviceProvider || undefined
    }))
}

function buildGoogleAnalyticsProvider(): CookieProvider {
    return {
        id: 'google_analytics',
        name: 'Google Analytics',
        category: 'Analytics',
        description:
            'Google Analytics hilft uns zu verstehen, wie Besucher die Website nutzen, damit wir Inhalte und Funktionen verbessern können.',
        dataProtectionLink: GOOGLE_PRIVACY_POLICY_URL,
        serviceProvider: 'Google Ireland Limited',
        cookies: [
            {
                name: '_ga',
                duration: 2,
                unit: 'years',
                purpose:
                    'Unterscheidet einzelne Besucher und speichert statistische Informationen zur Nutzung der Website.'
            },
            {
                name: '_ga_*',
                duration: 2,
                unit: 'years',
                purpose: 'Speichert den Sitzungsstatus für eine Google Analytics Property.'
            },
            {
                name: '_gid',
                duration: 1,
                unit: 'days',
                purpose: 'Unterscheidet Besucher für Tagesstatistiken.'
            },
            {
                name: '_gat',
                duration: 1,
                unit: 'days',
                purpose: 'Begrenzt die Anfragerate an Google Analytics.'
            }
        ]
    }
}

function buildGoogleTagManagerAnalyticsProvider(): CookieProvider {
    return {
        id: 'google_tag_manager_analytics',
        name: 'Google Tag Manager (Analyse)',
        category: 'Analytics',
        description:
            'Google Tag Manager verwaltet Analyse-Tags auf dieser Website und gibt Analyse-Speicher erst nach Zustimmung frei.',
        dataProtectionLink: GOOGLE_PRIVACY_POLICY_URL,
        serviceProvider: 'Google Ireland Limited',
        cookies: [
            {
                name: '_ga',
                duration: 2,
                unit: 'years',
                purpose:
                    'Kann von über Google Tag Manager eingebundenen Analyse-Tags zur Besucherunterscheidung gesetzt werden.'
            },
            {
                name: '_ga_*',
                duration: 2,
                unit: 'years',
                purpose: 'Kann den Sitzungsstatus einer Google Analytics Property speichern.'
            },
            {
                name: '_gid',
                duration: 1,
                unit: 'days',
                purpose: 'Kann Besucher für Tagesstatistiken unterscheiden.'
            },
            {
                name: '_gat_*',
                duration: 1,
                unit: 'days',
                purpose: 'Kann die Anfragerate an Google-Dienste begrenzen.'
            }
        ]
    }
}

function buildGoogleTagManagerMarketingProvider(): CookieProvider {
    return {
        id: 'google_tag_manager_marketing',
        name: 'Google Tag Manager (Marketing)',
        category: 'Marketing',
        description:
            'Google Tag Manager verwaltet Marketing-Tags auf dieser Website und gibt Werbespeicher erst nach Zustimmung frei.',
        dataProtectionLink: GOOGLE_PRIVACY_POLICY_URL,
        serviceProvider: 'Google Ireland Limited',
        cookies: [
            {
                name: '_gcl_au',
                duration: 90,
                unit: 'days',
                purpose: 'Speichert Informationen zur Messung von Anzeigen-Conversions.'
            },
            {
                name: '_gcl_aw',
                duration: 90,
                unit: 'days',
                purpose: 'Speichert Google-Ads-Klickinformationen für Conversion-Messung.'
            },
            {
                name: '_gac_*',
                duration: 90,
                unit: 'days',
                purpose: 'Kann Kampagneninformationen für Google Ads und Google Analytics speichern.'
            },
            {
                name: 'IDE',
                duration: 390,
                unit: 'days',
                purpose: 'Kann von Google-Werbediensten für Anzeigenmessung und Personalisierung gesetzt werden.'
            }
        ]
    }
}

function buildFacebookPixelProvider(): CookieProvider {
    return {
        id: 'facebook_pixel',
        name: 'Facebook Pixel',
        category: 'Marketing',
        description:
            'Facebook Pixel hilft uns, die Wirkung von Anzeigen zu messen und Inhalte auf Meta-Plattformen relevanter auszuspielen.',
        dataProtectionLink: FACEBOOK_PRIVACY_POLICY_URL,
        serviceProvider: 'Meta Platforms Ireland Limited',
        cookies: [
            {
                name: '_fbp',
                duration: 90,
                unit: 'days',
                purpose: 'Identifiziert Browser für Anzeigenmessung und Retargeting.'
            },
            {
                name: '_fbc',
                duration: 90,
                unit: 'days',
                purpose: 'Speichert Facebook-Klickinformationen für Conversion-Messung.'
            },
            {
                name: 'fr',
                duration: 90,
                unit: 'days',
                purpose: 'Kann von Facebook zur Anzeigenbereitstellung und Messung verwendet werden.'
            }
        ]
    }
}

function buildPredefinedProviders(integrations: WordPressIntegrations): CookieProvider[] {
    const providers: CookieProvider[] = []

    if (integrations.gaMeasurementId) {
        providers.push(buildGoogleAnalyticsProvider())
    }

    if (integrations.gtmContainerId) {
        providers.push(buildGoogleTagManagerAnalyticsProvider(), buildGoogleTagManagerMarketingProvider())
    }

    if (integrations.fbPixelId) {
        providers.push(buildFacebookPixelProvider())
    }

    return providers
}

function mergeProviders(
    configuredProviders: CookieProvider[],
    predefinedProviders: CookieProvider[]
): CookieProvider[] {
    const configuredProviderIds = new Set(configuredProviders.map(provider => provider.id))
    const missingPredefinedProviders = predefinedProviders.filter(provider => !configuredProviderIds.has(provider.id))

    return [...configuredProviders, ...missingPredefinedProviders]
}

function buildWordPressLabels(raw: WordPressConfig): CookieConsentLabels {
    const base = getLanguageLabels('deDE')
    const heading = (raw.bannerHeading ?? '').trim() || base.headings.banner
    const intro = (raw.bannerIntro ?? '').trim() || base.descriptions.cookieDetails

    return {
        ...base,
        headings: { ...base.headings, banner: heading },
        descriptions: { ...base.descriptions, cookieDetails: intro }
    }
}

function buildConfig(raw: WordPressConfig): CookieConsentBannerConfig {
    const theme: CookieBannerTheme = {
        bgPrimary: raw.theme.bgPrimary || '#ffffff',
        bgSecondary: raw.theme.bgSecondary || '#f8fafc',
        textPrimary: raw.theme.textPrimary || '#1e293b',
        textSecondary: raw.theme.textSecondary || '#64748b',
        primaryColor: raw.theme.primaryColor || '#3b82f6',
        buttonText: raw.theme.buttonText || '#ffffff'
    }

    return {
        cookiePolicyLink: raw.cookiePolicyLink,
        websiteName: raw.websiteName,
        domain: raw.domain || window.location.hostname,
        lang: 'deDE' as SupportedLanguage,
        cookiesValidForDays:
            typeof raw.cookiesValidForDays === 'string'
                ? parseInt(raw.cookiesValidForDays, 10) || 183
                : raw.cookiesValidForDays || 183,
        labels: buildWordPressLabels(raw),
        theme,
        providers: mergeProviders(mapProviders(raw.providers || []), buildPredefinedProviders(raw.integrations)),
        consentHooks: buildConsentHooks(raw.integrations)
    }
}

function CookieBannerApp({ config }: { config: CookieConsentBannerConfig }) {
    return (
        <CookieConsentProvider config={config}>
            <WordPressCookieConsentBridge />
            <CookieConsentBanner />
        </CookieConsentProvider>
    )
}

function WordPressCookieConsentBridge(): null {
    const openCookieBanner = useOpenCookieBanner()

    useEffect(() => {
        const cookieConsentWindow = window as CookieConsentWindow

        const openBanner = (): void => {
            openCookieBanner()
        }

        const handleOpenEvent = (): void => {
            openBanner()
        }

        const handleHashChange = (): void => {
            if (window.location.hash === OPEN_CONSENT_HASH) {
                openBanner()
            }
        }

        const handleDocumentClick = (event: MouseEvent): void => {
            if (!isHTMLElement(event.target)) {
                return
            }

            const trigger = event.target.closest<HTMLElement>(OPEN_CONSENT_SELECTOR)
            if (!trigger || !isOpenConsentTrigger(trigger)) {
                return
            }

            event.preventDefault()
            openBanner()
        }

        cookieConsentWindow.rgccOpenCookieConsent = openBanner
        window.addEventListener(OPEN_CONSENT_EVENT_NAME, handleOpenEvent)
        window.addEventListener('hashchange', handleHashChange)
        document.addEventListener('click', handleDocumentClick)

        handleHashChange()

        return () => {
            if (cookieConsentWindow.rgccOpenCookieConsent === openBanner) {
                delete cookieConsentWindow.rgccOpenCookieConsent
            }
            window.removeEventListener(OPEN_CONSENT_EVENT_NAME, handleOpenEvent)
            window.removeEventListener('hashchange', handleHashChange)
            document.removeEventListener('click', handleDocumentClick)
        }
    }, [openCookieBanner])

    return null
}

function init(): void {
    const raw = window.cookieConsentConfig
    if (!raw) {
        return
    }

    const config = buildConfig(raw)

    const container = document.createElement('div')
    container.id = 'rgcc-cookie-consent-root'
    document.body.appendChild(container)

    createRoot(container).render(<CookieBannerApp config={config} />)
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
} else {
    init()
}
