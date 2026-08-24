import { render, screen, waitFor } from '@testing-library/react'
import React, { useContext } from 'react'
import { readConsentCookie, resolvePurposesHashPrefix } from '../../consentState'
import { DEFAULT_CONSENT_COOKIE_NAME } from '../../constants'
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

function writeValidConsentCookie(config: CookieConsentBannerConfig, decisions: Record<string, 0 | 1>) {
    const ph = resolvePurposesHashPrefix(config)
    const payload = encodeURIComponent(JSON.stringify({ v: 2, ph, d: decisions }))
    document.cookie = `${DEFAULT_CONSENT_COOKIE_NAME}=${payload}; path=/`
}

describe('CookieConsentProvider', () => {
    beforeEach(() => {
        clearAllCookies()
    })

    it('renders its children', () => {
        render(
            <CookieConsentProvider config={baseConfig} includeCookieBanner={false}>
                <div data-testid="child">Hello</div>
            </CookieConsentProvider>
        )

        expect(screen.getByTestId('child')).toHaveTextContent('Hello')
    })

    it('provides a context value with the passed config and a consent store', () => {
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
        expect(ctx.store).toBeDefined()
        expect(ctx.store.getSnapshot().status).toBe('none')
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

    it('does not write any cookie while no decision has been made', () => {
        render(
            <CookieConsentProvider config={baseConfig} includeCookieBanner={false}>
                <div>content</div>
            </CookieConsentProvider>
        )

        expect(readConsentCookie(DEFAULT_CONSENT_COOKIE_NAME)).toBeNull()
    })

    it('keeps the banner closed when a valid consent cookie exists', () => {
        writeValidConsentCookie(baseConfig, { analytics: 0 })

        const onContext = jest.fn()
        render(
            <CookieConsentProvider config={baseConfig} includeCookieBanner={false}>
                <ContextProbe onContext={onContext} />
            </CookieConsentProvider>
        )

        const ctx = onContext.mock.calls.at(-1)?.[0]
        expect(ctx.isBannerOpen).toBe(false)
    })

    it('re-opens the banner when the stored consent is stale (material change)', async () => {
        const payload = encodeURIComponent(JSON.stringify({ v: 2, ph: '0000000000000000', d: { analytics: 1 } }))
        document.cookie = `${DEFAULT_CONSENT_COOKIE_NAME}=${payload}; path=/`

        const onContext = jest.fn()
        render(
            <CookieConsentProvider config={baseConfig} includeCookieBanner={false}>
                <ContextProbe onContext={onContext} />
            </CookieConsentProvider>
        )

        await waitFor(() => {
            const ctx = onContext.mock.calls.at(-1)?.[0]
            expect(ctx.isBannerOpen).toBe(true)
            expect(ctx.store.getSnapshot().status).toBe('stale')
        })
        // Fail-closed: previous grants are not applied on a stale consent.
        const ctx = onContext.mock.calls.at(-1)?.[0]
        expect(ctx.store.getSnapshot().decisions.analytics).toBe(false)
    })

    it('migrates legacy v1 cookies into the v2 cookie and keeps the banner closed', async () => {
        document.cookie = 'cookie_consent_displayed=true; path=/'
        document.cookie = 'analytics_consent=given; path=/'

        const onContext = jest.fn()
        render(
            <CookieConsentProvider config={baseConfig} includeCookieBanner={false}>
                <ContextProbe onContext={onContext} />
            </CookieConsentProvider>
        )

        await waitFor(() => {
            const payload = readConsentCookie(DEFAULT_CONSENT_COOKIE_NAME)
            expect(payload).not.toBeNull()
            expect(payload?.d.analytics).toBe(1)
        })
        expect(document.cookie).not.toContain('analytics_consent=')
        expect(document.cookie).not.toContain('cookie_consent_displayed=')
        await waitFor(() => {
            const ctx = onContext.mock.calls.at(-1)?.[0]
            expect(ctx.isBannerOpen).toBe(false)
        })
    })

    it('executes registered onLoad consent hooks for consented categories', async () => {
        writeValidConsentCookie(baseConfig, { analytics: 1 })
        const execute = jest.fn()
        const configWithHooks: CookieConsentBannerConfig = {
            ...baseConfig,
            consentHooks: [
                {
                    id: 'analytics-load',
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
            expect(execute).toHaveBeenCalledTimes(1)
        })
    })

    it('does not execute onLoad consent hooks for categories without consent', async () => {
        writeValidConsentCookie(baseConfig, { analytics: 0 })
        const execute = jest.fn()
        const configWithHooks: CookieConsentBannerConfig = {
            ...baseConfig,
            consentHooks: [
                {
                    id: 'analytics-load',
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

        await new Promise(resolve => setTimeout(resolve, 20))
        expect(execute).not.toHaveBeenCalled()
    })

    it('runs onAccept hooks when a category is granted through the store', async () => {
        const execute = jest.fn()
        const configWithHooks: CookieConsentBannerConfig = {
            ...baseConfig,
            consentHooks: [
                {
                    id: 'analytics-accept',
                    category: 'Analytics',
                    type: 'onAccept',
                    execute
                }
            ]
        }

        const onContext = jest.fn()
        render(
            <CookieConsentProvider config={configWithHooks} includeCookieBanner={false}>
                <ContextProbe onContext={onContext} />
            </CookieConsentProvider>
        )

        const ctx = onContext.mock.calls.at(-1)?.[0]
        ctx.store.acceptAll()

        await waitFor(() => {
            expect(execute).toHaveBeenCalledTimes(1)
        })
        const payload = readConsentCookie(DEFAULT_CONSENT_COOKIE_NAME)
        expect(payload?.d.analytics).toBe(1)
    })
})
