import { render, screen, within } from '@testing-library/react'
import React from 'react'
import { CookieConsentBannerConfig, CookieProviderConfig } from '../../types'
import { CookieConsentProvider } from '../consent/ConsentProvider'
import { CookiePolicy } from './CookiePolicy'

const analyticsProvider: CookieProviderConfig = {
    id: 'ga',
    name: 'Google Analytics',
    category: 'Analytics',
    description: 'Analytics provider',
    dataProtectionLink: 'https://example.com/privacy',
    serviceProvider: 'Google',
    cookies: [
        { name: '_ga', duration: 30, unit: 'days', purpose: 'Tracks users', accessors: ['google.com'] },
        { name: '_gid', duration: 1, unit: 'days', purpose: 'Session tracking' }
    ]
}

const marketingProvider: CookieProviderConfig = {
    id: 'ads',
    name: 'Ads Service',
    category: 'Marketing',
    description: 'Marketing provider',
    dataProtectionLink: 'https://example.com/privacy',
    cookies: [{ name: 'ads_id', duration: 2, unit: 'weeks', purpose: 'Ad targeting' }]
}

const config: CookieConsentBannerConfig = {
    domain: 'example.com',
    websiteName: 'Example',
    cookiePolicyLink: 'https://example.com/cookies',
    providers: [analyticsProvider, marketingProvider]
}

function renderWithProvider(ui: React.ReactElement) {
    return render(
        <CookieConsentProvider config={config} includeCookieBanner={false}>
            {ui}
        </CookieConsentProvider>
    )
}

describe('CookiePolicy', () => {
    it('renders a section for each provider with its name and description', () => {
        renderWithProvider(<CookiePolicy />)

        expect(screen.getByRole('heading', { name: 'Analytics' })).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'Marketing' })).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'Google Analytics' })).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'Ads Service' })).toBeInTheDocument()
    })

    it('renders every configured cookie row', () => {
        renderWithProvider(<CookiePolicy />)

        expect(screen.getByText('_ga')).toBeInTheDocument()
        expect(screen.getByText('_gid')).toBeInTheDocument()
        expect(screen.getByText('ads_id')).toBeInTheDocument()
    })

    it('pluralizes the cookie duration unit when needed', () => {
        renderWithProvider(<CookiePolicy />)

        expect(screen.getByText('30 Days')).toBeInTheDocument()
        expect(screen.getByText('1 Day')).toBeInTheDocument()
        expect(screen.getByText('2 Weeks')).toBeInTheDocument()
    })

    it('uses the serviceProvider name for the privacy link when set, otherwise the provider name', () => {
        renderWithProvider(<CookiePolicy />)

        expect(screen.getByRole('link', { name: /Privacy Policy of Google/ })).toBeInTheDocument()
        expect(screen.getByRole('link', { name: /Privacy Policy of Ads Service/ })).toBeInTheDocument()
    })

    it('falls back to the provider name when no accessors are provided', () => {
        renderWithProvider(<CookiePolicy />)

        const gidRow = screen.getByText('_gid').closest('tr')!
        expect(within(gidRow).getByText('Google Analytics')).toBeInTheDocument()
    })

    it('includes the auto-generated cookie_consent provider under Essential', () => {
        renderWithProvider(<CookiePolicy />)
        expect(screen.getByRole('heading', { name: 'Essential' })).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'Cookie Consents' })).toBeInTheDocument()
    })
})
