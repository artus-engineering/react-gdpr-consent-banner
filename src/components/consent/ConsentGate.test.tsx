import { render } from '@testing-library/react'
import * as hooks from '../../hooks'
import { DefaultTheme } from '../../themes'
import { CookieConsentBannerConfigWithDefaults, CookieProviderConfig } from '../../types'
import { CookieConsentGate } from './ConsentGate'

describe('CookieConsentGate', () => {
    let useConfigMock: jest.SpyInstance
    let useStyleMock: jest.SpyInstance
    let useCookieStateMock: jest.SpyInstance
    let setIsEnabledMock: jest.Func

    const domain = 'example.com'
    const cookiesValidForDays = 30
    const provider: CookieProviderConfig = {
        name: 'Some Website',
        id: 'website',
        category: 'StrictlyNecessary',
        description: 'We use session cookies to store your session on our website. This cookie is necessary to use the website.',
        dataProtectionLink: 'https://example.com/privacy',
        cookies: [
            {
                name: 'tebuto_app_session',
                duration: 7,
                unit: 'days',
                purpose: 'Store the session'
            },
            {
                name: 'logged_in',
                duration: 7,
                unit: 'days',
                purpose: 'Store the login status'
            }
        ]
    }
    const children = <div>Test</div>

    beforeEach(() => {
        setIsEnabledMock = jest.fn()
        useConfigMock = jest.spyOn(hooks, 'useConfig').mockReturnValue({ domain, cookiesValidForDays } as CookieConsentBannerConfigWithDefaults)
        useStyleMock = jest.spyOn(hooks, 'useStyle').mockReturnValue(DefaultTheme)
        useCookieStateMock = jest.spyOn(hooks, 'useCookieState').mockReturnValue({ isEnabled: true, setIsEnabled: setIsEnabledMock })
    })

    it('should render children if consented to provider', () => {
        const { container } = render(<CookieConsentGate cookieProvider={provider}>{children}</CookieConsentGate>)
        expect(container).toMatchSnapshot()
    })

    it('should render gate content if not consented to cookies of provider', () => {
        useCookieStateMock.mockReturnValue({ isEnabled: false, setIsEnabled: setIsEnabledMock })
        const { container } = render(<CookieConsentGate cookieProvider={provider}>{children}</CookieConsentGate>)
        expect(container).toMatchSnapshot()
    })
})
