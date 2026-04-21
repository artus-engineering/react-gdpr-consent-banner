import type { Meta, StoryObj } from '@storybook/react'
import { withConsentProvider } from '../../../.storybook/decorators'
import { analyticsProvider } from '../../test-utils/fixtures'
import { CookieConsentModal } from './ConsentModal'

const Placeholder = () => (
    <div
        style={{
            width: '320px',
            height: '180px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px',
            border: '1px dashed #94a3b8',
            color: '#475569',
            fontFamily: 'system-ui, sans-serif',
            fontSize: '14px'
        }}
    >
        Gated analytics content
    </div>
)

const meta: Meta<typeof CookieConsentModal> = {
    title: 'Consent/ConsentModal',
    component: CookieConsentModal,
    id: 'consent-consentmodal',
    decorators: [withConsentProvider],
    parameters: {
        layout: 'centered',
        consent: { includeCookieBanner: false, markBannerDismissed: true }
    },
    args: {
        cookieProvider: analyticsProvider,
        children: <Placeholder />
    }
}

export default meta

type Story = StoryObj<typeof CookieConsentModal>

export const Closed: Story = {}

export const Open: Story = {
    play: async ({ canvasElement }) => {
        const root = canvasElement.ownerDocument ?? document
        const trigger = root.querySelector<HTMLButtonElement>('button.opacity-50')
        trigger?.click()
    }
}
