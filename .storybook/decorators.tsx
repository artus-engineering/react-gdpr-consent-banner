import type { Decorator } from '@storybook/react'
import { type ReactNode, useEffect } from 'react'
import { CookieConsentProvider } from '../src/components/consent'
import { CONSENT_DIALOG_HAS_BEEN_DISPLAYED, CONSENT_DIALOG_HAS_BEEN_DISPLAYED_VALUE } from '../src/constants'
import { useCookieConsentContext } from '../src/hooks'
import { defaultStoryConfig } from '../src/test-utils/fixtures'
import type { CookieConsentBannerConfig } from '../src/types'

export interface ConsentStoryParameters {
    config?: Partial<CookieConsentBannerConfig>
    includeCookieBanner?: boolean
    preSetCookies?: Record<string, string>
    markBannerDismissed?: boolean
    forceBannerOpen?: boolean
}

function expireCookie(name: string, domain?: string) {
    const pastDate = 'Thu, 01 Jan 1970 00:00:00 GMT'
    const domainAttr = domain ? `; domain=${domain}` : ''
    document.cookie = `${name}=; expires=${pastDate}; path=/${domainAttr}`
}

function getCookieDomainVariants(hostname: string, configDomain: string): Array<string | undefined> {
    const domains = new Set<string | undefined>([undefined])

    if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
        domains.add(hostname)
        const parts = hostname.split('.')
        if (parts.length >= 2) {
            domains.add(`.${parts.slice(-2).join('.')}`)
        }
    }

    if (configDomain && configDomain !== 'localhost' && configDomain !== '127.0.0.1') {
        domains.add(configDomain)
        if (!configDomain.startsWith('.')) {
            domains.add(`.${configDomain}`)
        }
    }

    return [...domains]
}

function clearConsentCookies(config: CookieConsentBannerConfig) {
    if (typeof document === 'undefined') {
        return
    }

    const names = [CONSENT_DIALOG_HAS_BEEN_DISPLAYED, ...config.providers.map(p => `${p.id}_consent`)]
    const domainVariants = getCookieDomainVariants(document.location.hostname, config.domain)

    for (const name of names) {
        for (const domain of domainVariants) {
            expireCookie(name, domain)
        }
    }
}

function ForceBannerOpen({ enabled, children }: { enabled?: boolean; children: ReactNode }) {
    const { setIsBannerOpen } = useCookieConsentContext()

    useEffect(() => {
        if (enabled) {
            setIsBannerOpen(true)
        }
    }, [enabled, setIsBannerOpen])

    return <>{children}</>
}

export const withConsentProvider: Decorator = (Story, context) => {
    const params = (context.parameters?.consent ?? {}) as ConsentStoryParameters
    const config: CookieConsentBannerConfig = {
        ...defaultStoryConfig,
        ...params.config,
        providers: params.config?.providers ?? defaultStoryConfig.providers
    }

    clearConsentCookies(config)

    if (params.markBannerDismissed) {
        document.cookie = `${CONSENT_DIALOG_HAS_BEEN_DISPLAYED}=${CONSENT_DIALOG_HAS_BEEN_DISPLAYED_VALUE}; path=/`
    }

    if (params.preSetCookies) {
        for (const [name, value] of Object.entries(params.preSetCookies)) {
            document.cookie = `${name}=${value}; path=/`
        }
    }

    return (
        <CookieConsentProvider
            key={context.id}
            config={config}
            includeCookieBanner={params.includeCookieBanner ?? false}
        >
            <ForceBannerOpen enabled={params.forceBannerOpen}>
                <Story />
            </ForceBannerOpen>
        </CookieConsentProvider>
    )
}
