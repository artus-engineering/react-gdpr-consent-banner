import {
    ConsentStateConfig,
    derivePurposesFingerprint,
    getConsentStatus,
    getCookieValue,
    migrateLegacyConsentCookies,
    readConsentCookie,
    refreshConsentCookie,
    removeCookiesMatching,
    resolveConsentCookieName,
    resolvePurposesHashPrefix,
    writeConsentCookie
} from './consentState'
import { CONSENT_COOKIE_VERSION, DEFAULT_CONSENT_COOKIE_NAME, PURPOSES_HASH_PREFIX_LENGTH } from './constants'
import { CookieProviderConfig } from './types'

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

const gaProvider: CookieProviderConfig = {
    id: 'ga',
    name: 'Analytics',
    category: 'Analytics',
    description: 'Analytics cookies',
    dataProtectionLink: 'https://example.com/privacy',
    cookies: []
}

const megaProvider: CookieProviderConfig = {
    id: 'mega',
    name: 'Mega',
    category: 'Marketing',
    description: 'Marketing cookies',
    dataProtectionLink: 'https://example.com/privacy',
    cookies: []
}

const providers = [essentialProvider, gaProvider, megaProvider]

function stateFor(overrides: Partial<ConsentStateConfig> = {}): ConsentStateConfig {
    return {
        cookieName: DEFAULT_CONSENT_COOKIE_NAME,
        purposesHashPrefix: resolvePurposesHashPrefix({ providers }),
        providers,
        domain: 'example.com',
        ...overrides
    }
}

describe('consentState', () => {
    beforeEach(() => {
        clearAllCookies()
    })

    describe('getCookieValue', () => {
        it('matches cookie names exactly and never by substring', () => {
            document.cookie = 'mega_consent=given; path=/'
            expect(getCookieValue('ga_consent')).toBeNull()
            expect(getCookieValue('mega_consent')).toBe('given')
        })
    })

    describe('resolveConsentCookieName', () => {
        it('defaults to artus_consent', () => {
            expect(resolveConsentCookieName({})).toBe(DEFAULT_CONSENT_COOKIE_NAME)
        })

        it('uses a configured cookie name', () => {
            expect(resolveConsentCookieName({ cookieName: 'my_consent' })).toBe('my_consent')
        })
    })

    describe('purposes hash resolution', () => {
        it('uses the configured platform hash prefix when valid', () => {
            const hash = 'a'.repeat(64)
            expect(resolvePurposesHashPrefix({ purposesHash: hash, providers })).toBe(
                'a'.repeat(PURPOSES_HASH_PREFIX_LENGTH)
            )
        })

        it('falls back to a deterministic local fingerprint', () => {
            const first = resolvePurposesHashPrefix({ providers })
            const second = resolvePurposesHashPrefix({ providers: [...providers].reverse() })
            expect(first).toHaveLength(PURPOSES_HASH_PREFIX_LENGTH)
            expect(second).toBe(first)
        })

        it('changes the fingerprint on material changes only', () => {
            const base = derivePurposesFingerprint(providers)
            const withoutMega = derivePurposesFingerprint([essentialProvider, gaProvider])
            const categoryChanged = derivePurposesFingerprint([
                essentialProvider,
                { ...gaProvider, category: 'Marketing' },
                megaProvider
            ])
            const cosmeticChange = derivePurposesFingerprint(
                providers.map(provider => ({ ...provider, description: 'changed', name: 'changed' }))
            )
            expect(withoutMega).not.toBe(base)
            expect(categoryChanged).not.toBe(base)
            expect(cosmeticChange).toBe(base)
        })
    })

    describe('cookie v2 write/read roundtrip', () => {
        it('stores decisions without a UID and reads them back', () => {
            const state = stateFor()
            writeConsentCookie({
                cookieName: state.cookieName,
                purposesHashPrefix: state.purposesHashPrefix,
                decisions: { ga: true, mega: false }
            })
            const payload = readConsentCookie(state.cookieName)
            expect(payload).toEqual({
                v: CONSENT_COOKIE_VERSION,
                ph: state.purposesHashPrefix,
                d: { ga: 1, mega: 0 }
            })
        })

        it('also writes a cookie on full rejection', () => {
            const state = stateFor()
            writeConsentCookie({
                cookieName: state.cookieName,
                purposesHashPrefix: state.purposesHashPrefix,
                decisions: { ga: false, mega: false }
            })
            expect(readConsentCookie(state.cookieName)).not.toBeNull()
            expect(getConsentStatus(state).kind).toBe('valid')
        })

        it('rejects malformed payloads', () => {
            document.cookie = `${DEFAULT_CONSENT_COOKIE_NAME}=${encodeURIComponent('{"v":1,"d":{}}')}; path=/`
            expect(readConsentCookie(DEFAULT_CONSENT_COOKIE_NAME)).toBeNull()
            document.cookie = `${DEFAULT_CONSENT_COOKIE_NAME}=not-json; path=/`
            expect(readConsentCookie(DEFAULT_CONSENT_COOKIE_NAME)).toBeNull()
        })
    })

    describe('getConsentStatus', () => {
        it('returns none without a cookie, with all decisions denied', () => {
            const status = getConsentStatus(stateFor())
            expect(status.kind).toBe('none')
            expect(status.decisions).toEqual({ ga: false, mega: false })
        })

        it('returns valid decisions for a matching purposes hash', () => {
            const state = stateFor()
            writeConsentCookie({
                cookieName: state.cookieName,
                purposesHashPrefix: state.purposesHashPrefix,
                decisions: { ga: true, mega: false }
            })
            const status = getConsentStatus(state)
            expect(status.kind).toBe('valid')
            expect(status.decisions).toEqual({ ga: true, mega: false })
        })

        it('treats a purposes-hash mismatch as stale and does NOT apply previous grants', () => {
            const state = stateFor()
            writeConsentCookie({
                cookieName: state.cookieName,
                purposesHashPrefix: '0000000000000000',
                decisions: { ga: true, mega: true }
            })
            const status = getConsentStatus(state)
            expect(status.kind).toBe('stale')
            expect(status.decisions).toEqual({ ga: false, mega: false })
        })

        it('flags partial decisions so the banner keeps asking', () => {
            const state = stateFor()
            writeConsentCookie({
                cookieName: state.cookieName,
                purposesHashPrefix: state.purposesHashPrefix,
                decisions: { ga: true, mega: false },
                partial: true
            })
            const status = getConsentStatus(state)
            expect(status.kind).toBe('partial')
            expect(status.decisions).toEqual({ ga: true, mega: false })
        })

        it('defaults providers missing from the cookie to denied', () => {
            const state = stateFor()
            writeConsentCookie({
                cookieName: state.cookieName,
                purposesHashPrefix: state.purposesHashPrefix,
                decisions: { ga: true }
            })
            const status = getConsentStatus(state)
            expect(status.decisions).toEqual({ ga: true, mega: false })
        })
    })

    describe('legacy migration', () => {
        it('migrates v1 cookies into a v2 cookie and removes the legacy ones', () => {
            document.cookie = 'cookie_consent_displayed=true; path=/'
            document.cookie = 'ga_consent=given; path=/'
            document.cookie = 'mega_consent=not_given; path=/'

            const state = stateFor()
            expect(migrateLegacyConsentCookies(state)).toBe(true)

            const payload = readConsentCookie(state.cookieName)
            expect(payload?.d).toEqual({ ga: 1, mega: 0 })
            expect(getCookieValue('ga_consent')).toBeNull()
            expect(getCookieValue('mega_consent')).toBeNull()
            expect(getCookieValue('cookie_consent_displayed')).toBeNull()
        })

        it('does not migrate when the banner was never answered', () => {
            document.cookie = 'ga_consent=given; path=/'
            expect(migrateLegacyConsentCookies(stateFor())).toBe(false)
            expect(readConsentCookie(DEFAULT_CONSENT_COOKIE_NAME)).toBeNull()
        })

        it('does not overwrite an existing v2 cookie', () => {
            const state = stateFor()
            writeConsentCookie({
                cookieName: state.cookieName,
                purposesHashPrefix: state.purposesHashPrefix,
                decisions: { ga: false, mega: false }
            })
            document.cookie = 'cookie_consent_displayed=true; path=/'
            document.cookie = 'ga_consent=given; path=/'
            expect(migrateLegacyConsentCookies(state)).toBe(false)
            expect(readConsentCookie(state.cookieName)?.d.ga).toBe(0)
        })
    })

    describe('refreshConsentCookie', () => {
        it('re-writes a valid cookie unchanged', () => {
            const state = stateFor()
            writeConsentCookie({
                cookieName: state.cookieName,
                purposesHashPrefix: state.purposesHashPrefix,
                decisions: { ga: true, mega: false }
            })
            refreshConsentCookie(state)
            expect(readConsentCookie(state.cookieName)?.d).toEqual({ ga: 1, mega: 0 })
        })

        it('leaves a stale cookie untouched', () => {
            const state = stateFor()
            writeConsentCookie({
                cookieName: state.cookieName,
                purposesHashPrefix: '0000000000000000',
                decisions: { ga: true }
            })
            refreshConsentCookie(state)
            expect(readConsentCookie(state.cookieName)?.ph).toBe('0000000000000000')
        })
    })

    describe('removeCookiesMatching', () => {
        it('removes cookies matching a wildcard pattern', () => {
            document.cookie = '_ga=1; path=/'
            document.cookie = '_ga_ABC123=1; path=/'
            document.cookie = '_gat_tracker=1; path=/'
            document.cookie = 'unrelated=1; path=/'

            removeCookiesMatching('_ga_*')

            expect(getCookieValue('_ga_ABC123')).toBeNull()
            expect(getCookieValue('_ga')).toBe('1')
            expect(getCookieValue('unrelated')).toBe('1')
        })

        it('removes exact-name cookies', () => {
            document.cookie = '_fbp=1; path=/'
            removeCookiesMatching('_fbp')
            expect(getCookieValue('_fbp')).toBeNull()
        })
    })
})

describe('consentState — review fixes', () => {
    beforeEach(() => {
        clearAllCookies()
    })

    it('includes integrations in the fingerprint (adding one is a material change)', () => {
        const withoutIntegration = resolvePurposesHashPrefix({ providers })
        const withIntegration = resolvePurposesHashPrefix({
            providers,
            integrations: [{ providerId: 'ga', type: 'ga4' }]
        })
        expect(withIntegration).not.toBe(withoutIntegration)
    })

    it('does not collide on provider ids containing separator characters', () => {
        const a = derivePurposesFingerprint([
            { ...gaProvider, id: 'a' },
            { ...megaProvider, id: 'b:Marketing|c' }
        ] as any)
        const b = derivePurposesFingerprint([
            { ...gaProvider, id: 'a:Analytics|b' },
            { ...megaProvider, id: 'c' }
        ] as any)
        expect(a).not.toBe(b)
    })
})
