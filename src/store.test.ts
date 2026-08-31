import { readConsentCookie, resolvePurposesHashPrefix } from './consentState'
import { DEFAULT_CONSENT_COOKIE_NAME } from './constants'
import { ConsentStore } from './store'
import { CookieConsentBannerConfig, CookieProviderConfig } from './types'

function clearAllCookies() {
    for (const cookie of document.cookie.split(';')) {
        const name = cookie.split('=')[0]?.trim()
        if (name) {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`
        }
    }
}

const essentialProvider: CookieProviderConfig = {
    id: 'session',
    name: 'Session',
    category: 'Essential',
    description: 'Session cookies',
    dataProtectionLink: 'https://example.com/privacy',
    cookies: []
}

const analyticsProvider: CookieProviderConfig = {
    id: 'analytics',
    name: 'Analytics',
    category: 'Analytics',
    description: 'Analytics cookies',
    dataProtectionLink: 'https://example.com/privacy',
    cookies: []
}

const marketingProvider: CookieProviderConfig = {
    id: 'ads',
    name: 'Ads',
    category: 'Marketing',
    description: 'Marketing cookies',
    dataProtectionLink: 'https://example.com/privacy',
    cookies: []
}

const config: CookieConsentBannerConfig = {
    domain: 'example.com',
    websiteName: 'Example',
    cookiePolicyLink: 'https://example.com/cookies',
    providers: [essentialProvider, analyticsProvider, marketingProvider]
}

describe('ConsentStore', () => {
    beforeEach(() => {
        clearAllCookies()
    })

    it('starts with status none and all-denied decisions', () => {
        const store = new ConsentStore(config)
        expect(store.getSnapshot()).toEqual({
            status: 'none',
            decisions: { analytics: false, ads: false }
        })
    })

    it('acceptAll grants every non-essential provider and writes the cookie', () => {
        const store = new ConsentStore(config)
        store.acceptAll()

        expect(store.getSnapshot().status).toBe('valid')
        expect(store.getSnapshot().decisions).toEqual({ analytics: true, ads: true })
        expect(readConsentCookie(DEFAULT_CONSENT_COOKIE_NAME)?.d).toEqual({ analytics: 1, ads: 1 })
    })

    it('rejectAll writes an all-denied cookie (rejection is also stored)', () => {
        const store = new ConsentStore(config)
        store.rejectAll()

        expect(store.getSnapshot().status).toBe('valid')
        expect(store.getSnapshot().decisions).toEqual({ analytics: false, ads: false })
        expect(readConsentCookie(DEFAULT_CONSENT_COOKIE_NAME)?.d).toEqual({ analytics: 0, ads: 0 })
    })

    it('applySelection completes missing providers as denied', () => {
        const store = new ConsentStore(config)
        store.applySelection({ analytics: true })

        expect(store.getSnapshot().decisions).toEqual({ analytics: true, ads: false })
    })

    it('notifies subscribers with the previous snapshot on change', () => {
        const store = new ConsentStore(config)
        const listener = jest.fn()
        store.subscribe(listener)

        store.acceptAll()

        expect(listener).toHaveBeenCalledTimes(1)
        const [next, previous] = listener.mock.calls[0]
        expect(previous.status).toBe('none')
        expect(next.status).toBe('valid')
    })

    it('does not notify when nothing changed', () => {
        const store = new ConsentStore(config)
        store.rejectAll()
        const listener = jest.fn()
        store.subscribe(listener)

        store.rejectAll()

        expect(listener).not.toHaveBeenCalled()
    })

    it('grantForGate without a prior full decision stores a partial decision', () => {
        const store = new ConsentStore(config)
        store.grantForGate('analytics')

        expect(store.getSnapshot().status).toBe('partial')
        expect(store.getSnapshot().decisions).toEqual({ analytics: true, ads: false })
        expect(readConsentCookie(DEFAULT_CONSENT_COOKIE_NAME)?.p).toBe(1)
    })

    it('grantForGate after a full decision keeps the decision complete', () => {
        const store = new ConsentStore(config)
        store.rejectAll()
        store.grantForGate('analytics')

        expect(store.getSnapshot().status).toBe('valid')
        expect(store.getSnapshot().decisions).toEqual({ analytics: true, ads: false })
        expect(readConsentCookie(DEFAULT_CONSENT_COOKIE_NAME)?.p).toBeUndefined()
    })

    it('initialize migrates legacy cookies', () => {
        document.cookie = 'cookie_consent_displayed=true; path=/'
        document.cookie = 'analytics_consent=given; path=/'

        const store = new ConsentStore(config)
        store.initialize()

        expect(store.getSnapshot().status).toBe('valid')
        expect(store.getSnapshot().decisions).toEqual({ analytics: true, ads: false })
    })

    it('setConfig re-evaluates against a changed provider set (material change → stale)', () => {
        const store = new ConsentStore(config)
        store.acceptAll()
        expect(store.getSnapshot().status).toBe('valid')

        const extendedConfig: CookieConsentBannerConfig = {
            ...config,
            providers: [
                ...config.providers,
                {
                    id: 'pixel',
                    name: 'Pixel',
                    category: 'Marketing',
                    description: 'Pixel',
                    dataProtectionLink: 'https://example.com/privacy',
                    cookies: []
                }
            ]
        }
        store.setConfig(extendedConfig)

        expect(store.getSnapshot().status).toBe('stale')
        expect(store.getSnapshot().decisions).toEqual({ analytics: false, ads: false, pixel: false })
    })

    it('honors a platform purposesHash over the local fingerprint', () => {
        const hash = 'b'.repeat(64)
        const platformConfig = { ...config, purposesHash: hash }
        const store = new ConsentStore(platformConfig)
        store.acceptAll()

        expect(readConsentCookie(DEFAULT_CONSENT_COOKIE_NAME)?.ph).toBe(
            resolvePurposesHashPrefix({ purposesHash: hash, providers: config.providers })
        )
    })
})
