import { legacyFieldsOf } from './legacyConfig'
import { CookieConsentBannerConfig } from './types'

const config: CookieConsentBannerConfig = {
    cookiePolicyLink: '/privacy',
    websiteName: 'Test',
    providers: [],
    domain: 'example.com'
}

describe('legacyFieldsOf', () => {
    it('exposes the same object for 2.x compatibility field reads', () => {
        expect(legacyFieldsOf(config)).toBe(config)
    })
})
