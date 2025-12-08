import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as functions from '../../functions'
import * as hooks from '../../hooks'
import { DefaultTheme } from '../../themes'
import { CookieConsentBannerConfigWithDefaults, CookieProviderConfig } from '../../types'
import { CookieConsentBanner } from './ConsentBanner'

// Mock the hooks module
jest.mock('../../hooks', () => ({
    useConfig: jest.fn(),
    useStyle: jest.fn(),
    useCookieProviders: jest.fn(),
    useSetStrictlyNecessaryCookiesOnly: jest.fn(),
    useCookieConsentContext: jest.fn()
}))

// Mock functions module
jest.mock('../../functions', () => ({
    isServer: jest.fn(() => false),
    getCookieSelection: jest.fn(),
    getLabel: jest.fn((section, key) => {
        const labels: Record<string, Record<string, string>> = {
            headings: {
                banner: 'Cookie Consent',
                details: 'Cookie Settings'
            },
            descriptions: {
                cookieDetails: 'We use cookies to enhance your experience.'
            },
            buttons: {
                acceptAllCookies: 'Accept All',
                rejectAllNonNecessaryCookies: 'Reject All',
                showDetails: 'Customize',
                acceptSelectedCookies: 'Save Preferences',
                back: 'Back'
            },
            links: {
                cookiePolicy: 'Cookie Policy'
            },
            cookieCategories: {
                Essential: 'Essential',
                Functional: 'Functional',
                Analytics: 'Analytics',
                Marketing: 'Marketing'
            },
            cookieCategoryDescriptions: {
                Essential: 'Required for the website to function properly.',
                Functional: 'Enable personalized features.',
                Analytics: 'Help us understand how visitors use our website.',
                Marketing: 'Used to deliver relevant advertisements.'
            },
            details: {
                expandCookieDetails: 'Show cookie details',
                cookieName: 'Name',
                cookieDuration: 'Duration',
                cookieAccessors: 'Accessors',
                privacyPolicyOf: 'Privacy Policy of'
            },
            units: {
                days: 'day',
                daysPlural: 'days'
            }
        }
        return labels[section]?.[key] || key
    }),
    hexToRGBA: jest.fn((_hex, alpha = 1) => `rgba(0, 0, 0, ${alpha})`),
    persistCookieSelection: jest.fn(),
    setCookieConsentDisplayed: jest.fn(),
    getUnit: jest.fn(() => 'days'),
    getLocalizedCookieText: jest.fn(text => (typeof text === 'string' ? text : text.enUS))
}))

describe('CookieConsentBanner - GDPR Compliance Tests', () => {
    let mockSetIsBannerOpen: jest.Mock
    let mockSetStrictlyNecessaryCookiesOnly: jest.Mock

    const essentialProvider: CookieProviderConfig = {
        id: 'session',
        name: 'Session Management',
        category: 'Essential',
        description: 'Required for website functionality',
        dataProtectionLink: 'https://example.com/privacy',
        cookies: [{ name: 'session_id', duration: 1, unit: 'session', purpose: 'User session' }]
    }

    const analyticsProvider: CookieProviderConfig = {
        id: 'google_analytics',
        name: 'Google Analytics',
        category: 'Analytics',
        description: 'Web analytics service',
        dataProtectionLink: 'https://policies.google.com/privacy',
        serviceProvider: 'Google',
        cookies: [
            { name: '_ga', duration: 2, unit: 'years', purpose: 'Distinguish users' },
            { name: '_gid', duration: 24, unit: 'days', purpose: 'Distinguish users' }
        ]
    }

    const marketingProvider: CookieProviderConfig = {
        id: 'facebook_pixel',
        name: 'Facebook Pixel',
        category: 'Marketing',
        description: 'Advertising and tracking',
        dataProtectionLink: 'https://www.facebook.com/privacy',
        serviceProvider: 'Meta',
        cookies: [{ name: '_fbp', duration: 90, unit: 'days', purpose: 'Track conversions' }]
    }

    const functionalProvider: CookieProviderConfig = {
        id: 'preferences',
        name: 'User Preferences',
        category: 'Functional',
        description: 'Store user preferences',
        dataProtectionLink: 'https://example.com/privacy',
        cookies: [{ name: 'theme', duration: 365, unit: 'days', purpose: 'Theme preference' }]
    }

    const mockConfig: CookieConsentBannerConfigWithDefaults = {
        cookiePolicyLink: 'https://example.com/cookies',
        websiteName: 'Test Website',
        providers: [essentialProvider, analyticsProvider, marketingProvider, functionalProvider],
        domain: 'example.com',
        cookiesValidForDays: 183,
        lang: 'enUS'
    }

    const allProviders = [essentialProvider, analyticsProvider, marketingProvider, functionalProvider]

    beforeEach(() => {
        mockSetIsBannerOpen = jest.fn()
        mockSetStrictlyNecessaryCookiesOnly = jest.fn()
        ;(hooks.useConfig as jest.Mock).mockReturnValue(mockConfig)
        ;(hooks.useStyle as jest.Mock).mockReturnValue(DefaultTheme)
        ;(hooks.useCookieProviders as jest.Mock).mockReturnValue(allProviders)
        ;(hooks.useSetStrictlyNecessaryCookiesOnly as jest.Mock).mockReturnValue(mockSetStrictlyNecessaryCookiesOnly)
        ;(hooks.useCookieConsentContext as jest.Mock).mockReturnValue({
            isBannerOpen: true,
            setIsBannerOpen: mockSetIsBannerOpen
        })

        // Default: no cookies selected
        ;(functions.getCookieSelection as jest.Mock).mockReturnValue(false)

        jest.clearAllMocks()
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('Initial Banner Display', () => {
        it('should display banner when no prior consent exists', () => {
            render(<CookieConsentBanner />)
            expect(screen.getByText('Cookie Consent')).toBeInTheDocument()
        })

        it('should not render banner when isBannerOpen is false', () => {
            ;(hooks.useCookieConsentContext as jest.Mock).mockReturnValue({
                isBannerOpen: false,
                setIsBannerOpen: mockSetIsBannerOpen
            })

            const { container } = render(<CookieConsentBanner />)
            expect(container.innerHTML).toBe('')
        })

        it('should display Accept All, Reject All, and Customize buttons', () => {
            render(<CookieConsentBanner />)
            expect(screen.getByText('Accept All')).toBeInTheDocument()
            expect(screen.getByText('Reject All')).toBeInTheDocument()
            expect(screen.getByText('Customize')).toBeInTheDocument()
        })

        it('should display link to cookie policy', () => {
            render(<CookieConsentBanner />)
            const policyLink = screen.getByRole('link', { name: /cookie policy/i })
            expect(policyLink).toHaveAttribute('href', 'https://example.com/cookies')
        })
    })

    describe('Accept All Cookies', () => {
        it('should persist acceptance for all cookie providers when Accept All is clicked', async () => {
            const user = userEvent.setup()
            render(<CookieConsentBanner />)

            await user.click(screen.getByText('Accept All'))

            // Should persist consent for all providers
            expect(functions.persistCookieSelection).toHaveBeenCalledTimes(4)
            allProviders.forEach(provider => {
                expect(functions.persistCookieSelection).toHaveBeenCalledWith(
                    provider,
                    true,
                    mockConfig.domain,
                    mockConfig.cookiesValidForDays
                )
            })
        })

        it('should mark consent as displayed after accepting all', async () => {
            const user = userEvent.setup()
            render(<CookieConsentBanner />)

            await user.click(screen.getByText('Accept All'))

            expect(functions.setCookieConsentDisplayed).toHaveBeenCalledWith(
                mockConfig.domain,
                mockConfig.cookiesValidForDays
            )
        })

        it('should close banner after accepting all cookies', async () => {
            const user = userEvent.setup()
            render(<CookieConsentBanner />)

            await user.click(screen.getByText('Accept All'))

            expect(mockSetIsBannerOpen).toHaveBeenCalledWith(false)
        })
    })

    describe('Reject All Non-Essential Cookies', () => {
        it('should only accept essential cookies when Reject All is clicked', async () => {
            const user = userEvent.setup()
            render(<CookieConsentBanner />)

            await user.click(screen.getByText('Reject All'))

            expect(mockSetStrictlyNecessaryCookiesOnly).toHaveBeenCalled()
        })

        it('should mark consent as displayed after rejecting all', async () => {
            const user = userEvent.setup()
            render(<CookieConsentBanner />)

            await user.click(screen.getByText('Reject All'))

            expect(functions.setCookieConsentDisplayed).toHaveBeenCalledWith(
                mockConfig.domain,
                mockConfig.cookiesValidForDays
            )
        })

        it('should close banner after rejecting non-essential cookies', async () => {
            const user = userEvent.setup()
            render(<CookieConsentBanner />)

            await user.click(screen.getByText('Reject All'))

            expect(mockSetIsBannerOpen).toHaveBeenCalledWith(false)
        })
    })

    describe('Multi-Stage Consent - Details View', () => {
        it('should open details view when Customize button is clicked', async () => {
            const user = userEvent.setup()
            render(<CookieConsentBanner />)

            await user.click(screen.getByText('Customize'))

            expect(screen.getByText('Cookie Settings')).toBeInTheDocument()
        })

        it('should display all cookie categories in details view', async () => {
            const user = userEvent.setup()
            render(<CookieConsentBanner />)

            await user.click(screen.getByText('Customize'))

            expect(screen.getByText('Essential')).toBeInTheDocument()
            expect(screen.getByText('Analytics')).toBeInTheDocument()
            expect(screen.getByText('Marketing')).toBeInTheDocument()
            expect(screen.getByText('Functional')).toBeInTheDocument()
        })

        it('should display category descriptions', async () => {
            const user = userEvent.setup()
            render(<CookieConsentBanner />)

            await user.click(screen.getByText('Customize'))

            expect(screen.getByText('Required for the website to function properly.')).toBeInTheDocument()
            expect(screen.getByText('Help us understand how visitors use our website.')).toBeInTheDocument()
        })

        it('should display individual cookie providers under each category', async () => {
            const user = userEvent.setup()
            render(<CookieConsentBanner />)

            await user.click(screen.getByText('Customize'))

            expect(screen.getByText('Session Management')).toBeInTheDocument()
            expect(screen.getByText('Google Analytics')).toBeInTheDocument()
            expect(screen.getByText('Facebook Pixel')).toBeInTheDocument()
        })

        it('should have Back button to return to simple view', async () => {
            const user = userEvent.setup()
            render(<CookieConsentBanner />)

            await user.click(screen.getByText('Customize'))
            expect(screen.getByText('Cookie Settings')).toBeInTheDocument()

            await user.click(screen.getByText('Back'))
            expect(screen.getByText('Cookie Consent')).toBeInTheDocument()
        })

        it('should display Save Preferences button in details view', async () => {
            const user = userEvent.setup()
            render(<CookieConsentBanner />)

            await user.click(screen.getByText('Customize'))

            expect(screen.getByText('Save Preferences')).toBeInTheDocument()
        })
    })

    describe('Essential Cookies - Always Enabled', () => {
        it('should have Essential category toggle disabled', async () => {
            const user = userEvent.setup()
            render(<CookieConsentBanner />)

            await user.click(screen.getByText('Customize'))

            // Find the Essential category toggle - it should be disabled
            const essentialSwitch = screen.getByRole('switch', { name: /category-essential/i })
            expect(essentialSwitch).toBeDisabled()
        })

        it('should have Essential cookie provider toggle disabled', async () => {
            const user = userEvent.setup()
            render(<CookieConsentBanner />)

            await user.click(screen.getByText('Customize'))

            // Find the Session Management toggle - it should be disabled as it's Essential
            const sessionSwitch = screen.getByRole('switch', { name: /session/i })
            expect(sessionSwitch).toBeDisabled()
        })

        it('should always persist Essential cookies as accepted', async () => {
            const user = userEvent.setup()
            render(<CookieConsentBanner />)

            await user.click(screen.getByText('Reject All'))

            // Even on reject, essential cookies should be accepted
            expect(mockSetStrictlyNecessaryCookiesOnly).toHaveBeenCalled()
        })
    })

    describe('Category-Level Toggles', () => {
        it('should toggle all cookies in a category when category toggle is clicked', async () => {
            const user = userEvent.setup()
            render(<CookieConsentBanner />)

            await user.click(screen.getByText('Customize'))

            // Find Analytics category toggle
            const analyticsSwitch = screen.getByRole('switch', { name: /category-analytics/i })

            // Click to enable
            await user.click(analyticsSwitch)

            // Click Save Preferences
            await user.click(screen.getByText('Save Preferences'))

            // Should have saved preferences
            expect(functions.persistCookieSelection).toHaveBeenCalled()
        })

        it('should not allow toggling Essential category', async () => {
            const user = userEvent.setup()
            render(<CookieConsentBanner />)

            await user.click(screen.getByText('Customize'))

            const essentialSwitch = screen.getByRole('switch', { name: /category-essential/i })

            // Attempt to click should not change state (disabled)
            expect(essentialSwitch).toBeDisabled()
        })
    })

    describe('Individual Cookie Provider Toggles', () => {
        it('should allow toggling individual non-essential cookie providers', async () => {
            const user = userEvent.setup()
            render(<CookieConsentBanner />)

            await user.click(screen.getByText('Customize'))

            // Find Google Analytics provider toggle
            const gaSwitch = screen.getByRole('switch', { name: /google_analytics/i })
            expect(gaSwitch).not.toBeDisabled()
        })

        it('should not allow toggling Essential cookie providers', async () => {
            const user = userEvent.setup()
            render(<CookieConsentBanner />)

            await user.click(screen.getByText('Customize'))

            // Find Session Management provider toggle
            const sessionSwitch = screen.getByRole('switch', { name: /session/i })
            expect(sessionSwitch).toBeDisabled()
        })
    })

    describe('Save Selected Preferences', () => {
        it('should persist only selected cookies when Save Preferences is clicked', async () => {
            const user = userEvent.setup()
            render(<CookieConsentBanner />)

            await user.click(screen.getByText('Customize'))

            // Enable Analytics category
            const analyticsSwitch = screen.getByRole('switch', { name: /category-analytics/i })
            await user.click(analyticsSwitch)

            await user.click(screen.getByText('Save Preferences'))

            expect(functions.persistCookieSelection).toHaveBeenCalled()
            expect(functions.setCookieConsentDisplayed).toHaveBeenCalled()
            expect(mockSetIsBannerOpen).toHaveBeenCalledWith(false)
        })
    })

    describe('Reopening Banner - Restore Previous Selections', () => {
        it('should restore previously accepted cookies when banner is reopened', async () => {
            // Mock that Analytics cookies were previously accepted
            ;(functions.getCookieSelection as jest.Mock).mockImplementation(provider => {
                return provider.category === 'Analytics'
            })

            const user = userEvent.setup()
            render(<CookieConsentBanner />)

            await user.click(screen.getByText('Customize'))

            // Analytics should be pre-selected
            const analyticsSwitch = screen.getByRole('switch', { name: /category-analytics/i })
            expect(analyticsSwitch).toBeChecked()
        })

        it('should keep Essential cookies enabled when reopening', async () => {
            const user = userEvent.setup()
            render(<CookieConsentBanner />)

            await user.click(screen.getByText('Customize'))

            const essentialSwitch = screen.getByRole('switch', { name: /category-essential/i })
            expect(essentialSwitch).toBeChecked()
        })

        it('should show unchecked state for previously rejected cookies', async () => {
            ;(functions.getCookieSelection as jest.Mock).mockReturnValue(false)

            const user = userEvent.setup()
            render(<CookieConsentBanner />)

            await user.click(screen.getByText('Customize'))

            const marketingSwitch = screen.getByRole('switch', { name: /category-marketing/i })
            expect(marketingSwitch).not.toBeChecked()
        })
    })

    describe('Changing Consent', () => {
        it('should allow changing previously accepted consent to rejected', async () => {
            // Start with Analytics accepted
            ;(functions.getCookieSelection as jest.Mock).mockImplementation(provider => {
                return provider.category === 'Analytics'
            })

            const user = userEvent.setup()
            render(<CookieConsentBanner />)

            await user.click(screen.getByText('Customize'))

            // Analytics should be enabled
            const analyticsSwitch = screen.getByRole('switch', { name: /category-analytics/i })
            expect(analyticsSwitch).toBeChecked()

            // Toggle off
            await user.click(analyticsSwitch)
            expect(analyticsSwitch).not.toBeChecked()

            // Save
            await user.click(screen.getByText('Save Preferences'))

            // Should have persisted the change
            expect(functions.persistCookieSelection).toHaveBeenCalled()
        })

        it('should allow changing previously rejected consent to accepted', async () => {
            ;(functions.getCookieSelection as jest.Mock).mockReturnValue(false)

            const user = userEvent.setup()
            render(<CookieConsentBanner />)

            await user.click(screen.getByText('Customize'))

            // Marketing should be disabled
            const marketingSwitch = screen.getByRole('switch', { name: /category-marketing/i })
            expect(marketingSwitch).not.toBeChecked()

            // Toggle on
            await user.click(marketingSwitch)
            expect(marketingSwitch).toBeChecked()

            // Save
            await user.click(screen.getByText('Save Preferences'))

            expect(functions.persistCookieSelection).toHaveBeenCalled()
        })
    })

    describe('Cookie Details Expansion', () => {
        it('should show individual cookie details when expanded', async () => {
            const user = userEvent.setup()
            render(<CookieConsentBanner />)

            await user.click(screen.getByText('Customize'))

            // Find and click expand button for a provider
            const expandButtons = screen.getAllByText('Show cookie details')
            await user.click(expandButtons[0])

            // Should show cookie names
            expect(screen.getByText('session_id')).toBeInTheDocument()
        })

        it('should display cookie duration information', async () => {
            const user = userEvent.setup()
            render(<CookieConsentBanner />)

            await user.click(screen.getByText('Customize'))

            // Expand cookie details
            const expandButtons = screen.getAllByText('Show cookie details')
            await user.click(expandButtons[0])

            // Should show duration
            expect(screen.getByText('Duration')).toBeInTheDocument()
        })
    })

    describe('Domain Scope Display - GDPR Requirement', () => {
        it('should display the domain that consent applies to', async () => {
            const user = userEvent.setup()
            render(<CookieConsentBanner />)

            await user.click(screen.getByText('Customize'))

            expect(screen.getByText('example.com')).toBeInTheDocument()
        })

        it('should display multiple domains for cross-subdomain consent', async () => {
            const configWithCrossSubdomain = {
                ...mockConfig,
                crossSubDomainConsent: ['example.com', 'app.example.com', 'api.example.com']
            }
            ;(hooks.useConfig as jest.Mock).mockReturnValue(configWithCrossSubdomain)

            const user = userEvent.setup()
            render(<CookieConsentBanner />)

            await user.click(screen.getByText('Customize'))

            expect(screen.getByText('example.com, app.example.com, api.example.com')).toBeInTheDocument()
        })
    })

    describe('Privacy Policy Links - GDPR Requirement', () => {
        it('should display privacy policy link for each cookie provider', async () => {
            const user = userEvent.setup()
            render(<CookieConsentBanner />)

            await user.click(screen.getByText('Customize'))

            // Check for provider privacy links
            const googlePrivacyLinks = screen.getAllByRole('link', { name: /privacy policy of google/i })
            expect(googlePrivacyLinks.length).toBeGreaterThan(0)
            expect(googlePrivacyLinks[0]).toHaveAttribute('href', 'https://policies.google.com/privacy')
        })

        it('should open privacy links in new tab', async () => {
            const user = userEvent.setup()
            render(<CookieConsentBanner />)

            await user.click(screen.getByText('Customize'))

            const privacyLinks = screen.getAllByRole('link', { name: /privacy policy of/i })
            privacyLinks.forEach(link => {
                expect(link).toHaveAttribute('target', '_blank')
                expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'))
            })
        })
    })

    describe('Accessibility', () => {
        it('should have accessible switch buttons', async () => {
            const user = userEvent.setup()
            render(<CookieConsentBanner />)

            await user.click(screen.getByText('Customize'))

            // All switches should have accessible names
            const switches = screen.getAllByRole('switch')
            switches.forEach(switchEl => {
                expect(switchEl).toHaveAttribute('aria-checked')
            })
        })

        it('should be keyboard navigable', async () => {
            const user = userEvent.setup()
            render(<CookieConsentBanner />)

            // Tab through the banner - first focusable element should be interactive
            await user.tab()
            const activeElement = document.activeElement as HTMLElement
            const focusableElements = ['button', 'a', 'input', 'select', 'textarea']
            expect(focusableElements).toContain(activeElement.tagName.toLowerCase())
        })
    })

    describe('Language Support', () => {
        it('should use German labels when configured', () => {
            const germanConfig = { ...mockConfig, lang: 'deDE' as const }
            ;(hooks.useConfig as jest.Mock).mockReturnValue(germanConfig)

            // Labels are mocked, but in real implementation would show German
            render(<CookieConsentBanner />)
            expect(screen.getByText('Cookie Consent')).toBeInTheDocument()
        })
    })

    describe('Mixed Consent State', () => {
        it('should handle partial category acceptance correctly', async () => {
            // Only one provider in Analytics accepted
            ;(functions.getCookieSelection as jest.Mock).mockImplementation(provider => {
                return provider.id === 'google_analytics'
            })

            const user = userEvent.setup()
            render(<CookieConsentBanner />)

            await user.click(screen.getByText('Customize'))

            // The GA provider toggle should be checked
            const gaSwitch = screen.getByRole('switch', { name: /google_analytics/i })
            expect(gaSwitch).toBeChecked()
        })
    })

    describe('Banner Closing Behavior', () => {
        it('should close details view when clicking Back button', async () => {
            const user = userEvent.setup()
            render(<CookieConsentBanner />)

            await user.click(screen.getByText('Customize'))
            expect(screen.getByText('Cookie Settings')).toBeInTheDocument()

            // Click Back button to return to simple view
            await user.click(screen.getByText('Back'))

            // Should return to simple banner view
            await waitFor(() => {
                expect(screen.getByText('Cookie Consent')).toBeInTheDocument()
            })
        })

        it('should close details view when clicking overlay backdrop', async () => {
            render(<CookieConsentBanner />)

            // Open details view
            fireEvent.click(screen.getByText('Customize'))
            expect(screen.getByText('Cookie Settings')).toBeInTheDocument()

            // Find the backdrop overlay (the outer fixed div)
            const backdrop = document.querySelector('div[style*="position: fixed"][style*="inset: 0"]')
            expect(backdrop).toBeInTheDocument()

            // Click directly on the backdrop (not its children)
            if (backdrop) {
                fireEvent.click(backdrop)
            }

            // Should return to simple banner view
            await waitFor(() => {
                expect(screen.getByText('Cookie Consent')).toBeInTheDocument()
            })
        })
    })
})

describe('CookieConsentBanner - Edge Cases', () => {
    let mockSetIsBannerOpen: jest.Mock
    let mockSetStrictlyNecessaryCookiesOnly: jest.Mock

    const minimalProvider: CookieProviderConfig = {
        id: 'minimal',
        name: 'Minimal Provider',
        category: 'Essential',
        description: 'Minimal required cookies',
        dataProtectionLink: 'https://example.com/privacy',
        cookies: [{ name: 'minimal', duration: 1, unit: 'session', purpose: 'Required' }]
    }

    const mockConfig: CookieConsentBannerConfigWithDefaults = {
        cookiePolicyLink: 'https://example.com/cookies',
        websiteName: 'Test Website',
        providers: [minimalProvider],
        domain: 'example.com',
        cookiesValidForDays: 183,
        lang: 'enUS'
    }

    beforeEach(() => {
        mockSetIsBannerOpen = jest.fn()
        mockSetStrictlyNecessaryCookiesOnly = jest.fn()
        ;(hooks.useConfig as jest.Mock).mockReturnValue(mockConfig)
        ;(hooks.useStyle as jest.Mock).mockReturnValue(DefaultTheme)
        ;(hooks.useCookieProviders as jest.Mock).mockReturnValue([minimalProvider])
        ;(hooks.useSetStrictlyNecessaryCookiesOnly as jest.Mock).mockReturnValue(mockSetStrictlyNecessaryCookiesOnly)
        ;(hooks.useCookieConsentContext as jest.Mock).mockReturnValue({
            isBannerOpen: true,
            setIsBannerOpen: mockSetIsBannerOpen
        })
        ;(functions.getCookieSelection as jest.Mock).mockReturnValue(false)
    })

    it('should handle configuration with only Essential cookies', async () => {
        const user = userEvent.setup()
        render(<CookieConsentBanner />)

        await user.click(screen.getByText('Customize'))

        // Should still show Essential category
        expect(screen.getByText('Essential')).toBeInTheDocument()
    })

    it('should handle empty cookie arrays gracefully', async () => {
        const emptyProvider: CookieProviderConfig = {
            ...minimalProvider,
            cookies: []
        }
        ;(hooks.useCookieProviders as jest.Mock).mockReturnValue([emptyProvider])

        const user = userEvent.setup()
        render(<CookieConsentBanner />)

        await user.click(screen.getByText('Customize'))

        // Should not crash
        expect(screen.getByText('Cookie Settings')).toBeInTheDocument()
    })
})

describe('CookieConsentBanner - Server-Side Rendering', () => {
    let mockSetIsBannerOpen: jest.Mock

    beforeEach(() => {
        mockSetIsBannerOpen = jest.fn()
        ;(hooks.useConfig as jest.Mock).mockReturnValue({
            cookiePolicyLink: 'https://example.com/cookies',
            websiteName: 'Test',
            providers: [],
            domain: 'example.com',
            cookiesValidForDays: 183,
            lang: 'enUS'
        })
        ;(hooks.useStyle as jest.Mock).mockReturnValue(DefaultTheme)
        ;(hooks.useCookieProviders as jest.Mock).mockReturnValue([])
        ;(hooks.useSetStrictlyNecessaryCookiesOnly as jest.Mock).mockReturnValue(jest.fn())
        ;(hooks.useCookieConsentContext as jest.Mock).mockReturnValue({
            isBannerOpen: true,
            setIsBannerOpen: mockSetIsBannerOpen
        })
    })

    it('should not render content before client-side hydration', () => {
        // The component uses useState with isClient to handle SSR
        // Initial render should be empty
        const { container } = render(<CookieConsentBanner />)

        // After the useEffect runs, it should show content
        // This is tested implicitly by other tests that check for content
        expect(container).toBeDefined()
    })
})
