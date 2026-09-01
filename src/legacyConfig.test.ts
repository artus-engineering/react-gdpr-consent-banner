import { legacyFieldsOf } from './legacyConfig'
import { CookieConsentBannerConfig } from './types'

const config: CookieConsentBannerConfig = {
    cookiePolicyLink: '/privacy',
    websiteName: 'Test',
    providers: [],
    domain: 'example.com',
    consentHooks: [],
    crossSubDomainConsent: ['app.example.com'],
    cookiesValidForDays: 7
}

describe('legacyFieldsOf', () => {
    it('reads 2.x compatibility fields from the public config', () => {
        const legacy = legacyFieldsOf(config)
        expect(legacy.consentHooks).toEqual([])
        expect(legacy.crossSubDomainConsent).toEqual(['app.example.com'])
        expect(legacy.cookiesValidForDays).toBe(7)
    })
})
