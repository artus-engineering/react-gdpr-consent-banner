import { act, renderHook } from '@testing-library/react'
import React from 'react'
import { ConsentStateProviderContext } from './components/consent/context'
import { readConsentCookie, resolvePurposesHashPrefix } from './consentState'
import { DEFAULT_CONSENT_COOKIE_NAME, DEFAULT_COOKIE_VALIDITY, DEFAULT_LANGUAGE } from './constants'
import {
    useConfig,
    useConsentSnapshot,
    useCookieConsentContext,
    useCookieProviders,
    useCookieProvidersByCategory,
    useCookieState,
    useOpenCookieBanner,
    useSetStrictlyNecessaryCookiesOnly,
    useStyle
} from './hooks'
import { ConsentStore } from './store'
import { DefaultTheme } from './themes'
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
    id: 'essential',
    name: 'Essentials',
    category: 'Essential',
    description: 'Essential cookies',
    dataProtectionLink: 'https://example.com/privacy',
    cookies: [{ name: 'session', duration: 1, unit: 'days', purpose: 'session' }]
}

const analyticsProvider: CookieProviderConfig = {
    id: 'analytics',
    name: 'Analytics',
    category: 'Analytics',
    description: 'Analytics cookies',
    dataProtectionLink: 'https://example.com/privacy',
    cookies: [{ name: '_ga', duration: 30, unit: 'days', purpose: 'tracking' }]
}

function createWrapper(configOverrides: Partial<CookieConsentBannerConfig> = {}) {
    const setIsBannerOpen = jest.fn()
    const openBanner = jest.fn()
    const config: CookieConsentBannerConfig = {
        domain: 'example.com',
        websiteName: 'Example',
        cookiePolicyLink: 'https://example.com/cookies',
        providers: [essentialProvider, analyticsProvider],
        ...configOverrides
    }
    const store = new ConsentStore(config)
    const contextValue = {
        isBannerOpen: false,
        setIsBannerOpen,
        openBanner,
        config,
        store
    }

    const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(ConsentStateProviderContext.Provider, { value: contextValue }, children)

    return { wrapper, contextValue, store, setIsBannerOpen, openBanner }
}

function writeValidConsentCookie(decisions: Record<string, 0 | 1>) {
    const ph = resolvePurposesHashPrefix({ providers: [essentialProvider, analyticsProvider] })
    const payload = encodeURIComponent(JSON.stringify({ v: 2, ph, d: decisions }))
    document.cookie = `${DEFAULT_CONSENT_COOKIE_NAME}=${payload}; path=/`
}

describe('hooks', () => {
    beforeEach(() => {
        clearAllCookies()
    })

    describe('useCookieConsentContext', () => {
        it('throws when used outside a provider', () => {
            expect(() => renderHook(() => useCookieConsentContext())).toThrow(
                'useCookieConsentContext must be used within a CookieConsentProvider'
            )
        })

        it('includes the parent hook name in the error message', () => {
            expect(() => renderHook(() => useCookieConsentContext('useSomethingCustom'))).toThrow(
                'useSomethingCustom must be used within a CookieConsentProvider'
            )
        })

        it('returns the context value when inside a provider', () => {
            const { wrapper, contextValue } = createWrapper()
            const { result } = renderHook(() => useCookieConsentContext(), { wrapper })
            expect(result.current).toBe(contextValue)
        })
    })

    describe('useOpenCookieBanner', () => {
        it('returns the openBanner function from context', () => {
            const { wrapper, openBanner } = createWrapper()
            const { result } = renderHook(() => useOpenCookieBanner(), { wrapper })
            result.current()
            expect(openBanner).toHaveBeenCalledTimes(1)
        })
    })

    describe('useConfig', () => {
        it('fills in default lang and cookiesValidForDays when missing', () => {
            const { wrapper } = createWrapper({ cookiesValidForDays: undefined, lang: undefined })
            const { result } = renderHook(() => useConfig(), { wrapper })
            expect(result.current.lang).toBe(DEFAULT_LANGUAGE)
            expect(result.current.cookiesValidForDays).toBe(DEFAULT_COOKIE_VALIDITY)
        })

        it('preserves configured values', () => {
            const { wrapper } = createWrapper({ cookiesValidForDays: 7, lang: 'deDE' })
            const { result } = renderHook(() => useConfig(), { wrapper })
            expect(result.current.lang).toBe('deDE')
            expect(result.current.cookiesValidForDays).toBe(7)
        })
    })

    describe('useStyle', () => {
        it('returns the DefaultTheme when no theme is configured', () => {
            const { wrapper } = createWrapper()
            const { result } = renderHook(() => useStyle(), { wrapper })
            expect(result.current).toEqual(DefaultTheme)
        })

        it('merges custom theme values with defaults', () => {
            const { wrapper } = createWrapper({
                theme: { primaryColor: '#ff0000', buttonText: '#000000' }
            })
            const { result } = renderHook(() => useStyle(), { wrapper })
            expect(result.current.primaryColor).toBe('#ff0000')
            expect(result.current.buttonText).toBe('#000000')
            expect(result.current.bgPrimary).toBe(DefaultTheme.bgPrimary)
        })
    })

    describe('useConsentSnapshot', () => {
        it('exposes the current consent status and decisions', () => {
            writeValidConsentCookie({ analytics: 1 })
            const { wrapper } = createWrapper()
            const { result } = renderHook(() => useConsentSnapshot(), { wrapper })
            expect(result.current.status).toBe('valid')
            expect(result.current.decisions).toEqual({ analytics: true })
        })

        it('updates when the store changes', () => {
            const { wrapper, store } = createWrapper()
            const { result } = renderHook(() => useConsentSnapshot(), { wrapper })
            expect(result.current.status).toBe('none')

            act(() => {
                store.acceptAll()
            })
            expect(result.current.status).toBe('valid')
            expect(result.current.decisions).toEqual({ analytics: true })
        })
    })

    describe('useSetStrictlyNecessaryCookiesOnly', () => {
        it('stores a full rejection of all non-essential providers', () => {
            const { wrapper } = createWrapper()
            const { result } = renderHook(() => useSetStrictlyNecessaryCookiesOnly(), { wrapper })

            act(() => {
                result.current()
            })

            const payload = readConsentCookie(DEFAULT_CONSENT_COOKIE_NAME)
            expect(payload?.d).toEqual({ analytics: 0 })
        })
    })

    describe('useCookieProviders', () => {
        it('prepends an auto-generated cookie_consent provider', () => {
            const { wrapper } = createWrapper()
            const { result } = renderHook(() => useCookieProviders(), { wrapper })
            expect(result.current[0].id).toBe('cookie_consent')
            expect(result.current[0].category).toBe('Essential')
            expect(result.current.slice(1)).toEqual([essentialProvider, analyticsProvider])
        })

        it('documents the single consent cookie', () => {
            const { wrapper } = createWrapper()
            const { result } = renderHook(() => useCookieProviders(), { wrapper })
            expect(result.current[0].cookies).toHaveLength(1)
            expect(result.current[0].cookies[0].name).toBe(DEFAULT_CONSENT_COOKIE_NAME)
            expect(result.current[0].cookies[0].unit).toBe('months')
        })
    })

    describe('useCookieProvidersByCategory', () => {
        it('groups providers by category', () => {
            const { wrapper } = createWrapper()
            const { result } = renderHook(() => useCookieProvidersByCategory(), { wrapper })
            expect(result.current.Essential?.map(p => p.id)).toEqual(['cookie_consent', 'essential'])
            expect(result.current.Analytics?.map(p => p.id)).toEqual(['analytics'])
        })
    })

    describe('useCookieState', () => {
        it('reflects the stored consent decision', () => {
            writeValidConsentCookie({ analytics: 1 })
            const { wrapper } = createWrapper()
            const { result } = renderHook(() => useCookieState({ cookieProvider: analyticsProvider }), { wrapper })
            expect(result.current.isEnabled).toBe(true)
        })

        it('defaults to disabled when no cookie is set', () => {
            const { wrapper } = createWrapper()
            const { result } = renderHook(() => useCookieState({ cookieProvider: analyticsProvider }), { wrapper })
            expect(result.current.isEnabled).toBe(false)
        })

        it('is always enabled for essential providers', () => {
            const { wrapper } = createWrapper()
            const { result } = renderHook(() => useCookieState({ cookieProvider: essentialProvider }), { wrapper })
            expect(result.current.isEnabled).toBe(true)
        })

        it('supports manually overriding the enabled state', () => {
            const { wrapper } = createWrapper()
            const { result } = renderHook(() => useCookieState({ cookieProvider: analyticsProvider }), { wrapper })

            act(() => {
                result.current.setIsEnabled(true)
            })
            expect(result.current.isEnabled).toBe(true)

            act(() => {
                result.current.setIsEnabled(false)
            })
            expect(result.current.isEnabled).toBe(false)
        })

        it('supports updater function form of setIsEnabled', () => {
            const { wrapper } = createWrapper()
            const { result } = renderHook(() => useCookieState({ cookieProvider: analyticsProvider }), { wrapper })

            act(() => {
                result.current.setIsEnabled(prev => !prev)
            })
            expect(result.current.isEnabled).toBe(true)
        })
    })
})
