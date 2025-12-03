import { Meta, StoryFn } from '@storybook/react'
import { CookieProvider } from '../..'
import { CookieConsentBannerConfig, SupportedLanguage } from '../../types'
import { CookieConsentProvider } from '../consent'
import { CookiePolicy } from './CookiePolicy'

export default {
    title: 'CookiePolicy',
    component: CookiePolicy,
    id: 'CookiePolicy'
} as Meta

const WebsiteCookieProvider: CookieProvider = {
    name: 'Some Website',
    id: 'website',
    category: 'Essential',
    description:
        'We use session cookies to store your session on our website. This cookie is necessary to use the website.',
    dataProtectionLink: 'https://example.com/privacy',
    cookies: [
        {
            name: 'app_session',
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

const TrackingCookieProvider: CookieProvider = {
    name: 'Some Tracking Service',
    id: 'tracking',
    category: 'Analytics',
    description:
        'We use Some Tracking Service to collect anonymous statistics about the use of our website. This helps us to improve the website.',
    dataProtectionLink: 'https://example.com/privacy',
    cookies: [
        {
            name: '_pk_id',
            duration: 7,
            unit: 'days',
            purpose: 'Identifies returning visitors'
        },
        {
            name: '_pk_ses',
            duration: 7,
            unit: 'days',
            purpose: 'Stores the session of a visitor'
        }
    ]
}

const config: CookieConsentBannerConfig = {
    lang: 'deDE' as SupportedLanguage,
    websiteName: 'React Cookie Consent Banner Demo',
    cookiePolicyLink: '/datenschutzerklaerung#cookie-richtlinie',
    domain: 'localhost',
    providers: [WebsiteCookieProvider, TrackingCookieProvider]
}

const Template: StoryFn<typeof CookiePolicy> = () => (
    <CookieConsentProvider config={config}>
        <CookiePolicy />
    </CookieConsentProvider>
)

export const Default: typeof Template = Template.bind({})
