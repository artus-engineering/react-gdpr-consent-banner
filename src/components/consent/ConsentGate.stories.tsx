import type { Meta, StoryObj } from '@storybook/react'
import { withConsentProvider } from '../../../.storybook/decorators'
import { analyticsProvider } from '../../test-utils/fixtures'
import { CookieConsentGate } from './ConsentGate'

const AllowedContent = () => (
    <div
        style={{
            width: '100%',
            maxWidth: '720px',
            padding: '24px',
            borderRadius: '8px',
            border: '1px solid #0ea5e9',
            backgroundColor: '#f0f9ff',
            color: '#0c4a6e',
            fontFamily: 'system-ui, sans-serif'
        }}
    >
        <strong>Analytics widget</strong>
        <p style={{ margin: '8px 0 0 0' }}>Consent has been granted, so the gated content renders directly.</p>
    </div>
)

const meta: Meta<typeof CookieConsentGate> = {
    title: 'Consent/ConsentGate',
    component: CookieConsentGate,
    id: 'consent-consentgate',
    decorators: [withConsentProvider],
    parameters: {
        layout: 'padded',
        consent: { includeCookieBanner: false, markBannerDismissed: true }
    },
    args: {
        cookieProvider: analyticsProvider,
        children: <AllowedContent />
    }
}

export default meta

type Story = StoryObj<typeof CookieConsentGate>

export const Blocked: Story = {}

export const Allowed: Story = {
    parameters: {
        consent: {
            includeCookieBanner: false,
            preSetDecisions: {
                [analyticsProvider.id]: true
            }
        }
    }
}
