import { render, screen, waitFor } from '@testing-library/react'
import React, { useContext } from 'react'
import { consentHookManager } from '../../consentHooks'
import { CONSENT_DIALOG_HAS_BEEN_DISPLAYED, CONSENT_DIALOG_HAS_BEEN_DISPLAYED_VALUE } from '../../constants'
import { CookieConsentBannerConfig, CookieProviderConfig } from '../../types'
import { CookieConsentProvider } from './ConsentProvider'
import { ConsentState, ConsentStateProviderContext } from './context'

function clearAllCookies() {
    for (const cookie of document.cookie.split(';')) {
        const name = cookie.split('=')[0]?.trim()
        if (name) {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`
        }
    }
}

function ContextProbe({ onContext }: { readonly onContext: (ctx: ConsentState | null) => void }) {
    const ctx = useContext(ConsentStateProviderContext)
    onContext(ctx)
    return <div data-testid="probe">ready</div>
}

const analyticsProvider: CookieProviderConfig = {
    id: 'analytics',
    name: 'Analytics',
    category: 'Analytics',
    description: 'Analytics cookies',
    dataProtectionLink: 'https://example.com/privacy',
    cookies: [{ name: '_ga', duration: 30, unit: 'days', purpose: 'tracking' }]
}

const baseConfig: CookieConsentBannerConfig = {
    domain: 'example.com',
    websiteName: 'Example',
    cookiePolicyLink: 'https://example.com/cookies',
    providers: [analyticsProvider]
}

describe('CookieConsentProvider', () => {
    beforeEach(() => {
        clearAllCookies()
        consentHookManager.clearHooks()
    })

    it('renders its children', () => {
        render(
            <CookieConsentProvider config={baseConfig} includeCookieBanner={false}>
                <div data-testid="child">Hello</div>
            </CookieConsentProvider>
        )

        expect(screen.getByTestId('child')).toHaveTextContent('Hello')
    })

    it('provides a context value with the passed config', () => {
        const onContext = jest.fn()
        render(
            <CookieConsentProvider config={baseConfig} includeCookieBanner={false}>
                <ContextProbe onContext={onContext} />
            </CookieConsentProvider>
        )

        const ctx = onContext.mock.calls.at(-1)?.[0]
        expect(ctx).not.toBeNull()
        expect(ctx.config).toBe(baseConfig)
        expect(typeof ctx.openBanner).toBe('function')
    })

    it('opens the banner by default when no consent cookie is present', () => {
        const onContext = jest.fn()
        render(
            <CookieConsentProvider config={baseConfig} includeCookieBanner={false}>
                <ContextProbe onContext={onContext} />
            </CookieConsentProvider>
        )

        const ctx = onContext.mock.calls.at(-1)?.[0]
        expect(ctx.isBannerOpen).toBe(true)
    })

    it('keeps the banner closed when the consent dialog has already been displayed', () => {
        document.cookie = `${CONSENT_DIALOG_HAS_BEEN_DISPLAYED}=${CONSENT_DIALOG_HAS_BEEN_DISPLAYED_VALUE}; path=/`

        const onContext = jest.fn()
        render(
            <CookieConsentProvider config={baseConfig} includeCookieBanner={false}>
                <ContextProbe onContext={onContext} />
            </CookieConsentProvider>
        )

        const ctx = onContext.mock.calls.at(-1)?.[0]
        expect(ctx.isBannerOpen).toBe(false)
    })

    it('registers the configured consentHooks on mount', async () => {
        const execute = jest.fn()
        const configWithHooks: CookieConsentBannerConfig = {
            ...baseConfig,
            consentHooks: [
                {
                    id: 'custom-hook',
                    category: 'Analytics',
                    type: 'onLoad',
                    execute
                }
            ]
        }

        render(
            <CookieConsentProvider config={configWithHooks} includeCookieBanner={false}>
                <div>content</div>
            </CookieConsentProvider>
        )

        await waitFor(() => {
            expect(consentHookManager.getHooks().map(h => h.id)).toContain('custom-hook')
        })
    })

    it('does not create an audit service when no audit config is provided', () => {
        const onContext = jest.fn()
        render(
            <CookieConsentProvider config={baseConfig} includeCookieBanner={false}>
                <ContextProbe onContext={onContext} />
            </CookieConsentProvider>
        )

        const ctx = onContext.mock.calls.at(-1)?.[0]
        expect(ctx.auditService).toBeNull()
    })
})
