import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import * as functions from '../../functions'
import * as hooks from '../../hooks'
import { DefaultTheme } from '../../themes'
import { CookieConsentBannerConfigWithDefaults, CookieProviderConfig } from '../../types'
import { CookieConsentModal } from './ConsentModal'

beforeAll(() => {
    if (!HTMLDialogElement.prototype.showModal) {
        HTMLDialogElement.prototype.showModal = function showModal() {
            this.setAttribute('open', '')
        } as any
    }
    if (!HTMLDialogElement.prototype.close) {
        HTMLDialogElement.prototype.close = function close() {
            this.removeAttribute('open')
            this.dispatchEvent(new Event('close'))
        } as any
    }
})

const provider: CookieProviderConfig = {
    id: 'gated',
    name: 'Gated Content',
    category: 'Functional',
    description: 'Gated content provider',
    dataProtectionLink: 'https://example.com/privacy',
    cookies: [{ name: 'gated', duration: 1, unit: 'days', purpose: 'Gate content' }]
}

const mockConfig = {
    domain: 'example.com',
    cookiesValidForDays: 30,
    lang: 'enUS' as const,
    providers: [provider],
    cookiePolicyLink: '',
    websiteName: 'Example',
    labels: {
        headings: { consentGate: 'Consent Required' },
        consentGate: { message: 'This content requires consent for' },
        buttons: { acceptSelectedCookies: 'Accept' },
        links: { privacyPolicy: 'Privacy Policy' },
        common: { of: 'of' },
        details: { expandCookieDetails: 'Show details' }
    }
} as unknown as CookieConsentBannerConfigWithDefaults

describe('CookieConsentModal', () => {
    let setIsEnabled: jest.Mock

    beforeEach(() => {
        setIsEnabled = jest.fn()
        jest.spyOn(hooks, 'useConfig').mockReturnValue(mockConfig)
        jest.spyOn(hooks, 'useStyle').mockReturnValue(DefaultTheme)
        jest.spyOn(hooks, 'useCookieState').mockReturnValue({ isEnabled: false, setIsEnabled })
        jest.spyOn(functions, 'persistCookieSelection').mockImplementation(() => undefined)
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    it('renders the children inside a clickable wrapper when consent is missing', () => {
        render(
            <CookieConsentModal cookieProvider={provider}>
                <span data-testid="embed">embed</span>
            </CookieConsentModal>
        )

        const wrapper = screen.getByRole('button', { name: /embed/ })
        expect(wrapper).toBeInTheDocument()
        expect(screen.getByTestId('embed')).toBeInTheDocument()
    })

    it('opens the modal when the wrapper is clicked while disabled', () => {
        render(
            <CookieConsentModal cookieProvider={provider}>
                <span>embed</span>
            </CookieConsentModal>
        )

        const wrapper = screen.getByRole('button', { name: /embed/ })
        fireEvent.click(wrapper)

        expect(screen.getByRole('heading', { name: 'Consent Required' })).toBeInTheDocument()
    })

    it('opens the modal on Enter/Space key press', () => {
        render(
            <CookieConsentModal cookieProvider={provider}>
                <span>embed</span>
            </CookieConsentModal>
        )

        const wrapper = screen.getByRole('button', { name: /embed/ })
        fireEvent.keyDown(wrapper, { key: 'Enter' })
        expect(screen.getByRole('heading', { name: 'Consent Required' })).toBeInTheDocument()
    })

    it('renders children directly without a wrapper button when consent is already given', () => {
        jest.spyOn(hooks, 'useCookieState').mockReturnValue({ isEnabled: true, setIsEnabled })

        render(
            <CookieConsentModal cookieProvider={provider}>
                <span data-testid="embed">embed</span>
            </CookieConsentModal>
        )

        expect(screen.queryByRole('button', { name: /embed/ })).not.toBeInTheDocument()
        expect(screen.getByTestId('embed')).toBeInTheDocument()
    })

    it('renders a close button inside the opened modal', () => {
        render(
            <CookieConsentModal cookieProvider={provider}>
                <span>embed</span>
            </CookieConsentModal>
        )

        fireEvent.click(screen.getByRole('button', { name: /embed/ }))
        expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
    })
})
