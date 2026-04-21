import {
    CONSENT_DIALOG_HAS_BEEN_DISPLAYED,
    CONSENT_DIALOG_HAS_BEEN_DISPLAYED_VALUE,
    COOKIE_SUFFIX,
    COOKIE_VALUE_FALSE,
    COOKIE_VALUE_TRUE
} from './constants'
import {
    cookieAccessor,
    getCookieSelection,
    getLabel,
    getLocalizedCookieText,
    getUnit,
    hexToRGBA,
    isServer,
    lightenHexColor,
    persistCookieSelection,
    setCookie,
    setCookieConsentDisplayed
} from './functions'
import { CookieProviderConfig } from './types'

function clearAllCookies() {
    for (const cookie of document.cookie.split(';')) {
        const name = cookie.split('=')[0]?.trim()
        if (name) {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`
        }
    }
}

const provider: CookieProviderConfig = {
    id: 'test',
    name: 'Test Provider',
    category: 'Analytics',
    description: 'A test provider',
    dataProtectionLink: 'https://example.com/privacy',
    cookies: []
}

describe('functions', () => {
    beforeEach(() => {
        clearAllCookies()
    })

    describe('isServer', () => {
        it('returns false in jsdom environment', () => {
            expect(isServer()).toBe(false)
        })
    })

    describe('cookieAccessor', () => {
        it('appends the cookie suffix to the id', () => {
            expect(cookieAccessor({ id: 'foo' })).toBe(`foo${COOKIE_SUFFIX}`)
        })
    })

    describe('hexToRGBA', () => {
        it('converts a hex color to rgba with default alpha', () => {
            expect(hexToRGBA('#ff8040')).toBe('rgba(255, 128, 64, 1)')
        })

        it('supports custom alpha', () => {
            expect(hexToRGBA('#000000', 0.5)).toBe('rgba(0, 0, 0, 0.5)')
        })
    })

    describe('lightenHexColor', () => {
        it('lightens the color by the given degree', () => {
            expect(lightenHexColor('#102030', 16)).toBe('rgb(32, 48, 64)')
        })

        it('clamps channel values at 255', () => {
            expect(lightenHexColor('#f0f0f0', 100)).toBe('rgb(255, 255, 255)')
        })
    })

    describe('setCookie', () => {
        it('writes a cookie to document.cookie', () => {
            setCookie('my_key', 'my_value', 'example.com', 1)
            expect(document.cookie).toContain('my_key=my_value')
        })

        it('is a no-op when running on the server', () => {
            const originalWindow = globalThis.window
            // @ts-expect-error simulate server environment
            delete (globalThis as any).window
            try {
                expect(() => setCookie('server_key', 'x', 'example.com', 1)).not.toThrow()
            } finally {
                ;(globalThis as any).window = originalWindow
            }
        })
    })

    describe('setCookieConsentDisplayed', () => {
        it('persists the consent dialog displayed cookie', () => {
            setCookieConsentDisplayed('example.com', 1)
            expect(document.cookie).toContain(
                `${CONSENT_DIALOG_HAS_BEEN_DISPLAYED}=${CONSENT_DIALOG_HAS_BEEN_DISPLAYED_VALUE}`
            )
        })
    })

    describe('persistCookieSelection', () => {
        it('writes the "given" value when consent is granted', () => {
            persistCookieSelection(provider, true, 'example.com', 1)
            expect(document.cookie).toContain(`${cookieAccessor(provider)}=${COOKIE_VALUE_TRUE}`)
        })

        it('writes the "not_given" value when consent is denied', () => {
            persistCookieSelection(provider, false, 'example.com', 1)
            expect(document.cookie).toContain(`${cookieAccessor(provider)}=${COOKIE_VALUE_FALSE}`)
        })
    })

    describe('getCookieSelection', () => {
        it('returns true when consent has been given for the provider', () => {
            persistCookieSelection(provider, true, 'example.com', 1)
            expect(getCookieSelection(provider)).toBe(true)
        })

        it('returns false when consent has been denied', () => {
            persistCookieSelection(provider, false, 'example.com', 1)
            expect(getCookieSelection(provider)).toBe(false)
        })

        it('returns false when no cookie is set for the provider', () => {
            expect(getCookieSelection(provider)).toBe(false)
        })
    })

    describe('getLabel', () => {
        it('returns the default English label when no custom labels provided', () => {
            expect(getLabel('buttons', 'acceptAllCookies', {})).toBe('Accept All')
        })

        it('returns the German label when lang is deDE', () => {
            expect(getLabel('buttons', 'acceptAllCookies', { lang: 'deDE' })).toBe('Alle Akzeptieren')
        })

        it('returns the custom label override when provided', () => {
            const labels: any = { buttons: { acceptAllCookies: 'Yes please' } }
            expect(getLabel('buttons', 'acceptAllCookies', { labels })).toBe('Yes please')
        })
    })

    describe('getLocalizedCookieText', () => {
        it('returns a plain string untouched', () => {
            expect(getLocalizedCookieText('hello')).toBe('hello')
        })

        it('returns the text for the requested language from a translation object', () => {
            expect(getLocalizedCookieText({ enUS: 'Hello', deDE: 'Hallo' }, 'deDE')).toBe('Hallo')
        })

        it('defaults to enUS when no language is specified', () => {
            expect(getLocalizedCookieText({ enUS: 'Hello', deDE: 'Hallo' })).toBe('Hello')
        })
    })

    describe('getUnit', () => {
        it('returns the singular form when the number equals one', () => {
            expect(getUnit(1, 'days', {})).toBe('Day')
        })

        it('returns the plural form when the number is greater than one', () => {
            expect(getUnit(7, 'days', {})).toBe('Days')
        })

        it('respects the configured language', () => {
            expect(getUnit(2, 'weeks', { lang: 'deDE' })).toBe('Wochen')
        })
    })
})
