import { act, renderHook } from '@testing-library/react'
import React from 'react'
import { ConsentStateProviderContext } from './components/consent/context'
import { COOKIE_VALUE_FALSE, COOKIE_VALUE_TRUE, DEFAULT_COOKIE_VALIDITY, DEFAULT_LANGUAGE } from './constants'
import { cookieAccessor } from './functions'
import {
    useConfig,
    useCookieConsentContext,
    useCookieProviders,
    useCookieProvidersByCategory,
    useCookieState,
    useOpenCookieBanner,
    useSetStrictlyNecessaryCookiesOnly,
    useStyle
} from './hooks'
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
    const contextValue = {
        isBannerOpen: false,
        setIsBannerOpen,
        openBanner,
        auditService: null,
        config: {
            domain: 'example.com',
            cookiesValidForDays: 30,
            websiteName: 'Example',
            cookiePolicyLink: 'https://example.com/cookies',
            providers: [essentialProvider, analyticsProvider],
            ...configOverrides
        }
    }

    const wrapper = ({ children }: { children: React.ReactNode }) =>
        React.createElement(ConsentStateProviderContext.Provider, { value: contextValue as any }, children)

    return { wrapper, contextValue, setIsBannerOpen, openBanner }
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

    describe('useSetStrictlyNecessaryCookiesOnly', () => {
        it('accepts essentials and rejects all other categories', () => {
            const { wrapper } = createWrapper()
            const { result } = renderHook(() => useSetStrictlyNecessaryCookiesOnly(), { wrapper })

            act(() => {
                result.current()
            })

            expect(document.cookie).toContain(`${cookieAccessor(essentialProvider)}=${COOKIE_VALUE_TRUE}`)
            expect(document.cookie).toContain(`${cookieAccessor(analyticsProvider)}=${COOKIE_VALUE_FALSE}`)
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

        it('creates one auto-cookie per configured provider', () => {
            const { wrapper } = createWrapper()
            const { result } = renderHook(() => useCookieProviders(), { wrapper })
            expect(result.current[0].cookies).toHaveLength(2)
            expect(result.current[0].cookies.map(c => c.name)).toEqual([
                cookieAccessor(essentialProvider),
                cookieAccessor(analyticsProvider)
            ])
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
        it('reflects the stored cookie consent value', () => {
            document.cookie = `${cookieAccessor(analyticsProvider)}=${COOKIE_VALUE_TRUE}; path=/`
            const { wrapper } = createWrapper()
            const { result } = renderHook(() => useCookieState({ cookieProvider: analyticsProvider }), { wrapper })
            expect(result.current.isEnabled).toBe(true)
        })

        it('defaults to disabled when no cookie is set', () => {
            const { wrapper } = createWrapper()
            const { result } = renderHook(() => useCookieState({ cookieProvider: analyticsProvider }), { wrapper })
            expect(result.current.isEnabled).toBe(false)
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
