import type { Decorator } from '@storybook/react'
import { CookieConsentProvider } from '../src/components/consent'
import { CONSENT_DIALOG_HAS_BEEN_DISPLAYED, CONSENT_DIALOG_HAS_BEEN_DISPLAYED_VALUE } from '../src/constants'
import { defaultStoryConfig } from '../src/test-utils/fixtures'
import type { CookieConsentBannerConfig } from '../src/types'

export interface ConsentStoryParameters {
    config?: Partial<CookieConsentBannerConfig>
    includeCookieBanner?: boolean
    preSetCookies?: Record<string, string>
    markBannerDismissed?: boolean
}

function clearConsentCookies(config: CookieConsentBannerConfig) {
    const pastDate = 'Thu, 01 Jan 1970 00:00:00 GMT'
    const names = [CONSENT_DIALOG_HAS_BEEN_DISPLAYED, ...config.providers.map(p => `${p.id}_consent`)]
    for (const name of names) {
        document.cookie = `${name}=; expires=${pastDate}; path=/`
    }
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
        <CookieConsentProvider config={config} includeCookieBanner={params.includeCookieBanner ?? false}>
            <Story />
        </CookieConsentProvider>
    )
}
